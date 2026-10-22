// AOS 2.x easing names -> cubic-bezier (same curves AOS uses). Optional add-on.
// ESM: import { easings } from 'ghost-reveal'; import aos from 'ghost-reveal/aos-easings'; Object.assign(easings, aos);
// The UMD build includes these automatically.
const t = {
  'in-back': '.6,-.28,.735,.045',
  'out-back': '.175,.885,.32,1.275',
  'in-out-back': '.68,-.55,.265,1.55',
  'in-sine': '.47,0,.745,.715',
  'out-sine': '.39,.575,.565,1',
  'in-out-sine': '.445,.05,.55,.95',
  'in-quad': '.55,.085,.68,.53',
  'out-quad': '.25,.46,.45,.94',
  'in-out-quad': '.455,.03,.515,.955',
  'in-cubic': '.55,.055,.675,.19',
  'out-cubic': '.215,.61,.355,1',
  'in-out-cubic': '.645,.045,.355,1',
  'in-quart': '.895,.03,.685,.22',
  'out-quart': '.165,.84,.44,1',
  'in-out-quart': '.77,0,.175,1',
};
const aosEasings = {};
for (const k in t) aosEasings['ease-' + k] = `cubic-bezier(${t[k]})`;
export default aosEasings;
