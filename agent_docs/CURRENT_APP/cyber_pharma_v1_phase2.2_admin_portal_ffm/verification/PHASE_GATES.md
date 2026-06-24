# PHASE GATES — Cyber Pharma v1 / Phase 2.2 · Admin Portal Demo Shell FFM

> Approval gate criteria for each cluster. Do not advance past any gate without operator sign-off.
> **Scope:** mock-functional, owner-scoped admin portal that REPLACES `/admin-portal`'s user-CRUD with an in-memory preview of the future StoreLens. NOT StoreLens. No backend, no persistence, no real credentials.
> **Authority:** `_project/APP_BRIEF.md` (gates) > `_project/DATA_CONTRACT.md` (shapes) > `_project/UI_SPEC.md` > `_design/HTML/` mockups > `_design/PNG-S/` renders.

---

## Gate 0 — Discovery / Recon Complete

**Criteria:**
- [ ] `_project/CLAUDE.md` read (3 locked rulings + gating acknowledged)
- [ ] `_project/APP_BRIEF.md` read (scope + the one hard rule + §6/§7 gating acknowledged)
- [ ] `_project/DATA_CONTRACT.md` read (view-models, Zustand shape, 5 service contracts, mock-data requirements)
- [ ] `_project/UI_SPEC.md` read (6 owner-scoped screens, behaviors, states, responsive)
- [ ] `_design/HTML/` six screen mockups scanned; `_design/PNG-S/` + component-states sheet scanned
- [ ] Existing repo swept: OwedBook `AuthedShell`, the Phase-2 service-layer + `/mocks` pattern, the current `/admin-portal` being replaced
- [ ] **`/moose-portal` confirmed present and WILL NOT BE TOUCHED** (operator's env-gated test tool)
- [ ] The 3 locked rulings restated correctly (coral navbar both modes · route takeover removing `/admin-portal/users` · invite-only no-password)
- [ ] Gating restated: no password field, no platform/cross-tenant views, no PHI/claims, no super-admin powers, no real charge — **must not render, not merely disabled**
- [ ] Cluster plan + file tree proposed

**Failure mode:** AI writes code in Discovery, or proposes touching `/moose-portal`. STOP.

**Operator approval required to advance.**

---

## Gate 1 — Types & Contract Complete

**Criteria:**
- [ ] Types match `_project/DATA_CONTRACT.md` §2 view-models verbatim (`CurrentOwner`, `OwnedStore`, `StoreMember`, `BillingLine`, `AuditEntry`, `PharmacySettings`, `ActionResult`)
- [ ] Status vocabularies match §1 (`MemberAccountStatus`, `MemberRole`, `StoreStatus`, `SubscriptionStatus`, `BillingPlan`, `AuditAction`)
- [ ] `jobTitle` present on `StoreMember` and **commented as demo-only / Phase-7 flag** (no real source)
- [ ] Barrel export works; `npx tsc --noEmit` clean
- [ ] No invented fields beyond the contract

**Operator approval required to advance.**

---

## Gate 2 — Service Layer Complete (the Phase-7 swap point)

**Criteria:**
- [ ] The 5 service contracts implemented per DATA_CONTRACT §4: `OwnerStoresService`, `StoreMemberService`, `BillingService`, `SettingsService`, `AuditService`
- [ ] Bodies read/mutate the Zustand store; signatures frozen for Phase-7 swap
- [ ] **HARD INVARIANT — `inviteMember` takes `{ email, role, jobTitle? }` only — NEVER a password.** New row is `invite_pending`.
- [ ] **HARD INVARIANT — `managePayment` / `cancelSubscription` never charge** — mock result/dialog only
- [ ] No method exposes platform/cross-tenant data — everything owner-scoped
- [ ] Every mutator appends an `AuditEntry`
- [ ] Components import services ONLY — never the Zustand store directly, never `/mocks` directly
- [ ] Service tests pass; `npx tsc --noEmit` clean

**Operator approval required to advance.**

---

## Gate 3 — Mock Data Complete

**Criteria:**
- [ ] `/mocks` seed documented as DELETABLE; seeds the Zustand store
- [ ] Seed exercises EVERY rendered state (DATA_CONTRACT §5): ≥4 stores incl. one `active`+`SUB ACTIVE`, one `past_due`, one `suspended`, one zero-member; a toggleable zero-store path for "No stores yet"
- [ ] One store covers all 3 `MemberAccountStatus` (active / invite_pending / suspended)
- [ ] ≥1 `invite_pending` member so the invite screen's pending list renders
- [ ] Billing: one line per store, both `active`(nextChargeDate) + `past_due`(retryDate), both `standard` + `concierge`
- [ ] Audit: ≥1 entry per `AuditAction`
- [ ] Settings: one per store
- [ ] Search seeded so a no-match (e.g. "rav") yields the "No members match" EmptyState
- [ ] Zero imports from `/mocks` in components/app (services only)

**Operator approval required to advance.**

---

## Gate 4 — Components & Screens Complete

**Criteria:**

### Chrome & Tokens (inherited, not redesigned)
- [ ] Reuses OwedBook's `AuthedShell` verbatim (navbar + surface-aware sidebar + mobile slide-over)
- [ ] Sidebar owner-scoped nav: My Stores · Billing · Settings · Audit
- [ ] **Navbar CORAL in BOTH modes** — dark `--navbar` bumped to coral (~`12 88% 58%`)
- [ ] Tokens inherited from OwedBook `globals.css` verbatim — zero new brand tokens
- [ ] Only net-new visual: "Demo · mock data" marker (from existing `--warning`), in CONTENT not navbar
- [ ] `grep` — no numbered Tailwind colors in new components; no `any`

### The 6 Screens (match `_design/HTML/` + `_design/PNG-S/`)
- [ ] **My Stores** `/admin-portal` — owner store card grid, "{n} stores · {k} needs attention", NO platform pulse, NO financial KPI tiles
- [ ] **Store detail** `/admin-portal/stores/[id]` — breadcrumb lock, read-only header, member roster with status-appropriate actions
- [ ] **Invite member** `/admin-portal/stores/[id]/invite` — email + role + Send invite, lock-icon callout, pending list. **NO PASSWORD FIELD**
- [ ] **Billing** `/admin-portal/billing` — per-store rows, Add store (visual), Manage payment / Cancel (visual), "no real charge" caption
- [ ] **Settings** `/admin-portal/settings` — pharmacy info form, in-memory save
- [ ] **Audit log** `/admin-portal/audit` — read-only ledger, no row actions
- [ ] Route takeover done: `/admin-portal/users/*` real CRUD REMOVED (lives only in untouched `/moose-portal`)

### States
- [ ] Loading (skeletons), Empty (no stores / no-match / no pending), Error (destructive toast + revert), Validation — all per the component-states sheet, both themes

**Operator approval required to advance.**

---

## Gate M — Mobile Shell (MANDATORY, same cluster as the screens — NOT deferred)

> Built into Gate 4's cluster, verified here. Deferring responsive to a later cluster is a Rule Zero violation and a hard-stop failure.

**Criteria — verified at 375 / tablet / desktop, BOTH themes, EVERY screen:**
- [ ] Navbar → hamburger below `lg`; sidebar → "Menu" slide-over (backdrop + Esc + scroll-lock)
- [ ] My Stores card grid → 1-col on mobile
- [ ] Store-detail roster rows → stacked cards on mobile
- [ ] Audit table → stacked cards (primary cell first) on mobile
- [ ] Invite / Settings forms → full-width on mobile
- [ ] 375px holds on all 6 screens — no overflow, no clipping, no horizontal scroll
- [ ] "Demo · mock data" marker visible on mobile
- [ ] Operator eyes-on confirmation at 375 + tablet + desktop (test runner cannot verify pixels)

**Failure mode:** any screen ships desktop-only or breaks at 375. STOP — this is the gate that exists because the shell shipped broken twice. No "polish later."

**Operator approval required to advance.**

---

## Gate 5 — Verification Complete

**Criteria:**
- [ ] `rm -rf .next && npx tsc --noEmit` → 0 errors
- [ ] `npm test` → all green (incl. service-invariant tests: invite-no-password, no-charge, owner-scoped)
- [ ] `npm run build` → exits 0
- [ ] `npm run dev` → starts clean

### Gating grep (must all return 0 / confirm absent)
- [ ] No password/credential input anywhere in the admin portal
- [ ] No platform/cross-tenant/"all owners" view
- [ ] No PHI/claims data rendered
- [ ] No super-admin powers, onboarding queue, or restore-admin-for-others
- [ ] No real checkout/charge path
- [ ] No component importing `/mocks` directly (services only)

### Mock-functional smoke walk (both auth states where relevant)
- [ ] Owner logs in → My Stores shows his stores
- [ ] Drill: My Stores → store detail → roster (breadcrumb lock holds)
- [ ] Invite: email + role → Send → `invite_pending` row appears + toast (NO password field anywhere in flow)
- [ ] Suspend / Un-suspend / Resend / Send recovery → pill flips / toast, audit entry appended
- [ ] Billing: renders; Add store → mock card drops; Manage/Cancel → visual only, no charge
- [ ] Settings: edit + Save → in-memory update + toast; refresh resets (by design)
- [ ] Empty states: zero-store path, no-match search, no pending invites
- [ ] Mist ↔ Slate holds across all screens; navbar coral both modes
- [ ] **Gate M re-confirmed at 375 across all 6 screens**

**Failure mode:** any gate red. STOP, fix, re-verify.

**Operator approval required to advance.**

---

## Gate 6 — Retrospective Complete

**Criteria:**
- [ ] `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` (this FFM) exists, all sections filled (What Worked / Stumbled / Should Change / Surprises / Time / Anti-Patterns / New Patterns / Open Questions / Verdict)
- [ ] **Requirements harvested from Coach/Frank captured as Phase-7 inputs** (the demo's real job — every feature they named)
- [ ] Carried Phase-7 flags reconfirmed: `jobTitle` source, real invite/RLS, real Stripe billing, real add-store checkout
- [ ] Structural lessons identified for promotion to central playbook
- [ ] Operator reviewed (not sycophantic — push back if "all great")

**Operator approval marks the FFM run complete.**

---

## Master Sign-Off

Phase 2.2 FFM is complete when:

✅ All gates above passed (incl. **Gate M**)
✅ Operator eyes-on at 375 / tablet / desktop, both themes, all 6 screens
✅ The one hard rule held — no password field anywhere
✅ Gating held — no PHI, no platform views, no real charge, no real credential
✅ Service layer is the clean Phase-7 swap point
✅ `/moose-portal` untouched
✅ Requirements harvested + RECOVERY reflects the closed state

Next step: this becomes **deploy-ready v1 (mock)** — Phase 2.2 done.

🥄 *Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.*
