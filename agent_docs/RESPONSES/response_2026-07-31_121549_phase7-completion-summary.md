# Phase 7 — Deployment Completion Summary (Cyber Pharma V1)

```
================================================
✅ DEPLOYMENT COMPLETE: Cyber Pharma V1
================================================
Service:         cyber-pharma-prod
Project:         cyberize-nextjs-staging
Region:          us-east1
URL:             https://cyber-pharma.cyberizedev.com
Cloud Run URL:   https://cyber-pharma-prod-524380376459.us-east1.run.app
Access:          Public (allUsers → roles/run.invoker, verified)
Build SA:        524380376459-compute@developer.gserviceaccount.com (compute default; run.admin verified)
Runtime SA:      sa-cyber-pharma-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com
Secrets mapped:  1 (0 build, 1 runtime: SUPABASE_SECRET_KEY ← cyber-pharma-supabase-secret-key:latest, v2 real)
SSL:             ✅ Google-managed, auto-renewing (provisioned 2026-07-24T07:01Z, 14 min)
Build:           9a7ca6ef · 3m51s · SUCCESS · one deploy (Two-Deploy Waived)
Revision:        cyber-pharma-prod-00001-gq6 · 100% traffic
================================================
```

## Family §8 completion criteria — evidence audit

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Service serves HTTP 200 | **EVIDENCE** | curl 200 on run.app (07-24) AND custom domain (07-31 04:13Z) |
| 2 | Build secrets readable by Actor B | **EVIDENCE (vacuous)** | zero build-time secrets by design; build SUCCESS |
| 3 | Runtime secrets readable by Actor C | **EVIDENCE** | revision serving = fail-closed instrumentation.ts passed = SUPABASE_SECRET_KEY present; login exercised server-side Supabase calls in 07-24 smoke |
| 4 | Invoker explicit + matches intent | **EVIDENCE** | get-iam-policy: allUsers → run.invoker; intent = public |
| 5 | Custom domain HTTPS + valid SSL | **EVIDENCE** | CertificateProvisioned/Ready/DomainRoutable all True; HTTP/2 200 over TLS |
| 6 | Operator confirms app behavior | **EVIDENCE (07-24, run.app) + CLAIM (custom domain)** | 07-24 browser smoke explicit ("tested successfully"); custom-domain behavior operator-signaled ("we are looking good") — one explicit confirm on the custom domain stamps this to 6/6 EVIDENCE |

**Verdict: 5.5 / 6.** One operator sentence closes it: confirm the app behaves correctly in the browser AT THE CUSTOM DOMAIN (home, login, portal screens, /moose-portal → 404-by-design).

---

## 6/6 STAMP — 2026-07-31 12:29

**Criterion 6 → EVIDENCE:** operator confirmed on the custom domain: "confirmed — all screens good, moose-portal 404s."

**ALL SIX FAMILY §8 CRITERIA: EVIDENCE. DEPLOYMENT COMPLETE — no partials, no gaps.**
First field test of CLOUD_DEPLOYMENT_SKILLS v3.0: PASSED, with the Staging Rule proof point confirmed and a 14-row ledger feeding v3.1.

## Housekeeping (non-blocking, operator discretion)

- Optional: destroy placeholder secret v1 (`gcloud secrets versions destroy 1 --secret=cyber-pharma-supabase-secret-key --project cyberize-nextjs-staging`) — v2 is `:latest`; cosmetic only.
- `stripe` fossil dep in package.json — future dep-hygiene run.
- Git: session/ledger/RESPONSES docs uncommitted on `deploy-ffm-1` — operator commits.
- v3.1 backlog: 11 items in the retrospective (`response_2026-07-31_110500_v3-field-test-retrospective.md`).
