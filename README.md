# Ghost Reveal

Scroll reveals that feel expensive and weigh nothing. Ghost Reveal is a tiny, zero-dependency, **AOS-compatible** scroll-reveal library. Out of the box it does a blur-to-sharp fade on an expo-out curve.

- **~2 KB** min+gzip (core ESM: 1,974 bytes, `gzip -9`). No dependencies and **no CSS file**
- **Premium by default:** 16px rise, 4px blur → sharp, 700ms `cubic-bezier(.16,1,.3,1)`. It only animates `opacity`, `transform` and `filter`, so there's no layout shift
- **No sideways scrollbar:** `slide-left`, `fade-left` and `zoom-out` never widen the page, even on full-width elements
- **Framework-friendly:** SSR-safe import, and the DOM is watched by default, so SPA route changes and lazy content just work
- **Accessible:** honors `prefers-reduced-motion` live (content is shown instantly, with no motion). Progressive enhancement: if JS is off or the script fails, everything stays visible
- **Drop-in for AOS:** `data-aos*` attributes, `AOS.init()`, `AOS.refresh()` and the AOS easing names all work
- **Ready for native scroll-driven animations:** animations are plain keyframe data, and there's an experimental `ViewTimeline` scrub mode
- ESM + UMD + CJS builds, TypeScript types, `llms.txt` for AI tools. MIT

