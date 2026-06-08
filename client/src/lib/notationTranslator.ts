/**
 * 入力コマンド表記をトークン単位で分解し、日本語補助情報を付与
 * sf6notation.tsの辞書定義に統一
 */

// 通常技の変換辞書（sf6notation.tsに統一）
const normalMoveDict: Record<string, string> = {
  // 立ち技
  "5LP": "立ち弱パンチ",
  "5MP": "立ち中パンチ",
  "5HP": "立ち強パンチ",
  "5LK": "立ち弱キック",
  "5MK": "立ち中キック",
  "5HK": "立ち強キック",
  // しゃがみ技
  "2LP": "しゃがみ弱パンチ",
  "2MP": "しゃがみ中パンチ",
  "2HP": "しゃがみ強パンチ",
  "2LK": "しゃがみ弱キック",
  "2MK": "しゃがみ中キック",
  "2HK": "しゃがみ強キック",
  // ジャンプ技
  "j.LP": "ジャンプ弱パンチ",
  "j.MP": "ジャンプ中パンチ",
  "j.HP": "ジャンプ強パンチ",
  "j.LK": "ジャンプ弱キック",
  "j.MK": "ジャンプ中キック",
  "j.HK": "ジャンプ強キック",
  // 基本ボタン
  "LP": "弱パンチ",
  "MP": "中パンチ",
  "HP": "強パンチ",
  "LK": "弱キック",
  "MK": "中キック",
  "HK": "強キック",
  "P": "パンチ",
  "K": "キック",
  "PP": "パンチ2つ同時押し",
  "KK": "キック2つ同時押し",
  "PPP": "パンチ3つ同時押し",
  "KKK": "キック3つ同時押し",
  // 方向+ボタン（追加入力）
  "6LP": "前+弱パンチ",
  "6MP": "前+中パンチ",
  "6HP": "前+強パンチ",
  "6P": "前+パンチ",
  "6LK": "前+弱キック",
  "6MK": "前+中キック",
  "6HK": "前+強キック",
  "6K": "前+キック",
  "4LP": "後ろ+弱パンチ",
  "4MP": "後ろ+中パンチ",
  "4HP": "後ろ+強パンチ",
  "4P": "後ろ+パンチ",
  "4LK": "後ろ+弱キック",
  "4MK": "後ろ+中キック",
  "4HK": "後ろ+強キック",
  "4K": "後ろ+キック",
};

// システム技・修飾子の変換辞書（sf6notation.tsに統一）
const systemMoveDict: Record<string, string> = {
  "DR": "ドライブラッシュ",
  "DRC": "ドライブラッシュキャンセル",
  "DI": "ドライブインパクト",
  "DP": "ドライブパリィ",
  "OD": "オーバードライブ技",
  "PC": "パニッシュカウンター",
  "CH": "カウンターヒット",
  "W!": "壁やられ状態",
  "W! STN": "壁やられスタン状態",
  "▲": "フレーム消費",
  "SA1": "スーパーアーツ1",
  "SA2": "スーパーアーツ2",
  "SA3": "スーパーアーツ3",
  "SC": "スーパーキャンセル",
  "CA": "クリティカルアーツ",
};

// 修飾子の詳細説明辞書（括弧付きの修飾子用）
const modifierDescriptionDict: Record<string, string> = {
  "CH": "カウンターヒット時",
  "PC": "パニッシュカウンター時",
  "DRC": "ドライブラッシュキャンセル",
  "DI": "ドライブインパクト",
  "DP": "ドライブパリィ",
  "投げ": "投げ",
  "SA1": "スーパーアーツ1",
  "SA2": "スーパーアーツ2",
  "SA3": "スーパーアーツ3",
  "W!": "壁やられ状態",
  "W! STN": "壁やられスタン状態",
  "▲": "フレーム消費",
};

