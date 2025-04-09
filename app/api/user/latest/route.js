// app/api/user/latest/route.js
import { NextResponse } from 'next/server';
import connectToDB from '@/app/lib/db';
import User from '@/app/models/User';
import { verifyToken } from '@/app/lib/jwt';

export async function GET(req) {
  try {
    await connectToDB();

    const token = req.headers.get('authorization')?.split(' ')[1]; // Get the token from the header
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token); // Verify token and decode user id
    const user = await User.findById(decoded.id); // Fetch user from database

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send back the latest data for the user
    return NextResponse.json({
      username: user.username,
      email: user.email,
      walletBalance: user.walletBalance,
      gamesPlayed: user.gamesPlayed,
      prizesWon: user.prizesWon,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
