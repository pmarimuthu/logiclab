import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = 'apps/web/dist';
const port = Number(process.env['PORT'] ?? 4173);
const config = JSON.parse(await readFile('vercel.json', 'utf8'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.map': 'application/json',
};

function toRegExp(source) {
  return new RegExp(`^${source.replace('(.*)', '.*')}$`);
}

function headersFor(path) {
  const result = {};
  for (const rule of config.headers ?? []) {
    if (!toRegExp(rule.source).test(path)) continue;
    for (const header of rule.headers) result[header.key] = header.value;
  }
  return result;
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const safe = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe.endsWith('/') ? `${safe}index.html` : safe);
  try {
    if (!(await stat(file)).isFile()) throw new Error('not a file');
  } catch {
    file = join(root, 'index.html');
  }
  const body = await readFile(file);
  response.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    ...headersFor(url.pathname),
  });
  response.end(body);
}).listen(port, () => {
  console.log(`Serving ${root} with vercel.json headers on http://localhost:${port}`);
});
