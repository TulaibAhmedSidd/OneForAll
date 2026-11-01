# One For All — audit, scaling plan and go-live hurdles

Written 2026-11-02 after rebuilding the app. Read this before launching to real players.

## 1. What was wrong in the first version (all fixed)

| # | Problem | Impact | Fix |
|---|---|---|---|
| 1 | Easypaisa top-up had `paymentSuccess = true` | Anyone could add unlimited free balance | Deposits are now pending requests; admin matches the TID before crediting. Each TID can be claimed once. |
| 2 | `/api/wallet/topUp` had no login check | Anyone could credit any user id | Removed |
| 3 | Top-up amount was a string | `0 + "100"` → string maths, wrong balances | zod validation, whole rupees only |
| 4 | Join checked `balance < 1`, not the fee | Balances went negative | Guarded atomic debit (`walletBalance >= fee`) |
| 5 | Join had no duplicate or seat locking | Same user joined many times; games overfilled under load | Transaction + unique `(gameId,userId)` index + atomic seat counter. Tested: 3 parallel joins → 1 ticket; 6 players for 4 seats → exactly 4 |
| 6 | Prize draw (`POST /api/game/:id`) had no auth | Anyone could run the draw — **and re-run it until they won** | Admin-only, locked state machine, draw can run once |
| 7 | Winners picked with `Math.random()` | No way to prove fairness | Commit–reveal provably fair draw; players can verify on their phone |
| 8 | Game/prize create, edit, delete and image upload had no auth | Anyone could edit games, prizes, fees | All admin routes require `isAdmin` |
| 9 | `/api/game/created`, `/api/game`, `/api/user/latest`, login response returned full user docs | **Every player's password hash, email and balance leaked** | Safe serializers only; password `select: false` |
| 10 | Edit game accepted any field (`findByIdAndUpdate(body)`) | Fee/prizes/participants could be changed after people paid | Only name, description, pause and later end time are editable |
| 11 | Cancel did not refund | Players lost money | Cancel refunds every ticket, idempotently |
| 12 | `announceResult`, `wallet/history` imported `@/lib/db` (wrong path) | Build/route crashes | Rewritten |
| 13 | Frontend called routes that didn't exist (`update-status/:id`, `game-prize/:id`) | Admin buttons silently failed | Rewritten admin |
| 14 | `localStorage` read during render in game management | Crash on server render | Cookie session; no tokens in localStorage |
| 15 | `middleware.js` sat in `app/lib`, so it never ran; JWT kept in localStorage | No route protection, XSS could steal sessions | httpOnly cookie, server-side checks in layouts and every API |
| 16 | Participants stored as an array inside each game | 16 MB document limit ≈ breaks around a few hundred thousand players per game; every join rewrote the array | Tickets are separate `Entry` documents; game keeps a counter |
| 17 | No rate limits | Password guessing, sign-up spam | Mongo-backed limits on login, sign-up, join, deposit, withdraw |
| 18 | Stripe in USD with a card form that never existed | Broken; Stripe does not onboard Pakistan merchants | Removed |
| 19 | Anyone logged in could create games | Players could create fake games | Admin only, via `ADMIN_EMAILS` |
| 20 | Next 14.2.28 | Known security advisories | Upgraded to 14.2.35 |

Verified with `scripts/api-test.mjs` (44 checks: access control, double-pay, race conditions, draw
re-run, refunds, withdrawals, ledger = balance).

## 2. Go-live hurdles (in order of risk)

### Hurdle 1 — Legal (the biggest one) ⚠️
Paying money for a chance to win a prize is treated as a **lottery / gambling** in most countries,
including Pakistan (Public Gambling Act 1867 and provincial gambling laws; Pakistan Penal Code s. 294-B on
prize schemes; only state schemes like Prize Bonds are clearly allowed). This is not legal advice —
**get a Pakistani lawyer's written opinion before taking real money.** Knock-on effects:
- Easypaisa / JazzCash / banks will refuse or close a merchant account for a gambling-type business.
- Google Play does not allow real-money gambling apps in Pakistan (a PWA avoids the store, but not the law).

Ways other products make a similar model work (discuss with the lawyer):
1. **Skill element:** players answer a skill question to enter (prize competitions model).
2. **Free entry route:** an equal free way to enter (sweepstakes model); paid tickets become optional.
3. **Brand-sponsored campaigns:** a company funds the prizes as a marketing promotion with approval.

The code is built so any of these can be added (an entry step before `joinGame`).

### Hurdle 2 — Hosting terms
- **Vercel Hobby is for non-commercial use only.** A paid product needs Vercel Pro (US$20/month).
- **Atlas M0** has no backups and limited connections. For a product holding real money you need at
  least M10 (~US$57/month) with continuous backups. Keep M0 for testing.

