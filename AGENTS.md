# One For All — rules for AI agents (Antigravity, Claude Code, any agent)

This file is the single rulebook for this repo. `CLAUDE.md` only points here. Do not put a rule
anywhere else (not only in `.claude/`, not only in a chat). Keep this file under 24 KB; long guides go in `docs/`.

## What the product is

A mobile-first PWA where players buy one ticket (Rs 1 / 5 / 10 / any fee) in a **game** (a prize pool).
A game has a fixed ticket price, a fixed number of tickets and a fixed prize list. When the last ticket
sells, or the end time passes, winners are drawn by ticket number with a **provably fair** method.
Cash prizes go to the wallet; item prizes are delivered by the team.

Audience: everyday Pakistani phone users. Screens must be simple: big cards, one obvious button on
the front, details inside. Copy is plain English, sentence case, no jargon.

## Stack

- Next.js **14.2 App Router**, JavaScript (no TypeScript), Tailwind CSS 3, `react-icons/lu`.
- MongoDB via Mongoose 8. **Must be a replica set** (Atlas, or `npm run db` locally) — money moves use transactions.
- Auth: own JWT in an httpOnly cookie `ofa_session` (`lib/auth.js`). No NextAuth. No tokens in localStorage.
- Hosting: Vercel (GitHub `TulaibAhmedSidd/OneForAll`, branch `main` auto-deploys). Images: Cloudinary.
- Commits must be authored as `TulaibAhmedSidd <ahsidtullu@gmail.com>` or Vercel will not deploy them.
  The repo-local git config already sets this — never change it.

## Folder map

```
app/                 routes. (auth)/ login+register, (app)/ player app (needs login), admin/ (needs isAdmin)
app/api/             route handlers. Every handler is wrapped in handler() from lib/http.js
components/          shared UI (TicketCard = the signature tear-off ticket, Sheet, JoinButton, AppNav…)
lib/                 server logic: db, auth, wallet (money), games (join/draw/cancel), fairness, validators, queries
models/              Mongoose schemas
scripts/             dev-db, seed-demo, api-test (end-to-end money checks), migrate-v1
docs/                SCALING-AND-LAUNCH.md (scale plan + go-live hurdles)
progress/YYYY-MM-DD/ daily log: done.md, next.md, remaining.md
```

## Money rules (never break these)

1. **Every balance change goes through `moveMoney()` / `moveMoneyOnce()` in `lib/wallet.js`.** Never
   `$inc walletBalance` or `user.walletBalance +=` anywhere else. Each change writes a ledger row
   (`WalletTransaction`) in the same transaction.
2. Every ledger row has a unique `idempotencyKey` describing the business event
   (`entry:<game>:<user>`, `prize:<game>:<ticket>`, `refund:<game>:<user>`, `deposit:<request>`…).
   A retry must hit the duplicate key and do nothing.
3. Debits use a guarded filter (`walletBalance >= amount`), so balances can never go negative.
4. Amounts are whole rupees (integers). Validate with zod (`lib/validators.js`); never trust the client.
5. Deposits are **never credited automatically** from the client. A deposit is a pending `PaymentRequest`
   until an admin approves it (or, later, a verified gateway webhook). Withdrawals hold the money at request time.
6. Game fee, seats and prizes are **locked after creation**. Only name, description, pause and a later
   end time can change.
7. Draws: only `drawGame()` in `lib/games.js`. It takes a lock by moving status `active → drawing`
   atomically, so it can run only once. Winner selection is deterministic from the secret seed
   (`lib/fairness.js`), and must stay identical to `components/VerifyDraw.jsx` and the snippet on `/fairness`.
   If you change one, change all three and the test in `scripts/api-test.mjs`.
8. A game that ends with fewer entries than prizes is cancelled and refunded — never half-drawn.
9. Never send `serverSeed`, password hashes, emails or phones of other players to the browser.
   Use `serializeGame()` / `publicUser()`; winner names are masked with `maskName()`.

## API conventions

