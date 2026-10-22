---
name: add-animation-type
description: Add a new animation name or family to Ghost Reveal end to end (keyframes, types, Playground, docs, README/llms.txt, tests, size check, visual check). Use when asked for a new effect like a new direction or family.
---

# Add an animation type

Names follow the grammar `keyframes()` parses in `src/index.js`: `family[-in|-out][-direction]`, with families
`fade`, `zoom`, `slide`, `flip` and directions `up/down/left/right` (`DIRS`). A name inside the grammar may need no
library code at all; a new family does.

1. **Budget first.** `npm run build && npm run size`; note the core `esm.min` gzip size (limit 2,048 B).
2. **Library** (`src/index.js`, `keyframes`): keep it pure data, return `[from, {}]` with `from.opacity === 0`,
   only `opacity` / `transform` / `filter`. Respect `distance` and `blur` arguments. No layout properties.
   If it moves horizontally, confirm the overflow guard still prevents a horizontal scrollbar.
3. **Types** (`index.d.ts`): add the name(s) to the `GhostAnimation` union. This drives the docs list and counts.
4. **Playground** (`ghost-reveal-site/site/assets/animations.mjs`): add to `GROUPS` (a new family gets a new group). The site test
   asserts the Playground lists exactly the union.
5. **Docs**: a new family needs a one-line description in `about` in `ghost-reveal-site/site/partials/docs-animations.mjs`
   (the build throws otherwise). Counts and tiles are generated.
6. **README** `## Animations` table, this repo's **`llms.txt`** "names:" line, and the names sentence in `ghost-reveal-site/site/llms.txt`. Update the "23 named types" count in
   `docs/PROJECT-GOALS.md` §7 if it changed. Leave the site file's link lists intact.
7. **Tests** (`test/reveal.test.mjs`): assert the first keyframe for the new name (use `firstKf`) and that it ends
   fully visible; if it moves sideways, extend the "no horizontal overflow" test list. Use `test/fixture.html` elements.
8. **Verify:** `npm run size` (report before/after for all bundles), `npm run test:all`, `npm run test:types`.
9. **Judge it visually** (see the `judge-animation-quality` skill): `npm run frames`, plus the Playground
   `/playground?anim=<name>` in the sibling repo `ghost-reveal-site` (`npm run dev` there). It must look premium at the defaults, not just pass tests.
