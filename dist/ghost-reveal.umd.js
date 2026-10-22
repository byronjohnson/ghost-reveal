/*! ghost-reveal 0.2.0 MIT */
(function(g,f){typeof exports=="object"&&typeof module!="undefined"?module.exports=f():(g=typeof globalThis!="undefined"?globalThis:g||self,g.GhostReveal=f())})(this,function(){var __G = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/umd.js
  var umd_exports = {};
  __export(umd_exports, {
    default: () => umd_default
  });

  // src/index.js
  var SEL = "[data-reveal],[data-aos]";
  var DIRS = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };
  var easings = {};
  var defaults = {
    animation: "fade-up",
    duration: 700,
    delay: 0,
    easing: "cubic-bezier(.16,1,.3,1)",
    // expo-out: fast start, long soft landing
    distance: 16,
    blur: 4,
    offset: 60,
    once: true,
    observe: true
  };
  var keyframes = (name, distance = defaults.distance, blur = defaults.blur) => {
    const [fam, ...rest] = name.split("-");
    let x = 0, y = 0;
    rest.forEach((t2) => DIRS[t2] && ([x, y] = DIRS[t2]));
    const f = { opacity: 0 };
    const slide = fam == "slide";
    const u = slide ? "%" : "px";
    const m = slide ? 100 : distance;
    if (blur > 0) f.filter = `blur(${blur}px)`;
    if (fam == "flip") f.transform = `perspective(2500px) rotateX(${-y * 100}deg) rotateY(${-x * 100}deg)`;
    else if (fam != "fade" || x || y)
      f.transform = `translate(${x * m + u},${y * m + u})` + (fam == "zoom" ? ` scale(${rest[0] == "out" ? 1.2 : 0.6})` : "");
    return [f, {}];
  };
  function init(options) {
    const d = globalThis.document;
    if (!d) return { refresh() {
    }, destroy() {
    } };
    const o = { ...defaults, ...options };
    const sel = o.selector || SEL;
    const items = /* @__PURE__ */ new Map();
    const ios = /* @__PURE__ */ new Map();
    const de = d.documentElement;
    const dis = o.disable;
    const mq = matchMedia("(prefers-reduced-motion:reduce)");
    const VT = typeof ViewTimeline == "function" && ViewTimeline;
    let mo, ready, off;
    const fire = (s, t2) => (
      // async, so listeners added right after init() still see above-the-fold reveals
      queueMicrotask(() => s.el.dispatchEvent(new CustomEvent("reveal:" + t2, { bubbles: true })))
    );
    const g = (el, k) => el.getAttribute("data-reveal-" + k) ?? el.getAttribute("data-aos-" + k);
    const num = (el, k) => +(g(el, k) ?? o[k]);
    const flag = (el, k, v = g(el, k)) => v == null ? o[k] : v != "false";
    const hide = (s) => {
      s.h = s.el.animate({ opacity: [0, 0] }, { fill: "forwards" });
      s.in = 0;
    };
    const show = (s, n, tl) => {
      const el = s.el;
      const ez = g(el, "easing") || (tl ? "ease-out" : o.easing);
      const st = el.parentElement?.getAttribute("data-reveal-stagger");
      const nm = el.dataset.reveal || el.dataset.aos;
      const k = keyframes(nm && nm != "true" ? nm : o.animation, num(el, "distance"), num(el, "blur"));
      const t2 = {
        duration: num(el, "duration"),
        delay: num(el, "delay") + n * (st == "" ? 80 : +st || 0),
        easing: easings[ez] || ez,
        fill: "backwards",
        timeline: tl,
        // undefined -> document timeline
        rangeEnd: tl && "cover 40%"
        // range starts at 'cover 0%' (= entry 0%) by default
      };
      const run = () => {
        try {
          return el.animate(k, t2);
        } catch (_) {
          delete t2.easing;
          return el.animate(k, t2);
        }
      };
      const w = k[0].transform && de.scrollWidth;
      s.r = run();
      const x = w && de.scrollWidth - w;
      if (x > 0 && !/h|cl/.test(getComputedStyle(de).overflowX + getComputedStyle(d.body).overflowX)) {
        k[0].transform = `translateX(${-x}px) ` + k[0].transform;
        s.r.cancel();
        de.scrollWidth;
        s.r = run();
      }
      s.h?.cancel();
      s.in = 1;
      tl || fire(s, "in");
    };
    const each = (f) => (es) => {
      const b = /* @__PURE__ */ new Map();
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
      show(s, n);
      if (flag(s.el, "once")) s.io.unobserve(s.el), vp.unobserve(s.el);
    };
    const onIn = each((s, v, e, b) => v && reveal(s, b));
    const vp = new IntersectionObserver(
      each(
        (s, v, e, b) => v ? e.intersectionRatio > 0.99 && reveal(s, b) : s.in && !flag(s.el, "once") && (s.r?.cancel(), hide(s), fire(s, "out"))
      ),
      { threshold: [0, 1] }
    );
    const setup = (el) => {
      let s = items.get(el);
      if (s?.t) return;
      const [ep, wp] = (g(el, "anchor-placement") || o.anchorPlacement || "").split("-");
      const of = g(el, "offset");
      const rm = wp == "center" ? "0px 0px -50%" : of == null && o.rootMargin || `0px 0px ${-(of ?? o.offset)}px`;
      const r = el.getBoundingClientRect();
      let th = { center: 0.5, bottom: 1 }[ep] || 0;
      if (r.height * th > innerHeight * 0.9) th = 0;
      const key = rm + th;
      const io = ios.get(key) || ios.set(key, new IntersectionObserver(onIn, { rootMargin: rm, threshold: th })).get(key);
      if (s) {
        if (s.io != io) s.io.unobserve(el), s.in && flag(el, "once") || io.observe(el), s.io = io;
        return;
      }
      items.set(el, s = { el, io });
      if (VT && flag(el, "scrub")) return show(s, 0, s.t = new ViewTimeline({ subject: el }));
      if (!o.initial && !ready && r.top < innerHeight && r.bottom > 0) {
        s.in = 1;
        fire(s, "in");
      } else hide(s);
      if (!(s.in && flag(el, "once"))) io.observe(el), vp.observe(el);
    };
    const remove = (s) => {
      s.h?.cancel();
      s.r?.cancel();
      s.io.unobserve(s.el);
      vp.unobserve(s.el);
      items.delete(s.el);
    };
    const prune = () => items.forEach((s) => (off || !s.el.isConnected || !s.el.matches(sel)) && remove(s));
    const refresh2 = () => {
      off = (typeof dis == "function" ? dis() : dis == "mobile" ? innerWidth < 768 : dis) || mq.matches;
      prune();
      off || d.querySelectorAll(sel).forEach(setup);
    };
    const onMq = () => {
      ready = 0;
      refresh2();
      ready = 1;
    };
    const destroy2 = () => {
      items.forEach(remove);
      ios.forEach((i) => i.disconnect());
      ios.clear();
      vp.disconnect();
      mo?.disconnect();
      mq.removeEventListener("change", onMq);
    };
    onMq();
    mq.addEventListener("change", onMq);
    if (o.observe)
      (mo = new MutationObserver((ms) => {
        prune();
        off || ms.forEach(
          (m) => m.addedNodes.forEach(
            (n) => n.querySelectorAll && [n, ...n.querySelectorAll(sel)].forEach((e) => e.matches(sel) && !items.has(e) && setup(e))
          )
        );
      })).observe(de, { childList: true, subtree: true });
    return { refresh: refresh2, destroy: destroy2 };
  }

  // src/aos-easings.js
  var t = {
    "in-back": ".6,-.28,.735,.045",
    "out-back": ".175,.885,.32,1.275",
    "in-out-back": ".68,-.55,.265,1.55",
    "in-sine": ".47,0,.745,.715",
    "out-sine": ".39,.575,.565,1",
    "in-out-sine": ".445,.05,.55,.95",
    "in-quad": ".55,.085,.68,.53",
    "out-quad": ".25,.46,.45,.94",
    "in-out-quad": ".455,.03,.515,.955",
    "in-cubic": ".55,.055,.675,.19",
    "out-cubic": ".215,.61,.355,1",
    "in-out-cubic": ".645,.045,.355,1",
    "in-quart": ".895,.03,.685,.22",
    "out-quart": ".165,.84,.44,1",
    "in-out-quart": ".77,0,.175,1"
  };
  var aosEasings = {};
  for (const k in t) aosEasings["ease-" + k] = `cubic-bezier(${t[k]})`;
  var aos_easings_default = aosEasings;

  // src/umd.js
  Object.assign(easings, aos_easings_default);
  var inst;
  var init2 = (o) => (inst && inst.destroy(), inst = init(o));
  var refresh = () => inst && inst.refresh();
  var destroy = () => {
    inst && inst.destroy();
    inst = 0;
  };
  var api = { init: init2, refresh, refreshHard: refresh, destroy, create: init, defaults, easings, keyframes };
  if (typeof window != "undefined") {
    window.AOS = window.AOS || api;
    const s = document.currentScript;
    if (s && s.hasAttribute("data-auto"))
      document.readyState == "loading" ? document.addEventListener("DOMContentLoaded", () => init2()) : init2();
  }
  var umd_default = api;
  return __toCommonJS(umd_exports);
})();
;return __G.default})