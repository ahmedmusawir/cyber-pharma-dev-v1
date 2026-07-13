# CLAUDE.md — stark-kit-residue-cleaner

> **Stark Industries App Factory — Agent Skill**
> *The post-clone cleanup ritual: trace and shed the starter kit's demo curriculum
> after a new app's own surfaces are built and verified.*

| Version | Date | Notes |
|---|---|---|
| v0.9 | 2026-07-10 | Authored from the MissionControl Phase 1 run |
| v0.9.1 | 2026-07-10 | Retrospective delta applied (RUN_002 close-out §5, §8) |
| v0.9.2 | 2026-07-13 | Renamed stark-kit-shed → stark-kit-residue-cleaner (operator ruling). Pending: activation test on Cyber Pharma v1 → v1.0 |

---

## 1. Identity / Mission

Every app in this factory starts as a clone of the Stark starter kit. The kit ships a
**demo curriculum**: example portals (superadmin / admin / member), real user-CRUD,
RBAC wiring, posts and booking demos. These exist to TEACH — the new app learns the
patterns, builds its own surfaces on the same underlying machinery, and then the
scaffolding must come down.

**This skill is that coming-down.** It runs in every project, once, after the app's
own surfaces are built and live-verified, and before real-data phases begin.

The lifecycle this skill serves: **clone → learn → build your own → SHED.**

You (the agent) execute the shed. The operator gates it. You are the hands; the
operator is the architect.

## 2. Activation Behavior

When the operator says "go read `<path-to-this-folder>/CLAUDE.md`" (or any activation
phrase naming stark-kit-residue-cleaner):

1. Read this file completely. It is always-on doctrine for the entire run.
2. Run **environment discovery** before asking anything: `pwd`, `git branch`,
   `git status`, read the repo's root CLAUDE.md, package.json name, and identify
   which app this is and what its OWN surfaces are (route groups, services,
   components the app authored — as opposed to kit-born demo surfaces).
3. Read `SKILL.md` for the methodology.
4. Enter Plan Mode. Phase 1 (TRACE) is read-only and may proceed after presenting
   its plan. Phase 2 (CLEANUP) requires the Phase 1 report to be delivered, the
   operator's rulings received, and an explicit approval.
5. Ask the operator ONLY for what discovery cannot infer.

**Launch-CWD note:** this skill is universal. It lives wherever the operator drops
it — a skill library, a repo, a USB stick. It is NOT tied to any `.claude/skills/`
install location. Activation is by path. All file paths in your outputs must be
relative to the TARGET REPO root, which discovery establishes.

## 3. Folder Tree

```
stark-kit-residue-cleaner/
├── CLAUDE.md                          ← you are here — doctrine + management
├── SKILL.md                           ← the methodology (read second)
├── README.md                          ← human-facing summary
├── references/
│   ├── KIT_DEMO_MANIFEST.md           ← the STATIC kill list: kit demo surfaces, versioned
│   └── ANTI_PATTERNS.md               ← field-earned failure modes; read before Phase 1
├── workflow/
│   ├── 00-trace.md                    ← Phase 1 procedure (consumer trace → kill-list report)
│   └── 01-cleanup.md                  ← Phase 2 procedure (gated execution)
└── examples/
    └── mission-control-2026-07/       ← the first real run (artifact pointers)
```

## 4. Doctrine — Always In Effect

1. **Plan Mode is non-negotiable.** No file is modified without a presented,
   approved plan. Phase 1 is read-only by definition; Phase 2 modifies only what
   the approved plan enumerates.
2. **Disk wins.** The manifest in references/ is a CLAIM until your trace verifies
   it against the actual repo. Kit versions drift; apps consume unexpected pieces.
   Every verdict carries an evidence label: EVIDENCE / INFERENCE / CLAIM / GAP /
   QUESTION.
3. **Git ban.** You never run git write operations. The operator is the sole
   committer. Phase 2 PRECONDITIONS (verify, do not perform): working tree clean,
   dedicated branch cut for the cleanup. If either fails, STOP and hand the
   operator the commands to run themselves.
4. **Read-only boundary.** The target repo is read-only except: (a) the deletions
   and surgical edits enumerated in the approved Phase 2 plan, (b) mirrors to
   `agent_docs/RESPONSES/`, (c) session/recovery files per the repo's own doctrine.
5. **Response Logging Protocol.** Every plan, report, and result is written to
   `agent_docs/RESPONSES/response_<YYYY-MM-DD>_<HHMMSS>_<slug>.md` BEFORE printing
   to screen.
6. **Infra vs curriculum.** Demo SURFACES die; kit INFRASTRUCTURE lives even at
   zero current consumers (client factories, middleware, role resolvers — the
   manifest marks these BLESSED-INFRA). When in doubt, it is a QUESTION for the
   operator, never a silent delete.
7. **Surgeries before deletions.** Any live KEEP surface referencing a soon-dead
   route is retargeted or trimmed FIRST. A KEEP page must never link a 404, even
   transiently.
8. **Exact-count gates.** Predict the post-cleanup test baseline BEFORE deleting;
   the gate is the exact number, not "tests pass." Any deviation stops the run.
9. **Enumerate-then-delete.** Kill lists ship as file enumerations; the executor
   re-enumerates before `rm`. Counts from arithmetic are hypotheses; counts from
   `find` are facts (proven 102 → 101 → 99 → 100 in run 1).
10. **Blessed-KEEP markers.** Every zero-consumer file kept by ruling gets a
    durable marker emitted as part of THIS SKILL'S OUTPUT: a one-line header
    comment (`// BLESSED INFRA — kept unconsumed by ruling <date>; <expected
    consumer>`) plus a `KEEP_MANIFEST.md` entry. Rulings that live only in
    session logs get re-litigated by every future recon.
11. **Two verification gates, never conflated.** The mechanical live walk (G5)
    proves routes and auth; the OPERATOR VISUAL PASS (G6) proves pixels. A 200
    on a client-rendered screen says nothing about what rendered — run 1's blank
    chart passed three green gates. Hand G6 to the operator as a named gate.

## 5. Reading Order

1. This CLAUDE.md (done, if you're reading this line)
2. `references/ANTI_PATTERNS.md` — the scars; cheap to read, expensive to repeat
3. `SKILL.md` — methodology overview + phase gates
4. `workflow/00-trace.md` — execute Phase 1
5. — OPERATOR GATE: rulings on the kill-list report —
6. `workflow/01-cleanup.md` — execute Phase 2 after approval
7. `references/KIT_DEMO_MANIFEST.md` — consulted DURING Phase 1 as the claim-set
   to verify

## 6. Operator Override Protocol

The operator's rulings are final and are recorded verbatim in the Phase 2 plan
(e.g., "keep client.ts — blessed infra"). If a ruling contradicts this skill's
doctrine, follow the ruling, note the contradiction in the result artifact, and
flag it for the skill's own evolution. Push back once with evidence if you believe
a ruling is unsafe; accept the decision after that.

## 7. Evolution Principle

Every run teaches. New failure modes go to `references/ANTI_PATTERNS.md`. Manifest
drift (kit added/removed demo surfaces) triggers a manifest version bump. Lessons
that belong to OTHER skills (e.g., recon grep patterns) are flagged for trickle-up
in the result artifact — this skill does not edit other skills.
