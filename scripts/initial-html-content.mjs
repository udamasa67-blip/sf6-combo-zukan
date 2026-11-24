import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve("client/src/lib/characters");
const routeCharacters = [
  { id: "elena", label: "エレナ" },
  { id: "ingrid", label: "イングリッド" },
  { id: "yasmine", label: "ヤスミン" },
];
const e = value =>
  String(value).replace(
    /[&<>"']/g,
    s =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[s]
  );

/** Read the same checked-in route data used by the interactive app. Do not scrape rendered DOM or hardcode frame/damage values. */
export async function loadInitialContent() {
  const entries = routeCharacters.map(({ id }) => id);
  const {
    outputFiles: [bundle],
  } = await build({
    stdin: {
      contents: entries
        .map(id => `export {default as ${id}} from "./${id}";`)
        .join("\n"),
      resolveDir: root,
      sourcefile: "initial-html-character-data.ts",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(bundle.contents).toString("base64")
  );
}

const nav = current =>
  `<div class="top"><a class="brand" href="/">SF6 コンボ図鑑【雅】</a><nav aria-label="関連ページ">${routeCharacters
    .filter(({ id }) => id !== current)
    .map(({ id, label }) => `<a href="/${id}/">${label}</a>`)
    .join(
      ""
    )}${current === "tool" ? "" : '<a href="/SF6_combo_tool/">入力ツール</a>'}</nav></div>`;
const footer =
  '<nav class="foot" aria-label="運営の案内"><a href="/operator.html">運営情報</a><a href="/contact.html">お問い合わせ</a><a href="/privacy.html">プライバシー</a></nav>';
const measurement = new Intl.NumberFormat("ja-JP");
const yasmineExamples = [
  {
    id: 4,
    title: "壁ぎわで、DI後のゲージを温存",
    description:
      "DIで壁やられを取ったあと、追加のドライブゲージを使わずにダウンを奪います。",
  },
  {
    id: 6,
    title: "下段から、起き攻めを続ける",
    description:
      "しゃがみ中Kからキャンセルドライブラッシュ。バヤニ・モードを溜め、投げかシミーへつなぎます。",
  },
];

function card(character, example) {
  const c = character.combos.find(({ number }) => number === example.id);
  if (!c)
    throw new Error(
      `Missing initial HTML combo ${character.id} #${example.id}`
    );
  const n = String(c.number).padStart(2, "0");
  const damage = c.damageLabel || measurement.format(c.damage);
  return `<article><div class="route"><span>#${n}　${e(c.title)}</span><span>${e(damage)} ダメージ　·　ダウン有利 ${e(c.knockdown)}</span></div><h2>${e(example.title || c.title)}</h2><p>${e(example.description || c.description)}</p><code>${e(c.notation.trim().replace(/\s+/g, " "))}</code></article>`;
}

export function renderInitialContent(path, characters) {
  if (path === "") {
    const list = routeCharacters
      .map(
        ({ id, label }) =>
          `<article><h2><a href="/${id}/">${label}のコンボ攻略</a></h2><p>${e(characters[id].comboTheory)}</p></article>`
      )
      .join("");
    return `<main class="sf6-first">${nav("")}<p class="eyebrow">MIYABI COMBO ARCHIVE</p><h1>SF6 コンボ図鑑【雅】</h1><p class="desc">ストリートファイター6のコンボを、ダメージ・起き攻め・ドライブゲージ消費で比較。まずは得意な状況と締め方を決め、次の対戦で使うルートを選びましょう。</p>${list}<p class="foot"><a href="/SF6_combo_tool/">コンボ入力コマンド作成ツール</a>　·　<a href="https://monsterrelic.miyabi-combo.com/about">同じ制作者のゲーム：モンスターレリック</a></p>${footer}</main>`;
  }
  if (path === "404") {
    return `<main class="sf6-first">${nav("404")}<p class="eyebrow">404 / PAGE NOT FOUND</p><h1>ページが見つかりません</h1><p class="desc">ページが移動したか、URLが違っている可能性があります。トップやキャラクター一覧からお探しください。</p><p><a href="/">コンボ図鑑トップへ戻る</a></p>${footer}</main>`;
  }
  if (path === "SF6_combo_tool") {
    return `<main class="sf6-first">${nav("tool")}<p class="eyebrow">SF6 COMBO COMMAND TOOL</p><h1>SF6コンボ入力コマンド作成ツール</h1><p class="desc">方向と攻撃ボタン、キャンセル記号を選び、コンボをテキストとして組み立てます。</p><article><h2>方向と技を順番に並べる</h2><p>例：<strong>2MK</strong>はしゃがみ中キック。<strong>xx</strong>は前の技をキャンセルして、次の技につなぐ記号です。</p><code>2MK xx DRC</code></article><p class="foot">コマンド作成・コピー機能にはJavaScriptが必要です。</p>${footer}</main>`;
  }
  const c = characters[path];
  const starterNumbers = (c.beginnerSteps || [])
    .map(({ comboId }) => comboId)
    .concat(
      c.beginnerComboIds || [],
      c.combos.map(({ number }) => number)
    );
  const examples =
    path === "yasmine"
      ? yasmineExamples
      : [...new Set(starterNumbers)].slice(0, 2).map(id => ({ id }));
  const lead =
    path === "yasmine"
      ? "まずは壁ぎわと下段から。状況に合わせて、ゲージを残すか、次の攻めへつなぐかを選びます。"
      : c.comboTheory;
  return `<main class="sf6-first">${nav(path)}<p class="eyebrow">${e(c.name.toUpperCase())} / COMBO GUIDE</p><h1>${e(c.nameJp)}のコンボ攻略</h1><p class="desc">${e(lead)}</p>${examples.map(example => card(c, example)).join("")}<p class="foot">一覧での絞り込みや動画の再生には、JavaScriptを有効にしてください。</p>${footer}</main>`;
}

export function withInitialContent(html, content) {
  if (!html.includes('<div id="root"></div>'))
    throw new Error("Expected empty React root in the base HTML");
  return html
    .replace(
      "</head>",
      '    <link rel="stylesheet" href="/initial-guide.css">\n  </head>'
    )
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}
