import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { CONTACT_EMAIL, SITE_NAME, localePath, type Locale } from '@/lib/site';

const SECTIONS: Array<{ key: 'research' | 'papers' | 'about' | 'contact'; path: string }> = [
  { key: 'research', path: '/' },
  { key: 'papers', path: '/papers' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

/** A colophon: name, one line on what this is, the sections, and an address. */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__inner">
          <div>
            <p className="site-footer__name">{SITE_NAME}</p>
            <p className="site-footer__text">{t.footer.description}</p>
          </div>

          <nav aria-label={t.footer.navLabel}>
            <ul className="site-footer__list">
              {SECTIONS.map(({ key, path }) => (
                <li key={key}>
                  <Link href={localePath(locale, path)}>{t.nav[key]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="site-footer__legal mono">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. {t.footer.rights}
          </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </footer>
  );
}
