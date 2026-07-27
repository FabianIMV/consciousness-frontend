/**
 * Machine translation for editorial content coming from WordPress.
 *
 * Interface copy lives in `lib/dictionaries.ts` and is never sent here — this
 * module only handles article and page bodies, which are authored in English in
 * WordPress and have no hand-written Spanish counterpart. If the model is not
 * configured or the call fails, the original English body is returned so the
 * page still renders.
 */

import { createHash } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_LOCALE, type Locale } from '@/lib/site';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const TIMEOUT_MS = Number(process.env.TRANSLATION_TIMEOUT_MS || 20_000);

/** Bodies above this size are left untranslated rather than risking a truncated response. */
const MAX_INPUT_CHARS = 60_000;

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
};

/**
 * Process-local cache. Pages are revalidated on a timer, so this only has to
 * survive between renders within one server instance; it keeps a burst of
 * requests for the same article from issuing one model call each.
 */
const cache = new Map<string, string>();
const CACHE_LIMIT = 200;

function cacheKey(html: string, locale: Locale): string {
  return `${locale}:${createHash('sha1').update(html).digest('hex')}`;
}

function remember(key: string, value: string): void {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

/** Models occasionally wrap output in a markdown fence; unwrap it. */
function unwrapCodeFence(text: string): string {
  const fenced = text.match(/^\s*```(?:html)?\s*\n([\s\S]*?)\n?\s*```\s*$/i);
  return fenced ? fenced[1] : text;
}

export async function translateContent(html: string, locale: Locale | string): Promise<string> {
  if (!html) return html;
  if (locale === DEFAULT_LOCALE || !(locale in LANGUAGE_NAMES)) return html;
  if (html.length > MAX_INPUT_CHARS) return html;

  const target = locale as Locale;
  const key = cacheKey(html, target);
  const hit = cache.get(key);
  if (hit) return hit;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return html;

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });

    const prompt = [
      `Translate the HTML below from English into ${LANGUAGE_NAMES[target]}.`,
      '',
      'Rules:',
      '- Preserve every tag, attribute, and the document structure exactly.',
      '- Translate visible text only. Leave URLs, code, and proper nouns untouched.',
      '- Keep scientific terminology precise; match the register of an academic review.',
      '- Return only the translated HTML, with no commentary and no code fence.',
      '',
      'HTML:',
      html,
    ].join('\n');

    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { timeout: TIMEOUT_MS }
    );

    const translated = unwrapCodeFence(result.response.text()).trim();

    // A response far shorter than the input means the model summarised or
    // refused; serving the English original is better than serving a fragment.
    if (!translated || translated.length < html.length * 0.4) return html;

    remember(key, translated);
    return translated;
  } catch (error) {
    console.error(`[i18n] translation to ${target} failed:`, error);
    return html;
  }
}