// モーション・コマンドの変換辞書（sf6notation.tsに統一）
const motionDict: Record<string, string> = {
  "236": "波動拳コマンド",
  "214": "逆波動コマンド",
  "623": "昇竜拳コマンド",
  "421": "逆昇竜コマンド",
  "41236": "半回転前",
  "63214": "半回転後",
  "360": "1回転コマンド",
  "720": "2回転コマンド",
  "2828": "↓↑↓↑",
  "66": "前ダッシュ（ダッシュ入力）",
  "44": "後ろダッシュ（ダッシュ入力）",
};

// 方向入力の変換辞書
const directionDict: Record<string, string> = {
  "5": "ニュートラル",
  "1": "斜め下後ろ",
  "2": "下",
  "3": "斜め下前",
  "4": "後ろ",
  "6": "前",
  "7": "斜め上後ろ",
  "8": "上",
  "9": "斜め上前",
  "j.": "ジャンプ中",
  "cr.": "しゃがみ",
  "st.": "立ち",
};

/**
 * トークンの日本語説明を返す（tooltip表示用）
 * 説明がない場合はnullを返す
 * ※ ~ を含まない単一トークンを想定
 */
function getTokenDescription(token: string): string | null {
  // (W!)DI / (W! STN)DI などの「状態括弧 + システム技」パターン
  const wallStateSystemMatch = token.match(/^\((W! STN|W!)\)(DI|DRC|DR|DP)$/);
  if (wallStateSystemMatch) {
    const state = wallStateSystemMatch[1];
    const system = wallStateSystemMatch[2];
    const stateName = systemMoveDict[state] || state;
    const systemName = systemMoveDict[system] || system;
    return `${stateName} + ${systemName}`;
  }

  // (W!) / (W! STN) だけの状態表記
  const wallStateOnlyMatch = token.match(/^\((W! STN|W!)\)$/);
  if (wallStateOnlyMatch) {
    const state = wallStateOnlyMatch[1];
    return systemMoveDict[state] || state;
  }

  // ▲2LP / ▲5LK などのフレーム消費つき入力
  if (token.startsWith("▲")) {
    const rest = token.slice(1);
    const restDescription = getTokenDescription(rest);
    return restDescription ? `フレーム消費 + ${restDescription}` : "フレーム消費";
  }

  // DI(W! STN) / DI(W!) などの「システム技 + 状態括弧」パターン
  const diWallMatch = token.match(/^(DI|DRC|DR|DP)(\(W! STN\)|\(W!\))$/);
  if (diWallMatch) {
    const base = diWallMatch[1];
    const state = diWallMatch[2];
    const baseName = systemMoveDict[base] || base;
    const stateKey = state.replace(/[()]/g, "");
    const stateName = systemMoveDict[stateKey] || stateKey;
    return `${baseName} / ${stateName}`;
  }

  // (PC)DI / (PC)DRC などの「修飾子 + システム技」パターン
  const pcSystemMatch = token.match(/^\((PC|CH)\)(DI|DRC|DR|DP|SA1|SA2|SA3)$/);
  if (pcSystemMatch) {
    const modifier = pcSystemMatch[1];
    const system = pcSystemMatch[2];
    const modName = modifierDescriptionDict[modifier] || modifier;
    const sysName = systemMoveDict[system] || system;
    return `${modName} + ${sysName}`;
  }

  // (OD)236K などの「OD + コマンド技」パターン（~ なし）
  if (token.startsWith("(OD)")) {
    const rest = token.replace("(OD)", "");
    const motionMatch = rest.match(/^(\d+)([A-Z]+)$/);
    if (motionMatch) {
      const motion = motionMatch[1];
      const button = motionMatch[2];
      const motionName = motionDict[motion] || motion;
      const buttonName = normalMoveDict[button] || button;
      return `オーバードライブ技 ${buttonName}${motionName}`;
    }
    return "オーバードライブ技";
  }

  // (PC)2LP などの「修飾子 + 通常技/コマンド技」パターン（~ なし）
  if (token.startsWith("(PC)")) {
    const rest = token.replace("(PC)", "");
    if (rest === "") return modifierDescriptionDict["PC"];
    if (normalMoveDict[rest]) {
      return `${modifierDescriptionDict["PC"]} + ${normalMoveDict[rest]}`;
    }
    const motionMatch = rest.match(/^(\d+)([A-Z]+)$/);
    if (motionMatch) {
      const motion = motionMatch[1];
      const button = motionMatch[2];
      const motionName = motionDict[motion] || motion;
      const buttonName = normalMoveDict[button] || button;
      return `${modifierDescriptionDict["PC"]} + ${buttonName}${motionName}`;
    }
    return modifierDescriptionDict["PC"];
  }

  // (CH)2LP などの「カウンターヒット + 通常技/コマンド技」パターン（~ なし）
  if (token.startsWith("(CH)")) {
    const rest = token.replace("(CH)", "");
    if (rest === "") return modifierDescriptionDict["CH"];
    if (normalMoveDict[rest]) {
      return `${modifierDescriptionDict["CH"]} + ${normalMoveDict[rest]}`;
    }
    const motionMatch = rest.match(/^(\d+)([A-Z]+)$/);
    if (motionMatch) {
      const motion = motionMatch[1];
      const button = motionMatch[2];
      const motionName = motionDict[motion] || motion;
      const buttonName = normalMoveDict[button] || button;
      return `${modifierDescriptionDict["CH"]} + ${buttonName}${motionName}`;
    }
    return modifierDescriptionDict["CH"];
  }

  // 括弧内の内容は除外（上記パターンに当てはまらないもの）
  if (token.includes("(")) {
    return null;
  }

  // 通常技の変換
  if (normalMoveDict[token]) {
    return normalMoveDict[token];
  }

  // システム技の変換
  if (systemMoveDict[token]) {
    return modifierDescriptionDict[token] || systemMoveDict[token];
  }

  // モーション + ボタンの組み合わせ（例: 236LK, 623HP）
  const motionButtonMatch = token.match(/^(\d+)([A-Z]+)$/);
  if (motionButtonMatch) {
    const motion = motionButtonMatch[1];
    const button = motionButtonMatch[2];
    const motionName = motionDict[motion];
    const buttonName = normalMoveDict[button];
    if (motionName && buttonName) {
      return `${buttonName}${motionName}`;
    }
    if (motionName) return motionName;
  }

  // 数字のみ（方向入力）
  if (directionDict[token]) {
    return directionDict[token];
  }

  return null;
}

