// ESM auto-init entry: `import 'ghost-reveal/auto'` (module scripts run after parsing).
// Watches the DOM (observe: true is the default), so SPA route changes need no extra code.
// SSR-safe: on the server init() is a no-op. Exports the instance: `import reveal from 'ghost-reveal/auto'; reveal.refresh()`.
import { init } from './index.js';
export default init();
