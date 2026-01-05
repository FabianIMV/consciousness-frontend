'use client';

import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        // Check if google is already loaded
        if (window.google && window.google.translate) {
            initTranslate();
        } else {
            window.googleTranslateElementInit = initTranslate;
        }

        function initTranslate() {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'es,en',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
            }, 'google_translate_element');
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'es' : 'en';
        setLang(newLang);

        // Find the google translate select element
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (combo) {
            combo.value = newLang;
            combo.dispatchEvent(new Event('change'));
        }
    };

    return (
        <div className="language-switcher-container">
            {/* Hidden google translate element */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            <button
                onClick={toggleLanguage}
                className="btn-translate glow-on-hover"
                aria-label={lang === 'en' ? 'Leer en Español' : 'Switch to English'}
            >
                <span className="lang-text">
                    {lang === 'en' ? '🇪🇸 Léeme en Español' : '🇬🇧 Back to English'}
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

        .btn-translate:hover {
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

            <style jsx global>{`
        /* Hide Google Translate Banner and Attribution */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-gadget-icon,
        .goog-te-gadget-simple img,
        .goog-te-menu-value span:nth-child(2),
        .goog-te-menu-value span:nth-child(3),
        .goog-te-menu-value span:nth-child(5),
        .goog-te-menu-value img {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }

        .goog-te-gadget {
          font-family: inherit !important;
          color: transparent !important;
        }

        .goog-te-gadget .goog-te-combo {
          display: none !important;
        }

        iframe.goog-te-banner-frame {
          display: none !important;
        }
      `}</style>
        </div>
    );
}

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}
