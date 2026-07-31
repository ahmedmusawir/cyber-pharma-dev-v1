# Phase 3 COMPLETE — Deploy + Smoke Evidence · Phase 5 Opened (DNS/SSL)

## Phase 3 evidence chain

- **EVIDENCE:** Cloud Build `9a7ca6ef` — 3m51s, STATUS: SUCCESS (vs MC 10m17s).
- **EVIDENCE (v3 PROOF POINT):** deploy log shows `Setting IAM Policy...........done` — NOT "failed". Staging Rule passive proof CONFIRMED on first Path B run. The v2 403 failure mode did not recur.
- **EVIDENCE:** revision `cyber-pharma-prod-00001-gq6` serving 100%; Cloud Run URL `https://cyber-pharma-prod-524380376459.us-east1.run.app`.
- **EVIDENCE:** revision serving ⇒ startup probe passed ⇒ instrumentation.ts fail-closed env validation PASSED ⇒ all 4 required env vars (incl. SUPABASE_SECRET_KEY via --set-secrets) present at runtime.
- **EVIDENCE:** `curl -I` → HTTP/2 200, `x-powered-by: Next.js`, Google Frontend, app no-cache headers live.
- **Operator-confirmed:** browser smoke passed (home, auth flow, portals per role). run.app Safe-Browsing pre-warn was issued; custom domain retires it.
- Step 3.3 two-deploy: WAIVED (domain baked). Step 3.2: satisfied from deploy output.

## Phase 5 opened — Per-App DNS + SSL (beta track, Issue #6)

State going in: CNAME `cyber-pharma → ghs.googlehosted.com.` PRE-STAGED in DigitalOcean (operator, earlier). Domain verified at account level (MC run — Q4). Phase 4 stays dormant; "domain not verified" complaint = FULL STOP + ledger.

Step 5.1 command handed: `gcloud beta run domain-mappings create --service cyber-pharma-prod --domain cyber-pharma.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging`

Expected: mapping created, output mentioning required CNAME record (already live). Then: dig check → SSL provisioning wait (15–30 min) → HTTPS curl. Step 5.6 final deploy NOT needed (URL already baked — one-deploy path holds).

STOP GATE: awaiting Step 5.1 output.
