import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const required = ['index.html', 'manifest.webmanifest', 'sw.js', 'icons/icon-192.png', 'icons/icon-512.png'];
const fail = (message) => { console.error('PWA CHECK FAILED:', message); process.exitCode = 1; };
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing dist/${file}`);
}
if (process.exitCode) process.exit(1);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
if (!html.includes('rel="manifest"')) fail('index.html does not link the web app manifest');
if (/src=["']\/src\//.test(html)) fail('Built HTML contains a root-absolute source path that breaks GitHub Pages subpaths');
if (manifest.display !== 'standalone') fail('Manifest display must be standalone');
if (!manifest.id || !manifest.start_url || !manifest.scope) fail('Manifest must define id, start_url and scope');
if (!manifest.start_url.startsWith('./') || !manifest.scope.startsWith('./')) fail('Manifest paths must remain relative for GitHub Pages');
for (const icon of manifest.icons || []) {
  const file = path.join(root, icon.src.replace(/^\.\//, ''));
  if (!fs.existsSync(file)) fail(`Manifest icon missing: ${icon.src}`);
  else {
    const data = fs.readFileSync(file);
    if (icon.type === 'image/svg+xml' || icon.src.toLowerCase().endsWith('.svg')) {
      const svg = data.toString('utf8');
      if (!/<svg\b/.test(svg) || !/viewBox=["']0 0 512 512["']/.test(svg)) fail(`Invalid scalable SVG icon: ${icon.src}`);
    } else {
      if (data.toString('hex', 0, 8) !== '89504e470d0a1a0a') fail(`Invalid PNG icon: ${icon.src}`);
      const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
      const expected = Number(icon.sizes.split('x')[0]);
      if (width !== expected || height !== expected) fail(`Icon dimensions mismatch for ${icon.src}: ${width}x${height}`);
    }
  }
}
if (!sw.includes('family-world-shell-v7')) fail('Service worker cache version was not bumped');
if (!sw.includes("request.headers.has('range')")) fail('Service worker must pass byte-range media requests through without caching partial responses');
if (!sw.includes('self.registration.scope')) fail('Service worker does not derive its root from its registration scope');
if (process.exitCode) process.exit(1);
console.log('PWA smoke checks passed: manifest, GitHub Pages-relative paths, service worker, and SVG and PNG icons.');