Why another one? [AOS](https://github.com/michalsnik/aos) (last release Oct 2018) needs `aos.css` and lodash. [ScrollReveal](https://github.com/jlmakes/scrollreveal) (last release Mar 2021) is GPL-3.0 and uses scroll listeners. Neither is maintained.

## Quick start

```html
<script src="https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.umd.min.js" data-auto defer></script>

<h2 data-reveal>Hello</h2>
<img data-reveal="zoom-in" data-reveal-delay="150" src="…" alt="">
<ul data-reveal-stagger>
  <li data-reveal>One</li><li data-reveal>Two</li><li data-reveal>Three</li>
</ul>
```

That's the whole setup. A bare `data-reveal` uses the default blur-fade (`fade-up`).

```bash
npm i ghost-reveal
```

## Recipes

Every recipe is "call `init()` once on the client". Because `observe: true` is the default, content rendered later (route changes, infinite lists, CMS widgets) is picked up automatically. You don't need a `refresh()` per route.

> **Verified:** the React (19, StrictMode, with a simulated route change), Vue 3.5 and Svelte 5 recipes ran in headless Chromium, and React `renderToString` ran in Node, during v0.2 development (those throwaway test apps aren't part of this repo). The Next.js, Nuxt, SvelteKit, Astro, Angular and WordPress recipes follow those frameworks' documented APIs but **haven't been run**.

**Plain HTML / CDN (no build)**
```html
<script src="https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.umd.min.js" data-auto defer></script>
<!-- or, with options: -->
<script src="https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.umd.min.js"></script>
<script>GhostReveal.init({ duration: 900, blur: 8 });</script> <!-- at the end of <body> -->
<!-- or ESM: -->
<script type="module">
  import { init } from 'https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.esm.min.js';
  init();
</script>
```

**Vite / any ESM bundler**
```js
import 'ghost-reveal/auto';          // zero config, or:
import { init } from 'ghost-reveal';
init({ blur: 6 });
```

**React** (call it once near the root)
```jsx
import { useEffect } from 'react';
import { init } from 'ghost-reveal';

export function GhostReveal(props) {
  useEffect(() => {
    const reveal = init(props);
    return () => reveal.destroy();
  }, []);
  return null;
}
// <GhostReveal /> once in your root component. Then <h2 data-reveal>…</h2> anywhere.
```
In JSX a bare `data-reveal` renders as `data-reveal="true"`. Ghost Reveal treats that as the default animation.

**Next.js (App Router)**
```tsx
// app/ghost-reveal.tsx
'use client';
import { useEffect } from 'react';
import { init, type GhostRevealOptions } from 'ghost-reveal';

export default function GhostReveal(props: GhostRevealOptions) {
  useEffect(() => {
    const reveal = init(props);
    return () => reveal.destroy();
  }, []);
  return null;
}

// app/layout.tsx (a Server Component, unchanged otherwise)
import GhostReveal from './ghost-reveal';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GhostReveal />
      </body>
    </html>
  );
}
```
Server Components can render `data-reveal` attributes freely. Only the tiny client component above runs JS. Client-side navigations are picked up by the DOM observer.

**Vue 3 (Vite)**
```js
// main.js
import { createApp } from 'vue';
import { init } from 'ghost-reveal';
import App from './App.vue';

createApp(App).mount('#app');
init(); // vue-router navigations are picked up automatically
```

**Nuxt 3/4**
```ts
// plugins/ghost-reveal.client.ts
import { init } from 'ghost-reveal';
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => init());
});
```

**Svelte 5 / SvelteKit**
```svelte
<!-- src/routes/+layout.svelte (SvelteKit) or App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { init } from 'ghost-reveal';
  let { children } = $props();
  onMount(() => init().destroy); // the returned function runs on unmount
</script>

{@render children()}
```

**Astro** (works with `<ClientRouter />` view transitions too)
```astro
---
// src/layouts/Layout.astro
---
<html lang="en">
  <body>
    <slot />
    <script>
      import 'ghost-reveal/auto';
    </script>
  </body>
</html>
```

**Angular (17+)**
```ts
import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { init } from 'ghost-reveal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<h1 data-reveal>Hello</h1><router-outlet />`,
})
export class AppComponent {
  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reveal = init(); // browser only; with SSR, afterNextRender never runs on the server
      destroyRef.onDestroy(() => reveal.destroy());
    });
  }
}
```
For bound values, use attribute bindings: `[attr.data-reveal-delay]="i * 80"`.

**WordPress / no build step**
```php
// functions.php (theme or a small plugin)
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_script('ghost-reveal', 'https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.umd.min.js', [], '0.2.0', true);
  // Also reveal blocks that have the class "reveal" (Block → Advanced → Additional CSS class)
  wp_add_inline_script('ghost-reveal', "GhostReveal.init({ selector: '[data-reveal],[data-aos],.reveal' });");
});
```
Elements matched only by class use the default animation. Use a Custom HTML block for full `data-reveal-*` control.

## Animations

| Family | Names | What it does |
| --- | --- | --- |
| fade | `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right` | opacity + blur + travel of `distance` |
| zoom | `zoom-in`, `zoom-out`, plus `zoom-in-up`, `zoom-out-left`, … | scale .6 (in) / 1.2 (out) + opacity + blur, optional direction |
| slide | `slide-up`, `slide-down`, `slide-left`, `slide-right` | travel 100% of its own size, with a fade |
| flip | `flip-up`, `flip-down`, `flip-left`, `flip-right` | `perspective(2500px)` rotate 100° + opacity + blur |

Direction names follow AOS: `fade-up` moves **up** into place (it starts below).

**Tuning tips.** Big hero headings look great with `data-reveal-blur="10" data-reveal-duration="1200" data-reveal-distance="28"`. Use `data-reveal-blur="0"` for a crisp fade, for example on very large images on low-end mobiles, since filter is the most expensive of the three properties. Stagger between 60 and 100ms.

## Attributes

Each attribute has a `data-reveal-*` form and a `data-aos-*` alias (except `data-reveal-stagger`, which has no `data-aos-*` form). `data-reveal-*` wins if both are set. The website's `/docs` page has the full reference with defaults.

| Attribute | Example | Meaning |
| --- | --- | --- |
| `data-reveal` / `data-aos` | `fade-up` | Animation name (empty or `"true"` means `options.animation`) |
| `data-reveal-duration` | `900` | ms |
| `data-reveal-delay` | `150` | ms |
| `data-reveal-easing` | `ease-out` | Any CSS easing, or a registered name |
| `data-reveal-distance` | `40` | px of travel for fade/zoom directions |
| `data-reveal-blur` | `0`, `10` | px of start blur |
| `data-reveal-offset` | `120` | Trigger line, px above the viewport bottom |
| `data-reveal-once` | `false` | Re-reveal every time it scrolls into view |
| `data-reveal-anchor-placement` | `center-bottom` | See below |
| `data-reveal-scrub` | *(no value)* | Experimental: scroll-linked via `ViewTimeline` (see below) |
| `data-reveal-stagger` (on a **parent**) | `100`, or empty for 80 | Delay step between siblings revealed together |

**Stagger** counts only the siblings that are revealed **together**, so in a long grid each new row starts right away instead of waiting `index × step`.

**Anchor placement** (`<element edge>-<window edge>`): `top-bottom` (default), `center-bottom`, `bottom-bottom`, `top-center`, `center-center`, `bottom-center`. `*-top` window placements fall back to `bottom`.

## Options

```js
import { init } from 'ghost-reveal';
const reveal = init({ duration: 900, once: false });
```

| Option | Default | Description |
| --- | --- | --- |
| `selector` | `'[data-reveal],[data-aos]'` | Elements to manage |
| `animation` | `'fade-up'` | Used when the attribute is empty |
| `duration` | `700` | ms |
| `delay` | `0` | ms |
| `easing` | `'cubic-bezier(.16,1,.3,1)'` | Expo-out. Any CSS easing or registered name |
| `distance` | `16` | px of travel for fade/zoom directions |
| `blur` | `4` | px of start blur, `0` to disable |
| `offset` | `60` | px above the viewport bottom where reveals trigger (AOS: 120) |
| `rootMargin` | none | Raw IntersectionObserver `rootMargin`. Overrides `offset` |
| `anchorPlacement` | `'top-bottom'` | Default anchor placement |
| `once` | `true` | Reveal once. **AOS default is `false`** |
| `initial` | `false` | Also animate elements already on screen at init (otherwise they're shown as-is) |
| `observe` | `true` | Watch the DOM for added/removed elements. `false` = call `refresh()` yourself |
| `scrub` | `false` | Experimental, see below |
| `disable` | `false` | `true`, `'mobile'` (< 768px), or `() => boolean`. Re-checked on `refresh()` |

`import { defaults } from 'ghost-reveal'` gives you the mutable global defaults.

### Instance API and events

```js
const reveal = init();
reveal.refresh(); // pick up new elements, drop removed ones, re-read every element's attributes
reveal.destroy(); // disconnect observers + listeners, cancel animations, everything visible again

