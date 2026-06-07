# README — Cyber Pharma v1 / Phase 1 FFM (v2)

> **For the human operator (Tony).** AI tools should start with `CLAUDE.md` instead.

---

## What This Is

The Cyber Pharma v1 Phase 1 Frontend-First Module, **v2**. A portable Factory artifact for executing Phase 1 (Foundation Skeleton) on the main Cyber Pharma v1 app.

**v2 differences from v1:**
- One app only (superadmin moved to its own repo as a separate project)
- No deploy work (handled by a separate department in a later phase)
- Designer's locked v1 tokens + UI_SPEC v1.1 integrated
- Tailwind 3.4.1 confirmed

---

## Quick Start

### Step 1 — Stage The Module

Drop this entire `cyber_pharma_v1_phase1_ffm/` folder into your starter kit's `agent_docs/CURRENT_APP/` directory:

```
cyber-pharma-v1/                                    ← starter kit clone
├── PROJECT_POINTER.md                              ← create this (points at FFM)
├── agent_docs/
│   ├── app_factory/                                ← factory docs
│   │   └── design-system/                          ← place Handbook + Theme Library HERE
│   ├── CURRENT_APP/
│   │   └── cyber_pharma_v1_phase1_ffm/             ← drop the FFM here
│   └── starter-kit/
│       └── starter-kit-handbook.md
├── src/
└── package.json
```

### Step 2 — Stage Factory-Level Docs (Outside The FFM)

Two files in the bundle are factory-level — they live OUTSIDE the FFM:

```
agent_docs/app_factory/design-system/
├── GLOBAL_DESIGN_SYSTEM_HANDBOOK.md     ← doctrine for how the factory designs apps
└── THEME_LIBRARY.md                     ← catalog of named themes
```

These survive Phase 1 closure and inform every future FFM the designer touches.

### Step 3 — Verify `_project/` Is Filled

The four files in `_project/` are already authored:
- `CLAUDE.md` — project spine (one app, no deploy, v1 tokens)
- `APP_BRIEF.md` — Phase 1 scope, 10 hard gates (down from 15 — deploy gates removed)
- `DATA_CONTRACT.md` — Phase 1 data shapes (auth.users + user_roles)
- `UI_SPEC.md` — designer's v1.1 (with Tailwind 3 locked, superadmin app stripped)

Review and adjust before staging.

### Step 4 — Verify `_design/` Is Filled

Designer's deliverables are already authored. You drop in the visual assets:

```
_design/
├── README.md                          ← already authored
├── style-tile.png                     ← drop your style tile PNG
├── style-tile.html                    ← drop the interactive style tile if exists
├── landing-page-desktop.png           ← drop cyberpharma_home_metro_warm.png
├── landing-page-mobile.png            ← drop cyberpharma_home_mobile.png
├── tokens/
│   ├── globals.css                    ← already authored (designer's locked tokens)
│   └── tailwind.config.snippet.ts     ← already authored
├── COMPONENT_MANIFEST.md              ← already authored (designer's manifest)
└── phase2-reference/                  ← VISUAL DIRECTION ONLY — NOT FOR PHASE 1 BUILD
    ├── README.md                      ← already authored (warning header)
    ├── owedbook-metro-warm-mist.png   ← drop OwedBook light
    ├── owedbook-metro-warm-slate.png  ← drop OwedBook dark
    ├── owedbook-federal-dollars.png   ← drop tab variant
    ├── owedbook-mobile-mist.png       ← drop mobile light
    └── owedbook-mobile-slate.png      ← drop mobile dark
```

### Step 5 — Fill `_extraction/`

Minimal — just patterns to NOT repeat:

```bash
cp /path/to/project_knowledge/TONY_DEMO_07-GUARDRAILS-AND-SANDBOXING.md _extraction/
cp /path/to/project_knowledge/TONY_DEMO_10-RAW-FINDINGS-AND-QUESTIONS.md _extraction/
```

Skip Frank API extracts for Phase 1 — no Frank-domain work happening.

### Step 6 — Install Anthropic Skills

