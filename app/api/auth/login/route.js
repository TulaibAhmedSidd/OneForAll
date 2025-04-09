import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDB from '@/app/lib/db';
import User from '@/app/models/User';
import { signToken } from '@/app/lib/jwt';

export async function POST(req) {
  await connectToDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ id: user._id, isAdmin: user.isAdmin });

  const res = NextResponse.json({ message: 'Login successful',token:token, user:user });
  res.cookies.set('token', token, { httpOnly: true, secure: true, path: '/', maxAge: 7 * 24 * 60 * 60 });

  return res;
}
