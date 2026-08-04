# 🔴 RECON REPORT — Staging Nav Bug (empty menu + full-screen spinner)

**Date:** 2026-08-04 14:31 · **Branch:** `navbar-fix-1` (clean) · **Status:** RECON ONLY — no code touched

**HEADLINE: All three reads CONFIRMED against the code. The overlay is a literal
reintroduction of the v0.4.1 anti-pattern, and the empty-nav window is worse than
read — on a failed auth call the navbar shows a "Login" link to an authenticated user.**

---

## READ A — client-side identity resolution → CONFIRMED (with an amplifier)

- `src/components/global/Navbar.tsx:27` — `useState<SupabaseUser | null>(null)`; `:43-53` — `navLinks = user ? [...] : []`. Exactly as read.
- `:55-66` — `useEffect` → `supabase.auth.getUser()`. This is a **network round-trip to the Supabase auth server** (token validation), not a local session read. Every mount pays staging latency before any link renders.
- **Remount across route groups: CONFIRMED.** `/owedbook`, `(admin)/admin-portal`, and `/profile` are **three separate layout trees**, each mounting its own Navbar instance (`owedbook/layout.tsx` → `AuthedShell` → Navbar; `(admin)/layout.tsx` → `AuthedShell` → Navbar; `profile/layout.tsx` → Navbar directly; `moose-portal/_shell/MooseShell.tsx:39` a fourth). Every cross-surface click unmounts the old Navbar and mounts a fresh one → fresh `user=null` window → empty nav until the auth round-trip resolves. Dev latency ≈ 0 masks it; staging latency makes it visible and "random."
- **Amplifier (not in the read):** if `getUser()` resolves with no user (network hiccup, token refresh race), `fetchUser` sets `user=null, isLoading=false` → the navbar renders **empty AND shows a "Login" link to a logged-in user** (`:173-177`, `:237-241`). No retry exists.
- Also: Navbar is a client component, so the **server-rendered HTML itself ships an empty nav** on every page load.

## READ B — full-screen overlay → CONFIRMED (with a false comment)

- Overlay renderer: `src/components/layout/NavigationSpinner.tsx:72-80` — **`fixed inset-0 z-40` + `bg-background/70 backdrop-blur-sm`**. Full viewport. The Navbar `<header>` (`Navbar.tsx:119`) has **no z-index or positioning** → the overlay covers navbar + sidebar + everything.
- **The file's own comment lies** (`NavigationSpinner.tsx:14-15`): claims "covers the main column, not the navbar/sidebar." The code contradicts it — `fixed inset-0` is the whole screen.
- Mounted **globally at root** `src/app/layout.tsx:34` — every surface inherits it.
- Trigger plumbing: `LinkPendingProbe` (via `useLinkStatus`) inside every desktop nav link (`Navbar.tsx:144`), every mobile link (`:218`), every sidebar link (`AdminSidebar.tsx:77`); manual `setNavPending(true)` on logo click (`Navbar.tsx:125`) and mobile links (`:209`).
- **Reintroduction: CONFIRMED** per `docs/change_logs/v0.4.1-2026-04-13.md` §1 "Disappearing Navbar — NavigationLoadingProvider Removed." v0.4.1 killed a `fixed inset-0 z-[9999] bg-white` overlay in root layout and moved `loading.tsx` inside portal dirs so chrome stays mounted. Today's mechanism is the same shape in the same place — `z-40` and translucent instead of `z-[9999]` white, but architecturally identical.
- Bonus friction: `MIN_DISPLAY_MS = 400` (`NavigationSpinner.tsx:10`) forces **every** nav click to eat ≥400 ms of overlay even when the route is instant.

## READ C — role source / partial nav loss → CONFIRMED

- `useAuthStore.role` is populated **only inside `login()`** (`src/store/useAuthStore.ts:39-47`), persisted to localStorage (`persist`, name `auth-store`, `:70-72`). Nothing else ever writes it.
- **Yes — `role` can be null while `user` is set:** cleared localStorage / new browser / different device while the Supabase auth cookie still holds a session → `getUser()` resolves a user, but the persisted store rehydrates `role: null` and nothing repopulates it outside the login flow. Result: `isAdmin=false` → **"Admin Portal" (and Moose) silently vanish while OwedBook/Profile render** — the "random single-item loss." Persist-rehydration timing on first paint adds a shorter flavor of the same gap.

## Contradictions / wrinkles vs. the proposed plan

