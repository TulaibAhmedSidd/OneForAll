// app/api/game/route.js
import connectToDB from '@/app/lib/db';
import { verifyToken } from '@/app/lib/jwt';
import Game from '@/app/models/Game';
import User from '@/app/models/User';
import { selectWinner } from '@/app/utils/selectWinner';
import { NextResponse } from 'next/server';

// GET all games
export async function GET(req, { params }) {
    await connectToDB();
    const { id } = params;

    try {
        const games = await Game.findById(id).populate();
        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const gameId = params.id
        // const game = await Game.findById(gameId).populate('participants gamePrize.prize');
        const game = await Game.findById(gameId)
            .populate('participants')
            .populate({
                path: 'gamePrize.prize',
                model: 'GamePrize'
            });
        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // Ensure the game has ended or the admin has triggered the prize distribution
        // if (new Date(game.endTime) >= new Date()) {
        //     return NextResponse.json({ error: 'Game has not ended yet' }, { status: 400 });
        // }

        // check prize number
        const faltPrizes = game?.gamePrize?.flatMap((ite)=>ite?.quantity);
        const summedPrizes = faltPrizes?.reduce((partialSum, a) => partialSum + a, 0);
        console.log('faltPrizes',faltPrizes)
        console.log('summedPrizes',summedPrizes)
        if(game?.participants?.length < summedPrizes){
            console.error('Number of participants are not completed:');
            return NextResponse.json({ error: 'Number of participants are not completed' }, { status: 400 });
        }

        // Distribute prizes
        game.gamePrize.forEach(prize => {
            const prizeQuantity = prize.quantity;
            const participants = game.participants;
            const prizeWinners = [];
            console.log("prizeQuantity", prizeQuantity)
            console.log("participants", participants)
            console.log("prizeWinners", prizeWinners)

            for (let i = 0; i < prizeQuantity; i++) {
                const winner = participants[Math.floor(Math.random() * participants.length)];
                console.log("winner", winner)
                prizeWinners.push(winner);
                participants.splice(participants.indexOf(winner), 1); // Remove winner from list to prevent duplicates
            }
            console.log("prizeWinners", prizeWinners)
            prize.winners = prizeWinners;
        });

        game.status = 'completed';
        await game.save();

        return NextResponse.json({ message: 'Prizes distributed successfully', game });
    } catch (error) {
        console.error('Error distributing prizes:', error);
        return NextResponse.json({ error: 'Failed to distribute prizes' }, { status: 500 });
    }
}
// export async function POST(req, { params }) {
//     try {
//         await connectToDB();
//         const token = req.headers.get('authorization')?.split(' ')[1];
//         const decoded = verifyToken(token);

//         const game = await Game.findById(params.id);
//         if (!game || game.adminId.toString() !== decoded.id)
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

//         if (game.winner) return NextResponse.json({ error: 'Winner already selected' });

//         const winner = await selectWinner(game._id);
//         return NextResponse.json({ message: 'Game ended and winner selected', winner });
//     } catch (err) {
//         console.error(err);
//         return NextResponse.json({ error: 'Error force-ending game' }, { status: 500 });
//     }
// }

export async function PATCH(req, { params }) {
    try {
        await connectToDB();
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        const game = await Game.findById(params.id);
        if (!game || game.adminId.toString() !== decoded.id)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        game.paused = !game.paused;
        await game.save();

        return NextResponse.json({ message: `Game ${game.paused ? 'paused' : 'resumed'}` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update game status' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDB();
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        const game = await Game.findById(params.id);
        if (!game || game.adminId.toString() !== decoded.id)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        await game.deleteOne();
        return NextResponse.json({ message: 'Game deleted successfully' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error deleting game' }, { status: 500 });
    }
}
