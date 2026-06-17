# UI_SPEC v1.2 — Cyber Pharma v1 / Phase 2

> **Reader:** Claudy. **Scope:** the 3 KIPs + the OwedBook screen + the two-surface shell split (see Amendment v1.2 below). **Tokens inherited from Phase 1** (`globals.css` v1.1) — do NOT reinstall or re-theme. Semantic utilities only, never numbered colors. Mist default, Slate via toggle. Saira / `--radius:0`.
> **Visual ground truth:** the OwedBook artifacts in `_design/phase2-reference/` (Mist, Slate, Federal-tab, mobile Mist, mobile Slate) — these are now BUILD TARGETS, not "do not build" reference. Match them.

---

## ⚠ AMENDMENT v1.2 — Two-Surface Split (READ FIRST — supersedes single-surface routing in §5)

**Context.** Phase 1's single admin surface is being split into **two distinct top-level surfaces**, toggled by a new top-navbar switcher. Same shell, same theme, same user menu — only the **left sidebar** and the **main route** differ. This is part of **Cluster 2** (it amends the screen's routing/shell). It supersedes the single-surface `/admin-portal` model previously implied in §5. The Admin Portal content is NOT redesigned here — it later inherits the MissionControl (Super Admin) design once that's settled.

### A. The two surfaces

**1. OwedBook — route `/owedbook`**

- **Post-login landing.** `/` redirects here.
- **Left sidebar: ONLY "Dashboard"** (shown active). No Users / Add Member / Profile.
- **Main pane:** the OwedBook screen (§5–§8). For now this is still the placeholder; B-3 paints the real screen here.
- Guard: `protectPage([AppRole.ADMIN])`.

**2. Admin Portal — route `/admin-portal`**

- **Left sidebar: ONLY** Users, Add Member, Profile.
- `/admin-portal` lands on the Users list — **redirect `/admin-portal` → `/admin-portal/users`**.
- **Main pane:** the existing user CRUD (`/admin-portal/users/*`) + Profile — wired exactly as they work now, files stay where they are. **Do NOT redesign or restyle** this surface.

### B. Top navbar (switcher)

Add two switcher links, **visible on both surfaces**:

- **"OwedBook"** → `/owedbook`
- **"Admin Portal"** → `/admin-portal`

Active link reflects the current surface (derive from `usePathname`). Leave the existing right-side cluster (theme toggle, user email, avatar menu) as-is. **No new global/Zustand state** — surface is route-derived. _(Note: the Navbar shown in the §5.1 layout diagram now also carries these two switcher links.)_

### C. Sidebar (surface-aware, ONE component)

The single `AdminSidebar` becomes **surface-aware**: it renders the OwedBook item-set on `/owedbook*` and the Admin item-set on `/admin-portal*`. One component, route-driven config — **no duplicate shells**.

### D. Scope discipline

This amendment = a routing/shell + nav change **plus** painting the OwedBook screen at the new `/owedbook` route. Nothing else changes. Do not invent new screens, redesign the Admin Portal, or touch Cluster 3 (service/mocks) work.

### E. Role-based access (members vs admins)

The two-surface switcher and the Admin Portal are ADMIN-only. Enforce on
BOTH layers — visibility AND route:

- **Top-nav switcher visibility (role-driven):**
  - **ADMIN** → navbar shows both switcher links (OwedBook ⇄ Admin Portal).
  - **MEMBER** → navbar shows NO switcher links at all (bare navbar: logo +
    theme toggle + user menu only). A member lands on `/owedbook` and stays
    there; they never see an Admin Portal link.
  - Role comes from the server-controlled role (same source as
    `protectPage` / the Profile role display) — never from `user_metadata`.

- **Route guard (server-side, not just hidden UI):**
  - `/admin-portal` and every `/admin-portal/*` route are guarded by
    `protectPage([AppRole.ADMIN])`. A MEMBER who types the URL directly is
    bounced (redirect to `/owedbook`), not served the page.
  - `/owedbook` is available to any authenticated user (ADMIN + MEMBER).
  - Hiding the link is UX; the route guard is the actual security boundary.
    Both are required — a hidden link with an open route is a hole.

### F. Universal Profile access (members + admins)

Every authenticated user — ADMIN and MEMBER — must be able to reach their
own profile to view account info and change their password. A member who
cannot change their password is a broken account; this is required for v1.

- **Access point — top-right user menu (UserMenu dropdown):** clicking the
  avatar/email cluster opens a dropdown containing a "Profile" link (plus
  existing items / sign-out). Visible to ALL roles on BOTH surfaces. This
  mirrors the original demo's F-icon → Profile pattern and is the canonical,
  universal access point.
- **Route:** `/profile` is a TOP-LEVEL route guarded
  `protectPage([AppRole.ADMIN, AppRole.MEMBER])` — moved OUT of the (admin)
  route group so members are not blocked by the admin-only guard. (Same
  shape as /owedbook.)
- **Self-scoped page (unchanged):** the existing My Profile screen — own
  email (read-only) + own role display + change-own-password. No admin
  powers; a member edits only their own account. Reuse as-is; just make it
  reachable.
