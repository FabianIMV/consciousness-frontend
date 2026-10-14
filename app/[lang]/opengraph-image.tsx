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
          background: '#fbfaf7',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <g fill="none" stroke="#1b1a17" strokeWidth="1.3">
              <circle cx="16" cy="16" r="13.2" />
              <path d="M16 7.6 10.2 13.4 12.8 22.4h6.4l2.6-9z" />
              <path d="M10.2 13.4h11.6M16 7.6v14.8" />
            </g>
            <g fill="#a3301c">
              <circle cx="16" cy="7.6" r="1.9" />
              <circle cx="10.2" cy="13.4" r="1.9" />
              <circle cx="21.8" cy="13.4" r="1.9" />
              <circle cx="12.8" cy="22.4" r="1.9" />
              <circle cx="19.2" cy="22.4" r="1.9" />
            </g>
          </svg>
          <div style={{ fontSize: 34, color: '#1b1a17' }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              color: '#1b1a17',
              maxWidth: 900,
            }}
          >
            {t.home.title}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 48,
              paddingTop: 24,
              borderTop: '2px solid #1b1a17',
              fontSize: 26,
              color: '#635f56',
            }}
          >
            <div>{t.footer.description}</div>
            <div style={{ color: '#a3301c' }}>consciousnessnetworks.com</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
