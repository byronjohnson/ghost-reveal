// UMD/global entry: singleton API (AOS-style) + optional auto-init + AOS alias.
import { init as create, defaults, easings, keyframes } from './index.js';
import aos from './aos-easings.js';

Object.assign(easings, aos);

let inst;
const init = (o) => (inst && inst.destroy(), (inst = create(o)));
const refresh = () => inst && inst.refresh();
const destroy = () => {
  inst && inst.destroy();
  inst = 0;
};
const api = { init, refresh, refreshHard: refresh, destroy, create, defaults, easings, keyframes };

if (typeof window != 'undefined') {
  window.AOS = window.AOS || api; // drop-in for AOS.init()/AOS.refresh()
  const s = document.currentScript;
  if (s && s.hasAttribute('data-auto'))
    document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', () => init()) : init();
}

export default api;
