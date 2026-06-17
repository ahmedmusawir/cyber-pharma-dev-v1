# TONY_DEMO_06 — UI / COPY (adapted from PROMPTS-AND-PERSONA)

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

This is a web app, not an LLM application — there are no system prompts, no personas, no instruction hierarchies. This document instead inventories the user-facing copy: page titles, brand strings, tab labels, button text, form labels, dropdown options, error messages, and email templates. The brand voice is a mix of intentional pharmacy-domain copy ("Cyber Pharma", "OwedBook", "Ledger-level clarity on what's still owed") and unedited starter-template residue ("Moose Next Framework v3", "Announcing our next round of funding", "© 2020 Your Company, Inc."). The PBM dropdown contains 21 hardcoded options including a likely typo duplicate.

---

## Findings

### Brand Strings

**EVIDENCE** — Product brand: "Cyber Pharma".
- `src/components/home/Hero.tsx:39` — `<h1>Cyber Pharma</h1>`
- `src/app/(admin)/admin-portal/AdminPortalContent.tsx:261` — `<meta name="description" content="Cyber Pharma Admin – Owedbook" />`
- `src/app/api/reports/email/route.ts:37` — email signature: `"Thank you,\nCyber Pharma"`
- `src/components/admin/ReportActions.tsx:347` — preview email body: `"Thank you,\nCyber Pharma"`

**Source:** All four cited locations

---

**EVIDENCE** — Hero subheadline / tagline: "The Best Way To Manage Your Pharmacy Claims..."

**Source:** `src/components/home/Hero.tsx:42`

---

**EVIDENCE** — OwedBook page subtitle: "Ledger-level clarity on what's still owed"

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:331-333`

---

**EVIDENCE** — Email envelope from-address: `"noreply@cyberpharma.local"`. Note: `.local` TLD — this is a placeholder/internal-only address, not a real production sending address.

**Source:** `src/app/api/reports/email/route.ts:57`

---

### Vestigial / Template-Residue Strings

**EVIDENCE** — Browser tab title fallback: `metadata.title = "Moose Next Framework v3"` — vestigial template name shown on every page that doesn't override `<title>`.

**Source:** `src/app/layout.tsx:9-10`

---

**EVIDENCE** — Root layout `metadata.description = "This is just ui/ux framework with Shadcn"` — same template-residue.

**Source:** `src/app/layout.tsx:11`

---

**EVIDENCE** — Hero "Announcing our next round of funding." — generic startup-marketing copy unrelated to pharmacy claims.

**Source:** `src/components/home/Hero.tsx:27`

---

**EVIDENCE** — Footer copyright: `"© 2020 Your Company, Inc. All rights reserved."` — placeholder copyright with literal "Your Company" string and a 2020 year.

**Source:** `src/components/home/Footer.tsx:198-200`

---

**EVIDENCE** — Footer navigation tagline: "Making the world a better place through constructing elegant hierarchies." — Silicon-Valley-parody placeholder text.

**Source:** `src/components/home/Footer.tsx:106-107`

---

**EVIDENCE** — Footer navigation columns are generic placeholder content unrelated to pharmacy:
- Solutions: Marketing, Analytics, Commerce, Insights
- Support: Pricing, Documentation, Guides, API Status
- Company: About, Blog, Jobs, Press, Partners
- Legal: Claim, Privacy, Terms

All linked to `href="#"` (no real targets).

**Source:** `src/components/home/Footer.tsx:1-25`

---

**EVIDENCE** — Members portal placeholder text: `"Welcome to the Members Portal. This is a placeholder page to validate server-side RBAC."`

**Source:** `src/app/(members)/members-portal/page.tsx:5-7`

---

**EVIDENCE** — Superadmin portal title: `"Superadmins' Portal"` followed by 3 paragraphs of Lorem ipsum.

**Source:** `src/app/(superadmin)/superadmin-portal/SuperadminPortalPageContent.tsx:16-27`

---

**EVIDENCE** — `(public)/old/HomePageContent.tsx` headline: `"Cyberize AI Power Events"` — unrelated to pharmacy. Contains 4 Lorem ipsum boxes with picsum.photos placeholder images.

**Source:** `src/app/(public)/old/HomePageContent.tsx:18-30`

---

**EVIDENCE** — `(public)/demo/DemoPageContent.tsx`: shadcn typography showcase. Headline is Lorem ipsum, with 5 button variant examples beneath.

**Source:** `src/app/(public)/demo/DemoPageContent.tsx:18-50`

---

**EVIDENCE** — Booking page back-button text: `"Back To Posts"` (the link target is `/members-portal`). The "Posts" terminology is residue from the upstream Next.js posts-demo starter.

**Source:** `src/app/(members)/booking/page.tsx:8`

---

**EVIDENCE** — Booking form is titled `"Booking Form"` but its three fields are `Title`, `Body`, `Author` (post-shaped) and its description text is `"This is title of the Post"` / `"This is the content of the Post"` / `"This is the author of the Post"`. Submit button text: `"Book Now"`.

**Source:** `src/app/(members)/booking/InsertForm.tsx:69,86-87,107-110,130-131,138-140`

---

**EVIDENCE** — Profile form hardcoded defaults (visible in any user's profile page until they edit):
- First Name: `"Frank"`
- Last Name: `"Underwood"`
- Title: `"Pharmacist In Charge"`

**Source:** `src/components/profile/forms/PersonalInfoForm.tsx:14,18,22`

---

**EVIDENCE** — Not-Found page copy: `"Page Not Found"` / `"Sorry, the page you are looking for does not exist."` / `"Go back to Home"` / `"This is coming from /app"`. The trailing line is debug residue.

**Source:** `src/app/not-found.tsx:7-15`

---

### OwedBook UI Copy

**EVIDENCE** — Page title (browser tab): `"Admin – Owedbook"`. Note the en-dash and lowercase "Owedbook" inside the title. The visible H1 uses different casing: `"OwedBook"` (camel-case).

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:260,330`

