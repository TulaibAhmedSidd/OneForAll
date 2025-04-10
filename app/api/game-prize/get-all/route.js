import { NextResponse } from 'next/server';
import GamePrize from '@/app/models/GamePrize';
import connectToDB from '@/app/lib/db';

export async function GET() {
  try {
    await connectToDB();
    const prizes = await GamePrize.find();
    return NextResponse.json({ prizes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error fetching prizes' }, { status: 500 });
  }
}
