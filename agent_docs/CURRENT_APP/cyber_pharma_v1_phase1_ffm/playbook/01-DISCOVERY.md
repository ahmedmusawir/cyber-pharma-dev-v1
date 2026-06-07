# Playbook 01 — Sub-Phase 0: Discovery

> **Goal:** AI tool reads everything, summarizes back, proposes Sub-Phase 1 plan.
> **AI time:** 10-15 min | **Review time:** 5-10 min
> **Code produced:** none

---

## What This Sub-Phase Does

Before any code is written, the AI tool must demonstrate it understands:
- What this project is (Cyber Pharma v1, Phase 1 Foundation Skeleton)
- What's in scope and out of scope
- What the data shapes are (auth.users + user_roles only)
- What the screens look like (placeholders + inherited starter kit auth screens)
- What the forbidden zones are (backend schema, Frank-domain tables, user_metadata roles, the entire `(superadmin)` route group + all `/api/superadmin/*` routes, ALL deploy work, Phase 2 reference artifacts)

This sub-phase produces no code. It produces an acknowledgment that proves the AI is oriented.

---

## Steps

### Step 1 — Read The Navigation

In order:
1. `../CLAUDE.md` (module root) — re-read for full doctrine
2. `../_project/CLAUDE.md` — project-specific spine (forbidden zones, tech stack)
3. `../_project/APP_BRIEF.md` — Phase 1 scope and gates
4. `../_project/DATA_CONTRACT.md` — Phase 1 data shapes
5. `../_project/UI_SPEC.md` — Phase 1 screen behavior

### Step 2 — Inspect The Starter Kit

At the starter kit project root (where the AI is running):
- Read root `CLAUDE.md` — note its conventions
- Inspect `src/` structure — what's already built
- Inspect `package.json` — what's installed (Next.js version, Shadcn, Zustand, Vitest, Playwright)
- Inspect `.claude/skills/` — verify three skills present: `frontend-design`, `skill-creator`, `stark-frontend-first`
- Read `RECOVERY.md` if it exists — note any prior state
- Inspect `agent_docs/security/` — confirm the audit findings ledger is initialized
- Inspect `agent_docs/starter-kit/starter-kit-handbook.md` — read for context

### Step 3 — Verify The Audited Starter Kit State

Confirm the security baseline:

```bash
# Should report zero vulnerabilities (we audited this)
npm audit

# Should show clean lockfile (audited and propagated)
git log -1 package-lock.json

# Should exist
test -f agent_docs/security/SECURITY_FINDINGS.md && echo "Findings ledger exists"
test -f agent_docs/security/CLEANUP_BACKLOG.md && echo "Backlog exists"
```

If any of these fail, STOP and surface to operator — Phase 1 cannot start on an unaudited foundation.

### Step 4 — Reference Material (Skim)

- Glance at `../_design/` — note what brand tokens / style tile exists
- Glance at `../_extraction/` — note which TONY_DEMO and FRANK_API docs are present
- Read `../skills/stark-frontend-first/CLAUDE.md` and `SKILL.md` — the skill's full doctrine

### Step 5 — Produce The Acknowledgment

Output a structured summary in this format:

