# RETROSPECTIVE — Cyber Pharma V1 Cloud Run Deployment
## First Field Test of CLOUD_DEPLOYMENT_SKILLS v3.0 (Path B)

> Run window: 2026-07-23 → 2026-07-31 (active work ~2 days + 7-day SSL-wait gap)
> App: cyber-pharma → `cyber-pharma-prod` @ `cyberize-nextjs-staging` (us-east1)
> Result: **deployed and serving at https://cyber-pharma.cyberizedev.com**
> Honest status: Phases 0–5 EVIDENCE-complete. Phase 6 (invoker verify) and Phase 7 (6/6
> completion ceremony) STILL OPEN at write time — this retrospective is not the completion
> summary. Final curl paste also pending (operator confirmed "looking good"; CLAIM-grade).

---

## 1. WHAT WE DID (timeline)

| When | What |
|------|------|
| 07-23 AM | Pre-work: sharp/libvips CVE fix via npm override (own lesson: delete-lockfile step broke build via radix-slot float; recovered via lockfile restore + in-range audit fix) |
| 07-23 PM | Skill activation → discovery → Path B fork → intake (app/project/region/domain/secrets) → Gate 1 (`output: "standalone"` added + build-proven) → Gate 2 (node:22) → Stripe fossil gate → Staging Rule pre-flight (3 attempts, see hiccups) → 5-file package generated |
| 07-23 eve | Operator file review: .dockerignore BLOCKER fixed; init-app.sh 4 fixes; operator added deploy.sh REPLACE_ME guard |
| 07-24 | Correction: public values baked (operator never edits files) → execute skill: Phase 0 (routing 1→2→3→5→6) → Phase 1 (init ×2 runs + ★ secret moment) → Phase 2 (IAM verify) → Phase 3 (deploy SUCCESS 3m51s + smoke) → Phase 5 opened (mapping created, cert pending) |
| 07-31 | Resume per §4.10: cert had provisioned 14 min after creation (07-24 07:01Z). Domain live. |

**The one-deploy run:** domain known at intake → Two-Deploy Waiver → `NEXT_PUBLIC_APP_URL` baked → exactly ONE `./deploy.sh` produced the final state. The waiver worked exactly as codified.

