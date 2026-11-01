import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => {
  throw new HttpError(status, message);
};

export function json(data, init) {
  return NextResponse.json(data, init);
}

// Wraps a route handler: same-origin check for writes, consistent error shape,
// and never leaks stack traces or Mongo errors to the client.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError) {
        const first = err.issues[0];
        return json({ error: first?.message || 'Invalid input' }, { status: 400 });
      }
      if (err?.code === 11000) return json({ error: 'This was already submitted.' }, { status: 409 });
      if (err?.name === 'CastError') return json({ error: 'Not found' }, { status: 404 });
      if (/MONGO_URI|ECONNREFUSED|MongoServerSelectionError|querySrv/i.test(`${err?.message} ${err?.name}`)) {
        console.error('[db]', err);
        return json({ error: 'Service is temporarily unavailable. Try again in a minute.' }, { status: 503 });
      }
      console.error('[api]', req.method, req.nextUrl?.pathname, err);
      return json({ error: 'Something went wrong. Try again.' }, { status: 500 });
    }
  };
}

function assertSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return; // non-browser clients (cron, curl) are still protected by auth
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'Cross-site request blocked');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, 'Cross-site request blocked');
  }
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Request body must be JSON');
  }
}

export function clientIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local'
  );
}