```bash
# Use plugin marketplace (preferred) — installs example-skills bundle
# This bundle includes frontend-design, skill-creator, webapp-testing, etc.
# In Claude Code:
#   /plugin marketplace add anthropics/skills
#   /plugin install example-skills@anthropic-agent-skills

# Then copy the custom skill from the FFM
mkdir -p .claude/skills
cp -r agent_docs/CURRENT_APP/cyber_pharma_v1_phase1_ffm/skills/stark-frontend-first .claude/skills/

# Verify
ls .claude/skills/
# Should show: frontend-design  skill-creator  webapp-testing  stark-frontend-first  (and others from bundle)
```

### Step 7 — Create `PROJECT_POINTER.md`

At the starter kit root, create `PROJECT_POINTER.md`:

```markdown
# Active Project Module

The current project's Factory module lives at:
**`agent_docs/CURRENT_APP/cyber_pharma_v1_phase1_ffm/`**

On session start, read `CLAUDE.md` in that folder. That file is the project's navigation contract.

Before starting the FFM's Discovery sub-phase, also read these kit-level references:
- `agent_docs/starter-kit/starter-kit-handbook.md` — kit conventions and what's pre-wired
- `agent_docs/starter-kit/COMPONENT_REGISTRY.md` (if it exists)

This pointer is active until Phase 1 completes. After completion, update this file to point at the Phase 2 FFM.
```

### Step 8 — Open Claude Code & Boot

From the starter kit root:

```bash
claude
```

Paste the boot prompt:

> You are Claudy, working on Cyber Pharma v1 under Tony Stark.
>
> BOOT SEQUENCE — read in this exact order, then STOP:
>
> 1. Read your global CLAUDE.md
> 2. Read this repo's root CLAUDE.md
> 3. Read PROJECT_POINTER.md at repo root
> 4. Read the kit-level references named in PROJECT_POINTER.md
> 5. Read `agent_docs/CURRENT_APP/cyber_pharma_v1_phase1_ffm/CLAUDE.md` and follow its Reading Order section exactly
> 6. Confirm required skills present in .claude/skills/ (frontend-design, skill-creator, webapp-testing, stark-frontend-first)
> 7. Produce a structured Sub-Phase 0 Discovery summary per `playbook/01-DISCOVERY.md` Step 5
> 8. STOP and wait for "approved" before doing anything else.
>
> Hard constraints during boot: NO code, NO file modifications, Plan Mode applies to everything. Karpathy Protocol: you are the hands, I am the architect.

Claudy responds with the structured acknowledgment. You verify it makes sense. You approve or correct.

---

## The Run

Once boot prompt is acknowledged and Phase 0 is approved, the run proceeds through these sub-phases:

- **Phase 0:** Discovery (Claudy reads, summarizes, awaits approval)
- **Phase 1:** Types & Contract (auth.users + user_roles only)
- **Phase 2:** Service Layer (auth services + role-resolution helper)
- **Phase 3:** Mock Data (minimal — test fixtures only)
- **Phase 4:** Components (install v1 tokens, rebrand auth screens, build landing page, delete superadmin route group, kit reconciliation)
- **Phase 5:** Verification (local smoke walkthrough, build clean, tests pass — NO DEPLOYS)
- **Phase 6:** Retrospective (lessons for next FFM)

At each sub-phase boundary, Claudy stops and reports. You approve or correct. Then next sub-phase.

**Estimated total time:** 1-2 sessions. The starter kit gives us most of Phase 1 for free. The bulk of new work is Sub-Phase 4 (token install + landing page + superadmin route deletion + kit color reconciliation).

---

## What Phase 1 Actually Builds

**New screens (real work):**
1. `/` — Public marketing landing page (the gorgeous one your designer made)

**Inherited screens (rebrand only — no logic changes):**
2. `/login`, `/register`, `/forgot-password` (apply v1 tokens, logo swap)

**Placeholder screens (just "Coming in Phase 2"):**
3. `/admin-portal`
4. `/members-portal`
5. `/access-denied`

