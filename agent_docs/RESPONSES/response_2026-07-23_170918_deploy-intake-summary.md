# Deployment Package — Intake Summary (Generate Phase 1, Group 4)

> Skill: `stark-cloud-deploy-skills` v3.0 · Path B · First v3 field test
> Status at write time: PENDING_APPROVAL (file generation blocked until operator APPROVED)

```
DEPLOYMENT PACKAGE — INTAKE SUMMARY
====================================
App Name:        cyber-pharma
GCP Project:     cyberize-nextjs-staging
Region:          us-east1
Custom Domain:   cyber-pharma.cyberizedev.com   (known upfront → Two-Deploy WAIVED)
Backend URL:     none (Supabase only)

SECRETS (go in Secret Manager):
| Env Var             | Secret Manager Name             | Build | Runtime |
|---------------------|---------------------------------|-------|---------|
| SUPABASE_SECRET_KEY | cyber-pharma-supabase-secret-key| No    | Yes     |

PUBLIC VARS (plaintext in deploy.sh — NOT in Secret Manager):
| Env Var                            | Value / Source                        |
|------------------------------------|---------------------------------------|
| NEXT_PUBLIC_SUPABASE_URL           | (from your .env.local — you paste in) |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY| (from your .env.local — you paste in)|
| NEXT_PUBLIC_APP_URL                | https://cyber-pharma.cyberizedev.com  |
| NEXT_PUBLIC_SITE_URL               | https://cyber-pharma.cyberizedev.com  |
| NEXT_PUBLIC_ENABLE_MOOSE_PORTAL    | false                                 |

DERIVED NAMES (conventions §7.5):
  Runtime SA:      sa-cyber-pharma-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com
  Cloud Run svc:   cyber-pharma-prod
  Image path:      us-east1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/cyber-pharma-prod:latest

GENERATED FILES:
  Dockerfile                  (node:22-alpine, public-var ARGs only — no build secrets)
  cloudbuild.yaml             (Template B — no availableSecrets block)
  deploy.sh                   (config block + frozen execution block)
  init-app.sh                 (1 secret + runtime SA + secretAccessor binding)
  DEPLOYMENT_CHECKLIST.md     (pre-filled, real values)
```

## Notes

- `NEXT_PUBLIC_SITE_URL` baked alongside canonical `NEXT_PUBLIC_APP_URL` (same value) — code reads it (likely secure-cookie flag). Per the mirror-what-the-code-reads rule.
- `SUPABASE_SECRET_KEY` runtime-only — EVIDENCE: factory-function reads (`utils/supabase/admin.ts:17`, `moose-portal/_lib/admin.ts:16`), never module-level. → No build SA secretAccessor bindings needed anywhere.
- Backend URL "none" is INFERENCE from code (only Supabase hosts found) — operator did not contradict.

## Gate results (pre-generation, Issues #2/#3 of v2 trial)

- **Gate 1 (`output: "standalone"`): CLOSED** — one-line add to `next.config.js` operator-APPROVED; proof build green; `.next/standalone/server.js` EXISTS (EVIDENCE).
- **Gate 2 (Node floor): PASS** — no engines field, Next 16 → `node:22-alpine`.

## Path B Step 0 — Staging Rule pre-flight (handed to operator, output pending)

```bash
BUILD_SA="$(gcloud builds list --project cyberize-nextjs-staging --limit=1 --format='value(serviceAccount)')"
echo "BUILD SA: $BUILD_SA"
gcloud projects get-iam-policy cyberize-nextjs-staging --flatten="bindings[].members" \
  --format="table(bindings.role)" --filter="bindings.members:${BUILD_SA##*/}"
```

CLAIM (V3 release notes): `run.admin` closed on this project 2026-07-22. Expected in output: `roles/run.admin`. GAP until pasted back.

**Awaiting operator APPROVED before generating files.**

---

## OPERATOR RULINGS (2026-07-23, recorded per ruling Step 3)

- **Secret:** doctrine holds — separate entry `cyber-pharma-supabase-secret-key`. Operator-decided.
- **Subdomain LOCKED:** `cyber-pharma.cyberizedev.com`
- **Build branch CONFIRMED:** `deploy-ffm-1` — EVIDENCE: `git branch --show-current` → `deploy-ffm-1` (verified 17:5X, matches ruling)
- **Service name:** `cyber-pharma-prod` — kept for consistency with existing convention despite MC drift (`cyph-mission-ctrl-prod`); drift ledgered as skill change item.

## STRIPE CLASSIFICATION GATE (ruling Step 2 — verdict)

**Verdict: Stripe excluded — fossils, same as MC.**

EVIDENCE — grep of `src/` (all ts/tsx/js, node_modules excluded) for `stripe|STRIPE_|NEXT_PUBLIC_STRIPE` returned 11 hits, ALL comments, zero code reads:

- `src/instrumentation.ts:9` — comment: Phase-7 var list (`STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*`)
- `src/components/admin-portal/AddStoreButton.tsx:24` — comment: "NO Stripe, NO charge"
- `src/services/adminDemo.ts:19,154,155,298,307,316` — comments: BACKEND_SWAP_NOTES (Phase 7)
- `src/mocks/adminDemo.ts:4` — comment
- `src/types/adminDemo.ts:19,78` — comments (demo labels)

No `process.env.STRIPE*` read, no `import`/`require` of the stripe SDK anywhere in source. `package.json:40` carries `"stripe": "^22.1.0"` as an unused dependency (fossil — dep-hygiene candidate for a later cleanup run, NOT this one).

**Consequence:** Template B selection stands (no build secrets, single runtime secret). No re-evaluation needed.
