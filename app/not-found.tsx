import './globals.css';
import NotFoundContent from '@/components/NotFoundContent';
import { fontVariables } from '@/lib/fonts';
import { DEFAULT_LOCALE, HTML_LOCALE } from '@/lib/site';

/**
 * Root-level 404. The locale layout owns `<html>` for normal routes, but this
 * boundary renders outside it, so it provides the document shell itself.
 */
export default function NotFound() {
  return (
    <html lang={HTML_LOCALE[DEFAULT_LOCALE]} className={fontVariables}>
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
