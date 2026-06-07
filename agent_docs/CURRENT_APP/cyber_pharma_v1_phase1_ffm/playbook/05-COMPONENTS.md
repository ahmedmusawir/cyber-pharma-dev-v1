# Playbook 05 — Sub-Phase 4: Components

> **Goal:** Install locked v1 tokens, delete superadmin route group, reconcile kit hardcoded colors, build landing page + placeholder portals, brand inherited auth screens.
> **AI time:** 2-3 hours | **Review time:** 30 min
> **Code produced:** Token install, deletions, pages, layouts, component tests

---

## Sub-Phase 4 Is The Biggest Sub-Phase

This is where Phase 1's foundation lands. Break it into discrete steps with mini-gates between them. Operator approves each step before next.

```
Step 1:  Token install (globals.css + tailwind.config.ts)
Step 2:  Saira font wiring (next/font/google)
Step 3:  Delete (superadmin) route group entirely
Step 4:  Delete /api/superadmin/* routes
Step 5:  Kit reconciliation (grep + migrate hardcoded colors)
Step 6:  Apply brand assets (logo files)
Step 7:  Build public marketing landing page (THE new screen)
Step 8:  Brand inherited auth screens (login, register, forgot-password)
Step 9:  Build /members-portal placeholder
Step 10: Build /admin-portal placeholder
Step 11: Verify role gates hold (protectPage at layout level)
Step 12: Verify error boundaries on every remaining route group
Step 13: Verify /access-denied page exists and works
Step 14: Component tests
```

Stop between each step (or logical groups — e.g. steps 1-2 together, 3-4 together). Surface to operator for approval before advancing.

---

## Step 1 — Token Install

Read the designer's locked token file: `agent_docs/CURRENT_APP/cyber_pharma_v1_phase1_ffm/_design/tokens/globals.css`.

**Action:**
1. Open the project's existing `src/app/globals.css` (or wherever the kit puts it)
2. Replace the `:root` and `.dark` token blocks with the designer's content **verbatim**
3. Preserve any `@tailwind` directives (base, components, utilities) at the top
4. Preserve the body `@apply` rules at the bottom

Then read `_design/tokens/tailwind.config.snippet.ts`.

**Action:**
1. Open the project's existing `tailwind.config.ts`
2. Merge the designer's `theme.extend` block into the existing config
3. Preserve the existing `content` paths
4. Add `tailwindcss-animate` to plugins if not already present
5. Confirm `darkMode: ["class"]` is set

**Verify:**
- `npx tsc --noEmit` clean
- `npm run dev` starts without errors
- Browser dev tools shows CSS variables on `:root` element

**Common stumbles:**
- Existing `:root` block has tokens for the OLD design system — replace, don't append
- `darkMode` was `"media"` not `"class"` — switch to `"class"` so theme toggle works
- The kit imports a CSS file that pre-fills tokens elsewhere — find and remove the conflict

---

## Step 2 — Saira Font Wiring

**Action:** In the root layout (`src/app/layout.tsx`):

```ts
import { Saira } from "next/font/google";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-brand"
});

// In the component:
return (
  <html lang="en" className={`${saira.variable}`}>
    {/* ... */}
  </html>
);
```

For Slate as default dark, add `dark` to className: `${saira.variable} dark`.

**Forbidden:**
- ❌ CDN `<link>` to Google Fonts (FOUT + performance)
- ❌ `@import` in CSS (same problems)

**Verify:**
- Body text renders in Saira
- View page source: `font-family` resolves via `--font-brand` CSS variable
- Network tab shows the font self-hosted by `next/font`, not from CDN

---

## Step 3 — Delete `(superadmin)` Route Group

Superadmin moves to its own repo (Super Admin Portal project). DELETE entirely:

```bash
# These commands. Run them.
rm -rf src/app/\(superadmin\)
```

This deletes:
- The `(superadmin)` folder
- All routes under it
- Any layout, page, error, loading files
- Any components nested under it

**Verify:**
- `find src/app -path "*\(superadmin\)*"` returns nothing
- `npx tsc --noEmit` clean (if any orphan imports, clean them up)

---

## Step 4 — Delete `/api/superadmin/*` Routes

Same deal — gone:

```bash
rm -rf src/app/api/superadmin
```

This deletes:
- `/api/superadmin/superadmin-add-user/` (the vulnerability)
- Any other superadmin API routes
- Their associated server actions and handlers

