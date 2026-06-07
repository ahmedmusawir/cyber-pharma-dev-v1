# ⚠️ DO NOT BUILD — Phase 2 Reference Only ⚠️

> **READ THIS FIRST IF YOU ARE CLAUDY.**

---

## What This Folder Is

This folder contains **finished, gorgeous, locked design artifacts for Phase 2 OwedBook screens.**

They are here for visual context only.

## What This Folder Is NOT

This folder is **NOT** a Phase 1 build target.

If you are Claudy reading this in Sub-Phase 4 (Components), and you see:
- `owedbook-metro-warm-mist.png`
- `owedbook-metro-warm-slate.png`
- `owedbook-federal-dollars.png`
- `owedbook-mobile-mist.png`
- `owedbook-mobile-slate.png`

You may be tempted to build them. **STOP.** These screens belong to Phase 2.

---

## Why You Cannot Build Them In Phase 1

The OwedBook screen requires three Kit Improvement Proposals (KIPs) that don't exist in the kit yet:

1. **DataTable** — sortable, sticky-header, mobile card-reflow data table
2. **MultiSelect** — searchable, multi-check, "All" handling PBM filter
3. **EmptyState** — icon + headline + sub-copy + action for filtered-zero states

These KIPs are built **first** in Phase 2, before any OwedBook screen. Per `_design/COMPONENT_MANIFEST.md` §4.

Phase 1's job is the foundation: tokens, brand, fonts, role gates, error boundaries, landing page. Phase 1 explicitly does NOT build:
- ❌ OwedBook screens
- ❌ KPI tiles
- ❌ Tabs UI
- ❌ Filter sidebar / drawer
- ❌ Data tables

If you find yourself reaching for these artifacts during Sub-Phase 4 component work, you've drifted out of scope.

---

## What These Artifacts Are For

- **Visual ground truth for Phase 2** — when the Phase 2 FFM is authored, these become the build targets
- **Phase 1 reassurance** — operator can see what Phase 1's foundation work is enabling
- **Token validation** — the OwedBook screens prove the tokens land correctly on a real dense interface; verifying the style tile matches these screens is good QC

---

## What To Do Instead

In Sub-Phase 4 (Components), Claudy builds:

1. Install `_design/tokens/globals.css` into `src/app/globals.css`
2. Merge `_design/tokens/tailwind.config.snippet.ts` into `tailwind.config.ts`
3. Wire Saira via `next/font/google`
4. Migrate kit's hardcoded colors onto semantic tokens (kit reconciliation)
5. Build `/` landing page per `_design/landing-page-desktop.png` (and mobile)
6. Apply tokens to inherited `/login`, `/register`, `/forgot-password`
7. Build placeholder `/admin-portal` and `/members-portal` pages
8. Build `/access-denied` page
9. Verify error boundaries on all remaining route groups
10. Delete `(superadmin)` route group entirely

Phase 2 builds the OwedBook.

---

## If You Still Want To Build Something

Open `_design/landing-page-desktop.png`. That's your Phase 1 build target. It's also gorgeous. Build that. Match the design.

---

🛡️ **Phase 1 = foundation. Phase 2 = OwedBook. Don't cross the streams.**
