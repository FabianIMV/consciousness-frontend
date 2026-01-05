import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if the pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // 2. Skip internal Next.js paths, api routes, and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return;
    }

    // 3. Redirect if there is no locale
    // We keep the original path but prefix it with the default locale
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Match all paths except internal and static files
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
