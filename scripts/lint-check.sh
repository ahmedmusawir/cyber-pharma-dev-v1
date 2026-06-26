#!/usr/bin/env bash
#
# lint-check.sh — manual lint verification for cyber-pharma-dev-v1.
# Runs ESLint across the repo and prints a GROUPED summary (errors vs warnings,
# by rule). For ad-hoc operator verification — separate from `npm run lint`
# (which just runs `eslint .`). Exit code mirrors ESLint (0 clean / 1 findings).
#
# Usage:  ./scripts/lint-check.sh
#
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

npx eslint . -f json > "$TMP" 2>/dev/null
ESLINT_RC=$?

node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const rel = p => p.replace(process.cwd() + "/", "");
let W = 0, E = 0; const byRule = {};
for (const f of data) for (const m of f.messages) {
  const r = m.ruleId || "(parser/other)";
  byRule[r] = byRule[r] || { w: 0, e: 0, files: new Set() };
  if (m.severity === 2) { byRule[r].e++; E++; } else { byRule[r].w++; W++; }
  byRule[r].files.add(rel(f.filePath));
}
const files = data.filter(f => f.messages.length).length;
console.log("================== LINT CHECK ==================");
console.log(`errors: ${E}   warnings: ${W}   files with findings: ${files}/${data.length}`);
console.log("-----------------------------------------------");
if (!E && !W) { console.log("clean — no findings"); }
else {
  console.log("by rule (count desc):");
  Object.entries(byRule).sort((a, b) => (b[1].e + b[1].w) - (a[1].e + a[1].w))
    .forEach(([r, v]) => console.log(
      `  ${String(v.e + v.w).padStart(4)}  [${v.e ? "ERR " : "warn"}] ${r}  (${v.files.size} files)`));
}
console.log("===============================================");
' "$TMP"

exit $ESLINT_RC