---

**EVIDENCE** — KPI pill labels (sticky header):
- `"Commercial Underpaid:"`
- `"Commercial Scripts:"`
- `"Updated Difference:"`
- `"Owed:"`

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:349,352,355,358`

---

**EVIDENCE** — Tab labels:
- `"Commercial Dollars"`
- `"Updated Commercial Payments"`
- `"Federal Dollars"`
- `"Summary"`

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:394,402,410,418`

---

**EVIDENCE** — Commercial Dollars table headers (in display order): Date, Script, Qty, Medicaid Rate, Method, Expected, Original Paid, Owed, Report, Status.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:455,461,467,473,479,485,491,497,503,509`

---

**EVIDENCE** — Updated Commercial Payments table headers: Date, Script, Original Paid, New Paid, Updated Difference.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:554,560,566,572,578`

---

**EVIDENCE** — Federal Dollars table headers: Date, Script, Qty, AAC, Expected, Original Paid, Diff, Report. (Note: Federal tab uses `AAC` label where Commercial tab uses `Medicaid Rate`, even though both render the same field `r.rate`.)

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:621,627,633,639,645,651,657,663`

---

**EVIDENCE** — Summary table headers: PBM Name, Commercial Dollars, Federal Dollars. Plus a `Total` row label (lines 729-731).

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:705-707,728-731`

---

**EVIDENCE** — Empty-state copy:
- `"No data for current filters."` (Commercial tab; line 444)
- `"No updated payments for current filters."` (Updated tab; line 545)
- `"No federal data for current filters."` (Federal tab; line 614)
- `"No data for current filters."` (Summary tab; line 698)

**Source:** Cited lines

---

**EVIDENCE** — Pagination copy: `"Page X of Y"`, button text `"Prev"` / `"Next"`, `"Limit {rowsPerPage} | Total {displayedTotal}"`.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:367,369-370,372`

---

### Filter Panel Copy

**EVIDENCE** — Filter panel labels and buttons:
- Header: `"{N} filter(s) active"` (with pluralization at line 63)
- `"Upload Data"` button (placeholder, no-op handler)
- `"From (Date)"` label
- `"To (Date)"` label
- `"Filter"` label with options `All` / `Underpaid` / `Overpaid`
- `"PBM"` label with 21 options (see below)
- `"Clear Filters"` button
- `"Apply"` button (transient: `"Applying..."` while loading)
- `"Get Fresh Data"` button (transient: `"Refreshing..."` while loading)

**Source:** `src/components/admin/FiltersPanel.tsx:62-63,69-71,77,89,104,110-112,118,164,174,184,192,197-201`

---

**EVIDENCE** — PBM dropdown — 21 hardcoded options in `FiltersPanel.tsx:124-145`:

```
All
AssistRx
Benecard
Capital RX
Caremark
Drexi
DST
Employer Health Options
Express Scripts
Federal
MedImpact
OptumRx
Sav-Rx
Script Care
ScriptClaim
ScriptCycle
ScriptGuideRx
ScriptSave
Scriptcare
Select Health
SenRx
SmithRx Commercial
```

**Source:** `src/components/admin/FiltersPanel.tsx:124-145`

**EVIDENCE** — `"Script Care"` (with space) and `"Scriptcare"` (no space) both appear in the list. Likely typo duplicate.

**Source:** `src/components/admin/FiltersPanel.tsx:136,141`

---

### Auth Form Copy

**EVIDENCE** — LoginForm copy:
- Card title: `"Login"`
- Card description: `"Log into your account with your credentials"`
- Field labels: `"Email"` / `"Password"`
- Placeholders: `"Please Enter Email"` / `"Please Enter password"` (note casing inconsistency)
- Submit button: `"Login"`

**Source:** `src/components/auth/LoginForm.tsx:84-86,101,107,121,128,148`

---

**EVIDENCE** — RegisterForm copy:
- Card title: `"Signup"`
- Card description: `"Register your account with your credentials"`
- Fields: Name, Email, Password, Password (the confirm field also uses label `"Password"` instead of "Confirm Password" — UX issue)
- Submit button: `"Signup"`

**Source:** `src/components/auth/RegisterForm.tsx:99-103,116-119,137-138,158-159,179-180,201`

---

**EVIDENCE** — RegisterForm zod validation messages:
- Name required: `"Name is required"`
- Email required: `"Email is required"`
- Email format: `"Please enter a valid email"`
- Password required: `"Password is required"`
- Password confirm required: `"Password confirmation is required"`
- Mismatch: `"Passwords don't match"`

**Source:** `src/components/auth/RegisterForm.tsx:28-48`

---

### Email Template Copy

**EVIDENCE** — Outgoing email body template (in `/api/reports/email`):

```
Hello {pbmName},

