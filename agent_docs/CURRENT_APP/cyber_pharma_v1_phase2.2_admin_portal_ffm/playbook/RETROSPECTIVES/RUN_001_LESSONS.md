# RUN 001 — Cyber Pharma v1 Phase 2.2 · Admin Portal Demo Shell — Lessons Learned

> **Run completed:** 2026-06-25
> **Operator:** Tony Stark
> **Sessions:** 3+ (2026-06-22 C3 → 2026-06-24 C4 → 2026-06-25 C4-fix + C5)
> **Outcome:** SUCCESS_WITH_NOTES — shipped a clean mock-functional, owner-scoped demo with the one hard rule held and a clean Phase-7 swap point; the notes are about layout/mobile polish that slipped past the first build and a commit-boundary process hiccup.

---

## What Worked

- **Service-layer-only discipline held end-to-end.** The Gate-5 gating greps came back clean on the *first* pass: zero `@/mocks` imports in components, zero direct `useAdminDemoStore` imports in components (services only), zero numbered Tailwind colors, zero `any`, zero `dangerouslySetInnerHTML`. The "components call services, services are the sole Phase-7 swap point" rule wasn't just stated — it actually held.
- **The one hard rule was encoded, not just intended.** Invite-no-password lives in three places: the service signature, a compile-time `@ts-expect-error` that makes a `password` key a *build* failure, and a hard DOM assertion in `InviteMemberForm.test.tsx`. The safety line is enforced by the toolchain, not by vigilance.
- **Inherited chrome paid off.** Reusing `AuthedShell` / `AdminSidebar` / `Navbar` / `DataTable` verbatim meant Audit's desktop→mobile card transform came for free, and the shell's surface-aware sidebar carried both `/owedbook` and `/admin-portal` with one component.
- **The deletable mock with a built-in toggle.** `ADMIN_DEMO_NO_STORES` (a const, not env, per operator ruling) made demoing the zero-store EmptyState a one-line flip-and-revert — no env plumbing, no scaffolding.
- **Cluster checkpoints + Plan Mode per cluster** kept scope honest. Splitting C4 into 4a (chrome) and 4b (screens) stopped it from becoming one un-reviewable blob.

## What Stumbled

- **Layout polish slipped past the first build and needed two operator eyes-on fix rounds (C4-fix).** Three misses: (1) the content column had *no* gutter — screens sat flush against the sidebar; (2) the two form screens (Invite, Settings) were left-aligned at 560px with a large right-side void instead of centered; (3) a genuine **mobile-nav dismiss bug** — the shared Navbar menu only closed on the X, not on an outside tap. None of these were caught by Gate M, because **Gate M checks "does it collapse at 375" — not "does the desktop content carry the designer's gutter" or "is the form centered."** Those are different failure classes and fell through the gate.
- **The dismiss bug shipped in C4a chrome and survived all the way to C5.** Because the shared `Navbar` was on DO-NOT-TOUCH, nobody tested the mobile menu's dismiss behavior until the operator tapped outside it. A menu's close-paths are *behavior* and deserved a test from the moment the menu was built.
- **Commit-boundary process drift — a RECURRENCE, not a net-new lesson.** At the C4-fix boundary the entire working tree was hand-committed to `main` as a single "Phase 2 complete" commit — bundling the previously-untracked FFM design docs with the fix, under a generic message, on the default branch rather than the `phase2.2-admin-portal-1` feature branch. No work was lost (intact + pushed), but granularity, message, and branch all diverged from cluster-checkpoint discipline. **This is the same failure family as the Phase 2.1 commit-discipline lesson (the VM-crash / uncommitted-bundling family) — it has now recurred.** A lesson that recurs means the *gate isn't holding*: documenting it as advice did not change behavior. → it must become a hard gate (see Structural below). Cross-link: Phase 2.1 retro → this run.
- **The per-FFM verification playbook was a stale Phase-1 copy.** `playbook/06-VERIFICATION.md` references Vitest, Playwright, the Phase-1 register flow, and superadmin deletion — none of which apply to this Jest-based admin-portal FFM. Had to fall back to `verification/PHASE_GATES.md` (Gate 5) as the real authority and treat 06 as noise.

## What Should Change For Next FFM

