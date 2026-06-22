# Playbook 06 — Sub-Phase 5: Verification

> **Goal:** Verify all 15 hard gates from APP_BRIEF pass. Local only — no deploys this phase.
> **AI time:** 1-2 hours | **Review time:** 30 min
> **Code produced:** Test fixes if anything fails

---

## Verification Is Different From Testing

This sub-phase doesn't write new code — it verifies what was built actually works:

- All written tests pass
- Build runs clean
- Local dev runs clean
- Manual smoke checks pass
- Hard gates from APP_BRIEF §5 all green

**No staging deploys, no Cloud Run, no CNAME work** — separate department handles that in a later phase.

If any gate fails, fix it and re-verify. Don't advance to Retrospective until all 15 gates pass.

---

## Verification Steps

### Step 1 — Test Suite

```bash
npm test              # Vitest unit + integration tests
npm run test:e2e      # Playwright E2E tests (if configured)
```

Expected:
- ~5-10 unit tests pass
- ~3-5 integration tests pass
- ~5-8 E2E tests pass (login, logout, role-gate, theme toggle, error boundary)

If any fail, fix immediately. Do not advance.

### Step 2 — Type Check

```bash
npx tsc --noEmit
```

Must exit clean.

### Step 3 — Lint Check

```bash
npm run lint
```

Should pass. Address any new violations introduced in this FFM's work.

### Step 4 — Build Check

```bash
npm run build
```

Must succeed. Common gotcha: `next start` errors on `routesManifest.dataRoutes` if `.next` cache is stale. If you see this:

```bash
rm -rf .next
npm run build
```

(This is the G-NPM-2 anti-pattern from the stark-repo-security playbook.)

### Step 5 — Local Dev Check

```bash
npm run dev
```

Server starts. App responds at `localhost:3000`. No console errors.

### Step 6 — Manual Smoke Walkthrough

Operator runs this checklist locally:

#### Public landing page
- [ ] Visit `/` — landing page loads with v1 brand applied
- [ ] Coral color visible on CTAs (`bg-primary`)
- [ ] Saira font visible everywhere
- [ ] Click "START FREE TRIAL" → goes to `/register`
- [ ] HIPAA-READY badge present
- [ ] Mobile view (375px) — hero stacks vertically, CTAs full-width

#### Theme toggle
- [ ] Click theme toggle → page switches from Mist (light) to Slate (dark)
- [ ] Coral color holds (same on both modes)
- [ ] Card backgrounds swap appropriately
- [ ] Text remains legible in both modes
- [ ] Click again → back to Mist

#### Auth flow
- [ ] Click "Sign In" or visit `/login` → login page loads, branded
- [ ] Register a new user (`member@test.cyberpharma.local` / password) → redirects to `/members-portal`
- [ ] `/members-portal` shows "Coming in Phase 2" placeholder
- [ ] Logout → returns to landing page or `/login`
- [ ] Login as member → `/members-portal` loads

#### Role gating
- [ ] As member, visit `/admin-portal` → redirects to `/access-denied`
- [ ] Logout. Update test user's role to `admin` via Supabase Dashboard:
  ```sql
  UPDATE user_roles SET role = 'admin' WHERE user_id = '<user_id>';
  ```
- [ ] Login as admin → `/admin-portal` loads with placeholder

#### Error boundary
- [ ] Trigger an error manually (e.g., navigate to a route that throws) → `error.tsx` renders, NOT raw error
- [ ] "Try again" button is present and functional

#### Style tile verification
- [ ] Open `_design/style-tile.html` in browser (if shipped) or compare PNG against the running app
- [ ] All tokens visible match the running app's colors

#### Mobile shell — Rule Zero (Gate M, every UI-bearing cluster)
- [ ] At 375px AND tablet: navbar collapses to a hamburger; surface switcher + account/theme all reachable
- [ ] The sidebar / app-rail (filter rail on /owedbook, nav on /admin-portal) is reachable via a hamburger + slide-over — NOT `hidden md:block` with no trigger
- [ ] No horizontal overflow at 375px; touch targets ≥ 44px
- [ ] Both themes (Mist/Slate) hold at mobile + tablet
- [ ] FAIL if any control is desktop-only or responsive was "deferred to a later cluster"

### Step 7 — Env Var Fail-Closed Verification

Critical security test. Operator does this:

```bash
# Temporarily break the env
mv .env.local .env.local.backup

# Try to start the app
npm run dev
```

Expected: app refuses to start. Clean error message naming the missing var(s). Exit code non-zero.

If app starts despite missing env, this is a security regression. STOP and fix the env-check logic.

Restore env after test:
```bash
mv .env.local.backup .env.local
npm run dev  # should work again
```

### Step 8 — Security Smell Grep Checks

```bash
# All should return 0 matches
grep -rn "user_metadata.is_" src/ | grep -v node_modules
grep -rn "user_metadata.role" src/ | grep -v node_modules
grep -rn "superadmin-add-user" src/ | grep -v node_modules
grep -rn "dangerouslySetInnerHTML" src/ | grep -v node_modules
grep -rn "from '@supabase" src/components/ src/app/ | grep -v node_modules
```

