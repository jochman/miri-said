import { readFile, writeFile } from 'node:fs/promises';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');
const [rawQuotes, rawCss, js, pattern, favicon, rawSeo] = await Promise.all([
  read('quotes.json'), read('style.css'), read('app.js'),
  readFile(new URL('assets/miri-transit-pattern.png', import.meta.url)),
  readFile(new URL('assets/miri-favicon.png', import.meta.url)),
  read('seo.json'),
]);
const seo = JSON.parse(rawSeo);
const siteUrl = new URL(seo.url);
if (siteUrl.protocol !== 'https:' || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
  throw new Error('seo.url must be an HTTPS site root URL.');
}
const canonical = siteUrl.href;
const imageUrl = new URL(seo.image, siteUrl).href;
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const serialize = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const structuredData = serialize({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite', '@id': `${canonical}#website`,
      url: canonical, name: seo.name, inLanguage: 'he',
    },
    {
      '@type': 'WebPage', '@id': `${canonical}#webpage`,
      url: canonical, name: seo.title, description: seo.description, inLanguage: 'he',
      isPartOf: { '@id': `${canonical}#website` },
      mainEntity: { '@id': `${canonical}#game` },
      primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl, width: seo.imageWidth, height: seo.imageHeight },
    },
    {
      '@type': 'VideoGame', '@id': `${canonical}#game`,
      name: seo.name, description: seo.description, url: canonical,
      image: imageUrl, inLanguage: 'he', genre: 'Trivia',
      gamePlatform: 'Web browser', playMode: 'https://schema.org/SinglePlayer',
      isAccessibleForFree: true,
    },
  ],
});
const css = rawCss.replace('url("assets/miri-transit-pattern.png")', `url("data:image/png;base64,${pattern.toString('base64')}")`);
const quotes = JSON.parse(rawQuotes);
const data = serialize(quotes);
const page = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f0e5">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="he_IL">
  <meta property="og:site_name" content="${escapeHtml(seo.name)}">
  <meta property="og:title" content="${escapeHtml(seo.title)}">
  <meta property="og:description" content="${escapeHtml(seo.description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="${seo.imageWidth}">
  <meta property="og:image:height" content="${seo.imageHeight}">
  <meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(seo.title)}">
  <meta name="twitter:description" content="${escapeHtml(seo.description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}">
  <script type="application/ld+json">${structuredData}</script>
  <link rel="icon" type="image/png" href="data:image/png;base64,${favicon.toString('base64')}">
  <style>${css}</style>
</head>
<body>
  <div class="page">
    <main id="app"><section><h1>${escapeHtml(seo.title)}</h1><p>${escapeHtml(seo.description)}</p><p>במשחק ${quotes.length} ציטוטים. בחרו אם כל ציטוט אמיתי או מומצא, וגלו את הניקוד שלכם בסיום.</p></section></main>
    <noscript><p>יש להפעיל JavaScript בדפדפן כדי לשחק.</p></noscript>
  </div>
  <script>window.offlineQuotes = ${data};</script>
  <script>${js}</script>
</body>
</html>
`;
await writeFile(new URL('index.html', import.meta.url), page);
await writeFile(new URL('robots.txt', import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${canonical}sitemap.xml\n`);
await writeFile(new URL('sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${escapeHtml(canonical)}</loc></url>
</urlset>
`);
console.log(`Built index.html with ${quotes.length} quotes.`);
