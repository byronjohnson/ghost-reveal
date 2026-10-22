// SSR safety: importing every build in plain Node (no window/document) must not throw,
// and init() on the server is a harmless no-op.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

test('SSR: ESM, auto, add-on and CJS builds import in Node without a DOM', async () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  for (const f of ['ghost-reveal.esm.js', 'ghost-reveal.esm.min.js', 'ghost-reveal.auto.esm.min.js', 'aos-easings.esm.js']) {
    const m = await import(`../dist/${f}`);
    assert.ok(m, f);
  }
  const m = await import('../dist/ghost-reveal.esm.min.js');
  const inst = m.init();
  assert.equal(typeof inst.refresh, 'function');
  inst.refresh();
  inst.destroy();
  const auto = (await import('../dist/ghost-reveal.auto.esm.min.js')).default;
  assert.equal(typeof auto.destroy, 'function');
  const cjs = createRequire(import.meta.url)('../dist/ghost-reveal.umd.min.cjs');
  assert.deepEqual(Object.keys(cjs).sort(), ['create', 'defaults', 'destroy', 'easings', 'init', 'keyframes', 'refresh', 'refreshHard']);
  assert.equal(typeof cjs.init().refresh, 'function');
  assert.equal(typeof globalThis.AOS, 'undefined', 'no global side effects on the server');
});

test('keyframes(): animation definitions are plain data (usable for WAAPI, ViewTimeline or CSS)', async () => {
  const { keyframes, defaults } = await import('../dist/ghost-reveal.esm.min.js');
  assert.deepEqual(keyframes('fade-up'), [{ opacity: 0, filter: 'blur(4px)', transform: 'translate(0px,16px)' }, {}]);
  assert.deepEqual(keyframes('fade', 16, 0), [{ opacity: 0 }, {}]);
  assert.deepEqual(keyframes('slide-left', 16, 0), [{ opacity: 0, transform: 'translate(100%,0%)' }, {}]);
  assert.deepEqual(keyframes('zoom-out-right', 30, 0), [{ opacity: 0, transform: 'translate(-30px,0px) scale(1.2)' }, {}]);
  assert.equal(keyframes('flip-up')[0].transform, 'perspective(2500px) rotateX(-100deg) rotateY(0deg)');
  assert.equal(defaults.easing, 'cubic-bezier(.16,1,.3,1)');
  assert.equal(defaults.observe, true);
});
