import connectToDB from '@/lib/db';
import GamePrize from '@/models/GamePrize';
import { handler, json, readJson } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { prizeSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await connectToDB();
  await requireAdmin();
  const prizes = await GamePrize.find().sort({ createdAt: -1 }).lean();
  return json({ prizes: prizes.map((p) => ({ id: String(p._id), name: p.prizeName, image: p.prizeImage, worth: p.prizeWorth, type: p.type || 'item' })) });
});

export const POST = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  const data = prizeSchema.parse(await readJson(req));
  const p = await GamePrize.create(data);
  return json({ id: String(p._id) }, { status: 201 });
});
