import connectToDB from "@/lib/db";
import Game from "@/models/Game";
import User from "@/models/User";


export async function POST(req) {
  await connectToDB();

  const { gameId, adminId } = await req.json();

  // Find the game
  const game = await Game.findById(gameId);
  if (!game) {
    return new Response(JSON.stringify({ message: 'Game not found' }), { status: 400 });
  }

  // Ensure that the admin is the one trying to announce the result
  if (game.adminId.toString() !== adminId) {
    return new Response(JSON.stringify({ message: 'Unauthorized: Only the game admin can announce results' }), { status: 403 });
  }

  // Check if the game is already completed
  if (game.status === 'completed') {
    return new Response(JSON.stringify({ message: 'Result has already been announced' }), { status: 400 });
  }

  // Announce the result, even if not enough participants are there
  game.status = 'completed';
  game.resultAnnouncedByAdmin = true;

  // Logic for selecting a winner (e.g., random winner from participants)
  const winner = game.participants[Math.floor(Math.random() * game.participants.length)];
  game.winner = winner;
  game.gameResult = 'win';

  // Update the winner's wallet
  const user = await User.findById(winner);
  if (user) {
    user.walletBalance += game.prizeAmount;  // Award the prize
    await user.save();
  }

  // Save game result
  await game.save();

  return new Response(JSON.stringify({ message: 'Result announced successfully', winner }), { status: 200 });
}
