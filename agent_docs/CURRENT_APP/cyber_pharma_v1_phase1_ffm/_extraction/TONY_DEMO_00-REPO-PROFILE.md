# TONY_DEMO_00 — REPO PROFILE

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The repo is a Next.js 15 (App Router) + Supabase web application that reverse-engineers a Python pharmacy reimbursement desktop app into a browser-based OwedBook view. It is single-package, ~9,185 LOC across 131 TypeScript/TSX files, and uses Zustand for state, shadcn/ui (zinc) for components, and `@supabase/ssr` for cookie-bound auth. The hero feature is the OwedBook screen at `/admin-portal`. The repo contains no committed Supabase migration files, no generated database types, and no `.env*` files — schema and runtime configuration live entirely outside the source tree.

---

## Findings

### Project Identity

**EVIDENCE** — `package.json` declares `"name": "qr-next13-supabase-v1"` — vestigial name from a fork of a Next.js 13 + Supabase QR starter. The project is now Next 15.

**Source:** `package.json:2`

---

**EVIDENCE** — `README.md` contains a single line of project description: `"This is the reverse engineered python app into next.js for demo"`.

**Source:** `README.md:1-2`

---

**INFERENCE** — The repo's actual product purpose is a pharmacy reimbursement OwedBook UI. Project naming, README, and package metadata do not reflect this — the inference is built from pharmacy domain terminology in inline code (PBM names, AAC/WAC pricing, FIXED_FEE = 10.64, `pharma_*` table prefix, "Cyber Pharma" brand strings).

*Built on:*
- EVIDENCE: `src/app/(admin)/admin-portal/AdminPortalContent.tsx:260` — `<title>Admin – Owedbook</title>`
- EVIDENCE: `src/components/home/Hero.tsx:39-42` — `<h1>Cyber Pharma</h1><p>The Best Way To Manage Your Pharmacy Claims...</p>`
- EVIDENCE: `src/app/api/kpis/route.ts:159` — `const FIXED_FEE = 10.64;` (Alabama Medicaid dispensing fee)

---

### Stack & Runtime

**EVIDENCE** — Framework: Next.js 15.4.6, React 19.1.1, TypeScript 5, App Router. `next.config.js` configures aggressive no-cache headers globally (`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`).

**Source:** `package.json:33,36-37,55`; `next.config.js:7-28`

---

**EVIDENCE** — Auth and DB: Supabase via `@supabase/ssr@0.6.1` and `@supabase/supabase-js@2.44.0`. Three client variants exist:
- `src/utils/supabase/client.ts` — browser client (anon key)
- `src/utils/supabase/server.ts` — SSR client (cookie-bound, anon key)
- `src/utils/supabase/admin.ts` — service-role client (server-only writes)

**Source:** `package.json:23-24`; `src/utils/supabase/{client,server,admin}.ts`

---

**EVIDENCE** — State management: Zustand 4.5.4. Forms: `react-hook-form@7.51.5` + `@hookform/resolvers@3.6.0` + `zod@3.23.8`. UI: shadcn (style=default, baseColor=zinc) on Tailwind 3.4.1 with plugins `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`, `@shrutibalasa/tailwind-grid-auto-fit`, `tailwindcss-animate`. Icons: `lucide-react@0.394.0` and `@heroicons/react@2.1.5`.

**Source:** `package.json:13-43`; `components.json`; `tailwind.config.ts:77-82`

---

**EVIDENCE** — PDF and email: `pdfkit@0.17.1` (server-side report generation in `src/server/reports/pdf.ts`) and `mailcomposer@4.0.2` (EML composition in `src/app/api/reports/email/route.ts`). Custom ambient TypeScript declarations are provided for both: `src/types/{pdfkit.d.ts, pdfkit-standalone.d.ts, mailcomposer.d.ts}`.

**Source:** `package.json:32,35`; `src/server/reports/pdf.ts:2`; `src/app/api/reports/email/route.ts:3`

---

**EVIDENCE** — `better-sqlite3@11.10.0` is declared in `package.json` dependencies but has zero usages in `src/`. Verified via grep for `better-sqlite3|sqlite` across `src/` — no matches.

**Source:** `package.json:27`

---

**EVIDENCE** — Test infrastructure: Jest 30.0.5 + ts-jest 29.4.1, `testEnvironment: 'node'`, roots restricted to `<rootDir>/src`. Three test files exist (see Doc 09).

