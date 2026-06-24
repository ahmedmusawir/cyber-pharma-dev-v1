# APP BRIEF — Admin Portal Demo Shell (OwedBook / Extended Phase 2)

**Codename:** Admin Portal Demo Shell (the mock-functional preview of the future **StoreLens**)
**Project:** Cyber Pharma v1 — Main App (OwedBook), in-app admin portal
**Document type:** APP_BRIEF (demo-shell scope)
**Author:** Architect (Claude/Jarvis), MissionControl lab
**Version:** 1.0 · **Date:** 2026-06-21
**Status:** DRAFT → awaiting operator REVIEW

> **READ THIS FIRST — what this is and is NOT.**
> This is a **mock-functional demo shell**, an *extended Phase 2* visual add-on to OwedBook. It replaces the generic starter-kit admin placeholder with a high-fidelity, mobile-responsive, in-memory preview of how a pharmacy owner will manage stores, members, and billing.
> It is **NOT StoreLens.** StoreLens is the real Phase-7 build (real Supabase, RLS, member creation, live Stripe). This shell is its preview, built so its **visual layer carries forward** into Phase 7 while none of the wiring is real.
> **Purpose:** give Coach and Frank a full picture to react to — and harvest the Phase-7 requirements they don't know they have yet.

---

## 1. App Type

An **in-app route group** inside OwedBook (`(admin)` / `/admin-portal`), not a standalone app. Mock-functional: state lives in Zustand/in-memory, nothing persists, no real backend, no real credentials. Same discipline as Phase 2 OwedBook.

---

## 2. One-Sentence Purpose

Let a pharmacy owner log in and visually walk through managing his own stores, members, and subscription — fully interactive on mock data — so stakeholders see the future product and surface requirements before Phase 7 builds it for real.

---

## 3. Who Uses This (in the demo)

