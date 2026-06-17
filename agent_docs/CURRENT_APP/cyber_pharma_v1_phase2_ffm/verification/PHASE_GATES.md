# PHASE GATES — Cyber Pharma v1 / Phase 1 FFM (v2)

> Approval gate criteria for each sub-phase. Do not advance past any gate without operator sign-off.
> **v2:** All deploy gates dropped. Local-only verification.

---

## Gate 0 — Discovery Complete

**Criteria:**
- [ ] Module root CLAUDE.md read
- [ ] `_project/CLAUDE.md` read (forbidden zones acknowledged: one app, no deploy, no superadmin)
- [ ] `_project/APP_BRIEF.md` read (scope acknowledged)
- [ ] `_project/DATA_CONTRACT.md` read (data shapes acknowledged)
- [ ] `_project/UI_SPEC.md` read (locked v1 tokens, single app, landing page acknowledged)
- [ ] Starter kit's root `CLAUDE.md` read
- [ ] `package.json` inspected — Tailwind 3.4.1 confirmed
- [ ] `.claude/skills/` verified (4 skills present)
- [ ] `_design/` content scanned (tokens, manifest, style tile, landing artifacts, phase2-reference clearly labeled)
- [ ] `_extraction/` content scanned (TONY_DEMO docs)
- [ ] Structured Discovery summary produced
- [ ] Three most critical forbidden zones named correctly (deploy / superadmin / OwedBook from phase2-reference)
- [ ] Sub-Phase 1 plan proposed

**Failure mode:** AI tries to write code in Discovery. STOP.

**Operator approval required to advance.**

---

## Gate 1 — Types & Contract Complete

**Criteria:**
- [ ] `/src/types/User.ts` exists matching DATA_CONTRACT §4
- [ ] `/src/types/UserRole.ts` exists with `AppRole` enum (still includes 'superadmin' as enum value — harmless data)
- [ ] `/src/types/AuthenticatedUser.ts` exists (composite type)
- [ ] `/src/types/index.ts` barrel exports all
- [ ] `npx tsc --noEmit` clean
- [ ] Zero Supabase imports in `/src/types/`
- [ ] No invented fields

**Operator approval required to advance.**

---

## Gate 2 — Service Layer Complete

**Criteria:**
- [ ] `/src/services/auth.ts` implements `AuthService` contract
- [ ] `/src/services/role.ts` implements `RoleService` contract
- [ ] `roleService.resolveRole()` reads ONLY from `user_roles` table
- [ ] Zero reads from `user_metadata`
- [ ] `protectPage()` uses `roleService`
- [ ] Service tests pass
- [ ] Zero Supabase imports in `/src/components/` and `/src/app/`
- [ ] Starter kit's `/src/utils/supabase/*` unchanged

**Operator approval required to advance.**

---

## Gate 3 — Mock Data Complete

**Criteria:**
- [ ] `/src/mocks/auth.ts` exists with three role fixtures + null
- [ ] All fixtures type-conform to `AuthenticatedUser`
- [ ] File documented as DELETABLE
- [ ] Zero imports from `/src/mocks/` in components/app
- [ ] Service tests use shared fixtures
- [ ] Zero Frank-domain mocks

**Operator approval required to advance.**

---

## Gate 4 — Components Complete

**Criteria:**

### Token Foundation
- [ ] `_design/tokens/globals.css` content installed in app's `src/app/globals.css` verbatim
- [ ] `tailwind.config.ts` includes designer's mapping (semantic utilities → CSS variables)
- [ ] Saira loaded via `next/font/google` in root layout
- [ ] Saira CDN `<link>` NOT used anywhere
- [ ] `--radius: 0` confirmed (Metro flat applies globally)

### Vestigial String Removal
- [ ] No "Moose Next Framework" anywhere (grep verified)
- [ ] No "Your Company, Inc." anywhere (grep verified)
- [ ] No "Announcing our next round of funding" anywhere (grep verified)

### Superadmin Deletion
- [ ] `src/app/(superadmin)/` route group GONE (whole folder)
- [ ] `src/app/api/superadmin/` API routes GONE (whole folder)
- [ ] `grep -rn "'superadmin'" src/` returns 0 (no superadmin in protectPage calls)
- [ ] `grep -rn "superadmin-add-user" src/` returns 0

### Kit Reconciliation
- [ ] `grep -rn "slate-\|red-6\|zinc-\|purple-6\|blue-6\|green-6\|gray-" src/components/ src/app/` returns 0
- [ ] All component colors come from semantic token utilities

