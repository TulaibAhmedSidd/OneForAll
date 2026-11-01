import User from '@/models/User';
import Game from '@/models/Game';
import PaymentRequest from '@/models/PaymentRequest';
import WalletTransaction from '@/models/WalletTransaction';

export async function adminStats() {
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const [users, newUsers, openGames, drawingGames, pendingDeposits, pendingWithdrawals, entryVolume, walletFloat] = await Promise.all([
    User.estimatedDocumentCount(),
    User.countDocuments({ createdAt: { $gte: since } }),
    Game.countDocuments({ status: 'active' }),
    Game.countDocuments({ status: 'drawing' }),
    PaymentRequest.countDocuments({ kind: 'deposit', status: 'pending' }),
    PaymentRequest.countDocuments({ kind: 'withdrawal', status: 'pending' }),
    WalletTransaction.aggregate([
      { $match: { transactionType: 'game-participation', createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$walletBalance' } } }]),
  ]);
  return {
    users,
    newUsers,
    openGames,
    drawingGames,
    pendingDeposits,
    pendingWithdrawals,
    ticketsToday: entryVolume[0]?.count || 0,
    salesToday: -(entryVolume[0]?.total || 0),
    walletFloat: walletFloat[0]?.total || 0,
  };
}