- **Demo driver:** Tony, walking Coach and Frank through it.
- **Portrayed role:** a **pharmacy owner / admin** (`role = 'admin'`) managing HIS OWN stores. Owner-scoped — he sees only his stores, never the platform.
- **NOT portrayed:** super-admin / platform views (that's MissionControl), and no real users are created or modified.

---

## 4. Why We're Building It

1. **The current admin placeholder misleads.** What's deployed now is generic starter-kit user management with nothing to do with the real product. Showing *that* to Frank/Coach is worse than a fake — it teaches the wrong mental model.
2. **Requirements discovery.** Frank can't spec an admin portal he can't picture; neither can we fully. A seeable, clickable version *generates* the Phase-7 requirements for the cost of minutes.
3. **The visual layer is reusable.** Components, layout, screens carry forward to StoreLens at Phase 7. Only the wiring (mock → real Supabase/RLS/Stripe) gets replaced — and that wiring was always Phase-7 work.

---

## 5. In Scope (mock-functional)

The shell **looks alive** — same kind of mock-functionality as Phase 2 OwedBook (state reacts, nothing persists).

**Screens (owner-scoped):**
1. **Admin dashboard** — the owner's own stores only (card grid, inherited from MissionControl). His store count, each store's status pill, a "needs attention" glance. **No platform pulse** (that's MissionControl).
2. **Store detail** — breadcrumb context lock, read-only store header, the **member roster** with mock actions.
3. **Add member (invite) flow** — the owner's legitimate genesis function. **Invite-based only** (see §6): enter an email, pick a role, "send invite" → a mock `invite_pending` row appears. NO password field.
4. **Member management** — per-row mock actions: Suspend → pill flips Suspended; Un-suspend; Resend invite. (Mock-functional: in-memory state changes, no persistence.)
5. **Billing / subscription panel (visual)** — the owner's own subscription view: stores + their billing status, an "Add store" button, "Manage payment" / "Cancel" affordances. **Visual only — no real Stripe, no checkout that charges.** A mock "Add store" drops a new store card in.
6. **Settings** — pharmacy info form (mock).

**Mock-functional behaviors:** suspend/un-suspend flips state; add-member adds an `invite_pending` row; add-store adds a store card; search/filter over the loaded mock set; loading/empty/error states; toasts; form validation. All Zustand/in-memory.

**Inherited wholesale from MissionControl** (zero redesign): card grid, member roster + safe-action buttons, status pill system, typed-confirm modal, breadcrumb context lock, audit-log viewer (mock).

---

## 6. The One Hard Rule (the only line we hold in a fake)

Even though it's mock, the shell teaches a mental model — so it must teach the **right** one:

- ✅ **Member creation is shown the SAFE way: invite-based.** Owner enters an email, system "sends an invite," the member sets their own password later. The owner never types a password for someone else.
- ❌ **NO "set this user's password" field. NO operator-held credential.** This is the one MissionControl-discipline carryover. A fake password field would teach Frank a pattern we'd have to un-teach at Phase 7 (and it's the HIPAA-wrong pattern).
- Note: owner-creating-a-member in his OWN store is *legitimately safe* (he already controls that store's data) — unlike the super-admin case. So the **invite flow IS in scope here** (it was out of scope in MissionControl). The safety line is the *password/credential*, not the creation itself.

---

## 7. Out Of Scope (demo shell)

1. ❌ **No real backend.** No Supabase domain writes, no real auth changes, no real Stripe charges. (Real Supabase **auth/login** may stay real per the OwedBook Phase 2 convention; domain is mock.)
2. ❌ **No real member creation / password / credential.** Invite is a mock row; no login is minted.
3. ❌ **No PHI / claims data** rendered in the admin portal. (It manages people, not claims — same wall as MissionControl, now an internal boundary.)
4. ❌ **No platform-wide / cross-tenant views.** Owner-scoped only.
5. ❌ **No onboarding approval queue, no restore-admin-for-others, no super-admin powers.** Those are MissionControl's.
6. ❌ **Do NOT treat this as the StoreLens spec.** The real member-creation flow, RLS model, and billing surface are **Phase-7 decisions** needing real schema + Stripe. Locking them here on guesses = real rework. This shell is a visual preview, not a contract.
7. ❌ **No persistence.** Refresh resets state. By design.

---

## 8. Design Direction (for the designer brief)

The shell must visually marry **two parents**: the **MissionControl admin pattern** (card grid, member management, pills, safe actions) wearing **OwedBook's skin** (its tokens, header, nav, look) — because it lives *inside* the main app. See `ADMIN_DEMO_DESIGNER_BRIEF.md`.

- Same token system as OwedBook/Cyber Pharma main (Coral, Saira, Mist+Slate, flat).
- Inherit MissionControl's component patterns; restyle to sit natively inside OwedBook's shell/nav.
- Mobile-responsive (Frank may view on a phone). 375px holds.
- A subtle **"Demo · mock data"** marker so stakeholders never mistake it for live.

---

## 9. Success Criteria

- [ ] Replaces the generic admin placeholder; owner logs in → sees HIS stores (mock).
- [ ] Drill-down: dashboard → store detail → members, with breadcrumb lock.
- [ ] Add-member shows the **invite** flow (no password field); a mock `invite_pending` row appears.
- [ ] Suspend/un-suspend/resend flip mock state with toasts.
- [ ] Billing panel renders (visual); "Add store" adds a mock card; no real charge.
- [ ] No PHI, no platform views, no real credential anywhere.
- [ ] Light + dark + 375px all hold; "Demo · mock data" marker present.
- [ ] Built so components survive into Phase 7 (service layer mock-swappable).

---

## 10. The Demo's Real Job (frame for Tony)

When walking Coach/Frank through it, the goal is **requirements harvesting**: "what would you want here?" Every feature they name is a Phase-7 requirement captured early, cheap. Treat the shell as a requirements-gathering machine, not a finished portal.

---

## 11. Reusability Into Phase 7

- **Carries forward:** all components, layouts, screens, the responsive work, the design language.
- **Replaced at Phase 7:** the mock service layer → real Supabase + RLS; the invite mock → real member invite; the visual billing → real Stripe. (All always-Phase-7 work.)
- **Keep the service layer as the swap point** (same as the FFM doctrine) so Phase 7 swaps bodies, not screens.

---

## 12. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-21 | Initial demo-shell brief. Scoped as extended-Phase-2 mock-functional preview of StoreLens; owner-scoped; invite-based member creation (safe pattern, no password field); visual billing; explicitly NOT the StoreLens spec; visual layer reusable into Phase 7. |

---

🥄 *Stark Industries — App Factory v1.2. A fake that teaches the right mental model is worth ten that look done. Mock the wiring, never mock the safety.*
