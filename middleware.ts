import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultLocale = 'en';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip internal Next.js paths, api routes, and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return;
    }

    // If path starts with /en, redirect to the same path without /en
    if (pathname.startsWith('/en/')) {
        const newPath = pathname.replace('/en', '') || '/';
        request.nextUrl.pathname = newPath;
        return NextResponse.redirect(request.nextUrl);
    }
    if (pathname === '/en') {
        request.nextUrl.pathname = '/';
        return NextResponse.redirect(request.nextUrl);
    }

    // /es paths are handled by the [lang] directory - let them through
    if (pathname.startsWith('/es/') || pathname === '/es') {
        return;
    }

    // All other paths are English (default) - rewrite internally to /en/...
    request.nextUrl.pathname = `/en${pathname}`;
    return NextResponse.rewrite(request.nextUrl);
}

export const config = {
    matcher: [
        // Match all paths except internal and static files
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
