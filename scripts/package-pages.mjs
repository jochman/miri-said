import { cp, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const site = new URL('_site/', root);
const staging = await mkdtemp(new URL('.pages-build-', root));

try {
  const files = ['index.html', 'quotes.json', 'robots.txt', 'sitemap.xml', 'CNAME'];
  for (const file of files) await cp(new URL(file, root), `${staging}/${file}`);
  await mkdir(`${staging}/assets`);
  await cp(new URL('assets/miri-favicon.png', root), `${staging}/assets/miri-favicon.png`);
  await rm(site, { recursive: true, force: true });
  await rename(staging, site);
} finally {
  await rm(staging, { recursive: true, force: true });
}

console.log('Packaged public site files in _site/.');
