// app/api/game/create/route.js
import { NextResponse } from 'next/server';
import Game from '@/app/models/Game';
import { verifyToken } from '@/app/lib/jwt';
import connectToDB from '@/app/lib/db';

export async function POST(req) {
  try {
    await connectToDB();

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { gameName, gameAmount, requiredUsers, startTime, endTime, prizeList } = await req.json();

    if (!gameName || !gameAmount || !requiredUsers || !startTime || !endTime || !prizeList?.length) {
      return NextResponse.json({ error: 'All fields are required including prize list' }, { status: 400 });
    }
    
    const formattedPrizes = prizeList.map(p => ({
      prize: p.prizeId,
      quantity: p.quantity
    }));
    
    const newGame = new Game({
      adminId: userData.id,
      gameName,
      gameAmount,
      requiredUsers,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      gamePrize: formattedPrizes
    });
    
    await newGame.save();

    return NextResponse.json({ message: 'Game created successfully', game: newGame }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
