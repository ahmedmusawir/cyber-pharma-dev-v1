# _extraction/ — Patterns to NOT Repeat (Minimal for Phase 1)

> Phase 1 is greenfield. The starter kit IS the spec. Extracts here serve only as "don't do this again" reference material.

---

## What Goes Here (Phase 1 — minimal)

For Cyber Pharma v1 Phase 1, the relevant extraction docs are minimal — only the TONY_DEMO security-relevant ones to avoid repeating known smells:

1. **`TONY_DEMO_07-GUARDRAILS-AND-SANDBOXING.md`** — auth gates, RLS, security findings from TONY_DEMO. Tells Claudy what NOT to inherit (the `user_metadata.is_super_admin` smell, the `superadmin-add-user` vulnerability).

2. **`TONY_DEMO_10-RAW-FINDINGS-AND-QUESTIONS.md`** — open issues, drift, security smells documented during the TONY_DEMO extraction. Useful for the "what NOT to repeat" reference during Sub-Phase 4 (Components).

That's it for Phase 1.

---

## What's NOT Needed Yet

The Frank API and Frank Desktop extracts are NOT needed for Phase 1 because:

- No Frank-domain entities are being built (Phase 3+ work)
- No Frank API integration in Phase 1
- DATA_CONTRACT for Phase 1 only references `auth.users` + `user_roles` (starter kit tables)

When Phase 3 FFM is authored, those extracts become relevant. For Phase 1, skip them.

---

## How Claudy Uses This Folder

Claudy reads `_extraction/` **on demand**, not at activation. Specifically:

- During **Sub-Phase 0 (Discovery)**: skim what docs exist; don't read deeply
- During **Sub-Phase 4 (Components)**: read `TONY_DEMO_07-GUARDRAILS` when deleting the `(superadmin)` route group to confirm the vulnerability patterns being eliminated
- During **Sub-Phase 5 (Verification)**: cross-reference TONY_DEMO findings to ensure Phase 1 closed every flagged security gap

If `_extraction/` is empty when Claudy activates, Claudy will:
1. Surface to operator: "No extraction docs found. Proceeding without TONY_DEMO reference — risk of repeating known smells. Confirm or provide extracts."

---

## File Naming Convention

Copy the existing extraction docs from project knowledge verbatim:

```
_extraction/
├── README.md                                  ← this file
├── TONY_DEMO_07-GUARDRAILS-AND-SANDBOXING.md
└── TONY_DEMO_10-RAW-FINDINGS-AND-QUESTIONS.md
```

---

## Operator Notes

You have these docs in your project knowledge. Copy them into `_extraction/` mechanically:

1. Pull `TONY_DEMO_07-GUARDRAILS-AND-SANDBOXING.md` and `TONY_DEMO_10-RAW-FINDINGS-AND-QUESTIONS.md` from your factory's extraction archive
2. Drop into this folder
3. Activate Claudy

Or skip entirely if you trust the FFM's forbidden zones to cover everything. The TONY_DEMO smells are already documented in `_project/CLAUDE.md` and `_project/APP_BRIEF.md` — these extracts are just the original evidence base.

🥄 *Phase 1 = minimal extracts. Frank-domain extracts join in Phase 3 FFM.*