### Structural (promote to playbook / skill)
- **Split the responsive gate into two checks.** Gate M / Gate 4 should verify, separately: (a) *collapse* — grid→1-col, rows→stacked, table→cards at 375; and (b) *desktop content frame* — the designer's content gutter (`.main` padding) is present and form screens use the designer's max-width **centered** (`.formcard` width + `mx-auto`). (b) is what slipped here. Source both from the mockup CSS, not from eyeballing.
- **Any menu/drawer/dialog ships with a dismiss test.** Outside-click + Esc + the explicit close control, asserted the moment the component is built — even (especially) when it lives in inherited/DO-NOT-TOUCH chrome.
- **Regenerate playbook `06-VERIFICATION.md` per FFM** instead of copying the Phase-1 template. A stale verification playbook is worse than none — it sends the runner chasing checks that don't exist (superadmin, Vitest) while the real gate lives elsewhere.
- **Commit discipline is now a HARD GATE, not advice — because it RECURRED.** Feature-branch cluster checkpoints, cluster-scoped messages, deliberate merge to `main`; **never** a single hand-rolled "phase complete" sweep that bundles docs onto the default branch. This same failure already cost the Phase 2.1 run (the VM-crash / uncommitted-bundling family) and has now recurred here — which is the proof that advice doesn't hold it. Enforce it: e.g. a checkpoint/pre-commit check that, on a `phase*` branch, refuses a bundled commit to `main` and requires cluster-scoped commits on the feature branch. (Cross-linked from "What Stumbled" above.)

### Project-specific (stays here)
- **V1 has no search UI** (services keep `search` params for Phase 7). The Gate-5 "no-match search EmptyState" checklist line is therefore **N/A-for-UI** — it's exercised only by `adminDemo.seed.test.ts`. Fix that checklist line so a future run doesn't read it as a failed manual check.
- **`jobTitle` stays demo-only flagged** — Frank's schema has no job-title column; do not let it harden into an assumed-real field.

### Phase 2.2 / Phase-7 specific (feeds the real StoreLens build)
- The **add-store harvest form fields (store name / NCPDP / NPI / address)** are the *proposed* new-store contract — confirm against what Frank actually needs (see harvest section).
- **Settings shows `stores[0]` only** (V1 simplification) — Phase 7 needs a store picker or settings-reached-from-detail.
- **Billing "Add store" drops a card with no billing line** — Phase 7 ties add-store to real Stripe checkout (payment-creates-account).

## Surprises

- The gating greps came back **100% clean on the first pass.** Service-layer discipline usually leaks at least one direct-store or numbered-color violation by verification time; here it didn't.
- `DataTable`'s existing desktop→mobile card transform gave the Audit screen its entire Gate-M mobile treatment for free — zero per-screen responsive work.

## Time Estimates vs Actual

Per-cluster wall-clock was **not tracked precisely** (multi-session run). Rough qualitative picture, honestly labeled:

| Cluster | Relative effort | Note |
|---|---|---|
| C0 Recon | light | 3 Explore agents; FFM specs already staged |
| C1 Types | light | direct from DATA_CONTRACT, no surprises |
| C2 Services + store | medium | hard-invariant tests were the real work |
| C3 Mock seed | light–medium | full-state coverage seed |
| C4a Chrome + takeover | medium | route takeover + delete old user-CRUD |
| C4b 6 screens + Gate M | heavy | the bulk of the build |
| **C4-fix (unplanned)** | medium | two eyes-on rounds — the avoidable cost |
| C5 Verification | light | automated half clean; operator smoke walk |

**Calibration note:** budget an explicit "operator eyes-on layout pass" *inside* C4, not after it. The C4-fix round was real cost that the split gate (above) would have folded into the build.

## Anti-Patterns Observed (Add To Skill?)

- **"Responsive = collapse only."** Treating Gate M as satisfied once things stack at 375, while desktop content gutter and form centering go unchecked. Propose adding to `stark-frontend-first/references/ANTI_PATTERNS.md`: *the mobile gate must also assert the desktop content frame matches the mockup container CSS.*
- **Untested dismiss on inherited chrome.** A menu whose close-paths were never tested because the file was "frozen."

## New Patterns That Worked (Add To Skill?)