Please find attached the {labelForTab(tab)} report for {dateFrom} to {dateTo}.

Thank you,
Cyber Pharma
```

(The "for {dateFrom} to {dateTo}" segment is omitted entirely if both date fields are empty.)

**Source:** `src/app/api/reports/email/route.ts:37`

---

**EVIDENCE** — Email subject template: `"{pbmName} {labelForTab(tab)} Report {dateFrom} to {dateTo}"` (date range omitted if both empty)

**Source:** `src/app/api/reports/email/route.ts:35-36`

---

**EVIDENCE** — Email preview UI in `ReportActions.tsx` (the in-browser preview the user sees before downloading the .eml):
- Header: `"Email Preview"` with a 📧 emoji icon
- Description: `"This is a non-sending preview. Use 'Send Email' to download the .eml file."`
- "To" label, "Subject" label, "📎 Attachments:" label
- The preview body uses the SAME `Hello / Please find / Thank you / Cyber Pharma` template as the actual email — values are interpolated client-side and matched by the server template.

**Source:** `src/components/admin/ReportActions.tsx:309,311-313,319-336,340-352,357`

---

### Toast / Alert Copy

**EVIDENCE** — Inline `alert()` calls in `ReportActions.tsx`:
- `"Report saved successfully."` (line 124)
- `"Save completed."` (line 141, fallback)
- `"Save failed"` / `"Download failed"` / `"Email failed"` (error fallbacks at lines 144, 189, 228)

**Source:** `src/components/admin/ReportActions.tsx:124,141,144,189,228`

---

**EVIDENCE** — Booking-form toasts (`useToast`):
- Success title: `"Post created successfully"` (note: "Post", not "Booking")
- Success description: `"Updated by {author}"`
- Error title: `"Error creating post"`

**Source:** `src/app/(members)/booking/InsertForm.tsx:53-63`

---

### Error Page Copy

**EVIDENCE** — `/error` page renders only: `<p>Sorry, something went wrong</p>`

**Source:** `src/app/error/page.tsx:1-3`

---

### Per-Page `<title>` Overrides (via `next/head`)

**EVIDENCE** — Pages that set their own title:
- `AdminPortalContent.tsx:260` — `Admin – Owedbook`
- `DemoPageContent.tsx:12` — `Next Starter Home` (note: "Next Starter Home" — vestigial)
- `HomePageContent.tsx` (both copies) — `HomePageContent` (literally the component name as title)
- `SuperadminPortalPageContent.tsx:10` — `SuperadminPortalPageContent` (component name)

Other pages have no `<Head>` and inherit `"Moose Next Framework v3"` from root metadata.

**Source:** Cited files

---

### Persona / System-Prompt Equivalents

**GAP** — No system prompts, no LLM configuration, no AI personas. This is a CRUD web app — there is no agent or LLM call surface anywhere in `src/`.

---

## Open Questions

1. Is `"OwedBook"` (camel-case) or `"Owedbook"` (lowercase) the intended brand spelling? Both appear within the same file.
2. Are the 21 PBM dropdown options the canonical list, or should they be loaded from `pharma_pbm_info` dynamically? Currently hardcoded.
3. Is `"Script Care"` vs `"Scriptcare"` a deliberate distinction (two real PBMs) or a typo? Affects filtering — if a row's `pbm_name = "Scriptcare"`, the user filtering by "Script Care" will not match it.
4. Is `noreply@cyberpharma.local` the intended sender address, or should it be a real domain? `.local` TLD means desktop email clients will likely reject the envelope.
5. The footer's "Solutions / Support / Company / Legal" placeholder navigation — should these be removed entirely, replaced with pharmacy-relevant content, or are they intentional placeholder content for the demo?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
