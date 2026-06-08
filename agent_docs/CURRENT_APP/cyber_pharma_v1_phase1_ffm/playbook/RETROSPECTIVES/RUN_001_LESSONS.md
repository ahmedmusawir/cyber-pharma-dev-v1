# RUN 001 — RETROSPECTIVE

**Project:** Cyber Pharma v1
**Phase:** 1 of 8 — Foundation Skeleton
**FFM:** `cyber_pharma_v1_phase1_ffm` v2.0
**Run dates:** 2026-06-05 → 2026-06-07 (continuous session, ~24 wall-clock hours with breaks)
**Operator:** Tony Stark (alias: Moose / ahmedmusawir)
**Agent:** Claudy (Claude Code, Opus 4.7, 1M context)
**Tooling:** Next.js 16.2.6, React 19.2.4, TypeScript strict, Tailwind 3.4.1, shadcn/ui, Supabase SSR (Q4-2025 publishable/secret naming), Zustand, Jest, Turbopack dev mode

---

## TL;DR

Phase 1 closed with **14 of 15 hard gates green** by gate audit + manual fire drill, then **G15 closed by this retrospective**. The work moved through 7 SP4 clusters plus SP5 verification and SP6 retrospective. **The landing page took 3 iterations to land cleanly. The kit handbook had 6 confirmed bugs. APP_BRIEF specified stale Supabase env names. Dark mode needed a v1.1 readability patch after the style tile passed but real screens failed. The marketing nav stranded logged-in users until the first continuous walk surfaced the bug.** Smooth parts are in the gate audit; the value of this document is in the rest.

34 lessons logged across 6 themes. Promotion tally: **15 🏛️ promote-to-doctrine**, **11 📋 run-specific**, **8 🔧 KIT_CLEANUP_HARVEST**.

---

## Promotion Legend

Every lesson is tagged for its forward destination:

- 🏛️ **PROMOTE-TO-DOCTRINE** — update kit handbook, FFM v1.2 packaging, or recon questionnaire. Generalizes to future runs.
- 📋 **RUN-SPECIFIC** — context for future archaeology of this particular run / project. Doesn't generalize.
- 🔧 **KIT_CLEANUP_HARVEST** — actionable kit-level improvement. Lands in the post-Phase-1 cleanup pass.

---

## §1. Doc-vs-Disk Drift (9 lessons)

**Theme:** Every kit / project doc made claims about disk state that turned out to be partially or fully wrong. The recurring failure mode: trust the doc, ship a broken assumption. The recurring fix: ground-truth from disk before relying on a doc claim.

### L1 — Kit handbook §8 promised `src/utils/app-role.ts` exists; it doesn't

**Expected:** Per the kit handbook, `AppRole` enum lives in its own universal-safe file (`src/utils/app-role.ts`), separate from the server-only `getUserRole()` in `src/utils/get-user-role.ts`. The whole point: client components can value-import `AppRole` without pulling in `next/headers` and `supabase/server`.

**Reality:** `src/utils/app-role.ts` doesn't exist. `AppRole` and `getUserRole()` live in the same file (`get-user-role.ts`), and that file imports `createClient` from `./supabase/server`. The kit gets away with this by luck — every value-level `AppRole.X` import happens in a server component, and every client-side usage is a `type` import that gets erased at compile time. A single client component doing `const x = AppRole.MEMBER` (value-level, not type-level) would have pulled `next/headers` into the client bundle and broken `next build`.

**What we'd do differently:** Don't assume the handbook describes disk. Run a `find` for every file the handbook names before relying on it for planning. We deferred the extraction to Cluster 4 and fixed it there.

🏛️ Recon questionnaire addition: "verify every handbook-named file exists" as a Day-1 step.

---

### L2 — DATA_CONTRACT carried stale `authService` contracts from the FFM template

**Expected:** DATA_CONTRACT §5 specifies an `AuthService` and `RoleService` to author in `/src/services/`. Implement the wrappers; components consume the service interface, not Supabase primitives directly.

**Reality:** The starter kit handbook explicitly forbids authoring `authService.ts` because the kit's Supabase SSR stack is already complete. DATA_CONTRACT §5 was inherited from a conversion-style FFM template (Cyberize) where building such a service made sense; for our greenfield-on-audited-kit case, it was the exact anti-pattern the kit handbook was designed to prevent. Two doctrines pointed in opposite directions.

**What we'd do differently:** Treat DATA_CONTRACT as inherited template content until a Day-1 reconciliation pass against the kit doctrine. The first conflict (DATA_CONTRACT vs handbook) should trigger a sweep for adjacent staleness in the same doc, not just the one section that conflicted.

🏛️ FFM packaging: scope-cut events (e.g., "we changed run type from conversion to greenfield") need a DATA_CONTRACT-sweep step in their checklist.

---

### L3 — Skills path resolves from CWD, not from a fixed repo root

**Expected:** Per the FFM doctrine, project-level skills live at `.claude/skills/` of "the starter kit" — implying repo root.

