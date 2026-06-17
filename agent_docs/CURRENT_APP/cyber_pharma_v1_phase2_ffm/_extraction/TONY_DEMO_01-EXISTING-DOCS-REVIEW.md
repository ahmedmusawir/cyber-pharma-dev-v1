# TONY_DEMO_01 — EXISTING DOCS REVIEW

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The repo's authored documentation surface is essentially empty. The root `README.md` is a single sentence; the only other Markdown file in `src/` is a 4-line placeholder inside a sidebar component folder. There is no `/docs` directory, no `CHANGELOG`, no `CONTRIBUTING`, no architecture document, and no JSDoc of substance. Most of this document is GAPs — and that itself is the most important finding for the IGNITION phase: nothing in this repo "claims" to be anything; downstream consumers cannot rely on documented contracts.

---

## Findings

### Authored Markdown Inventory

**EVIDENCE** — Two Markdown files exist inside the target codebase (excluding `EXTRACTION_SKILLS/` and `_EXTRACTIONS/`):
- `README.md` (1 sentence)
- `src/components/dashboard/sidebar/README.md` (4 lines)

**Source:** Glob `**/*.md` excluding extraction folders, 2026-05-02

---

### Claims in `README.md`

**CLAIM** — "This is the reverse engineered python app into next.js for demo"

**Source:** `README.md:2`

