// app/api/wallet/topup/easypaisa/route.js
import { NextResponse } from 'next/server';
import connectToDB from '@/app/lib/db';
import User from '@/app/models/User';
import WalletTransaction from '@/app/models/WalletTransaction';
import { verifyToken } from '@/app/lib/jwt';

export async function POST(req) {
  try {
    await connectToDB();
    
    const { amount } = await req.json();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await User.findById(userData.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simulate EasyPaisa payment confirmation (mock payment gateway interaction)
    const paymentSuccess = true; // Assume payment is successful for this example

    if (paymentSuccess) {
      // Add balance to the user's wallet
      user.walletBalance += amount;
      await user.save();

      // Record the transaction
      const walletTransaction = new WalletTransaction({
        userId: user._id,
        transactionType: 'top-up',
        amount,
        balanceAfterTransaction: user.walletBalance,
      });
      await walletTransaction.save();

      return NextResponse.json({ message: 'Balance added successfully via EasyPaisa' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing EasyPaisa top-up:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