/**
 * トークン型定義
 */

export function formatOdNotationForDisplay(notation: string): string {
  return notation.replace(/\(OD\)(j\.)?(\d+)([PK])(?![PK])(\[\d+\])?/g, (_match, jump = "", motion, button, charge = "") => {
    return `(OD)${jump}${motion}${button}${button}${charge}`;
  });
}

export type NotationToken = {
  symbol: string;       // 元の記号表記
  description: string | null; // 日本語説明（nullなら説明なし）
  isSeparator: boolean; // セパレータ（> xx ~ スペース）かどうか
};

/**
 * 単一の生トークン文字列を NotationToken[] に展開する
 * - ~ を含む場合は分割して個別トークン + ~ セパレータに展開
 * - (PC)5HP~HP → [(PC)5HP, ~, HP]
 * - (OD)236P~6MK → [(OD)236P, ~, 6MK]
 * - 214HK~6P~6MK → [214HK, ~, 6P, ~, 6MK]
 */
function expandTildeToken(raw: string): NotationToken[] {
  // ~ を含まない場合はそのまま
  if (!raw.includes("~")) {
    return [{ symbol: raw, description: getTokenDescription(raw), isSeparator: false }];
  }

  // 括弧修飾子プレフィックスを抽出：(PC), (CH), (OD)
  // 例: (PC)5HP~HP → prefix="(PC)", rest="5HP~HP"
  // 例: (OD)236P~6MK → prefix="(OD)", rest="236P~6MK"
  const prefixMatch = raw.match(/^(\((?:PC|CH|OD)\))(.+)$/);

  if (prefixMatch) {
    const prefix = prefixMatch[1]; // "(PC)" / "(CH)" / "(OD)"
    const rest = prefixMatch[2];   // "5HP~HP" / "236P~6MK"
    const parts = rest.split("~");
    const result: NotationToken[] = [];

    parts.forEach((part, idx) => {
      // 最初のパーツにのみプレフィックスを付与
      const symbol = idx === 0 ? `${prefix}${part}` : part;
      const description = getTokenDescription(symbol);
      result.push({ symbol, description, isSeparator: false });
      if (idx < parts.length - 1) {
        result.push({ symbol: "~", description: null, isSeparator: true });
      }
    });
    return result;
  }

  // プレフィックスなし：そのまま ~ で分割
  const parts = raw.split("~");
  const result: NotationToken[] = [];
  parts.forEach((part, idx) => {
    result.push({ symbol: part, description: getTokenDescription(part), isSeparator: false });
    if (idx < parts.length - 1) {
      result.push({ symbol: "~", description: null, isSeparator: true });
    }
  });
  return result;
}

