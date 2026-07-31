# Mini Security Sweep — pre-public-showcase (README combined pass, Part 1)

**Date:** 2026-07-31 19:38
**Scope:** grep-only recon of the tracked repo ahead of a public LinkedIn showcase.
**Verdict: 🔴 FLAGGED — 1 hard item, 3 judgment items. Parts 2–3 held pending operator call.**

---

## 1. Tracked env files

`git ls-files | grep -iE "\.env"` → exactly one match: **`.env copy.example`**. Nothing else tracked.
`.gitignore:28` covers `.env*.local`. ✅ on tracking.

### 🔴 FLAG-1 — `.env copy.example` is NOT placeholders. It is masked real credentials.

The file ships partially-redacted **live credential material**, not `your-key-here` stubs. Line by line:

| Line | Value shipped | Assessment |
| --- | --- | --- |
| `STRIPE_WEBHOOK_SECRET` | `whsec_5fc922919e3543fee41****ae967890f846c7305b610` | **WORST.** Only 4 hex chars masked out of a 32-char secret → 65,536 candidates. That is not redaction, that is disclosure with a speed bump. Treat as burned. |
| `SUPABASE_SECRET_KEY` | `sb_secret_B3Hu***************************cg_Yv7z1eRR` | Service-role key. Heavily masked, but head + 11-char tail exposed. This is the RLS-bypass key. |
| `STRIPE_SECRET_KEY` | `sk_test_51TQMViGxA*************XM9ivkqG5p7TU00NBAMojF3` | Test-mode (lower blast radius), but the `51TQMViGxA…` prefix **is the Stripe account ID** and the tail is intact. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yrsu******gydb.supabase.co` | 6 masked chars of a 20-char project ref → enumerable. Public-by-design value, so low severity on its own; combined with the secret-key head it narrows the target. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_8FvPL**********oDk1S` | Publishable/anon — public by design. Cosmetic only. |
| `STRIPE_PRICE_STARTER / _PRO / _ENTERPRISE` | `price_1TQNfb*hCNK1obQSqJqH` etc. | Not secrets, but near-complete and they fingerprint the same Stripe account. |
| Comment block | `# CYBERIZE SUPABASE FULL RLS (qrproject@cyberizegroup.com)` + `# PROJECT NAME: CyberPharma_Dev_v1` | Leaks an internal ops mailbox and the exact Supabase project name to anyone reading the repo. |

**Why this matters even though it's masked:** an example file has one job — show the *shape* of a variable. Any real characters are pure downside. And a webhook secret with 4 of 32 chars starred is functionally published.

