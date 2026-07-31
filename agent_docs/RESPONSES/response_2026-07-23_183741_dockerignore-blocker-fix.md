# BLOCKER Fix — .dockerignore Created + Ignore-Chain Verification

## Blocker confirmed valid

Operator caught a real leak path the generated package missed: `Dockerfile` Stage 2 does `COPY . .` with NO `.dockerignore`. Next.js standalone output copies `.env` files into `.next/standalone/` — so `.env.local` would ride builder → standalone → runner `COPY` → **final image**, bypassing the 3-Layer secret model entirely. (Secondary effect: `.env.local` values would also override the intended `--build-arg` values during `next build`, since Next loads `.env.local` in all non-test environments.)

## 1. `.dockerignore` created (repo root) — operator's exact list

```
.env*
node_modules
.next
.git
.gitignore
Dockerfile
.dockerignore
cloudbuild.yaml
deploy.sh
init-app.sh
agent_docs
_SKILLS
README.md
```

`.env*` is broader than `.gitignore`'s pattern — covers `.env.local`, bare `.env`, and `.env copy.example`.

## 2. `.gcloudignore` chain verification

- **EVIDENCE:** no `.gcloudignore` exists (`ls` → not found) → Cloud Build upload mirrors `.gitignore`.
- **EVIDENCE:** `.gitignore:28` reads exactly `.env*.local` (under comment "# local env files") → `.env.local` never enters the Cloud Build tarball.
- **GAP CLOSED-BY-ABSENCE:** `.env*.local` would NOT catch a bare `.env` — but EVIDENCE: no bare `.env` exists at repo root. `.env copy.example` (773 B, tracked in git → already public in repo) IS uploaded; CLAIM: example files carry placeholder values only.
- **Defense-in-depth result:** upload layer (.gitignore mirror) + build-context layer (.dockerignore `.env*`) now BOTH block env files. A future bare `.env` is caught by the docker layer even though the upload layer would miss it.

## 3. Ledger row — filed

Dockerfile/.dockerignore must ship as a mandatory PAIR in TEMPLATES.md (Template 1 currently ships `COPY . .` with no companion ignore template = built-in secret-leak path). Checklist template gains a `.dockerignore` verification line item.

## 4. Local checklist updated

`DEPLOYMENT_CHECKLIST.md` Pre-Flight gains: `.dockerignore` exists and covers `.env*` (pre-checked ✅ for this run).

## Status

Package is now 6 files (5 + `.dockerignore`). Still NOT committed — operator owns git. Pending unchanged: 2 REPLACE_MEs in `deploy.sh`, then next-deploy-execute.
