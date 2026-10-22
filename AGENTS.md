# AGENTS.md: Ghost Reveal

Onboarding for AI agents (Cursor, Codex, Claude Code, etc.). Short on purpose; the full context is in
[`docs/PROJECT-GOALS.md`](docs/PROJECT-GOALS.md). Cursor also loads `.cursor/rules/*.mdc` and `.cursor/skills/*/SKILL.md`.

## What it is

A ~2 KB (min+gzip), zero-dependency scroll-reveal library by Byron Johnson. Configured with HTML attributes
(`data-reveal`, AOS-compatible `data-aos`), no CSS file, IntersectionObserver + Web Animations API, SSR-safe,
reduced-motion aware. Aim: the maintained, modern drop-in replacement for AOS (unmaintained since 2018).
npm `ghost-reveal`, global `GhostReveal` (+ `window.AOS` alias if undefined). v0.2.0, **unpublished**. The npm `files` allowlist is `dist/`, `src/`, the `.d.ts` files, `llms.txt`, `README.md` and `LICENSE`. The website is the sibling repo `ghost-reveal-site`.
Family style shared with LiteLight, ShuttersJS, HeightHarmony: tiny, no deps, HTML attributes, built-in a11y, `llms.txt`.

## The four goals (never regress any)

1. **Minimal but powerful:** core ESM ≤ **2,048 B** gzip (now 1,974).
2. **Stunning default fade:** 16px rise + 4px blur-to-sharp, 700ms, `cubic-bezier(.16,1,.3,1)`; opacity/transform/filter only.
3. **Trivial in any framework:** one-line CDN `data-auto`, SSR-safe import, DOM watching on by default, tested recipes.
4. **Ready for native CSS scroll-driven animations:** `keyframes()` is pure data; see [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | library → `dist/` (prints raw + gzip sizes) |
| `npm run size` | gzip -9 size of every `dist/*.js` |
| `npm test` | build + Chromium library tests (`node --test test/*.test.mjs`) |
| `npm run test:all` | Chromium, Firefox, WebKit. Must be green before you report |
| `npm run test:types` | TypeScript check of `index.d.ts` (`test/types`) |

The website is the sibling repo `ghost-reveal-site` (`npm run dev` there, http://localhost:8080). It depends on this checkout via `file:../ghost-reveal` and watches `src/` while it runs.

## Layout

```
src/            index.js (core), auto.js, umd.js, aos-easings.js
index.d.ts      types + JSDoc defaults (source of truth for the site's docs tables), auto.d.ts, aos-easings.d.ts
dist/           built bundles (not git-ignored; shipped to npm)
scripts/        build.mjs, serve.mjs (the test server)
test/           reveal, ssr (Playwright via node:test); types/
docs/           PROJECT-GOALS.md, ROADMAP.md (native CSS)
README.md, llms.txt   user docs + compact agent reference (keep in sync)
```

The website lives in the sibling repository `ghost-reveal-site`. Generated here, never edit by hand: `dist/` (via `npm run build`).

## Invariants

- Zero runtime deps, no CSS file, no framework code in the library. Content is never hidden without JS.
- `prefers-reduced-motion`: shown instantly, no animation (live, not just at init).
- Importing never touches `window`/`document`; `init()` on the server is a no-op.
- AOS markup keeps working; `data-reveal*` and `reveal:in` / `reveal:out` names are frozen.
- Site: CSP and the page rules live in the sibling repo `ghost-reveal-site`.
- API change ⇒ update `src/`, `index.d.ts`, README, `llms.txt` and the library tests here, and the Playground and docs in `ghost-reveal-site`. The site build throws if the installed library and its README disagree.

## Workflow rules

- **Approvals:** never publish to npm, push to GitHub, deploy to Vercel, or delete/move old folders without Byron's explicit OK.
- **Byron edits files himself.** Re-read a file right before changing it and keep his edits.
- **Design taste:** editorial over template. No icon-above-title card grids (see the `.specs` list on the homepage).
- **Honesty:** measure or cite sizes, browser support and framework claims; say what was and wasn't run.
- Report before/after bundle sizes when touching `src/`, and test results per engine.

## Read more

[`docs/PROJECT-GOALS.md`](docs/PROJECT-GOALS.md) (goals, decisions log, design taste, open questions) ·
[`docs/ROADMAP.md`](docs/ROADMAP.md) (native scroll-driven animations) · [`README.md`](README.md) · [`llms.txt`](llms.txt)
The site guide is `docs/SITE.md` in `ghost-reveal-site`.
