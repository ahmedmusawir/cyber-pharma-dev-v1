# KIP Registry — Kit/Known Improvement Proposals

> Parked, deliberate improvements. NOT bugs, NOT a to-do list — each entry stays
> parked until one of its **trigger conditions** fires. Entries are numbered
> KIP-N in discovery order and are never renumbered or deleted; closed entries
> move to the Closed section with a resolution line.
>
> **Standing rule (CLAUDE.md):** at session start, when touching auth files, or
> when opening a new module, check this registry and surface any KIP whose
> triggers are met.

_Registry created: 2026-08-04. Format: mechanism · risk · triggers · verification._

---

## Open

### KIP-1 — `server.ts` cookie modernization

- **File:** `src/utils/supabase/server.ts`
- **Origin:** linting pass
- **Mechanism:** the server Supabase client uses the deprecated per-cookie
  `get`/`set`/`remove` adapter from `@supabase/ssr` instead of the current
  `getAll`/`setAll` interface, plus an `as any` cast on the `cookies()` store to
  paper over the Next.js async-cookies type. Works today; each `@supabase/ssr`
  or Next.js upgrade raises the odds of a silent auth-session break (cookie
  writes failing quietly inside the try/catch).
- **Risk:** MEDIUM — auth session persistence is load-bearing for every
  protected surface, but the deprecated path is currently functional and the
  failure mode (stale/missing session) is loud in manual testing.
- **Triggers:**
  - Batched auth-hygiene session
  - FORCED ENTRY when touching `src/utils/supabase/server.ts` for any reason
  - Symptom promotion: any unexplained session-loss / random-logout report, or
    an `@supabase/ssr` major-version bump in a dependency pass
- **Verification requirement:** manual auth-walk — login (ADMIN + MEMBER),
  cross-surface nav, hard refresh on each surface, logout, re-login — in
  production mode (`npm run build && npm start`), then repeated on staging.

### KIP-2 — `useAuthStore.role` stale-persist (remaining consumers)

- **Files:** `src/components/global/MobileNav.tsx:22`, `src/components/global/UserMenu.tsx:23`
  (the remaining `useAuthStore((s) => s.role)` readers); root cause in
  `src/store/useAuthStore.ts` (persisted `auth-store`, `role` written ONLY by `login()`)
- **Origin:** navbar fix (2026-08-04 staging nav bug — Navbar itself was cured
  by server-resolved identity props; these consumers were flagged out of scope)
- **Mechanism:** `role` lives in localStorage-persisted Zustand state and is
  written only by the login flow. A valid Supabase cookie session with cleared/
  absent localStorage (new browser, new device, cleared site data) leaves
  `role: null` while the user is authenticated — any component reading
  `s.role`/`isAdmin` then renders its role-gated UI wrongly (the exact class of
  bug that made the Navbar's Admin Portal link vanish "randomly"). Fix shape is
  known: consume server-resolved identity (protectPage → props) or hydrate the
  store from a server source, not from persist.
- **Risk:** LOW-MEDIUM — `MobileNav`/`UserMenu` appear to be kit-era components;
  whether they are mounted on any live route is unverified. Risk jumps to
  MEDIUM+ the moment either is wired into a rendered surface.
- **Triggers:**
  - Batched auth-hygiene session
  - FORCED ENTRY when touching `MobileNav.tsx`, `UserMenu.tsx`, or
    `useAuthStore.ts` for any reason
  - Symptom promotion: any report of role-gated UI missing/incorrectly shown
    outside the (already-fixed) primary Navbar
- **Verification requirement:** manual auth-walk with a stale-persist scenario
  added — login, clear localStorage (keep cookies), hard refresh, confirm all
  role-gated UI still correct for ADMIN and MEMBER.

---

## Closed

_(none yet)_
