# Phase 2 COMPLETE + Phase 3 Opened (Deploy)

## Phase 2 — IAM matrix verified

- **EVIDENCE (operator paste):** `gcloud secrets get-iam-policy cyber-pharma-supabase-secret-key` → `roles/secretmanager.secretAccessor` bound to `serviceAccount:sa-cyber-pharma-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com`. Actor C verified.
- Actor B (build SA): nothing to verify — zero build-time secrets (Template 2B). Satisfied by design.
- Phase 2 stop-gate criteria: all EVIDENCE. CLOSED.

## Phase 3 — Build and Deploy (opened)

Command handed: `./deploy.sh`. Actors: A triggers → B builds (compute default SA, holds run.admin per Staging Rule EVIDENCE 2026-07-23) → C runs the container.

**Expected sequence:** guard passes silently → banner with project/region/service/URL → `gcloud builds submit` uploads source tarball (mirrors .gitignore — .env.local excluded, EVIDENCE from ignore-chain check) → 3 Cloud Build steps (Build Image ~8–10 min per MC precedent / Push / Deploy) → `STATUS: SUCCESS` → completion banner.

**Watch-fors (standing orders):**
1. "Setting IAM policy failed" ANYWHERE in deploy output → FULL STOP + ledger (Staging Rule failure — should NOT happen, grant is EVIDENCE).
2. Step 1 failure at `npm ci`/`next build` → build-context or Docker issue, NOT IAM.
3. Step 3 permission errors → Actor C misconfig (would contradict Phase 2 evidence — escalate).

STOP GATE: awaiting full tail of deploy output (final ~30 lines suffice: the 3 step statuses + any warnings + final STATUS line).