**Source:** `jest.config.js:5-19`; `package.json:46,51,54`

---

### File Tree (top 2 levels)

**EVIDENCE** — Top-level repo layout (excluding `.git`, `node_modules`, `_EXTRACTIONS`, `EXTRACTION_SKILLS`):

```
cyber-pharma-demo-for-frank/
├── README.md                     (1 line)
├── package.json
├── package-lock.json             (318,845 bytes)
├── next.config.js
├── tsconfig.json                 (baseUrl: src, @/* alias)
├── tailwind.config.ts
├── postcss.config.js
├── components.json               (shadcn: zinc, default style, css=app/globals.scss)
├── jest.config.js
├── .gitignore
├── public/                       (next.svg, vercel.svg only)
├── utils/                        (1 orphan file: reset_supabase_password.js)
└── src/
    ├── middleware.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── layout-org.tsx        (vestigial — see Doc 10)
    │   ├── globals.scss
    │   ├── not-found.tsx
    │   ├── favicon.ico
    │   ├── (admin)/              (admin-portal, profile, settings, layout, loading, not-found)
    │   ├── (auth)/               (auth, layout)
    │   ├── (members)/            (booking, members-portal, layout, loading, not-found)
    │   ├── (public)/             (page.tsx, demo/, old/, HomePageContent.tsx, layout, loading)
    │   ├── (superadmin)/         (superadmin-portal, layout, loading, not-found)
    │   ├── api/                  (auth/, kpis, pbm-email, reports/, user-data)
    │   ├── error/                (page.tsx)
    │   ├── providers/            (ThemeProvider.tsx)
    │   └── template/             (page.tsx, TemplatePageContent.tsx)
    ├── components/
    │   ├── admin/                (AdminBookingList, AdminSidebar, FiltersDrawerContext, FiltersPanel, ReportActions)
    │   ├── auth/                 (AuthTabs, LoginForm, Logout, RegisterForm)
    │   ├── common/               (BackButton, Box, Container, Main, Page, Row, Spinner)
    │   ├── dashboard/            (DashboardCard, sidebar/README.md)
    │   ├── global/               (5 navbars: Navbar, Navbar-1, NavbarHome, NavbarLoginReg, NavbarSuperadmin; ThemeToggler)
    │   ├── home/                 (Footer, Hero, Hero-1)
    │   ├── layout/               (AdminSidebar, Sidebar)
    │   ├── profile/              (ProfileContent, forms/{Personal,Contact,Organization}InfoForm.tsx)
    │   ├── settings/             (SettingsContent)
    │   └── ui/                   (17 shadcn primitives)
    ├── lib/utils.ts              (cn() helper only)
    ├── server/reports/pdf.ts     (server-side PDF generator)
    ├── services/                 (ClaimsServices + .test, jsonsrvPostServices, postServices)
    ├── store/                    (3 files — duplicate of stores/, see Doc 10)
    ├── stores/                   (useAuthStore, useJsonsrvPostStore, usePostStore, useUserDataStore + __tests__)
    ├── styles/global.scss        (vs app/globals.scss — see Doc 10)
    ├── types/                    (mailcomposer.d.ts, pdfkit-standalone.d.ts, pdfkit.d.ts, posts.ts, tailwind-merge.d.ts)
    └── utils/
        ├── common/commonUtils.ts (formatDate only)
        ├── jsonSrv/jsonsrvUtils.ts
        ├── supabase/             (actions, admin, client, fetchUserData, middleware + .org.ts dupes, server + .org.ts)
        ├── get-user-role.ts (+ .test.ts)
        └── slug.ts
```

**Source:** Directory listing of `src/` and repo root, 2026-05-02

---

### Code Volume

**EVIDENCE** — 131 TypeScript and TSX files in `src/`. Total lines including `.scss`: 9,185 across `src/`.

**Source:** `find src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l` → 131; `find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.scss" \) -exec wc -l {} +` → 9,185 total

---

**EVIDENCE** — The single largest source file is `src/app/(admin)/admin-portal/AdminPortalContent.tsx` at **748 lines** (the OwedBook hero component).

**Source:** `wc -l src/app/(admin)/admin-portal/AdminPortalContent.tsx` → 748

---

### Entry Points

**EVIDENCE** — Next.js entry: `src/app/layout.tsx` (root) → role-group layouts (`(admin)/layout.tsx`, etc.) → page components.