All zero. If any match, fix immediately.

### Step 9 — Superadmin Deletion Verification

```bash
# All should return nothing
find src/app -path "*\(superadmin\)*"
find src/app/api -path "*superadmin*"
grep -rn "'superadmin'" src/ | grep -v node_modules
grep -rn '"superadmin"' src/ | grep -v node_modules
```

`(superadmin)` route group GONE. All `superadmin` references in `protectPage` calls and elsewhere GONE.

### Step 10 — Kit Reconciliation Verification

```bash
# All should return 0 matches in src/components/ and src/app/
grep -rn "slate-\|red-6\|red-5\|zinc-\|purple-6\|blue-6\|green-6\|gray-" src/components/ src/app/ | grep -v node_modules
```

Zero hardcoded numbered Tailwind colors in components. All semantic.

### Step 11 — Hard Gates Checklist

Walk through APP_BRIEF §5 (the 15 hard gates):

- [ ] **G1** Local build clean (`npm run build` exits 0)
- [ ] **G2** Local dev runs (`npm run dev` works)
- [ ] **G3** Login flow works locally
- [ ] **G4** Role gates hold
- [ ] **G5** Env var fail-closed proven (Step 7)
- [ ] **G6** No `user_metadata` role check anywhere (Step 8)
- [ ] **G7** No `superadmin-add-user` route (Step 8)
- [ ] **G8** No `(superadmin)` route group (Step 9)
- [ ] **G9** Error boundaries on all 4 route groups
- [ ] **G10** No numbered Tailwind colors in components (Step 10)
- [ ] **G11** v1 tokens installed correctly
- [ ] **G12** Theme toggle works (Mist ↔ Slate)
- [ ] **G13** Landing page built per designer's artifact
- [ ] **G14** All Phase 1 tests pass (Step 1)
- [ ] **G15** RECOVERY.md updated + retrospective drafted

If any gate fails, fix and re-verify. G15 is the next sub-phase's job.

### Step 12 — Update RECOVERY.md

```markdown
## Last Action

**Date:** YYYY-MM-DD
**Phase:** Cyber Pharma v1 Phase 1 Foundation Skeleton COMPLETE
**Status:** All 15 hard gates green. Local build + dev clean. Smoke walkthrough passed.
**Next:** Phase 2 FFM authoring (cyber_pharma_v1_phase2_ffm) — OwedBook screens
**Open items:** None blocking Phase 2. See RUN_001_LESSONS.md for retrospective notes.
**Deploy status:** Out of scope for this FFM. Separate department handles deploys later.
```

### Step 13 — Produce Completion Summary

```
## Sub-Phase 5 Complete

### What I Verified
- All tests pass (unit, integration, E2E)
- Type check clean
- Lint clean
- Build clean
- Local dev runs clean
- Manual smoke walkthrough (landing, auth, role-gates, theme toggle, error boundary)
- Env var fail-closed proven
- Security smell greps all zero
- Superadmin deletion verified (route group + API gone)
- Kit reconciliation verified (no numbered colors in components)
- All 15 hard gates from APP_BRIEF green

### Failed Verifications That I Fixed
- [list any items that needed fixing during verification]

### Concerns / Open Questions
- (none, or list — these become retrospective items)

### Proposed Sub-Phase 6 Plan
- Draft RUN_001_LESSONS.md retrospective
- Capture what worked, what stumbled, what to improve next FFM
- Lessons feed Phase 2 FFM authoring

### Awaiting Approval
Ready to proceed to Sub-Phase 6 (Retrospective)?
Type "approved" or specify changes.
```

### Step 14 — Stop

Wait for operator approval.

---

## Verification Gate

Operator confirms:
- [ ] All 15 hard gates green (walked through)
- [ ] Local build + dev clean
- [ ] Manual smoke walkthrough complete
- [ ] No security regressions
- [ ] RECOVERY.md updated

If any fail, fix and re-verify before advancing.

---

## Common Stumbles

- AI declares "tests pass" without actually running them → STOP. Show the output.
- AI tries to deploy to Cloud Run → STOP. Out of scope for this FFM.
- AI skips the env var fail-closed test → mandatory. Do it.
- AI fixes a security smell silently → log it in the security findings ledger (Path C of stark-repo-security).
- AI advances to retrospective with red gates → STOP. All gates must be green first.
- AI declares "done" without RECOVERY.md update → must update before declaring complete.
- AI forgets to verify `_design/phase2-reference/` artifacts WEREN'T built → check `/admin-portal` and `/members-portal` show ONLY placeholders, not OwedBook.

---

## Anti-Patterns

```
# ❌ WRONG — declaring done without verification
"All tests pass" (without showing output)

# ❌ WRONG — deploying when out of scope
$ gcloud run deploy ...  # NO. Separate department.

# ❌ WRONG — fixing security smell silently
Just removing the user_metadata.is_super_admin line without logging it

# ✅ CORRECT — verified done
$ npm test
  ✓ all tests passing (15/15)
$ npm run build
  ✓ build successful
$ npm run dev
  ✓ server started on localhost:3000

All 15 hard gates verified green. Ready for retrospective.
```
