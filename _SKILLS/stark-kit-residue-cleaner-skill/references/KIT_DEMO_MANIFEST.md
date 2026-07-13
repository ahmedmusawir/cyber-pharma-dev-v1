# KIT_DEMO_MANIFEST — the static kill list

> **Matches: Stark starter kit v3 (as cloned for MissionControl, pre-Kit-Perfection).**
> This is a CLAIM-SET. Phase 1 verifies every line against the target repo before
> any verdict. Kit versions drift — if the repo's kit predates or postdates v3,
> expect deltas and report them.

| Version | Date | Notes |
|---|---|---|
| v0.9 | 2026-07-10 | Born from the MissionControl trace (649-edge map) |

## A. Demo route groups (expected DELETE cascades)

| Surface | Typical contents |
|---|---|
| `src/app/(auth)/` | /auth page, layout (AuthTabs consumer) |
| `src/app/(admin)/` | admin-portal + add-member + edit, admin-booking, profile, users |
| `src/app/(members)/` | members-portal + profile, booking |
| `src/app/(superadmin)/` | superadmin-portal + add-user + edit |
| `src/app/(public)/` | kit landing HomePageContent, /demo (verify: the app may have rehomed `/`) |
| `src/app/template/`, `src/app/error/` | scaffold stubs |
| `src/app/api/auth/signup` | consumed only by kit RegisterForm |
| `src/app/api/auth/superadmin-add-user` | historically zero app callers (kit form uses a server action) — verify |

## B. Demo component cascades

- `components/auth/`: AuthTabs, LoginForm (kit), RegisterForm, Logout (historically orphan)
- `components/posts/` + `services/postServices` + `store/usePostStore` + `types/posts`
  + `utils/common/commonUtils` (posts cascade — points at an EXTERNAL api; fossil)
- Booking: `components/admin/AdminBookingList`, `components/members/MemberEventList`
  (historically both orphans), route-local InsertForms die with their groups
- Navbars: `global/Navbar`, `NavbarHome`, `NavbarSuperadmin`, `NavbarLoginReg`
  — ⚠️ `global/ThemeToggler` commonly LIVES in this folder and is app-consumed: KEEP
- `components/layout/`: kit sidebars (die with kit layouts)
- `components/dashboard/DashboardCard` (historical orphan — verify per app)
- `components/common/`: Page/Row/Box/Container/Main/Spinner/BackButton/
  PaginationControls — verify per app; ⚠️ `SpinnerLarge` was app-consumed in run 1
- `components/ui/` kit-only set from run 1: avatar, badge, card, command, form,
  pagination, select, tabs — VERIFY per app; the app's own screens may consume any

## C. Demo state & utils

- `store/useAuthStore` — verify hard: run-1 expectation said KEEP, trace proved DELETE
- `utils/supabase/actions.ts` (protectPage — hardcodes /auth redirect)
- `utils/supabase/fetchUserData.ts` (historical orphan)
- `src/styles/global.scss` (orphan duplicate of app/globals.scss)

## D. BLESSED-INFRA — never delete without an explicit operator ruling

| File | Why it lives at zero consumers |
|---|---|
| `utils/supabase/server.ts` | server client factory — auth backbone |
| `utils/supabase/middleware.ts` | session refresh behind proxy.ts |
| `utils/supabase/client.ts` | browser client factory — later-phase certain |
| `utils/supabase/admin.ts` | service-role client — later-phase certain |
| `utils/get-user-role.ts` | canonical role resolver |
| `src/proxy.ts` | session refresh on every request |
| `lib/utils.ts` (cn) | consumed by all ui/ |
| toast chain (toast/toaster/use-toast) | root-layout wired |
| ThemeProvider + ThemeToggler | theming backbone |

## E. Test files

Kit demo tests die with their targets. Historically: actions, superadmin-add-user,
admin/×2, member/×1, superadmin/×5. Surviving infra suites: get-user-role, proxy.
⚠️ Sweep test directories for non-code files (READMEs) — invisible to import traces.

## F. Latent dependency orphans (REPORT ONLY — dep-hygiene task owns package.json)

Historically orphaned pre-shed: stripe, @playwright/test, dotenv.
Orphaned BY the shed: zustand, react-hook-form + @hookform/resolvers, zod,
@heroicons/react, cmdk, @radix-ui/react-{tabs,avatar,select}.
