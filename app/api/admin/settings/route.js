import connectToDB from '@/lib/db';
import Setting from '@/models/Setting';
import { handler, json, readJson } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { settingsSchema } from '@/lib/validators';
import { settleDueGames } from '@/lib/games';

export const maxDuration = 60;

export const PUT = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  const data = settingsSchema.parse(await readJson(req));
  await Setting.updateOne({ key: 'site' }, { $set: data }, { upsert: true });
  return json({ ok: true });
});

// "Settle now": draw or refund every game whose time is up.
export const POST = handler(async () => {
  await connectToDB();
  await requireAdmin();
  return json({ settled: await settleDueGames(50) });
});
