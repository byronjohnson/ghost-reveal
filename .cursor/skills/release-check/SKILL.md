---
name: release-check
description: Pre-release / end-of-task verification for Ghost Reveal (size budget, all-engine tests, types, docs drift, Lighthouse, package contents, tarball) that never publishes, pushes or deploys. Use before reporting a change as done or preparing a version.
---

# Release check (verification only)

**Never** run `npm publish`, `git push`, `vercel deploy`/`vercel --prod`, or log in to anything. Those need Byron's
explicit approval in the current conversation. This skill only verifies and reports.

v0.2.0 is already published. This skill still does not publish, push, or deploy. A newer version needs Byron's explicit yes. Direct `npm publish` on his account asks for an OTP in his terminal. Do not ask him to paste it into chat. npm also has a public `0.0.0-stage` placeholder. It is not `latest`. Do not unpublish it, and do not `npm stage publish` 0.2.0 again.

1. **Servers:** library tests use their own port. Leave the site dev server on 8080 running. Free 8080 only when a Lighthouse run needs it, and only stop this project's `serve.mjs` / `dev.mjs`. Don't kill unrelated processes.
2. **Build + size:** `npm run build && npm run size`. Core `dist/ghost-reveal.esm.min.js` ≤ 2,048 B gzip -9. Compare with
   the last recorded sizes in `docs/PROJECT-GOALS.md` §7 / README `## Builds` / both `llms.txt` files. Update all of them if changed.
3. **Tests:** `npm run test:all` → every file passes in Chromium, Firefox and WebKit, 0 skipped. `npm run test:types`. Chromium uses system Chrome via `CHROME_PATH`. If Firefox or WebKit browsers are not installed, say they were not run. Don't report the suite green from Chromium alone.
4. **Docs drift:** in the sibling repo `ghost-reveal-site`, `npm run build:site` must succeed (it throws if types, runtime defaults, attributes, animations or README recipes disagree).
5. **Lighthouse** is a site-repo check. Run it from `ghost-reveal-site` against `site-dist/`. Target 99–100 every category (floor 95), CLS 0. The `llms.txt` audit fetches the site file, which the build copies from `site/llms.txt`. A bare URL does not count as a link. The library `llms.txt` is not that file.
6. **Package contents:** `npm pack --dry-run` lists only the `files` allowlist (`dist`, `src`, `*.d.ts`, `llms.txt`,
   `README.md`, `LICENSE`, `package.json`). `docs/`, `AGENTS.md`, `.cursor/`, `test/`, `scripts/` must not ship (Byron, 2026-10-21: no docs files in the npm package). The shipped `llms.txt` is the compact API reference.
7. **Hygiene:** grep for the previous project names listed in `docs/PROJECT-GOALS.md` §3: the only hit allowed is that
   name-history line;
   no leftover scratch files; versions consistent (`package.json`, banner in `src/index.js`, README and both `llms.txt` files, CDN `@0.2`).
8. **Archive (if asked):** from the parent folder,
   `tar --exclude=ghost-reveal/node_modules --exclude=ghost-reveal/.vercel --exclude=ghost-reveal/frames -czf ghost-reveal-v0.2.tar.gz ghost-reveal`
9. **Report:** sizes (before/after), tests per engine, Lighthouse scores, anything not verified. Ask Byron before any publish step. Do not switch the site's `file:../ghost-reveal` dependency or deploy the site as part of this check.
