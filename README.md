# One For All

Rs 1 / 5 / 10 tickets for real prizes, with draws anyone can verify. Next.js 14 PWA + MongoDB, deployed on Vercel.

- **Rules for contributors and AI agents:** [AGENTS.md](AGENTS.md)
- **Audit, scaling plan, go-live hurdles:** [docs/SCALING-AND-LAUNCH.md](docs/SCALING-AND-LAUNCH.md)
- **Daily progress:** [progress/README.md](progress/README.md)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run db        # keep running: local Mongo replica set (transactions need one)
npm run dev
```

Then seed demo data and run the money checks:

```bash
BASE=http://localhost:3000 node scripts/seed-demo.mjs
BASE=http://localhost:3000 npm run test:api
```

## Deploy

Push to `main` → Vercel builds. Set the environment variables listed in AGENTS.md first
(`MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAILS`, `CRON_SECRET`, `CLOUDINARY_*`). If the database already
has games from the first version, run `node scripts/migrate-v1.mjs` once (see the script header).
