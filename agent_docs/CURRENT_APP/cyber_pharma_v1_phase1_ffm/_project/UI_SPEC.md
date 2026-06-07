# UI SPEC — Cyber Pharma v1 / Phase 1: Foundation Skeleton (v1.2)

> **Scope:** Phase 1 only. Real screens land in Phase 2+.
> **Reader:** Claudy (Claude Code)
> **Companion:** `_design/` folder for visual references (locked v1 tokens, style tile, Phase 2 screen artifacts)

> **v1.2 revision notes (Architect):** Designer's v1.1 spec integrated VERBATIM with two surgical edits aligned to operator decisions: (1) §5.0 CONFIRM block resolved — Tailwind 3.4.1 confirmed via `grep tailwindcss package.json`, so the Tailwind 3 mechanic is locked (HSL no-wrapper, mapped via `tailwind.config.ts`); (2) all superadmin app sections REMOVED — superadmin moves to its own repo (separate Super Admin Portal project), this Phase 1 FFM is one app only.

> **v1.1 revision notes (Designer, preserved):** Phase 1 scope is unchanged — still placeholders + inherited auth + role-gating + error boundaries. What changed in v1.1: §5 now carries the **locked v1 design tokens** (the design language is finalized), token mechanics are corrected to the accurate shadcn pattern, §6 gains Phase-2 responsive guidance, §10 lists the real `_design/` artifacts. No new screens. No Phase 2 features. The out-of-scope fence in §9 still holds.

---

## 1. Phase 1 Screens — The Complete List

Phase 1 ships **placeholder screens** for the role-gated portals + ONE new branded landing page. No real features.

### Main App (`cyber-pharma-v1`) — ONE app only

| Route | Route Group | Status | Description |
|---|---|---|---|
| `/` | `(public)` | NEW | Public marketing landing page — per `_design/landing-page-desktop.png` |
| `/login` | `(auth)` | INHERITED | Starter kit login, branded with v1 tokens |
| `/register` | `(auth)` | INHERITED | Starter kit register, branded with v1 tokens |
| `/forgot-password` | `(auth)` | INHERITED | Starter kit forgot-password, branded with v1 tokens |
| `/members-portal` | `(members)` | NEW PLACEHOLDER | "Coming in Phase 2" page, role-gated to `member` + `admin` |
| `/admin-portal` | `(admin)` | NEW PLACEHOLDER | "Coming in Phase 2" page, role-gated to `admin` |
| `/access-denied` | `(public)` | NEW | Shown when role gate redirects |
| `/not-found` | `(public)` | INHERITED | Starter kit 404, branded with v1 tokens |

### Routes to DELETE entirely

| Route / Path | Reason |
|---|---|
| `src/app/(superadmin)/` | Whole route group — superadmin moves to its own repo |
| `src/app/api/superadmin/*` | All superadmin API routes — moved to separate project |
| `src/app/api/superadmin/superadmin-add-user/` | TONY_DEMO vulnerability — delete on sight regardless of #1 |
| Any superadmin user management UI components | Moving to Super Admin Portal project |

---

## 2. Layout & Navigation

### Main App Layout

```
┌─────────────────────────────────────────────────┐
│ Header (logo, nav links, user menu if logged in)│
├─────────────────────────────────────────────────┤
│                                                 │
│   Main content (per route)                      │
│                                                 │
├─────────────────────────────────────────────────┤
│ Footer (brand, copyright, basic links)          │
└─────────────────────────────────────────────────┘
```

Header-only nav for Phase 1 (the OwedBook filter sidebar comes in Phase 2).

> **Phase 2 forward note (not built now):** the Phase 2 main-app dashboard introduces a left filter rail on desktop that **collapses into a slide-in drawer below the `lg` breakpoint** (see §6). Phase 1 header-only nav must not hard-code assumptions that block this later.

---

## 3. Per-Screen Specs

### `/` (Main App Public Landing) — THE NEW SCREEN

**Purpose:** Branded marketing landing page. Per designer's `_design/landing-page-desktop.png` (desktop) and `_design/landing-page-mobile.png` (mobile).

