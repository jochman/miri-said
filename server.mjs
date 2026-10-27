import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/quotes.json': ['quotes.json', 'application/json; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/assets/miri-transit-pattern.png': ['assets/miri-transit-pattern.png', 'image/png'],
  '/favicon.ico': ['assets/miri-favicon.png', 'image/png'],
  '/assets/miri-favicon.png': ['assets/miri-favicon.png', 'image/png'],
};
const port = Number(process.env.PORT || 8000);
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) {
    res.writeHead(404).end('Not found');
    return;
  }
  try {
    const content = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, {
      'Content-Type': file[1],
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(500).end('Could not read file');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Stop the other server or use PORT=8001 npm start.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Game: http://localhost:${port}`));
