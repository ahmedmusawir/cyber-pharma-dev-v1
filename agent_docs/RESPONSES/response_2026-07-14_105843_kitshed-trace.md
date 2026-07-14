# stark-kit-residue-cleaner — Phase 1 TRACE (kill-list report)

**Repo:** cyber-pharma · **Branch:** `repo-cleaner-v1` (clean) · **Date:** 2026-07-14
**Skill:** stark-kit-residue-cleaner v0.9.2 (first activation on this repo)
**Baseline pinned:** `tsc --noEmit` 0 · `jest` **25 suites / 118 tests** · (build not re-run; last recorded green)
**Edge map:** 506 app + 68 test import edges; **augmented with 40 relative-import edges** the alias-only grep missed (see Surprise S-1).

---

## HEADLINE

**This repo is NOT a MissionControl-shaped shed.** The heavy kit cascades
(superadmin, members-portal, posts, booking, the kit's own admin-portal) were
**already shed incrementally** across the June sessions, and the app rebuilt
admin-portal as its own surface + relocated real user-CRUD to `/moose-portal`.

**What remains is light residue: 10 zero-consumer orphan files + 3 judgment-call
QUESTIONS.** No route-group cascades. No pre-deletion surgeries (every orphan has
zero consumers → nothing to retarget). **Predicted test baseline is UNCHANGED:
25 suites / 118 tests** (no suite references any orphan — two apparent hits,
`MemberRow`≈`Row` and `DataTable`≈`table`, are basename collisions, not real deps).

---

## A. CONFIRMED DELETE — 10 zero-consumer orphans (EVIDENCE: precise-grep, 0 consumers each)

| # | File | Why it's kit residue |
|---|---|---|
| 1 | `src/types/UserRole.ts` | stale dup — `utils/app-role.ts` is the canonical role enum (RECOVERY: "enum→app-role.ts") |
| 2 | `src/mocks/auth.ts` | dead mock — `useAuthStore` does not import it |
| 3 | `src/utils/supabase/fetchUserData.ts` | manifest-known historical orphan (§C) |
| 4 | `src/components/common/Page.tsx` | unused kit layout primitive |
| 5 | `src/components/common/Box.tsx` | unused kit layout primitive |
| 6 | `src/components/common/Row.tsx` | unused kit layout primitive |
| 7 | `src/components/common/Container.tsx` | unused kit layout primitive |
| 8 | `src/components/common/BackButton.tsx` | unused kit primitive |
| 9 | `src/components/ui/table.tsx` | unused — app's `DataTable` builds its own table markup |
| 10 | `src/components/ui/pagination.tsx` | unused kit ui primitive |

Deleting all 10: **tsc stays 0, tests stay 25/118, no retargets, no cascades.**
This is the low-risk core of the shed. **But see Q1 — items 4–10 are reusable
primitives, and "shed unused kit primitive" vs "keep as available toolkit" is
your call, not mine.**

---

## B. KEEP — kit-born surfaces the app genuinely consumes (EVIDENCE: live consumers named)

- **Auth surface is REAL infra here, not demo curriculum:** `(auth)/auth` page +
  layout, `components/auth/{AuthTabs,LoginForm,RegisterForm,Logout}`,
  `api/auth/{login,logout,signup,confirm}`. `/auth` is referenced by Navbar (3×),
  MobileNav (3×), UserMenu (2×), Logout, profile, access-denied, HomePageContent,
  and `utils/supabase/actions.ts` (protectPage redirect). Deleting it would 404 the
  entire authed nav. **KEEP.**
- `store/useAuthStore` → consumed by LoginForm, Logout, MobileNav, Navbar, UserMenu. **KEEP.** (contrast: manifest §C flagged this as "verify hard — run-1 proved DELETE"; here it's live.)
- `components/global/{Navbar,ThemeToggler,MobileNav,UserMenu}` → all live. **KEEP.**
- `components/common/{Main,Spinner,SpinnerLarge,PaginationControls,MultiSelect,DataTable,EmptyState}` → all consumed. **KEEP.**
- `components/ui/*` except table+pagination → all consumed (card ×9, dialog ×7, dropdown-menu ×4, avatar ×3…). **KEEP.**
- `utils/supabase/{server,client,middleware}`, `utils/get-user-role`, `lib/utils`, `proxy.ts` → live. **KEEP.**
- `types/tailwind-merge.d.ts` → ambient module decl for the `tailwind-merge` pkg (used by `lib/utils` cn). Not import-traced but real. **KEEP.**

---

## C. BLESSED-INFRA at zero consumers → QUESTION, never silent delete (doctrine §6, A-5)

| File | Status | Note |
|---|---|---|
| `src/utils/supabase/admin.ts` | 0 app consumers | service-role client (manifest §D "later-phase certain"). `/moose-portal` uses its OWN `_lib/admin.ts`, not this. → **Q3** |

---

## OPEN QUESTIONS FOR THE OPERATOR

**Q1 — The 10 orphans: full shed, or keep the primitives as toolkit?**
Items 1–3 (UserRole, mocks/auth, fetchUserData) are clearly dead kit residue — my
recommendation: DELETE. Items 4–10 (common/Page,Box,Row,Container,BackButton +
ui/table,pagination) are unused-but-reusable primitives. DELETE them too (clean
shed), or KEEP as an available component toolkit? Your ruling.

**Q2 — `(public)` landing: real app landing or demo curriculum?**
`(public)/page.tsx` + `HomePageContent.tsx` is the live `/` route (kit marketing
landing, links to `/auth?tab=register`). Is this Cyber Pharma's real public
landing (KEEP), or kit demo to be replaced later (KEEP-for-now / DELETE)? If it
stays, `components/global/{NavbarHome,NavbarLoginReg}` stay with it. If it goes,
they cascade — but that's a bigger surgery touching the root route, so I'd want an
explicit ruling before touching `/`.

**Q3 — `utils/supabase/admin.ts`: keep as blessed-infra?**
Zero consumers, but it's the service-role client the manifest marks "later-phase
certain." Recommend KEEP + emit a blessed marker (header comment + KEEP_MANIFEST
entry, per A-10). Confirm?

---

## THE FOUR HUNTS

**1. Retarget list (surgeries):** **NONE.** Every DELETE candidate has zero
consumers, so no KEEP surface links into a dying target. (If Q2 rules to drop the
public landing, that changes — flagged there.)

**2. KEEP manifest (computed):** section B above — the complete file-by-file list
of kit-born code the app consumes. Will be written to `agent_docs/KEEP_MANIFEST.md`
in Phase 2 with any blessed-KEEP entries (Q3).

**3. Test map + predicted baseline:** No suite covers any of the 10 orphans →
**predicted post-shed baseline = 25 suites / 118 tests (UNCHANGED).** No non-code
stragglers ride in any target (orphans are individual files, no directory
cascades). Only non-code files under `src/` are `globals.css` + `icon.png` (both
framework KEEP).

**4. Latent dep orphans (REPORT ONLY — dep-hygiene owns package.json):**
Deleting ui/table + ui/pagination frees no radix dep (both are plain markup).
Pre-existing latent orphans per manifest §F to verify in a dep-hygiene pass:
`@playwright/test` (installed but see fossil below), `stripe`, `dotenv`. Not this
skill's job.

**5. Script/config fossils (A-11):**
- `"test:integration": "jest --testPathPatterns=__tests__/api"` → **`src/__tests__/api` does not exist.** Dead pointer — runs zero tests. Recommend fix or remove. → ruling needed.
- `"test:e2e"` / `"test:e2e:ui"` → playwright IS installed; whether any e2e specs exist is a separate question (none found under src). Low priority — note only.

---

## SURPRISES

**S-1 — Relative-import trace gap (NEW anti-pattern candidate).** The skill's A-1
warns about multi-line imports; it does NOT warn about **relative imports**
(`./LoginForm`, `../auth/Logout`). My initial `@/`-alias edge map falsely orphaned
`LoginForm`, `RegisterForm`, and `Logout` — the last is consumed by Navbar +
UserMenu (live). Caught by re-scanning for `from "./"`/`"../"` (40 edges). **This
belongs in the skill's ANTI_PATTERNS as A-1's cousin (call it A-1b).** Flagged for
trickle-up in the Phase 2 result.

**S-2 — Manifest §A is inverted for this app.** MissionControl deleted the
auth/public route groups as demo curriculum. Here they are the app's REAL auth +
landing infrastructure. The manifest's claim-set drifted; disk won (doctrine §2).

**S-3 — The shed already happened.** Prior sessions removed the big cascades
incrementally. This run is a cleanup of the *last 10 files* + rulings, not a
100-file event. Honest scope: small.

---

## SEQUENCING FOR PHASE 2 (once ruled)

Trivial vs the example: no surgeries, no cascades. On approval →
(1) delete the ruled orphans; (2) clear `.next/` cache (A-3); (3) gate: tsc 0 +
`find`-recount of deleted paths + tests still 25/118 EXACTLY; (4) emit blessed
marker + `KEEP_MANIFEST.md` for any Q3 KEEP; (5) fix/flag the `test:integration`
fossil per ruling; (6) build green + live walk (G5); (7) hand G6 (your visual
pass) — though with no UI files deleted, G6 is near-trivial here.

**STOP — awaiting rulings on Q1, Q2, Q3, and the test:integration fossil.**