**Source:** `src/app/layout.tsx:21-41`

---

**EVIDENCE** — Edge entry: `src/middleware.ts` runs on every request except static asset routes. It delegates to `updateSession(request)` from `src/utils/supabase/middleware.ts` which refreshes the Supabase session cookie on each request (no auth gating, no redirects).

**Source:** `src/middleware.ts:1-19`; `src/utils/supabase/middleware.ts:36-37`

---

**EVIDENCE** — API routes (App Router conventions, all under `src/app/api/`):
- `auth/confirm/route.ts` (GET) — email OTP verify
- `auth/login/route.ts` (GET + POST) — POST: signInWithPassword; GET: scaffold ("Testing the route") that queries `posts` table
- `auth/logout/route.ts` (POST) — signOut
- `auth/logout/route-1.ts` — duplicate (Next ignores; only `route.ts` is the active export)
- `auth/signup/route.ts` (POST) — signUp with arbitrary user_metadata
- `auth/superadmin-add-user/route.ts` (POST) — byte-identical to signup (see Doc 07)
- `kpis/route.ts` (GET) — server-side KPI aggregation (~233 LOC)
- `pbm-email/route.ts` (GET) — PBM email lookup
- `reports/email/route.ts` (POST) — composes `.eml` with PDF attachments, updates `pharma_user_data.status`
- `reports/save/route.ts` (POST) — generates PDF, uploads to Supabase Storage `pharma_reports` bucket
- `user-data/route.ts` (GET) — main OwedBook data fetch with batch enrichment (~278 LOC)

**Source:** `src/app/api/**/route*.ts` listing, 2026-05-02

---

### Build / Run Commands

**EVIDENCE** — From `package.json` scripts:
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint` (no `eslint.config.*` found in repo — likely uses Next's default)
- `test`: `jest`

**Source:** `package.json:5-11`

---

### Deployment Posture

**GAP** — No `vercel.json`, no `Dockerfile`, no `.github/workflows/`, no `next-build` artifacts committed. Searched repo root and confirmed via Glob `**/*.json` (only `components.json`, `package.json`, `package-lock.json`, `tsconfig.json`).

**Implication for downstream:** Deployment configuration is environmental, not in-repo. Operator note (mission briefing) confirms the demo is currently deployed somewhere and Coach is using it for product vibing, but the platform binding is not visible from source.

---

**EVIDENCE** — Required environment variables (referenced in code but not in repo):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (used to decide cookie `secure` flag)
- `NEXT_PUBLIC_API_BASE_URL` (used by dead `postServices.ts` only)

**Source:** `src/utils/supabase/server.ts:7,11-12`; `src/utils/supabase/admin.ts:6-7`; `src/services/postServices.ts:1`

---

**EVIDENCE** — `.gitignore` excludes `.env*.local`, `.vercel`, `.next/`, `out/`. No `.env*` file is committed.

**Source:** `.gitignore:28,31`

---

### Theme & Branding

**EVIDENCE** — Brand color in OwedBook UI is orange (`text-orange-700`, `border-orange-600`, `bg-orange-50`). Brand string "Cyber Pharma" appears in: Hero, email body templates, and `app/(admin)/admin-portal/AdminPortalContent.tsx:261` meta description.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:330,348,427,525`; `src/components/home/Hero.tsx:39`; `src/app/api/reports/email/route.ts:37`

---

**EVIDENCE** — Logo URL is hardcoded to a Cloudinary asset (`res.cloudinary.com/dyb0qa58h/image/upload/v1696245158/company-4-logo_syxli0.png`) in `Navbar`, `NavbarLoginReg`, and `Footer`. `next.config.js` whitelists `res.cloudinary.com` for the Image component.

**Source:** `next.config.js:5`; `src/components/global/Navbar.tsx:78`; `src/components/global/NavbarLoginReg.tsx:12`; `src/components/home/Footer.tsx:102`

---

**EVIDENCE** — Root `metadata.title = "Moose Next Framework v3"` — vestigial template title, never updated.

**Source:** `src/app/layout.tsx:10`

---

## Open Questions

1. Which environment hosts the deployed demo (Vercel, Render, self-hosted)? Not visible from source.
2. Is the `posts` table in the operator's Supabase project real, empty, or absent? See Doc 10.
3. Where are the seed scripts / row counts for `pharma_*` tables documented? Not in repo.

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
