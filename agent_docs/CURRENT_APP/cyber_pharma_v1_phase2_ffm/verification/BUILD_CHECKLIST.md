# BUILD CHECKLIST — Cyber Pharma v1 / Phase 1 FFM (v2)

> Operator-runnable verification checklist mapped to APP_BRIEF's 15 hard gates.
> Run this before declaring Phase 1 complete. Every box checked = Phase 1 ready.
> **v2:** No deploy verification — separate department owns that.

---

## Pre-Build Checks (Operator Runs Before Activating Claudy)

- [ ] Starter kit cloned from audited template (`nextjs16-supabase-stripe-subscription-2026-v1`)
- [ ] `npm audit` reports 0 vulnerabilities
- [ ] `agent_docs/security/` initialized in repo
- [ ] `agent_docs/security/SECURITY_FINDINGS.md` exists
- [ ] `agent_docs/security/CLEANUP_BACKLOG.md` exists
- [ ] Four skills installed in `.claude/skills/`: frontend-design, skill-creator, webapp-testing, stark-frontend-first
- [ ] FFM (`cyber_pharma_v1_phase1_ffm/`) staged at `agent_docs/CURRENT_APP/`
- [ ] `agent_docs/app_factory/design-system/` exists with `GLOBAL_DESIGN_SYSTEM_HANDBOOK.md` and `THEME_LIBRARY.md`
- [ ] `_design/` filled with style tile, landing artifacts, token files, manifest, phase2-reference assets
- [ ] `_extraction/` filled with TONY_DEMO docs (or operator confirms skipping)
- [ ] `PROJECT_POINTER.md` at starter kit root pointing at the FFM
- [ ] Cyber Pharma Supabase project provisioned, connection strings ready
- [ ] `.env.local` populated with all required vars

---

## Build Verification (After Claudy Completes Each Sub-Phase)

### After Sub-Phase 1 (Types)
- [ ] `npx tsc --noEmit` clean
- [ ] Three type files exist
- [ ] Barrel export works
- [ ] `grep -rn "from '@supabase" src/types/` returns 0

### After Sub-Phase 2 (Services)
- [ ] `src/services/auth.ts` exists
- [ ] `src/services/role.ts` exists
- [ ] Service tests pass: `npm test -- src/services`
- [ ] `grep -rn "from '@supabase" src/components/ src/app/` returns 0
- [ ] `grep -rn "user_metadata.is_" src/` returns 0
- [ ] `grep -rn "user_metadata.role" src/` returns 0

### After Sub-Phase 3 (Mocks)
- [ ] `src/mocks/auth.ts` exists
- [ ] Mock file documented as DELETABLE
- [ ] `npx tsc --noEmit` clean
- [ ] `grep -rn "from '@/mocks" src/components/ src/app/` returns 0
- [ ] No Frank-domain mocks

### After Sub-Phase 4 (Components) — biggest sub-phase

#### Token Foundation
- [ ] `src/app/globals.css` contains designer's locked tokens
- [ ] `:root` block has Mist tokens (e.g., `--primary: 12 93% 64%`)
- [ ] `.dark` block has Slate tokens
- [ ] `tailwind.config.ts` maps tokens (e.g., `primary: "hsl(var(--primary))"`)
- [ ] `darkMode: ["class"]` in tailwind config
- [ ] Saira loaded via `next/font/google` in root layout
- [ ] No CDN `<link>` to Google Fonts anywhere

#### Vestigial String Removal
- [ ] `grep -rn "Moose Next Framework" src/` returns 0
- [ ] `grep -rn "Your Company, Inc" src/` returns 0
- [ ] `grep -rn "next round of funding" src/` returns 0

#### Superadmin Deletion
- [ ] `find src/app -path "*\(superadmin\)*"` returns nothing
- [ ] `find src/app/api -path "*superadmin*"` returns nothing
- [ ] `grep -rn "'superadmin'" src/` returns 0
- [ ] `grep -rn '"superadmin"' src/` returns 0
- [ ] `grep -rn "superadmin-add-user" src/` returns 0

#### Kit Reconciliation
- [ ] `grep -rn "slate-\|red-6\|red-5\|zinc-\|purple-6\|blue-6\|green-6\|gray-" src/components/ src/app/` returns 0
- [ ] `grep -rn "dangerouslySetInnerHTML" src/` returns 0

#### Routes & Pages
- [ ] `src/app/(public)/page.tsx` exists (landing page)
- [ ] `src/app/(public)/access-denied/page.tsx` exists
- [ ] `src/app/(members)/members-portal/page.tsx` exists (placeholder)
- [ ] `src/app/(admin)/admin-portal/page.tsx` exists (placeholder)

