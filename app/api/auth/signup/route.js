import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDB from '@/app/lib/db';
import User from '@/app/models/User';

export async function POST(req) {
  await connectToDB();

  const { username, email, password, referralCode } = await req.json();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
  }

  // Generate a referral code for the new user
  const newUserReferralCode = new User().generateReferralCode();

  // Find the user who referred this user using the referralCode
  let referredByUser = null;
  if (referralCode) {
    referredByUser = await User.findOne({ referralCode });
    if (!referredByUser) {
      return new Response(JSON.stringify({ message: 'Invalid referral code' }), { status: 400 });
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create new user object
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    referralCode: newUserReferralCode,
    referredBy: referredByUser ? referredByUser.referralCode : null,
  });

  try {
    await newUser.save();
    return new Response(JSON.stringify({ message: 'User registered successfully', referralCode: newUserReferralCode }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Registration failed', error }), { status: 500 });
  }
}
