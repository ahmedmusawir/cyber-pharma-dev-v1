# ✅ CHECKPOINT 2 COMPLETE — Server-Resolved Nav Identity

**Date:** 2026-08-04 16:33 · **Branch:** `navbar-fix-1` · **Verify:** tsc 0 · jest 26 suites / 120 tests, all green

**HEADLINE: The identity race is dead — the Navbar can no longer render empty while
authenticated, because it no longer fetches identity at all. protectPage's server-truth
user + role now flow down as props through every mount point, the dead "Login while
authed" branches are gone, and a new invariant suite locks it in.**

---

## CHANGES MADE

**Identity source:**
- `src/utils/supabase/actions.ts` — `protectPage` now returns `{ user, role }` (role was already computed and thrown away; zero new queries).

**Layouts (4 call sites) — capture and pass down:**
- `src/app/(admin)/layout.tsx` → `<AuthedShell user role>`
- `src/app/owedbook/layout.tsx` → `<AuthedShell user role>`
- `src/app/profile/layout.tsx` → `<Navbar user role>` (direct)
- `src/app/moose-portal/layout.tsx` → `<MooseShell user role>`

**Shells (pass-through props):**
- `src/components/layout/AuthedShell.tsx`, `src/app/moose-portal/_shell/MooseShell.tsx` — accept `user`/`role`, forward to Navbar.

**Navbar (`src/components/global/Navbar.tsx`):**
- Props-based: `{ user: SupabaseUser; role: AppRole }` — no `useState(user)`, no `isLoading`, no `fetchUser`, no `useAuthStore` role selector.
- `navLinks` built unconditionally — an authed Navbar is structurally incapable of being empty.
- `onAuthStateChange` slimmed to sign-out-only (other-tab logout → `/auth`). No `getUser()` anywhere.
- Dead `!user` branches REMOVED per ruling: desktop Login link, mobile Login link, `!isLoading` gates, `user ? email : "Theme"` fallback, the `navLinks.length > 0` guard.
- KEPT: `useAuthStore.getState().logout()` in `handleLogout` (store still owns the logout API call).

**Tests:**
- `Navbar.mobile.test.tsx` / `Navbar.switcher.test.tsx` — mocks rewritten to props (no async getUser dance; renders are now synchronous, which is the point).
- `Navbar.invariant.test.tsx` **(NEW)** — never-empty invariant: MEMBER first render ≥ [OwedBook, Profile]; ADMIN ≥ [OwedBook, Admin Portal, Profile].
- `AuthedShell.test.tsx` + `drawer-apply.integration.test.tsx` — supply the new required props (Navbar stubbed; type-level only).
- `actions.test.ts` — two happy-path assertions updated to `{ user, role }`; all deny/redirect cases untouched and green.

## THINGS I DIDN'T TOUCH
- `useAuthStore.ts` — login/logout flow unchanged (KIP on stale-persist stands, out of scope).
- `NavbarHome` / `NavbarLoginReg` (public/auth surfaces), `globals.css`, sidebar internals, all page content.

## VERIFY
- `npx tsc --noEmit` → **0 errors**
- `npx jest` → **26 suites / 120 tests, all pass** (was 25/118: +1 suite, +2 invariant tests)

## POTENTIAL CONCERNS
- `user` prop serializes the Supabase user from server → client per navigation; it's plain JSON and protectPage already fetched it — no extra cost, but the object shape in the RSC payload now includes user metadata. Nothing sensitive beyond what the client already had via `getUser()`.
- Multi-tab logout now relies solely on the slim `SIGNED_OUT` listener + server re-validation on next nav — same guarantee as before, less machinery.

## SUGGESTED COMMIT MESSAGE

```
fix(nav): server-resolve navbar identity — kill the empty-nav race

protectPage now returns { user, role } (already computed, zero new
queries); all four authed layouts pass them as props through
AuthedShell/MooseShell into the Navbar. Navbar drops its client-side
getUser() fetch, isLoading window, and store role selector — navLinks
build unconditionally, so an authed navbar can never render empty and
staging latency can no longer blank or partially blank the menu.
onAuthStateChange slimmed to sign-out-only; dead !user Login branches
removed (they showed "Login" to authed users on a failed fetch).

New Navbar.invariant test locks the never-empty guarantee; mobile/
switcher/AuthedShell/actions suites updated for props + return shape.

tsc 0 / jest 26 suites 120 tests green.
```

## PRODUCTION-MODE VERIFY (operator-run)

```bash
npm run build && npm start
```

Manual walk (then repeat the SAME list on staging after deploy):
1. Login as ADMIN → land on /owedbook. Navbar shows OwedBook · Admin Portal · Profile immediately — no flicker, no gap.
2. Cross-nav all 3 surfaces repeatedly (OwedBook → Admin Portal → Profile → back, ×3 fast clicks): navbar + sidebar NEVER vanish, link set never changes or drops items.
3. No full-screen overlay on any click; slow pages show a spinner in the CONTENT AREA only.
4. Mobile viewport: hamburger menu shows the same full link set; drawer/panel behavior intact.
5. Hard-refresh on each surface: navbar fully populated on first paint.
6. Logout (desktop dropdown + mobile panel) → lands on /auth; back-button doesn't resurrect an authed shell.
7. Login as MEMBER: OwedBook · Profile only (no Admin Portal), never empty.

→ STOPPED. Awaiting your test + commit + merge + deploy + staging re-walk.
