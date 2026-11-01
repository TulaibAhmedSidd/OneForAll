# 2026-11-02 — done

## Repo
- Cloned `TulaibAhmedSidd/OneForAll` into `D:\Extras\OneForAll`; repo-local git identity `TulaibAhmedSidd <ahsidtullu@gmail.com>` (needed for Vercel deploys).

## Audit
- Found 20 problems (free unlimited top-ups, unauthenticated draw that could be re-run until you win,
  password-hash leaks, race conditions, negative balances, broken routes). Full table in
  `docs/SCALING-AND-LAUNCH.md` §1.

## Backend rebuilt
- `lib/wallet.js`: every balance change = transaction + ledger row with idempotency key.
- `lib/games.js`: atomic join (seat counter + guarded debit + unique ticket), draw lock, provably fair
  draw (`lib/fairness.js`), cancel with idempotent refunds, settle-due-games.
- Tickets moved out of the game document into `Entry` (scales past the 16 MB limit).
- Manual deposit (TID) + withdrawal requests with admin review; settings for deposit accounts.
- Cookie JWT auth, admin via `ADMIN_EMAILS`, same-origin check, Mongo rate limits, zod validation,
  security headers, `/api/health`, `/api/cron/settle` + daily Vercel cron.

## UI rebuilt
- Design: Pakistan-green + gold "prize bond" palette; tear-off ticket card is the signature element.
- Landing, login/register, player app (games, game detail with in-browser draw check, tickets, wallet, account),
  admin (overview, games, new game with margin calculator, prizes with upload, payments, players, settings),
  fairness and rules pages, offline/404/error pages, PWA manifest + generated icons + service worker.

## Tests
- `scripts/api-test.mjs`: 44/44 checks pass (access control, double-pay, races, draw, refunds, withdrawals, ledger).
- Browser-checked on 375px phone and desktop: login, buy ticket, wallet, tickets, account, all admin pages,
  draw verification button — no console errors.

## Docs
- `AGENTS.md` (rules + working pattern for Antigravity/Claude), `CLAUDE.md` → `@AGENTS.md`,
  `docs/SCALING-AND-LAUNCH.md`, `README.md`, `.env.example`, `scripts/migrate-v1.mjs`.
