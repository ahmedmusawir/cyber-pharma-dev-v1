# _design/ — Visual Foundation + Phase 2 Reference

> This folder is the canonical visual reference for Phase 1.
> Designer's deliverables already filled. Operator drops visual assets.

---

## What's Already Here

Designer has authored and locked these:

| File | Status | Role |
|---|---|---|
| `tokens/globals.css` | ✅ Authored | **EXECUTABLE FOUNDATION** — ready-to-copy token file (Tailwind 3 / HSL / no-wrapper) |
| `tokens/tailwind.config.snippet.ts` | ✅ Authored | **EXECUTABLE FOUNDATION** — mapping snippet for `tailwind.config.ts` |
| `COMPONENT_MANIFEST.md` | ✅ Authored | Which primitives for which screen, KIPs flagged |
| `phase2-reference/README.md` | ✅ Authored | "DO NOT BUILD" warning header |

---

## What Operator Drops

### Visual assets (Phase 1 foundation)

```
_design/
├── style-tile.png                      ← from designer (the visual contract)
├── style-tile.html                     ← from designer (interactive style tile, optional)
├── landing-page-desktop.png            ← cyberpharma_home_metro_warm.png
└── landing-page-mobile.png             ← cyberpharma_home_mobile.png
```

The style tile is the **visual contract** for the locked token set. The landing-page artifacts are the **Phase 1 build target** — Claudy builds `/` to match them.

### Visual assets (Phase 2 reference — DO NOT BUILD)

```
_design/phase2-reference/
├── owedbook-metro-warm-mist.png        ← Mist (light) OwedBook
├── owedbook-metro-warm-slate.png       ← Slate (dark) OwedBook
├── owedbook-federal-dollars.png        ← tab variant
├── owedbook-mobile-mist.png            ← mobile light
└── owedbook-mobile-slate.png           ← mobile dark
```

These are **gorgeous** but **NOT for Phase 1**. They're the visual ground truth for Phase 2's OwedBook build. Phase 1's job is to install the design foundation that makes these screens easy to build later.

---

## How Claudy Uses This Folder

### During Sub-Phase 0 (Discovery)
- Skim the folder; verify designer files are present
- Read `phase2-reference/README.md` to internalize the "DO NOT BUILD" warning

### During Sub-Phase 4 (Components) — most usage
- Copy `tokens/globals.css` content into the app's actual `src/app/globals.css` (or wherever the kit puts it)
- Copy `tokens/tailwind.config.snippet.ts` mapping into the app's actual `tailwind.config.ts`
- Build `/` landing page to match `landing-page-desktop.png` (and mobile variant)
- Reference `style-tile.png` for visual contract throughout
- Reference `COMPONENT_MANIFEST.md` for primitive mapping per screen

### During Sub-Phase 5 (Verification)
- Open the style tile in browser; verify renders correctly in both Mist and Slate themes
- Visual diff the built landing page against `landing-page-desktop.png` and `landing-page-mobile.png`

---

## File Naming Convention

```
_design/
├── README.md                                  ← this file
├── style-tile.png                             ← operator drops
├── style-tile.html                            ← operator drops (optional)
├── landing-page-desktop.png                   ← operator drops (Phase 1 build target)
├── landing-page-mobile.png                    ← operator drops (Phase 1 build target)
├── tokens/
│   ├── globals.css                            ← designer authored (ready-to-copy)
│   └── tailwind.config.snippet.ts             ← designer authored (ready-to-copy)
├── COMPONENT_MANIFEST.md                      ← designer authored
└── phase2-reference/
    ├── README.md                              ← architect authored (warning)
    ├── owedbook-metro-warm-mist.png           ← operator drops (Phase 2 reference)
    ├── owedbook-metro-warm-slate.png          ← operator drops (Phase 2 reference)
    ├── owedbook-federal-dollars.png           ← operator drops (Phase 2 reference)
    ├── owedbook-mobile-mist.png               ← operator drops (Phase 2 reference)
    └── owedbook-mobile-slate.png              ← operator drops (Phase 2 reference)
```

---

## Token Mechanic Reminder

Per designer's `tokens/globals.css`:

- **Tailwind 3.4.1** confirmed (verified via `grep tailwindcss package.json`)
- CSS variables in `globals.css` at `:root` (Mist) and `.dark` (Slate)
- HSL format, **no `hsl()` wrapper** (e.g. `--primary: 12 93% 64%;`)
- Mapped in `tailwind.config.ts` as `primary: 'hsl(var(--primary))'`
- Saira font via `next/font/google` (NOT a CDN `<link>`)
- Components use semantic utilities ONLY (`bg-primary`, `text-destructive`) — NEVER numbered Tailwind colors

The kit currently has hardcoded `slate-800`, `red-600` etc. Phase 1's **kit reconciliation task** migrates those onto semantic tokens. This is foundational — until it's done, "change one file, re-theme everything" is a lie.

---

## Factory-Level Companion Docs

These live OUTSIDE the FFM at `agent_docs/app_factory/design-system/`:

- **`GLOBAL_DESIGN_SYSTEM_HANDBOOK.md`** — doctrine for how the factory designs apps (stable, slow-changing)
- **`THEME_LIBRARY.md`** — catalog of named themes (Mist, Slate, Bright, Dark) + per-tenant pattern

They're factory-level because they outlive any one project's FFM. Reference them on demand for design questions that aren't project-specific.

---

🥄 *Designer's locked deliverables are the foundation. Operator drops visual assets. Phase 2 reference artifacts are direction-only.*
