// Run: npm test  (playwright-core driving a local Chrome/Chromium, headless)
// Other engines: TEST_BROWSER=firefox npm test, TEST_BROWSER=webkit npm test, or npm run test:all
// (needs `npx playwright-core install firefox webkit`, plus `install-deps` on Linux).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
import { serve } from '../scripts/serve.mjs';

const name = process.env.TEST_BROWSER || 'chromium';
const exe =
  name == 'chromium'
    ? process.env.CHROME_PATH || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
    : undefined; // firefox/webkit: Playwright's own builds
let server, browser, base;

before(async () => {
  server = await serve(0);
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await { chromium, firefox, webkit }[name].launch({ executablePath: exe, headless: true });
  console.log(`# ${name} ${browser.version()}`);
});
after(async () => {
  await browser?.close();
  server?.close();
});

const open = async (query = '', ctxOpts = {}, path = '/test/fixture.html') => {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/does-not-exist|404|Failed to load/i.test(m.text()) && errors.push(m.text()));
  await page.goto(base + path + query);
  if (ctxOpts.javaScriptEnabled !== false) await page.waitForFunction(() => window.__ready);
  return { page, ctx, errors };
};
const opacity = (page, sel) => page.$eval(sel, (el) => +getComputedStyle(el).opacity);
const anims = (page, sel) => page.$eval(sel, (el) => el.getAnimations().length);
const frames = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const scrollTo = async (page, sel) => {
  await page.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(150); // let IO fire
};
const settle = (page, sel) => page.$eval(sel, (el) => Promise.all(el.getAnimations().map((a) => a.finished)));
const firstKf = (page, sel) => page.$eval(sel, (el) => el.getAnimations()[0]?.effect.getKeyframes()[0]);
const timing = (page, sel) => page.$eval(sel, (el) => el.getAnimations()[0]?.effect.getTiming());

// ---------------------------------------------------------------- v0.1 behaviour

test('hides only elements below the fold; above-the-fold stays visible without animation', async () => {
  const { page, ctx, errors } = await open();
  assert.equal(await opacity(page, '#top'), 1);
  assert.equal(await anims(page, '#top'), 0);
  assert.equal(await opacity(page, '#below'), 0);
  assert.equal(await opacity(page, '#aos'), 0);
  assert.ok((await page.evaluate(() => __events)).includes('reveal:in#top'));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('reveals on scroll (data-reveal and data-aos), fires reveal:in, ends fully visible', async () => {
  const { page, ctx, errors } = await open();
  await scrollTo(page, '#below');
  assert.equal(await anims(page, '#below'), 1, 'reveal animation running');
  await settle(page, '#below');
  assert.equal(await opacity(page, '#below'), 1);
  assert.equal(await anims(page, '#below'), 0, 'no lingering animation/fill');
  await settle(page, '#aos');
  assert.equal(await opacity(page, '#aos'), 1);
  const ev = await page.evaluate(() => __events);
  assert.ok(ev.includes('reveal:in#below') && ev.includes('reveal:in#aos'));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('once (default) stays revealed; once:false re-hides off-screen and fires reveal:out', async () => {
  const { page, ctx } = await open();
  await scrollTo(page, '#below');
  await settle(page, '#below');
  await scrollTo(page, '#repeat');
  await settle(page, '#repeat');
  assert.equal(await opacity(page, '#repeat'), 1);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  assert.equal(await opacity(page, '#below'), 1, 'once element stays visible');
  assert.equal(await opacity(page, '#repeat'), 0, 'once:false element reset');
  await scrollTo(page, '#repeat');
  await settle(page, '#repeat');
  assert.equal(await opacity(page, '#repeat'), 1, 're-revealed');
  const ev = await page.evaluate(() => __events);
  assert.equal(ev.filter((e) => e === 'reveal:in#below').length, 1);
  assert.equal(ev.filter((e) => e === 'reveal:in#repeat').length, 2);
  assert.equal(ev.filter((e) => e === 'reveal:out#repeat').length, 1);
  await ctx.close();
});

test('stagger: siblings revealed together get incremental delays (empty attribute = 80ms)', async () => {
  const { page, ctx } = await open();
  await scrollTo(page, '#stagger');
  const delays = await page.$$eval('#stagger > *', (els) => els.map((el) => el.getAnimations()[0]?.effect.getTiming().delay));
  assert.deepEqual(delays, [0, 100, 200]);
  await scrollTo(page, '#stagger2');
  const d2 = await page.$$eval('#stagger2 > *', (els) => els.map((el) => el.getAnimations()[0]?.effect.getTiming().delay));
  assert.deepEqual(d2, [0, 80, 160]);
  await ctx.close();
});

test('prefers-reduced-motion: everything visible, no animations', async () => {
  const { page, ctx } = await open('', { reducedMotion: 'reduce' });
  for (const sel of ['#top', '#below', '#aos', '#repeat']) {
    assert.equal(await opacity(page, sel), 1, sel);
    assert.equal(await anims(page, sel), 0, sel);
  }
  await scrollTo(page, '#below');
  assert.equal(await anims(page, '#below'), 0);
  await ctx.close();
});

test('disable option: nothing hidden', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => (window.__inst = __mod.init({ disable: () => true })));
  assert.equal(await opacity(page, '#below'), 1);
  await ctx.close();
});

test('destroy() restores natural visible state (hidden and mid-animation)', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => (window.__inst = __mod.init({ duration: 5000 })));
  await scrollTo(page, '#below'); // mid-animation (data-reveal-duration=200 on #below; #def uses 5000)
  await scrollTo(page, '#def');
  assert.ok((await opacity(page, '#def')) < 1);
  assert.equal(await opacity(page, '#repeat'), 0); // still hidden
  await page.evaluate(() => __inst.destroy());
  for (const sel of ['#top', '#below', '#aos', '#def', '#repeat', '#stagger > :last-child']) {
    assert.equal(await opacity(page, sel), 1, sel);
    assert.equal(await anims(page, sel), 0, sel);
  }
  await scrollTo(page, '#repeat');
  assert.equal(await anims(page, '#repeat'), 0, 'observers gone');
  await ctx.close();
});

