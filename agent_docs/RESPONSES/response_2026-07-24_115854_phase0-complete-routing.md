# Phase 0 COMPLETE — Pre-Flight Evidence + Agreed Routing

## Evidence collected (all operator-pasted / operator-confirmed)

- **EVIDENCE (Command 1):** deploy.sh lines 18–19 = real baked Supabase public values; 23–24 = guard's own literals; 47–48 = substitution-builder lines. Guard passes; value chain intact (config → SUBSTITUTIONS → cloudbuild → build args).
- **EVIDENCE (Command 2):** all 6 package files present at repo root; `deploy.sh` + `init-app.sh` executable (`-rwxrwxr-x`).
- **Q1 (files):** closed by Command 2 EVIDENCE.
- **Q2 (init state):** operator-confirmed — init-app.sh NEVER run for cyber-pharma. First run.
- **Q3 (deploy state):** operator-confirmed — first deploy; only `cyph-mission-ctrl-prod` exists in the project.
- **Q4 (domain):** operator-confirmed — `cyberizedev.com` verified at account level during MC run. (CLAIM-grade until Phase 5's mapping command succeeds without complaint — that success is the passive EVIDENCE.)

## Agreed routing

**Phases 1 → 2 → 3 → 5 → 6 → 7.** Phase 4 SKIPPED (dormant; any "domain not verified" complaint = FULL STOP + ledger per standing order). Phase 3 Step 3.3 two-deploy WAIVED (domain baked). Phase 3 must show NO "Setting IAM policy failed" warning (Staging Rule passive proof).

## Next

STOP GATE: awaiting operator "Proceed to Phase 1". First Phase 1 command will be `./init-app.sh` (chmod already verified — Step 1.1 satisfied by Command 2 evidence).
