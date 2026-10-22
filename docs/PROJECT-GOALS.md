# Ghost Reveal: Project Goals and Context

> **For AI agents and new contributors.** Read this first (the short version is [`AGENTS.md`](../AGENTS.md); Cursor rules and skills live in `.cursor/`). It explains what Ghost Reveal is, why it exists, the goals the owner has set, the rules every change must respect, where the project stands today, and what is still undecided. Companion docs: [`README.md`](../README.md) (usage and API), [`docs/ROADMAP.md`](./ROADMAP.md) (native CSS strategy), and [`llms.txt`](../llms.txt) (compact API reference for AI tools). The website is the sibling repository `ghost-reveal-site` (`docs/SITE.md` there).

Last updated: 2026-10-22. v0.2.0 is not on npm. The site is live at [ghostreveal.com](https://www.ghostreveal.com/). The GitHub repo exists and has no commits yet.

---

## 1. One-paragraph summary

Ghost Reveal is a tiny (about 2 KB gzipped), zero-dependency, pure vanilla JavaScript library that reveals elements with polished animations as they scroll into view. It is configured with HTML attributes (`data-reveal`, and AOS-compatible `data-aos`), needs no CSS file, respects reduced-motion preferences, and works in any framework or none. Its strategic aim is to become **the maintained, modern, drop-in replacement for AOS (Animate On Scroll)**, the most popular scroll-reveal library, which has not shipped a release since 2018.

## 2. Owner and family

- **Owner:** Byron Johnson (GitHub `byronjohnson`). License: MIT.
- Ghost Reveal is the fourth library in Byron's family of small component scripts:
  - [LiteLight](https://litelightbox.com/) (`litelight-js`): lightbox gallery, about 4 KB gzipped, his most successful library.
  - [ShuttersJS](https://shuttersjs.com/) (`shutters-accordion`): accordion, under 2 KB gzipped.
  - [HeightHarmony](https://heightharmony.byronj.me/) (`height-harmony`): equal-height script, under 2 KB gzipped.
- **Shared family style (non-negotiable):** tiny; no dependencies; configured through HTML attributes; built-in accessibility; ships an `llms.txt` so AI tools can read the docs.
- **Broader aspiration:** build JavaScript component libraries that genuinely help both the developer community **and AI agents** (easy for an agent to generate correct markup for, and easy for an agent to read the docs).

## 3. Name history

`reveal-lite` (v0.1 working name) → **Ghost Scroll** → **Ghost Reveal** (current, decided 2026-10-21). npm package `ghost-reveal`, UMD global `GhostReveal`, repo `github.com/byronjohnson/ghost-reveal` (planned). As of 2026-10-21 the npm name `ghost-reveal` was unclaimed. Do not reintroduce old names anywhere.

## 4. Why this project exists (the opportunity)

Verified on 2026-10-21 from the npm registry:

| Library | Latest release | Weekly downloads | Notes |
|---|---|---|---|
| AOS | 2.3.4, Oct 2018 (3.0 never left beta) | ~174K | Requires `aos.css`; depends on lodash packages and a classList polyfill |
| ScrollReveal | 4.0.9, Mar 2021 | ~5K | GPL-3.0 (paid license for closed-source commercial use); 3 deps; 5,760 B gzipped; uses scroll/resize listeners; no reduced-motion handling; JS-only config; no bundled types |
| sal.js | 2021 | ~2.6K | Stale |
| lax.js | 2020 | ~1.4K | Stale |
| scroll-out | 2020 | ~0.8K | Stale |
| WOW.js | 2016 | ~5.9K | Stale |

Actively maintained alternatives exist but are not small, standalone, attribute-driven tools: Motion (`inView()`, full animation library, JS config), GSAP ScrollTrigger (heavy, JS config, non-MIT license), react-intersection-observer (React only, no animations), Alpine Intersect (Alpine only), TAOS (requires Tailwind).

**The gap:** no actively maintained library is tiny, framework-agnostic, HTML-attribute-driven, and AOS-compatible, while hundreds of thousands of weekly AOS installs have nowhere modern to go. **Converting AOS users is the core growth strategy.**

## 5. The four core goals (set by Byron, 2026-10-21)

Every change must advance these without regressing any of them.

### Goal 1: As minimal as possible, while still powerful
- Hard budget: core ESM build **≤ 2,048 bytes** min+gzip. Every added byte must be justified; prefer merging or removing code.
- Powerful options remain available (duration, delay, easing, distance, blur, offset, once, stagger, anchor placement, disable, events, refresh/destroy), but defaults should make zero-config usage look great.

### Goal 2: Absolutely stunning fade-in animations
- The default reveal must look premium with no configuration: currently a 16px rise, 4px blur-to-sharp, 700ms, expo-out easing `cubic-bezier(.16,1,.3,1)`.
- Animate only compositor-friendly properties (opacity, transform, filter). No layout shift, no horizontal overflow.
- Quality is judged visually (mid-animation frame captures), not just by tests passing.

### Goal 3: Incredibly simple to add in any popular framework
- One-line CDN `<script ... data-auto>` setup for no-build sites.
- SSR-safe imports (no `window`/`document` access at import time; `init()` on the server is a no-op).
- Picks up dynamically inserted content by default (single-page app route changes just work).
- Copy-paste recipes for plain HTML, Vite, React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Astro, Angular, WordPress.
- Correct TypeScript types and an up-to-date `llms.txt` so AI agents can integrate it correctly.

### Goal 4: Well positioned for native CSS scroll-driven animations
- Animations are defined as plain keyframe data (`keyframes()` export) so the same definitions can drive the Web Animations API today and a native CSS/ScrollTimeline engine later.
- Feature-detect native support; an opt-in `data-reveal-scrub` mode already uses native view timelines where available.
- See [`docs/ROADMAP.md`](./ROADMAP.md) for browser support data and the migration path. Native "play once on enter" CSS is not broadly supported yet, so IntersectionObserver remains the main engine.

## 6. Design principles and non-negotiables

1. **Zero runtime dependencies. No CSS file.**
2. **HTML-attribute first.** Everything common must be doable with attributes alone; the JS API is for advanced use.
3. **AOS drop-in compatibility.** Existing `data-aos*` markup must keep working. The default *look* intentionally differs from AOS (more polished); the README documents how to match AOS exactly.
4. **Accessibility built in.** Respect `prefers-reduced-motion` (live, not just at init); never hide content permanently.
5. **Progressive enhancement.** If JS is disabled or the script fails to load, all content stays visible.
6. **Performance.** IntersectionObserver (no scroll listeners), Web Animations API, shared observers, GPU-friendly properties.
7. **Agent-friendly.** Predictable attribute names, complete types, `llms.txt` kept in sync with the README.
8. **Small, consistent API.** Avoid option sprawl; one obvious way to do each thing.
9. **Honesty in docs.** Separate verified facts from assumptions; don't claim browser support, sizes, or framework compatibility that hasn't been measured or run.

## 7. Current state (v0.2.0)

- **Builds (min+gzip):** core ESM 1,974 B; auto ESM 1,959 B; UMD 2,710 B (bundles AOS easing names and sets `window.AOS` alias only if undefined); optional `aos-easings` add-on 310 B.
- **Features:** fade/zoom/slide/flip families with directions (23 named types plus bare `data-reveal`), stagger (`data-reveal-stagger`, siblings revealed together), blur, anchor placements, `once`, `disable`, `reveal:in` / `reveal:out` events (async for above-the-fold elements), `refresh()` re-reads attributes, `destroy()`, DOM watching on by default (`observe:false` to opt out), overflow guard for slides, experimental scrub mode.
- **Tests:** 49 top-level tests (library, SSR, site, docs page, dev server), all passing in Chromium, Firefox and WebKit (Playwright builds) via `npm run test:all`; types via `npm run test:types`. Not yet tested on real Safari/iOS devices.
- **Framework recipes actually run:** React 19, Vue 3.5, Svelte 5, React SSR in Node. Next.js, Nuxt, SvelteKit, Astro, Angular, WordPress recipes follow official docs but have not been run.

## 8. Demo website

The site is a separate repository, `ghost-reveal-site`, checked out next to this one. It installs this library with `"ghost-reveal": "file:../ghost-reveal"` and generates `/docs` from `index.d.ts`, `src/index.js`, `dist/` and this README. Run `npm run dev` there, not here. The notes below describe that site.

- A **multi-page** static site (Home, Docs, Playground, Demo, 404), zero runtime dependencies, built by `npm run build:site` into `site-dist/`.
- **Hosted on Vercel**, configured via `vercel.json` (clean URLs, no trailing slash, immutable caching for hashed assets, CSP and security headers). Set the `SITE_URL` environment variable on Vercel.
- **Docs page (/docs):** one scannable page from "paste a script tag" to framework guides, AOS migration, API and FAQ. Its reference tables, animation list, file sizes and framework recipes are generated at build time from `index.d.ts`, `src/index.js`, `dist/` and the README, and the build fails on drift.
- **Header:** inline nav + GitHub mark on desktop; at ≤820px a Menu button and an editorial full-height menu sheet (see §14 item 9 and `docs/SITE.md`).
- **Home page:** hero shows instantly (no load animation, see decisions); feature section is the editorial spec list (see design taste); `site/assets/home.js` calls `init({ once: false })` so sections fade in again each time they scroll back into view, and the `#repeat` button toggles "Repeat: on (once: false)" / "Repeat: off (once: true)". This is a demo choice only; the library default stays `once: true`.
- **Playground page:** visitors pick any animation type from a list and watch it replay on a single element, with duration/blur/distance controls and a copyable HTML snippet. It must use the library's own keyframes so what visitors see is what ships.
- **Demonstration page (`/demo`):** seven real elements (heading, paragraph, figure, quote, list, button, article). The intro fills the first screen, so Heading and every example after it start below the fold. The writing stays visible once you scroll to it. Each live element is followed by the markup that runs it. This page calls `init({ once: false })` so examples replay on the way back. Library defaults stay `once: true` and `initial: false`.
- **Quality bar:** Byron's target is Lighthouse 99–100 in every category on every page, mobile and desktop (the hard floor is 95; measured 2026-10-21: /docs 100/100/100/100 on both, home and playground 99–100 with occasional run-to-run noise). Zero layout shift, no console errors or CSP violations, no horizontal overflow at 390px.
- Adding a page must stay trivial; see [`docs/SITE.md`](./SITE.md).
- **Local dev loop:** `npm run dev` (also `npm run demo`) gives a live site at http://localhost:8080/. Every save under `site/` or `src/` shows up without a restart (CSS hot-swaps, everything else reloads, build errors show as an overlay). `npm run preview` is the production-like check of `site-dist/`.

## 9. Decisions made (keep unless Byron changes them)

- Name: Ghost Reveal. MIT license.
- Default look: blur-to-sharp expo-out fade (differs from AOS on purpose).
- Default `offset` 60 and `once: true` (AOS uses 120 and `false`).
- DOM watching on by default everywhere.
- Slide animations also fade (so a slide shortened by the overflow guard doesn't pop).
- Reduced motion = content shown instantly, no animation.
- Home hero appears instantly (no load animation) for better LCP. Mechanism: hero elements do carry `data-reveal`, but `initial: false` (the default) shows anything already on screen at the first scan as-is. Don't add `initial: true` to the home page.
- Home page demo uses `once: false` (replay on scroll back); library default stays `once: true`.
- No API or MCP server for AI agents: it's a client-only library, and `llms.txt` + the docs page cover agents. Proposed next step (pending Byron's yes, **not built**): generate `llms-full.txt` and `/docs.md` at build time from the same sources as /docs, covered by the same drift checks.
- Docs reference content is generated from source (`index.d.ts`, `src/index.js`, `dist/`, README recipes) and the build fails on drift. Fix the source, never hand-edit generated output.
- `data-reveal*` attributes and `reveal:in`/`reveal:out` event names are kept as-is.

## 10. Open questions for Byron

- Keep or drop the experimental scrub mode (~100 B)?
- Publish when Byron says so. Checked 2026-10-22: the npm name `ghost-reveal` returned 404 (unclaimed), and `github.com/byronjohnson/ghost-reveal` exists on `main` with no commits. Do not `npm publish` or `git push` without his go-ahead in the current conversation.
- Which pages to build next (the Docs page exists; candidates: examples, a standalone AOS migration guide).
- Build `llms-full.txt` and `/docs.md` from the docs sources (recommended, awaiting a yes).

## 11. Known limitations

- RTL pages get no special overflow handling.
- A fade-up on the very last element can briefly add ~16px of page height.
- Not verified on real Safari/iOS hardware. Lighthouse was not re-run against the live site in the 2026-10-22 packaging pass.
- Some AOS features are not supported (for example `mirror`, `startEvent`, `data-aos-anchor`, `disable: 'phone'/'tablet'` strings); check the README's AOS migration section before claiming parity.

## 12. Rules for agents working on this project

1. Read this file, then the README and `llms.txt`, before changing anything.
2. Stay under the 2,048 B core budget; report before/after sizes for every bundle when touching `src/`.
3. Run the full test suite in all three engines (`npm run test:all`) and keep it green; add tests for new behavior.
4. Keep README, `llms.txt`, type definitions and the demo site in sync with any API change.
5. Don't add dependencies, a CSS file, or framework-specific code to the library.
6. Don't invent facts (sizes, download counts, browser support). Measure or cite, and date it.
7. Don't publish to npm, push to GitHub, or deploy to Vercel without Byron's explicit approval.
8. To work on the site or see library changes in a page, use `npm run dev` and leave it running. Don't restart it after edits, and don't edit `site-dist/` or `.site-dev/` (both are generated). Check the production output with `npm run preview` before reporting.
9. Ask Byron before breaking changes: renaming attributes or events, changing defaults that alter how existing pages look, or dropping AOS compatibility.
10. Byron edits files himself between agent sessions. Re-read a file right before changing it and keep his edits (for example the `.wrap`, hero gradient/glow and `.specs` styles); never overwrite from memory.
11. Don't delete or move old folders or projects without his approval.
12. Visual effects must add no load-time cost: no images, fonts, extra requests or JS for decoration; CSS only, transform/opacity, disabled under reduced motion.

## 13. Design taste (Byron's preferences)

- **Editorial, not template.** He explicitly dislikes typical AI-generated card grids with an icon above the title. He loved the homepage spec list that replaced the "Zero config, already premium." card grid: `<ul class="specs">` of `<li class="spec">` rows, each with a mono index (01–06), an `h3`, and a right-aligned mono value pill (`4px blur`, `700ms`, `CLS 0`, `live`, `auto`); no card borders, a hairline top border with a gradient accent line that sweeps across on hover (transform only); 3 / 2 / 1 columns at >900 / ≤900 / ≤600px; transitions off under reduced motion. Styles under `.specs` / `.spec*` in `site/assets/site.css`. Reuse this pattern rather than adding cards.
- **Dark, premium, quiet.** Dark site palette (`--acc` / `--acc2` blue-purple accents), generous spacing, readable long-form (about 72ch).
- **Hero:** `.hero h1` has an animated blue/purple gradient (`gr-shift`) and `.hero::before` a soft glow (`gr-glow`), both pure CSS with zero added resources and `animation: none` under reduced motion.
- **Layout detail:** `.wrap` sets only `margin-inline:auto; padding-inline:1.5rem`, so `section { padding:6rem 0 }` vertical padding isn't overridden. Keep it that way.
- **Motion on the site** shows off the library tastefully: below-the-fold only, never hiding prose or code, and always the library's own keyframes.
- **Hero wordmark:** the `.hero h1` text is `GhostReveal` (Byron's choice); keep it.
- **Mobile menu:** full-height opaque sheet at ≤820px with large numbered rows (mono `01`–`03`), current page in the accent gradient with a "Current" pill, round arrow chips, GitHub row and version line at the bottom (thumb reach), rows entering with the library's own blur-rise. Same editorial language as `.specs`; Byron called it excellent.
- **Instant feedback while working:** he wants every change visible immediately without restarts, hence `npm run dev` (SSE live reload, CSS hot swap, error overlay).

## 14. Decisions log (2026-10-21)

All on 2026-10-21, in order. Verified in the repo at end of day.

1. **v0.2 upgrade** of the library: core ESM 1,974 B gz (budget 2,048), auto 1,959, UMD 2,710, aos-easings 310; DOM watching on by default, stagger, anchor placements, `refresh()` re-reads attributes, overflow guard, experimental scrub.
2. **Playground** added (later moved to its own page, `/playground`, with `?anim=NAME` deep links).
3. **Rename** to **Ghost Reveal** (history in §3) (`ghost-reveal`, global `GhostReveal`, `window.AOS` alias only if undefined). `data-reveal*`, `data-aos*` and `reveal:in` / `reveal:out` unchanged.
4. **Multi-page static site** on Vercel: `site/pages` + `site/partials` → `scripts/build-site.mjs` → `site-dist/`; content-hashed immutable assets; CSP `script-src 'self'; style-src 'self'` with no inline scripts or styles (the build enforces it); `cleanUrls`, no trailing slash; `SITE_URL` env for absolute URLs; sitemap, robots, `llms.txt`, OG image.
5. **Live dev mode:** `npm run dev` = `npm run demo` (`scripts/dev.mjs` + `scripts/dev-client.js`; SSE reload, CSS hot swap, error overlay, `no-store`, builds into `.site-dev/<pid>/`); `npm run preview` = production-like `site-dist/`.
6. **Docs page** `/docs` (nav: Home, Docs, Playground): generated reference tables and recipes with drift checks, build-time syntax highlighting (zero-dep), copy buttons, accessible tabs with a no-JS fallback, scroll-spy TOC. Lighthouse 100 ×4 mobile and desktop. 15 dedicated tests.
7. **Homepage redesign** (Byron): spec list replaces the card grid (see §13); home demo uses `once: false` with the Repeat toggle starting "on".
8. **Agents:** no API or MCP server; `llms-full.txt` + `/docs.md` proposed, not built.
9. **Mobile menu** (later the same day): at ≤820px a Menu button opens a full-height sheet with large numbered rows
   (mono index, current page in the accent gradient with a "Current" pill, arrow chips), a GitHub row
   (`https://github.com/byronjohnson/ghost-reveal`, the URL the footer already used) and the version line; entrance is
   Ghost Reveal's own blur-rise, ≈450ms, compositor-only. Desktop gains a small GitHub mark after the nav. `site/assets/nav.js`
   ships on every page; no-JS falls back to the inline nav via `@media (scripting: none)`.
10. **Project context locked in:** `AGENTS.md`, `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md` (none of them ship to npm; `package.json` `files` is an allowlist).
11. **npm package excludes all docs files (Byron, 2026-10-21):** `docs/` is not in `files`.
12. **Hero wordmark** (Byron's own edit): the home `.hero h1` reads `GhostReveal` (one word, like the global), while the brand name in prose, titles and the header logo stays "Ghost Reveal". Don't revert it.
13. **Mobile menu sheet is opaque** (not translucent/backdrop-blurred): page text bled through at the edges and backdrop blur is costly on phones. The header keeps its frosted glass.
14. **Test reliability:** the repeat-reveal test hung under full-suite load because its `reveal:out` listener could attach after the scroll that fired it. Fixed by attaching first and bounding the wait (5s). 54/54 tests in all three engines at end of day.
15. **Demonstration page** (`/demo`, nav: Demo, after Playground): seven real elements, each followed by its markup. Not a second animation catalog. The intro fills the first screen, so Heading starts below the fold. This page uses `once: false`; library defaults stay `once: true` and `initial: false`. Home links to it from the live grid.
16. **npm package (reviewed 2026-10-22, not published):** `files` stays `dist/`, `src/`, `index.d.ts`, `auto.d.ts`, `aos-easings.d.ts`, `llms.txt`, `README.md`, `LICENSE` (npm also adds `package.json`). `prepack` rebuilds `dist/` before `npm pack` / `npm publish`. `package.json` `homepage` is `https://www.ghostreveal.com/`.
17. **Two repositories (2026-10-22):** this repo is the library. The website is the sibling directory `ghost-reveal-site` (its own git repo, not pushed). Local dev uses `file:../ghost-reveal`. Vercel for the site repo needs the published npm version, because a Vercel build cannot see the sibling checkout.