**Verify:**
- `find src/app/api -path "*superadmin*"` returns nothing
- `grep -rn "superadmin-add-user" src/` returns 0 matches
- `grep -rn "/api/superadmin" src/` returns 0 matches
- `npx tsc --noEmit` clean

---

## Step 5 — Kit Color Reconciliation

The starter kit has hardcoded numbered colors that DO NOT respond to tokens. Phase 1 migrates them.

**Action 1 — Inventory:**

```bash
grep -rn "slate-\|red-6\|red-5\|zinc-\|purple-6\|blue-6\|green-6\|gray-" src/components/ src/app/ | grep -v node_modules
```

Document every match. This is the migration target list.

**Action 2 — Migrate each match:**

| Hardcoded | Token replacement |
|---|---|
| `bg-slate-800` | `bg-card` (or `bg-secondary` depending on use) |
| `text-red-600` (error/destructive) | `text-destructive` |
| `text-green-600` (success) | `text-success` |
| `text-purple-600` (admin role label) | `text-primary` or a new semantic if intent differs |
| `bg-zinc-100` | `bg-muted` |
| `border-slate-200` | `border-border` |
| `text-gray-500` | `text-muted-foreground` |

When the intent is ambiguous, surface to operator. Don't guess.

**Action 3 — Re-verify after migration:**

```bash
# Should return 0 matches in src/components/ and src/app/
grep -rn "slate-\|red-6\|red-5\|zinc-\|purple-6\|blue-6\|green-6\|gray-" src/components/ src/app/ | grep -v node_modules
```

**Surfacing rule:** if a hardcoded color exists in third-party code (node_modules, generated files), it's not in scope. Phase 1 only migrates app code.

---

## Step 6 — Apply Brand Assets

Designer provides logo files. Operator drops them in `_design/`. Phase 1 copies into the app:

```bash
mkdir -p public/brand
cp _design/logo-color.svg public/brand/
cp _design/logo-mono.svg public/brand/
cp _design/favicon.ico public/  # or public/favicon.ico
```

Update root `app/icon.tsx` (or wherever the kit defines favicon) to use the new favicon.

Update `app/layout.tsx` metadata:

```ts
export const metadata: Metadata = {
  title: 'Cyber Pharma',
  description: 'Pharmacy revenue recovery — get back every dollar you're owed',
};
```

**Forbidden:**
- ❌ Keeping any "Moose Next Framework v3" or "Your Company, Inc." vestigial strings — grep and remove all
- ❌ Using JPG/PNG for logo when SVG is available (sharp at all sizes)

**Verify:**
- Favicon visible in browser tab
- `grep -rn "Moose\|Your Company\|next round of funding" src/` returns 0 matches
- Brand logo loads without errors

---

## Step 7 — Build Public Marketing Landing Page

This is **THE NEW SCREEN** for Phase 1. Per `_design/landing-page-desktop.png` and `_design/landing-page-mobile.png`.

**File:** `src/app/(public)/page.tsx`

**Content per designer's UI_SPEC v1.2 §3 / landing artifact:**

- **Header bar:**
  - Logo + "Cyber Pharma" wordmark (left)
  - Nav links: Features, How It Works, Pricing, Log In (center-right)
  - "START FREE TRIAL" CTA (coral fill, right-aligned)

- **Hero (split layout, mobile stacks):**
  - **Left column:**
    - Tag: "PHARMACY REVENUE RECOVERY" (uppercase, coral, label style)
    - Headline: "Get back every dollar you're **owed**" (Saira, large, "owed" in coral)
    - Subhead: "Cyber Pharma audits every claim against expected reimbursement and flags PBM underpayments to the cent — so independent pharmacies recover what they're owed."
    - CTA row: "START FREE TRIAL →" (coral primary, large), "▶ BOOK A DEMO" (outline)
    - Trust row: HIPAA-READY badge + "TRUSTED BY 200+ INDEPENDENT PHARMACIES"
  - **Right column:**
    - Product-frame mockup (placeholder image referencing future OwedBook screen)
    - Floating stat card bottom-right: "$12,627 recovered this month" (with success green check)

**Use ONLY:**
- ✅ Semantic tokens (`bg-primary`, `text-success`, `bg-card`, etc.)
- ✅ Shadcn primitives from kit (`Button`, `Card`, `Badge`)
- ✅ Saira via `--font-brand`

