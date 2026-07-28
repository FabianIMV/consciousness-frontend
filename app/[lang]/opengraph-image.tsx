import { ImageResponse } from 'next/og';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LOCALE, SITE_NAME, isLocale } from '@/lib/site';

/**
 * Social preview card. The previous metadata pointed at `/og-image.jpg`, which
 * was never added to `public/`, so every share rendered without an image.
 */
export const alt = `${SITE_NAME} — independent research on consciousness`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '72px',
          borderTop: '16px solid #263f73',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#767d88',
            }}
          >
            {t.home.eyebrow}
          </div>

          <div
            style={{
              marginTop: 32,
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 700,
              color: '#14161a',
              maxWidth: 940,
            }}
          >
            {t.home.title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #e3e3df',
            paddingTop: 32,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, color: '#14161a' }}>{SITE_NAME}</div>
          <div style={{ fontSize: 26, color: '#767d88' }}>consciousnessnetworks.com</div>
        </div>
      </div>
    ),
    size
  );
}
