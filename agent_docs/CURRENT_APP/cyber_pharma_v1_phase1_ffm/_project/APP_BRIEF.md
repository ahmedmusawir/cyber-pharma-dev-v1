# APP BRIEF — Cyber Pharma v1 / Phase 1: Foundation Skeleton (v2)

> **Status:** LOCKED
> **Phase:** 1 of 8
> **Predecessor:** Phase 0 — Ignition (MASTER_APP_BRIEF, TRIANGULATION_DOC locked)
> **Successor:** Phase 2 — Visual Fidelity With Demo Data (OwedBook screens)
> **Author:** Architect Agent (Claude) for Tony Stark
> **Reader:** Claudy (Claude Code)

---

## 1. Mission Of This Phase

Bring the Cyber Pharma v1 main app from "audited starter kit clone" to "branded foundation with the v1 design language installed, ready for Phase 2 feature work." Both apps in the previous architecture is reduced to one app — superadmin moves to its own repo. No deploy work in this FFM (a separate department owns deployment infrastructure).

The phase installs the **real** v1 design tokens (coral primary, Saira, Metro-flat, semantic color system) so Phase 2 builds on a finalized foundation, not throwaway placeholders.

---

## 2. Hero Outcome

> **A reviewer runs `npm run dev` locally, clicks through every route, sees the locked v1 brand language everywhere, confirms role gates hold, and trusts the foundation is ready for Phase 2 OwedBook work.**

The proof is in the local click-through. Nothing more.

---

## 3. In Scope (Phase 1 Only)

### Design Foundation
- 🔒 Install designer's locked `globals.css` (HSL tokens, Mist + Slate themes, semantic color set)
- 🔒 Wire `tailwind.config.ts` to map tokens (semantic utilities → CSS variables)
- 🔒 Wire Saira via `next/font` (NOT a CDN link)
- 🔒 Apply brand assets (logo files in `/public/brand/`)
- 🔒 Kit reconciliation: migrate hardcoded `slate-800` / `red-600` / `text-purple-600` etc. onto semantic tokens
- 🔒 Verify style tile renders correctly in browser (theme toggle works for Mist + Slate)

