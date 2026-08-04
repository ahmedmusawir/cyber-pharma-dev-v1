# Changelog

> Documentation/playbook change log per CLAUDE.md Changelog Protocol.
> `[CC]` = Claude Code · `[TS]` = Tony Stark manual edits.

## 2026-08-04 09:50 UTC — [CC] Claude Code

- **Created:** `agent_docs/KIP_REGISTRY.md` — numbered registry of parked Kit/Known Improvement Proposals; seeded KIP-1 (server.ts cookie modernization) + KIP-2 (useAuthStore.role stale-persist consumers)
- **Updated:** `CLAUDE.md` — session-start step 5: check KIP_REGISTRY and surface any KIP whose triggers are met
- **Reason:** Operator directive after the staging nav-bug fix — give parked improvements a durable home with explicit trigger conditions instead of scattered flags
