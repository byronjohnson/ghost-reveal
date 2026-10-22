/*! ghost-reveal 0.2.0 MIT (c) Byron Johnson */
// Tiny, zero-dependency scroll reveal. Web Animations API + IntersectionObserver.
// No CSS file: the waiting state is a held WAAPI animation (opacity 0), so if JS
// never runs, nothing is ever hidden. Importing this module never touches the DOM (SSR-safe).

const SEL = '[data-reveal],[data-aos]';
const DIRS = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };

/** Named easings: name -> CSS easing. Empty in core; add AOS names via `ghost-reveal/aos-easings`. */
export const easings = {};

// Mutable global defaults. Unlisted options default to falsy:
// selector, rootMargin, anchorPlacement, initial, scrub, disable.
export const defaults = {
  animation: 'fade-up',
  duration: 700,
  delay: 0,
  easing: 'cubic-bezier(.16,1,.3,1)', // expo-out: fast start, long soft landing
  distance: 16,
  blur: 4,
  offset: 60,
  once: true,
  observe: true,
};

/**
 * Animation name -> [from, to] keyframes. Pure data, no DOM access, so the same
 * definition can drive element.animate(), a ViewTimeline, or a generated CSS @keyframes rule.
 * Only transform / opacity / filter are ever animated (compositor-friendly, no layout).
 */
export const keyframes = (name, distance = defaults.distance, blur = defaults.blur) => {
  const [fam, ...rest] = name.split('-');
  let x = 0, y = 0;
  rest.forEach((t) => DIRS[t] && ([x, y] = DIRS[t]));
  const f = { opacity: 0 }; // every family fades (AOS slides don't), so a clamped slide never pops
  const slide = fam == 'slide';
  const u = slide ? '%' : 'px';
  const m = slide ? 100 : distance;
  if (blur > 0) f.filter = `blur(${blur}px)`;
  if (fam == 'flip') f.transform = `perspective(2500px) rotateX(${-y * 100}deg) rotateY(${-x * 100}deg)`;
  else if (fam != 'fade' || x || y)
    f.transform = `translate(${x * m + u},${y * m + u})` + (fam == 'zoom' ? ` scale(${rest[0] == 'out' ? 1.2 : 0.6})` : '');
  return [f, {}];
};