### Routes & Pages
- 🔒 **NEW:** `/` — Public marketing landing page (per designer's `_design/landing-page-desktop.png`)
- 🔒 **INHERITED — rebrand only:** `/login`, `/register`, `/forgot-password` (apply v1 tokens, swap logo)
- 🔒 **NEW PLACEHOLDER:** `/admin-portal` — "Coming in Phase 2" page, role-gated to `admin`
- 🔒 **NEW PLACEHOLDER:** `/members-portal` — "Coming in Phase 2" page, role-gated to `member` + `admin`
- 🔒 **NEW:** `/access-denied` — Shown when role gate redirects
- 🔒 **INHERITED:** `/not-found` — Starter kit 404, rebranded

### Routes to DELETE (entirely)
- ❌ `/superadmin-portal` route group — DELETE (whole folder, all files)
- ❌ `/api/superadmin/*` — DELETE all admin API routes
- ❌ `/api/superadmin/superadmin-add-user` — confirm deletion (TONY_DEMO vulnerability)
- ❌ Any inherited superadmin user management UI components

### Foundation Mechanics
- 🔒 Three Supabase clients pattern verified (browser, server, admin) — inherited from starter kit
- 🔒 `protectPage(allowedRoles)` server action enforces role gating at layout level — strip `'superadmin'` from allowedRoles arrays
- 🔒 Roles read from `user_roles` table only (NEVER from `user_metadata`)
- 🔒 Fail-closed boot check: app refuses to start if any of these env vars are missing:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - `GHL_WEBHOOK_SECRET` (placeholder check for Phase 6 inheritance)
- 🔒 Error boundaries (`error.tsx`) on every remaining route group: `(public)`, `(auth)`, `(members)`, `(admin)`

### Verification (Local Only)
- 🔒 `npm run build` succeeds clean
- 🔒 `npm run dev` runs clean
- 🔒 Smoke walkthrough: register, login, logout, role-gate enforcement
- 🔒 Theme toggle works (Mist ↔ Slate)
- 🔒 Style tile renders correctly in browser
- 🔒 Env var fail-closed proven (break env, confirm app refuses to start)
- 🔒 Security greps all zero

---

## 4. Out of Scope (Phase 1)

These do NOT ship in Phase 1:

- ❌ **ANY deployment work** (Cloud Run, CNAME, staging URLs, `gcloud` commands) — separate department, later phase
- ❌ **Superadmin functionality** — moving to its own repo entirely
- ❌ Frank-domain tables (13 tables — Phase 3)
- ❌ OwedBook screens (Phase 2 — the gorgeous artifacts in `_design/phase2-reference/` are direction-only)
- ❌ Filter sidebar with PBM dropdown (Phase 2)
- ❌ KPI tiles, tabs, data tables (Phase 2)
- ❌ Imports page (Phase 5)
- ❌ Reports viewer (Phase 6)
- ❌ Settings pages (Phase 2)
- ❌ Real admin portal functionality (Phase 7)
- ❌ Multi-store admin UX (Phase 7)
- ❌ Math / reimbursement calculations (Phase 5)
- ❌ Email pipeline (Phase 6)
- ❌ GHL integration (Phase 6)
- ❌ Stripe integration (Phase 7)
- ❌ MFA (Phase 8)
- ❌ Audit logging (Phase 3)
- ❌ OAuth (Phase 8, if Frank Q6 confirms)
- ❌ HIPAA hardening (Phase 8)

If Claudy is tempted to build any of the above, STOP and surface.

---

## 5. Hard Gates (Phase 1 Cannot Close Without These)

These are non-negotiable. Phase 1 is not "done" until every gate passes.

| Gate | Verification |
|---|---|
| **G1** Local build clean | `npm run build` exits 0 with no errors |
| **G2** Local dev runs | `npm run dev` starts server, app responds on localhost |
| **G3** Login flow works locally | Register → user_roles row exists → login → session set → logout clears |
| **G4** Role gates hold | Member cannot access `/admin-portal` (redirects). Unauthenticated cannot access any role-gated route. |
| **G5** Env var fail-closed proven | Remove `NEXT_PUBLIC_SUPABASE_URL` from `.env.local`, attempt `npm run dev`, see explicit error and exit (not warning) |
| **G6** No `user_metadata` role check anywhere | Grep across repo: zero matches for `user_metadata.is_*` or `user_metadata.role` |
| **G7** No `superadmin-add-user` route | Grep across repo: zero matches for `superadmin-add-user` |
| **G8** No `(superadmin)` route group | `find . -path "*/app/\(superadmin\)" -type d` returns nothing |
| **G9** Error boundaries on all remaining route groups | Verify `error.tsx` exists in `(public)`, `(auth)`, `(members)`, `(admin)` |
| **G10** No numbered Tailwind colors in components | Grep: zero matches for `bg-slate-`, `text-red-6`, `bg-zinc-` etc. in `src/components/` and `src/app/` (kit reconciliation done) |
| **G11** v1 tokens installed | `globals.css` has the locked HSL tokens (`--primary: 12 93% 64%` etc.); `tailwind.config.ts` maps them; Saira loaded via `next/font` |
| **G12** Theme toggle works | Mist (light) ↔ Slate (dark) swap correctly; brand color holds across both |
| **G13** Landing page built | `/` shows the new branded marketing page (matches `_design/landing-page-desktop.png` direction) |
| **G14** All Phase 1 tests pass | `npm test` green; component tests, role-gate tests, env-check tests |
| **G15** RECOVERY.md updated + retrospective drafted | Last action: "Phase 1 closed". Retrospective in `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` |

**Note:** Old v1 had 15 gates including 5 deploy-related (Cloud Run deploys, CNAME, etc.). v2 dropped those entirely. The 15 gates above are all the gates — no deploys at any layer.

---

## 6. Success Criteria Table

| Criterion | How to verify |
|---|---|
| App runs locally | `npm run dev` → `localhost:3000` responds 200 on `/` |
| Build clean | `npm run build` exits 0 |
| Test users exist | Supabase Dashboard shows admin + member test accounts |
| Role gating verified | Manual click-through with each test user |
| Brand applied | Visual inspection — coral CTA, Saira font, Metro-flat corners |
| Token foundation installed | `globals.css` shows locked HSL tokens; style tile renders correctly |
| No security smells | Grep checks for `user_metadata` role usage = 0; `superadmin-add-user` = 0; numbered colors in components = 0 |
| Fail-closed env check | Manually breaking env vars shows clean error exit |
| Superadmin removed | No `(superadmin)` route group, no `/api/superadmin/*` routes |
| Foundation feels solid | Tony's gut check: "yes, ready for Phase 2" |

---

## 7. Known Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Kit color reconciliation hits unexpected places | Medium | Run `grep -rn "slate-\|red-6\|zinc-\|purple-6\|blue-6" src/` upfront to inventory before migrating |
| Saira loading via `next/font` conflicts with kit's existing font setup | Low | Replace the kit's font setup wholesale; verify with hard refresh |
| Theme toggle was wired for shadcn defaults; needs rewiring for Mist/Slate | Medium | Read the kit's existing toggle code first; the swap is conceptually simple but the implementation depends on the kit's pattern |
| Designer's HSL values don't quite match visual mocks | Low | Style tile is the contract; if conflict, the HSL file wins, but flag to designer |
| Hardcoded color migration breaks the kit's auth screens visually | Medium | Token migration happens BEFORE landing page build, so we test it on inherited screens first |
| Deleting `(superadmin)` route group leaves orphan imports | High | Run TypeScript check after deletion; clean up any references |

---

## 8. Common Stumbles (Watch For These)

| Stumble | Why it happens | Fix |
|---|---|---|
| Claudy tries to build OwedBook from `_design/phase2-reference/` | Gorgeous artifacts are tempting | Phase 2 reference — README in that folder is explicit warning |
| Claudy "improves" the starter kit's auth flow | Looks like an opportunity | Push back: Phase 1 preserves starter kit auth, applies tokens only |
| Claudy starts adding Frank-domain types | Saw the Frank API extracts in project knowledge | Push back: those types land in Phase 3 |
| Claudy attempts a Cloud Run deploy | The previous v1 spec mentioned it | v2 explicitly drops deploys — surface and stop |
| `superadmin-add-user` route accidentally inherited | Cloned without scrubbing | Explicit deletion + grep check |
| Roles end up in `user_metadata` somewhere | Convenient pattern | Code review: all role checks reference `user_roles` table |
| Env var check is "warn and continue" | Soft failure feels nice | Code review: missing env vars → `process.exit(1)` or equivalent |
| Demo data sneaks in | "Just for testing" | Zero data in Phase 1. Any data is Phase 2 |
| Numbered Tailwind colors survive in components | Easy to miss in migration | G10 grep catches this |
| Saira loaded via CDN `<link>` | Easier than next/font | Use `next/font/google` — performance + no FOUT |

---

## 9. Estimated Effort

**1-2 sessions** per the locked PHASE_ROADMAP. The starter kit gives us most of Phase 1 for free.

The heaviest sub-phase is **Sub-Phase 4 (Components)** because of:
- Token install + tailwind config wire
- Saira via `next/font`
- Kit color reconciliation (grep + migrate)
- Landing page build (the one new screen)
- Auth screens rebrand
- Superadmin route group deletion
- Error boundaries

A "session" is one focused work block with Claudy, typically 1-4 hours including setup, fabrication, review, iteration.

---

## 10. Handoff To Phase 2

When Phase 1 closes, the following inputs are available to Phase 2:

- App runs locally with locked v1 design language installed
- Test admin and member accounts exist
- Mist + Slate themes wired and working
- Style tile renders correctly
- Component primitives (Button, Input, Card, etc.) themed by tokens
- All Phase 2 reference artifacts still in `_design/phase2-reference/` (now Phase 2 build targets)
- The three Kit Improvement Proposals identified (DataTable, MultiSelect, EmptyState) — Phase 2 builds them first
- RUN_001_LESSONS.md authored

Phase 2's APP_BRIEF will be drafted using lessons learned from Phase 1. That's the just-in-time slicing pattern. The Phase 2 FFM (`cyber_pharma_v1_phase2_ffm`) gets authored after Phase 1 retrospective lands.

---

## 11. Constraints

- **No new features.** Foundation skeleton only.
- **No deploy work.** Separate department.
- **Service layer discipline is mandatory** from day one. Even auth flows go through `/src/services/`.
- **Plan Mode is mandatory.** Inherited from global CLAUDE.md and the `stark-frontend-first` skill.
- **Eyesight-aware communication.** Explanations before code blocks, always.
- **Tokens land BEFORE screens.** Design tokens are Phase 1, not "fix later."
- **No backend code authoring** for entities not yet in scope (no Frank-domain anything).

---

## 12. Phase Transitions (Phase 1 → Future)

| Phase | Owner | What it does |
|---|---|---|
| Phase 1 | Claudy + Stark approval gates | Foundation skeleton (this FFM) — one app, tokens locked, no deploys |
| Phase 2 | New FFM (`cyber_pharma_v1_phase2_ffm`) | Visual fidelity with demo data — OwedBook screens land here |
| Phase 3 | New FFM | Schema + RLS + Audit |
| Phase 4 | New FFM | Reference data pipeline |
| Phase 5 | New FFM | Math + Imports |
| Phase 6 | New FFM | PDF + Email + GHL |
| Phase 7 | New FFM | Stripe + Multi-store admin |
| Phase 8 | DevOps Agent (separate dept) | HIPAA hardening + production deploy |

Each phase gets its own FFM. **Deploy work is handled by the DevOps department, not this FFM lineage.**

---

## 13. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-03 | Initial APP_BRIEF for Cyber Pharma v1 Phase 1. Two apps (main + superadmin), 15 hard gates including deploys. |
| 2.0 | 2026-06-04 | Scope cut: one app (superadmin to its own repo). Deploy work removed entirely (separate dept owns this). 15 gates → 15 gates restructured (5 deploy gates dropped, 5 token/design gates added). Designer's locked v1 tokens integrated. Sub-Phase 4 expanded with token install + kit reconciliation + landing page build + superadmin route deletion. |
