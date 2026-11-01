import connectToDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { depositSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { getSettings } from '@/lib/settings';

// The user has already sent money to one of our accounts and gives us the transaction ID.
// Nothing is credited until an admin matches it against the account statement.
export const POST = handler(async (req) => {
  await connectToDB();
  const user = await requireUser();
  await rateLimit(`deposit:${user._id}`, 6, 3600, 'Too many deposit requests. Wait for the pending ones to be checked.');
  const data = depositSchema.parse(await readJson(req));
  const { minDeposit } = await getSettings();
  if (data.amount < minDeposit) throw new HttpError(400, `Minimum deposit is Rs ${minDeposit}.`);

  const pendingCount = await PaymentRequest.countDocuments({ userId: user._id, kind: 'deposit', status: 'pending' });
  if (pendingCount >= 3) throw new HttpError(429, 'You already have 3 deposits waiting for review.');

  const reqDoc = await PaymentRequest.create({
    userId: user._id,
    username: user.username,
    kind: 'deposit',
    method: data.method,
    amount: data.amount,
    reference: data.reference.toUpperCase(),
    accountNumber: data.accountNumber,
  });
  return json({ id: String(reqDoc._id), status: reqDoc.status }, { status: 201 });
});
