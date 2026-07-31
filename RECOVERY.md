# Recovery State

**Last action (2026-07-31 12:15): CYBER-PHARMA DEPLOYED — LIVE at https://cyber-pharma.cyberizedev.com.** Execute phases 0–6 all EVIDENCE-closed: init ×2 (binding-propagation 400 recovered, ledger 13) → secret v2 real → IAM verified → deploy `9a7ca6ef` 3m51s SUCCESS with **v3 Staging Rule passive proof confirmed** ("Setting IAM Policy...done") → revision 00001-gq6 → SSL provisioned in 14 min → curl 200 over custom domain → invoker allUsers verified. **Completion: 6/6 — ALL CRITERIA EVIDENCE (operator custom-domain confirm 12:29). First v3 field test PASSED.** Retrospective + 11-item v3.1 backlog: `agent_docs/RESPONSES/response_2026-07-31_110500_v3-field-test-retrospective.md`. Completion summary: `..._121549_phase7-completion-summary.md`. Ledger: 14 rows. Branch `deploy-ffm-1` (docs uncommitted — operator commits). Sessions: `session_2026-07-{23,24,31}.md`.

**Prior action (2026-07-23 18:25): DEPLOY PACKAGE GENERATED — cyber-pharma → Cloud Run (Path B, v3 skill first field test).** Staging Rule gate CLOSED with EVIDENCE (compute SA `524380376459-compute@` holds run.admin). 5 files at repo root: `Dockerfile` / `cloudbuild.yaml` (Template 2B + all-5 --set-env-vars, required by instrumentation.ts dynamic env check) / `deploy.sh` (domain `cyber-pharma.cyberizedev.com` baked, Two-Deploy WAIVED, **2 REPLACE_MEs pending operator**) / `init-app.sh` / `DEPLOYMENT_CHECKLIST.md`. Branch: `deploy-ffm-1`. `next.config.js` got `output: "standalone"` (approved, build-proven). 5 skill issues ledgered (`agent_docs/SKILL_ISSUES_LEDGER_cloud_deployment.md`). **Pending:** operator fills REPLACE_MEs from `.env.local` → engage `next-deploy-execute` (init-app.sh → secret value → deploy → DNS/SSL → invoker → 6/6). Operator commits. Artifacts: `agent_docs/RESPONSES/response_2026-07-23_*` (7 files). Session: `agent_docs/SESSIONS/session_2026-07-23.md`.

**Prior action (2026-07-23 15:03):** **sharp vuln fix COMPLETE** (GHSA-f88m-g3jw-g9cj). `"sharp": "^0.35.3"` added to existing `overrides` in `package.json`; lockfile updated (sharp 0.35.3 under next; next resolved 16.2.6→16.2.11 in-range via plain `npm audit fix` — old 16.2.6 pin itself had 9 HIGH advisories; `next` spec `^16.2.1` untouched; NO `--force`). Note: the literal delete-lockfile path broke the build (radix-slot 1.3.1 float → RSC `createContext` crash) — recovered via lockfile restore from git; radix pins unchanged (slot @1.1.0). **Triad: tsc 0 / jest 25·118 / build 22 routes / audit 0 vulns.** Artifact: `agent_docs/RESPONSES/response_2026-07-23_150334_sharp-vuln-fix-result.md`. Session: `agent_docs/SESSIONS/session_2026-07-23.md`. **Pending: operator commit** (`package.json` + `package-lock.json` + docs), then deployment work (`_SKILLS/stark-cloud-deploy-skills/` staged untracked).

> **Updated 2026-07-13** — **Phase 2 COMPLETE (2.1 OwedBook + 2.2 Admin Portal Demo Shell)**; all June housekeeping (ESLint, nav spinner, members-portal removal, `/register` CTA fix, package rename) **committed**. 📒 **Master reference: `phase2.md` at repo root — read RECOVERY + `phase2.md` + the latest session log and you're fully up to date.** Current working branch: **`repo-cleaner-v1`** (clean tree at session start; operator owns git).

**Last action (2026-07-14):** **stark-kit-residue-cleaner run COMPLETE** (v0.9.2, first activation). Clean shed of **12 kit-residue orphan files** under exact-count gates — all green, zero deviations. **New baseline: tsc 0 / jest 25 suites · 118 tests / build green (22 routes).** Artifacts: `agent_docs/RESPONSES/response_2026-07-14_{105843_kitshed-trace, 115910_kitshed-plan, 120200_kitshed-result}.md`. Rulings + KEEP ledger: `agent_docs/KEEP_MANIFEST.md`. Session: `agent_docs/SESSIONS/session_2026-07-13.md`.

**Shed detail:** deleted `types/{UserRole,AuthSnapshot,User}.ts` · `mocks/auth.ts` · `utils/supabase/fetchUserData.ts` · `components/common/{Page,Box,Row,Container,BackButton}.tsx` · `components/ui/{table,pagination}.tsx`. Modified: `utils/supabase/admin.ts` (blessed-infra marker), `package.json` (dead `test:integration` script removed). No route/page/rendered component touched — the big kit cascades were already shed incrementally in June; this was a 12-file tail cleanup.

**Pending:** Operator to **commit** the working tree on `repo-cleaner-v1` (12 del + 3 mod + 3 new docs). Claude does not commit.

**Next step (post-commit, later phases):** (1) fold new anti-pattern **A-1b** (relative-import trace gap) into the skill's `references/ANTI_PATTERNS.md` — flagged, not auto-edited; (2) **Phase 3:** reconcile the two service-role clients (`utils/supabase/admin.ts` vs `/moose-portal`'s own); (3) replace the kit marketing landing with a real Cyber Pharma landing (KEEP placeholder, pre-staging design task — see KEEP_MANIFEST Q2 ledger).

