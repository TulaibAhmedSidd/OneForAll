// Local MongoDB replica set for development and tests (transactions need a replica set).
// Usage: npm run db   -> prints the MONGO_URI to put in .env.local, data kept in .devdb/
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import fs from 'fs';

const dbPath = new URL('../.devdb/', import.meta.url);
fs.mkdirSync(dbPath, { recursive: true });

const port = Number(process.env.DEV_DB_PORT || 27027);
const replSet = await MongoMemoryReplSet.create({
  replSet: { count: 1, storageEngine: 'wiredTiger' },
  instanceOpts: [{ port, dbPath: decodeURIComponent(dbPath.pathname.replace(/^\/(\w:)/, '$1')) }],
});
const uri = replSet.getUri('oneforall');
console.log(`MONGO_URI=${uri}`);

const stop = async () => {
  await replSet.stop({ doCleanup: false });
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