1. **`(admin)/admin-portal/loading.tsx` already exists** (the v0.4.1 placement, still in place). Plan step 1 only needs **new** `owedbook/loading.tsx` + `profile/loading.tsx`. `moose-portal/` and `(public)/` also already have their own. Coverage after overlay deletion is complete.
2. **`AdminSidebar.tsx` must be touched** (probe at `:77`) — it's inside the C4-era DO-NOT-TOUCH list (`AuthedShell`, `Navbar`, `/owedbook`, `/profile`). That freeze was scoped to the Phase 2.2 FFM clusters, now closed; this fix inherently modifies Navbar, AuthedShell (prop pass-through), and those layouts. **Flagging: I treat the freeze as stale for this bug fix — needs your ack.**
3. **`protectPage` returns `user` but discards `role`** (`src/utils/supabase/actions.ts:24-29` — `getUserRole` already computed internally, then thrown away). Step 2 needs the return shape changed to `{ user, role }` — zero extra queries, but **4 layout call sites** update: `owedbook/`, `(admin)/`, `profile/`, `moose-portal/`. No API routes call it.
4. **Navbar's `!user` "Login" branches become dead code** under server-resolved identity (Navbar only mounts inside `protectPage`-gated layouts — an unauthenticated visitor can never see it; `(public)` and `(auth)` use `NavbarHome`/`NavbarLoginReg`). Dead-code hygiene: I'll list them for removal in the plan — your call.
5. Existing tests (`Navbar.mobile`, `Navbar.switcher`) mock `supabase.auth.getUser` + the store selector — props-based Navbar simplifies both mocks; they need updating, which step 3 already covers.
6. `SpinnerLarge` is shared by the existing `loading.tsx` files — it stays; only `NavigationSpinner.tsx`, `useNavSpinner.ts`, `LinkPendingProbe.tsx` die.

---

## 📋 PLAN (PENDING APPROVAL — no execution)

1. **Kill the overlay mechanism** — delete `src/components/layout/NavigationSpinner.tsx`, `src/components/layout/LinkPendingProbe.tsx`, `src/store/useNavSpinner.ts`; strip their imports/usages from root `layout.tsx`, `Navbar.tsx` (probes + both manual `setNavPending` calls), `AdminSidebar.tsx`. — *v0.4.1 doctrine: chrome never gets covered.*
2. **Scoped loading states** — create `src/app/owedbook/loading.tsx` + `src/app/profile/loading.tsx` (content-area spinner via `SpinnerLarge`, mirroring `admin-portal/loading.tsx`). Existing admin-portal / moose / public loading files untouched. — *Only page content spins; navbar + sidebar stay mounted.*
3. **Server-resolve nav identity** — `protectPage` returns `{ user, role }` (role already computed, no new queries); update its 4 layout call sites; `AuthedShell` gains `user`/`role` props forwarded to `<Navbar user role>`; `profile` + `moose` layouts pass props directly. Navbar drops `useState user`/`isLoading`/`fetchUser`, builds `navLinks` from props; keeps a slim `onAuthStateChange` **only** for sign-out reaction. — *No client fetch window → no empty nav, no dev/staging divergence, and the role is server-truth (fixes C).*
4. **Regression tests** — update `Navbar.mobile` + `Navbar.switcher` mocks to props; add invariant test: authed Navbar renders ≥ [OwedBook, Profile] for MEMBER and ≥ [OwedBook, Admin Portal, Profile] for ADMIN — never empty.

**FILES TO MODIFY:** `Navbar.tsx`, `AuthedShell.tsx`, `AdminSidebar.tsx`, root `layout.tsx`, `actions.ts` (protectPage), 4 surface layouts, 2 test files.
**FILES TO CREATE:** `owedbook/loading.tsx`, `profile/loading.tsx`.
**FILES TO DELETE:** `NavigationSpinner.tsx`, `LinkPendingProbe.tsx`, `useNavSpinner.ts`.
**NOT TOUCHED:** `globals.css`, `useAuthStore.ts` (login flow keeps populating it for other consumers), existing `loading.tsx` files, `(public)`/`(auth)` navbars, `/moose-portal` internals beyond its layout's protectPage line.

**ASSUMPTIONS:** (1) C4-era DO-NOT-TOUCH freeze is stale for this fix; (2) `{user, role}` return-shape change to `protectPage` is acceptable; (3) dead `!user` Login branches in Navbar get removed (will list in report).
**RISKS:** any other consumer of `useAuthStore.role`/`isAdmin` still has the stale-persist issue (out of scope here — flag only); test mocks rewrite could surface hidden coupling.

**VERIFY:** `tsc` 0 → full jest green → `npm run build && npm start` **production-mode** manual walk: cross-surface nav ×3 surfaces, navbar/sidebar never vanish, no overlay, content-only spinners.

→ Awaiting approval before proceeding.
