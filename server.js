// server.js
// Lightweight, zero-dependency local static preview server for CSE423 Portal.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=UTF-8"
};

const server = http.createServer((req, res) => {
  // Normalize URL
  let reqUrl = decodeURI(req.url.split("?")[0]);
  if (reqUrl === "/" || reqUrl === "") {
    reqUrl = "/index.html";
  }

  const safePath = path.normalize(path.join(ROOT, reqUrl));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("403 Forbidden");
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title></head>
        <body style="font-family:system-ui; background:#0f172a; color:#f8fafc; padding:50px; text-align:center;">
          <h1 style="color:#ef4444;">404 - File Not Found</h1>
          <p>Requested: <code>${escapeHtml(reqUrl)}</code></p>
          <p><a href="/" style="color:#10b981;">Return to CSE423 Portal Home</a></p>
        </body>
        </html>
      `);
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CSE423 Portal Local Preview Server running!`);
  console.log(`🌐 Local URL:  http://localhost:${PORT}`);
  console.log(`📄 Main Page:  http://localhost:${PORT}/index.html`);
  console.log(`📦 Study Pack: http://localhost:${PORT}/CSE423_Study_Pack.html`);
  console.log(`🛠️ Practical 7: http://localhost:${PORT}/Practicals/assets/static_website/index.html`);
  console.log(`======================================================\n`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.warn(`Port ${PORT} in use, trying port ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1);
  } else {
    console.error("Server error:", e);
  }
});
