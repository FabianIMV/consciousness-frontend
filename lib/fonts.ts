import { IBM_Plex_Mono, Newsreader } from 'next/font/google';

/**
 * Typefaces, downloaded at build time and served from this site, so a reader's
 * browser never contacts Google. `styles/tokens.css` reads the two variables.
 */
const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

/** Class names for `<html>` that define both font variables. */
export const fontVariables = `${newsreader.variable} ${plexMono.variable}`;