**Forbidden:**
- ❌ Numbered Tailwind colors anywhere
- ❌ Hardcoded hex
- ❌ Pixel-perfect copy of the artifact mockup's product frame (it's a stylized image, not a real component — use a placeholder image referencing it)

**Mobile target:** 375px. Match `_design/landing-page-mobile.png`. Header collapses to logo + hamburger; hero stacks vertical; CTAs full-width.

**Verify:**
- Visit `/` in browser → looks correct in both Mist (light) and Slate (dark)
- Toggle theme — page colors swap correctly
- View at 375px width — mobile layout looks correct
- Visual diff against `_design/landing-page-desktop.png` and `landing-page-mobile.png`

---

## Step 8 — Brand Inherited Auth Screens

`/login`, `/register`, `/forgot-password` exist from the starter kit. Phase 1 work = tokens only. NO logic changes.

**Action per screen:**

1. Swap hardcoded colors → semantic tokens (per Step 5 reconciliation table)
2. Apply Saira to headings (kit default font replaced via `--font-brand`)
3. Replace any kit logo with brand logo
4. Update copy: "Sign in to Cyber Pharma" etc.
5. Verify form behavior unchanged (still calls `authService.signIn`, etc.)

**Forbidden:**
- ❌ Rewriting the auth logic itself
- ❌ Changing form validation rules
- ❌ Changing Supabase wiring

The auth flow itself was audited. Don't touch the wiring; just restyle.

---

## Step 9 — Build `/members-portal` Placeholder

**File:** `src/app/(members)/members-portal/page.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth";

export default function MembersPortal() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold font-brand">Members Portal</h1>
      <p className="text-xl text-muted-foreground mt-2">Coming in Phase 2</p>
      <p className="mt-6">
        Your member dashboard is being prepared. Check back soon.
      </p>
      <Button onClick={signOut} variant="outline" className="mt-8">
        Sign Out
      </Button>
    </div>
  );
}
```

**Layout** (`src/app/(members)/layout.tsx`):

```tsx
import { protectPage } from "@/services/auth";

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  await protectPage(['member', 'admin']);  // NO 'superadmin' — it's gone
  return <>{children}</>;
}
```

---

## Step 10 — Build `/admin-portal` Placeholder

**File:** `src/app/(admin)/admin-portal/page.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth";

export default function AdminPortal() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold font-brand">Admin Portal</h1>
      <p className="text-xl text-muted-foreground mt-2">Coming in Phase 2</p>
      <p className="mt-6">
        Your pharmacy management dashboard is being prepared. Check back soon.
      </p>
      <Button onClick={signOut} variant="outline" className="mt-8">
        Sign Out
      </Button>
    </div>
  );
}
```

**Layout** (`src/app/(admin)/layout.tsx`):

```tsx
import { protectPage } from "@/services/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await protectPage(['admin']);  // NO 'superadmin' — it's gone
  return <>{children}</>;
}
```

---

## Step 11 — Verify Role Gates Hold

Manual walkthrough (operator does this):
- Register a member-role user → log in → try to access `/admin-portal` → redirected to `/access-denied`
- Promote to admin (via Supabase Dashboard `UPDATE user_roles SET role = 'admin'`) → access `/admin-portal` works
- Try to access `/` while logged in → works (public route)
- Log out → try `/admin-portal` → redirected to `/login`

If any gate fails, fix immediately. Don't advance.

---

## Step 12 — Verify Error Boundaries

Each remaining route group needs `error.tsx`:

```bash
ls src/app/\(public\)/error.tsx
ls src/app/\(auth\)/error.tsx
ls src/app/\(members\)/error.tsx
ls src/app/\(admin\)/error.tsx
```

All four must exist. (No `(superadmin)/error.tsx` — that group is deleted.)

Each boundary:
- Shows generic message ("Something went wrong")
- Has `reset()` button
- Uses semantic tokens (`text-destructive`)
- Does NOT leak internal error details

If any is missing, create using the starter kit's pattern.

---

## Step 13 — Build `/access-denied` Page

