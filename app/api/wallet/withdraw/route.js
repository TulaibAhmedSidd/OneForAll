import connectToDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { withdrawSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { getSettings } from '@/lib/settings';
import { withTxn, moveMoney } from '@/lib/wallet';

// The amount is taken from the wallet straight away (so it cannot be spent twice)
// and given back if the admin rejects the request.
export const POST = handler(async (req) => {
  await connectToDB();
  const user = await requireUser();
  await rateLimit(`withdraw:${user._id}`, 5, 3600);
  const data = withdrawSchema.parse(await readJson(req));
  const { minWithdrawal } = await getSettings();
  if (data.amount < minWithdrawal) throw new HttpError(400, `Minimum withdrawal is Rs ${minWithdrawal}.`);

  const doc = await withTxn(async (session) => {
    const [r] = await PaymentRequest.create(
      [{ userId: user._id, username: user.username, kind: 'withdrawal', method: data.method, amount: data.amount, reference: `W-${Date.now()}`, accountName: data.accountName, accountNumber: data.accountNumber }],
      { session }
    );
    await moveMoney(session, { userId: user._id, amount: -data.amount, type: 'withdrawal', key: `withdraw:${r._id}`, note: `Withdrawal to ${data.method}` });
    return r;
  });
  return json({ id: String(doc._id), status: doc.status }, { status: 201 });
});
