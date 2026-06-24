# Style-Tile Delta — Admin Portal Demo Shell

> **Date:** 2026-06-23 · **Pairs with:** UI_SPEC_AdminPortalDemo_v1_0 + the component states sheet
> **Verdict:** **near-zero delta.** OwedBook's existing design system (the `globals.css` tokens + shadcn primitives + the OwedBook style tile) already covers almost everything the demo needs. Only four small additions are genuinely new — and all are built from existing tokens, so this is a *delta*, not a new tile.

---

## Already covered by OwedBook (reused as-is, no delta)

Cards · buttons (primary/secondary/destructive) · inputs + selects · semantic status pills · tables → stacked-cards on mobile · breadcrumb · avatar · toasts · Saira type scale · flat (`--radius:0`). These come straight from OwedBook's tile / shadcn primitives; the demo adds nothing here.

## The four new bits to fold into the tile

1. **"Demo · mock data" marker pill** — `--warning` text on `--warning`/.14 fill, `--warning`/.4 border, sentence-case, small. Rides every demo page header (in content, not the navbar). The one element that signals "this is the mock shell."
2. **`invite_pending` pill** — uses the existing `--warning` pill; documented as a distinct *state label* ("Invite pending") so the invite flow and roster read consistently.
3. **Owner-scoped store card variant** — the MissionControl card reseated for OwedBook: `name + status pill` row · `NCPDP · {n} members` meta · divider · `Subscription` footer pill. Same card primitive, this content arrangement.
4. **Sidebar nav-item (active)** — in the `Command` sidebar on `/admin-portal`, the active item is `--primary` (coral) + bold, matching OwedBook's existing `AdminSidebar` active treatment. No new token; documented so the demo's owner-scoped items (My Stores / Billing / Settings / Audit) match.

## Not added

No new colors, no new radius, no new font weights, no new component primitives. Everything above is a composition of existing tokens + shadcn parts — which is why the recommendation is to **append these four to OwedBook's existing tile** rather than ship a separate admin tile.

> The component states sheet (`admin_component_states_*.png`) is the visual companion to this delta — it shows all of the above in default/hover/focus/loading/empty/error across Mist + Slate.
