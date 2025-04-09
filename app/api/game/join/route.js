// app/api/game/join/route.js
import { NextResponse } from 'next/server';
import connectToDB from '@/app/lib/db';
import Game from '@/app/models/Game';
import User from '@/app/models/User';
import { verifyToken } from '@/app/lib/jwt';

export async function POST(req) {
  try {
    await connectToDB();

    const { gameId } = await req.json();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await User.findById(userData.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough balance
    if (user.walletBalance < 1) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Find the game by ID
    const game = await Game.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if the game is active and has space for more participants
    if (game.status !== 'active') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    if (game.participants.length >= game.requiredUsers) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Add the user to the game participants
    game.participants.push(user._id);
    await game.save();

    // Deduct the balance from the user
    user.walletBalance -= 1;
    await user.save();

    return NextResponse.json({ message: 'Successfully joined the game' }, { status: 200 });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
