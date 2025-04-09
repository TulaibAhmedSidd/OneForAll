import { NextResponse } from 'next/server';
import connectToDB from '../../../lib/db';
import Game from '../../../models/Game';
// import { verifyToken } from '@/app/lib/jwt';
import { verifyToken } from '../../../lib/jwt';

export async function GET(req) {
  try {
    await connectToDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    const games = await Game.find({ adminId: decoded.id }).populate('participants');

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching created games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
