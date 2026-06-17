# _design/ — Phase 2 Visual Targets

Tokens are INHERITED from Phase 1 (`src/app/globals.css` v1.1) — Phase 2 does NOT reinstall or re-theme. This folder holds the OwedBook BUILD targets (no longer "do not build").

## Operator drops (the OwedBook artifacts from Phase 1's phase2-reference)
```
_design/phase2-reference/
├── owedbook-metro-warm-mist.png    ← primary desktop target
├── owedbook-metro-warm-slate.png   ← dark target
├── owedbook-federal-dollars.png    ← Federal tab variant
├── owedbook-mobile-mist.png        ← mobile reflow target
└── owedbook-mobile-slate.png       ← mobile dark
```
Style tile + token files are unchanged from Phase 1; reference them in place at the Phase-1 FFM if needed.

## How Claudy uses it
Cluster 1 (KIPs) and Cluster 2 (OwedBook) match these PNGs. HTML/PNG are QC targets; the running app is verified against them in both Mist and Slate.