#### Layouts
- [ ] `src/app/(members)/layout.tsx` calls `protectPage(['member', 'admin'])`
- [ ] `src/app/(admin)/layout.tsx` calls `protectPage(['admin'])`

#### Error Boundaries
- [ ] `ls src/app/(public)/error.tsx`
- [ ] `ls src/app/(auth)/error.tsx`
- [ ] `ls src/app/(members)/error.tsx`
- [ ] `ls src/app/(admin)/error.tsx`

#### Brand Assets
- [ ] Logo visible on landing page (check browser)
- [ ] Coral CTA buttons visible
- [ ] Saira font visible (check page source)
- [ ] Favicon visible in browser tab

#### Tests
- [ ] `npm test -- src/components` passes
- [ ] `npm test -- src/app` passes

### After Sub-Phase 5 (Verification)

#### Tests
- [ ] `npm test` — all green
- [ ] `npm run test:e2e` — all green
- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run lint` — clean
- [ ] `npm run build` — succeeds (clear `.next` cache if needed: `rm -rf .next && npm run build`)
- [ ] `npm run dev` — starts cleanly

#### Manual Smoke Walkthrough — Public Landing
- [ ] Visit `/` — branded landing page loads
- [ ] Coral CTAs visible, Saira font everywhere
- [ ] "START FREE TRIAL" → `/register` works
- [ ] HIPAA-READY badge present
- [ ] Mobile view at 375px matches designer mobile artifact

#### Manual Smoke Walkthrough — Theme Toggle
- [ ] Click theme toggle → Mist → Slate
- [ ] Coral holds across both modes
- [ ] Card surfaces swap appropriately
- [ ] Text legible in both modes
- [ ] Click again → Slate → Mist

#### Manual Smoke Walkthrough — Auth Flow
- [ ] Click Sign In or visit `/login` → branded login page
- [ ] Register new test member → redirects to `/members-portal`
- [ ] Logout → returns to landing
- [ ] Login as member → `/members-portal` loads with placeholder

#### Manual Smoke Walkthrough — Role Gating
- [ ] As member, visit `/admin-portal` → redirects to `/access-denied`
- [ ] Update role to admin via Supabase Dashboard
- [ ] Login as admin → `/admin-portal` loads with placeholder

#### Manual Smoke Walkthrough — Error Boundary
- [ ] Trigger an error → `error.tsx` renders, NOT raw error
- [ ] "Try again" button present and functional

#### Env Var Fail-Closed Test
- [ ] `mv .env.local .env.local.backup`
- [ ] `npm run dev` → app refuses to start with clear error message
- [ ] Error message names which var is missing
- [ ] `mv .env.local.backup .env.local` (restore)
- [ ] `npm run dev` works again

#### Security Smell Grep (Final Pass)
- [ ] `grep -rn "user_metadata.is_" src/` → 0
- [ ] `grep -rn "superadmin-add-user" src/` → 0
- [ ] `grep -rn "dangerouslySetInnerHTML" src/` → 0
- [ ] `grep -rn "from '@supabase" src/components/ src/app/` → 0
- [ ] `grep -rn "'superadmin'" src/` → 0

#### Style Tile Verification
- [ ] Open `_design/style-tile.html` (if shipped) in browser OR compare PNG side-by-side
- [ ] All token colors match running app's colors
- [ ] Both Mist and Slate modes render correctly

### After Sub-Phase 6 (Retrospective)
- [ ] `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` exists
- [ ] All retrospective sections filled
- [ ] Operator reviewed
- [ ] Structural lessons identified for promotion
- [ ] Phase 2 inputs captured

---

## The 15 Hard Gates (Final Pass)

Walk through `_project/APP_BRIEF.md` §5. Confirm each gate green:

- [ ] **G1** Local build clean
- [ ] **G2** Local dev runs
- [ ] **G3** Login flow works
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
- [ ] **G15** RECOVERY.md updated + retrospective drafted

---

## Final Operator Gut Check

- [ ] "Does the foundation feel solid?"
- [ ] "Does the landing page match the designer's vision?"
- [ ] "Can I demo this to Frank without flinching?"
- [ ] "Am I confident Phase 2 can build OwedBook on this foundation?"

If four yes's → Phase 1 ships.

If any no → identify what's missing. Either fix now or capture as Phase 2 input.

---

## Sign-Off

| Person | Date | Verdict |
|---|---|---|
| Tony Stark | YYYY-MM-DD | [SHIP / NEEDS_REWORK] |
| Claudy | YYYY-MM-DD | Confirms gates verified |

🛡️ **Phase 1 Foundation Skeleton COMPLETE when all boxes checked. No deploys this phase — separate department.**
