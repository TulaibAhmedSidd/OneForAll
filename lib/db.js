import mongoose from 'mongoose';
import '@/models/User';
import '@/models/Game';
import '@/models/Entry';
import '@/models/GamePrize';
import '@/models/WalletTransaction';
import '@/models/PaymentRequest';
import '@/models/Setting';
import '@/models/RateLimit';

// One connection per serverless instance. The promise is cached on globalThis so
// hot reloads and concurrent cold-start requests share a single connect() call.
const cached = globalThis.__mongoose || (globalThis.__mongoose = { conn: null, promise: null });

export default async function connectToDB() {
  if (cached.conn && cached.ready && mongoose.connection.readyState === 1) return cached.conn;

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Small pool per lambda: thousands of warm lambdas x 10 sockets is what Atlas sees.
        maxPoolSize: Number(process.env.MONGO_POOL_SIZE || 10),
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  // Unique indexes (ledger idempotency keys, one ticket per user) must exist before
  // money moves. init() is the build mongoose already started; awaiting it is cheap after the first time.
  if (!cached.indexes) {
    cached.indexes = Promise.all(Object.values(mongoose.models).map((m) => m.init())).catch((err) => {
      cached.indexes = null;
      throw err;
    });
  }
  await cached.indexes;
  cached.ready = true;
  return cached.conn;
}
