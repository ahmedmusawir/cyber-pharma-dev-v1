# UI_SPEC v1.0 — Cyber Pharma v1 / Phase 2

> **Reader:** Claudy. **Scope:** the 3 KIPs + the OwedBook screen. **Tokens inherited from Phase 1** (`globals.css` v1.1) — do NOT reinstall or re-theme. Semantic utilities only, never numbered colors. Mist default, Slate via toggle. Saira / `--radius:0`.
> **Visual ground truth:** the OwedBook artifacts in `_design/phase2-reference/` (Mist, Slate, Federal-tab, mobile Mist, mobile Slate) — these are now BUILD TARGETS, not "do not build" reference. Match them.

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

## 5. The OwedBook Screen (`/admin-portal`)

Replaces the Phase-1 "Coming in Phase 2" placeholder. Lives behind `protectPage([AppRole.ADMIN])`. Matches `_design/phase2-reference/owedbook-metro-warm-mist.png` (and Slate / Federal / mobile variants).

### 5.1 Layout (desktop ≥ `lg`)

```
┌──────────────────────────────────────────────────────────┐
│ Header (Navbar — inherited, theme toggle, user menu)      │
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

OwedBook tabs beyond the 4 listed; real upload UI flow; reports viewer; settings; any superadmin surface; anything Phase 3+.

## 10. Visual References

`_design/phase2-reference/`: `owedbook-metro-warm-mist.png` (primary desktop target), `owedbook-metro-warm-slate.png` (dark), `owedbook-federal-dollars.png` (Federal tab), `owedbook-mobile-mist.png` + `owedbook-mobile-slate.png` (mobile reflow targets). Style tile + tokens unchanged from Phase 1.

## 11. Conflict Resolution

If UI behavior isn't covered: check the `_design` artifact → check `DATA_CONTRACT` for the shape → check the Phase-1 patterns → STOP and surface. Don't invent screens, tabs, or primitives beyond the 3 KIPs.

## 12. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-09 | Initial Phase 2 UI_SPEC. 3 KIPs (DataTable + card-reflow, MultiSelect, EmptyState) build-first; OwedBook screen (4 KPI tiles via `--chart-*`, 4 tabs, filter rail, pager, status chips); responsive transforms (rail→drawer, KPI→2×2, tabs→scroll, table→cards); tokens inherited from Phase 1, not reinstalled. |
