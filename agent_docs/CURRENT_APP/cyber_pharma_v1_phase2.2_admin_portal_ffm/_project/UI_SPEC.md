# UI_SPEC — Admin Portal Demo Shell (OwedBook / Extended Phase 2)

> **Version:** 1.0 · **Date:** 2026-06-23
> **What this is:** the mock-functional, owner-scoped admin portal that lives *inside* OwedBook at `/admin-portal` — the visual preview of the future StoreLens. Authored FROM the locked demo designs + `AdminPortal_DEMO_APP_BRIEF`.
> **Naming:** "Admin Portal Demo Shell" — NOT StoreLens.
> **Conflict rule:** the App Brief gates + the one hard rule (§3) win over everything here. If a spec implies a password field or a platform view, the spec is wrong.

---

## 1. Chrome (inherited, NOT redesigned)

The portal wears OwedBook's existing `AuthedShell` verbatim:
- **Top `Navbar`** — `bg-navbar` coral bar, logo left, role links (OwedBook · Admin Portal · Profile), ThemeToggler + email + Avatar dropdown right, hamburger below `lg`. **Untouched.**
- **Desktop (lg+):** fixed left sidebar `w-[25rem]` holding `AdminSidebar` (a shadcn `Command`: search input + nav group).
- **Below lg:** sidebar hidden; a "Menu" trigger opens the left slide-over (`w-3/4 md:w-1/2 bg-secondary`, backdrop + Esc).
- **Demo marker** lives **in the content** (a small "Demo · mock data" pill by each page title) — never in the navbar (that's fixed).

The only thing the demo changes is the **sidebar nav items** (owner-scoped) and the **main column content**.

**Sidebar nav (owner-scoped):** My Stores · Billing · Settings · Audit log.

---

## 2. Screen Inventory

| # | Route (logical) | Screen | Pattern |
|---|---|---|---|
| 1 | `/admin-portal` | **My Stores** (canonical) | own-stores card grid |
| 2 | `/admin-portal/stores/[id]` | Store detail | breadcrumb lock + read-only header + member roster |
| 3 | `/admin-portal/stores/[id]/invite` | Invite member | invite-only form + pending list |
| 4 | `/admin-portal/billing` | Billing | store billing rows + Add store (visual) |
| 5 | `/admin-portal/settings` | Settings | pharmacy info form |
| 6 | `/admin-portal/audit` | Audit log | read-only action ledger |

Routes are logical; the exact paths replace the current `/admin-portal/users` placeholder (Architect/Phase-7 call). Designs are route-agnostic.

---

## 3. The One Hard Rule (held in the pixels)

**Member creation is invite-based, never password-based.** No screen, modal, or field anywhere lets the owner set a password for another user. The invite form has **email + role + Send invite** only; a lock-icon callout states the member sets their own password on accept. Owner-creating-a-member in his OWN store is legitimately safe — the safety line is the *credential*, not the creation. (The owner's *own* password change lives on `/profile`, outside this portal.)

---

## 4. Mock-Functional Behaviors (Zustand / in-memory, no persistence)

| Action | Behavior (mock) | Feedback |
|---|---|---|
| Suspend / Un-suspend member | status pill flips | toast |
| Send recovery | none (mock) | toast "Recovery email sent" |
| Send invite | a new `invite_pending` row appears | toast "Invite sent to {email}" |
| Resend invite | refresh "invited" timestamp | toast "Invite resent" |
| Add store | a new store card drops into the grid | toast |
| Manage payment / Cancel | visual only — **no checkout, no charge** | (none / mock dialog) |
| Save settings | in-memory update | toast "Saved" |
| Search / filter | client-filter over loaded mock set | — |

Refresh resets all state — by design.

---

## 5. Per-Screen Specs

### 5.1 My Stores `/admin-portal`
Eyebrow + h1 "My Stores" + subtitle + "{n} stores · {k} needs attention" glance + **store card grid** (inherited MissionControl card): name · status pill · NCPDP · member count · subscription footer pill. Card → store detail. NO platform pulse, NO financial KPI tiles (that's OwedBook's claims screen, not this).

### 5.2 Store detail `/admin-portal/stores/[id]`
Breadcrumb lock (My Stores › {store}) · read-only store header (name + subscription pill + NCPDP/NPI) · "Members · {n}" with **Invite member** button · roster rows (avatar · name · email · role · status pill · status-appropriate actions: Active → Send recovery / Suspend; Invite-pending → Resend invite; Suspended → Un-suspend). Read-only header — no inline editing of store identity here.

### 5.3 Invite member `/admin-portal/stores/[id]/invite`
Breadcrumb (My Stores › {store} › Invite member) · h1 "Invite a member" · **form: Email + Role + Send invite** · **lock-icon callout** ("Invite-based — no password here…") · "Pending invites" list showing the resulting `invite_pending` row (Resend). **No password field — ever.**

### 5.4 Billing `/admin-portal/billing`
Eyebrow + h1 "Billing & subscription" + **Add store** button · per-store billing rows (name · plan · status pill · next-charge/retry · Manage payment / Cancel) · "Visual only — no real charge" caption. No checkout surface that implies a charge.

### 5.5 Settings `/admin-portal/settings`
h1 "Pharmacy settings" + form (pharmacy name · contact · phone · address · software) + Save. Mock; in-memory.

### 5.6 Audit log `/admin-portal/audit`
h1 "Audit log" + read-only table (Time · Action · Target · Result) of the owner's own actions across his stores. No row actions.

---

## 6. Gating — what must NEVER render (mirror App Brief §6/§7)

No password / credential field anywhere · no platform-wide / cross-tenant / "all owners" views (owner-scoped only) · no PHI / claims data · no super-admin powers, onboarding queue, or restore-admin-for-others (those are MissionControl's) · no real checkout that implies a charge.

---

## 7. States

- **Loading:** skeleton cards / rows (see states sheet).
- **Empty:** EmptyState — empty store grid ("No stores yet"), no-match search ("No members match '{q}'" + Clear search), no pending invites.
- **Error:** action failure → destructive toast, optimistic pill reverts; non-destructive inline message + retry.
- **Validation:** invite email required + valid; settings fields validated on save.

---

## 8. Responsive (Rule Zero — 375px holds, mobile-correct from the first render)

Inherits AuthedShell's mobile behavior: navbar → hamburger; "Menu" trigger opens the sidebar slide-over; card grid → 1-col; roster rows → stacked; audit table → stacked cards (amount/primary cell first); forms full-width. Verified at 390px on My Stores, Store detail, Invite, Audit.

---

## 9. Service Layer (the Phase-7 swap point)

All domain data/actions go through a **mock service layer** (Zustand-backed, in-memory) — the sole swap point. Phase 7 replaces the bodies (real Supabase + RLS, real invite, real Stripe); the screens and components do not change. Keep services typed so Phase 7 swaps bodies, not screens.

---

## 10. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-23 | Initial UI_SPEC for the demo shell. Six owner-scoped screens reseated in OwedBook's AuthedShell; invite hard-rule; mock-functional behaviors; gating; states; responsive; service-layer swap point. |
