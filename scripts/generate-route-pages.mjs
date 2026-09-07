import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || "https://www.miyabi-combo.com").replace(/\/+$/, "");
const outputDir = resolve("dist/public");
const baseHtml = readFileSync(resolve(outputDir, "index.html"), "utf8");

const routes = [
  {
    path: "yasmine",
    title: "ヤスミン コンボ攻略｜SF6 起き攻め・SA2・バヤニ連携",
    description:
      "ストリートファイター6（SF6）ヤスミンのコンボ攻略。基本コンボから起き攻め、SA2、バヤニ・モード、画面端セットプレイまで動画付きで検索できます。",
    keywords:
      "ヤスミン コンボ, SF6 ヤスミン, ストリートファイター6 ヤスミン, ヤスミン コンボ 攻略, ヤスミン 起き攻め, ヤスミン SA2, ヤスミン バヤニ・モード, ヤスミン モダン",
  },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

for (const route of routes) {
  const url = `${siteUrl}/${route.path}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url,
    name: route.title,
    description: route.description,
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      name: "SF6 コンボ図鑑【雅】",
      url: `${siteUrl}/`,
    },
    about: {
      "@type": "Thing",
      name: "ヤスミン（Yasmine）",
      description: "ストリートファイター6のキャラクター、ヤスミンのコンボ攻略",
    },
  };

  let html = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/,
      `<meta name="description" content="${escapeHtml(route.description)}" />`,
    )
    .replace(/(["'])\.\//g, "$1/");

  html = html.replace(
    "</head>",
    `    <meta name="keywords" content="${escapeHtml(route.keywords)}" />\n` +
      `    <link rel="canonical" href="${url}" />\n` +
      `    <meta property="og:title" content="${escapeHtml(route.title)}" />\n` +
      `    <meta property="og:description" content="${escapeHtml(route.description)}" />\n` +
      `    <meta property="og:type" content="website" />\n` +
      `    <meta property="og:url" content="${url}" />\n` +
      `    <meta name="twitter:card" content="summary_large_image" />\n` +
      `    <meta name="twitter:title" content="${escapeHtml(route.title)}" />\n` +
      `    <meta name="twitter:description" content="${escapeHtml(route.description)}" />\n` +
      `    <script type="application/ld+json" data-character-structured-data>${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>\n` +
      "  </head>",
  );

  const routeDir = resolve(outputDir, route.path);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(resolve(routeDir, "index.html"), html);
}
