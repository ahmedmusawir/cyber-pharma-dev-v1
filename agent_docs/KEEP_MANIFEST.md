# KEEP_MANIFEST — ruled zero-consumer KEEPs

> Durable record so future recons don't re-litigate deletes already ruled.
> Emitted by stark-kit-residue-cleaner (Phase 2, run 2026-07-14). Each entry:
> the file, the ruling date, the reason, and the expected consumption phase.

## Blessed infra (kept unconsumed by operator ruling)

| File | Ruled | Reason | Expected consumer |
|---|---|---|---|
| `src/utils/supabase/admin.ts` | 2026-07-14 (Q3) | Service-role Supabase client — bypasses RLS for privileged ops. Manifest §D "later-phase certain." | Privileged server operations, Phase 3+. **⚠️ `/moose-portal` carries its OWN service-role client (`_shell`/`_lib/admin.ts`) — reconcile the duplicates at Phase 3.** |

## Ledger — placeholders doing a real job (KEEP, replace later)

| Surface | Ruled | Note |
|---|---|---|
| `src/app/(public)/` landing + `HomePageContent.tsx` + `components/global/{NavbarHome,NavbarLoginReg}` | 2026-07-14 (Q2) | Kit marketing landing is the live `/` route and a real placeholder. **TASK: replace kit marketing landing with real Cyber Pharma landing — pre-staging design task.** Not residue. |
