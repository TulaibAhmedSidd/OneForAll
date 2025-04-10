import Game from "../models/Game";
import User from "../models/User";

export async function selectWinner(gameId) {
  const game = await Game.findById(gameId).populate('participants');

  if (!game || game.winner || game.participants.length === 0) return;

  const winnerIndex = Math.floor(Math.random() * game.participants.length);
  const winnerUser = game.participants[winnerIndex];

  game.winner = winnerUser._id;
  game.status = 'completed';
  game.resultAnnouncedByAdmin = true;

  await game.save();

  // Optional: Notify winner or log it
  return winnerUser;
}
