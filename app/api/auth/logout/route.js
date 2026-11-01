import { handler, json } from '@/lib/http';
import { clearSessionCookie } from '@/lib/auth';

export const POST = handler(async () => {
  const res = json({ ok: true });
  clearSessionCookie(res);
  return res;
});
