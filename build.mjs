// Genera las páginas de redirección y los códigos QR a partir de links.json.
// Uso: npm run build
import QRCode from "qrcode";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";

const config = JSON.parse(await readFile("links.json", "utf8"));
const base = config.base_url.replace(/\/$/, "");
const SLUG = /^[a-z0-9-]+$/;
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const item of config.links) {
  if (!SLUG.test(item.slug)) throw new Error(`Slug inválido: ${item.slug}`);
  const url = new URL(item.destino); // lanza error si no es una URL válida
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`Destino no http(s): ${item.destino}`);
}

await rm("r", { recursive: true, force: true });
await mkdir("qr", { recursive: true });
await writeFile(".nojekyll", "");

const cards = [];
for (const item of config.links) {
  const shortUrl = `${base}/r/${item.slug}/`;
  const dir = `r/${item.slug}`;
  await mkdir(dir, { recursive: true });

  // Página de redirección: el QR apunta a shortUrl; el destino vive en links.json.
  await writeFile(
    `${dir}/index.html`,
    `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc(item.destino)}">
<link rel="canonical" href="${esc(item.destino)}">
<title>${esc(item.nombre)}</title>
</head>
<body>
<p>Redirigiendo a <a href="${esc(item.destino)}">${esc(item.destino)}</a>…</p>
<script>location.replace(${JSON.stringify(item.destino)});</script>
</body>
</html>
`
  );

  await QRCode.toFile(`qr/${item.slug}.png`, shortUrl, { width: 1024, margin: 4, errorCorrectionLevel: "M" });
  await writeFile(`qr/${item.slug}.svg`, await QRCode.toString(shortUrl, { type: "svg", margin: 4, errorCorrectionLevel: "M" }));

  cards.push(`<section>
<h2>${esc(item.nombre)}</h2>
<img src="qr/${esc(item.slug)}.svg" alt="QR ${esc(item.nombre)}" width="256" height="256">
<p>QR apunta a: <code>${esc(shortUrl)}</code></p>
<p>Destino actual: <a href="${esc(item.destino)}">${esc(item.destino)}</a></p>
<p><a href="qr/${esc(item.slug)}.png">Descargar PNG</a> · <a href="qr/${esc(item.slug)}.svg">Descargar SVG</a></p>
</section>`);
}

await writeFile(
  "index.html",
  `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QR dinámicos</title>
<style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:16px;line-height:1.5}
section{border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0}
img{max-width:100%;height:auto}
code{word-break:break-all}
</style>
</head>
<body>
<h1>QR dinámicos</h1>
<p>Para cambiar el destino de un QR, edita <code>links.json</code> y ejecuta <code>npm run build</code>. El código QR no cambia.</p>
${cards.join("\n")}
</body>
</html>
`
);

console.log(`Listo: ${config.links.length} enlace(s) generados.`);
