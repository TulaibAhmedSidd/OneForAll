# Next (in order)

1. **Vercel env vars** — add `ADMIN_EMAILS`, `CRON_SECRET` (and check `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`). Redeploy. Open `/api/health`.
2. If the live database has old games: run `node scripts/migrate-v1.mjs` (dry run first, then `--apply`).
3. Sign up with an `ADMIN_EMAILS` address → Admin → Settings: add Easypaisa/JazzCash deposit accounts.
4. Add prizes with photos, create the first Rs 1 / 5 / 10 games.
5. Set up cron-job.org every 5 min → `/api/cron/settle` with the Bearer secret (free exact-time draws).
6. Legal opinion on the paid-entry model (see docs/SCALING-AND-LAUNCH.md §2 Hurdle 1) before taking real money.
