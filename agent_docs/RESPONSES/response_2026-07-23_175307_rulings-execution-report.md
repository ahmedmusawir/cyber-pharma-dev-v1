# Operator Rulings — Execution Report (Steps 1–4)

> Retro-logged 17:53 on operator cue — third logging miss this session; see session file Lessons Learned.
> Mirrors the on-screen report verbatim.

✅ **Steps 1–3 executed. Stopped where told — Step 4 awaits operator terminal.**

**Step 1 — Ledger:** both rows appended to `SKILL_ISSUES_LEDGER_cloud_deployment.md` — (a) write-first rule needs to be a numbered blocking step in the activation sequence, (b) naming drift `cyph-mission-ctrl-prod` vs this run's `cyber-pharma-prod`, with the stg/prod suffix section flagged as the playbook fix.

**Step 2 — Stripe gate: ZERO code reads.** EVIDENCE: grep of all source for `stripe|STRIPE_|NEXT_PUBLIC_STRIPE` → 11 hits, every one a comment (`services/adminDemo.ts` BACKEND_SWAP_NOTES, `instrumentation.ts:9` Phase-7 var list, demo-label comments in `types/adminDemo.ts`). No `process.env.STRIPE*`, no stripe SDK import anywhere. `package.json:40` still carries `"stripe": "^22.1.0"` as an unused fossil dep — noted for a future dep-hygiene run, untouched now. Verdict **"Stripe excluded — fossils, same as MC"** recorded in the intake artifact. Template B selection stands.

**Step 3 — Rulings recorded** in the intake artifact: doctrine secret entry `cyber-pharma-supabase-secret-key`; subdomain LOCKED `cyber-pharma.cyberizedev.com`; service name `cyber-pharma-prod` (drift ledgered); and branch verified — EVIDENCE: `git branch --show-current` → **`deploy-ffm-1`**, matches ruling (standalone-fix working tree came along: `next.config.js` modified on this branch).

**Step 4 — Staging Rule pre-flight. One command — operator runs and pastes output back:**

```bash
BUILD_SA="$(gcloud builds list --project cyberize-nextjs-staging --limit=1 --format='value(serviceAccount)')"
echo "BUILD SA: $BUILD_SA"
gcloud projects get-iam-policy cyberize-nextjs-staging --flatten="bindings[].members" \
  --format="table(bindings.role)" --filter="bindings.members:${BUILD_SA##*/}"
```

Looking for: `roles/run.admin` in the role table for the build SA. Present → gate closes with EVIDENCE and the pre-active APPROVED triggers generation of the 5-file package immediately. Absent → full STOP, no generation, report and await instructions.
