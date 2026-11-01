import { NextResponse } from 'next/server';

// Passes the current path to server layouts so a logged-out visitor can be sent back
// to the page they wanted after logging in. Auth itself is checked on the server.
export function middleware(req) {
  const headers = new Headers(req.headers);
  headers.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/play/:path*', '/tickets/:path*', '/wallet/:path*', '/account/:path*', '/admin/:path*'],
};
