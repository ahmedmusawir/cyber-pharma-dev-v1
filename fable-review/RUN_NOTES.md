# RUN NOTES — Fable Independent Code Review

## Identity / boundary
- **Repository:** `cyber-pharma-dev-v1`
- **Branch:** `fable-code-review-13sep2026` (confirmed via `git rev-parse --abbrev-ref HEAD`)
- **HEAD:** `f1113177a5250e46136671ae4845659bda58f359`
- **Pinned source SHA:** `f1113177a5250e46136671ae4845659bda58f359` — **confirmed present** (`git cat-file -t` → `commit`) and **equals HEAD**. Source state matches the pinned snapshot exactly; no unexpected or pre-existing changes.
- **Review start:** 2026-09-13 14:11 BST · notes finalized 2026-09-13 14:21 BST.
- **Working tree at start:** clean. Only untracked path created during review: `fable-review/`.

## Runtime / toolchain (installed, from `node_modules` after `npm ci`)
| Tool | Declared (package.json) | Installed |
| --- | --- | --- |
| Node | — | v24.14.1 |
| npm | — | 11.13.0 |
| next | ^16.2.1 | 16.2.12 |
| react / react-dom | ^19.2.4 | 19.2.4 |
| typescript | ^5 | 5.5.4 |
| @supabase/ssr | ^0.6.1 | 0.6.1 |
| @supabase/supabase-js | ^2.44.0 | 2.106.1 |
| zustand | ^4.5.4 | 4.5.4 |
| zod | ^3.23.8 | 3.23.8 |
| react-hook-form | ^7.51.5 | 7.52.1 |
| tailwindcss | ^3.4.1 | 3.4.6 |
| jest | ^30.0.5 | 30.4.2 |

## Architecture summary
- Next.js 16 App Router, TypeScript strict. Two authed surfaces (`/owedbook`, `/admin-portal`) inside a shared `AuthedShell`. A third env-gated operator tool (`/moose-portal`).
- **Auth is real** (Supabase, `@supabase/ssr`); server route guard `protectPage()` resolves `{user, role}` from `supabase.auth.getUser()` + a `user_roles` table lookup.
- **Domain data is mock**: OwedBook via `owedBookService` over `src/mocks/owedbook.ts` (150 rows); Admin Portal via 5 services over an in-memory Zustand store seeded from `src/mocks/adminDemo.ts` (no persist → refresh resets). Services are the declared single Phase-7 backend swap point.
- Middleware entry is `src/proxy.ts` (not `middleware.ts`) → `updateSession`.

## Commands executed (all read-only w.r.t. application source)
- `git rev-parse` / `git cat-file -t` / `git status --porcelain` / `git log` — state verification.
- `npm ci --no-audit --no-fund` — dependency install from lockfile (exit 0). Touches only `node_modules/` (gitignored).
- `npx tsc --noEmit` — **exit 0** (clean typecheck).
- `npx eslint .` — **exit 0**, 34 warnings, 0 errors.
- `npx jest --ci` — **exit 0**, 26 suites / 120 tests passed. (README badge says "118 / 25" — stale by 2 tests / 1 suite; documentation drift only.)
- `npx next build` (no env) — **exit 1**: prerender of `/access-denied` fails constructing a Supabase client without env vars (documented caveat).
- `npx next build` (placeholder env) — **exit 0**, 16 routes, middleware present.
- `npm audit --omit=dev` and `npm audit` — advisory inventory (see review §14).
- A throwaway Node script in the scratchpad verified fixture arithmetic invariants (not written into the repo).

## Environment limitations / unavailable services
- **No real backend exercised.** No Supabase project, no `.env.local` read (per boundary rule — `.env.local` is gitignored and was not opened). All execution was mock-backed or static-build.
- **No browser interaction.** Responsive/visual/keyboard behavior was assessed from source only, not rendered.
- **No integration or deployment-representative run.** Cloud Run / GCS / Stripe / file ingest paths do not exist in this snapshot.
- Evidence ceiling for behavioral findings is therefore **E2 (controlled execution against declared mocks)**; auth, RLS, tenant, and billing correctness against a live backend are **E3/E4 — not reached**.

## Change-boundary confirmation
- No application source, tests, fixtures, config, dependencies (`package.json`/lockfile), env files, database, or Supabase state were modified.
- No git state changed: no add/commit/push/branch/stash/reset/checkout. `node_modules/` was populated by `npm ci` (gitignored, not source).
- All writes were confined to `fable-review/`.
