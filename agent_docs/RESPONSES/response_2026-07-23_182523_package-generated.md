# Gate Closed + 5-File Deployment Package Generated

## Staging Rule gate — CLOSED with EVIDENCE

Attempt 3 paste (flags mangled again, but default YAML output showed role+member pairs directly):

```
bindings:
  members: serviceAccount:524380376459-compute@developer.gserviceaccount.com
  role: roles/run.admin
```

**EVIDENCE:** build SA (compute default, `524380376459-compute@developer.gserviceaccount.com`) holds `roles/run.admin` AND `roles/editor`. Staging Rule satisfied — `--allow-unauthenticated` will not 403. Path B Step 0 complete. Operator's pre-active APPROVED → generation executed.

Bonus EVIDENCE from same paste: full project IAM roster (cloudbuild legacy SA has builds.builder; all service agents present; operator = sole owner).

## Load-bearing generation finding

`src/instrumentation.ts:19-22` validates env at server start via **dynamic** `process.env[key]` — dynamic access is never inlined by Next's build. Therefore the deploy step MUST carry `--set-env-vars` for NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SITE_URL (+ APP_URL, MOOSE flag for consistency), or the container crash-loops at startup (fail-closed throw) even after a perfect build. Baked into cloudbuild.yaml deploy step.

## Files generated (project root, per approved intake + TEMPLATES.md)

1. **`Dockerfile`** — 3-stage, `node:22-alpine`, Stage 2 = 5 public-var ARGs only (zero build-time secrets), standalone runner.
2. **`cloudbuild.yaml`** — Template 2B (no availableSecrets/secretEnv); build → push → deploy; `--set-secrets SUPABASE_SECRET_KEY=cyber-pharma-supabase-secret-key:latest`; `--set-env-vars` with all 5 public vars (instrumentation requirement); runtime SA `sa-cyber-pharma-runtime@`; 1Gi / max 1 instance.
3. **`deploy.sh`** — config block with real values; domain baked (`https://cyber-pharma.cyberizedev.com` — Two-Deploy WAIVED); `REPLACE_ME` on the two Supabase public values (operator copies from `.env.local` — agent never reads it); string-builder SUBSTITUTIONS (Issue #5 pattern); frozen execution block. `chmod +x` applied.
4. **`init-app.sh`** — idempotent; creates `cyber-pharma-supabase-secret-key` (placeholder value + update instructions), runtime SA with propagation-retry guard (Issue #4), runtime secretAccessor binding; build-SA binding section explicitly "none needed"; verification tail. `chmod +x` applied.
5. **`DEPLOYMENT_CHECKLIST.md`** — pre-filled, zero placeholders except the deliberate `REPLACE_ME`s; Staging Rule pre-checked ✅; beta track on domain-mappings (Issue #6); dig-before-Verify (Issue #9); Safe-Browsing pre-warn (Issue #8); app-specific completion criteria incl. moose-portal-404-is-correct and instrumentation-clean-start log check.

## Deviation from template (surfaced, not silent)

- Template 2B's `--set-env-vars` example covers "public vars needed at runtime" — this run includes ALL five per the instrumentation finding above. Reason documented in cloudbuild.yaml header comment.
- `NEXT_PUBLIC_SITE_URL` baked alongside canonical `NEXT_PUBLIC_APP_URL` (same value) per the mirror-what-the-code-reads rule.

## Handoff (generate Phase 3)

Package is in project root. Scripts already executable. Next: operator fills the two `REPLACE_ME`s in `deploy.sh`, then engage **next-deploy-execute** for the guided walkthrough (init-app.sh → secret value → deploy → IAM verify → DNS/SSL → invoker → 6/6 completion).

NOT committed — operator owns git (branch `deploy-ffm-1`).