- **Tri-layer invariant enforcement** (service signature + compile-time `@ts-expect-error` + DOM test) for a non-negotiable safety rule. Worth promoting as the standard way to hold a hard rule.
- **Const demo-toggle in the deletable mock** (`ADMIN_DEMO_NO_STORES`) for one-line empty-state rehearsal without env sprawl.
- **Facade harvest form** — a form that collects fields purely to elicit a requirement (here, the new-store contract from Frank) while calling the frozen no-arg service. A clean way to make a demo double as a requirements-gathering instrument without touching the swap point.

## Open Questions For Next FFM

- Should the split responsive gate (collapse vs desktop-frame) be a factory-level playbook change, or stay in this FFM's `verification/`? (Operator owns this.)
- Commit discipline at FFM-close: confirm the convention — feature-branch checkpoint commits with cluster-scoped messages, merged to `main` deliberately, *not* a single hand-rolled "phase complete" sweep that bundles docs.

---

## Phase-7 Requirements Harvest

> **Status: PARTIAL — live Coach/Frank feedback still PENDING.** The demo was built to *elicit* requirements; it has not yet been walked with Coach/Frank. The items below are (a) flags carried in from the contract and (b) the demo's proposed contracts. The live harvest section is to be filled when the demo is shown.

### Carried Phase-7 flags (reconfirmed this run)
- **`jobTitle` source** — demo-only; Frank's schema has no column. Phase-7 must decide a real source or drop it.
- **Real invite / RLS** — `inviteMember` must become a real Supabase invite (magic link) + RLS, **still with no password** ever set or seen by the admin.
- **Real Stripe billing** — `amountLabel` / plan / charge dates become real Stripe subscription joins; amounts stop being seed values ($49 standard / $199 concierge are placeholders, not locked V1 pricing — a Coach business decision).
- **Real add-store checkout** — "Add store" becomes payment-creates-account via the real Stripe portal.

### Demo's proposed contracts (to validate with Frank)
- **New-store field set:** store name · NCPDP · NPI · address (the harvest-form fields). Confirm completeness — is anything missing for a real store record?
- **Member model:** invite-based only; one admin = owner; 2nd admins only via MissionControl. Confirm this matches how Frank expects multi-admin pharmacies to work.
- **Settings shape:** single per-store pharmacy-info form. Confirm the real settings fields and whether settings are per-store or per-owner.

### TO BE CAPTURED when demoed to Coach/Frank

> This list **IS the demo's output spec.** Each item is a specific prompt tied to a concrete mock decision the demo makes — it must drive the Coach/Frank conversation, not collect vague "what do you think." Walk the demo, ask these, record the answers as Phase-7 inputs.

- [ ] **Add-store fields** — *"When you onboard a new store today, beyond **store name / NCPDP / NPI / address**, what else do you record? Is any of these four unnecessary?"* → validates the harvest-form field set as the real new-store contract.
- [ ] **One-admin model reaction** — *"We modeled **one admin = the owner**, second admins only via MissionControl, and member-add is **invite-only, never a password**. Does that match how your pharmacies actually delegate admin access — or do owners expect to add fellow admins directly?"* → confirms/breaks the core access model.
- [ ] **Pricing** — *"Billing shows **$49 standard / $199 concierge** as placeholders. What are the real V1 plans and prices?"* → Coach business decision; currently NOT locked by this demo.
- [ ] **jobTitle source** — *"We display job titles (**Pharmacist / Technician / Staff**), but Frank's schema has no such column. Do you want job title as a real field — and if so, where does it come from?"* → resolves the carried demo-only flag.
- [ ] **Billing surface** — *"Billing here is **visual-only**: Manage payment / Cancel do nothing, and **Add store drops a card with no charge**. What billing actions do owners actually need, and should **add-store itself create the subscription** (payment-creates-account)?"* → defines the real billing/checkout flow.
- [ ] **Excluded screens / mental model** — *"Platform-wide / cross-tenant / 'all owners' views are **deliberately absent** — every list is implicitly 'mine.' Is that the right mental model, or do they expect a platform view?"* → and capture any screen they reach for that isn't here.

---

## Verdict

A successful run with honest notes: the demo holds the safety line (no password, no PHI, no platform view, no real charge), the service layer is a genuinely clean Phase-7 door, and all 15 gates plus Gate M are green. The one real lesson is that the mobile gate guarded *collapse* but not the *desktop content frame* — which cost an unplanned two-round fix that a sharper, two-part gate would have absorbed into the build. Promote that gate change and the next shell ships right the first time.

🥄 *Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.*