### Pages
- [ ] `src/app/(public)/page.tsx` — branded landing page matches `_design/landing-page-desktop.png`
- [ ] Landing page mobile matches `_design/landing-page-mobile.png` (375px target)
- [ ] `src/app/(auth)/login/page.tsx` — branded (logic preserved)
- [ ] `src/app/(auth)/register/page.tsx` — branded (logic preserved)
- [ ] `src/app/(auth)/forgot-password/page.tsx` — branded (if starter kit ships it)
- [ ] `src/app/(members)/members-portal/page.tsx` — "Coming in Phase 2" placeholder
- [ ] `src/app/(admin)/admin-portal/page.tsx` — "Coming in Phase 2" placeholder
- [ ] `src/app/(public)/access-denied/page.tsx` — access-denied page

### Layouts
- [ ] `src/app/(members)/layout.tsx` uses `protectPage(['member', 'admin'])` — NO 'superadmin'
- [ ] `src/app/(admin)/layout.tsx` uses `protectPage(['admin'])` — NO 'superadmin'

### Error Boundaries
- [ ] `src/app/(public)/error.tsx` exists
- [ ] `src/app/(auth)/error.tsx` exists
- [ ] `src/app/(members)/error.tsx` exists
- [ ] `src/app/(admin)/error.tsx` exists
- [ ] (No `(superadmin)/error.tsx` — that group is gone)

### Brand Assets
- [ ] Logo files in `/public/brand/`
- [ ] Favicon updated
- [ ] Root metadata: `title: 'Cyber Pharma'`

### Tests
- [ ] Component tests for LoginForm, RegisterForm, placeholder pages, AccessDenied
- [ ] All tests pass

### Theme Toggle
- [ ] Theme toggle wired to Mist (light) ↔ Slate (dark)
- [ ] Coral primary holds across both modes
- [ ] No visual regression in either mode

**Failure mode:** Vestigial strings remain. Superadmin not deleted. Kit not reconciled. Landing page off from designer artifact.

**Operator approval required to advance.**

---

## Gate 5 — Verification Complete

**Criteria — All 15 Hard Gates from APP_BRIEF §5:**

- [ ] **G1** Local build clean (`npm run build` exits 0)
- [ ] **G2** Local dev runs (`npm run dev` works)
- [ ] **G3** Login flow works locally
- [ ] **G4** Role gates hold
- [ ] **G5** Env var fail-closed proven
- [ ] **G6** No `user_metadata` role check anywhere
- [ ] **G7** No `superadmin-add-user` route
- [ ] **G8** No `(superadmin)` route group
- [ ] **G9** Error boundaries on all 4 route groups
- [ ] **G10** No numbered Tailwind colors in components
- [ ] **G11** v1 tokens installed correctly
- [ ] **G12** Theme toggle works (Mist ↔ Slate)
- [ ] **G13** Landing page built per designer's artifact
- [ ] **G14** All Phase 1 tests pass
- [ ] **G15** RECOVERY.md updated (retrospective gate is next sub-phase)

**Failure mode:** Any gate red. STOP. Fix and re-verify before advancing.

**Operator approval required to advance.**

---

## Gate 6 — Retrospective Complete

**Criteria:**
- [ ] `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` exists
- [ ] All sections filled (What Worked, What Stumbled, What Should Change, Surprises, Time Estimates, Anti-Patterns Observed, New Patterns, Open Questions, Verdict)
- [ ] Time estimates vs actual recorded
- [ ] Structural lessons identified (apply to all future FFM runs)
- [ ] Project-specific lessons captured
- [ ] Phase 2-relevant inputs captured (OwedBook prep work)
- [ ] Operator reviewed and edited

**Failure mode:** Sycophantic ("everything went great"). Skipped sections. Push back to enrich.

**Operator approval marks FFM run complete.**

---

## Master Sign-Off

Phase 1 FFM is complete when:

✅ All six gates above passed
✅ Operator's gut check: "yes, ready for Phase 2"
✅ Local build + dev clean
✅ Theme toggle works
✅ Landing page matches designer's artifact
✅ Lessons captured for next FFM authoring
✅ RECOVERY.md reflects the closed state

Next step: archive this FFM, author `cyber_pharma_v1_phase2_ffm`.

**No deploy verification needed — separate department owns that in a later phase.**
