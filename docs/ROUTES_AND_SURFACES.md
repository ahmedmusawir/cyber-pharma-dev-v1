# Routes & Surfaces

> The App Router map for Cyber Pharma — every route group, what role gates it,
> and what it's for. Gating lives in each group's `layout.tsx` via
> `protectPage([...roles])` (see [AUTHORIZATION](./AUTHORIZATION.md)).

---

## Surface Map

| Path                         | Role gate                  | Purpose                                                        | Data source        |
| ---------------------------- | -------------------------- | ------------------------------------------------------------- | ------------------ |
| `/`                          | public                     | Marketing / landing page                                      | static             |
| `/auth`                      | public                     | Login + signup tabs (`AuthTabs`)                              | Supabase Auth      |
| `/access-denied`             | public                     | Friendly unauthorized page                                    | static             |
| `/owedbook`                  | **ADMIN + MEMBER**         | OwedBook reimbursement ledger — **post-login landing for any authed user** | mock service |
| `/profile`                   | any authed (redirects to `/auth`) | View/edit own profile                                  | Supabase           |
| `/admin-portal`              | **ADMIN** (else → `/owedbook`) | Admin Portal Demo Shell — My Stores                       | mock store         |
| `/admin-portal/stores/[id]`  | ADMIN                      | Store detail + member roster                                  | mock store         |
| `/admin-portal/stores/[id]/invite` | ADMIN                | Invite member (Email + Job title; no password)               | mock store         |
| `/admin-portal/billing`      | ADMIN                      | Billing (visual-only; no real charge)                        | mock store         |
| `/admin-portal/settings`     | ADMIN                      | Pharmacy settings                                            | mock store         |
| `/admin-portal/audit`        | ADMIN                      | Audit log (one row per admin mutation)                       | mock store         |
| `/moose-portal/*`            | ADMIN **+ env flag**       | Operator escape hatch — **real** user CRUD                    | real Supabase      |

---

## Route Groups

App Router route groups (`(name)`) organize layouts/gating without adding a URL
segment.

- **`(public)`** — `/`, `/access-denied`. No auth.
- **`(auth)`** — `/auth`. The login/signup surface.
- **`(admin)`** — wraps `/admin-portal/*`. Layout calls
  `protectPage([AppRole.ADMIN], { unauthorizedRedirect: "/owedbook" })` — a MEMBER
  who types an admin URL is bounced to their OwedBook landing, **not** to login.
  The layout also applies the admin content gutter so all six screens inherit it.
> There is no `(members)` route group. The starter kit shipped a `/members-portal`
> member portal; it was removed once OwedBook became the member surface. The live
> member experience is `/owedbook` + `/profile`, and the better of the two profile
> forms was salvaged into `/profile` (with a role-aware identity badge).

> Note: `/owedbook` and `/profile` live **outside** any route group (directly
> under `src/app/`). `/owedbook` carries its own `protectPage` in its layout;
> `/profile` redirects to `/auth` at the page level if there's no user.

---

## The Shared Authed Shell

`/owedbook` and `/admin-portal/*` both render inside `AuthedShell` — the shared
chrome: coral navbar + sidebar on desktop, hamburger + slide-over on mobile
(mobile-first is a build-time gate, not polish). The sidebar is surface-aware:
on OwedBook it renders the FilterRail; on the Admin Portal it renders the admin
nav (My Stores / Billing / Settings / Audit). A root-layout `NavigationSpinner`
overlay shows on primary navigation across all authed surfaces.

---

## The `/moose-portal` Escape Hatch

`/moose-portal` is an **off-books, env-gated, throwaway operator tool** with real
Supabase user CRUD. It exists because the Phase-2.2 work replaced
`/admin-portal`'s real user management with a state-only mock, and the operator
still needs a way to manage real test users.

- **Gating:** if `NEXT_PUBLIC_ENABLE_MOOSE_PORTAL !== "true"`, the entire route
  `notFound()`s (safe by default). When enabled, it additionally requires ADMIN.
- **Isolation:** it ships its own shell (`_shell/`) and lib (`_lib/`) — it shares
  **no** files with the Admin Portal demo, so the demo can evolve without
  touching it.
- **Lifecycle:** marked `TODO: REMOVE`. Delete `src/app/moose-portal/` plus the
  navbar Moose link when it's no longer needed.

---

## Cleanup Flags

- **`/moose-portal`** — intentional temporary tool; remove when test-user
  management moves elsewhere.

These are noted for the architect's call. The docs describe the tree as it is
today; removing dead routes is a separate, code-touching task.