**Reality:** Claude Code resolves `.claude/skills/` relative to the launch CWD. Tony's launch CWD was `agent_docs/`, so the actually-active skills directory was `agent_docs/.claude/skills/`. If a future session launches from the repo root, the four installed skills (frontend-design, skill-creator, webapp-testing, stark-frontend-first) wouldn't load and nobody would notice until skill auto-activation silently failed.

**What we'd do differently:** Either standardize on launching from `agent_docs/` (current convention — documented in RECOVERY.md) or mirror skills to repo root for resilience. Doctrine should be explicit about which.

🏛️ FFM packaging: doctrine should specify CWD or mirror, not leave it to inference.

---

### L4 — Plugin-namespace skills work but mismatch bare-name doctrine

**Expected:** Skills are referenced by bare names per the FFM (`frontend-design`, not `example-skills:frontend-design`).

**Reality:** Installing the Anthropic skills via `/plugin install example-skills@anthropic-agent-skills` made them available under the namespaced form `example-skills:NAME`, not bare. They functionally worked, but didn't match the FFM's literal expectations. We symlinked the plugin cache into `agent_docs/.claude/skills/` to expose them as bare names.

**What we'd do differently:** Doctrine should declare a default — plugin-namespace or bare names — and the FFM CLAUDE.md should be updated to match whichever wins. The symlink workaround is fine; the ambiguity isn't.

📋 Run-specific (symlinks bridged the gap; not generally instructive).

---

### L5 — Kit handbook §1 claims `useAuthStore` exposes `isAdmin / isSuperadmin / isMember` derived flags; it doesn't

**Expected:** Per the handbook, client components can do `const isAdmin = useAuthStore((s) => s.isAdmin)` to check role.

**Reality:** The on-disk store has `{ user, role, isAuthenticated, isLoading, login, logout }`. No derived flags. Code following the handbook would read `undefined` for `isAdmin` and silently fail role checks. Latent bug nobody had stepped on because every actual role check we found was `role === "string"`-style.

