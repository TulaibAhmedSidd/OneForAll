// app/api/game/create/route.js
import { NextResponse } from 'next/server';
import Game from '@/app/models/Game';
import { verifyToken } from '@/app/lib/jwt';  // You will need to create the `verifyToken` function
import connectToDB from '@/app/lib/db';

export async function POST(req) {
  try {
    await connectToDB();

    // Extract token from Authorization header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and extract user data
    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Extract game data from request
    const { gameType, requiredUsers, startTime, endTime, prizeAmount } = await req.json();

    // Validate input data
    if (!gameType || !requiredUsers || !startTime || !endTime || !prizeAmount) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Create the game
    const newGame = new Game({
      adminId: userData.id, // Use the extracted user ID from the token
      gameType,
      requiredUsers,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      prizeAmount,
    });

    await newGame.save();

    return NextResponse.json({ message: 'Game created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
