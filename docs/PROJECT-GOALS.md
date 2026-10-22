# Ghost Reveal: Project Goals and Context

> **For AI agents and new contributors.** Read this first (the short version is [`AGENTS.md`](../AGENTS.md); Cursor rules and skills live in `.cursor/`). It explains what Ghost Reveal is, why it exists, the goals the owner has set, the rules every change must respect, where the project stands today, and what is still undecided. Companion docs: [`README.md`](../README.md) (usage and API), [`docs/ROADMAP.md`](./ROADMAP.md) (native CSS strategy), and [`llms.txt`](../llms.txt) (compact API reference for AI tools). The website is the sibling repository `ghost-reveal-site` (`docs/SITE.md` there).

Last updated: 2026-10-22. v0.2.0 is on npm (`ghost-reveal`, dist-tag `latest`) and on GitHub ([release v0.2.0](https://github.com/byronjohnson/ghost-reveal/releases/tag/v0.2.0)). The site is live at [ghostreveal.com](https://www.ghostreveal.com/). The support link, the site's own `llms.txt`, and Fathom are in the site repo and are not on that deploy yet.

---

## 1. One-paragraph summary

Ghost Reveal is a tiny (about 2 KB gzipped), zero-dependency, pure vanilla JavaScript library that reveals elements with polished animations as they scroll into view. It is configured with HTML attributes (`data-reveal`, and AOS-compatible `data-aos`), needs no CSS file, respects reduced-motion preferences, and works in any framework or none. It is a modern JavaScript scroll-reveal library. Existing `data-aos` markup keeps working, so an unmaintained AOS setup can move over without a rewrite. That compatibility is a feature. Do not introduce the library as a replacement for AOS.

## 2. Owner and family

- **Owner:** Byron Johnson (GitHub `byronjohnson`). License: MIT.
- Ghost Reveal is the fourth library in Byron's family of small component scripts:
  - [LiteLight](https://litelightbox.com/) (`litelight-js`): lightbox gallery, about 4 KB gzipped, his most successful library.
  - [ShuttersJS](https://shuttersjs.com/) (`shutters-accordion`): accordion, under 2 KB gzipped.
  - [HeightHarmony](https://heightharmony.byronj.me/) (`height-harmony`): equal-height script, under 2 KB gzipped.
- **Shared family style (non-negotiable):** tiny; no dependencies; configured through HTML attributes; built-in accessibility; ships an `llms.txt` so AI tools can read the docs.
- **Broader aspiration:** build JavaScript component libraries that genuinely help both the developer community **and AI agents** (easy for an agent to generate correct markup for, and easy for an agent to read the docs).

## 3. Name history

`reveal-lite` (v0.1 working name) → **Ghost Scroll** → **Ghost Reveal** (current, decided 2026-10-21). npm package `ghost-reveal`, UMD global `GhostReveal`, repo `github.com/byronjohnson/ghost-reveal`. Both the npm name and the GitHub repo are live as of 2026-10-22. Do not reintroduce old names anywhere. GitHub topics are `fade-in` and `javascript`. Do not add `reveal-js` or `revealjs`. Those names belong to a slideshow project, and Byron removed them.

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

**The gap:** no actively maintained library is this small, framework-agnostic, and driven by HTML attributes. AOS compatibility matters because those installs can move over without a markup rewrite. The product to recommend is still the scroll-reveal library, not an AOS migration tool.

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
- **Tests:** 22 top-level tests in this repo (`test/reveal.test.mjs`, `test/ssr.test.mjs`). The website suite is 32 tests in `ghost-reveal-site` (`test/site.test.mjs`, `test/docs.test.mjs`, `test/dev.test.mjs`). Chromium site tests passed on 2026-10-22 after Fathom was added. Firefox and WebKit were not run that day. The last recorded three-engine pass was 2026-10-21, before the site moved to its own repo. Types: `npm run test:types`. Not yet tested on real Safari/iOS devices. Chromium uses system Chrome (`CHROME_PATH`, or `/Applications/Google Chrome.app` on this Mac). `playwright-core` does not download browsers.
- **Framework recipes actually run:** React 19, Vue 3.5, Svelte 5, React SSR in Node. Next.js, Nuxt, SvelteKit, Astro, Angular, WordPress recipes follow official docs but have not been run.

## 8. Demo website

The site is a separate repository, `ghost-reveal-site`, checked out next to this one. It still installs this library with `"ghost-reveal": "file:../ghost-reveal"`. The published package is 0.2.0, and a Vercel build of the site repo cannot see the sibling checkout, so that dependency has to become `"ghost-reveal": "0.2.0"` before a remote build. Do not switch it unless Byron asks. `/docs` is generated from `index.d.ts`, `src/index.js`, `dist/` and this README. Run `npm run dev` in the site repo, not here. The notes below describe that site. Its own guide is `docs/SITE.md` there.

- A **multi-page** static site (Home, Docs, Playground, Demo, 404), zero runtime dependencies, built by `npm run build:site` into `site-dist/`.
- **Hosted on Vercel**, configured via `vercel.json` (clean URLs, no trailing slash, immutable caching for hashed assets, CSP and security headers). Set the `SITE_URL` environment variable on Vercel.
- **Docs page (/docs):** one scannable page from "paste a script tag" to framework guides, AOS migration, API and FAQ. Its reference tables, animation list, file sizes and framework recipes are generated at build time from `index.d.ts`, `src/index.js`, `dist/` and the README, and the build fails on drift.
- **Header:** inline nav + GitHub mark on desktop; at ≤820px a Menu button and an editorial full-height menu sheet (see §14 item 9 and `docs/SITE.md`).
- **Home page:** hero shows instantly (no load animation, see decisions); feature section is the editorial spec list (see design taste); `site/assets/home.js` calls `init({ once: false })` so sections fade in again each time they scroll back into view, and the `#repeat` button toggles "Repeat: on (once: false)" / "Repeat: off (once: true)". This is a demo choice only; the library default stays `once: true`.
- **Playground page:** visitors pick any animation type from a list and watch it replay on a single element, with duration/blur/distance controls and a copyable HTML snippet. It must use the library's own keyframes so what visitors see is what ships.
- **Demonstration page (`/demo`):** seven real elements (heading, paragraph, figure, quote, list, button, article). The intro fills the first screen, so Heading and every example after it start below the fold. The writing stays visible once you scroll to it. Each live element is followed by the markup that runs it. This page calls `init({ once: false })` so examples replay on the way back. Library defaults stay `once: true` and `initial: false`.
- **Quality bar:** Byron's target is Lighthouse 99–100 in every category on every page, mobile and desktop (the hard floor is 95; measured 2026-10-21: /docs 100/100/100/100 on both, home and playground 99–100 with occasional run-to-run noise). Zero layout shift, no console errors or CSP violations, no horizontal overflow at 390px.
- Adding a page must stay trivial. The steps are in `docs/SITE.md` in `ghost-reveal-site`.
- **Local dev loop:** in the site repo, `npm run dev` (also `npm run demo`) serves http://localhost:8080/. It watches `site/` (including `site/llms.txt`) and this repo's `src/`, `README.md`, `index.d.ts`, and `package.json`. It does not watch this repo's `llms.txt`. A change to `scripts/dev.mjs` or `scripts/serve.mjs` needs a restart. CSS hot-swaps. Everything else reloads. `npm run preview` is the production-like check of `site-dist/`.
- **Copy Byron froze on the homepage:** `h1` is `GhostReveal`. The tagline is "A modern JavaScript scroll-reveal library". The lead is "Scroll reveals that feel expensive and weigh nothing". The section title is "GhostReveal In Action". Do not put `data-reveal` on body prose, section titles, or the demo banner. The hero already uses it, and `initial: false` shows those elements immediately.
- **Checked on the live site, 2026-10-22 22:21 UTC:** the homepage has the new tagline. `/llms.txt` is still this repo's compact API file. The CSP is still `script-src 'self'` only. The support link, `rel="describedby"`, and Fathom are not in the live HTML. GitHub `ghost-reveal-site` `develop` and `master` are at `1111f70` (support link and `site/llms.txt`). Local site `develop` is one commit ahead, `c25408b` "Add Fathom", and that commit is not pushed. Do not push or deploy unless Byron asks in the current conversation.

## 9. Decisions made (keep unless Byron changes them)

- Name: Ghost Reveal. MIT license.
- Default look: blur-to-sharp expo-out fade (differs from AOS on purpose).
- Default `offset` 60 and `once: true` (AOS uses 120 and `false`).
- DOM watching on by default everywhere.
- Slide animations also fade (so a slide shortened by the overflow guard doesn't pop).
- Reduced motion = content shown instantly, no animation.
- Home hero appears instantly (no load animation) for better LCP. Mechanism: hero elements do carry `data-reveal`, but `initial: false` (the default) shows anything already on screen at the first scan as-is. Don't add `initial: true` to the home page.
- Home page demo uses `once: false` (replay on scroll back); library default stays `once: true`.
- No API or MCP server for AI agents: it's a client-only library. Two `llms.txt` files cover agents, plus the docs page. This repo's `llms.txt` is the compact API reference in the npm package. It has no markdown link list. Do not turn it into the site map. `ghost-reveal-site/site/llms.txt` is copied to `/llms.txt`. Lighthouse's agentic-browsing check requires an H1 and at least one `[title](url)` link, so that file uses `- [Title](https://…): note` lists. Every HTML page has `<link rel="describedby" href="/llms.txt">`. Proposed next step (pending Byron's yes, **not built**): generate `llms-full.txt` and `/docs.md` at build time from the same sources as /docs, covered by the same drift checks.
- Docs reference content is generated from source (`index.d.ts`, `src/index.js`, `dist/`, README recipes) and the build fails on drift. Fix the source, never hand-edit generated output.
- `data-reveal*` attributes and `reveal:in`/`reveal:out` event names are kept as-is.
- Homepage wording, above, is frozen.
- The support control is a first-party link in the site footer, not the Buy Me a Coffee widget. Fathom is the site's only third-party script. Details are in §14 and in the site repo.

## 10. Open questions for Byron

- Keep or drop the experimental scrub mode (~100 B)?
- Which pages to build next (the Docs page exists; candidates: examples, a standalone AOS migration guide).
- Build `llms-full.txt` and `/docs.md` from the docs sources (recommended, awaiting a yes).
- When Byron asks: point `ghost-reveal-site` at `"ghost-reveal": "0.2.0"`, push the local Fathom commit, and deploy. Do not do any of those unasked. npm `0.0.0-stage` is a staged-publishing placeholder and is not `latest`. Do not unpublish it unless he asks.

## 11. Known limitations

- RTL pages get no special overflow handling.
- A fade-up on the very last element can briefly add ~16px of page height.
- Not verified on real Safari/iOS hardware. Lighthouse was not re-run against the live site in the 2026-10-22 packaging pass.
- Some AOS features are not supported (for example `mirror`, `startEvent`, `data-aos-anchor`, `disable: 'phone'/'tablet'` strings); check the README's AOS migration section before claiming parity.

## 12. Rules for agents working on this project

1. Read this file, then the README and `llms.txt`, before changing anything.
2. Stay under the 2,048 B core budget; report before/after sizes for every bundle when touching `src/`.
3. Run the full test suite in all three engines (`npm run test:all`) and keep it green; add tests for new behavior.
4. Keep README, both `llms.txt` files, type definitions, and the demo site in sync with any API change. Leave this repo's `llms.txt` as the compact API reference.
5. Don't add dependencies, a CSS file, or framework-specific code to the library.
6. Don't invent facts (sizes, download counts, browser support). Measure or cite, and date it.
7. Don't publish to npm, push to GitHub, or deploy to Vercel without Byron's explicit approval.
8. To work on the site or see library changes in a page, use `npm run dev` in `ghost-reveal-site` and leave it running. Restart it only when `scripts/dev.mjs` or `scripts/serve.mjs` changes. Don't edit `site-dist/` or `.site-dev/` (both are generated). Check the production output with `npm run preview` before reporting. Don't kill the dev server to run library tests.
9. Ask Byron before breaking changes: renaming attributes or events, changing defaults that alter how existing pages look, or dropping AOS compatibility.
10. Byron edits files himself between agent sessions. Re-read a file right before changing it and keep his edits (for example the `.wrap`, hero gradient/glow and `.specs` styles); never overwrite from memory.
11. Don't delete or move old folders or projects without his approval.
12. Visual effects must add no load-time cost: no images, fonts, extra requests or JS for decoration; CSS only, transform/opacity, disabled under reduced motion. The site's one allowed third-party request is the Fathom script in `layout.html`. The support button is a first-party link. Do not embed the Buy Me a Coffee widget.

## 13. Design taste (Byron's preferences)

- **Editorial, not template.** He explicitly dislikes typical AI-generated card grids with an icon above the title. He loved the homepage spec list that replaced the "Zero config, already premium." card grid: `<ul class="specs">` of `<li class="spec">` rows, each with a mono index (01–06), an `h3`, and a right-aligned mono value pill (`4px blur`, `700ms`, `CLS 0`, `live`, `auto`); no card borders, a hairline top border with a gradient accent line that sweeps across on hover (transform only); 3 / 2 / 1 columns at >900 / ≤900 / ≤600px; transitions off under reduced motion. Styles under `.specs` / `.spec*` in `site/assets/site.css`. Reuse this pattern rather than adding cards.
- **Dark, premium, quiet.** Dark site palette (`--acc` `#a5b4ff` / `--acc2` `#f0abfc`), generous spacing, readable long-form (about 72ch).
- **Accent language** (Byron, 2026-10-22, first used on the footer; reuse it): link purple `#c4b5fd` with no underline and a white hover, for short chrome links. A static display gradient `linear-gradient(105deg, var(--acc), #c4b5fd 42%, var(--acc2))` clipped to the text, for a short name (the footer credit and the header wordmark `.brand-name`). A closing hairline that fades from transparent through `--acc` and `--acc2`. A resting violet glow at `rgba(139,124,246,.22)`, not animated. `#BD5FFF` stays the support button, not a text color. Long-form docs links stay underlined. The exact rules are in `docs/SITE.md` in `ghost-reveal-site`. The footer credit links "Byron Johnson" to `https://byronj.me/`.
- **Hero:** `.hero h1` has an animated blue/purple gradient (`gr-shift`) and `.hero::before` a soft glow (`gr-glow`), both pure CSS with zero added resources and `animation: none` under reduced motion.
- **Layout detail:** `.wrap` sets only `margin-inline:auto; padding-inline:1.5rem`, so `section { padding:6rem 0 }` vertical padding isn't overridden. Keep it that way.
- **Motion on the site** shows off the library tastefully: below-the-fold only, never hiding prose or code, and always the library's own keyframes.
- **Hero wordmark:** the `.hero h1` text is `GhostReveal` (Byron's choice); keep it. The tagline is "A modern JavaScript scroll-reveal library". The lead is "Scroll reveals that feel expensive and weigh nothing". The home section title is "GhostReveal In Action".
- **Mobile menu:** full-height opaque sheet at ≤820px with large numbered rows (mono `01`–`03`), current page in the accent gradient with a "Current" pill, round arrow chips, GitHub row and version line at the bottom (thumb reach), rows entering with the library's own blur-rise. Same editorial language as `.specs`; Byron called it excellent.
- **Instant feedback while working:** he wants every change visible immediately without restarts, hence `npm run dev` (SSE live reload, CSS hot swap, error overlay).

## 14. Decisions log (2026-10-21)

All on 2026-10-21, in order. Verified in the repo at end of day.

1. **v0.2 upgrade** of the library: core ESM 1,974 B gz (budget 2,048), auto 1,959, UMD 2,710, aos-easings 310; DOM watching on by default, stagger, anchor placements, `refresh()` re-reads attributes, overflow guard, experimental scrub.
2. **Playground** added (later moved to its own page, `/playground`, with `?anim=NAME` deep links).
3. **Rename** to **Ghost Reveal** (history in §3) (`ghost-reveal`, global `GhostReveal`, `window.AOS` alias only if undefined). `data-reveal*`, `data-aos*` and `reveal:in` / `reveal:out` unchanged.
4. **Multi-page static site** on Vercel: `site/pages` + `site/partials` → `scripts/build-site.mjs` → `site-dist/`; content-hashed immutable assets; no inline scripts or styles (the build enforces it); `cleanUrls`, no trailing slash; `SITE_URL` env for absolute URLs; sitemap, robots, `llms.txt`, OG image. The CSP started as `script-src 'self'; style-src 'self'`. Item 20 below is the current CSP.
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
16. **npm package (reviewed 2026-10-22, published later that day):** `files` stays `dist/`, `src/`, `index.d.ts`, `auto.d.ts`, `aos-easings.d.ts`, `llms.txt`, `README.md`, `LICENSE` (npm also adds `package.json`). `prepack` rebuilds `dist/` before `npm pack` / `npm publish`. `package.json` `homepage` is `https://www.ghostreveal.com/`. See item 18.
17. **Two repositories (2026-10-22):** this repo is the library. The website is the sibling directory `ghost-reveal-site`. Both remotes are named `Github` (not `origin`). Library: `https://github.com/byronjohnson/ghost-reveal.git`. Site: `https://github.com/byronjohnson/ghost-reveal-site`. Local dev still uses `file:../ghost-reveal`. A Vercel build of the site repo cannot see the sibling checkout, so it needs the published version before it can build remotely.

## 15. Decisions log (2026-10-22)

18. **Published.** The library history starts at root commit `9571452` ("Initial commit"), which has no website files. Annotated tag `v0.2.0` points at that commit. GitHub release: https://github.com/byronjohnson/ghost-reveal/releases/tag/v0.2.0. GitHub's default branch is `develop`. `develop` and `master` both point at `403f10f`, two commits after the tag. Those commits only touched `llms.txt`, and the file matches the tag, so the published tarball and the current `llms.txt` agree. Do not publish 0.2.1 to refresh the readme. npm `ghost-reveal@0.2.0` is `latest`, published by `byronjohnson` (tarball shasum `17f2f99e31a0a41a83d8d41bf7b57dc3518c9ef5`). Direct `npm publish` on this account asks for an OTP in Byron's own terminal. Do not ask him to paste that code into chat. A new package also received a public `0.0.0-stage` placeholder from npm staged publishing. It is not what `npm i ghost-reveal` installs. Leave it alone unless he asks to remove it.
19. **Wording.** The library is a modern JavaScript scroll-reveal library. AOS compatibility stays. Do not lead with "replacement for AOS". Homepage strings in §8 are Byron's.
20. **Fathom** on the site, in `site/partials/layout.html`, on every page including the 404:

    ```html
    <!-- Fathom - beautiful, simple website analytics -->
    <script src="https://cdn.usefathom.com/script.js" data-site="HHZACLJG" defer></script>
    <!-- / Fathom -->
    ```

    The script's pageview is an image and its duration ping is `navigator.sendBeacon`, both to `https://cdn.usefathom.com/`. CSP `script-src`, `img-src`, and `connect-src` allow that host. `style-src` stays `'self'`. The tracker sets `img.style` through the CSSOM, which does not need a style-src exception. The SEO test ignores that image while it is on the page, because the script removes it after it loads. No other third-party host. Committed locally as `c25408b`. Not pushed, and not on https://www.ghostreveal.com/ as of 22:21 UTC.
21. **Support link.** A fixed first-party `<a class="support">` in the footer, every page: `https://www.buymeacoffee.com/byronj`, `target="_blank"`, `rel="noopener noreferrer"`, label "Support this project", heart emoji `💛` with `aria-hidden`. Purple `#BD5FFF`, white text, 2px black border, no yellow circle behind the heart. `z-index: 8` so the open menu covers it. The footer keeps `6.75rem` of bottom padding so the button clears the links. Do not load `cdnjs.buymeacoffee.com` or Poppins. That widget injects a stylesheet, and the CSP plus the no-web-fonts rule forbid it.
22. **Site `llms.txt`.** `scripts/build-site.mjs` copies `site/llms.txt` to `/llms.txt`. It does not copy the library file. The site file is the agent map: H1, a blockquote, then H2 lists of `- [Title](https://absolute-url): note`. `robots.txt` comments the agent index. The library file stays the compact API reference with no markdown links. PageSpeed's "file does not appear to contain any links" check does not count a bare URL. The live site was still serving the library file at the check above.
23. **Footer accent language** (Byron called it fantastic). Reuse it site-wide. Link purple `#c4b5fd`, no underline, hover `#fff`. Static display gradient `linear-gradient(105deg, var(--acc), #c4b5fd 42%, var(--acc2))` on `.foot-name` ("Ghost Reveal") and the header `.brand-name` ("GhostReveal"). Closing hairline fades transparent through `--acc` and `--acc2`. Resting glow `rgba(139,124,246,.22)`, no animation. "Byron Johnson" links to `https://byronj.me/` with `target="_blank"` and `rel="noopener noreferrer"`. Footer padding is `3.25rem 0 6.75rem`. `#BD5FFF` remains the support button only. Docs prose links stay underlined. The table of where each treatment belongs is in `ghost-reveal-site/docs/SITE.md`.
