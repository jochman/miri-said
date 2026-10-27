import { readFile, writeFile } from 'node:fs/promises';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');
const [rawQuotes, rawCss, js, pattern, favicon] = await Promise.all([
  read('quotes.json'), read('style.css'), read('app.js'),
  readFile(new URL('assets/miri-transit-pattern.png', import.meta.url)),
  readFile(new URL('assets/miri-favicon.png', import.meta.url)),
]);
const css = rawCss.replace('url("assets/miri-transit-pattern.png")', `url("data:image/png;base64,${pattern.toString('base64')}")`);
const quotes = JSON.parse(rawQuotes);
const data = JSON.stringify(quotes).replaceAll('<', '\\u003c');
const page = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f0e5">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>מירי אמרה? משחק הציטוטים</title>
  <link rel="icon" type="image/png" href="data:image/png;base64,${favicon.toString('base64')}">
  <style>${css}</style>
</head>
<body>
  <div class="page">
    <main id="app"><p>טוענים את המשחק…</p></main>
    <noscript><p>יש להפעיל JavaScript בדפדפן כדי לשחק.</p></noscript>
  </div>
  <script>window.offlineQuotes = ${data};</script>
  <script>${js}</script>
</body>
</html>
`;
await writeFile(new URL('index.html', import.meta.url), page);
console.log(`Built index.html with ${quotes.length} quotes.`);
