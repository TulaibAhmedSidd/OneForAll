import connectToDB from '@/lib/db';
import GamePrize from '@/models/GamePrize';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { prizeSchema, objectId } from '@/lib/validators';

// Games keep their own copy of prize details, so editing or deleting here is always safe.
export const PUT = handler(async (req, { params }) => {
  await connectToDB();
  await requireAdmin();
  const data = prizeSchema.parse(await readJson(req));
  const p = await GamePrize.findByIdAndUpdate(objectId.parse(params.id), data, { new: true });
  if (!p) throw new HttpError(404, 'Prize not found');
  return json({ ok: true });
});

export const DELETE = handler(async (req, { params }) => {
  await connectToDB();
  await requireAdmin();
  const p = await GamePrize.findByIdAndDelete(objectId.parse(params.id));
  if (!p) throw new HttpError(404, 'Prize not found');
  return json({ ok: true });
});