/**
 * コンボ表記をトークン配列に分割
 * 各トークンに日本語説明を付与
 */
export function tokenizeNotation(notation: string): NotationToken[] {
  // 事前処理：スペースを含む複合パターンを一時的に置換
  const placeholders: Record<string, string> = {};
  let processed = formatOdNotationForDisplay(notation);

  const complexPatterns = [
    { pattern: /\(W! STN\)DI/g, key: "W_STN_DI" },
    { pattern: /\(W!\)DI/g, key: "W_DI" },
    { pattern: /\(W! STN\)/g, key: "W_STN" },
    { pattern: /\(W!\)/g, key: "W" },
    { pattern: /\bDI\(W! STN\)/g, key: "DI_W_STN" },
    { pattern: /\bDI\(W!\)/g, key: "DI_W" },
    { pattern: /\bDRC\(W! STN\)/g, key: "DRC_W_STN" },
    { pattern: /\bDRC\(W!\)/g, key: "DRC_W" },
    { pattern: /\bDR\(W! STN\)/g, key: "DR_W_STN" },
    { pattern: /\bDR\(W!\)/g, key: "DR_W" },
  ];

  for (const { pattern, key } of complexPatterns) {
    if (pattern.test(processed)) {
      processed = processed.replace(pattern, `__${key}__`);
      placeholders[`__${key}__`] = notation.match(pattern)?.[0] || key;
    }
  }

  // セパレータ（> xx スペース）で分割してトークン化
  const rawTokens = processed.split(/(\s+|(?<!\w)>(?!\w)|(?<!\w)xx(?!\w))/);

  const result: NotationToken[] = [];

  for (const raw of rawTokens) {
    if (!raw) continue;

    // スペースやセパレータ
    if (/^\s+$/.test(raw) || raw === ">") {
      result.push({ symbol: raw, description: null, isSeparator: true });
      continue;
    }
    // xx はキャンセル記号 → tooltip付きトークンとして扱う
    if (raw === "xx") {
      result.push({ symbol: raw, description: "キャンセル（次の技でキャンセル）", isSeparator: false });
      continue;
    }

    // プレースホルダーを元に戻す
    const original = placeholders[raw] || raw;

    // ~ を含むトークンは expandTildeToken で個別分割
    if (original.includes("~")) {
      result.push(...expandTildeToken(original));
      continue;
    }

    const description = getTokenDescription(original);
    result.push({ symbol: original, description, isSeparator: false });
  }

  return result;
}

/**
 * 後方互換性のため残す（旧インライン変換）
 * @deprecated tokenizeNotation を使用してください
 */
export function convertToHybridNotation(notation: string): string {
  return formatOdNotationForDisplay(notation);
}

/**
 * 記号表記のみを返す（通常表示用）
 */
export function getSymbolNotation(notation: string): string {
  return formatOdNotationForDisplay(notation);
}
