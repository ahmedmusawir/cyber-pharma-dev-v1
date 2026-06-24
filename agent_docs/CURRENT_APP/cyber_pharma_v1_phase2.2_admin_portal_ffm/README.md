# Phase 2.2 FFM Kickoff — Admin Portal Demo Shell

This package stages the **Phase 2.2** sub-project: the mock-functional Admin Portal Demo Shell that replaces the current `/admin-portal` user-CRUD with an owner-scoped preview of the future StoreLens.

## What's inside

```
phase2.2_ffm_kickoff/
├── README.md                 ← you are here
├── CLAUDE.md                 ← the FFM spine (doctrine + 3 locked rulings + gating)
├── ARCHITECT_KICKOFF.md      ← the recon-first, Plan-Mode prompt to paste to Claudy
└── _design/                  ← the complete design + contract authority (your designer's work)
    ├── AdminPortal_DEMO_APP_BRIEF.md
    ├── AdminPortalDemo_DATA_CONTRACT.md
    ├── UI_SPEC_AdminPortalDemo_v1_0.md
    ├── AdminPortalDemo_STYLE_TILE_DELTA.md
    ├── AdminPortalDemo_TOKEN_CONFIRMATION.md
    ├── admin_component_states.html
    ├── admin_component_states_mist.png
    └── admin_component_states_slate.png
```

## The 3 operator rulings baked in (locked)

1. **Navbar coral both modes** — dark `--navbar` bumps to a coral value (~`12 88% 58%`). Resolves the TOKEN_CONFIRMATION flag.
2. **Route takeover** — My Stores = `/admin-portal` landing; the old `/admin-portal/users` real CRUD is **removed** (it survives only in env-gated `/moose-portal`). Intended.
3. **The one hard rule** — invite-only member creation, no password field, ever.

## How to stage it (your factory's Pattern A)

1. Drop this whole folder into your repo at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_ffm/` (or your FFM location).
2. Copy your `.claude/skills/` from the OwedBook project into this FFM if you bridge skills that way.
3. Confirm you're on the `phase2.2-admin-portal-*` branch (you are).
4. Paste `ARCHITECT_KICKOFF.md`'s prompt to Claudy. It tells him to read `CLAUDE.md` then everything in `_design/`, run a read-only recon, and come back in Plan Mode — no code until you approve.

## What's still YOUR call during the build

- The two carried-forward DATA_CONTRACT flags: navbar (resolved → coral) and `jobTitle` (stays flagged demo-only — don't let it silently resolve).
- The cluster plan Claudy proposes in recon — review it before approving, same as the OwedBook FFM.
- The visual gate at 375 / tablet / desktop, both themes — that's yours (Gate M), the test runner can't see pixels.
- Confirm in recon that Claudy will NOT touch `/moose-portal`.

## Remember the demo's real job

This is a **requirements-harvesting machine** for Coach and Frank, not a finished portal. Every feature they name while clicking is a Phase-7 requirement captured cheap. Features real, nothing persists, no real credential anywhere.

🥄 Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.
