import connectToDB from "@/lib/db";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET(req) {
  await connectToDB();

  const { userId } = req.query;

  // Get all transactions for the user
  const transactions = await WalletTransaction.find({ userId }).populate('gameId', 'gameType prizeAmount').sort({ transactionDate: -1 });

  return new Response(JSON.stringify({ transactions }), { status: 200 });
}