**File:** `src/app/(public)/access-denied/page.tsx`

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold font-brand">Access Denied</h1>
      <p className="mt-4 text-muted-foreground">
        You don't have permission to view that page.
      </p>
      <div className="flex gap-4 justify-center mt-8">
        <Button asChild><Link href="/">Back to home</Link></Button>
        <Button asChild variant="outline"><Link href="/login">Sign in as different user</Link></Button>
      </div>
    </div>
  );
}
```

Verify `protectPage` (or wherever the redirect logic lives) redirects unauthorized users here.

---

## Step 14 — Component Tests

In `src/components/__tests__/` or co-located `__tests__/`:

- LoginForm renders fields, calls `authService.signIn` on submit, shows error on failure
- RegisterForm renders fields, validates, calls `authService.register`
- AdminPortal placeholder renders correctly
- MembersPortal placeholder renders correctly
- AccessDenied renders correctly
- Components don't directly import Supabase (grep verification)

---

## Step 15 — Produce Completion Summary

```
## Sub-Phase 4 Complete

### What I Did
- Installed designer's locked v1 tokens (globals.css + tailwind.config.ts merge)
- Wired Saira via next/font/google
- Deleted (superadmin) route group entirely
- Deleted /api/superadmin/* routes entirely
- Reconciled kit hardcoded colors (N matches found, all migrated)
- Applied brand assets (logo, favicon, metadata)
- Removed vestigial template strings ("Moose Framework", "Your Company")
- Built public marketing landing page per _design/landing-page-desktop.png
- Branded inherited auth screens (logic preserved, tokens applied)
- Built /members-portal placeholder
- Built /admin-portal placeholder
- Verified role gates hold via protectPage
- Verified error boundaries on all 4 route groups
- Built /access-denied page
- Wrote component tests

### Files Created
- [list ~15-20 files]

### Files Modified
- src/app/globals.css (token install)
- tailwind.config.ts (token mapping)
- src/app/layout.tsx (Saira font, metadata)
- src/app/(auth)/login/page.tsx (tokens only)
- src/app/(auth)/register/page.tsx (tokens only)
- src/app/(auth)/forgot-password/page.tsx (tokens only)
- (kit reconciliation files — list them)

### Files DELETED
- src/app/(superadmin)/ (whole folder, N files)
- src/app/api/superadmin/ (whole folder, N files)

### Tests Run
- Vitest: all component tests passing
- npx tsc --noEmit: clean
- Manual role-gate walkthrough: all gates hold
- Manual theme toggle: Mist ↔ Slate swap works
- Manual landing page visual diff: matches _design/landing-page-desktop.png

### Concerns / Open Questions
- (none, or list)

### Proposed Sub-Phase 5 Plan
- Run full test suite
- Verify env var fail-closed
- npm run build clean
- Manual smoke walkthrough (full)
- Security smell greps
- Verify all 15 hard gates from APP_BRIEF

### Awaiting Approval
Ready to proceed to Sub-Phase 5 (Verification)?
Type "approved" or specify changes.
```

### Step 16 — Stop

Wait for operator approval.

---

## Verification Gate

Operator confirms:
- [ ] Designer's globals.css installed verbatim
- [ ] tailwind.config.ts maps tokens correctly
- [ ] Saira loaded via next/font/google
- [ ] `(superadmin)` route group GONE (grep verified)
- [ ] `/api/superadmin/*` routes GONE (grep verified)
- [ ] Kit hardcoded colors migrated (grep returns 0)
- [ ] Vestigial strings removed (grep verified)
- [ ] Landing page matches designer's artifact
- [ ] Auth screens branded (logic preserved)
- [ ] Placeholder portals work with role gates
- [ ] Error boundaries on all 4 remaining route groups
- [ ] /access-denied page works
- [ ] Component tests pass
- [ ] Theme toggle works (Mist ↔ Slate)

If any fail, fix before advancing.

---

## Common Stumbles

- AI tries to build OwedBook from `_design/phase2-reference/` → STOP. Phase 2 only.
- AI rewrites the auth UI logic → STOP. Only restyle.
- AI keeps "Moose Next Framework v3" or similar → grep and remove all template residue.
- AI skips error boundaries → must exist on every remaining route group.
- AI uses `dangerouslySetInnerHTML` → use `html-react-parser` or `react-markdown`.
- AI invents components not in UI_SPEC → push back. Manifest is authoritative.
- AI hard-codes brand color → refactor to use Tailwind class with `bg-primary`.
- AI installs tokens AFTER building pages → wrong order. Tokens first, ALWAYS.
- AI deletes superadmin route but forgets the API routes → both must go.
- AI leaves `'superadmin'` in protectPage allowedRoles arrays → strip it everywhere.
