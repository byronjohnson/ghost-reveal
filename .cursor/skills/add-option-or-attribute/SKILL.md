---
name: add-option-or-attribute
description: Add or change a Ghost Reveal init() option or data-reveal-* attribute across source, types, docs tables, README, llms.txt and tests without docs drift. Use for any API surface change.
---

# Add or change an option / attribute

API changes are Byron's call. Renaming or changing defaults of existing options/attributes is a breaking change: ask first.

1. **Measure** `npm run build && npm run size` (core budget 2,048 B gzip).
2. **Source** `src/index.js`:
   - Option: add to `defaults` only if it has a non-falsy default (unlisted options default to falsy; see the comment
     above `defaults`). Read it from `o` (merged options).
   - Per-element attribute: read with `g(el, 'key')`, `num(el, 'key')` or `flag(el, 'key')` so both `data-reveal-key`
     and `data-aos-key` work (the docs build discovers keys from these calls). Parent-level attributes use
     `getAttribute('data-reveal-key')` and have no `data-aos` alias.
3. **Types** `index.d.ts` → `GhostRevealOptions`: add the property with JSDoc ending in `Default X.` where X is
   `'string'`, a number, `true`/`false` or `none`. The docs build throws if it disagrees with runtime `defaults`,
   or if the option isn't read in `src/index.js`.
4. **Docs page** (sibling repo `ghost-reveal-site`): the options table is automatic. A new attribute needs a row (values text + example) in
   `site/partials/docs-attributes.mjs`; the build asserts the key set equals the source. Mention it in prose sections of
   `site/pages/docs.html` if relevant (tests check every `data-reveal-*` name and `init({…})` key on the page exists).
5. **README** (`## Attributes` / `## Options` tables) and **both `llms.txt` files**. This repo's file: the "Defaults" / "Markup" lines, and "Not supported" if it maps to an AOS feature. The site file `ghost-reveal-site/site/llms.txt`: the prose defaults and the same not-supported list. Keep that file's `- [Title](https://…): note` lists. Do not paste the site map into this repo's `llms.txt`. Also update the AOS migration sections in the README and the docs page.
6. **Tests**: behavior in `test/reveal.test.mjs` (add fixture elements in `test/fixture.html` if needed); types in
   `test/types/check.ts`.
7. **Verify**: `npm run size` (report deltas), `npm run test:all`, `npm run test:types`. In `ghost-reveal-site`, `npm run build:site` (it throws on docs drift) and open `/docs` with `npm run dev`.
