import { NextResponse } from 'next/server';
import GamePrize from '@/app/models/GamePrize';
import connectToDB from '@/app/lib/db';

export async function POST(req) {
    try {
        await connectToDB();

        const {
            gameId,
            prizeName,
            prizeWorth,
            imageUrl,
            quantity,
        } = await req.json();
       
        if (!prizeName || !prizeWorth || !imageUrl) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }


        const newPrize = new GamePrize({
            gameId,
            prizeName,
            prizeWorth,
            prizeImage: imageUrl,
            quantity
        });

        await newPrize.save();
        return NextResponse.json({ message: 'Prize created successfully', prize: newPrize }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create prize' }, { status: 500 });
    }
}
