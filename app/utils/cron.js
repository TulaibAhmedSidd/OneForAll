import connectToDB from '../lib/db';
import Game from '../models/Game';
import { selectWinner } from './/selectWinner';

export async function checkAndFinishGames() {
  await connectToDB();

  const now = new Date();
  const games = await Game.find({
    status: 'active',
    $or: [
      { endTime: { $lt: now } },
      { $expr: { $eq: ['$requiredUsers', { $size: '$participants' }] } }
    ]
  });

  for (const game of games) {
    await selectWinner(game._id);
  }

  console.log(`${games.length} game(s) processed`);
}