test('refresh() and observe:true pick up dynamically added elements', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => (window.__inst = __mod.init({ observe: true })));
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.id = 'dyn';
    el.className = 'box';
    el.dataset.reveal = 'slide-up';
    document.body.append(el);
  });
  await page.waitForTimeout(50);
  assert.equal(await opacity(page, '#dyn'), 0, 'new below-fold element hidden by MutationObserver');
  await scrollTo(page, '#dyn');
  await settle(page, '#dyn');
  assert.equal(await anims(page, '#dyn'), 0);
  await ctx.close();
});

test('no-JS: content stays visible when JavaScript is disabled', async () => {
  const { page, ctx } = await open('', { javaScriptEnabled: false });
  for (const sel of ['#top', '#below', '#aos', '#repeat']) assert.equal(await opacity(page, sel), 1, sel);
  await ctx.close();
});

test('script fails to load: content stays visible', async () => {
  const { page, ctx } = await open('?src=/dist/does-not-exist.js');
  assert.ok(await page.evaluate(() => window.__err));
  for (const sel of ['#top', '#below', '#aos', '#repeat']) assert.equal(await opacity(page, sel), 1, sel);
  await ctx.close();
});

test('UMD build: GhostReveal global, AOS alias, AOS easing names mapped', async () => {
  const { page, ctx, errors } = await open('?noinit');
  await page.addScriptTag({ url: '/dist/ghost-reveal.umd.min.js' });
  const r = await page.evaluate(() => {
    AOS.init({ duration: 300 });
    return { same: window.AOS === window.GhostReveal, keys: Object.keys(GhostReveal).sort() };
  });
  assert.ok(r.same);
  assert.deepEqual(r.keys, ['create', 'defaults', 'destroy', 'easings', 'init', 'keyframes', 'refresh', 'refreshHard']);
  assert.equal(await opacity(page, '#below'), 0);
  await scrollTo(page, '#aos');
  const easing = (await timing(page, '#aos')).easing.replace(/\s/g, '');
  assert.equal(easing, 'cubic-bezier(0.68,-0.55,0.265,1.55)');
  await page.evaluate(() => AOS.destroy());
  assert.equal(await opacity(page, '#repeat'), 1);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('UMD data-auto attribute auto-initialises', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/test/umd-auto.html`);
  assert.equal(await opacity(page, '#top'), 1);
  assert.equal(await opacity(page, '#below'), 0);
  await scrollTo(page, '#below');
  await settle(page, '#below');
  assert.equal(await opacity(page, '#below'), 1);
  await ctx.close();
});

// ---------------------------------------------------------------- v0.2 behaviour

test('default fade is the premium blur-fade; blur is configurable per element', async () => {
  const { page, ctx } = await open();
  await scrollTo(page, '#def');
  const kf = await firstKf(page, '#def');
  assert.equal(kf.opacity, '0');
  assert.match(kf.filter, /^blur\(4px\)$/);
  assert.match(kf.transform.replace(/\s/g, ''), /^translate\(0px,16px\)$/);
  const t = await timing(page, '#def');
  assert.equal(t.duration, 700);
  assert.equal(t.easing.replace(/\s/g, ''), 'cubic-bezier(0.16,1,0.3,1)');
  assert.equal(t.fill, 'backwards');
  assert.deepEqual(await firstKf(page, '#jsx'), kf, 'data-reveal="true" (JSX boolean) = default animation');
  const nb = await firstKf(page, '#noblur');
  assert.equal(nb.filter, undefined, 'data-reveal-blur="0" -> no filter');
  // mid-animation: partially transparent and still slightly blurred; then fully clean
  await page.evaluate(() => { const a = document.querySelector('#def').getAnimations()[0]; a.pause(); a.currentTime = 120; });
  const mid = await page.$eval('#def', (el) => ({ o: +getComputedStyle(el).opacity, f: getComputedStyle(el).filter }));
  assert.ok(mid.o > 0 && mid.o < 1, 'mid opacity ' + mid.o);
  assert.match(mid.f, /blur\((0\.\d+|[1-3](\.\d+)?)px\)/, 'mid filter ' + mid.f);
  await page.evaluate(() => document.querySelector('#def').getAnimations()[0].finish());
  assert.equal(await page.$eval('#def', (el) => getComputedStyle(el).filter), 'none');
  assert.equal(await anims(page, '#def'), 0);
  await ctx.close();
});

test('above-the-fold reveal:in is dispatched async, so listeners added right after init() catch it', async () => {
  const { page, ctx } = await open('?noinit');
  const r = await page.evaluate(async () => {
    const seen = [];
    __mod.init();
    const sync = __events.filter((e) => e == 'reveal:in#top').length; // nothing dispatched synchronously
    document.querySelector('#top').addEventListener('reveal:in', () => seen.push('top'));
    await new Promise((r) => setTimeout(r, 30));
    return { sync, seen };
  });
  assert.equal(r.sync, 0);
  assert.deepEqual(r.seen, ['top']);
  await ctx.close();
});

test('prefers-reduced-motion is re-checked live (matchMedia change)', async () => {
  const { page, ctx } = await open();
  assert.equal(await opacity(page, '#below'), 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  for (const sel of ['#top', '#below', '#aos', '#repeat']) {
    assert.equal(await opacity(page, sel), 1, 'reduce: ' + sel);
    assert.equal(await anims(page, sel), 0, 'reduce: ' + sel);
  }
  await scrollTo(page, '#below');
  assert.equal(await anims(page, '#below'), 0, 'no animation while reduced');
  await page.evaluate(() => scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(100);
  assert.equal(await opacity(page, '#top'), 1, 'on-screen content is not re-hidden');
  assert.equal(await anims(page, '#top'), 0);
  assert.equal(await opacity(page, '#below'), 0, 'below the fold is armed again');
  await scrollTo(page, '#below');
  await settle(page, '#below');
  assert.equal(await opacity(page, '#below'), 1);
  await ctx.close();
});

test('refresh() re-reads attributes (animation, duration, offset) and releases elements that lost them', async () => {
  const { page, ctx } = await open();
  await page.evaluate(() => {
    const b = document.querySelector('#below');
    b.dataset.reveal = 'fade-right';
    b.dataset.revealDuration = '1234';
    b.dataset.revealOffset = '0';
    document.querySelector('#aos').removeAttribute('data-aos');
    __inst.refresh();
  });
  assert.equal(await opacity(page, '#aos'), 1, 'released element is visible');
  assert.equal(await anims(page, '#aos'), 0);
  // put #below 30px into the viewport: below the default 60px trigger line, above the new 0px one
  await page.$eval('#below', (el) => scrollBy(0, el.getBoundingClientRect().top - innerHeight + 30));
  await page.waitForTimeout(200);
  assert.equal(await anims(page, '#below'), 1, 'new offset applied');
  assert.equal((await timing(page, '#below')).duration, 1234);
  assert.match((await firstKf(page, '#below')).transform.replace(/\s/g, ''), /^translate\(-16px(,0px)?\)$/);
  await ctx.close();
});

test('no horizontal overflow from slide/fade-left/zoom-out/flip while animating', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => {
    const wrap = document.createElement('section');
    wrap.id = 'ov';
    for (const a of ['slide-left', 'fade-left', 'zoom-out', 'zoom-in-left', 'flip-left']) {
      const el = document.createElement('div');
      el.className = 'box';
      el.dataset.reveal = a;
      el.id = 'ov-' + a;
      wrap.append(el);
    }
    const narrow = document.createElement('div');
    narrow.id = 'narrow';
    narrow.style.cssText = 'width:300px;height:200px;background:#ddd';
    narrow.dataset.reveal = 'slide-left';
    wrap.append(narrow);
    document.body.append(wrap);
    window.__inst = __mod.init({ duration: 4000 });
  });
  const cw = await page.evaluate(() => document.documentElement.clientWidth);
  await page.$eval('#ov', (el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(150);
  await page.$eval('#narrow', (el) => el.scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(150);
  await frames(page);
  const r = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    running: [...document.querySelectorAll('#ov > *')].map((el) => el.getAnimations().length),
    maxRight: Math.max(...[...document.querySelectorAll('#ov > *')].map((el) => el.getBoundingClientRect().right)),
  }));
  assert.deepEqual(r.running, [1, 1, 1, 1, 1, 1], 'all mid-animation');
  assert.ok(r.sw <= cw, `scrollWidth ${r.sw} <= clientWidth ${cw}`);
  assert.ok(r.maxRight <= cw + 0.5, `max right ${r.maxRight}`);
  // an element with room to move keeps its full travel
  assert.match((await firstKf(page, '#narrow')).transform.replace(/\s/g, ''), /^translate\(100%,0%\)$/);
  await ctx.close();
});

test('pages that already clip overflow-x keep the full slide travel', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => {
    document.body.style.overflowX = 'hidden';
    const el = document.createElement('div');
    el.className = 'box';
    el.id = 'clip';
    el.dataset.reveal = 'slide-left';
    document.body.append(el);
    window.__inst = __mod.init({ duration: 4000 });
  });
  await scrollTo(page, '#clip');
  assert.match((await firstKf(page, '#clip')).transform.replace(/\s/g, ''), /^translate\(100%,0%\)$/);
  await ctx.close();
});

test('observe (default on): nodes added later anywhere in a subtree are picked up; removed ones released', async () => {
  const { page, ctx } = await open('?noinit');
  await page.evaluate(() => {
    window.__inst = __mod.init(); // observe defaults to true
    const sec = document.createElement('section');
    sec.innerHTML = '<div style="height:900px"></div><div class="box" id="n1" data-reveal="fade-up"></div><div class="box" id="n2" data-aos="zoom-in"></div>';
    document.body.prepend(sec); // e.g. an SPA route render
  });
  await frames(page);
  assert.equal(await opacity(page, '#n1'), 0, 'nested new element hidden');
  assert.equal(await opacity(page, '#n2'), 0);
  // removed elements are released; re-inserting one (on screen) sets it up again and it animates in
  await page.evaluate(() => {
    const el = document.querySelector('#n2');
    el.remove();
    return new Promise((r) => setTimeout(() => (document.body.prepend(el), r()), 30));
  });
  await frames(page);
  assert.equal(await anims(page, '#n2'), 1, 're-inserted element animates');
  await settle(page, '#n2');
  assert.equal(await opacity(page, '#n2'), 1);
  await scrollTo(page, '#n1');
  await settle(page, '#n1');
  assert.equal(await opacity(page, '#n1'), 1);
  assert.equal(await anims(page, '#n1'), 0);
  // a new element inserted on screen animates in (route change) instead of popping
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'box';
    el.id = 'n3';
    el.dataset.reveal = '';
    document.querySelector('#n1').after(el);
  });
  await page.waitForTimeout(150);
  assert.equal(await anims(page, '#n3'), 1, 'on-screen insert animates');
  // observe:false opts out
  await page.evaluate(() => {
    __inst.destroy();
    window.__inst = __mod.init({ observe: false });
    const el = document.createElement('div');
    el.id = 'n4';
    el.dataset.reveal = '';
    document.body.append(el);
  });
  await frames(page);
  assert.equal(await opacity(page, '#n4'), 1, 'observe:false ignores new nodes');
  await ctx.close();
});

test('scrub (experimental): ViewTimeline-driven when supported, normal reveal otherwise', async () => {
  const { page, ctx, errors } = await open('?noinit');
  const r = await page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'box';
    el.id = 'sc';
    el.dataset.reveal = 'fade-up';
    el.dataset.revealScrub = '';
    document.body.append(el, Object.assign(document.createElement('div'), { className: 'spacer' }));
    window.__inst = __mod.init();
    const a = el.getAnimations()[0];
    return { vt: typeof ViewTimeline == 'function', n: el.getAnimations().length, tl: a?.timeline?.constructor.name };
  });
  if (r.vt) {
    assert.equal(r.n, 1);
    assert.equal(r.tl, 'ViewTimeline');
    await page.$eval('#sc', (el) => scrollBy(0, el.getBoundingClientRect().top - innerHeight + 60)); // just entering
    await frames(page);
    const o1 = await opacity(page, '#sc');
    await page.$eval('#sc', (el) => el.scrollIntoView({ block: 'center' }));
    await frames(page);
    const o2 = await opacity(page, '#sc');
    assert.ok(o1 < 0.5 && o2 === 1, `scrubbed opacity ${o1} -> ${o2}`);
    await page.evaluate(() => __inst.destroy());
    assert.equal(await anims(page, '#sc'), 0);
  } else {
    assert.equal(await opacity(page, '#sc'), 0, 'fallback: hidden until it scrolls in');
    await scrollTo(page, '#sc');
    await settle(page, '#sc');
    assert.equal(await opacity(page, '#sc'), 1);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});