## C4b surfaced decisions (K7 — resolved in favor of contract/rulings; Phase-7 revisit)
- **Invite field = "Job title"** (Pharmacist/Technician/Staff → `jobTitle`), NOT the mockup's "Role"; `role` hardcoded `'member'`. NO password, NO permission dropdown.
- **Billing shows SEED amounts/plans** ($49 standard / $199 concierge), not the mockup's uniform "$79/Standard". V1 pricing = a client business decision, NOT locked by this demo.
- **Audit Result = Done/Failed** from the enum (mockup's "Sent" is cosmetic).
- **Settings is one page showing `stores[0]`'s settings** (nav is singular but data is per-store) — V1 simplification; Phase 7 = store picker or settings-from-detail.
- **No search box in V1 screens** — services keep `search` params (Phase-7 ready); mockups show no search UI.
- **Add store on Billing** adds a store card but no billing line (service adds store only) — consistent with "no real charge".

---

## Phase 2.2 cluster ledger (branch `phase2.2-admin-portal-1`, no upstream)
- **C0** recon ✅ · **C1** types ✅ `455e6fd` · **C2** store+services ✅ `6710acb` · **C3** seed ✅ `69afcc7` · **C4a** chrome+takeover ✅ `677d51b` · **C4b** 6 screens+Gate M+tests ✅ `fd816a1` · **C4-fix** gutter + add-store harvest form + form-centering + nav dismiss ✅ `7cd9b02` (docs) · **C5** verification + gating greps + operator smoke walk ✅ **Gate 5 signed off** · **C6** retrospective + Phase-7 harvest ✅ **Gate 6 signed off — FFM COMPLETE** (navbar regression fix + retro draft uncommitted, commit teed up). Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).
- Last triad @ C6: **tsc 0 / jest 117·25 / build 0**.

## Data spine (done, frozen — Phase-7 swap point)
- `src/types/adminDemo.ts` — 7 view-models + 6 status vocabs + `AdminDemoState` (DATA_CONTRACT §1–3).
- `src/store/useAdminDemoStore.ts` — plain Zustand (NO persist; refresh resets), service-only mutators + `reset()`.
- `src/services/adminDemo.ts` — 5 services (OwnerStores/StoreMember/Billing/Settings/Audit) via vanilla `getState()`, `BACKEND_SWAP_NOTES (Phase 7)` JSDoc.
- `src/mocks/adminDemo.ts` — `makeAdminDemoSeed({empty?})` (DELETABLE), 4 stores covering every state, const `ADMIN_DEMO_NO_STORES`.
- Tests: `__tests__/services/adminDemo.test.ts` (14, incl. compile-time `@ts-expect-error` no-password) · `__tests__/mocks/adminDemo.seed.test.ts` (9).
- **C2-test anchors — keep stable:** `store-1` + `member-1`(active)/`member-2`(invite_pending)/`member-3`(suspended) + store-1 settings/billing.

## LOCKED rulings (carry into C4)
- **Invite form (V1):** Email + Job title + Send invite. NO password field, NO access/permission dropdown. `inviteMember` role hardcoded `'member'` at the form call site (service signature frozen, keeps `role` param). Job title = Pharmacist/Technician/Staff (demo-only `jobTitle`, flagged). One admin = owner (onboarding); 2nd admins only via MissionControl. (Confirmed w/ the client + the domain expert — see memory `admin-v1-single-admin-model`.)
- **Navbar:** identical `--navbar: 12 83% 47%` BOTH modes — **no change**; `globals.css` untouched. (FFM doc's "bump to 12 88% 58%" is stale.)
- **Billing:** visual-only, NO audit entry (K7 — no AuditAction vocab covers billing).
- **Seed fix DONE in C4b:** `member-5` `role:'admin'`→`'member'` in `src/mocks/adminDemo.ts` (V1: no non-owner admin; invisible since role isn't rendered).

## DO NOT TOUCH
`AuthedShell`, `Navbar`, `globals.css`, `/owedbook`, `/profile`, **`/moose-portal`**, `(members)`; C1–C3 files frozen except the one member-5 seed fix.

## Recon-locked facts (authoritative)
- Stack: Next 16.2.1 / React 19.2.4 / TS strict / Tailwind 3.4.1 (HSL+config) / **Jest**. `proxy.ts` not `middleware.ts`.
- Auth: `useAuthStore` (client) + `supabase.auth.getUser()` (server); `protectPage([AppRole.X], { unauthorizedRedirect })` from `@/utils/supabase/actions`; `(admin)/layout.tsx` already gates `[AppRole.ADMIN]` → bounce `/owedbook`. AppRole from `@/utils/app-role`.
- Reusables for C4: `AuthedShell`/`AdminSidebar`(surface-aware)/`Navbar` verbatim; `DataTable` (desktop→mobile cards → use for Audit), `EmptyState`, `StatusChip` (pill pattern), shadcn ui present, `useToast`, skeleton = `bg-muted animate-pulse`.
- `.env.local` at repo root — DO NOT read or commit.

## Spec authority (Phase 2.2)
FFM at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_admin_portal_ffm/`. Order: `_project/CLAUDE.md` (rulings) > `_project/APP_BRIEF.md` (gates + one hard rule) > `_project/DATA_CONTRACT.md` (shapes) > `_project/UI_SPEC.md` > `_design/HTML/` mockups > `_design/PNG-S/`. Gates: `verification/PHASE_GATES.md` (Gate 0–6 + Gate M). Cluster map: `playbook/00-OVERVIEW.md`.
