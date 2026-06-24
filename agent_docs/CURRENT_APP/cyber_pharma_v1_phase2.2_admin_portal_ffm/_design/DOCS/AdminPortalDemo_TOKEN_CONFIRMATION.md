# Token Confirmation — Admin Portal Demo Shell

> **Date:** 2026-06-23 · **Pairs with:** UI_SPEC_AdminPortalDemo_v1_0
> **Bottom line:** the demo shell inherits OwedBook's `globals.css` **verbatim**. Zero new brand colors, zero new tokens invented.

---

## 1. Source of truth

OwedBook's live entry stylesheet is **`src/app/globals.css`** (confirmed from the repo — `layout.tsx` imports `./globals.css`; `sass` is a dependency but the entry file is `.css`, so `ls src/app/globals.*` is the arbiter, not the presence of `sass`). It already carries the full **Metro Warm** system (Mist `:root` + Slate `.dark`), so the demo reads it directly.

## 2. Tokens the demo uses (all pre-existing)

- **Chrome:** `--navbar` / `--navbar-foreground` for the top bar; `--secondary` for the sidebar surface and the mobile drawer.
- **Surfaces:** `--background`, `--card`, `--border`, `--muted`, `--muted-foreground`.
- **Brand / actions:** `--primary` (coral) for primary buttons + active nav; `--ring` for focus.
- **Semantic (fixed meaning):** `--success` (active/recovered), `--warning` (pending/past-due), `--destructive` (suspended/lost), `--info` (counts/avatars).
- **Available, not yet needed:** `--chart-1..5` (the demo's owner dashboard is a card grid, not KPI tiles — but if a tile row is ever added, use `chart-*`, matching the OwedBook claims screen).
- **Type / shape:** `--font-brand` (Saira via `next/font`), `--radius: 0`.

No numbered Tailwind colors anywhere; every element reads a semantic token.

## 3. One deviation to confirm (the only flag)

In my renders the **top navbar is coral in BOTH modes**, matching the live OwedBook screenshots you sent. The source `globals.css` sets dark `--navbar: 221 16% 27%` (slate), which would render a *grey* navbar in dark mode — but the deployed app shows coral. So either the deployed build differs from the committed token, or the intent is coral-both-modes. **Please confirm which is canonical:**
- If coral both modes is intended → bump dark `--navbar` to a coral value (e.g. `12 88% 58%`, what I used).
- If slate-dark is intended → my dark renders should show a grey navbar; trivial to re-render.

Either way it's the **navbar only** (fixed chrome) — it doesn't touch any content token.

## 4. New tokens required

**None.** The demo introduces no new color or radius tokens. The only net-new *visual* is the "Demo · mock data" marker, built entirely from existing `--warning` + `--border` (see the style-tile delta).
