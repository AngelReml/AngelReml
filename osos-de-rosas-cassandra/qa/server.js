// Servidor local de pruebas: sirve la web con las mismas cabeceras que vercel.json.
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const headers = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"))).headers[0].headers;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const h = { "Content-Type": types[path.extname(f)] || "application/octet-stream" };
  headers.forEach(x => (h[x.key] = x.value));
  res.writeHead(200, h); fs.createReadStream(f).pipe(res);
}).listen(process.env.PORT || 8787);
