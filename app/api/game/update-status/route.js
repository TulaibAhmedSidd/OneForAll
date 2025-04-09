import { NextResponse } from 'next/server';
import connectToDB from '@/app/lib/db';
import Game from '@/app/models/Game';
import { verifyToken } from '@/app/lib/jwt';

export async function PATCH(req, { params }) {
  try {
    await connectToDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!['completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ message: 'Game not found' }, { status: 404 });
    }

    // Optionally restrict to game admin
    if (game.adminId.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Not authorized to update this game' }, { status: 403 });
    }

    game.status = status;
    await game.save();

    return NextResponse.json({ message: 'Game status updated', game }, { status: 200 });
  } catch (err) {
    console.error('Error updating game status:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
