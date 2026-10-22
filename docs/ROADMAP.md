# Ghost Reveal and native CSS scroll-driven animations

*Written for v0.2.0, October 2026. Support data was fetched on 2026-10-21. Sources are linked, and each claim is marked as verified by us or taken from a source.*

## Where the platform is

CSS scroll-driven animations (`animation-timeline: view()`, `animation-range`, and the JS `ScrollTimeline` / `ViewTimeline` interfaces) let the browser map scroll position to animation progress without any script per frame.

| Engine | Status (source) | What we observed in this repo's test browsers |
| --- | --- | --- |
| Chrome / Edge | Supported since 115 ([MDN BCD][bcd], [caniuse][ciu]) | Chromium 155: `CSS.supports('animation-timeline: view()')` is `true`, `typeof ViewTimeline` is `'function'`, and `element.animate(k, { timeline, rangeEnd })` works |
| Safari (macOS and iOS) | Supported since 26.0 ([MDN BCD][bcd], [caniuse][ciu]) | Playwright WebKit 27.2: same results as Chromium |
| Firefox | **Not in a stable release yet.** MDN BCD lists **159** (in beta, scheduled for 2026-10-27). caniuse currently lists **161**. Stable is 158 | Playwright Firefox 157: `CSS.supports(...)` is `false` and `ViewTimeline` is `undefined` |

caniuse puts global support at about 88%. The WAAPI `timeline` / `rangeStart` / `rangeEnd` options have the same versions in MDN BCD (Chrome 115, Safari 26, Firefox 159). Until Firefox ships and its older versions age out, an IntersectionObserver engine stays necessary for "play once when it enters" reveals.

[bcd]: https://github.com/mdn/browser-compat-data (css/properties/animation-timeline.json, api/ViewTimeline.json)
[ciu]: https://caniuse.com/mdn-css_properties_animation-timeline_view

## Why not just switch to CSS?

The **trigger** model (a time-based animation that plays once when the element enters) is what AOS users want, and scroll-*driven* animations don't provide it. They *scrub*: progress is a function of position.

The trigger model now has a native counterpart too: **CSS scroll-triggered animations** (`timeline-trigger` + `animation-trigger`, spec: CSS Animation Triggers). They shipped in **Chrome/Edge 146** (stable 2026-03-10), according to the [Chrome 146 release notes][c146] and the [web-features explorer][wf]. They aren't supported in Firefox or Safari per the same sources. Verified here: Chromium 155 reports `CSS.supports('animation-trigger: --t play-forwards')` as `true` and exposes `TimelineTrigger` / `AnimationTrigger`. WebKit 27.2 and Firefox 157 report `false` / `undefined`.

So for "play once on enter" there's a native path in only one engine today. Ghost Reveal keeps IntersectionObserver as the trigger engine: one shared observer per config, which is already off the scroll path. It keeps the animation definitions engine-neutral so a native trigger can be swapped in later.

[c146]: https://developer.chrome.com/release-notes/146
[wf]: https://web-platform-dx.github.io/web-features-explorer/features/scroll-triggered-animations/

## Design

1. **Animations are data.** `keyframes(name, distance, blur)` is a pure function (it's exported and has no DOM access) that returns `[from, {}]` using only `opacity`, `transform` and `filter`. The same objects can drive:
   - `element.animate(k, { duration, easing })`: today's time-based engine (IntersectionObserver trigger)
   - `element.animate(k, { timeline: new ViewTimeline({ subject }), rangeEnd })`: the scrub engine, shipped as experimental
   - a generated CSS rule, e.g. `@keyframes gr-fade-up { from { opacity:0; filter:blur(4px); transform:translate(0px,16px) } }` with `animation-timeline: view()`, for a future zero-JS stylesheet build
2. **Feature detection, not UA sniffing.** The core checks `typeof ViewTimeline == 'function'` once per `init()`. A CSS engine would check `CSS.supports('animation-timeline: view()')`.
3. **Progressive enhancement stays the invariant.** Nothing is hidden by CSS, so if JS or the feature is missing, content is visible.

## What ships in 0.2 (experimental)

`data-reveal-scrub` (or the `scrub: true` option) attaches the element's keyframes to a `ViewTimeline` with `fill: backwards` and `rangeEnd: 'cover 40%'`. The range starts at `cover 0%`, when the element's top edge enters. The easing defaults to `ease-out` because the scroll itself provides the pacing. The element is not observed by IntersectionObserver and fires no events. Where `ViewTimeline` is missing (Firefox today), it falls back to the normal reveal.

Cost: about 100 B gzip of the 1,974 B core. Tests: Chromium and WebKit check that opacity follows scroll position and that `destroy()` cancels it. Firefox checks the fallback.

Known limits: one fixed range (no per-element `animation-range` attribute yet), the nearest scroll container is the one the timeline tracks, and it's untested on real iOS devices.

## Next steps (candidates, not promises)

- `data-reveal-range="entry 10% cover 50%"` for per-element ranges (a few bytes, once the scrub API settles).
- An optional generated `ghost-reveal.css` (not in the core) that maps `[data-reveal="fade-up"][data-reveal-scrub]` to `@keyframes` + `animation-timeline: view()` inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. Scrubbed reveals would then need no JS at all.
- Use native scroll-triggered animations (`TimelineTrigger` from JS, or `timeline-trigger` / `animation-trigger` from CSS) for the "play once" trigger once they ship in at least two engines. Only Chromium has them today. The IntersectionObserver path would remain as the fallback when `CSS.supports('animation-trigger: --t play-forwards')` is false. We haven't measured whether it would save bytes, because both paths must ship while support is split.
- Revisit Firefox when 159+ reaches stable and re-run `npm run test:all` with a Playwright build that includes it.