**Routes to DELETE entirely:**
6. `/superadmin-portal` (whole route group)
7. `/api/superadmin/*` (all routes)
8. `/api/superadmin/superadmin-add-user` (vulnerability — confirm deletion)

**Foundation work:**
9. Install designer's `globals.css` (locked v1 tokens — Mist + Slate themes)
10. Wire `tailwind.config.ts` to map tokens
11. Wire Saira via `next/font`
12. Migrate kit's hardcoded `slate-800` / `red-600` onto semantic tokens
13. Error boundaries on remaining route groups
14. Env var fail-closed check

---

## Operator Cheat Sheet

**Starting a session mid-run (after interruption):**

> "Read RECOVERY.md at project root, then read `agent_docs/CURRENT_APP/cyber_pharma_v1_phase1_ffm/CLAUDE.md`, then continue from where we left off. Report the last completed sub-phase and propose the next sub-phase before doing any work."

**If Claudy drifts into a forbidden zone:**

> "STOP. You touched a forbidden zone. Read `_project/CLAUDE.md` again and tell me which zone you violated. Then we recover."

**If Claudy is tempted to build OwedBook from Phase 2 reference artifacts:**

> "STOP. Those artifacts in `_design/phase2-reference/` are visual direction ONLY for Phase 2. Read `_design/phase2-reference/README.md` and confirm what Phase 1 actually builds."

**If Claudy starts authoring deploy code:**

> "STOP. Deployment is out of scope for this FFM. A separate department owns deploys. Confirm what you were about to do and we'll redirect."

**Ending a session cleanly:**

> "Update RECOVERY.md with the current state and the next action. Don't start anything new."

---

## Troubleshooting

**Claudy doesn't recognize the module:**
- Verify `PROJECT_POINTER.md` exists at the starter kit root
- Verify the pointer names the correct folder (`cyber_pharma_v1_phase1_ffm`)
- Try the boot prompt again, more explicitly with the full path

**Token migration is harder than expected:**
- The kit may have many hardcoded colors. Use `grep -rn "slate-800\|red-600\|bg-zinc" src/` to find them all upfront
- Migrate in one pass, not piecemeal
- Verify the theme switcher still works after migration

**Build fails at phase gate:**
- Read `verification/PHASE_GATES.md` for the specific gate's criteria
- If criteria aren't met, do NOT advance — fix or surface

**Designer's tokens look wrong:**
- Verify `globals.css` was copied verbatim (HSL triplets, no `hsl()` wrapper)
- Verify `tailwind.config.ts` maps tokens as `hsl(var(--token-name))`
- Verify Saira loaded via `next/font` (NOT a CDN link)
- Check style tile renders correctly in browser

---

## Sequencing Note — This FFM Covers Phase 1 ONLY

This FFM is scoped to **Cyber Pharma v1 Phase 1 — Foundation Skeleton.**

Phase 2 (Visual Fidelity With Demo Data — the OwedBook screens) needs a SEPARATE FFM — `cyber_pharma_v1_phase2_ffm` — authored when Phase 1 completes, informed by Phase 1's retrospective.

When Phase 1 closes:
1. Author the Phase 1 retrospective in `playbook/RETROSPECTIVES/`
2. Move this FFM to `agent_docs/completed_phases/` (or wherever you archive)
3. Author the new Phase 2 FFM, informed by lessons learned and using the same designer artifacts (now actually being built)
4. Stage the new FFM at `agent_docs/CURRENT_APP/`
5. Update PROJECT_POINTER.md
6. Repeat

---

## Credits

- **Module designer (FFM):** Claude (acting as Tony Stark's Chief Architect)
- **UI designer (v1.1):** Tony's Designer (locked v1 design language, tokens, manifest, handbook)
- **Module operator:** Tony Stark (Moose)
- **Source pattern:** App Factory FFM v1.0 (Cyberize run, May 2026)
- **Methodology:** Stark Industries AI App Factory doctrine

---

## Version

**v2.0** — Cyber Pharma v1 Phase 1 FFM with designer's v1.1 spec integrated, scope reduced to one app, deploy work removed. Authored 2026-06-04.

🥄 *Part of Stark Industries — AI App Factory.*
