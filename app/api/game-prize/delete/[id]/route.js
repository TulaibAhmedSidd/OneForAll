import { NextResponse } from 'next/server';
import GamePrize from '@/app/models/GamePrize';
import connectToDB from '@/app/lib/db';

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    const deleted = await GamePrize.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Prize not found' }, { status: 404 });

    return NextResponse.json({ message: 'Prize deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error deleting prize' }, { status: 500 });
  }
}
