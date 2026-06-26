# Manual Testing Guide — OwedBook & Admin Portal

> The eyes-on smoke walk for Cyber Pharma's two authed surfaces. Domain data is
> **mock** (auth is real), so most of this is UI/behavior verification, not
> database checks. For the automated suite see [TESTING.md](./TESTING.md).

> **Replaces** the old "Superadmin Portal" manual guide — that portal was removed
> in Phase 2.

---

## Pre-flight

- [ ] Dev server running (`npm run dev`, http://localhost:3000)
- [ ] Supabase provisioned ([DATABASE_SETUP.md](./DATABASE_SETUP.md))
- [ ] One **ADMIN** account and one **MEMBER** account exist in `user_roles`
- [ ] Remember: the Admin Portal is mock — **a page refresh resets demo state to
      seed** by design. That's expected, not a bug.

---

## PHASE 1 — Role Gating

1. Logged out, visit `/owedbook` and `/admin-portal` → both redirect to `/auth`.
2. Log in as **MEMBER** → lands on `/owedbook`.
3. As MEMBER, type `/admin-portal` in the URL → **bounced to `/owedbook`** (not
   to login).
4. Log in as **ADMIN** → lands on `/owedbook`; the sidebar/nav exposes the Admin
   Portal.

✅ Member can't reach admin screens; the bounce goes to OwedBook, not `/auth`.

---

## PHASE 2 — OwedBook (`/owedbook`)

Visible to ADMIN and MEMBER.

1. **KPI tiles** render with dollar/script figures.
2. **Tabs** — Commercial / Updated / Federal / Summary each load their dataset
   (Updated = new-paid subset; Federal = rows with federal data; Summary =
   per-PBM aggregate).
3. **Filters** — date range, PBM multi-select, and the status dropdown narrow the
   table. The main screen shows an **active-filter count**.
4. **Pagination** — 25 rows/page; Previous/Next move pages.
5. **Upload** and **Get Fresh** — clicking shows a spinner then a success toast.
   ⚠️ These are **UI-functional mocks** — no file is read/stored, no real re-pull
   happens.
6. **Empty / no-match** — a filter combination with no rows shows the empty state.

---

## PHASE 3 — Admin Portal (`/admin-portal`, ADMIN only)

### My Stores
- Card per store; a glance summary reads e.g. **"4 stores · 2 need attention."**
- Click a store → **Store Detail**.

### Store Detail + Roster
- Member roster lists staff with **status pills** (active / invite-pending /
  suspended).
- Row actions are **status-dependent** (e.g. Suspend on an active member).
- **Suspend a member** → pill flips to suspended + toast + a new **Audit** entry.

### Invite Member (`stores/[id]/invite`)
- Form fields are **Email + Job title** (Pharmacist / Technician / Staff) + Send.
- ✅ **No password field. No access/permission dropdown.** (This is the one hard
  rule — confirm it visually.)
- Send → a **pending-invite row** appears in the roster.

### Billing
- Shows plans/amounts and store billing rows.
- ⚠️ **Visual only** — no real charge, and billing actions write **no** audit
  entry.

### Settings
- Edit a field, Save → toast. Refresh the page → value **resets to seed**
  (expected; mock state).

### Audit
- Newest entry on top; Result is **Done / Failed**.

### Add Store
- The Add-Store button opens a **harvest form** (name / NCPDP / NPI / address +
  a "Demo only — Phase 7" caption). Submitting drops a generic store card — the
  fields are local-state only (a facade for the frozen `addStore()`).

---

## PHASE 4 — Responsive & Theme (Gate M)

Run **every** screen above at three widths × both themes.

- [ ] **375px (mobile):** sidebar collapses to a **hamburger → slide-over**;
      tables become stacked cards; forms are centered and readable.
- [ ] **Tablet** (~768px): layout reflows cleanly, no horizontal scroll.
- [ ] **Desktop:** sidebar is persistent; tables are full tables.
- [ ] **Theme toggle** works in both the desktop nav and the **mobile menu**.
- [ ] Mobile menu **dismisses** on an outside tap and on Escape; picking a theme
      closes the menu cleanly (and doesn't fall through to a navigation).

✅ Mobile-first is a build-time gate — every control must be reachable at 375px.

---

## Quick Pass/Fail

| Check                                                        | Pass |
| ------------------------------------------------------------ | ---- |
| Member bounced from `/admin-portal` → `/owedbook`            | ☐    |
| OwedBook tabs + filters + pagination work                    | ☐    |
| Upload / Get-Fresh show success toast (mock)                 | ☐    |
| Suspend → pill + toast + audit entry                         | ☐    |
| Invite form has **no password, no permission dropdown**      | ☐    |
| Billing shows no charge and writes no audit                  | ☐    |
| Settings save, then refresh resets to seed                   | ☐    |
| All 6 admin screens correct at 375 / tablet / desktop        | ☐    |
| Theme toggle + mobile-menu dismiss behave                    | ☐    |

---

## Common Gotchas

| Symptom                                  | Cause                                              |
| ---------------------------------------- | -------------------------------------------------- |
| Admin demo changes vanish on refresh     | **Expected** — `useAdminDemoStore` isn't persisted |
| Upload "worked" but nothing ingested     | **Expected** — UI-functional mock (real = Phase 5) |
| Member sees no Admin Portal              | **Expected** — admin-only surface                  |
| `/admin-portal` redirects to `/owedbook` | You're signed in as a MEMBER, not ADMIN            |
