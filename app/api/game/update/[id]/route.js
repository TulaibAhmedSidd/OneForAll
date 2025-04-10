import { NextResponse } from 'next/server';
import GamePrize from '@/app/models/GamePrize';
import Game from '@/app/models/Game';
import connectToDB from '@/app/lib/db';

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await req.json();

    const updated = await Game.findByIdAndUpdate(id, body, { new: true });

    if (!updated) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    return NextResponse.json({ message: 'Game updated', game: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error updating game' }, { status: 500 });
  }
}