**Content (per the landing artifact):**
- Header: logo + "Cyber Pharma" wordmark, nav links (Features, How It Works, Pricing, Log In), "Start Free Trial" CTA (coral fill, right-aligned)
- Hero left column:
  - Tag: "PHARMACY REVENUE RECOVERY" (uppercase, coral, label style)
  - Headline: "Get back every dollar you're **owed**" (Saira, large, the word "owed" in coral)
  - Subhead: "Cyber Pharma audits every claim against expected reimbursement and flags PBM underpayments to the cent — so independent pharmacies recover what they're owed."
  - CTA row: "START FREE TRIAL →" (coral primary), "▶ BOOK A DEMO" (outline)
  - Trust row: HIPAA-READY badge + "TRUSTED BY 200+ INDEPENDENT PHARMACIES"
- Hero right column: product-frame mockup (a stylized image of the future OwedBook screen — composition, not a real component; Phase 2's actual UI is what gets photographed here later)
- Floating stat card on bottom-right of mockup: "$12,627 recovered this month" (success green check)

**Behavior:**
- Server-rendered (no client state needed)
- Responsive (mobile-first per `_design/landing-page-mobile.png`)
- All colors via semantic tokens (`bg-primary`, `text-success`, etc.) — NEVER numbered Tailwind colors
- CTAs link to `/register` (Start Free Trial) and a placeholder `#book-demo` anchor for the demo button

**Style:** Apply locked v1 tokens. Saira font everywhere. Metro flat (radius 0).

### `/login` (Inherited, Rebrand)

**Purpose:** Sign-in flow. Inherited from starter kit. Phase 1 work = tokens only.

**Content:**
- Email field (validated via Zod)
- Password field
- "Sign In" button (semantic `bg-primary`)
- "Forgot password?" link → `/forgot-password`
- "Don't have an account? Register" → `/register`

**Behavior:**
- Form validation client-side (react-hook-form + Zod)
- On submit: call `authService.signIn(email, password)`
- On success: redirect to role-appropriate landing:
  - `member` → `/members-portal`
  - `admin` → `/admin-portal`
- On failure: show inline error using `text-destructive`

**Forbidden:** No direct Supabase calls in component. All flows via `authService`.

### `/register` (Inherited, Rebrand)

**Purpose:** New user sign-up. Inherited from starter kit. Phase 1 work = tokens only.

**Content:**
- Email field (validated)
- Password field (min length, complexity per starter kit)
- Confirm password field
- "Register" button (semantic `bg-primary`)
- Link back to `/login`

**Behavior:**
- Call `authService.register(email, password)`
- Trigger `handle_new_user()` creates `user_roles` row with default `member` role
- On success: redirect to `/members-portal`
- On failure: inline error using `text-destructive`

### `/admin-portal` (Main App Placeholder)

**Purpose:** Role-gated landing for admin users. Placeholder content in Phase 1.

**Content:**
- Page title: "Admin Portal" (Saira heading)
- Subtitle: "Coming in Phase 2" (`text-muted-foreground`)
- Brief copy: "Your pharmacy management dashboard is being prepared. Check back soon."
- Logout button

**Behavior:**
- Layout-level role check via `protectPage(['admin'])`
- Member-role users redirected to `/access-denied`
- Unauthenticated users redirected to `/login`

### `/members-portal` (Main App Placeholder)

**Purpose:** Role-gated landing for member users. Placeholder content in Phase 1.

**Content:**
- Page title: "Members Portal" (Saira heading)
- Subtitle: "Coming in Phase 2" (`text-muted-foreground`)
- Brief copy: "Your member dashboard is being prepared. Check back soon."
- Logout button

**Behavior:**
- Layout-level role check via `protectPage(['member', 'admin'])`
- Unauthenticated users redirected to `/login`

### `/access-denied` (Public)

**Purpose:** Shown when role gate redirects a user.

**Content:**
- Page title: "Access Denied" (Saira heading)
- Subtitle: "You don't have permission to view that page."
- Link: "Back to home" or "Sign in as different user"

**Behavior:**
- Public route, no auth required
- Static content

### `/not-found` (Inherited, Rebrand)

**Purpose:** Branded 404.

**Content:** Starter kit's default, with v1 tokens applied.

---

## 4. Error Boundaries

Every route group MUST have an `error.tsx` boundary file. The starter kit may already have a global one — Phase 1 verifies one exists in each group:

- `src/app/(public)/error.tsx`
- `src/app/(auth)/error.tsx`
- `src/app/(members)/error.tsx`
- `src/app/(admin)/error.tsx`

**Note:** No `(superadmin)/error.tsx` — that whole route group is being deleted.

Each error boundary:
- Shows a generic error message ("Something went wrong")
- Has a "Try again" button (uses `reset()` from Next.js error props)
- Logs the error (to console for Phase 1; structured logger lands in Phase 8)
- Does NOT leak internal error details to the UI (security)
- Uses semantic tokens — `text-destructive` for error messaging

---

## 5. Design System — v1 Tokens (Phase 1 installs the real foundation)

> **Change from v1.0:** the v1 design language is now **locked** (see `_design/` style tile and `_design/tokens/globals.css`). Phase 1 therefore installs the *real* token foundation rather than placeholders — same effort, zero Phase 2 rework. The full Metro-flat aesthetic (uppercase labels, solid KPI tiles, card-reflow tables, etc.) is applied to **real screens in Phase 2**; Phase 1 only needs the tokens + base primitives below + the landing page.

### 5.0 🔒 LOCKED — Tailwind version & color space

**Confirmed via `grep tailwindcss package.json`:** `tailwindcss@^3.4.1`.

**Mechanic locked:**
- Tokens are CSS variables in `globals.css` (`:root` for Mist, `.dark` for Slate)
- HSL format, **no `hsl()` wrapper** (e.g. `--primary: 12 93% 64%;`)
- Mapped in `tailwind.config.ts` as `primary: 'hsl(var(--primary))'`
- See `_design/tokens/globals.css` for the complete locked token file
- See `_design/tokens/tailwind.config.snippet.ts` for the mapping snippet

This is the classic shadcn convention. Files are READY-TO-COPY in `_design/tokens/`.

### 5.1 Brand & semantic tokens (locked values)

Hex shown for human reference; HSL triplet is the source of truth (see `_design/tokens/globals.css`).

| Token | Role | Light value (Mist) | Dark value (Slate) |
|---|---|---|---|
| `--primary` | CTAs, active nav/tab, accent | `#f9704f` coral | `#f9704f` coral |
| `--primary-foreground` | text on primary | `#ffffff` | `#ffffff` |
| `--background` | app canvas | `#e2e5ea` (Mist) | `#2e3440` (Slate) |
| `--foreground` | primary text | `#252a33` | `#e0e4ec` |
| `--card` / `--popover` | surfaces | `#ffffff` | `#2e3440` |
| `--muted-foreground` | secondary text/labels | `#5f6878` | `#96a0b4` |
| `--border` / `--input` | dividers, field borders | `#b8bdc7` | `#404856` |
| `--ring` | focus ring | `#f9704f` | `#f9704f` |
| `--success` | recovered / positive owed | `#2f9e44` | `#4ade80` (brightened) |
| `--destructive` | underpaid / money lost | `#d6322c` | `#fb7185` (brightened) |
| `--info` | neutral counts (scripts) | `#2f7ce0` | `#2f7ce0` |
| `--warning` | pending / attention | `#e8a008` | `#e8a008` |
| `--radius` | global corner radius | `0` (Metro flat) | `0` |

**Data-viz / KPI tile colors** (Phase 2 dashboard, listed here so the palette is complete): red `#d6322c`, blue `#2f7ce0`, green `#2f9e44`, maroon `#b0282b`, coral `#f9704f`. Available as `--chart-1` through `--chart-5`.

**Theme modes:** four are defined — **Bright** (`#ffffff`), **Mist** (`#e2e5ea`, the default light), **Slate** (`#2e3440`, the default dark), **Dark** (`#191c24`). **Phase 1 ships Mist (light) + Slate (dark)** wired to the existing theme toggle. Bright and Dark are catalogued in `THEME_LIBRARY.md` (factory-level doc) for later.

> **Semantic rule (non-negotiable):** `--success`/`--destructive`/`--info` carry **fixed financial meaning** across every theme — recovered is green, money-lost is red, neutral is blue. The brand `--primary` (coral) is **never** used for a status. This is what keeps the OwedBook honest in Phase 2.

### 5.2 Typography

- **Brand font:** **Saira** (`--font-brand`), loaded via `next/font/google`. NEVER via a CDN `<link>` (FOUT + performance).
- Page titles: `text-3xl`/`text-4xl`, light-to-regular weight (the v1 "OwedBook" title is Saira 300).
- Section titles: `text-xl font-semibold`.
- Body: `text-base`. Small print: `text-sm text-muted-foreground`.
- **Labels** (v1 signature): uppercase, `font-semibold`, `tracking-wide`. Apply via a utility/class, not per-element.

Weights to load: `["300", "400", "500", "600", "700", "800"]`.

### 5.3 Token wiring rule (the one that matters)

Components read **semantic, token-backed utilities only** — `bg-primary`, `text-destructive`, `bg-card`, `border-border`. **Never** Tailwind's numbered palette (`bg-slate-800`, `text-red-600`). The numbered classes do not respond to the token file and silently break theming.

🔒 **Kit reconciliation task (Phase 1 mandatory):** the starter kit currently hardcodes some colors (`dark:bg-slate-800`, role labels `text-red-600`, etc.). Phase 1 migrates those onto tokens so the theme is actually centralized. Run `grep -rn "slate-\|red-6\|zinc-\|purple-6\|blue-6" src/` upfront to inventory before migrating.

### 5.4 Component tokens (Phase 1)

shadcn primitives used as-is, themed by the tokens above:
- Button (default, outline, ghost variants)
- Input
- Form / FormField / FormItem / FormLabel / FormControl / FormMessage
- Card
- Dialog
- Alert (info, success, warning, destructive)
- Toast
- Avatar (logo presentation)
- Badge (HIPAA-READY badge on landing page)
- Separator

🔒 **Phase 2 primitives (do NOT build in Phase 1, flagged here so the kit roadmap is honest):** **DataTable**, **MultiSelect** (the PBM filter), and **EmptyState** — all three are absent from the kit and required by the OwedBook. Tracked as Kit Improvement Proposals in `_design/COMPONENT_MANIFEST.md`.

---

## 6. Mobile Breakpoints & Responsive Rules

Tailwind defaults are the official scale:

- `sm`: 640px+ · `md`: 768px+ · `lg`: 1024px+ · `xl`: 1280px+ · `2xl`: 1536px+

**Mobile-first base design target is 375px** (Rule Zero). Phase 1 pages must look good at 375 first, then scale up.

The landing page MUST be tested at 375 against `_design/landing-page-mobile.png`.

> **Phase 2 forward rules (documented now, built later)** — derived from the approved mobile artifacts in `_design/phase2-reference/`:
> - **Filter rail → drawer:** the desktop left filter rail collapses into a full-width "Filters" trigger (with active-count badge) opening a slide-in drawer **below `lg`**.
> - **KPI tiles:** 4-across on desktop → **2×2** on mobile.
> - **Tabs:** horizontal scroll strip on mobile.
> - **Wide table → cards:** the OwedBook ledger table (≈10 columns) **reflows into stacked cards** on mobile — one card per script, the Owed value as the hero number, remaining fields in a 2-col detail grid. A 10-column table cannot exist at 375px; this reflow is mandatory, not optional.
> - **Tablet (`md`):** treated as a transition, not a bespoke layout — KPIs 2×2 (wider), sidebar still a drawer. No separate tablet artifact by design.

---

## 7. Loading & Empty States

Phase 1 placeholder pages don't have rich data, so loading states are minimal:

- Login form: spinner on Sign In button while submitting
- Register form: same
- Landing page: server-rendered, no loading state needed

Empty states aren't needed in Phase 1 (no lists). *(Phase 2 needs them — the EmptyState primitive in §5.4 — for filtered tabs with zero rows.)*

Error states:
- Form validation errors inline (red text under field, using `--destructive`)
- API failures via toast (top-right, dismissible)

---

## 8. Accessibility (Phase 1 Baseline)

Phase 1 establishes the a11y baseline:
- All forms have labels
- All buttons have accessible names (text or aria-label)
- Color contrast meets WCAG AA — **note:** `--success`/`--destructive` are used as small colored text in Phase 2 dense tables, so their light- and dark-mode values are already contrast-checked against `--card` in both modes (style tile verifies). Do not lighten them.
- Keyboard navigation works on every interactive element
- Focus visible on all focusable elements (uses `--ring`)

Phase 8 may add more a11y rigor (HIPAA-adjacent considerations).

---

## 9. Out of Scope For Phase 1 UI

These do NOT ship in Phase 1 (their `_design/phase2-reference/` artifacts are **visual direction only**):

- ❌ OwedBook screens (Phase 2)
- ❌ Filter sidebar with PBM dropdown / MultiSelect (Phase 2)
- ❌ KPI tiles (Phase 2)
- ❌ Tabs UI / DataTable (Phase 2)
- ❌ Imports page (Phase 5)
- ❌ Reports viewer (Phase 6)
- ❌ Settings pages (Phase 2)
- ❌ Multi-store admin UI (Phase 7)
- ❌ Stripe checkout / billing UI (Phase 7)
- ❌ MFA UI (Phase 8)
- ❌ Superadmin UI (moving to its own repo entirely)
- ❌ ANY deployment work (separate department)

If Claudy is tempted to build any of the above, STOP. The polished dashboard/mobile artifacts in `_design/phase2-reference/` are Phase 2 reference — beautiful, finished, and **not for this phase**.

---

## 10. Visual References — `_design/` manifest

| File | Type | Phase 1 role |
|---|---|---|
| `style-tile.png` (and `.html` if shipped) | Style tile | **FOUNDATION** — the token + type + component contract. Source of truth for §5. |
| `tokens/globals.css` | Tokens | **FOUNDATION** — ready-to-copy, Tailwind 3 / HSL / no-wrapper |
| `tokens/tailwind.config.snippet.ts` | Tokens | **FOUNDATION** — mapping snippet for `tailwind.config.ts` |
| `landing-page-desktop.png` | Landing, desktop | **PHASE 1 BUILD TARGET** — this is the new screen |
| `landing-page-mobile.png` | Landing, mobile | **PHASE 1 BUILD TARGET** — mobile companion |
| `COMPONENT_MANIFEST.md` | Manifest | **FOUNDATION** — which primitives for which screen |
| `phase2-reference/owedbook-metro-warm-*.png` | Dashboard variants | Phase 2 direction — DO NOT BUILD |
| `phase2-reference/owedbook-mobile-*.png` | Dashboard mobile | Phase 2 direction (defines the drawer + card-reflow rules in §6) |
| `phase2-reference/owedbook-federal-dollars.png` | Tab variant | Phase 2 direction — DO NOT BUILD |

**HTML is the load-bearing reference** (exact tokens, spacing, structure to read/copy); **PNG is the QC target** (the picture to match the build against).

Factory-level companion docs (outside FFM, at `agent_docs/app_factory/design-system/`):
- `GLOBAL_DESIGN_SYSTEM_HANDBOOK.md` — doctrine for how the factory designs apps
- `THEME_LIBRARY.md` — catalog of named themes (Mist, Slate, Bright, Dark + per-tenant pattern)

---

## 11. Conflict Resolution

If a UI behavior question arises that this spec doesn't cover:

1. Check `_design/style-tile.png` first (visual contract)
2. Check `_design/tokens/globals.css` for token values (executable source of truth)
3. Check `_design/COMPONENT_MANIFEST.md` for primitive mapping
4. Check the starter kit's defaults
5. STOP and surface to operator

🔒 Don't invent UI behavior. Don't add screens not listed here. Don't introduce new primitives — flag as KIP per the manifest.

---

## 12. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-03 | Initial UI_SPEC for Cyber Pharma v1 Phase 1. Two apps. Placeholder pages + inherited starter kit screens + role-gating + error boundaries + design system scaffolding. |
| 1.1 | 2026-06-04 | Designer pass. Phase 1 scope unchanged. §5 upgraded to locked v1 tokens (coral primary, Saira, `--radius:0`, full semantic set, 4 theme modes) + corrected token mechanics + semantic-utilities-only rule + kit hardcoded-color reconciliation task. §5.0 flagged Tailwind 3-vs-4 ambiguity. §6 added Phase 2 responsive rules. §10 replaced with real `_design/` manifest. §5.4 flagged 3 missing Phase 2 primitives. |
| 1.2 | 2026-06-04 | Architect pass on top of designer's v1.1: §5.0 LOCKED with Tailwind 3.4.1 confirmed (per `grep tailwindcss package.json`). ALL superadmin app sections REMOVED — superadmin moves to its own repo (separate Super Admin Portal project). Landing page promoted to PHASE 1 BUILD TARGET (the one new screen). Per-screen specs updated to reflect single-app scope and locked tokens. `protectPage()` examples no longer reference `'superadmin'`. |
