import { init, keyframes, defaults, easings, type GhostRevealOptions, type GhostKeyframe } from 'ghost-reveal';
import reveal from 'ghost-reveal/auto';
import aos from 'ghost-reveal/aos-easings';
Object.assign(easings, aos);
const o: GhostRevealOptions = { blur: 6, scrub: false, observe: true, disable: 'mobile', animation: 'zoom-in-up' };
const inst = init(o);
inst.refresh(); inst.destroy(); reveal.refresh();
const [from]: [GhostKeyframe, {}] = keyframes('fade-up', 20, 0);
const n: number = defaults.blur + (from.opacity ?? 0);
document.addEventListener('reveal:in', (e) => e.target);
document.querySelector('div')!.addEventListener('reveal:out', (e: CustomEvent<null>) => e.detail);
// @ts-expect-error unknown option
init({ blurr: 1 });
void n;
