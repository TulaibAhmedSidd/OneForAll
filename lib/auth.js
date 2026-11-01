import { cache } from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDB from './db';
import User from '@/models/User';
import { HttpError } from './http';

export const COOKIE = 'ofa_session';
const MAX_AGE = 7 * 24 * 60 * 60;

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET must be set (16+ characters)');
  return s;
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function setSessionCookie(res, user) {
  const token = jwt.sign({ sub: String(user._id), v: user.tokenVersion || 0 }, secret(), {
    expiresIn: MAX_AGE,
  });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// Returns the signed-in user (lean object) or null. Cached per request.
export const getSessionUser = cache(async () => {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    return null;
  }
  await connectToDB();
  const user = await User.findById(payload.sub).lean();
  if (!user || user.isBlocked || (user.tokenVersion || 0) !== payload.v) return null;
  return user;
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, 'Please log in first.');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new HttpError(403, 'Admins only.');
  return user;
}

// Safe fields to send to the browser.
export function publicUser(u) {
  if (!u) return null;
  return {
    id: String(u._id),
    username: u.username,
    email: u.email,
    phone: u.phone || '',
    walletBalance: u.walletBalance || 0,
    referralCode: u.referralCode,
    isAdmin: !!u.isAdmin,
    gamesPlayed: u.gamesPlayed || 0,
    prizesWon: u.prizesWon || 0,
  };
}
