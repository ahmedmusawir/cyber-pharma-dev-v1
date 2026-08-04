# ✅ CHECKPOINT 1 COMPLETE — Overlay Mechanism Killed

**Date:** 2026-08-04 15:03 · **Branch:** `navbar-fix-1` · **Verify:** tsc 0 · jest 25 suites / 118 tests, all green

**HEADLINE: The full-screen nav spinner is dead — deleted at the root, stripped from every
link, replaced with v0.4.1-doctrine scoped loading files. Zero residual references, full
triad green, zero test changes needed.**

---

## CHANGES MADE

**DELETED (the mechanism):**
- `src/components/layout/NavigationSpinner.tsx` — the `fixed inset-0 z-40` overlay renderer
- `src/components/layout/LinkPendingProbe.tsx` — the per-Link pending probe
- `src/store/useNavSpinner.ts` — the zustand pending store

**MODIFIED (usage strips only):**
- `src/app/layout.tsx` — removed `<NavigationSpinner />` mount + import from root layout
- `src/components/global/Navbar.tsx` — removed both imports, the `setNavPending` subscription, probe in desktop links, probe in mobile links; logo + mobile link `onClick` handlers collapsed to plain `closeMenu`
- `src/components/layout/AdminSidebar.tsx` — removed probe from sidebar links + import

**CREATED (the replacement):**
- `src/app/owedbook/loading.tsx` — scoped content spinner (SpinnerLarge, mirrors admin-portal's); AuthedShell chrome stays mounted
- `src/app/profile/loading.tsx` — same, Navbar stays mounted

**Grep proof:** `grep -rn "NavigationSpinner|LinkPendingProbe|useNavSpinner" src/` → zero hits.

## THINGS I DIDN'T TOUCH
- `src/components/common/SpinnerLarge.tsx` — shared by all loading.tsx files, stays
- Existing `loading.tsx` in `(admin)/admin-portal/`, `moose-portal/`, `(public)/` — already correctly scoped
- Navbar identity logic (useState/fetchUser/role) — that is Checkpoint 2, untouched here
- `useAuthStore.ts`, `globals.css`, all layouts

## VERIFY
- `npx tsc --noEmit` → **0 errors**
- `npx jest` → **25 suites / 118 tests, all pass** (no test touched — the overlay had zero test coverage, which is itself telling)

## POTENTIAL CONCERNS
- Between checkpoints, cross-surface navigation shows NO transition indicator for the
  navbar identity gap (empty-nav window still exists until Checkpoint 2). Content-area
  spinners work everywhere.
- **KIP (logged, out of scope per ruling):** other `useAuthStore.role` consumers still
  carry the stale-persist risk (role only written by `login()`, persisted to localStorage).

## SUGGESTED COMMIT MESSAGE

```
fix(nav): kill full-screen nav spinner overlay (v0.4.1 doctrine)

Delete NavigationSpinner (fixed inset-0 z-40 in root layout),
LinkPendingProbe, and useNavSpinner store — a reintroduction of the
anti-pattern removed in v0.4.1 ("Disappearing Navbar"). Replace with
scoped loading.tsx inside owedbook/ and profile/ so only page content
spins; navbar + sidebar stay mounted (admin-portal already had one).

tsc 0 / jest 25 suites 118 tests green.
```

→ STOPPED. Awaiting your test + commit before Checkpoint 2.