document.addEventListener('reveal:in', (e) => console.log('revealed', e.target));
```

`reveal:in` fires (bubbling, on the element) when an element is revealed, including elements already on screen at init. It's dispatched in a microtask, so a listener added right after `init()` still catches it. `reveal:out` fires when a `once: false` element resets.

`keyframes(name, distance?, blur?)` returns the `[from, to]` keyframes of any animation as plain data. It's handy for your own `element.animate()` calls or for generating CSS.

## How it works (and why it looks good)

- **Hidden state** is a held WAAPI animation (`opacity: 0`). There are no classes and no inline styles. If JS never runs, nothing is ever hidden. While an element waits it isn't moved, so IntersectionObserver sees its real position.
- **The reveal** is one `element.animate()` from the keyframe data to your element's own styles (`fill: backwards`), so nothing lingers afterwards. The default curve is expo-out: the element covers most of the distance in the first ~150ms and then glides, which reads as fast and smooth at the same time. Travel is small (16px) and the blur is subtle (4px), in line with current product-site motion.
- **Above the fold:** elements on screen at the first scan are shown immediately with no animation, so there's no flash and no CLS. Use `initial: true` to animate them. Elements added later animate even when on screen, which is right for route transitions.
- **No horizontal overflow:** when a reveal's start state would widen the page (`scrollWidth` grows), the start transform is shifted back by exactly that amount. Elements with room keep their full travel. Pages that already clip (`overflow-x: hidden|clip` on `html`/`body`) keep the classic slide-in-from-off-screen look. RTL pages aren't handled specially.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, nothing is hidden or animated. If the setting changes while the page is open, Ghost Reveal follows it live.
- **Cheap DOM watching:** one MutationObserver (`childList`, `subtree`) that only scans added subtrees and releases removed elements. It never re-scans the whole document.
- **IntersectionObserver:** one shared observer per trigger configuration, plus one viewport observer that reveals elements that can never cross the trigger line (end of page) and resets `once: false` elements only when they're fully off-screen.

## Experimental: native scroll-driven scrub

```html
<div data-reveal="fade-up" data-reveal-scrub>…</div>
```

Where `ViewTimeline` exists, the element's keyframes are attached to a native view timeline (`rangeEnd: 'cover 40%'`). Progress then follows scroll position in both directions with no JS per frame. Elsewhere it falls back to the normal reveal.

Support, per MDN browser-compat-data fetched 2026-10-21: Chrome/Edge 115+ and Safari 26+. Firefox has no stable release with it yet (BCD lists 159, currently in beta, and caniuse lists 161). Native *scroll-triggered* animations (`animation-trigger`) exist only in Chrome/Edge 146+, so the IntersectionObserver engine stays. See [docs/ROADMAP.md](docs/ROADMAP.md) for the full native-CSS strategy.

## Migrating from AOS

1. Remove `aos.css` and `aos.js` and add the UMD build. It defines `window.AOS` (if free) with `init`, `refresh`, `refreshHard` and `destroy`, plus the AOS easing names:
   ```html
   <script src="https://unpkg.com/ghost-reveal@0.2/dist/ghost-reveal.umd.min.js"></script>
   <script>AOS.init();</script>
   ```
2. Differences to know:
   - **It looks different on purpose:** blur-fade, expo-out, 700ms, 16px, and slides fade too. For an AOS-like look use `AOS.init({ blur: 0, duration: 400, easing: 'ease', distance: 100, offset: 120, once: false })`.
   - `once` defaults to **true** (AOS: `false`). `offset` defaults to **60** (AOS: 120).
   - Elements on screen at load are shown, not animated (AOS animates them). Use `initial: true`.
   - No `aos-init`/`aos-animate` classes. Use the `reveal:in` / `reveal:out` events (they bubble, so `document` listeners work).
   - Not supported: `mirror`, `startEvent`, `throttleDelay`, `debounceDelay`, `useClassNames`, `animatedClassName`, `data-aos-anchor`, `data-aos-id`, `disable: 'phone' | 'tablet'` (use `'mobile'` or a function), and `*-top` window anchor placements.
   - `once: false` resets instantly when fully off-screen. There's no reverse transition (try `data-reveal-scrub` for reversible motion).
3. ESM users who want AOS easing names (310 B gzip, kept out of the core):
   ```js
   import { init, easings } from 'ghost-reveal';
   import aosEasings from 'ghost-reveal/aos-easings';
   Object.assign(easings, aosEasings);
   init();
   ```
   An unknown easing name falls back to `linear`.

## Builds

| File | Format | min+gzip (`gzip -9`) |
| --- | --- | --- |
| `dist/ghost-reveal.esm.min.js` | ESM core, minified | 1,974 B |
| `dist/ghost-reveal.auto.esm.min.js` | ESM auto-init (`ghost-reveal/auto`) | 1,959 B |
| `dist/ghost-reveal.umd.min.js` (+ `.cjs` for `require`) | UMD, `window.GhostReveal` + `AOS` alias + AOS easings | 2,710 B |
| `dist/aos-easings.esm.js` | ESM add-on | 310 B |
| `dist/ghost-reveal.esm.js` | ESM, readable (bundlers minify it) | 2,562 B (gzip only) |

`package.json` `exports`: `ghost-reveal` (ESM / `require` → UMD), `ghost-reveal/auto`, `ghost-reveal/aos-easings`.

The npm package is this repository: `dist/`, `src/`, `index.d.ts`, `auto.d.ts`, `aos-easings.d.ts`, `README.md`, `LICENSE` and `llms.txt`. The website is a separate repository, `ghost-reveal-site`, checked out next to this one.

## Browser support

The library needs IntersectionObserver, the Web Animations API with implicit to-keyframes, `queueMicrotask`, `MediaQueryList.addEventListener`, `??` and `?.`. Going by MDN compat data, that's roughly Chrome/Edge 84+, Firefox 75+ and Safari 14+. Those old versions weren't tested. In an older browser `init()` throws before hiding anything, so content stays visible. The suite passes in Chromium 155, Firefox 157 and WebKit 27.2 (Playwright builds). `scrub` needs `ViewTimeline` and falls back otherwise.

## Development

```bash
npm install
npm run build        # esbuild -> dist/, prints sizes
npm test             # Chromium (system Chrome; set CHROME_PATH if needed)
npm run test:all     # Chromium + Firefox + WebKit (npx playwright-core install firefox webkit)
npm run test:types   # tsc against index.d.ts / auto.d.ts
```

The website (Home, Docs, Playground and Demo) is live at [ghostreveal.com](https://www.ghostreveal.com/). Its source is the sibling repository `ghost-reveal-site`. Check both out next to each other and run `npm run dev` there. That server watches this repo's `src/`, `README.md`, `index.d.ts`, and `package.json`, and rebuilds the site when they change. The site's own `site/llms.txt` is what it serves at `/llms.txt`.

Working on this repo with an AI agent? Start with [AGENTS.md](AGENTS.md) and [docs/PROJECT-GOALS.md](docs/PROJECT-GOALS.md); Cursor picks up the project rules and skills in `.cursor/`.

On macOS: `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test`. `TEST_BROWSER=firefox|webkit` selects another engine.

## Support

Ghost Reveal is free under MIT. If it helps, you can [support the project](https://www.buymeacoffee.com/byronj).

## License

MIT © Byron Johnson