```
## Sub-Phase 0 Discovery Complete

### Project Identity
- Name: Cyber Pharma v1
- Phase: 1 of 8 — Foundation Skeleton
- Repos: cyber-pharma-v1 (main app ONLY — superadmin moves to its own repo as separate project)
- Source: Audited Next.js starter kit clone
- FFM scope: This FFM covers Phase 1 ONLY (Foundation Skeleton, single app, NO deploys)

### Scope Summary
- Install designer's locked v1 tokens (coral, Saira, Metro flat, Mist + Slate themes)
- Wire `tailwind.config.ts` to map tokens
- DELETE entire `(superadmin)` route group + all `/api/superadmin/*` routes
- Migrate kit's hardcoded numbered Tailwind colors onto semantic tokens
- Build `/` landing page per `_design/landing-page-desktop.png` (THE new screen)
- Brand inherited auth screens (token-only, no logic changes)
- Build placeholder pages for `/admin-portal` and `/members-portal`
- Verify role gates hold via `protectPage`
- Local-only verification (build clean, dev runs, smoke walkthrough, env fail-closed)
- **NO Cloud Run deploys, NO CNAME work** — separate department handles that later

### Three Most Critical Forbidden Zones
1. ALL deploy work (no Cloud Run, no gcloud, no CNAME — separate department, later phase)
2. The entire `(superadmin)` route group and `/api/superadmin/*` — superadmin moves to its own repo
3. Building OwedBook from `_design/phase2-reference/` artifacts (Phase 2 reference only — DO NOT BUILD)

### Stack Detected
- Framework: Next.js [version detected]
- UI: shadcn/ui + Tailwind [version]
- State: Zustand [version]
- Auth: Supabase via @supabase/ssr [version]
- Forms: react-hook-form + Zod
- Tests: Vitest + Playwright

### Audit State Verified
- ✅ npm audit reports 0 vulnerabilities
- ✅ Lockfile committed
- ✅ agent_docs/security/ initialized
- ✅ Middleware security update applied (from earlier audit)

### Skill Stack Verified
- ✅ frontend-design (Anthropic)
- ✅ skill-creator (Anthropic)
- ✅ stark-frontend-first (custom — in this FFM)

### Brand Tokens / Style Tile State
- [Brand tokens present in _design/ — yes/no, list what's there]
- [Style tile present — yes/no]
- [If missing — proceeding with shadcn zinc defaults until operator provides]

### Extraction Docs State
- [List which TONY_DEMO docs are in _extraction/]
- [List which FRANK_API docs are in _extraction/]

### Proposed Sub-Phase 1 Plan
- Create `src/types/User.ts` from DATA_CONTRACT §4
- Create `src/types/UserRole.ts` from DATA_CONTRACT §4
- Create `src/types/AuthenticatedUser.ts` from DATA_CONTRACT §4
- Create `src/types/index.ts` exporting all
- Run `tsc --noEmit` to verify clean compilation
- Files I will create: [list]
- Files I will NOT touch: backend, services, components, mocks (next sub-phases)

### Concerns / Open Questions
- [If any — surface here]

### Awaiting Approval
Ready to proceed to Sub-Phase 1 (Types & Contract)?
Type "approved" or specify changes.
```

### Step 6 — Stop

Do not proceed. Wait for the operator's "approved" or correction.

---

## Verification Gate

The operator confirms BEFORE giving approval:

- [ ] AI named the correct project (Cyber Pharma v1, Phase 1 Foundation Skeleton)
- [ ] AI named the three most critical forbidden zones correctly
- [ ] AI detected the right tech stack from `package.json`
- [ ] All three skills verified in `.claude/skills/`
- [ ] Audit state confirmed (0 vulns, lockfile clean, security ledger initialized)
- [ ] Brand tokens / style tile state surfaced
- [ ] Extraction docs presence surfaced
- [ ] Sub-Phase 1 plan is realistic and matches the playbook

If any item fails, the operator corrects the AI before approving. The AI does not advance until all items pass.

---

## Common Stumbles

- AI tries to write code in Sub-Phase 0 → STOP. This sub-phase is read-only.
- AI summarizes wrong scope → re-read `_project/APP_BRIEF.md` §3 and §4
- AI doesn't find the skills → verify `.claude/skills/` path is correct, restart Claude if needed
- AI confuses module CLAUDE.md with project CLAUDE.md → re-read both carefully, they have different purposes
- AI tries to scope beyond Phase 1 → re-read `_project/APP_BRIEF.md` §4 (out of scope)
- AI ignores the audit verification step → STOP. Phase 1 cannot start on unaudited foundation.
