# CLAUDE.md — Cyber Pharma v1 / Phase 1 FFM (v2)

> **You are reading the entry point to this project's Factory module.**
> This file is the navigation contract for any AI coding tool that opens this folder.
> Read this first. Everything else is referenced from here.

---

## What This Module Is

This is the **Cyber Pharma v1 — Phase 1 Frontend-First Module (FFM), v2**.

A portable, reusable Factory artifact instantiated for Phase 1 (Foundation Skeleton) of the Cyber Pharma v1 build.

**v2 changes from v1:**
- Scope reduced from two apps → **one app** (main app only — superadmin moves to its own repo as a separate project)
- **All deployment work removed** — no Cloud Run, no CNAME, no staging deploys. A separate department owns deploy work in a later phase.
- UI_SPEC.md upgraded to designer's v1.1 — locked v1 design tokens (coral primary, Saira, Metro flat, semantic color system)
- Tailwind version confirmed: **3.4.1** — locked. Token mechanic: CSS variables in `globals.css` HSL-no-wrapper, mapped via `tailwind.config.ts`.
- Designer's deliverables added: token file, component manifest, style tile, screen artifacts
- Factory-level docs (Global Design System Handbook, Theme Library) live OUTSIDE the FFM at `agent_docs/app_factory/design-system/`

**Born from:** Stark Industries App Factory FFM v1.0 (Cyberize Agentic Automation, May 2026 — conversion-style run).
**Adapted for:** Cyber Pharma v1 Phase 1 — greenfield foundation, single app, no-deploy scope.
**Owner:** Stark Industries.
**Operator:** Tony Stark (alias: Moose / ahmedmusawir).
**License:** Internal Factory tooling.

---

## What's Different About This FFM (vs the original v1.0 sample)

The original FFM v1.0 was authored for a **conversion** — Streamlit prototype → Next.js. This instance is for **greenfield Phase 1 foundation work** on a single app, with no deploy work in scope.

| Aspect | Original FFM v1.0 | This FFM (Cyber Pharma v1 Phase 1, v2) |
|---|---|---|
| **Source app** | Streamlit prototype (existed) | None — greenfield |
| **Apps in scope** | One | One (main app only — superadmin moves to its own project) |
| **Deployment** | Included (Cloud Run + staging URLs) | **Out of scope** — separate department owns this |
| **`_design/`** | Screenshots of the Streamlit app | Brand tokens + style tile + screen artifacts (clearly labeled Phase 1 vs Phase 2 direction) |
| **`_extraction/`** | Brain Drain extracts from source app | Minimal TONY_DEMO extracts (patterns to NOT repeat) |
| **`_project/` scope** | Full app conversion | Phase 1 ONLY — foundation skeleton |
| **UI to convert** | Yes (Streamlit screens) | No — placeholder pages + one new landing page until Phase 2 |

Naming convention adopted: `<project>_<phase>_ffm`. Future instances: `cyber_pharma_v1_phase2_ffm`, etc.

---

## Vendor Neutrality

This module is **tool-agnostic**. It works with:

- **Claude Code** (this file is the entry point)
- **Codex CLI** (entry via `AGENTS.md` → redirects here)
- **Gemini CLI** (entry via `GEMINI.md` → redirects here)
- **Windsurf / Cursor / other AI coding tools** (entry via this file directly)

The doctrine inside is written in plain markdown with no tool-specific syntax. Any AI coding tool that reads markdown can use this module.

---

## Reading Order (MANDATORY)

When an AI tool opens a project staged with this module, it reads files in this order:

