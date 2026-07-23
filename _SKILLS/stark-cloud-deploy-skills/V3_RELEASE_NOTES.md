# CLOUD_DEPLOYMENT_SKILLS v3.0 — Release Notes (2026-07-22)

Rebuilt from the cyph-mission-ctrl field trial (Path A first deploy, 9-issue ledger,
6/6 completion criteria). Doctrine unchanged — it held. Mechanics refreshed.

## Every closed issue → its fix location
| # | Issue | Fixed in |
|---|-------|----------|
| 1 | Phantom init-gcp-project.sh/install-gcloud.sh references | CLAUDE.md §5.2 embeds the bootstrap walkthrough (7 steps); scripts/install-gcloud.sh SHIPPED; init-gcp-project.sh retired by design |
| 2 | node:18 vs Next 16 | TEMPLATES.md Template 1: node:22-alpine floor + engines detection gate in generate SKILL.md |
| 3 | No standalone pre-check | generate SKILL.md: mandatory pre-generation Gate 1 + AP-G7 |
| 4 | init-app.sh IAM race | TEMPLATES.md Template 4: propagation retry loop after SA create |
| 5 | --substitutions continuation-line bug | TEMPLATES.md Template 3: string-builder pattern (mandatory) |
| 6 | domain-mappings left GA | gcloud beta everywhere (execute Phases 4-5, Truth Commands, checklist) + drift note |
| 7 | Build SA can't set IAM policy | THE STAGING RULE: CLAUDE.md §5.2 Step 6 (Path A) + §5.3 Step 0 pre-flight (Path B) + execute Step 3.1 pre-warn + AP-E11 |
| 8 | Safe Browsing on run.app | execute Step 3.4 pre-warn + AP-E12 |
| 9 | Subdomain-verification trap | execute Phase 4 bold rule + dig-before-Verify + AP-E10 |

## New doctrine (CLAUDE.md)
- §4.9 Issues Ledger = mandatory skill artifact (create at activation, append live)
- §4.10 Session-resume re-verification (orphaned-command protection)
- Platform-drift standing rule + "last verified against gcloud" date stamp (header)
- Two-Deploy Waiver codified (custom domain known upfront = one deploy, normal path)
- Supabase Q4-2025 naming rows; mirror-what-the-code-reads rule
- Console-lag warning; Path B Step 0 Staging Rule pre-flight

## Structure changes
- NEW: scripts/install-gcloud.sh (field-verified 2026-07-14; idempotent repo-line fix)
- RETIRED: init-gcp-project.sh (project bootstrap is a guided walkthrough by design —
  checkpoints between steps are the value)
- NEW anti-patterns: AP-G7, AP-E9, AP-E10, AP-E11, AP-E12

## First field test of v3: Cyber Pharma v1 (Path B) — expected next run.
Path B pre-flight MUST verify the Staging Rule grant (already closed on
cyberize-nextjs-staging 2026-07-22) and the deploy output MUST show no
"Setting IAM policy failed" warning. That absence is v3's proof.
