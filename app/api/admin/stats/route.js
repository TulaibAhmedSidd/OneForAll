import connectToDB from '@/lib/db';
import { handler, json } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { adminStats } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await connectToDB();
  await requireAdmin();
  return json(await adminStats());
});
