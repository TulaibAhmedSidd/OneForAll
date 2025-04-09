import connectToDB from '@/lib/db';
import User from '../../../models/User';
import WalletTransaction from '@/models/WalletTransaction';

export async function POST(req) {
  await connectToDB();

  const { userId, amount } = await req.json();

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
  }

  // Update user's wallet balance
  user.walletBalance += amount;

  // Create a new wallet transaction for this top-up
  const transaction = new WalletTransaction({
    userId,
    transactionType: 'top-up',
    amount,
    balanceAfterTransaction: user.walletBalance,
  });

  try {
    await transaction.save();
    await user.save();
    return new Response(JSON.stringify({ message: 'Wallet topped up successfully', balance: user.walletBalance }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error processing top-up', error }), { status: 500 });
  }
}
