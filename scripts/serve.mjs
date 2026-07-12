import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');

    const details = await stat(file);
    if (!details.isFile()) throw new Error('Not a file');

    const headers = {
      'Accept-Ranges': 'bytes',
      'Content-Type': types.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
    };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);

    if (range) {
      const start = Number(range[1]);
      const end = Math.min(range[2] ? Number(range[2]) : details.size - 1, details.size - 1);
      if (start > end) {
        response.writeHead(416, { 'Content-Range': `bytes */${details.size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        ...headers,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${details.size}`,
      });
      createReadStream(file, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, { ...headers, 'Content-Length': details.size });
    createReadStream(file).pipe(response);
  } catch (_error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}`);
});