- The Admin Portal sidebar "Profile" entry may point at the same `/profile`
  route or be dropped in favor of the dropdown (operator's taste). The
  dropdown is the universal access point either way.

---

## 1. Build Order (enforced)

KIPs FIRST, then the screen that consumes them. Hard gate G4.

1. KIP-1 DataTable → 2. KIP-2 MultiSelect → 3. KIP-3 EmptyState → 4. OwedBook screen.

---

## 2. KIP-1 — DataTable

**Purpose:** the OwedBook ledger. Reusable, column-driven, responsive.

**Desktop:**

- Dark header bar (`bg-secondary` / header token), white-ish header text, sortable columns (click toggles asc/desc, show the `↕`/`↓`/`↑` affordance)
- Zebra rows (`bg-card` / subtle alt)
- Right-aligned numeric columns with **tabular figures** (`tabular-nums`)
- Per-cell semantic color: positive Owed/Diff → `text-success`; negative → `text-destructive`; neutral → `text-foreground`
- Sticky header on scroll

**Mobile (< `md`) — card reflow (mandatory, Rule Zero):**

- One card per row (`bg-card border border-border`)
- Hero number = Owed (large, semantic-colored)
- Script + date as the card title/subtitle
- Remaining fields in a 2-col key/value grid
- A 10-column table cannot exist at 375px — this reflow is not optional

**Props (typed, no `any`):** column defs (key, label, align, numeric?, semanticColor?), rows, sort state + onSort, optional empty slot (renders KIP-3 when zero rows).

**Tokens only.** Component tests: renders columns, sorts, reflows to cards at mobile width, shows EmptyState when zero rows.

---

## 3. KIP-2 — MultiSelect (PBM filter)

**Purpose:** the PBM filter — the kit's `Select` is single-value only.

- Trigger shows selected-count summary ("All" when empty, "3 selected" otherwise)
- Open panel: searchable input + checkbox list + an "All" toggle that clears individual selections
- Closes on outside-click; keyboard accessible
- Tokens only; matches the `_design` filter-rail artifact

**Props:** options (string[]), selected (string[]), onChange. Component tests: select/deselect, "All" handling, search filters the list, count summary updates.

---

## 4. KIP-3 — EmptyState

**Purpose:** filtered-zero results.

- Centered: icon slot (lucide) + headline + sub-copy + optional action button
- Tokens only (`text-muted-foreground` for sub-copy)
- Reused by DataTable's empty slot and any future zero-state

**Props:** icon, headline, subcopy, optional action. Component test: renders all slots; action fires.

---

## 5. The OwedBook Screen (`/owedbook`)

Replaces the Phase-1 "Coming in Phase 2" placeholder, which **moves from `/admin-portal` to `/owedbook`** per Amendment v1.2 above. Lives behind `protectPage([AppRole.ADMIN])`. Matches `_design/phase2-reference/owedbook-metro-warm-mist.png` (and Slate / Federal / mobile variants).

### 5.1 Layout (desktop ≥ `lg`)

```
┌──────────────────────────────────────────────────────────┐
│ Header (Navbar — inherited; switcher links, theme, user)  │
├───────────────┬──────────────────────────────────────────┤
│ FILTER RAIL   │  DASHBOARD label + "OwedBook" title       │
│ (left, ~280)  │  subtitle: "Ledger-level clarity..."      │
│               │                                           │
│ Upload Data   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  (KPI tiles)│
│ From (date)   │  │red │ │blue│ │grn │ │mrn │             │
│ To (date)     │  └────┘ └────┘ └────┘ └────┘             │
│ Filter ▼      │                                           │
│ PBM (Multi)   │  Page N of M · Prev · Next · Limit/Total  │
│ Clear  Apply  │  ┌──────────────────────────────────────┐ │
│ ─────────     │  │ [tabs: Commercial · Updated ·        │ │
│ Get Fresh Data│  │  Federal · Summary]                  │ │
│               │  │ ┌──────────────────────────────────┐ │ │
│               │  │ │ DataTable (KIP-1)                 │ │ │
│               │  │ └──────────────────────────────────┘ │ │
│               │  └──────────────────────────────────────┘ │
└───────────────┴──────────────────────────────────────────┘
```

### 5.2 KPI Tiles (4)

Solid-color tiles, white uppercase label + bold value (Saira). Tokens: `bg-chart-1` (Commercial Underpaid, red), `bg-chart-2` (Commercial Scripts, blue), `bg-chart-3` (Updated Difference, green), `bg-chart-4` (Owed, maroon). Values from `owedBookService.getKpis(filters)`. **No numbered colors** — `--chart-*` only.

### 5.3 Tabs (4)

Active tab = coral underline/fill per the artifact. Each tab swaps the DataTable's columns + dataset via `owedBookService.getRows(tab, filters, page)`:

- **Commercial Dollars:** Date · Script · Qty · Medicaid Rate · Method · Expected · Original Paid · Owed · Report · Status
- **Updated Commercial Payments:** Date · Script · Original Paid · New Paid · Updated Difference
- **Federal Dollars:** Date · Script · Qty · AAC · Expected · Original Paid · Diff · Report
- **Summary:** PBM Name · Commercial Dollars · Federal Dollars (uses `getSummary`)

Zero rows → KIP-3 EmptyState inside the table area.

### 5.4 Filter Rail

From/To date inputs, Filter dropdown (kit `Select`), PBM MultiSelect (KIP-2), Clear + Apply buttons (coral Apply, outline Clear), Upload Data (coral, top) + Get Fresh Data (dark, bottom). **UI only** — Apply re-queries the service with the new filters; Upload/Get-Fresh are present but inert (Phase 5 wires them). Active-filter count shown ("0 filters active").

### 5.5 Status chips

`recovered`→success, `emailed_pbm`→info, `pending`→warning, `underpaid`→destructive, `new`→muted. Subtle bg via `bg-<token>/10 text-<token>` (the Phase-1 Y2 pattern). `null`→"—".

## 6. Responsive Transforms (Rule Zero — built mobile-correct, not fixed-up)

- **Filter rail → drawer below `lg`:** a "Filters" trigger with an active-count badge opens a slide-in drawer holding the whole rail.
- **KPI row → 2×2** below `md`.
- **Tabs → horizontal scroll strip** on mobile.
- **DataTable → card reflow** below `md` (KIP-1 owns this).
- Match `_design/phase2-reference/owedbook-mobile-mist.png` + `-slate.png`.
- Base target 375px.

## 7. Loading / Empty / Error

- Loading: skeleton rows in the table area while the service resolves (the service is async even when mock-backed).
- Empty: KIP-3 EmptyState.
- Error: inline `text-destructive` message + retry; the service mock won't error, but the path exists for the Phase-3 swap.

## 8. Accessibility

- DataTable: proper `<table>` semantics (or ARIA grid), sortable headers keyboard-operable, sort state announced.
- MultiSelect: keyboard nav, checkboxes labeled, panel focus-trapped.
- Filter drawer: focus-trap + Escape to close.
- WCAG AA contrast (the v1.1 dark tokens already tuned for dense numbers on `--card`).

## 9. Out Of Scope (UI)

OwedBook tabs beyond the 4 listed; real upload UI flow; reports viewer; settings; any superadmin surface; redesign of the Admin Portal content; anything Phase 3+.

## 10. Visual References

`_design/phase2-reference/`: `owedbook-metro-warm-mist.png` (primary desktop target), `owedbook-metro-warm-slate.png` (dark), `owedbook-federal-dollars.png` (Federal tab), `owedbook-mobile-mist.png` + `owedbook-mobile-slate.png` (mobile reflow targets). Style tile + tokens unchanged from Phase 1.

## 11. Conflict Resolution

If UI behavior isn't covered: check the `_design` artifact → check `DATA_CONTRACT` for the shape → check the Phase-1 patterns → STOP and surface. Don't invent screens, tabs, or primitives beyond the 3 KIPs.

## 12. Changelog

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3     | 2026-06-17 | Universal Profile access (Amendment §F). /profile moves OUT of the (admin) group to a top-level route guarded protectPage([ADMIN, MEMBER]); Profile link added to the top-right UserMenu dropdown, visible to all roles on both surfaces (mirrors the original demo's F-icon → Profile). Existing self-scoped My Profile page (own email/role + change own password) reused as-is. Closes the member-can't-change-password showstopper flagged in the B-3 plan's risk list. |

| 1.2 | 2026-06-17 | Role-based nav + route guard (Amendment §E). ADMIN sees both switcher links; MEMBER sees no switcher links (bare navbar) and lands on /owedbook. /admin-portal and /admin-portal/\* guarded by protectPage([AppRole.ADMIN]) — members hitting the URL directly are redirected to /owedbook. Visibility AND route both enforced; role from server-controlled source, never user_metadata. |
| 1.1 | 2026-06-17 | **Two-surface split (Amendment v1.1, read-first block above §1).** OwedBook screen relocates `/admin-portal` → `/owedbook` (post-login landing; `/` redirects there). `/admin-portal` becomes the Admin Portal surface (Users / Add Member / Profile; `/admin-portal` redirects to `/admin-portal/users`). New top-navbar switcher (OwedBook ⇄ Admin Portal); single surface-aware sidebar driven by `usePathname`. No new global state. Admin Portal content unchanged — inherits MissionControl design later. Part of Cluster 2. §5 heading route updated; §9 out-of-scope adds "redesign of Admin Portal content." |
| 1.0 | 2026-06-09 | Initial Phase 2 UI_SPEC. 3 KIPs (DataTable + card-reflow, MultiSelect, EmptyState) build-first; OwedBook screen (4 KPI tiles via `--chart-*`, 4 tabs, filter rail, pager, status chips); responsive transforms (rail→drawer, KPI→2×2, tabs→scroll, table→cards); tokens inherited from Phase 1, not reinstalled. |