### Hurdle 3 — Payments at scale
Manual TID checking works for the first few hundred deposits a day. After that you need an approved
Easypaisa/JazzCash merchant API with server-to-server callbacks (blocked by Hurdle 1). Plan:
add `/api/payments/webhook/<provider>`, verify the provider signature, and call
`moveMoney(... key: 'deposit:<providerTxnId>')` — the idempotency key makes duplicate callbacks safe.

### Hurdle 4 — One person, many accounts
Multiple accounts raise someone's odds and break "one ticket per person". Today: email + optional phone.
Before launch: **phone OTP at sign-up** (unique phone per account) and block withdrawals to numbers already
used by another account. SMS OTP costs money (Phase 2).

### Hurdle 5 — Trust & operations
- Publish a real support WhatsApp/phone and a privacy policy.
- Prize delivery process (who calls winners, proof photo, 30-day claim window — already in Rules).
- Daily reconciliation: sum of approved deposits − withdrawals = wallet float + ticket revenue − cash prizes.
  The admin overview shows wallet float and daily sales to help.

### Hurdle 6 — Settling games on time
Vercel Hobby crons run **once a day** (set in `vercel.json`). Games also settle when anyone opens them,
when the last ticket sells, and with the admin "Settle due games" button. For exact timing for free,
point **cron-job.org** at `GET /api/cron/settle` every 5 minutes with header
`Authorization: Bearer <CRON_SECRET>`.

## 3. Can it handle 1 million / 10 million users?

### What the design already does right
- Joining is one short transaction touching 2 small documents + 2 inserts. No arrays grow.
- The draw is O(number of prizes), not O(players): winners are ticket numbers, fetched by index.
- Public game list is CDN-cached (`s-maxage=15`), so traffic spikes hit Vercel's edge, not Mongo.
- Ledger + idempotency keys make retries and duplicate clicks safe at any volume.
- Small Mongo pool per lambda (`MONGO_POOL_SIZE`, default 10) so thousands of lambdas don't exhaust Atlas.

### Rough capacity
| Stage | Users | Peak joins/sec | Setup |
|---|---|---|---|
| Now (free) | ~5–10k | ~20 | Vercel Hobby + Atlas M0 |
| Phase 2 | ~1M | ~300–500 | Vercel Pro + Atlas M30, phone OTP, gateway webhooks, Upstash Redis rate limits |
| Phase 3 | ~10M | 2–5k+ | Queue-based joins, sharded counters, Atlas sharding, background workers |

### Phase 2 (≈1M users) changes
1. Atlas M30 (dedicated, backups, ~3k connections), indexes already defined.
2. Move rate limiting to **Upstash Redis** (free tier → pay-as-you-go) — cheaper than Mongo writes per request.
3. Make the landing page ISR (revalidate 15s) and load "my tickets / balance" client-side, so the home
   page is fully CDN-served.
4. Background jobs (Upstash QStash or Inngest) for refunds of large games — today refunds run inside the
   request with a 45-second budget and "Finish refunds" to resume.
5. Monitoring: Sentry (errors) + Vercel/Axiom log drain + `/api/health` uptime check (UptimeRobot free).
6. Load test with k6: 500 virtual users joining one game; target p95 < 800 ms, zero over-selling.

### Phase 3 (≈10M users) changes
1. **Hot game document:** one popular Rs 1 game with 100k people joining at once makes its seat counter
   a hotspot (transactions retry on write conflicts). Fix: pre-split the game into seat blocks
   (e.g. 100 sub-counters; join picks a random block with free seats) or put joins on a queue that a
   worker drains in batches.
2. **Shard** `entries` and `wallettransactions` on hashed `userId` (Atlas sharded cluster); archive ledger
   rows older than 12 months to cold storage.
3. Read replicas for admin reports; never run aggregations on the primary at peak.
4. Separate the admin app from the player app (different Vercel project), and put a WAF/bot protection
   (Vercel Firewall or Cloudflare) in front of sign-up and join.

## 4. Phase 2 cost list (nothing here is switched on)
| Item | Why | Approx. cost |
|---|---|---|
| Vercel Pro | Commercial use, longer functions, more crons | US$20/month |
| Atlas M10 → M30 | Backups, capacity | US$57 → ~US$390/month |
| SMS OTP (e.g. local SMS gateway) | One account per phone | ~Rs 1–2 per SMS |
| Upstash Redis + QStash | Rate limits, background jobs | Free tier, then usage-based |
| Sentry | Error tracking | Free tier |
| Lawyer opinion | Hurdle 1 | One-time |
