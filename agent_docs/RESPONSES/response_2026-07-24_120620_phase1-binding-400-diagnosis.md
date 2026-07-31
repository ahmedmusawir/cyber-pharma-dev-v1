# Phase 1 — Binding 400 Diagnosis + Recovery (re-run)

## Evidence from operator paste (first ./init-app.sh run)

- **EVIDENCE:** APIs enabled · Artifact Registry repo EXISTS (correct — MC bootstrap) · secret `cyber-pharma-supabase-secret-key` created, version [1] = placeholder · runtime SA `sa-cyber-pharma-runtime@` created · propagation guard PASSED (`✅ SA visible`).
- **EVIDENCE (failure):** `secrets add-iam-policy-binding` → 400 "Service account ... does not exist" → script exited at the binding step (`set -e`), before the VERIFICATION tail.

## Root cause

**describe-visibility ≠ binding-visibility.** The guard polls `iam service-accounts describe` (IAM `get` path), which propagates FASTER than Secret Manager's IAM backend learns of the new SA. Guard green, binding 400. The guard polls the wrong signal — Template 4 needs the retry wrapped around the binding call itself. Ledger row 13 filed.

## Recovery

`init-app.sh` is idempotent by design — the re-run takes the "exists" branch everywhere and re-attempts ONLY the binding, which succeeds now that propagation caught up (tens of seconds elapsed). Expected re-run output: exists/exists/exists → binding ✅ → VERIFICATION tail with the placeholder klaxon firing (correct at this stage) + `Runtime SA: ✅ Exists`.

Command handed to operator: `./init-app.sh` (re-run). STOP GATE.
