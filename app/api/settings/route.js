import connectToDB from '@/lib/db';
import { handler, json } from '@/lib/http';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await connectToDB();
  return json(await getSettings(), { headers: { 'Cache-Control': 'public, s-maxage=60' } });
});
