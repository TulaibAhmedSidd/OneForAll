// middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/game/:path*'], // protect routes
};
