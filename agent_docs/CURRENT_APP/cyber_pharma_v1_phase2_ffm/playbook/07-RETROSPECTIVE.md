# Playbook 07 — Sub-Phase 6: Retrospective

> **Goal:** Capture lessons from Phase 1 for the next FFM (Phase 2).
> **AI time:** 30 min | **Review time:** 15 min
> **Code produced:** `playbook/RETROSPECTIVES/RUN_001_LESSONS.md`

---

## Why Retrospectives Matter

Each FFM run is a chance to make the next FFM sharper. Lessons fall into three categories:

1. **Structural** — apply to all future FFM runs → promote to playbook or skills
2. **Project-specific** — stay in the retrospective for reference
3. **Phase-2-relevant** — feed directly into the Phase 2 FFM authoring

Without a retrospective, the next FFM repeats the same stumbles. With one, the next FFM starts from a sharper baseline.

---

## Steps

### Step 1 — Draft The Retrospective

Create `playbook/RETROSPECTIVES/RUN_001_LESSONS.md`:

```markdown
# RUN 001 — Cyber Pharma v1 Phase 1 — Lessons Learned

> **Run completed:** YYYY-MM-DD
> **Operator:** Tony Stark
> **Sessions:** [actual count]
> **Outcome:** [SUCCESS / SUCCESS_WITH_NOTES / NEEDS_REWORK]

---

## What Worked

- [list things that went smoothly — be specific]
- E.g., "The starter kit's protectPage pattern needed no modification — service layer wrapped it cleanly"
- E.g., "Brand tokens defined in Sub-Phase 4 Step 1 prevented the 'fix later' trap"

## What Stumbled

- [list things that took longer than expected, or required correction]
- E.g., "Kit color reconciliation surfaced N more hardcoded colors than the initial inventory; took an extra pass"
- E.g., "Theme toggle was wired for shadcn defaults; needed rewiring for Mist/Slate"
- E.g., "Designer's HSL values needed one tweak when style tile rendered in browser"

## What Should Change For Next FFM

### Structural (promote to playbook)
- [lessons that apply to ALL future FFM runs]
- E.g., "Add a `agent_docs/security/` initialization check to Sub-Phase 0 (Discovery)"
- E.g., "Pre-check the starter kit's `protectPage` signature before Sub-Phase 3"

### Project-specific (stays here)
- [lessons specific to Cyber Pharma]
- E.g., "Frank's brand colors weren't finalized — used assumed style tile for v1, plan to iterate in Phase 2"

### Phase 2 specific (feeds next FFM)
- [items that directly inform cyber_pharma_v1_phase2_ffm]
- E.g., "OwedBook screens will need a tabs component — verify shadcn ships one or add via skill-creator"
- E.g., "Filter sidebar needs URL search params from day one — establish convention in `_project/CLAUDE.md`"

## Surprises

- [anything unexpected — good or bad]
- E.g., "Three-client Supabase pattern was easier to wrap than expected"
- E.g., "Designer's `--radius: 0` token cascaded through every shadcn primitive in one shot — Metro flat applied globally with zero per-component work"

## Time Estimates vs Actual

| Sub-Phase | Estimated | Actual | Delta |
|---|---|---|---|
| 0 Discovery | 15 min | [actual] | [delta] |
| 1 Types | 30 min | [actual] | [delta] |
| 2 Services | 1 hour | [actual] | [delta] |
| 3 Mocks | 30 min | [actual] | [delta] |
| 4 Components | 2-3 hours | [actual] | [delta] |
| 5 Verification | 1-2 hours | [actual] | [delta] |
| 6 Retrospective | 30 min | [actual] | [delta] |
| **Total** | **5-7 hours** | **[actual]** | **[delta]** |

Calibration for Phase 2 FFM estimates: [Phase 2 is much bigger — adjust accordingly]

## Anti-Patterns Observed (Add To Skill?)

- [if any new anti-patterns surfaced, propose adding them to stark-frontend-first/references/ANTI_PATTERNS.md]

## New Patterns That Worked (Add To Skill?)

- [if any new useful patterns emerged, propose adding them to stark-frontend-first/references/]

## Open Questions For Next FFM

- [unresolved items that need decisions before Phase 2 begins]
- E.g., "Cross-app component sharing strategy still undecided (copy/workspace/AI-regenerate)"
- E.g., "Mock data location for Phase 2 — /src/mocks/ or separate fixtures repo?"

---

## Verdict

[One sentence — was this FFM execution successful overall? What's the operator's gut check on the foundation?]
```