- Wrap every route: `export const POST = handler(async (req, { params }) => { … })`.
  It blocks cross-site writes, turns `HttpError` / zod / duplicate-key errors into clean JSON, and hides internals.
- First lines: `await connectToDB();` then `await requireUser()` or `await requireAdmin()` for anything private.
- Parse input with a zod schema from `lib/validators.js`. Ids with `objectId.parse()`.
- Rate-limit anything a stranger can spam: `await rateLimit(key, limit, windowSec)` (Mongo TTL counters).
- Errors are written for the player: say what happened and what to do ("Not enough balance. Add money…").
- Admin-only routes live under `app/api/admin/`. Cron routes check `Authorization: Bearer $CRON_SECRET`.

## UI conventions

- Tokens live in `tailwind.config.js` (forest / jade / gold / paper / ink / line / coral) and the component
  classes in `app/globals.css` (`btn-gold`, `btn-forest`, `btn-ghost`, `field`, `label`, `card`, `chip`,
  `eyebrow`, `ticket`, `ticket-perf`, `ticket-stub`). **No raw hex colours in components.**
- Fonts: Bricolage Grotesque (`font-display`) for headings and numbers, Figtree (`font-sans`) for text,
  JetBrains Mono (`font-mono`) for ticket numbers, hashes and eyebrows.
- The tear-off ticket (`.ticket` + perforation + stub) is the signature. Use it for games only.
- Mobile first: 16px side padding (`.wrap`), buttons ≥ 48px tall, bottom tab bar on phones, no horizontal scroll.
- Dialogs: use `components/Sheet.jsx` (portal; bottom sheet on phones). Toasts: `react-toastify`.
- Server components read data with `lib/queries.js`; client components call the API with `components/api.js`
  and then `router.refresh()`.

## Working pattern (how we work on this repo)

1. **Start of a session:** read this file, then the latest `progress/<date>/next.md` and `remaining.md`.
2. Plan small steps. Foundation before features: tokens → components → schema → screens.
3. Run locally:
   ```bash
   npm install
   npm run db            # terminal 1: local Mongo replica set on :27027 (keep running)
   npm run dev           # terminal 2: put MONGO_URI from step 1 in .env.local (see .env.example)
   BASE=http://localhost:3000 node scripts/seed-demo.mjs   # demo data; logins below
   BASE=http://localhost:3000 npm run test:api             # 44 money/security checks — must all pass
   ```
   Demo logins: `admin@oneforall.test` / `player@oneforall.test`, password `password123` (local only).
4. **Before every commit:** `npm run build` passes and `npm run test:api` passes. Check the changed
   screens on a 375px-wide phone viewport.
5. Free tier first: Vercel Hobby, Atlas M0, Cloudinary free. Paid upgrades go in `docs/SCALING-AND-LAUNCH.md`
   under "Phase 2 costs", never silently.
6. **End of a session:** write/update `progress/<YYYY-MM-DD>/done.md`, `next.md`, `remaining.md`
   (Pakistan date) and the index `progress/README.md`. Commit as `docs(progress): YYYY-MM-DD`.
7. Push to `main` → Vercel deploys. Check `/api/health` on the live URL after deploy.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Needed | What |
|---|---|---|
| `MONGO_URI` | yes | Atlas connection string (replica set). `MONGODB_URI` also accepted. |
| `JWT_SECRET` | yes | 32+ random characters. Changing it logs everyone out. |
| `ADMIN_EMAILS` | yes | Comma list. These accounts become admin on sign-up/log-in. |
| `CRON_SECRET` | yes | Vercel Cron sends it; protects `/api/cron/settle`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for prize photos | Upload from admin. |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical URL for share previews. |

## Don'ts

- Don't add a payment gateway, SMS, or any paid service without writing it into the plan first.
- Don't store participants inside the Game document (16 MB limit). Tickets are `Entry` documents.
- Don't use `Math.random()` for anything to do with winners.
- Don't put secrets in code or commit `.env*` files.
- Don't remove the 18+ confirmation, rules page or refund rules — they are part of the product's credibility.
