# COMPONENT MANIFEST — Cyber Pharma v1

> **Reader:** Claudy (Claude Code)
> **Purpose:** For every designed screen, the exact shadcn primitives it's built from, plus the primitives the kit is *missing* and must build first.
> **Companion:** `UI_SPEC.md` (behavior, scope, phasing) · `_design/` (visual artifacts) · style tile (token contract)
> **Rule:** Build only from this vocabulary. If a screen seems to need something not listed, STOP and surface it — don't invent a component.

---

## 1. Legend

- **✅ In kit** — ships with the Stark SaaS Starter; use as-is, themed by tokens.
- **🔨 Build first** — missing from the kit; must be added before the screen that needs it. See §4.
- **🧩 Composition** — not a new primitive; a documented arrangement of existing primitives (e.g. a KPI tile = a styled `div`, not a component).
- **Phase** — when the screen is built (per `UI_SPEC.md`). Phase 1 = foundation; Phase 2 = OwedBook + portals.

---

## 2. Primitive inventory (kit baseline)

These are the shadcn primitives the kit already provides and Phase 1 uses:

`Button` (default / outline / ghost) · `Input` · `Form` (+ `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`) · `Card` · `Dialog` · `Alert` (info / success / warning / destructive) · `Toast` · `Select` (single) · `DropdownMenu` · `Avatar` · `Badge` · `Separator` · `Skeleton` · theme toggle.

Anything beyond this list is either a 🧩 composition (§3) or a 🔨 build-first primitive (§4).

---

## 3. Per-screen breakdown

### Phase 1 — Foundation (built now)

| Screen | Primitives (✅ in kit) | Compositions (🧩) | Needs build (🔨) |
|---|---|---|---|
| `/` public landing (placeholder) | Button, Card, Avatar(logo), Separator | Header bar, Footer | — |
| `/login` | Form, Input, Button, Alert, Toast | Auth card layout | — |
| `/register` | Form, Input, Button, Alert, Toast | Auth card layout | — |
| `/forgot-password` | Form, Input, Button, Toast | Auth card layout | — |
| `/members-portal` (placeholder) | Card, Button | Centered "coming soon" panel | — |
| `/admin-portal` (placeholder) | Card, Button | Centered "coming soon" panel | — |
| `/access-denied` | Card, Button | Centered message panel | — |
| `/not-found` | Button | Branded 404 (kit default) | — |
| `/superadmin-portal` (inherited) | Table\*, Select, DropdownMenu, Button, Badge, Dialog, Toast | Sidebar nav, user-list panel | — \*(kit ships its own user table) |

> Phase 1 needs **no new primitives.** Everything is in the kit. The only Phase 1 build work on components is the **token migration** (move hardcoded `slate-800` / `red-600` onto semantic tokens) so the inherited screens theme correctly.

### Phase 2 — OwedBook + portals (design direction only; do NOT build in Phase 1)

| Screen / artifact | Primitives (✅ in kit) | Compositions (🧩) | Needs build (🔨) |
|---|---|---|---|
| OwedBook dashboard (Commercial / Federal / Updated / Summary tabs) | Tabs\*\*, Button, Select, Input, Badge | Filter sidebar, **KPI tile** (styled div, solid color, white text), pager, status chip | **DataTable**, **MultiSelect** (PBM), **EmptyState** |
| PBM filter (open dropdown state) | — | Filter group | **MultiSelect** |
| Mobile dashboard (Mist / Slate) | Button, Badge | **Filters drawer trigger**, 2×2 KPI grid, scroll-tabs, **table→card reflow** (card = composition of Card + key/value grid) | **DataTable** (drives the card reflow), **MultiSelect**, **EmptyState** |
| Marketing landing (desktop + mobile) | Button, Badge, Avatar | Split hero, product-frame mock, trust row, floating stat card | — (all composition) |

> \*\* `Tabs` may or may not be in the kit — **verify**; if absent it's a small build, lower risk than the three below.

---

## 4. Kit Improvement Proposals (🔨 build-first, Phase 2)

These three are absent from the kit and block the OwedBook. Build/spec them at the **start** of Phase 2, before any OwedBook screen.

### KIP-1 · DataTable
- **Why:** the OwedBook ledger is the core screen; the kit uses raw `<table>` markup with no sorting/pagination/density controls.
- **Needs:** column defs, right-aligned numeric columns with tabular figures, per-cell semantic coloring (Owed/Diff → `--success`/`--destructive`), sticky header, the dark header bar, zebra rows, and a **mobile card-reflow mode** (one card per row — this is what every mobile dashboard artifact shows).
- **Pairs with:** TanStack Table is the common shadcn choice; confirm against kit conventions.

### KIP-2 · MultiSelect
- **Why:** the PBM filter is a long, multi-value list (`All`, AssistRx, Caremark, OptumRx, …). The kit's `Select` is single-value only.
- **Needs:** searchable, multi-check, "All" handling, selected-count summary, open-panel state (shown in the `pbm_dropdown` artifact).

### KIP-3 · EmptyState
- **Why:** filtered tabs can return zero rows; `UI_SPEC.md` §7 requires empty states in Phase 2.
- **Needs:** icon slot, headline, sub-copy, optional action button. Reused across every data view.

---

## 5. KPI tile — explicitly a composition, not a primitive

To prevent a "KPITile component" from being invented: the KPI tile is a **styled `div`** — solid background (`--t-red` / `--t-blue` / `--t-green` / `--t-maroon`), white label (uppercase) + value (Saira, bold), flat corners. It's documented in the style tile. Build it as a small local presentational component if convenient, but it introduces **no new primitive** and needs no kit change.

---

## 6. Summary

| Item | Count / status |
|---|---|
| Phase 1 new primitives required | **0** |
| Phase 1 component work | Token migration only (hardcoded colors → tokens) |
| Phase 2 build-first primitives | **3** — DataTable, MultiSelect, EmptyState |
| Phase 2 to verify | `Tabs` presence in kit |
| Net-new "components" that are actually just compositions | KPI tile, filters drawer, card-reflow, hero blocks |

The headline: **Phase 1 adds nothing; Phase 2 adds exactly three primitives.** Everything else is composition or already in the kit.
