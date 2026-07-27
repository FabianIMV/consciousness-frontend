import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { CONTACT_EMAIL, SITE_NAME, localePath, type Locale } from '@/lib/site';

const SECTIONS: Array<{ key: 'research' | 'papers' | 'about' | 'contact'; path: string }> = [
  { key: 'research', path: '/' },
  { key: 'papers', path: '/papers' },
  { key: 'about', path: '/about' },
];

export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__name">{SITE_NAME}</p>
            <p className="site-footer__text">{t.footer.description}</p>
          </div>

          <div>
            <h2 className="site-footer__heading">{t.footer.sections}</h2>
            <ul className="site-footer__list">
              {SECTIONS.map(({ key, path }) => (
                <li key={key}>
                  <Link href={localePath(locale, path)}>{t.nav[key]}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="site-footer__heading">{t.footer.contactHeading}</h2>
            <ul className="site-footer__list">
              <li>
                <Link href={localePath(locale, '/contact')}>{t.nav.contact}</Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="site-footer__legal">
          © {new Date().getFullYear()} {SITE_NAME}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
