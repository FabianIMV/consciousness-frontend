'use client';

import { useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleLanguage = async () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    setIsTranslating(true);

    try {
      // Find all key content sectors
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const footer = document.querySelector('footer');
      const asides = document.querySelectorAll('aside');

      if (!main && !header) {
        throw new Error('No content found to translate');
      }

      // Combine contents to translate in one go with clear boundary IDs
      let contentToTranslate = '';
      if (header) contentToTranslate += `<header-tr>${header.innerHTML}</header-tr>`;
      if (main) contentToTranslate += `<main-tr>${main.innerHTML}</main-tr>`;
      if (footer) contentToTranslate += `<footer-tr>${footer.innerHTML}</footer-tr>`;
      asides.forEach((aside, i) => {
        contentToTranslate += `<aside-tr-${i}>${aside.innerHTML}</aside-tr-${i}>`;
      });

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentToTranslate,
          targetLang: newLang
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Server error');
      }

      const data = await response.json();

      // Update DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.translatedText, 'text/html');

      if (header) {
        const tr = doc.querySelector('header-tr');
        if (tr) header.innerHTML = tr.innerHTML;
      }
      if (main) {
        const tr = doc.querySelector('main-tr');
        if (tr) main.innerHTML = tr.innerHTML;
      }
      if (footer) {
        const tr = doc.querySelector('footer-tr');
        if (tr) footer.innerHTML = tr.innerHTML;
      }
      asides.forEach((aside, i) => {
        const tr = doc.querySelector(`aside-tr-${i}`);
        if (tr) aside.innerHTML = tr.innerHTML;
      });

      setLang(newLang);
    } catch (error: any) {
      console.error('Translation failed:', error);
      alert(`Error: ${error.message}. Verifica que tu API Key sea válida.`);
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
