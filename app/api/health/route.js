import mongoose from 'mongoose';
import connectToDB from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    await connectToDB();
    await mongoose.connection.db.admin().ping();
    return Response.json({ ok: true, db: 'up', ms: Date.now() - started });
  } catch (err) {
    return Response.json({ ok: false, db: 'down', reason: String(err?.message || err).slice(0, 120) }, { status: 503 });
  }
}
