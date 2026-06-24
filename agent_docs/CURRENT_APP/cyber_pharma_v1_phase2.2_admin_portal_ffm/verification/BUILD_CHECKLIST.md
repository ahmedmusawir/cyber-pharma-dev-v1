# BUILD CHECKLIST — Cyber Pharma v1 / Phase 2.2 · Admin Portal Demo Shell FFM

> Operator-runnable verification checklist for the mock-functional admin portal demo shell.
> Run before declaring Phase 2.2 complete. Every box checked = deploy-ready v1 (mock).
> **Scope:** in-memory, owner-scoped, no backend, no real credentials. Replaces `/admin-portal` user-CRUD.

---

## Pre-Build Checks (Operator Runs Before Activating Claudy)

- [ ] On branch `phase2.2-admin-portal-*`
- [ ] Phase 2.1 (OwedBook) committed + pushed (clean baseline)
- [ ] `/moose-portal` exists + env-gated (the preserved real user-CRUD — must stay untouched)
- [ ] FFM staged at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_ffm/`
- [ ] `_project/` holds CLAUDE.md + APP_BRIEF.md + DATA_CONTRACT.md + UI_SPEC.md
- [ ] `_design/HTML/` (6 screen mockups) + `_design/PNG-S/` (renders) + `_design/DOCS/` (states sheet + deltas) present
- [ ] `skills/stark-frontend-first/` staged (service-layer enforcement)
- [ ] `playbook/` + `verification/` present (THIS Phase-2.2 set, with Gate M — not the Phase-1 copies)
- [ ] `.env.local` carries `NEXT_PUBLIC_ENABLE_MOOSE_PORTAL` (so moose-portal stays reachable for seeding)

---

## After Cluster: Types
- [ ] View-models match DATA_CONTRACT §2 exactly
- [ ] Status vocabularies match §1
- [ ] `jobTitle` commented demo-only / Phase-7 flag
- [ ] `npx tsc --noEmit` clean · barrel export works · no invented fields

## After Cluster: Services
- [ ] 5 service contracts implemented (Owner/Member/Billing/Settings/Audit)
- [ ] `grep` — `inviteMember` signature has NO password param
- [ ] `managePayment`/`cancelSubscription` return mock only (no charge)
- [ ] Every mutator appends an AuditEntry
- [ ] `grep -rn "from '@/mocks" src/components/ src/app/` → 0
- [ ] Components call services only (not the store directly)
- [ ] Service tests pass

## After Cluster: Mocks
- [ ] `/mocks` documented DELETABLE
- [ ] Seed triggers every state (4+ stores, all member statuses, pending invite, billing active+past_due, audit per action, settings per store, a no-match search)
- [ ] Zero-store toggle path exists for "No stores yet"
- [ ] `npx tsc --noEmit` clean

## After Cluster: Components & Screens

### Chrome & Tokens
- [ ] Uses OwedBook `AuthedShell` verbatim
- [ ] Navbar coral BOTH modes (dark `--navbar` bumped to coral)
- [ ] Sidebar nav: My Stores · Billing · Settings · Audit
- [ ] "Demo · mock data" marker in content (not navbar)
- [ ] `grep` — no numbered Tailwind colors; no `any`; no `dangerouslySetInnerHTML`

### The 6 screens (match `_design/HTML/` + PNG renders)
- [ ] My Stores `/admin-portal` (card grid; no platform pulse; no KPI tiles)
- [ ] Store detail `/admin-portal/stores/[id]` (breadcrumb lock + read-only header + roster)
- [ ] Invite `/admin-portal/stores/[id]/invite` (email+role+Send; lock callout; pending list; **NO password field**)
- [ ] Billing `/admin-portal/billing` (rows + Add store + Manage/Cancel; "visual only" caption)
- [ ] Settings `/admin-portal/settings` (form + in-memory Save)
- [ ] Audit `/admin-portal/audit` (read-only ledger)
- [ ] Old `/admin-portal/users/*` CRUD REMOVED · `/moose-portal` UNTOUCHED

### States
- [ ] Loading skeletons · Empty states · Error (toast + revert) · Validation — both themes, per states sheet

## After Cluster: Gate M — Mobile (MANDATORY, same cluster)
- [ ] Navbar → hamburger < lg · sidebar → slide-over (backdrop + Esc + scroll-lock)
- [ ] My Stores grid → 1-col · roster → stacked · audit → stacked cards · forms full-width
- [ ] **375px holds on ALL 6 screens — no overflow/clipping/h-scroll**
- [ ] "Demo · mock data" marker visible on mobile
- [ ] **OPERATOR EYES-ON: 375 + tablet + desktop, both themes, all 6 screens** (test runner can't see pixels)

## After Cluster: Verification
- [ ] `rm -rf .next && npx tsc --noEmit` → 0
- [ ] `npm test` → green (incl. invite-no-password, no-charge, owner-scoped invariant tests)
- [ ] `npm run build` → exits 0 · `npm run dev` → clean

### Gating grep (final pass — must confirm ABSENT)
- [ ] No password/credential input in the admin portal
- [ ] No platform/cross-tenant view
- [ ] No PHI/claims data
- [ ] No super-admin powers / onboarding queue / restore-admin-for-others
- [ ] No real checkout/charge

### Mock-functional smoke walk
- [ ] Login → My Stores (his stores) · drill to store detail → roster (breadcrumb lock)
- [ ] Invite: email+role → Send → invite_pending row + toast (NO password anywhere)
- [ ] Suspend/Un-suspend/Resend/Send recovery → pill flip + toast + audit entry
- [ ] Billing renders · Add store drops mock card · Manage/Cancel visual only
- [ ] Settings save in-memory + toast · refresh resets (by design)
- [ ] Empty states: zero-store, no-match search, no pending invites
- [ ] Mist ↔ Slate holds · navbar coral both modes

## After Cluster: Retrospective
- [ ] `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` exists, all sections filled (not sycophantic)
- [ ] **Coach/Frank requirements harvested → captured as Phase-7 inputs**
- [ ] Phase-7 flags reconfirmed (jobTitle, real invite/RLS, real Stripe, real add-store checkout)
- [ ] Operator reviewed

---

## Final Operator Gut Check

- [ ] "Would Frank/Coach understand the future product from this?"
- [ ] "Does it teach the RIGHT mental model (invite-based, owner-scoped)?"
- [ ] "Is the safety line held — no password, no PHI, no platform view, no charge?"
- [ ] "Do all 6 screens hold at 375px?"
- [ ] "Can I demo this without flinching?"

If yes across the board → Phase 2.2 ships → **deploy-ready v1 (mock).**
If any no → fix now or capture as a Phase-7 input.

---

## Sign-Off

| Person | Date | Verdict |
|---|---|---|
| Tony Stark | YYYY-MM-DD | [SHIP / NEEDS_REWORK] |
| Claudy | YYYY-MM-DD | Confirms gates verified |

🥄 **Phase 2.2 COMPLETE when all boxes checked — incl. Gate M. This is the deploy-ready v1 (mock).**
