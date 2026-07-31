# Deployment Checklist — Cyber Pharma V1

> App: `cyber-pharma` · Project: `cyberize-nextjs-staging` · Region: `us-east1`
> Service: `cyber-pharma-prod` · Domain: `cyber-pharma.cyberizedev.com`
> Generated 2026-07-23 by next-deploy-generate v3.0 (Path B, Template 2B — no build secrets)

## 1. Pre-Flight

- [ ] Files in project root: `Dockerfile`, `cloudbuild.yaml`, `deploy.sh`, `init-app.sh`
- [x] `.dockerignore` exists and covers `.env*` (secret-leak guard: standalone output copies env files into the image — verified 2026-07-23)
- [ ] Scripts executable: `chmod +x deploy.sh init-app.sh`
- [ ] Authenticated: `gcloud auth list`
- [ ] Correct project: `gcloud config get-value project` → should show `cyberize-nextjs-staging`
- [x] Staging Rule verified (2026-07-23): build SA `524380376459-compute@developer.gserviceaccount.com` holds `roles/run.admin` — EVIDENCE via get-iam-policy
- [ ] `REPLACE_ME` values filled in `deploy.sh` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — copy from `.env.local`)

## 2. One-Time Setup

- [ ] Run `./init-app.sh`
- [ ] Update the secret with the real value (from SUPABASE_SECRET_KEY in `.env.local`):
  `echo -n 'real-value' | gcloud secrets versions add cyber-pharma-supabase-secret-key --data-file=- --project cyberize-nextjs-staging`
- [ ] Verify secret exists: `gcloud secrets list --project cyberize-nextjs-staging --filter="name:cyber-pharma"`
- [ ] Verify runtime SA binding: `gcloud secrets get-iam-policy cyber-pharma-supabase-secret-key --project cyberize-nextjs-staging --format="table(bindings.role, bindings.members)"`

## 3. First Deploy

- [ ] Run `./deploy.sh`
- [x] ~~Two-deploy pattern~~ — WAIVED: custom domain known upfront, `NEXT_PUBLIC_APP_URL` already `https://cyber-pharma.cyberizedev.com`
- [ ] Deploy output shows NO "Setting IAM policy failed" warning (v3 Staging Rule proof)
- [ ] Verify service responds: `curl -I <run.app URL from output>` (expect 200; browser may show Safe Browsing warning on run.app — known Issue #8, clears with custom domain)

## 4. DNS + SSL

- [ ] Create domain mapping: `gcloud beta run domain-mappings create --service cyber-pharma-prod --domain cyber-pharma.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging`
- [ ] Get DNS records: `gcloud beta run domain-mappings describe --domain cyber-pharma.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging`
- [ ] Add CNAME in DigitalOcean: hostname=`cyber-pharma`, value=`ghs.googlehosted.com.`, TTL=3600
- [ ] `dig cyber-pharma.cyberizedev.com CNAME +short` shows `ghs.googlehosted.com.` BEFORE clicking any Verify (Issue #9 — subdomain-verification trap)
- [ ] Wait 15–30 min for Google-managed SSL
- [ ] Verify: `curl -I https://cyber-pharma.cyberizedev.com`

## 5. Invoker Policy

- [ ] Set public access: `gcloud run services add-iam-policy-binding cyber-pharma-prod --project cyberize-nextjs-staging --region us-east1 --member="allUsers" --role="roles/run.invoker"`
- [ ] Verify: `gcloud run services get-iam-policy cyber-pharma-prod --project cyberize-nextjs-staging --region us-east1 --format="yaml(bindings)"`

## 6. Done (Family Completion Criteria — all 6)

- [ ] App loads at `https://cyber-pharma.cyberizedev.com` with valid SSL
- [ ] Auth flow works (login via `/auth` — Supabase runtime calls prove `SUPABASE_SECRET_KEY` + publishable key wiring)
- [ ] Admin portal demo screens load (`/admin-portal`)
- [ ] `/moose-portal` returns 404 (flag `false` — expected behavior, not a bug)
- [ ] Server started clean — no instrumentation env-validation throw in logs (`gcloud run services logs read cyber-pharma-prod --region us-east1 --project cyberize-nextjs-staging --limit 50`)
- [ ] Invoker policy matches intent (public)
