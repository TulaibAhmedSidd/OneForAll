import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDB from '@/lib/db';
import User from '@/models/User';
import { handler, json, readJson, clientIp, HttpError } from '@/lib/http';
import { registerSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { setSessionCookie, adminEmails, publicUser } from '@/lib/auth';

export const POST = handler(async (req) => {
  await connectToDB();
  await rateLimit(`register:${clientIp(req)}`, 5, 600, 'Too many sign-ups from this network. Try again later.');
  const data = registerSchema.parse(await readJson(req));

  if (await User.exists({ email: data.email })) throw new HttpError(409, 'An account with this email already exists. Log in instead.');

  let referredBy = null;
  if (data.referralCode) {
    const ref = await User.findOne({ referralCode: data.referralCode }).select('referralCode').lean();
    if (!ref) throw new HttpError(400, 'That referral code does not exist.');
    referredBy = ref.referralCode;
  }

  const user = await User.create({
    username: data.username,
    email: data.email,
    phone: data.phone || null,
    password: await bcrypt.hash(data.password, 12),
    referralCode: `OFA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    referredBy,
    isAdmin: adminEmails().includes(data.email),
  });

  const res = json({ user: publicUser(user) }, { status: 201 });
  setSessionCookie(res, user);
  return res;
});
