// One-time migration from the first version of the app.
// Old games stored participants in an array and had no draw fingerprint, so they can't be drawn fairly.
// This closes them (status "cancelled"), and with --refund gives each participant their entry fee back
// through a proper ledger row. Users keep their accounts; old password hashes still work.
//
//   MONGO_URI="mongodb+srv://..." node scripts/migrate-v1.mjs            # dry run, prints what it would do
//   MONGO_URI="mongodb+srv://..." node scripts/migrate-v1.mjs --apply    # close old games
//   MONGO_URI="mongodb+srv://..." node scripts/migrate-v1.mjs --apply --refund
import crypto from 'crypto';
import mongoose from 'mongoose';

const apply = process.argv.includes('--apply');
const refund = process.argv.includes('--refund');
const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGO_URI');

await mongoose.connect(uri);
const db = mongoose.connection.db;
const games = await db.collection('games').find({ seedHash: { $exists: false } }).toArray();
console.log(`${games.length} old game(s) found`);

for (const g of games) {
  const participants = g.participants || [];
  console.log(`- ${g.gameName} | status ${g.status} | ${participants.length} participant(s) | fee ${g.gameAmount}`);
  if (!apply) continue;

  if (refund && g.status !== 'completed') {
    for (const userId of participants) {
      const key = `migrate-refund:${g._id}:${userId}`;
      if (await db.collection('wallettransactions').findOne({ idempotencyKey: key })) continue;
      const u = await db.collection('users').findOneAndUpdate({ _id: userId }, { $inc: { walletBalance: g.gameAmount } }, { returnDocument: 'after' });
      if (!u) continue;
      await db.collection('wallettransactions').insertOne({
        userId, transactionType: 'refund', amount: g.gameAmount, balanceAfterTransaction: u.walletBalance,
        gameId: g._id, note: `Refund — ${g.gameName} (app upgrade)`, idempotencyKey: key, createdAt: new Date(), updatedAt: new Date(),
      });
    }
  }
  await db.collection('games').updateOne(
    { _id: g._id },
    {
      $set: {
        status: g.status === 'completed' ? 'completed' : 'cancelled',
        cancelReason: g.status === 'completed' ? null : 'Closed during the app upgrade.',
        entriesCount: participants.length,
        seedHash: crypto.createHash('sha256').update(`legacy:${g._id}`).digest('hex'),
        description: g.description || '',
      },
    }
  );
}

// Old users: make sure fields the new app expects exist.
if (apply) {
  await db.collection('users').updateMany({ walletBalance: { $type: 'string' } }, [{ $set: { walletBalance: { $toInt: '$walletBalance' } } }]);
  await db.collection('users').updateMany({ walletBalance: { $lt: 0 } }, { $set: { walletBalance: 0 } });
  await db.collection('users').updateMany({ email: { $regex: /[A-Z]/ } }, [{ $set: { email: { $toLower: '$email' } } }]);
}
console.log(apply ? 'Done.' : 'Dry run only. Add --apply to change data.');
await mongoose.disconnect();
