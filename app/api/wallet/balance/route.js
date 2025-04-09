import connectToDB from '@/app/lib/db';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await connectToDB();

  const token = req.headers.get('Authorization')?.split(' ')[1];  // Extract JWT token from header

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('walletBalance');

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ walletBalance: user.walletBalance }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to verify token', error }), { status: 500 });
  }
}