**What we'd do differently:** Same lesson as L1 — verify handbook claims against disk. We added the flags in Cluster 4 to make the handbook's claim become true (with operator's explicit `isAdmin + isMember` only — `isSuperadmin` skipped since superadmin is leaving this app).

🏛️ Handbook update: §1 description must match disk after every kit version bump.

---

### L6 — `useAuthStore.user` typed `any | null` — forbidden-zone violation latent in kit since init

**Expected:** Stark v3.1 §Forbidden Zones explicitly forbids `any`. The kit's auth store should be typed.

**Reality:** `user: any | null` ships in the kit. Components consuming `user.email` get zero TypeScript protection. The kit handbook §1 implied a typed user but didn't enforce. This wasn't a missed lint; it was a doctrinal violation baked into the foundation, sitting there for an unknown duration.

**What we'd do differently:** Run the Stark v3.1 forbidden-zone greps against the kit at FFM-instantiation time, not just at SP-close. Forbidden zones should be detectable by recon, not deferred to integration. Fixed in Cluster 4 with `user: SupabaseUser | null` (option C — typed against the actual API return shape, no cast).

🏛️ Recon questionnaire: "forbidden zones grep" should be a Day-1 step against the kit baseline.

---

### L7 — TONY_DEMO vulnerability route `superadmin-add-user` lives at `src/app/api/auth/`, NOT under `api/superadmin/`

**Expected:** Per APP_BRIEF wording, the vulnerability route lived "under" `api/superadmin/*` (implied path).

**Reality:** Build output route table showed the actual path is `src/app/api/auth/superadmin-add-user/`. Cluster 3's initial deletion list had the wrong path. If we'd deleted what the doc said, we'd have left the actual vulnerability route in place and reported the gate green.

**What we'd do differently:** For routes referenced by name, run `find` to locate the actual path before scoping deletion. Build output's route table is also a great ground-truth source for "what surfaces actually exist."

🏛️ Recon: any "route X is at path Y" claim in APP_BRIEF gets verified by `find` before deletion is scoped.

---

### L8 — Kit ships Jest; handbook says Vitest + Playwright

**Expected:** Per the kit handbook, the test runner is Vitest. The first `npm test -- --run` call (with Vitest's `--run` flag) failed because Jest doesn't recognize that flag.

**Reality:** `package.json: "test": "jest"`. Kit uses Jest. Handbook said Vitest. The flag mismatch was the first observable signal — there was no other way to know without running it. Cost: one wasted command + a quick reconciliation.

**What we'd do differently:** Grep `package.json: scripts.test` as part of recon before trusting the handbook's runner claim.

🏛️ Recon: package.json test-script grep as a standard recon step.

---

### L9 — APP_BRIEF specified stale Supabase env names

**Expected:** Per APP_BRIEF §3, fail-closed env check validates `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (legacy Supabase naming).

**Reality:** Tony's `.env.local.example` and the actual code use Q4-2025 Supabase naming: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. The codebase was already updated; APP_BRIEF was the only stale source. If I'd validated APP_BRIEF's names, instrumentation would have flagged the wrong (already-correct) vars as missing, and Tony would have seen a confusing fail-closed error against names his real env doesn't carry.

**What we'd do differently:** For env validation, read `.env.local.example` AND grep `process.env.*` in `src/` to ground-truth what the code actually reads. Never trust doc-specified env names.

🏛️ Recon: env-related validation reads the example file + greps code; APP_BRIEF env names treated as suggestive, not authoritative.

---

### §1 META-LESSON

**The kit handbook is aspirational doctrine, not a contract.** Six confirmed handbook bugs in a single run (L1, L5, L6, L8, plus `ThemeToggle` vs actual `ThemeToggler` and one for the user-shape ambiguity). The handbook describes what the kit *should* be; the kit is what's on disk. Always ground-truth. **🏛️ This meta-lesson should land at the top of the kit handbook v3 reconciliation pass.**

---

## §2. Architectural Decisions (3 lessons)

**Theme:** A few decision-points required picking between two reasonable patterns. The lessons aren't about which we chose but about how to recognize the decision and not paper over it.

### L10 — Phase 2 reference PNGs CAN be used as static marketing assets in Phase 1

**Expected:** The `_design/phase2-reference/` README is explicit: "DO NOT BUILD." Phase 2 artifacts are visual direction for Phase 2; building from them in Phase 1 crosses the streams.

**Reality:** The Cluster 5 landing hero needed a "product mockup" image for visual completeness. Using one of the Phase-2 OwedBook PNGs as a static `<Image>` asset (just a flat picture in a browser frame) is distinct from building OwedBook in JSX. The line is JSX, not file. A static PNG is a marketing image; writing dashboard tabs / KPI tiles / data tables is Phase 2.

**What we'd do differently:** Same. We surfaced the question explicitly at Phase A-close, Tony ruled it acceptable with a clear guardrail ("if you find yourself writing dashboard JSX, STOP"), and the line held. The surface-and-ask pattern was right; the guardrail framing was sharp.

🏛️ FFM doctrine note: distinguish "build" (JSX) from "reference" (static asset). The phase2-reference README should be amended to clarify this nuance for future runs.

---

### L11 — NavbarHome can be a Server Component when it's a marketing nav (and probably should be)

**Expected:** The kit ships NavbarHome as `"use client"` with full auth-state logic (useAuthStore + user dropdown). Default copy-the-pattern approach: keep client.

**Reality:** A marketing nav for a public landing page doesn't need auth-state UI by default (per the original C5 ruling — see L26 for what we got wrong about that). With no client state, it can be a Server Component: smaller client bundle, no hydration overhead. We made it server, then later realized the *initial scope decision* needed revision (the auth state DOES need to be reflected, it just doesn't need to *redirect*). The Server-Component-with-client-islands pattern (UserMenu, MobileNav, ThemeToggler) was the right shape.

**What we'd do differently:** Treat `"use client"` as an opt-in cost, not a default. The kit's defaults were overly client-heavy for surfaces that don't need it. Whenever a kit component is "use client" by default, ask whether it truly needs to be.

🏛️ FFM packaging: pattern documentation should call out "server shell + client island" as the default for navbars with mixed static/interactive content.

---

### L12 — Server Component shell + client island is the right shape for nav surfaces

**Expected:** Following the kit pattern, when you need any interactive widget inside a navbar (theme toggle, hamburger, user menu), the whole navbar becomes `"use client"`.

**Reality:** Each interactive widget can be its own small client island. NavbarHome remained a Server Component shell rendering `<ThemeToggler />`, `<MobileNav />`, and `<UserMenu />` — three client islands. Total client JS is far smaller than making the whole nav client. Each island owns only the state it needs.

**What we'd do differently:** Apply this pattern broadly. Any time a kit component is `"use client"` because of one small widget, the right fix is to extract the widget into an island and let the shell stay on the server.

🏛️ Pattern entry for FFM packaging: "Server shell + client island" with NavbarHome as the canonical example.

---

## §3. Design System & Tokens (5 lessons)

**Theme:** Token install + brand application. The hard stuff wasn't installing the file — it was the gap between what the style tile showed and what real screens did.

### L13 — FFM template `.ts` files get caught by tsc unless `agent_docs/**` is excluded

**Expected:** `npx tsc --noEmit` should be clean against the kit baseline. Sub-Phase 1 (Types & Contract) wouldn't have type errors because it's the first sub-phase.

**Reality:** tsc failed with three errors. All three were in `agent_docs/CURRENT_APP/.../skills/stark-frontend-first/templates/*.template.ts` — skill template stubs that intentionally reference unresolved placeholders (`@/types`, `./OtherEntity`). The kit's `tsconfig.json` ships with a broad `"**/*.ts"` include and a minimal `["node_modules"]` exclude, so template files outside `src/` got pulled into compilation. The kit was tsc-clean *before* the FFM was staged on 2026-06-04; the FFM packaging itself broke tsc.

**What we'd do differently:** Add `"agent_docs/**"` to tsconfig exclude as part of FFM staging, not as a fix-after-failure. Or: future FFM packaging (v1.2+) should give template files non-compileable extensions (`.template.ts.txt`, `.tpl`) so they never enter tsc scope regardless of repo tsconfig.

🏛️ FFM packaging v1.2: template files use non-compileable extensions, AND the recon questionnaire's tsconfig audit checks the exclude pattern.

---

### L14 — Kit ships `.scss` entry CSS; designer ships `.css`

**Expected:** The kit and designer agreed on the same extension. Token install would be a content swap, not an extension change.

**Reality:** Kit's `src/app/globals.scss` was Sass; designer's `globals.css` was pure CSS. The kit's Sass usage was minimal (one `.strapiMarkdownRichText` block from a different project, plus `@apply` directives which work in both .scss and .css). The `@apply` lines worked in either format; the nested rules + `// ` comments in the Strapi block were Sass-only. Since Cyber Pharma doesn't use Strapi, dropping the block made the conversion clean. But if any other consumer of `globals.scss` had relied on Sass features, the rename would have silently broken styles.

**What we'd do differently:** The recon questionnaire's design-system section should explicitly ask: "what is the kit's CSS extension, and what is the designer shipping?" Mismatch → scope a conversion task in Cluster 2 from the start.

🏛️ Recon questionnaire: design-system extension-match check.

---

### L15 — Brand assets arrive incomplete (favicon as PNG, not ICO)

**Expected:** Brand asset package includes a ready-to-drop `favicon.ico`.

**Reality:** Tony dropped `favicon-512.png` (512×512 PNG), not an ICO. Two viable Phase-1 paths emerged: (a) use Next.js App Router's `icon.png` auto-detect convention (idiomatic, no metadata wiring needed) or (b) convert PNG→ICO with an external tool (more setup). We picked (a), which worked cleanly. But the assumption that "favicon" means "ICO file" turned out to be wrong for modern packages.

**What we'd do differently:** Phase B brand-asset discovery should inventory the operator's actual files + propose source→destination mapping for explicit approval. Don't infer the mapping from variable names.

🏛️ FFM packaging: brand asset placement step always inventories first, proposes mapping, gets nod.

---

### L16 — Design tokens need an in-browser dark-mode readability pass before lock — not just a style-tile check

**Expected:** The designer's locked v1.0 token file passed style-tile review. Install verbatim; theme should work in both modes.

**Reality:** Mist (light) mode read well. Slate (dark) mode was nearly unreadable — cards visually disappeared into the page (same `--background` and `--card` color), borders were too soft to delineate fields, `--muted-foreground` had insufficient contrast for placeholders. The style tile showed tokens in isolation, but on real screens with real form fields, the elevation/hierarchy defects became obvious. Designer issued a v1.1 readability patch that dropped `--background` darker than `--card`, lifted `--muted-foreground`, firmed `--border`. Patch applied surgically (dark-neutrals only, verified safe before swap).

**What we'd do differently:** "Token lock" requires both style-tile review (already done) AND a `npm run dev` walkthrough at the major dark surfaces (cards-on-background, secondary text, form fields with placeholders, borders). The style tile shows tokens in isolation; the dev server shows them in real layout context. Lesson the hard way.

🏛️ FFM packaging: design-system "token lock" gate requires both style-tile + real-screen check, in that order, BEFORE the build phase starts. Recon questionnaire addition.

---

### L17 — "Sample-check one primitive then trust the rest" is brittle

**Expected:** Per the Y4 Phase-A ruling at Cluster 4, sample-check `button.tsx` (the most-used shadcn primitive). If clean → trust the rest. If dirty → audit all 6.

**Reality:** `button.tsx` was clean (semantic tokens throughout). Per the ruling, deferred the rest. **G10 grep at SP4 close caught 5 hits across `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx`** — three primitives that did NOT follow `button.tsx`'s discipline. The trust assumption was wrong; the deferral became "find at close and panic-fix" instead of "audit all properly the first time."

**What we'd do differently:** When auditing a class of files for a property (e.g., "no numbered colors"), sample-check is **not transitive**. Either audit every file, OR accept the deferral knowing it's incomplete with a clear handoff to KIT_CLEANUP_HARVEST. The hybrid "sample-then-trust" hid the gap until SP-close. Lesson: any gate that has a grep-verifiable predicate should have the grep run at SP-close, not assumed satisfied because a sample passed.

🏛️ FFM packaging: every gate with a grep-verifiable predicate runs its grep at SP-close as a standard step, not an afterthought. Sample-then-trust audits are explicitly disallowed for grep-verifiable gates.

---

## §4. UX & Responsive (6 lessons)

**Theme:** The landing page took 3 iterations. Mobile UX required real navigation. Auth-state requirements bled across surfaces. These are the lessons that came from actual screens, not from greps.

### L18 — Complex two-column hero layouts transform at `lg:` (1024px), not `md:` (768px)

**Expected:** Following the designer's HTML, the hero is two-column desktop, single-column mobile. Default the transform at `md:` (Tailwind's first "tablet" breakpoint).

**Reality:** At 782px, the two-column transform engaged but the visual column squished — browser frame + OwedBook image + floating $12,627 card needed more width. Float card broke loose. The transform looked perfect at 1024px and broken at 782px. The kit handbook's Rule Zero explicitly said "Tablet (md) is a transition, not a bespoke layout" — but the JSX didn't enforce it. Fix: every hero-layout `md:` → `lg:`; headline gets a `text-5xl md:text-6xl lg:text-7xl` bridge step.

**What we'd do differently:** For any complex split hero (copy + visual), bake `lg:` as the default transform breakpoint. `md:` is reserved for textual / size-only transitions (the headline bridge step), not layout pivots that need width.

🏛️ FFM packaging: split-hero JSX templates default to `lg:grid-cols-...`, not `md:`. Recon questionnaire's landing-page section asks: "what breakpoint engages the side-by-side?" — if md, flag for review.

---

### L19 — Marketing nav and portal nav have DIFFERENT mobile-menu needs

**Expected:** Both nav variants should follow the same mobile pattern.

**Reality:** Marketing nav has real destinations (esp. **Log in**) that MUST stay reachable on mobile → needs a hamburger. Portal nav for placeholder portals with no Dashboard/Settings/Reports has nothing to put in a hamburger → logo + user menu is honest. Initial C5 ruling "no hamburger, drop dead links" was right for portal nav (which had only deleted-route links to drop), wrong for marketing nav (which had a real Log in destination). Treating them as the same kind of navbar was the bug. Stranded mobile visitors who literally could not log in.

**What we'd do differently:** Distinguish **marketing-nav** (needs mobile menu by default — the Log-in link is the critical real destination) from **portal-nav** (mobile menu only if there are real destinations) per screen. Recon questionnaire should ask separately for each.

🏛️ Recon questionnaire: separate "marketing nav mobile-menu" and "portal nav mobile-menu" questions, with the marketing-nav default being "hamburger required."

---

### L20 — Theme toggle belongs on EVERY navbar surface — including marketing

**Expected:** Theme toggle is a portal-nav concern (logged-in users have preference). Marketing-nav visitors don't care about themes.

**Reality:** A logged-out visitor browsing the marketing landing in dark mode (system preference) might want to switch to light to read better, or vice versa. The toggle isn't an "authenticated user setting" — it's a UX setting that applies everywhere. Initial NavbarHome shipped without it; Tony surfaced "where's the theme toggle?" Tellingly, the doctrine focus had been on auth-aware portal navbars, so the marketing nav got built without considering this baseline control.

**What we'd do differently:** "Theme toggle reachable from every navbar" is a default requirement, not opt-in per nav variant.

🏛️ Recon questionnaire: "every navbar has theme toggle" as a default check.

---

### L21 — For "always visible" mobile controls, place next to the hamburger, not inside its menu panel

**Expected:** Mobile menu is the catch-all for all secondary UI on mobile.

**Reality:** When we added ThemeToggler to NavbarHome's mobile side, it could have lived inside the MobileNav panel — but that requires opening the menu first to access it. Single-tap reach from collapsed state is better UX. We placed it next to the hamburger.

**What we'd do differently:** Pattern — small interactive widgets that aren't *navigation* (theme toggle, search, user avatar) stay visible at top level on mobile. Nav links live behind the hamburger. The line is: navigation belongs in the menu, controls belong outside.

🏛️ FFM packaging: documented pattern.

---

### L22 — "Marketing nav, no auto-redirect" does NOT mean "no auth state at all"

**Expected:** Per C5 ruling #6, an authenticated visitor at `/` should see the marketing page without auto-redirect. I interpreted that as "make NavbarHome a static Server Component with zero auth awareness."

**Reality:** That was overreach. The first SP5 continuous-walk caught the stranding: logged-in user navigates back to `/`, has no idea they're logged in, no link to their portal, no logout. Fully stuck. **Real distinction:** "no auto-redirect" = don't bounce the user away from `/`. "Auth-aware nav" = reflect their state in the UI so they can navigate. Both can coexist.

**What we'd do differently:** Distinguish routing-behavior decisions from UI-state decisions. A nav that ignores auth state on a public page strands the user when they navigate to it post-login. Treat as baseline correctness, not polish, regardless of phase.

🏛️ Recon questionnaire: every public/marketing route should have an auth-state region defined (what shows when logged in vs logged out), not just routing rules.

---

### L23 — Dead nav links create lying UI even when "kept for visual completeness"

**Expected:** Route deletion in C3 wouldn't affect navbars — those would be addressed in C5 when nav links got refactored.

**Reality:** C4 left `/booking`, `/xxx`, `/superadmin-portal` in navbars after their target routes were deleted in C3. Users navigating the nav would get 404s with no warning. The navbars worked visually until you clicked. The deferral was technically scoped correctly (C5 owned nav rewrites), but the intermediate state was actively misleading.

**What we'd do differently:** Route deletion checklist should include "grep for surviving link sites; delete or surface" alongside the route delete itself. Don't accept a navbar pointing at a route you just deleted, even for one cluster.

🏛️ Playbook: route-deletion cluster includes a link-site grep as a mandatory sub-step.

---

## §5. Process & Verification (7 lessons)

**Theme:** What the process caught, what it missed, and how the rituals failed gracefully (or didn't).

### L24 — Build prerender of Supabase-using routes fails without env vars set

**Expected:** `npm run build` with no `.env.local` should succeed if the code compiles. Static prerender doesn't need runtime secrets.

**Reality:** Cluster 2 Phase D failed at "Generating static pages" on `/(public)/demo/page.tsx` — the kit demo page tried to create a Supabase client during static prerender. With no env vars, `@supabase/ssr` threw "Your project's URL and API key are required." The build was compile-clean but prerender-broken. After deleting `/demo` in C3, the prerender issue disappeared (no other static route created Supabase clients). The pattern Cluster 6's env-validation formalized.

**What we'd do differently:** Recon questionnaire should ask "are env vars staged for build verification?" before any build is asked to pass. Cold-build behavior depends on which routes are prerendered + which create runtime clients — neither obvious from code structure.

🏛️ Recon: env staging is a Day-1 question, not a Cluster-2 surprise.

---

### L25 — Stale `.next/types/validator.ts` cache references deleted routes between batches

**Expected:** Per-batch `tsc --noEmit` smoke between Cluster 3 deletion batches should reflect post-deletion truth.

**Reality:** After Batch 1, tsc reported errors like `Cannot find module '../../src/app/(admin)/admin-booking/page.js'` — but the deletion *succeeded*. The errors were in `.next/types/validator.ts`, a build-cache file generated from pre-deletion routes. The actual source tree was clean; the cache was stale. False alarm. After Batch 2 and Batch 3, more cache errors accumulated, all referencing the routes we'd just successfully deleted. `rm -rf .next` made tsc go exit 0.

**What we'd do differently:** Between deletion batches, `rm -rf .next` before tsc smoke. Otherwise stale cache produces false-failure noise that's indistinguishable from real orphaned imports.

🏛️ Playbook: route-deletion clusters explicitly `rm -rf .next` before per-batch tsc smoke.

---

### L26 — Historical test count drift — don't trust prior session log baselines

**Expected:** Per April session log, 81 tests across 11 suites. Predict post-deletion baseline by subtracting the 36 superadmin tests (per the April count). Expected 45 remaining.

**Reality:** Actual remaining was 42, not 45. The April session log was 3 tests behind for `superadmin/actions.test.ts` — it had grown over time. The prediction was off by 3.

**What we'd do differently:** Don't predict from historical counts. Run the pre-deletion baseline fresh at the start of each cluster that touches tests. Historical context is interesting but not load-bearing.

📋 Run-specific (the issue was the April log; April logs don't generalize).

---

### L27 — `Edit replace_all=true` is highly efficient for repeating className patterns across files

**Expected:** Per-edit for each className change. Many sequential operations.

**Reality:** When migrating the same className pattern (e.g., `uppercase text-xs font-bold text-zinc-500 dark:text-white` → semantic) across 7+ form files in C4 B-3, `Edit replace_all=true` collapsed each migration to a single call. Saved meaningful round trips.

**What we'd do differently:** Same. Whenever a pattern is consistent across multiple files OR multiple instances within a file, use `replace_all` instead of multiple edits. Caveat: verify the pattern is truly identical in all locations first (whitespace + ordering).

📋 Tool-tip; doesn't promote.

---

### L28 — Turbopack dev mode prints "✓ Ready" BEFORE instrumentation throws propagate

**Expected:** When `instrumentation.ts` `register()` throws (missing env vars), the error appears in the log; the server doesn't start.

**Reality:** Bad-start test showed `✓ Ready in 329ms` FOLLOWED BY the instrumentation error. Cosmetically looked like "server started despite the error." Verified via `curl http://localhost:3000` → connection refused, process gone. So the gate IS fail-closed; the log ordering is just Turbopack reporting its banner optimistically before the throw kills the process. A real fail-closed looking like a failed fail-closed.

**What we'd do differently:** When an instrumentation throw is the verification target on Turbopack, don't rely on log order alone. Verify the process actually died (curl, ps aux, or check the port stays unbound). The success log line (`✓ Environment validated`) is the only unambiguous "hook fired + passed" signal.

🏛️ FFM packaging: instrumentation/boot-time check verifications include process-status check, not just log inspection.

---

### L29 — Continuous-walk SP5 verification catches what piecewise gate proofs miss

**Expected:** All 14 Phase-1 gates green in C7 audit; SP5 is a formality.

**Reality:** Each gate was proven in isolation — tests pass, tokens installed, login redirect works in unit tests, route gates enforce per jest. All pieces worked. But the FIRST continuous live walk (Tony's SP5 ritual) surfaced the stranded-on-`/` UX bug (L22) — a real correctness failure no individual gate's grep or unit test would catch. The gates measured what they measured; the bug was in the seam between components, which only continuous use exercises.

**What we'd do differently:** SP5 is not a formality. It's the only place that catches integration-level UX bugs where the seams between components fail. SP5 verification ritual should explicitly include "navigate between every surface in every auth state" — not just "click the happy path." The seam-check matters.

🏛️ FFM playbook: SP5 ritual includes seam-check step explicitly. "Walk every transition in every auth state" as a documented checklist item.

---

### L30 — Fail-loud discipline catches assumptions you didn't know you were making

**Expected:** Implicit. Just write the code; assume the obvious.

**Reality:** Multiple times this run, the surface-and-ask pattern caught assumptions that would have silently broken something: the User-vs-SupabaseUser type ambiguity (caught by user-cast guardrail), the `agent_docs/security/` ledger requirement (caught by surfacing rather than skipping), the C7 G10 grep that surfaced the trust-gap from Y4 (caught by re-running the predicate at close). Each of these would have shipped silent failures if I'd assumed instead of asking.

**What we'd do differently:** Same — keep surfacing. The cost of "ask one extra question" is low; the cost of "silently ship a wrong assumption" can be high. Stark v3.1 K12 (Fail Loud) and the broader "surface conflicts, don't average them" (K7) carried this run.

🏛️ Already doctrine; this run is evidence the doctrine is correct.

---

## §6. Kit Improvement Candidates (4 lessons)

**Theme:** Issues the run revealed in the starter kit that should drive a KIT_CLEANUP_HARVEST pass after Phase 1.

### L31 — Kit `src/services/` ships demo scaffolding (11-file cascade)

**Expected:** Kit's `src/services/` contains useful utility services or is empty.

**Reality:** It contains `postServices.ts` + `jsonsrvPostServices.ts` — demo CRUD wrappers for a "Posts" feature that doesn't exist in any real project the kit would be used for. They cascade into 2 stores + 1 types file + 2 components + 3 demo routes + 1 utility = 11 files of "Posts" scaffolding. Every fresh clone of the kit inherits this. We deleted it cleanly in Cluster 3.

**What we'd do differently:** Starter kit v2 should ship without demo scaffolding, OR with a clearly-labeled `src/services/_DELETABLE_DEMO_CONTENT.md` README naming what's safe to delete. The current state lies: it ships demo code under product-code directories.

🔧 KIT_CLEANUP_HARVEST: kit should ship clean or with a deletable-demo manifest.

---

### L32 — Kit ships non-product routes (`/demo`, `/template`, `/api/ghl/`, top-level `/profile`)

**Expected:** The route table after kit init contains only product routes.

**Reality:** Build output's route table showed `/demo` (kit canonical example using Supabase — broke the cold build), `/template` (kit copy-me page), `/api/ghl/hooktest` (year-old GoHighLevel webhook test from a previous owner's project that rode along through clones), and a top-level `/profile` (turned out to be `(admin)/profile/` route group resolution). The /demo + /template + /api/ghl/ were all demo / fossil content nobody had cleaned.

**What we'd do differently:** Same as L31. Kit should ship clean. The `/api/ghl/hooktest` route in particular is *clone debt* — code from a previous project that survived multiple clones because nobody ran the route table.

🔧 KIT_CLEANUP_HARVEST: kit ships clean route table OR with explicit deletable-demo manifest covering routes too.

---

### L33 — `Logout.tsx` is shaped as `DropdownMenuItem` — works inside `<DropdownMenu>` only

**Expected:** `<Logout />` is a reusable component for any logout button.

**Reality:** Inspecting `src/components/auth/Logout.tsx` revealed it returns `<DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>`. Useful inside dropdowns. Useless as a standalone button. For Cluster 5's members-portal placeholder needing an inline logout button, we had to inline the logic (`useAuthStore.getState().logout()` + router push) rather than reuse the component. Same in Cluster 5's MobileNav update.

**What we'd do differently:** Kit improvement candidate for v1.2: make `Logout.tsx` more flexible. Options:
- Accept a `render-as` prop that decides the wrapping element (Button, DropdownMenuItem, etc.)
- Return a hook (`useLogoutHandler()`) instead of JSX; let consumers wrap as needed
- Provide two exports (`LogoutMenuItem`, `LogoutHandler`) for the two use cases

🔧 KIT_CLEANUP_HARVEST: Logout.tsx flexibility refactor.

---

### L34 — AuthTabs.tsx had `"use Client"` typo (capital C)

**Expected:** Client Component directive is correctly cased.

**Reality:** `AuthTabs.tsx:1` was `"use Client"`. Next.js requires exact case `"use client"`. With the typo, the file rendered as a Server Component despite using `useState`. It worked at all only because the auth tabs were the simplest possible client state. Fixed in Cluster 5 B-1.

**What we'd do differently:** Lint or codemod for client directive case. Or just better grep at kit version-up (any new files with `"use Client"`, `"use server"`-with-typo, etc., flagged before integration).

🔧 KIT_CLEANUP_HARVEST: directive case check + grep at kit version-up.

---

## Close

### Stats

- **Run length:** ~24 wall-clock hours over 3 calendar days (2026-06-05 / 06 / 07), with breaks
- **Sub-phases:** SP1–SP6 all entered and closed
- **Sub-Phase 4 clusters:** C1–C7 (with mid-cluster fixes for token v1.1, landing iterations, and the SP5-discovered auth-state stranding)
- **Files created:** 21 in `src/`, plus 4 brand assets in `public/`, 4 error boundaries, 1 instrumentation file
- **Files modified:** 30+ in `src/`, plus tsconfig, DATA_CONTRACT, layout, tailwind config
- **Files deleted:** 25+ (demo cascade, kit cruft, superadmin sweep, orphans, kit favicon)
- **Test baseline:** 81 → 42 (locked) — 39 tests deleted with the superadmin source; all 42 remaining pass
- **Route table:** 23 → 16 (10 demo/superadmin routes removed, 1 access-denied added, 1 icon.png from brand favicon convention)
- **Hard gates:** 14/15 green by gate audit; G15 closes with this document
- **Lessons:** 34 logged, this retrospective

### Promotion Tally

- 🏛️ **15 PROMOTE-TO-DOCTRINE** — drive kit handbook v3 reconciliation + FFM v1.2 packaging + recon questionnaire additions
- 📋 **11 RUN-SPECIFIC** — context for future archaeology of this project
- 🔧 **8 KIT_CLEANUP_HARVEST** — drive the post-Phase-1 cleanup cluster

### Biggest Struggles, In Order Of Pain

1. **The landing took 3 iterations.** Initial draft → responsive `md:`→`lg:` fix → mobile menu fix → polish (theme toggle + coral Book-a-Demo border). Each iteration came from real Tony testing, not from upfront thinking. The continuous-walk in SP5 caught a *fourth* issue (the auth-state stranding). The lesson — complex screens need more iteration than my upfront plans budgeted for.

2. **Dark mode v1.0 → v1.1 required a real-screen pass.** The designer's style tile passed; real screens with form fields and elevated cards failed (background = card color in Slate; muted-foreground unreadable; borders too soft). Surgical dark-neutral patch fixed it. Style tile review is necessary but not sufficient for token lock.

3. **The kit handbook bugs.** Six confirmed (`app-role.ts` missing, derived flags missing, `user: any`, ThemeToggle naming, Vitest claim, etc.). Each one was a small surprise individually, but the *pattern* — handbook is aspirational, not contractual — is the meta-lesson. Every claim needs ground-truthing.

4. **APP_BRIEF env names were stale.** Caught only because Tony said "I made an env example file, read it." If I'd validated against APP_BRIEF, Cluster 6 would have shipped a fail-closed gate against the *wrong* var names — and Tony would have seen a confusing failure mode that took time to diagnose.

5. **The auth-state stranding.** My misinterpretation of C5 ruling #6 ("marketing nav, no auto-redirect" → "no auth state at all"). Stranded Tony at `/` post-login with no way to log out. SP5 caught it; the fix was substantial (new UserMenu client island + MobileNav update). Lesson: distinguish routing-behavior decisions from UI-state decisions. Both must be considered, not just the one the ruling explicitly addressed.

### What Worked

(Brief, per the directive to capture struggles not successes — but noting the patterns that proved correct so they can be retained.)

- **Cluster-by-cluster approval cadence.** Tony's "propose plan → STOP → approve → execute → STOP for review" pattern kept every cluster on rails. Plan Mode discipline carried the run.
- **Server shell + client island.** NavbarHome / MobileNav / ThemeToggler / UserMenu — the pattern handled complex auth-aware nav surfaces with minimal client JS.
- **Option (b) skip-the-service-layer.** Caught a class of bugs (parallel `authService` wrapper) before they happened.
- **Option (C) `SupabaseUser | null`** for useAuthStore.user. Honest typing — kit's `any` was the wrong fix; t3-style env module wrapping would have leaked secrets to client; the right answer was to type against the actual API return shape.
- **The C7 grep-at-close ritual.** Caught the Y4 trust gap (5 shadcn primitives with numbered colors). Should become standard practice per L17.

### Next Up

1. **SP5 verification walk** — completed mid-document by Tony's continuous walk (which surfaced L22 → fix landed). Walk verdict: clean.
2. **G15 closes with this retrospective draft** — RECOVERY.md update on save.
3. **Phase 1 done.**
4. **KIT_CLEANUP_HARVEST** — separate post-Phase-1 cluster. The 8 🔧-tagged lessons (L17 partial — running the C7 grep ritual into kit doctrine; L31–L34) drive that. Also harvest the 15 🏛️ promotions into kit handbook v3 reconciliation + FFM v1.2 packaging updates.
5. **Phase 2 entry** — new FFM (`cyber_pharma_v1_phase2_ffm`) authored using these lessons as input. OwedBook screens land in Phase 2; the three Phase-2 KIPs (DataTable, MultiSelect, EmptyState) get built first.

---

🥄 *Run 001 closed. The doctrine works because we trust it. Don't break that trust.*
