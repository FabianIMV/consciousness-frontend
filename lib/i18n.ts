import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Basic in-memory cache for translations to avoid redundant API calls
// In production, this could be Redis or similar
const translationCache: Record<string, string> = {};

export async function translateContent(html: string, targetLang: string): Promise<string> {
    if (!html || targetLang === 'en') return html;

    const cacheKey = `${targetLang}:${html.substring(0, 100)}:${html.length}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is missing from environment variables.');
            return html;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
      Translate the following HTML content accurately from English to ${targetLang === 'es' ? 'Spanish' : 'English'}.
      
      CRITICAL RULES:
      1. MAINTAIN ALL HTML TAGS, ATTRIBUTES, and STRUCTURE.
      2. ONLY translate the visible text content.
      3. DO NOT translate technical terms, product names, or code if present.
      4. Ensure the tone is scientific, professional, and sophisticated.
      5. Return ONLY the translated HTML, no explanations.

      CONTENT:
      ${html}
    `;

        console.log(`[i18n] Translating content to ${targetLang}... (Length: ${html.length})`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedHtml = response.text();

        console.log(`[i18n] Translation success! (Translated length: ${translatedHtml.length})`);

        // Store in cache
        translationCache[cacheKey] = translatedHtml;

        return translatedHtml;
    } catch (error) {
        console.error(`[i18n] Server-side translation error for ${targetLang}:`, error);
        return html; // Fallback to original content on error
    }
}