**Recommended remediation (operator's call, not executed):**
1. Rotate `STRIPE_WEBHOOK_SECRET` and `SUPABASE_SECRET_KEY` regardless of what we do to the file — they are already in git history on a repo about to go public, and history is not fixed by editing the working copy.
2. Rewrite `.env copy.example` to pure placeholders (`sk_test_xxxxxxxxxxxx`, `https://<project-ref>.supabase.co`, …).
3. Drop the `qrproject@cyberizegroup.com` / project-name comment.
4. Decide on history: leave it (accepting rotation as the mitigation) or scrub. Rotation alone is usually sufficient and far cheaper.
5. Separate question worth asking: the **Stripe block is fossil config** — the app has no Stripe integration wired (billing is visual-only per `phase2.md:44`). If those vars are dead, delete them from the example entirely rather than placeholder them.

---

## 2. Hardcoded keys / secrets / tokens in `src/` + `docs/`

Three passes over tracked files (`src docs public scripts supabase types`):

- Provider key formats — `sk_live|sk_test|pk_live|pk_test|whsec_|sb_secret|sb_publishable|eyJ…` (JWT), `AIza…` (Google), `ghp_|gho_` (GitHub), `xox[baprs]-` (Slack), PEM private-key headers → **no matches.**
- Assignment-shaped literals — `(api_key|secret|token|password|credential) = "…12+ chars"`, minus the placeholder/mock/`process.env` noise → **no matches.**
- Live Supabase project URLs in source → **no matches.**

✅ **CLEAN.** All config reaches the app through `process.env`; nothing is baked into source.

---

## 3. Mock data layer — PHI audit

Files audited: `src/mocks/owedbook.ts` (150 rows), `src/mocks/adminDemo.ts` (seed), `agent_docs/CURRENT_APP/owedbook_mock_data.ts`.

| PHI vector | Finding | Verdict |
| --- | --- | --- |
| Patient names | None. No `patient` field exists in `OwedBookRow`; the schema has no person on it at all. `owedbook_mock_data.ts:25` records a prior audit: "No patient names/phones/addresses exist in this dataset (audited)." | ✅ CLEAN |
| DOB / SSN | Zero matches for `dob\|dateOfBirth\|birth_date\|ssn\|social_security` anywhere in tracked source. | ✅ CLEAN |
| Rx / script numbers | `script: "837796-08"` style, 150 of them. Synthetic 6-digit + 2-digit-fill shape, uniformly in the `70xxxx–89xxxx` band — machine-generated, not a real Rx sequence. Header (`src/mocks/owedbook.ts:3`) states identifiers were scrubbed. | ✅ CLEAN |
| **NPI numbers** | 4 in `src/mocks/adminDemo.ts:45,54,63,72` (`1987654321`, `1750493827`, `1629384756`, `1456372819`) + `0000000000` in `src/services/adminDemo.ts:165`. **Verified all 5 against the real NPI check-digit algorithm (Luhn over `80840`+first 9). All 5 FAIL.** A number that fails the checksum cannot be an issued NPI. | ✅ CLEAN — mathematically proven fake |
| NCPDP numbers | 4 seven-digit values. No public checksum to test, but they pair with fictional stores. | ✅ CLEAN |
| Pharmacy / store names | "Hyde Park Pharmacy", "Southside Drug Mart", "Lakeview Apothecary", "Cornerstone Pharmacy" — generic invented names. | ✅ CLEAN — see FLAG-2 on the Hyde Park/Obama pairing |
| Staff names + emails | Tina Cho, Raj Patel, Denise Okafor, Marcus Lee, Priya Nair, Tom Becker @ `hydeparkrx.com` / `southsidedrug.com` / `lakeviewrx.com`. Invented people at invented domains. | ✅ CLEAN |
| PBM names | OptumRx, Caremark, Express Scripts, Prime Therapeutics, Navitus, DST, Capital RX — real national PBMs, but these are public industry entities and naming them is the entire point of the product. Not client data. | ✅ CLEAN |
| Drug economics | Header discloses `original_paid` / `aac` / `federal_expected` are **real** figures from a real demo DB, with the spread/status/dates engineered. Money without identifiers is not PHI. | ✅ CLEAN — but see FLAG-4 |

---

## 4. Real client / partner business names

### 🟡 FLAG-2 — the demo owner is "Barack Obama"

`src/mocks/adminDemo.ts:28` seeds the portal owner as **`name: "Barack Obama"`, `email: "barack@hydeparkrx.com"`** — and the flagship store is **"Hyde Park Pharmacy"** (Obama's Chicago neighborhood). Repeated at `adminDemo.ts:248,256,264,272` as `contactPerson` and at `src/__tests__/admin-portal/SettingsForm.test.tsx:15`.

Not a security or PHI issue. It is a **showcase-optics** issue: this name is almost certainly rendered in the admin screenshots you are about to embed in a public README, and a real sitting-public-figure's name in a healthcare-billing demo reads as a placeholder joke rather than a product. Your call — swap to a neutral invented owner (~6 line edits + 1 test), or keep it deliberately.

### 🟡 FLAG-3 — partner first name "Frank" in 10 tracked files

"Frank" appears as the domain expert / schema owner across tracked source comments and root docs:

- `src/mocks/owedbook.ts:3` — "derived from **Frank's** year-old demo DB"
- `src/types/adminDemo.ts:10,60` — "**Frank** truth: admin | user", "Unbacked in **Frank's** schema"
- `src/services/adminDemo.ts:157`, `src/components/admin-portal/AddStoreButton.tsx:21`, `src/__tests__/admin-portal/AddStoreButton.test.tsx:35` — "to elicit the real requirement from **Frank**"
- `phase2.md:42,43,44,77,110` and `RECOVERY.md:21,42` — "Confirmed w/ **Coach** + **Frank**", "real V1 pricing is a **Coach** business decision"

First names only, no surname, no company. Low severity — but it publishes that an unnamed third party owns the schema and that pricing is someone's pending business decision. If "Frank" and "Coach" are the client relationship, a public repo now documents your internal client conversations.

### 🟡 FLAG-4 — data provenance sentence is public-facing

`src/mocks/owedbook.ts:3` will be read by anyone browsing the repo: *"150 curated rows derived from Frank's year-old demo DB (identifiers scrubbed). Real: drug economics, qty, original_paid, aac/federal_expected/federal_diff, pbm."*

The scrub itself is sound and I verified it holds. But the sentence advertises that **real pharmacy financial data from a real client DB** sits in a public repo. Even when defensible, that is a line a reader may stop at. Consider rewording to "derived from an anonymized production dataset" — same truth, no client pointer.

### Cyberize

`cyberizegroup.com` appears only in the `.env copy.example` comment (covered by FLAG-1). `cyberizedev.com` is the live deploy domain — already public, no action.

---

## 5. Verdict

| Item | Severity | Blocking a public repo? |
| --- | --- | --- |
| FLAG-1 — `.env copy.example` masked-but-live credentials | 🔴 HIGH | **YES** — rotate + placeholder before publishing |
| FLAG-2 — "Barack Obama" as demo owner | 🟡 OPTICS | No — your judgment |
| FLAG-3 — "Frank" / "Coach" in comments + root docs | 🟡 LOW | No — your judgment |
| FLAG-4 — provenance sentence naming a real client DB | 🟡 LOW | No — one-line reword |
| §2 hardcoded secrets in source | ✅ CLEAN | — |
| §3 PHI in mock layer | ✅ CLEAN | — |

**Held:** Part 2 (number verification) launched in the background since those figures are needed under any decision. **Part 3 (README augment) not started** — awaiting operator call on FLAG-1 through FLAG-4.

---

## 6. Part 2 — verified numbers (runs of 2026-07-31 19:38–19:42)

Fresh `npm ci` into an empty `node_modules` (the tree had none), then the triad.

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | **exit 0 — zero errors** ✅ |
| Tests | `npx jest --ci` | **25 suites / 118 tests, all passed**, 7.66s ✅ |
| Build | `npm run build` | **22 routes**, compiled in 10.2s, 16/16 static pages ✅ *(see caveat)* |
| Audit | `npm audit --omit=dev` | **6 high severity — NOT clean** 🔴 |

**Build caveat.** The first `npm run build` **failed**: `.env.local` does not exist in this working tree, and `/access-denied` prerenders through `@supabase/ssr`, which throws without a URL + key. Re-ran with throwaway placeholder env vars inline (nothing written to disk) → clean build, 22 routes. So: the code is fine, the build simply requires Supabase env to be present. Worth knowing because **anyone cloning this repo from LinkedIn hits that exact failure** if they run `npm run build` before filling `.env.local`. The README Quick Start should say so.

Route inventory (22): `/` · `/_not-found` · `/access-denied` · `/admin-portal` (+ `/audit`, `/billing`, `/settings`, `/stores/[id]`, `/stores/[id]/invite`) · `/api/auth/{confirm,login,logout,signup}` · `/auth` · `/error` · `/icon.png` · `/moose-portal` (+ `/users`, `/users/add-member`, `/users/edit/[id]`) · `/owedbook` · `/profile` · plus `Proxy (Middleware)`.

### 🔴 FLAG-5 — the "0 vulnerabilities" claim is stale; no audit badge is earnable today

`RECOVERY.md:7` records **0 vulns** as of 2026-07-23. Today, production deps show **6 HIGH**:

| Package | Advisory | Fix available? |
| --- | --- | --- |
| `postcss` ≤8.5.17 | Path traversal via `sourceMappingURL` → arbitrary `.map` disclosure | Only by downgrading `next` to **9.3.3** — a major-version regression. **No real fix.** |
| `next` ≥9.3.4 | inherits the `postcss` advisory | same — not actionable |
| `brace-expansion` ≤5.0.7 | DoS via unbounded expansion → OOM crash | yes |
| `minimatch`, `glob`, `sucrase` | transitive on `brace-expansion` | yes |

These are **new advisories published since 07-23**, not a regression in your tree — `next@16.2.11` and `sharp@0.35.3` are still the versions the 07-23 fix landed. Four of the six are cleanly fixable; the `postcss`/`next` pair is not fixable without a catastrophic downgrade and is a wait-for-upstream item.

**Consequence for the brief:** you asked for an audit badge *"if clean"*. It is not clean, so **I will omit the audit badge** rather than print a number that is either false or unflattering. Say the word if you want it included honestly (`npm audit: 6 high (upstream)`) or want the 4 fixable ones cleared first — that is a separate task from the README.

---

## Note on the missing input

The brief references "the attached factory template" for the badge row and the 2-column image table. **No template was attached to this session**, and a `grep -rl "shields.io"` across `agent_docs/`, `docs/`, and `_SKILLS/` returns nothing. Unless you paste it, I will use standard `shields.io` `flat-square` badges with the stack colors and flag the row for your review.