export function init(options) {
  const d = globalThis.document;
  if (!d) return { refresh() {}, destroy() {} }; // server / non-DOM: harmless no-op
  const o = { ...defaults, ...options };
  const sel = o.selector || SEL;
  const items = new Map();
  const ios = new Map();
  const de = d.documentElement;
  const dis = o.disable;
  const mq = matchMedia('(prefers-reduced-motion:reduce)');
  const VT = typeof ViewTimeline == 'function' && ViewTimeline;
  let mo, ready, off;

  const fire = (s, t) =>
    // async, so listeners added right after init() still see above-the-fold reveals
    queueMicrotask(() => s.el.dispatchEvent(new CustomEvent('reveal:' + t, { bubbles: true })));
  const g = (el, k) => el.getAttribute('data-reveal-' + k) ?? el.getAttribute('data-aos-' + k);
  const num = (el, k) => +(g(el, k) ?? o[k]);
  const flag = (el, k, v = g(el, k)) => (v == null ? o[k] : v != 'false');

  const hide = (s) => {
    s.h = s.el.animate({ opacity: [0, 0] }, { fill: 'forwards' });
    s.in = 0;
  };

  // Everything is read from attributes here, at reveal time, so refresh() / attribute edits always apply.
  const show = (s, n, tl) => {
    const el = s.el;
    const ez = g(el, 'easing') || (tl ? 'ease-out' : o.easing); // scrubbed: the scroll itself is the easing
    const st = el.parentElement?.getAttribute('data-reveal-stagger');
    const nm = el.dataset.reveal || el.dataset.aos; // JSX renders a bare data-reveal as "true"
    const k = keyframes(nm && nm != 'true' ? nm : o.animation, num(el, 'distance'), num(el, 'blur'));
    const t = {
      duration: num(el, 'duration'),
      delay: num(el, 'delay') + n * (st == '' ? 80 : +st || 0),
      easing: easings[ez] || ez,
      fill: 'backwards',
      timeline: tl, // undefined -> document timeline
      rangeEnd: tl && 'cover 40%', // range starts at 'cover 0%' (= entry 0%) by default
    };
    const run = () => {
      try {
        return el.animate(k, t);
      } catch (_) {
        delete t.easing; // invalid easing string -> linear
        return el.animate(k, t);
      }
    };
    // Never let the "from" state widen the page (sideways scrollbar / pan on mobile):
    // shift it back by exactly the overflow it adds, unless the page already clips overflow-x.
    const w = k[0].transform && de.scrollWidth;
    s.r = run();
    const x = w && de.scrollWidth - w;
    if (x > 0 && !/h|cl/.test(getComputedStyle(de).overflowX + getComputedStyle(d.body).overflowX)) {
      k[0].transform = `translateX(${-x}px) ` + k[0].transform;
      s.r.cancel();
      de.scrollWidth; // flush: WebKit otherwise keeps reporting the stale width to the next element
      s.r = run();
    }
    s.h?.cancel();
    s.in = 1;
    tl || fire(s, 'in');
  };

  // IO callback wrapper; b counts reveals per parent within one batch (for stagger)
  const each = (f) => (es) => {
    const b = new Map();
    es.forEach((e) => {
      const s = items.get(e.target);
      s && f(s, e.isIntersecting, e, b);
    });
  };

  const reveal = (s, b) => {
    if (s.in) return;
    const p = s.el.parentElement;
    const n = b.get(p) | 0;
    b.set(p, n + 1);
    show(s, n); // stagger counts only siblings revealed together, so late rows don't wait
    if (flag(s.el, 'once')) s.io.unobserve(s.el), vp.unobserve(s.el);
  };

  const onIn = each((s, v, e, b) => v && reveal(s, b));

  // Viewport observer (rootMargin 0, thresholds 0 and 1) for every element:
  // - fully visible -> reveal even if it can never cross the offset line (e.g. end of page)
  // - fully off-screen -> reset once:false elements, so the snap back is never seen
  const vp = new IntersectionObserver(
    each((s, v, e, b) =>
      v
        ? e.intersectionRatio > 0.99 && reveal(s, b)
        : s.in && !flag(s.el, 'once') && (s.r?.cancel(), hide(s), fire(s, 'out'))
    ),
    { threshold: [0, 1] }
  );

  const setup = (el) => {
    let s = items.get(el);
    if (s?.t) return; // scrubbed: driven by its ViewTimeline, nothing to observe
    const [ep, wp] = (g(el, 'anchor-placement') || o.anchorPlacement || '').split('-');
    const of = g(el, 'offset');
    const rm =
      wp == 'center' ? '0px 0px -50%' : (of == null && o.rootMargin) || `0px 0px ${-(of ?? o.offset)}px`;
    const r = el.getBoundingClientRect();
    let th = { center: 0.5, bottom: 1 }[ep] || 0;
    if (r.height * th > innerHeight * 0.9) th = 0; // ratio could never be reached
    const key = rm + th;
    const io = ios.get(key) || ios.set(key, new IntersectionObserver(onIn, { rootMargin: rm, threshold: th })).get(key);
    if (s) {
      // refresh(): trigger settings changed -> move to the matching observer
      if (s.io != io) s.io.unobserve(el), (s.in && flag(el, 'once')) || io.observe(el), (s.io = io);
      return;
    }
    items.set(el, (s = { el, io }));
    if (VT && flag(el, 'scrub')) return show(s, 0, (s.t = new ViewTimeline({ subject: el })));
    if (!o.initial && !ready && r.top < innerHeight && r.bottom > 0) {
      s.in = 1; // on screen at first scan: just show, no animation (no flash of hidden content)
      fire(s, 'in');
    } else hide(s);
    if (!(s.in && flag(el, 'once'))) io.observe(el), vp.observe(el);
  };

  const remove = (s) => {
    s.h?.cancel();
    s.r?.cancel();
    s.io.unobserve(s.el);
    vp.unobserve(s.el);
    items.delete(s.el);
  };

  // release elements that were removed or lost their attribute (or everything, when off)
  const prune = () => items.forEach((s) => (off || !s.el.isConnected || !s.el.matches(sel)) && remove(s));

  const refresh = () => {
    off = (typeof dis == 'function' ? dis() : dis == 'mobile' ? innerWidth < 768 : dis) || mq.matches;
    prune();
    off || d.querySelectorAll(sel).forEach(setup);
  };

  // reduced-motion toggled live: everything shown at once, or set up again as on first load
  const onMq = () => {
    ready = 0;
    refresh();
    ready = 1;
  };

  const destroy = () => {
    items.forEach(remove);
    ios.forEach((i) => i.disconnect());
    ios.clear();
    vp.disconnect();
    mo?.disconnect();
    mq.removeEventListener('change', onMq);
  };

  // Call init() once the DOM is parsed (module scripts, `defer`, end of <body>, or after render).
  onMq(); // first scan; afterwards new elements animate even if on screen
  mq.addEventListener('change', onMq);
  // Cheap DOM watching: only added subtrees are scanned; removed elements are released.
  if (o.observe)
    (mo = new MutationObserver((ms) => {
      prune();
      off ||
        ms.forEach((m) =>
          m.addedNodes.forEach((n) =>
            n.querySelectorAll && [n, ...n.querySelectorAll(sel)].forEach((e) => e.matches(sel) && !items.has(e) && setup(e))
          )
        );
    })).observe(de, { childList: true, subtree: true });

  return { refresh, destroy };
}