**Verification status:** PARTIALLY CONFIRMED.
- "Reverse engineered" — supported by inline comments referencing "Python logic" in 5 places (e.g., `src/app/api/user-data/route.ts:198,215,217,223`; `src/app/api/kpis/route.ts:140,158,161,166`).
- "Python app" — the desktop counterpart (Frank Tant's Tkinter monolith) is not in this repo; verification requires cross-reference with the `FRANK_DESKTOP_*` extraction set.
- "into next.js" — CONFIRMED by stack inspection (Next.js 15.4.6 in `package.json:33`).
- "for demo" — supported by hardcoded fallback dates (`ReportActions.tsx:34-35`) and seeded-DB INFERENCE.

---

### Claims in `src/components/dashboard/sidebar/README.md`

**CLAIM** — "This folder will contain the filters UI for the Owedbook dashboard. Phase 1: placeholder only."

**Source:** `src/components/dashboard/sidebar/README.md:1-5`

**Verification status:** CONTRADICTED by current code state. The folder contains only this README. The active filters UI lives elsewhere at `src/components/admin/FiltersPanel.tsx` (used by `AdminSidebar.tsx` and the mobile Dialog in `AdminPortalContent.tsx`).

**EVIDENCE** — `src/components/dashboard/sidebar/` directory listing returns only `README.md` — no implementation files.

**Source:** Directory listing of `src/components/dashboard/sidebar/`, 2026-05-02

**EVIDENCE** — Active filters UI is `src/components/admin/FiltersPanel.tsx`, imported by `src/components/admin/AdminSidebar.tsx:4` and `src/app/(admin)/admin-portal/AdminPortalContent.tsx:10`.

**Source:** `src/components/admin/FiltersPanel.tsx`; `src/components/admin/AdminSidebar.tsx:4`; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:10`

---

### Inline Code Documentation

**EVIDENCE** — A small set of explanatory comments are embedded in the data-layer routes:
- `src/app/api/user-data/route.ts:53` — `// TEMP: allow larger page sizes to support 'show all' on dashboard; we will restore a lower cap later`
- `src/app/api/user-data/route.ts:62` — `// Ensure caller is authenticated; otherwise RLS will silently return 0 rows.`
- `src/app/api/user-data/route.ts:198,215,217,223,242` — multiple `// Python:` and `// Python logic:` annotations explaining the AAC/WAC/Federal classification reuses
- `src/app/api/user-data/route.ts:252` — `// REMOVED: Don't filter out Federal data - we need it for Federal Dollars tab`

**Source:** `src/app/api/user-data/route.ts` (cited lines)

**INFERENCE** — These are the only files in the repo with substantive narrative comments. Most other source files have either no comments or tag-style notes like `// Removed ClaimsServices - using Zustand store only` (`AdminPortalContent.tsx:12`). There is no JSDoc on exported functions, no module-level docstrings, and no per-component contract documentation.

*Built on:*
- EVIDENCE: spot-reads of `src/components/**`, `src/stores/**`, `src/utils/**` show no JSDoc comment blocks above exports
- EVIDENCE: GAP for repo-level `/docs` (see below)

---

### What's NOT Documented (GAPs)

**GAP** — No `/docs` directory anywhere in the repo. Searched root and `src/`.

**GAP** — No `CHANGELOG.md`. Searched root.

**GAP** — No `CONTRIBUTING.md`. Searched root.

**GAP** — No `ARCHITECTURE.md` or `DESIGN.md`. Searched root and `src/`.

**GAP** — No `LICENSE`. Searched root.

**GAP** — No `.env.example` or `env.template`. Required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`) must be discovered by reading source code.

**GAP** — No supabase migrations (`supabase/migrations/*.sql`) and no generated `database.types.ts`. Schema must be reverse-engineered from inline `from('table').select(...)` calls (see Doc 05).

**GAP** — No README inside the `_EXTRACTIONS/` folder (this set is being created now).

**GAP** — No commit message convention documented; recent commits visible in `git log` (e.g., `4e619b8 pass update util added`, `e53228a 27aug2025 - Franks demo ready to deploy`, `6b47f06 Initial commit`) follow no consistent format.

---

### Vestigial Doc-Like Content

**EVIDENCE** — `package.json:2` declares the project name as `"qr-next13-supabase-v1"` — a vestigial label from an upstream Next.js 13 + Supabase + QR-codes starter. This name "documents" a lineage that is no longer accurate (the repo is on Next 15 and has no QR-code functionality visible in source).

**Source:** `package.json:2`

---

**EVIDENCE** — `src/app/layout.tsx:10` sets `metadata.title = "Moose Next Framework v3"` — another vestigial label that the browser tab will show on any page that doesn't override `<title>`. The OwedBook page does override (`AdminPortalContent.tsx:260`: `<title>Admin – Owedbook</title>`), but the auth, profile, settings, members-portal, and superadmin-portal pages do not — they will display "Moose Next Framework v3" in the tab title.

**Source:** `src/app/layout.tsx:9-12`; verified by absence of `<Head><title>` overrides in `src/app/(auth)/auth/page.tsx`, `src/app/(admin)/profile/page.tsx`, `src/app/(admin)/settings/page.tsx`, `src/app/(members)/members-portal/page.tsx`, `src/app/(superadmin)/superadmin-portal/SuperadminPortalPageContent.tsx`

---

**EVIDENCE** — `src/components/global/NavbarLoginReg.tsx:24-29` contains a commented-out marketing block referring to a 4th-party tech stack lineage: `"Next.js 14, Shadcn, Tailwind, Supabase & Resend (Email Service)"` and `"Login/Logout, Registration, Middleware & Email Validation Setup"`. The current repo uses Next.js 15 and `mailcomposer` (not Resend), so even the commented-out block is doubly stale.

**Source:** `src/components/global/NavbarLoginReg.tsx:24-29`

---

### Documentation Conflict — Surfaced for Doc 10

The `dashboard/sidebar/README.md` "Phase 1: placeholder only" claim conflicts with the actual location of active filter UI at `components/admin/FiltersPanel.tsx`. This is the only documented intent vs. code reality conflict in the repo. Surfaced in Doc 10.

---

## Open Questions

1. Was the `dashboard/sidebar/` folder the intended new home for filters in a refactor that was started and abandoned? If so, did the refactor produce other artifacts (e.g., a new sidebar component) that I may have missed? — Searched, found none.
2. Is the "Moose Next Framework v3" lineage a Cyberize internal starter, and if so, are there documented conventions for it elsewhere (outside this repo) that future builds should respect?
3. Does Coach (current product-vibing user) have any informal documentation, screenshots, or notes about expected behavior that should be triangulated against the demo's actual code paths?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