**The v3 proof point (V3_RELEASE_NOTES' stated test):** deploy log showed `Setting IAM Policy...........done` — no warning, no 403. The Staging Rule grant (verified in pre-flight) did its job. **v3's primary fix is field-confirmed.**

---

## 2. HICCUPS — full ledger recap (14 rows in `SKILL_ISSUES_LEDGER_cloud_deployment.md`)

### Category A — Protocol misses (agent behavior, 3 rows)
1. **Response-logging protocol skipped twice** (activation plan, rulings report) — operator had to cue "log it" both times. Root cause: write-first stated in prose, not a numbered blocking step; agent treated skill-driven artifacts as exempt from host-project protocol. Fixed in-session + persistent memory written.

### Category B — Truth Command fragility (2 rows)
2. **Empty BUILD_SA:** region-less `builds list` missed the regional build AND default-SA builds return empty `serviceAccount`; the compound command had no empty-var guard → cryptic filter error.
3. **Paste-mangled continuations:** backslash multi-line commands split in the operator's terminal — `--filter` ran as its own command and an UNFILTERED IAM table nearly passed as filtered evidence. (Same class as v2's Issue #5. Evidence discipline caught it: gate held open, single-line re-run demanded. Attempt 3 mangled flags again but YAML member+role pairs delivered the proof anyway.)

### Category C — Template defects (4 rows)
4. **No `.dockerignore` in the package** (operator-caught BLOCKER): `COPY . .` + Next standalone copying `.env` files = `.env.local` ships inside the image, bypassing the 3-Layer model. Worst defect of the run.
5. **Propagation guard narrated instead of blocking:** timeout branch printed a warning then CONTINUED into the binding.
6. **No placeholder-secret detection:** green init with `REPLACE_WITH_ACTUAL_VALUE` still in the secret would pass silently → runtime failure at first server-side Supabase call.
7. **Guard polls the wrong signal (field-proven):** first init run — `describe` visibility ≠ Secret Manager IAM-backend visibility; guard green, binding 400 "does not exist". Idempotent re-run recovered. Retry must wrap the BINDING call.

### Category D — Workflow/doctrine gaps (5 rows)
8. **REPLACE_ME in generated files = generation defect for public vars** (v3 regression vs MC): intake collected names, not VALUES. Operator never edits files.
9. **Secret flow under-specified:** pinned to exactly ONE operator CLI action (versions-add between init and deploy; agent never sees the value).
10. **Missing principle:** "operator touches the CLI, never the files — files are born complete."
11. **No operator roadmap:** execute skill opens with routing questions but never shows the operator the road ahead + where his manual moments are.
12. **Naming drift unaddressed:** `cyph-mission-ctrl-prod` vs `cyber-pharma-prod` styles; playbook has no environment-suffix scheme (stg/prod).

### Non-ledger friction worth recording
13. **`gcloud --format`/`--filter` flags are paste-hostile in general** — three consecutive attempts mangled; only default YAML output survived every time. Consider: prefer default output + agent-side reading over clever format strings in guidance mode.
14. **SKILL.md Step 1.4 value spot-check contradicts the no-values-on-screen ruling** — waived this run in favor of version-count proof; skill should adopt version-count as the standard.

---

## 3. WHAT THE SKILL GOT RIGHT (keep in v3.1)

- **Staging Rule pre-flight + passive proof** — the entire point of v3; confirmed first try.
- **Two-Deploy Waiver** — clean one-deploy run, zero placeholder dance.
- **Evidence discipline** — directly prevented one real mistake (unfiltered IAM table as false EVIDENCE) and correctly held CLAIM-grade facts (release-notes grant, Q4 domain verification) until command output upgraded them.
- **Idempotent init-app.sh** — the propagation 400 was recovered by simply re-running; no manual cleanup.
- **§4.10 session-resume re-verification** — the 7-day gap resumed cleanly: one Truth Command re-established state (cert had been ready 14 min in).
- **Gate 1 standalone check** — caught a repo that WOULD have failed its first cloud build (no `output: "standalone"` in next.config.js) at intake instead.
- **Live issues ledger (§4.9)** — 14 rows recorded at occurrence; this retrospective is compiled from evidence, not memory. The mechanism works.
- **3 Actors + one-command-at-a-time cadence** — zero permission-confusion failures; every IAM claim traceable to a paste.

---

## 4. v3.1 CHANGE BACKLOG (prioritized)

**P0 — ship before next run**
1. TEMPLATES.md: `.dockerignore` as mandatory Template 1b, paired with Dockerfile (leak-path defect).
2. Template 4: retry wrapped around `add-iam-policy-binding` itself (N attempts on 400/does-not-exist); keep describe-poll as a fast pre-check; timeout branch exits 1.
3. Template 4 verification: placeholder klaxon via version count (adopt this run's implementation verbatim).
4. Generate SKILL.md intake: collect public var VALUES verbatim; bake at generation; assert zero REPLACE_ME in delivered package.

**P1 — doctrine**
5. Family CLAUDE.md new principle: operator touches the CLI, never the files; files are born complete; the versions-add moment is the ONLY manual step — and the execute skill must OPEN with the operator roadmap (phases + manual moments).
6. Guidance-mode command rule: single-line only; prefer default output formats over `--format`/`--filter` gymnastics (3-for-3 paste-mangle rate this run).
7. §4.5 build-SA reveal: add `--region`, empty-result guard, and default-SA fallback note (`PROJECT_NUMBER-compute@`).
8. Codify version-count as the standard secret-value proof; retire the Step 1.4 stdout spot-check.
9. Activation sequence: "write plan artifact to RESPONSES/" as a numbered step BEFORE "present plan" (+ note that host-project protocols apply during skill runs).

**P2 — polish**
10. Playbook: environment-suffix naming section (stg/prod) resolving the `-prod`-in-staging drift.
11. Checklist template: add `.dockerignore` verification line.

---

## 5. OUTSTANDING BEFORE 6/6 (do not lose)

1. **Paste the final `curl -I https://cyber-pharma.cyberizedev.com`** — upgrades Phase 5 close from CLAIM to EVIDENCE.
2. **Phase 6:** invoker policy — deploy used `--allow-unauthenticated` so allUsers binding EXISTS (INFERENCE from the clean "Setting IAM Policy...done"), but doctrine demands explicit verify: `get-iam-policy` showing `allUsers → roles/run.invoker`.
3. **Phase 7:** 6/6 completion ceremony — browser smoke on the custom domain (auth flow, portals, `/moose-portal` 404-by-design), clean-start log check, completion summary artifact.
4. Housekeeping (non-blocking): optional destroy of placeholder secret v1; `stripe` fossil dep removal (future dep-hygiene run); operator commits session/ledger/RESPONSES docs.
