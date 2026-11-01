import RateLimit from '@/models/RateLimit';
import { HttpError } from './http';

// Allows `limit` hits per `windowSec` for a key, across all serverless instances.
export async function rateLimit(key, limit, windowSec, message = 'Too many attempts. Wait a minute and try again.') {
  const windowStart = Math.floor(Date.now() / (windowSec * 1000));
  const doc = await RateLimit.findOneAndUpdate(
    { key: `${key}:${windowStart}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowStart + 1) * windowSec * 1000) } },
    { upsert: true, new: true }
  ).lean();
  if (doc.count > limit) throw new HttpError(429, message);
}
