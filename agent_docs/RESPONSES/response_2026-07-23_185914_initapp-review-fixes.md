# init-app.sh — Operator File Review: 4 Fixes Applied (PENDING APPROVAL)

> Nothing executed — edits + `bash -n` parse check only. Full corrected script below for operator approval.

## Fixes applied

- **FIX 1 (required):** propagation-guard timeout branch now prints the warning and `exit 1` immediately (lines 68–73). Previously warn-and-continue → would have run `add-iam-policy-binding` against a nonexistent SA. Guard blocks, doesn't narrate.
- **FIX 2 (required):** placeholder-secret klaxon added inside the existing VERIFICATION block, after Secrets listing, before Runtime SA check (lines 102–113). Version-count only — no secret values read. 0–1 versions → loud multi-line PLACEHOLDER warning + exact `versions add` command; 2+ → `✅ real value present (versions: N)`. (Used `-le 1` rather than `-eq 1` so a pathological 0-count also warns.)
- **FIX 3 (minor):** runtime binding now uses `"$SECRET_NAME"` (line 88) — single source of truth, hardcoded `"${APP_NAME}-supabase-secret-key"` removed.
- **FIX 4 (minor):** placement honored — all edits inside their existing sections; nothing moved.

## Verification

- `bash -n init-app.sh` → SYNTAX OK (parse only).
- `set -euo pipefail` interplay checked: a failing `versions list` pipeline fails the assignment → script exits loudly rather than mis-reporting (acceptable: verification failures should be loud).

## Ledger

Rows 7 and 8 appended: (a) Template 4 guard must exit 1 on timeout — narrating guard = deferred confusing failure; (b) Template 4 verification must detect placeholder-only secrets via version count — green init with placeholder = runtime failure at first server-side Supabase call, worst discovery timing.

## Full corrected script (as on disk, `init-app.sh`)

See `init-app.sh` at repo root — 123 lines, mirrors the version presented on screen for approval this turn.

## Status

Awaiting operator approval of the corrected script. Not executed. Not committed. deploy.sh REPLACE_ME guard (operator-added) noted and left untouched.
