'use client';

import { useState } from 'react';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const [lang, setLang] = useState(currentLang || 'en');
  const [isTranslating, setIsTranslating] = useState(false);

  const { useRouter, usePathname } = require('next/navigation');
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'es' : 'en';

    // Construct new path safely
    const segments = pathname.split('/');
    // segments[0] is usually empty (from starting /)
    // segments[1] should be the current locale (en or es)
    if (segments[1] === 'en' || segments[1] === 'es') {
      segments[1] = newLang;
    } else {
      // If no locale in path, insert it
      segments.splice(1, 0, newLang);
    }

    const newPath = segments.join('/') || '/';
    router.push(newPath);
    setLang(newLang);
  };

  return (
    <div className="language-switcher-container">
      <button
        onClick={toggleLanguage}
        disabled={isTranslating}
        className={`btn-translate glow-on-hover ${isTranslating ? 'loading' : ''}`}
        aria-label={lang === 'en' ? 'Leer en Español' : 'Switch to English'}
      >
        <span className="lang-text">
          {isTranslating ? '✨ Traduciendo...' : (lang === 'en' ? '🇪🇸 Léeme en Español' : '🇬🇧 Back to English')}
        </span>
      </button>

      <style jsx>{`
        .language-switcher-container {
          position: fixed;
          bottom: var(--spacing-6);
          right: var(--spacing-6);
          z-index: 9999;
        }

        .btn-translate {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-purple);
          border-radius: 30px;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(101, 40, 247, 0.15);
        }

        .btn-translate.loading {
          opacity: 0.8;
          cursor: wait;
          background: rgba(255, 255, 255, 0.5);
        }

        .btn-translate:hover:not(.loading) {
          transform: translateY(-4px) scale(1.02);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 25px rgba(101, 40, 247, 0.25);
          border-color: var(--primary-purple);
        }

        .lang-text {
          display: inline-block;
        }

        @media (max-width: 768px) {
          .language-switcher-container {
            bottom: var(--spacing-4);
            right: var(--spacing-4);
          }
          
          .btn-translate {
            padding: 8px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
