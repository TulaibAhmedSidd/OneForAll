import bcrypt from 'bcryptjs';
import connectToDB from '@/lib/db';
import User from '@/models/User';
import { handler, json, readJson, clientIp, HttpError } from '@/lib/http';
import { loginSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { setSessionCookie, adminEmails, publicUser } from '@/lib/auth';

// Same hash cost as a real check, so a missing account takes as long as a wrong password.
const DUMMY_HASH = '$2b$12$m9glEsAiPERKbQJPzb52Buq5sjQu4X.fJPw4YZmk09bgwPMlHlz8W';

export const POST = handler(async (req) => {
  await connectToDB();
  const data = loginSchema.parse(await readJson(req));
  await rateLimit(`login:${clientIp(req)}`, 20, 600);
  await rateLimit(`login:${data.email}`, 8, 600, 'Too many wrong attempts on this account. Wait 10 minutes.');

  const user = await User.findOne({ email: data.email }).select('+password');
  const ok = await bcrypt.compare(data.password, user?.password || DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Email or password is wrong.');
  if (user.isBlocked) throw new HttpError(403, 'This account is blocked. Contact support.');

  if (!user.isAdmin && adminEmails().includes(user.email)) {
    user.isAdmin = true;
    await user.save();
  }

  const res = json({ user: publicUser(user) });
  setSessionCookie(res, user);
  return res;
});
