// Minimal zero-dependency static server.
//   node scripts/serve.mjs [port] [dir]      (port also from PORT; default 8080)
// With a dir (e.g. site-dist) it mirrors Vercel for that static site: cleanUrls (/playground ->
// playground.html, *.html -> 308 to the clean path), trailingSlash:false (308), 404.html with status 404,
// the response headers from vercel.json, ETag revalidation and br/gzip compression.
// Without a dir it serves the project root as-is (used by the library tests: /test, /dist).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
};
const compressible = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg)/;

// vercel.json "headers": sources are path-to-regexp style; the ones we use ("/assets/(.*)",
// "/((?!assets/).*)") are plain regex groups, so anchoring them is enough here.
function vercelHeaders() {
  try {
    const cfg = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf8'));
    return (cfg.headers || []).map((h) => ({ re: new RegExp('^' + h.source.replace(/:(\w+)\*/g, '(?<$1>.*)').replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), headers: h.headers }));
  } catch { return []; }
}

// opts (used by scripts/dev.mjs): handle(req, res, path) -> true if it answered the request itself;
// html(text) -> rewritten HTML; noStore -> Cache-Control: no-store on everything, no ETag/304.
export function serve(port = 0, dir, opts = {}) {
  const site = !!dir;
  const root = resolve(projectRoot, dir || '.');
  const rules0 = site ? vercelHeaders() : [];
  const rules = () => (site && opts.noStore ? vercelHeaders() : rules0); // dev: vercel.json edits apply live
  const file = async (p) => { try { const s = await stat(join(root, p)); return s.isFile() ? p : null; } catch { return null; } };
  const server = createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    let p = normalize(decodeURIComponent(u.pathname)).split(sep).join('/');
    if (opts.handle && (await opts.handle(req, res, p))) return;
    if (!resolve(root, '.' + p).startsWith(root)) return res.writeHead(400).end();
    let status = 200, hit;
    if (site) {
      const redirect = (to) => res.writeHead(308, { location: to + u.search }).end();
      if (p.length > 1 && p.endsWith('/')) return redirect(p.replace(/\/+$/, '')); // trailingSlash: false
      if (p.endsWith('.html')) return redirect(p.replace(/(\/index)?\.html$/, '') || '/'); // cleanUrls: true
      if (/\/index$/.test(p)) return redirect(p.replace(/\/index$/, '') || '/'); // Vercel: /index -> /
      hit = p == '/' ? 'index.html' : (await file(p)) || (await file(p + '.html'));
      if (!hit) (status = 404), (hit = (await file('404.html')) || null);
    } else {
      if (p.endsWith('/')) p += 'index.html';
      hit = await file(p);
      if (!hit) status = 404;
    }
    if (!hit) return res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    let body = await readFile(join(root, hit));
    const type = types[extname(hit)] || 'application/octet-stream';
    const headers = { 'content-type': type };
    for (const r of rules()) if (r.re.test(p)) for (const h of r.headers) headers[h.key.toLowerCase()] = h.value;
    if (opts.html && type.startsWith('text/html')) body = Buffer.from(opts.html(body.toString('utf8')));
    if (opts.noStore) headers['cache-control'] = 'no-store';
    if (site && !opts.noStore) {
      const etag = '"' + createHash('sha1').update(body).digest('base64url') + '"';
      headers.etag = etag;
      if (status == 200 && req.headers['if-none-match'] == etag) return res.writeHead(304, headers).end();
      const ae = req.headers['accept-encoding'] || '';
      if (compressible.test(type) && body.length > 512) {
        if (/\bbr\b/.test(ae)) (body = brotliCompressSync(body)), (headers['content-encoding'] = 'br');
        else if (/\bgzip\b/.test(ae)) (body = gzipSync(body)), (headers['content-encoding'] = 'gzip');
        headers.vary = 'Accept-Encoding';
      }
    }
    res.writeHead(status, headers);
    res.end(req.method == 'HEAD' ? undefined : body);
  });
  return new Promise((r, j) => server.once('error', j).listen(port, '127.0.0.1', () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !/^\d+$/.test(a));
  const port = +(args.find((a) => /^\d+$/.test(a)) ?? process.env.PORT ?? 8080);
  const s = await serve(port, dir).catch((e) => {
    if (e.code == 'EADDRINUSE') console.error(`Port ${port} is already in use. Stop the other server or pick another port: PORT=8081 npm run preview`);
    else console.error(e);
    process.exit(1);
  });
  console.log(`Serving ${resolve(projectRoot, dir || '.')} at http://localhost:${s.address().port}/${dir ? '' : 'test/fixture.html'}`);
}
