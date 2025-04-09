// app/api/game/route.js
import connectToDB from '@/app/lib/db';
import Game from '@/app/models/Game';
import User from '@/app/models/User';
import { NextResponse } from 'next/server';

// GET all games
export async function GET(req) {
    await connectToDB();

    try {
        const games = await Game.find().populate('participants');
        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }
}

// POST to create a new game (Admin functionality)
export async function POST(req) {
    const { name, price, requiredParticipants } = await req.json();

    if (!name || !price || !requiredParticipants) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
        const newGame = new Game({
            name,
            price,
            requiredParticipants,
            participants: [],
        });

        await newGame.save();
        return NextResponse.json(newGame, { status: 201 });
    } catch (error) {
        console.error('Error creating game:', error);
        return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }
}

// POST to join a game
export async function POST_JOIN(req) {
    const { gameId, userId } = await req.json();

    if (!gameId || !userId) {
        return NextResponse.json({ error: 'Game ID and User ID are required' }, { status: 400 });
    }

    try {
        const game = await Game.findById(gameId);
        const user = await User.findById(userId);

        if (!game || !user) {
            return NextResponse.json({ error: 'Game or User not found' }, { status: 404 });
        }

        // Check if user is already in the game
        if (game.participants.includes(userId)) {
            return NextResponse.json({ error: 'User is already participating' }, { status: 400 });
        }

        // Add user to the game participants
        game.participants.push(userId);
        await game.save();

        // Update user's balance (assuming you have a wallet or balance system)
        user.walletBalance -= game.price; // Deduct the game price from user's balance
        await user.save();

        return NextResponse.json({ message: 'Successfully joined the game', game });
    } catch (error) {
        console.error('Error joining game:', error);
        return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
    }
}
