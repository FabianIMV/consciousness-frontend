'use client';

import { useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleLanguage = async () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    setIsTranslating(true);

    try {
      // Find main content areas to translate
      // We focus on the most important parts to avoid hitting token limits or slowing down
      const selectors = ['article', 'h1', 'h2', 'h3', '.article-content', '.nav-desktop', '.nav-mobile'];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of Array.from(elements)) {
          // Skip if it's already translated or has a no-translate class
          if (el.classList.contains('no-translate')) continue;

          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: el.innerHTML,
              targetLang: newLang
            }),
          });

          if (response.ok) {
            const data = await response.json();
            el.innerHTML = data.translatedText;
          }
        }
      }

      setLang(newLang);
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
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
