# Execute Skill Engaged — Records + Phase 0 Opening

## Standing orders acknowledged (hard rules for this walkthrough)

- **Guidance-only, full Tony Stark Protocol:** operator runs EVERY command (init-app.sh, deploy.sh, all gcloud) in his own terminal. Agent NEVER executes cloud-touching commands, one command at a time, expected output stated, pasted result evidence-labeled before the next command. No batching, no running ahead.
- **Phase 4 must never trigger** (domain verified previously; CNAME pre-staged in DO). If the mapping command complains "domain not verified" → FULL STOP, ledger, report.
- **Deploy output must show NO "Setting IAM policy failed" warning** — absence is passive proof the Staging Rule grant works (v3's proof point). If it appears → FULL STOP, ledger, report.

## Record item 1 — init-app.sh propagation loop (as approved, on the record)

```bash
  for i in 1 2 3 4 5 6; do
    if gcloud iam service-accounts describe "${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --project "$PROJECT_ID" &>/dev/null; then
      echo "   ✅ SA visible."; break
    fi
    if [ "$i" -eq 6 ]; then
      # Guard must BLOCK, not narrate: continuing here would bind IAM against a
      # nonexistent SA and fail confusingly downstream.
      echo "   ⚠️ SA still not visible after 60s — aborting. Re-run this script."
      exit 1
    fi
    sleep 10
  done
```

## Record item 2 — DEPLOYMENT_CHECKLIST.md (full contents, for operator review)

(Mirrored verbatim from repo root; presented on screen this turn.)

- Header: app cyber-pharma · project cyberize-nextjs-staging · region us-east1 · service cyber-pharma-prod · domain cyber-pharma.cyberizedev.com · Template 2B
- §1 Pre-Flight: files present · .dockerignore ✅ (pre-checked) · chmod +x · gcloud auth list · project check · Staging Rule ✅ (pre-checked, EVIDENCE 2026-07-23) · REPLACE_MEs filled
- §2 One-Time Setup: ./init-app.sh · versions add real secret value · secrets list verify · secret IAM binding verify
- §3 First Deploy: ./deploy.sh · two-deploy WAIVED (marked) · NO IAM-policy warning check · curl -I run.app URL (Safe-Browsing pre-warn noted)
- §4 DNS+SSL: beta domain-mappings create/describe · DO CNAME (cyber-pharma → ghs.googlehosted.com.) · dig-before-Verify rule · 15–30 min SSL wait · curl -I https
- §5 Invoker: allUsers run.invoker binding + yaml(bindings) verify
- §6 Done: 6 completion criteria incl. auth-flow proof, /moose-portal 404 = correct, instrumentation clean-start log check, invoker matches intent

## Phase 0 — Pre-Flight Check (OPENED)

**Acting: Actor A (operator).** Discovery command handed over (single-line):

```bash
ls -la Dockerfile .dockerignore cloudbuild.yaml deploy.sh init-app.sh DEPLOYMENT_CHECKLIST.md
```

Routing questions asked (expected answers per session history, to be operator-confirmed):
1. All 6 files present? (expect yes)
2. init-app.sh already run? (expect no — first session for this app)
3. First-time deployment? (expect yes — no cyber-pharma-prod service exists)
4. Domain already verified for this account? (expect yes — MC run; Phase 4 skip)

Predicted routing on expected answers: **1 → 2 → 3 → 5 → 6** (Phase 4 skipped; Phase 3 Step 3.3 WAIVED — domain baked).

Awaiting operator's pasted `ls` output + answers. STOP GATE.
