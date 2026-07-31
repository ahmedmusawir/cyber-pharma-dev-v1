# Correction Applied: Public Values Baked + Operator Roadmap + Phase 0 Resume

## Correction executed

- `deploy.sh` lines 18–19: both REPLACE_MEs replaced with the operator-supplied PUBLIC values (`https://yrsuwikjnbmvpznrgydb.supabase.co` / `sb_publishable_8FvPLZTmChxMrPwv7q9-rw_NgjoDk1S`). These are client-shipped public vars — §4.7 read-only boundary applies to secrets, not these. `bash -n` OK.
- EVIDENCE: remaining `REPLACE_ME` hits in deploy.sh are lines 23–24 only — the operator-added guard's own literals (it greps the variable CONTENTS, not the file). Guard will pass with baked values.
- 4 ledger rows appended (rows 9–12): (9) intake must collect public var VALUES verbatim, bake at generation — REPLACE_ME in a generated file = generation defect for public vars (v3 regression vs MC); (10) secret flow = exactly ONE operator CLI action between init-app.sh and deploy.sh, versions-add with marked placeholder, agent never sees the value — v3.1 states it as the ONLY manual step; (11) principle: operator touches the CLI, never the files — files are born complete; (12) execute skill must OPEN with an operator roadmap of phases + manual CLI moments.

## OPERATOR ROADMAP (all commands run by operator; ★ = the one value-substitution moment)

1. **Phase 0 — Pre-flight** (3 quick commands + 4 yes/no questions): guard check, file listing, routing confirmation
2. **Phase 1 — One-time setup**: `./init-app.sh` (secret shell + runtime SA + binding) → ★ **versions-add command with `PASTE_YOUR_SECRET_HERE` marker — you substitute your SUPABASE_SECRET_KEY from .env.local and run; I never see it** → verify secret shows 2+ versions
3. **Phase 2 — IAM verify**: 1 Truth Command (runtime SA binding on the secret; build SA needs nothing — zero build secrets)
4. **Phase 3 — Deploy**: `./deploy.sh` → watch for NO IAM-policy warning (Staging Rule passive proof) → get run.app URL → curl smoke test (Safe-Browsing warning on run.app = expected, not a defect)
5. **Phase 4 — SKIPPED** (domain verified previously; if it ever complains "domain not verified" = FULL STOP)
6. **Phase 5 — DNS/SSL**: domain-mapping create (beta track) → describe → CNAME already pre-staged in DO → dig check → SSL wait (15–30 min) → HTTPS curl
7. **Phase 6 — Invoker**: allUsers run.invoker binding + yaml verify (public intent)
8. **Phase 7 — Completion summary**: 6/6 criteria with EVIDENCE, deployment log delivered

## Phase 0 resumed — Command 1 handed over

```bash
grep -n "NEXT_PUBLIC_SUPABASE\|REPLACE_ME" deploy.sh
```

Expected: 4 lines — 18/19 showing the real baked values, 23/24 being the guard's own literals. Proves guard passes. STOP GATE: awaiting paste.