1. **This file** (`CLAUDE.md` at module root) — navigation contract
2. **`_project/CLAUDE.md`** — Cyber Pharma v1 Phase 1 spine (forbidden zones, tech stack, project-specific overrides)
3. **`_project/APP_BRIEF.md`** — Phase 1 scope, success criteria, hard gates
4. **`_project/DATA_CONTRACT.md`** — Phase 1 data shapes
5. **`_project/UI_SPEC.md`** — Phase 1 screen behavior + locked v1 design tokens (designer's v1.1)
6. **`playbook/00-OVERVIEW.md`** — the phase-by-phase build plan
7. **Each phase file under `playbook/`** — on demand, as phases are entered
8. **Skills** under `skills/` — auto-activate when their triggers fire
9. **`_design/`** — token file (the executable design system), style tile, screen artifacts. **Phase 2 reference artifacts are clearly labeled — DO NOT BUILD them in this phase.**
10. **`_extraction/`** — TONY_DEMO patterns to NOT repeat
11. **External:** `agent_docs/app_factory/design-system/` — factory-level Design System Handbook + Theme Library (read on demand for design questions)

Conflict resolution: `DATA_CONTRACT.md` wins on data shapes, `UI_SPEC.md` wins on UI behavior, `_project/CLAUDE.md` wins on scope, this file wins on module structure. If two sources still conflict, STOP and surface to the operator.

---

## Folder Map

```
cyber_pharma_v1_phase1_ffm/
│
├── CLAUDE.md             ← THIS FILE (entry point)
├── README.md             ← operator's setup guide
├── AGENTS.md             ← Codex pointer → redirects here
├── GEMINI.md             ← Gemini CLI pointer → redirects here
│
├── _project/             ← PROJECT-SPECIFIC content (Cyber Pharma v1 Phase 1)
│   ├── CLAUDE.md         ← project spine
│   ├── APP_BRIEF.md      ← Phase 1 scope + success criteria
│   ├── DATA_CONTRACT.md  ← Phase 1 types and service contracts
│   └── UI_SPEC.md        ← Phase 1 screens + locked v1 design tokens (designer's v1.1)
│
├── _design/              ← visual reference (token file is executable)
│   ├── README.md         ← what's here, how Claudy uses it
│   ├── style-tile.png    ← visual contract (operator drops)
│   ├── style-tile.html   ← interactive style tile (operator drops if exists)
│   ├── landing-page-desktop.png  ← THE new screen for Phase 1
│   ├── landing-page-mobile.png   ← mobile companion
│   ├── tokens/
│   │   ├── globals.css                  ← READY-TO-COPY token file
│   │   └── tailwind.config.snippet.ts   ← config mapping snippet
│   ├── COMPONENT_MANIFEST.md            ← which primitives for which screen
│   └── phase2-reference/                ← VISUAL DIRECTION ONLY — DO NOT BUILD
│       ├── README.md                    ← warning: not for this phase
│       └── (OwedBook, mobile, etc. PNGs)
│
├── _extraction/          ← minimal patterns reference
│   └── README.md         ← what to drop here for Phase 1
│
├── skills/               ← REUSABLE skills (travel across runs)
│   └── stark-frontend-first/
│
├── playbook/             ← REUSABLE phase-by-phase build instructions
│   ├── 00-OVERVIEW.md
│   ├── 01-DISCOVERY.md
│   ├── 02-TYPES.md
│   ├── 03-SERVICES.md
│   ├── 04-MOCKS.md
│   ├── 05-COMPONENTS.md  ← rewritten for one-app + landing page + token install
│   ├── 06-VERIFICATION.md ← rewritten for local smoke (no deploys)
│   ├── 07-RETROSPECTIVE.md
│   └── RETROSPECTIVES/
│
└── verification/         ← REUSABLE checkpoint checklists
    ├── PHASE_GATES.md    ← rewritten — deploy gates dropped
    └── BUILD_CHECKLIST.md ← rewritten — local smoke
```

Underscore-prefixed folders contain content that changes per project. Non-prefixed folders contain reusable Factory tooling.

---

## Activation Contract

When the operator stages this module into the Cyber Pharma v1 starter kit clone and opens Claudy, the boot prompt is:

> *"Read `PROJECT_POINTER.md` at project root. Follow it. STOP after the FFM's Discovery sub-phase summary and wait for my approval."*

Claudy reads PROJECT_POINTER.md → it points at this FFM → Claudy follows the reading order above → produces a structured Discovery summary → STOPS.

If Claudy starts writing code before this acknowledgment-and-approval cycle, the operator stops the run.

---

## Forbidden Zones (Hard Stops)

These rules apply throughout the entire FFM execution. Violation = STOP and surface to operator.

### Deployment Work (Out of Scope for ALL of Phase 1)

A separate department owns deployment infrastructure. Phase 1 ships:
- ✅ Code that builds clean (`npm run build` succeeds)
- ✅ Code that runs locally (`npm run dev` works)
- ❌ NO Cloud Run deploys
- ❌ NO domain configuration / CNAME work
- ❌ NO staging URL setup
- ❌ NO `gcloud` commands of any kind

If a feature seems to require deploy work, flag it: **"This requires deploy work. Out of scope for this FFM. Recommend: leave for the DevOps department."**

### Superadmin App (Out of Scope — Moving to Its Own Repo)

The superadmin functionality is being moved to a separate repo as the **Super Admin Portal** project. In this Phase 1 FFM:

- ❌ DO NOT preserve the `(superadmin)` route group → DELETE IT (whole folder, all files)
- ❌ DO NOT preserve any `/api/superadmin/*` routes → DELETE THEM ALL
- ❌ DO NOT preserve the inherited superadmin user management UI → DELETE IT
- ❌ DO NOT include 'superadmin' in `protectPage()` allowedRoles calls — `['admin']` or `['member']` only

The `app_role` enum in `user_roles` table may keep `superadmin` value (it's just data, harmless), but no UI or routes reference it in this app.

### Backend Schema Work (Out of Scope — Phase 3's Job)

The 13 Frank-domain tables documented in MASTER_APP_BRIEF §5 — `businesses`, `user_businesses`, `user_data`, `subscriptions`, etc. — DO NOT exist in Phase 1. DO NOT create them. They land in Phase 3.

### Real Feature Work (Out of Scope — Phase 2+)

Phase 1 ships **placeholder pages** for the admin portal and members portal. No OwedBook screens. No imports flow. No reports viewer. Those are Phase 2 concerns.

**Critical:** the `_design/phase2-reference/` folder contains gorgeous OwedBook screenshots. They are VISUAL DIRECTION for Phase 2, not Phase 1 build targets. If Claudy is tempted to build OwedBook from these artifacts: STOP.

### Hard Stack Rules (Inherited from Stark Global)

- ❌ **No `dangerouslySetInnerHTML`.** Use `html-react-parser` for HTML, `react-markdown` for markdown.
- ❌ **No `any` types.** Use `unknown` with narrowing when type is truly unknown.
- ❌ **No Pages Router patterns.** App Router only.
- ❌ **No direct mock imports in components.** Components only call services. Services own the mocks.
- ❌ **No roles in `user_metadata`.** Roles live in `user_roles` table (starter kit pattern). Regression guard against TONY_DEMO smell.
- ❌ **No `superadmin-add-user` route.** Delete on sight (vulnerable pattern from TONY_DEMO).
- ❌ **No numbered Tailwind colors in components** (`bg-slate-800`, `text-red-600`). Use semantic token utilities only (`bg-card`, `text-destructive`). The kit currently violates this — Phase 1 migrates onto tokens.

If the AI tool finds itself about to violate any forbidden zone, it STOPS and surfaces. The operator decides.

---

## Skill Inventory

This module ships with one custom skill. The operator additionally installs Anthropic-official skills before the run.

**Custom (in this module):**
- `skills/stark-frontend-first/` — frontend-first methodology, service layer doctrine, anti-patterns

**Anthropic-official (operator installs to `.claude/skills/` of the starter kit):**
- `frontend-design` — kills generic AI aesthetic, encodes design principles
- `skill-creator` — meta-skill for authoring new skills during runs
- `webapp-testing` — Playwright testing for the verification sub-phase

Installation instructions are in `README.md`.

---

## What Is Reusable vs Per-Project

**Reusable across all runs of this module (do not modify per project):**
- This file (`CLAUDE.md`)
- `README.md`, `AGENTS.md`, `GEMINI.md`
- `skills/` (entire folder)
- `playbook/` (except `RETROSPECTIVES/`)
- `verification/`

**Per-project (filled in per run, replaced wholesale for the next run):**
- `_project/` (all four files)
- `_design/` (token file, style tile, screen artifacts)
- `_extraction/` (minimal TONY_DEMO docs)

**Accumulates across runs:**
- `playbook/RETROSPECTIVES/RUN_NNN_LESSONS.md`

---

## Evolution Principle

This FFM is v2 for Cyber Pharma v1 Phase 1 (v1 was authored before scope-cut decisions to drop the second app and remove deploy work).

After each run:
1. The AI tool authors a draft retrospective in `playbook/RETROSPECTIVES/RUN_NNN_LESSONS.md`
2. The operator reviews and edits
3. Lessons that are structural (apply to all future FFM runs) get promoted into the FFM_PLAYBOOK
4. Lessons that are project-specific stay in the retrospective for reference

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-03 | Initial FFM for Cyber Pharma v1 Phase 1. Two apps, deploy work included. |
| 2.0 | 2026-06-04 | Scope cut: one app only (superadmin moves to own repo). All deploy work removed (separate department owns this). Designer's UI_SPEC v1.1 integrated (locked v1 tokens, Tailwind 3.4.1 confirmed, semantic-utilities-only rule). Component manifest added. Factory-level Handbook + Theme Library staged for `agent_docs/app_factory/design-system/`. |

---

🛡️ **End of navigation contract. Read `_project/CLAUDE.md` next.**
