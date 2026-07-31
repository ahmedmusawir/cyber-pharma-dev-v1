# Step 0 Pre-flight — Attempt 2 Analysis (paste-mangled filter; one clean re-run needed)

## What the pasted output PROVES (evidence labels)

- **EVIDENCE:** Builds DO exist in us-east1 — `d91e573b-…` 2026-07-21, 10m17s, SUCCESS (the MC field-trial build). Attempt 1's empty result was the region gap.
- **EVIDENCE:** Project number is `524380376459` → compute default SA is `524380376459-compute@developer.gserviceaccount.com`.
- **EVIDENCE (about the paste, not IAM):** the terminal split the multi-line command — `--format=table(id,…)` and, critically, `--filter=bindings.members:…` each ran as separate commands ("command not found"). The `get-iam-policy` therefore executed WITHOUT the member filter.
- **GAP → the role table CANNOT close the gate:** the printed ROLE list (`…roles/run.admin…`) is the project's bindings across ALL members, unfiltered. `roles/owner` in that list is almost certainly the human operator, not the compute SA. `run.admin` is PRESENT in the project policy — but bound to WHOM is exactly what the filter was supposed to prove and didn't.
- **INFERENCE (not sufficient):** run.admin in the policy + V3 release-notes CLAIM ("grant closed on cyberize-nextjs-staging 2026-07-22") + no obvious reason a human holds run.admin → very likely the compute SA holds it. Doctrine §4.4 forbids collapsing this into false confidence. One clean command settles it.

## The clean re-run — SINGLE LINE, no continuations (paste-mangle-proof), project number baked in

```bash
gcloud projects get-iam-policy cyberize-nextjs-staging --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:524380376459-compute@developer.gserviceaccount.com"
```

**If `roles/run.admin` appears in THIS (filtered) output:** Staging Rule = EVIDENCE, gate CLOSED, file generation fires immediately (operator APPROVED pre-active).
**If absent:** STOP — close with the §5.2 Step 6 grant before anything else.

## Ledger row filed (live)

Multi-line backslash-continuation commands get mangled by terminal paste — the `--filter` flag ran as its own command and the unfiltered policy output nearly read as filtered EVIDENCE. Same failure class as v2 Issue #5 (`--substitutions` continuation-line bug). Skill change: ALL operator paste-back commands must be single-line (or heredoc/scripted); never rely on trailing-backslash continuations in guidance-only mode.
