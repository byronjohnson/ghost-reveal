import { build, transform } from 'esbuild';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
mkdirSync('dist', { recursive: true });
const banner = `/*! ghost-reveal ${version} MIT */`;
const common = { bundle: true, target: 'es2021', legalComments: 'none', write: false };
const out = async (opts) => (await build({ ...common, ...opts })).outputFiles[0].text;
const w = (f, s) => writeFileSync('dist/' + f, s);

// ESM (readable) + ESM (minified) + ESM auto-init + easing add-on
w('ghost-reveal.esm.js', await out({ entryPoints: ['src/index.js'], format: 'esm', banner: { js: banner } }));
w('ghost-reveal.esm.min.js', banner + '\n' + (await out({ entryPoints: ['src/index.js'], format: 'esm', minify: true })));
w('ghost-reveal.auto.esm.min.js', banner + '\n' + (await out({ entryPoints: ['src/auto.js'], format: 'esm', minify: true })));
w('aos-easings.esm.js', await out({ entryPoints: ['src/aos-easings.js'], format: 'esm', minify: true }));

// UMD: iife bundle wrapped in a UMD shell, then minified again
const iife = await out({ entryPoints: ['src/umd.js'], format: 'iife', globalName: '__G' });
const umd = `(function(g,f){typeof exports=="object"&&typeof module!="undefined"?module.exports=f():(g=typeof globalThis!="undefined"?globalThis:g||self,g.GhostReveal=f())})(this,function(){${iife};return __G.default})`;
w('ghost-reveal.umd.js', banner + '\n' + umd);
w('ghost-reveal.umd.min.js', banner + '\n' + (await transform(umd, { minify: true, target: 'es2021' })).code);
// CommonJS copy for require() (package is "type": "module", so .js would be parsed as ESM by Node)
w('ghost-reveal.umd.min.cjs', readFileSync('dist/ghost-reveal.umd.min.js'));

if (!process.env.QUIET)
  for (const f of ['ghost-reveal.esm.min.js', 'ghost-reveal.auto.esm.min.js', 'ghost-reveal.umd.min.js', 'aos-easings.esm.js', 'ghost-reveal.esm.js', 'ghost-reveal.umd.js']) {
    const b = readFileSync('dist/' + f);
    console.log(f.padEnd(30), String(b.length).padStart(6), 'B raw', String(gzipSync(b, { level: 9 }).length).padStart(6), 'B gzip-9');
  }