### Step 2 — Identify Structural Lessons

Review the "What Should Change" section. For each "Structural" item:

1. Propose where it should land:
   - In this FFM's `playbook/` (a future run reads it)
   - In the `stark-frontend-first` skill's `references/`
   - In a separate factory-level playbook (operator owns this decision)
2. Draft the change (don't apply yet — operator decides)

### Step 3 — Identify Phase 2 Inputs

The Phase 2 FFM (`cyber_pharma_v1_phase2_ffm`) gets authored after this one. Identify what lessons should:
- Inform Phase 2 APP_BRIEF
- Inform Phase 2 DATA_CONTRACT
- Inform Phase 2 UI_SPEC
- Inform Phase 2 sub-phase sequencing

Capture these as a brief checklist at the bottom of the retrospective.

### Step 4 — Operator Review

Operator reads the retrospective. Edits, adds, removes. Confirms structural lessons that should propagate to the master factory playbook (separate effort).

### Step 5 — Produce Completion Summary

```
## Sub-Phase 6 Complete

### What I Did
- Drafted RUN_001_LESSONS.md with full retrospective
- Identified [N] structural lessons to promote
- Identified [N] Phase 2-relevant inputs
- Captured time estimates vs actual

### Files Created
- playbook/RETROSPECTIVES/RUN_001_LESSONS.md

### Files Modified
- (operator may edit retrospective)

### Concerns / Open Questions
- [items operator should decide before Phase 2 FFM authoring]

### Phase 1 FFM Complete
All 15 hard gates green. Retrospective drafted. App runs locally with v1 brand locked in.
Ready to archive this FFM and author the Phase 2 FFM.

### Awaiting Operator Action
- Review RUN_001_LESSONS.md
- Decide which structural lessons promote to factory playbook
- Approve archiving this FFM
- Initiate Phase 2 FFM authoring (separate effort)
```

### Step 6 — Stop

The FFM run is complete.

---

## Verification Gate

Operator confirms:
- [ ] RUN_001_LESSONS.md authored with all sections filled
- [ ] What Worked / What Stumbled both captured honestly (not just optimistic)
- [ ] Time estimates vs actual recorded (calibration data for future estimates)
- [ ] Structural lessons identified and routed
- [ ] Phase 2 inputs captured

If any section is thin or missing, push back to enrich.

---

## Common Stumbles

- AI writes a sycophantic retrospective ("everything went great!") → push back. Be honest. Failures teach more than successes.
- AI skips the time estimates → important for future calibration. Get rough numbers if exact ones aren't tracked.
- AI doesn't identify any structural lessons → check more carefully. Every run has at least 1-2 structural takeaways.
- AI tries to "fix" lessons during retrospective by going back and changing code → STOP. Retrospective documents what happened. Fixes happen in a future FFM run if needed.

---

## What Happens After Retrospective

1. Operator archives this FFM (moves to `agent_docs/completed_phases/`)
2. Operator authors the Phase 2 FFM (`cyber_pharma_v1_phase2_ffm`) using lessons from RUN_001
3. The architect (me, Claude) writes the master factory playbook based on patterns observed across the original FFM v1.0 and this Phase 1 FFM (separate effort, per Tony's plan)

The cycle compounds. Each FFM run sharpens the next one.

---

🥄 *End of Sub-Phase 6. Phase 1 FFM complete.*
