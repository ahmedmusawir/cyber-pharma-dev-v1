# Step 0 Pre-flight — Empty BUILD_SA Diagnosis + Retry Command

## What the pasted output proves

- **EVIDENCE:** `gcloud builds list --project cyberize-nextjs-staging --limit=1` (no `--region`) returned an EMPTY `serviceAccount` → `BUILD_SA` was empty → the IAM filter received no operand and errored. The ERROR is a casualty of the empty variable, not an IAM problem.
- **GAP:** Staging Rule status still unknown — nothing verified yet, gate stays OPEN.

## Two candidate explanations (unresolved until retry)

1. **Region gap:** the MC build ran regionally (`us-east1`); region-less `builds list` can miss regional builds → empty list.
2. **Default-SA gap:** builds exist, but the `serviceAccount` field is only populated when a CUSTOM build SA is set; on default-SA builds it can come back empty. Per family CLAUDE.md §5.2 Step 6, on this project the build SA IS the compute default SA (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`).

Either way, the definitive check is: resolve the project number → check the compute default SA's roles directly.

## Retry command (one paste block)

```bash
gcloud builds list --project cyberize-nextjs-staging --region us-east1 --limit=3 --format="table(id,createTime,serviceAccount)"
PROJECT_NUMBER=$(gcloud projects describe cyberize-nextjs-staging --format="value(projectNumber)")
echo "COMPUTE DEFAULT SA: ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud projects get-iam-policy cyberize-nextjs-staging --flatten="bindings[].members" \
  --format="table(bindings.role)" --filter="bindings.members:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
```

**Looking for:** `roles/run.admin` in the final table. Present → Staging Rule EVIDENCE, gate closed, generation fires. Absent → STOP, close with §5.2 Step 6 grant before anything else.

## Ledger row filed (live, §4.9)

Truth Command fragility: the §4.5 "simple build-SA reveal" breaks on (a) region-less list missing regional builds and (b) empty serviceAccount on default-SA builds — and the compound command has no empty-var guard, so the failure surfaces as a confusing filter syntax error. Skill change: add `--region` + empty-result guard + default-SA fallback note to §4.5.
