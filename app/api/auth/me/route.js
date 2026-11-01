import { handler, json } from '@/lib/http';
import { getSessionUser, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  const user = await getSessionUser();
  return json({ user: publicUser(user) });
});
