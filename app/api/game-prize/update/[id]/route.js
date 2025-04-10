import { NextResponse } from 'next/server';
import GamePrize from '@/app/models/GamePrize';
import connectToDB from '@/app/lib/db';

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await req.json();

    const updated = await GamePrize.findByIdAndUpdate(id, body, { new: true });

    if (!updated) return NextResponse.json({ error: 'Prize not found' }, { status: 404 });

    return NextResponse.json({ message: 'Prize updated', prize: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error updating prize' }, { status: 500 });
  }
}
