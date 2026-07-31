# Phase 1 COMPLETE — One-Time App Setup (Evidence Record)

## Evidence chain (all operator-pasted)

- **EVIDENCE:** Run 1 — secret `cyber-pharma-supabase-secret-key` created (v1 placeholder), runtime SA `sa-cyber-pharma-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com` created, propagation guard passed; binding 400'd (describe-vs-binding propagation lag — ledger row 13, artifact `response_2026-07-24_120620`).
- **EVIDENCE:** Run 2 (idempotent re-run) — `✅ Runtime SA bindings complete.`; VERIFICATION tail: secret listed, placeholder klaxon fired (correct at that stage), `Runtime SA: ✅ Exists`.
- **EVIDENCE:** ★ operator's single manual moment executed — `Created version [2]` (agent never saw the value).
- **EVIDENCE:** versions table — v2 enabled 2026-07-24T06:12:33 (real), v1 enabled 06:04:45 (placeholder, harmless behind `:latest`; optional destroy later, non-blocking).

## Phase 1 stop-gate criteria (SKILL.md)

- Secrets created and listed ✅ EVIDENCE
- Secrets hold real values ✅ EVIDENCE via version count (2 versions; value spot-check waived — version-count method is this run's non-exposing standard)
- Runtime SA exists ✅ EVIDENCE

## Next — Phase 2 (IAM Verification), reduced scope for this app

- Build SA (Actor B): NOTHING to verify — zero build-time secrets (Template 2B), no secretAccessor needed anywhere for Actor B. Satisfied by design.
- Runtime SA (Actor C): ONE Truth Command — `gcloud secrets get-iam-policy cyber-pharma-supabase-secret-key` must show `sa-cyber-pharma-runtime@` with `roles/secretmanager.secretAccessor`.

Command handed to operator. STOP GATE.
