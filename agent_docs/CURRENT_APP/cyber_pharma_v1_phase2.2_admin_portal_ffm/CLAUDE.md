# CLAUDE.md — Phase 2.2 · Admin Portal Demo Shell (FFM spine)

> **Read this first, then read `_design/` in full before any planning.**
> **Project:** Cyber Pharma v1 — Main App (OwedBook), in-app admin portal.
> **This sub-project:** **Phase 2.2** — the mock-functional Admin Portal Demo Shell that REPLACES the current `/admin-portal` user-CRUD with an owner-scoped, in-memory preview of the future StoreLens.
> **Naming:** "Admin Portal Demo Shell" — **NOT StoreLens.** StoreLens is the real Phase-7 build.

---

## 0. Where the spec lives

ALL design + contract authority lives in **`_design/`**. Read every file there before planning:

- `AdminPortal_DEMO_APP_BRIEF.md` — scope, the one hard rule, gating (§6/§7). **Gate authority.**
- `AdminPortalDemo_DATA_CONTRACT.md` — view-models, Zustand store shape, the 5 service contracts, mock-data requirements.
- `UI_SPEC_AdminPortalDemo_v1_0.md` — the six owner-scoped screens, behaviors, states, responsive.
- `admin_component_states.html` + `admin_component_states_mist.png` + `admin_component_states_slate.png` — the visual ground truth (default/hover/focus/loading/empty/error, Mist + Slate). **Match these.**
- `AdminPortalDemo_STYLE_TILE_DELTA.md` + `AdminPortalDemo_TOKEN_CONFIRMATION.md` — the near-zero style delta + token confirmation.

**Conflict order:** App Brief gates + the one hard rule (§3 of the UI_SPEC) > DATA_CONTRACT shapes > UI_SPEC > component-states sheet. If any doc implies a password field or a platform view, that doc is wrong — the gate wins.

---

## 1. Operator rulings (LOCKED — do not re-litigate)

1. **Navbar = CORAL in BOTH light and dark modes.** Operator decision. Bump the dark `--navbar` token to a coral value (designer used `12 88% 58%`). This is the ONE resolved token deviation from the TOKEN_CONFIRMATION flag. Navbar chrome only — no content token changes.
2. **Route takeover:** this portal TAKES OVER `/admin-portal`. **My Stores** is the landing at `/admin-portal`; screens at `/admin-portal/stores/[id]`, `/stores/[id]/invite`, `/billing`, `/settings`, `/audit`. This **REMOVES** the current real user-CRUD at `/admin-portal/users/*` — that is intended. Real user management now lives ONLY in the env-gated `/moose-portal` (operator's test tool). Do not preserve the old user-CRUD here.
3. **The one hard rule is non-negotiable:** member creation is **invite-based, never password-based.** No password/credential field anywhere. `inviteMember` takes email + role only. This is held in the pixels AND in the service invariants.

---

## 2. The two DATA_CONTRACT flags — handle, don't silently resolve

1. **Navbar token** → RESOLVED: coral both modes (ruling #1 above). Apply it.
2. **`jobTitle` is demo-only** → STAYS FLAGGED. Frank's schema has no job-title column. Mock it freely for display (pharmacist/technician), but keep it marked as a Phase-7 source-decision flag in the data contract / code comments. Do NOT pretend it's backed; do NOT invent a real source.

---

## 3. Doctrine (inherited from the factory — these are GATES, not advice)

- **Mock-functional, in-memory only.** Zustand store seeded from `/mocks`. Actions mutate state so the demo feels alive; refresh resets. No persistence, no backend, no real Stripe, no real credentials.
- **Service layer is the SOLE Phase-7 swap point.** Components call services only — never the Zustand store directly, never `/mocks` directly. Phase 7 swaps service bodies for Supabase/RLS/Stripe; screens/types/store contract stay frozen. (Same swap-point discipline as OwedBook Phase 2.)
- **Auth-real / domain-mock.** Login may stay real (OwedBook convention); all domain data is mock.
- **Chrome inherited, NOT redesigned.** Reuse OwedBook's existing `AuthedShell` (navbar + surface-aware sidebar + mobile slide-over) verbatim. The demo only changes the sidebar's owner-scoped nav items (My Stores · Billing · Settings · Audit) and the main content.
- **Tokens inherited verbatim** from OwedBook's `globals.css` — zero new brand colors/tokens. The only net-new visual is the "Demo · mock data" marker (built from existing `--warning`). Per STYLE_TILE_DELTA, append the four small additions to the existing tile; do not ship a separate tile.
- **Gate M (mobile shell mandatory):** the responsive behavior (375px holds) is built in the SAME cluster that builds the authed screens — never deferred. Card grid → 1-col, roster rows → stacked, audit table → stacked cards, forms full-width. This is an ENFORCED gate, not authoring advice. Verify at 375 / tablet / desktop, both themes, every screen.
- **Demo marker lives in CONTENT** (a "Demo · mock data" pill by each page title), NEVER in the navbar (fixed chrome).

---

## 4. Gating — what must NEVER render (mirror App Brief §6/§7)

No password/credential field anywhere · no platform-wide / cross-tenant / "all owners" views (owner-scoped only — exactly one logged-in owner, every list is implicitly "mine") · no PHI / claims data in the admin portal (it manages people, not claims) · no super-admin powers, onboarding queue, or restore-admin-for-others (those are MissionControl's) · no real checkout that implies a charge. **These must not render at all — not merely be disabled.**

---

## 5. Build doctrine

- **Recon-first:** sweep the existing repo (AuthedShell, the OwedBook service-layer pattern, the existing `/admin-portal` to be replaced, the env-gated `/moose-portal` — DO NOT touch moose-portal) before planning. Plan Mode: present the plan, get operator approval, then build.
- **Spec-driven:** no build step without the spec backing it. If `_design` doesn't cover something, STOP and surface — don't invent screens, fields, or primitives.
- **Cluster-based FFM execution** with gates per cluster (KIPs/components → screens → mock-functional wiring → responsive + verification → retro), mirroring the OwedBook Phase-2 FFM structure.
- **Every document filename includes its version number.**
- **Commit discipline:** checkpoint commits between clusters; this work lives on its own branch (`phase2.2-admin-portal-*`).

---

## 6. Success criteria (from App Brief §9)

Owner logs in → sees HIS stores (mock) · drill-down dashboard → store detail → members with breadcrumb lock · add-member shows the INVITE flow (no password field), a mock `invite_pending` row appears · suspend/un-suspend/resend flip mock state with toasts · billing renders (visual), "Add store" drops a mock card, no real charge · NO PHI, NO platform views, NO real credential anywhere · light + dark + 375px all hold · "Demo · mock data" marker present · components survive into Phase 7 (service layer mock-swappable).

---

🥄 *Stark Industries — App Factory v1.2. Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.*
