import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const explicitSiteUrl = process.env.SITE_URL;
const vercelSiteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
const siteUrl = (explicitSiteUrl || vercelSiteUrl || "https://www.miyabi-combo.com").replace(/\/+$/, "");
const today = new Date().toISOString().slice(0, 10);
const routes = [
  { path: "/", priority: "1.0" },
  { path: "/elena", priority: "0.9" },
  { path: "/ingrid", priority: "0.9" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
const publicDir = resolve("client/public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, "sitemap.xml"), xml);
writeFileSync(resolve(publicDir, "robots.txt"), robots);
