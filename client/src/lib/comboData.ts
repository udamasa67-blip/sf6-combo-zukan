/*
Combo data structure with video references.
Each combo includes optional video links for reference.
*/

export interface VideoReference {
  title: string;
  url: string;
  description: string;
  language: "en" | "ja";
}

export interface ComboVideoAsset {
  video: string;
  poster: string;
  label?: string;
}

export function comboVideoAsset(id: string, label?: string): ComboVideoAsset {
  return {
    video: `/videos/${id}.webm`,
    poster: `/thumbs/${id}.webp`,
    label,
  };
}

export interface DriveGaugeCost {
  driveCost: number;                      // 通常総消費（小数点対応）
  minimumDriveRequired: number;           // 実行可能最低値（最後がDRなら0.75、それ以外は0.25以上で実行可能）
  burnout: boolean;                       // バーンアウト許容フラグ
}

export interface ComboData {
  id: string;
  number: number;
  title: string;
  startup: string;
  notation: string;
  damage: number;
  damageLabel?: string;                    // 表示用ダメージ（例: 4960(5248)）
  knockdown: string;
  position: "どこでも" | "端" | "端付近" | "近距離" | "どこでも/端で強化";
  difficulty: "易" | "中" | "難";
  driveGaugeCost?: DriveGaugeCost;        // ドライブゲージ詳細計算（notationから自動計算）
  stock?: string;                          // キャラ固有リソース表示（例: イングリッドのストック）
  description: string;
  patchNote?: string;
  isPatchImpacted?: boolean;
  patchImpactType?: "rhino-horn" | "sa1" | "sa2" | "general";
  videoAsset?: ComboVideoAsset;
  videoReferences?: VideoReference[];
  situationTags?: (
    | "端高火力" | "高火力" | "起き攻め" | "反撃" | "確認・安全" | "差し返し"
    | "スタン" | "OD伸ばし" | "DI端" | "DI反撃" | "崩し後" | "端起き攻め"
    | "差し返し安定" | "近距離安定" | "安定締め" | "パッチ注目" | "SA1追撃"
    | "SA2回復選択" | "ロール/セットプレイ" | "ライトCH" | "ライトPC"
    // 新規タグ
    | "温存" | "運び" | "リーサル" | "壁やられ" | "セットプレイ" | "その他"
    | "温存・運び" | "運び・起き攻め" | "温存・起き攻め" | "温存・運び・起き攻め"
    | "リーサル・その他" | "差し返し" | "(PC)DI"
  )[];
}

// ドライブゲージとSAゲージの消費量を自動計算する関数
export function calculateGaugeCost(notation: string): {
  driveConsumption: number;
  superConsumption: number;
  driveGaugeCost: DriveGaugeCost;
} {
  // ドライブゲージ項目を抽出
  const driveMatches = notation.match(/DRC|DI|DR(?!I)|\(OD\)/g) || [];
  
  // SAゲージ項目を抽出
  const saMatches = notation.match(/SA[123]/g) || [];
  
  // ドライブゲージ消費を計算
  let driveCost = 0;
  const driveCosts: Array<{ type: string; cost: number; minimumLastCost: number }> = [];
  
  for (const match of driveMatches) {
    let cost = 0;
    if (match === "(OD)") {
      cost = 2;
    } else if (match === "DI") {
      cost = 1;
    } else if (match === "DR") {
      cost = 1;
    } else if (match === "DRC") {
      cost = 3;
    }
    driveCosts.push({
      type: match,
      cost,
      minimumLastCost: match === "DR" ? 0.75 : 0.25,
    });
    driveCost += cost;
  }
  
  // 最低必要量を計算（最後のDrive項目のみ最低実行量に置き換え）
  let minimumDriveRequired = 0;
  if (driveCosts.length > 0) {
    for (let i = 0; i < driveCosts.length - 1; i++) {
      minimumDriveRequired += driveCosts[i].cost;
    }
    minimumDriveRequired += driveCosts[driveCosts.length - 1].minimumLastCost;
  }
  
  // バーンアウト判定
  const burnout = driveCost > minimumDriveRequired;
  
  // SAゲージ消費を計算
  let superConsumption = 0;
  for (const match of saMatches) {
    if (match === "SA1") {
      superConsumption += 1;
    } else if (match === "SA2") {
      superConsumption += 2;
    } else if (match === "SA3") {
      superConsumption += 3;
    }
  }
  
  // ドライブゲージ消費を整数に丸める（表示用）
  const driveConsumptionDisplay = Math.ceil(driveCost);
  
  return {
    driveConsumption: driveConsumptionDisplay,
    superConsumption,
    driveGaugeCost: {
      driveCost,
      minimumDriveRequired,
      burnout,
    },
  };
}

export const comboDataset: ComboData[] = [
  // ===== #15 端高火力 =====
  {
    id: "combo_15",
    number: 15,
    title: "強攻撃PC",
    startup: "リーサル",
    notation: "(PC)5HP~HP > DR > 2HP xx 214HK~6P~6MK > 236LK > (OD)236K xx SA3",
    damage: 5900,
    knockdown: "+24",
    position: "端付近",
    difficulty: "易",
    situationTags: ["リーサル・その他"],
    description: "端付近の安価な高火力。SA2締めに変えると約5020。",
    patchNote: "2026年3月以降で価値が上がった",
    isPatchImpacted: true,
    patchImpactType: "rhino-horn",
    videoAsset: {
      video: "/videos/combo_15.webm",
      poster: "/thumbs/combo_15.webp",
      label: "エレナ #15 強攻撃PC",
    },
    videoReferences: [
      {
        title: "Street Fighter 6 Elena Combos! Complete Combo Guide",
        url: "https://www.youtube.com/watch?v=G_aSayiIcGg",
        description: "VesperArcadeによる実用的なコンボガイド。PC系コンボの解説あり。",
        language: "en",
      },
    ],
  },
  // ===== #11 高火力 =====
  {
    id: "combo_11",
    number: 11,
    title: "中攻撃",
    startup: "リーサル",
    notation: "2MP xx DRC > 5MK > 2HP xx 214HK > DR > 2MP xx (OD)236P~6MK > 236MK xx SA3",
    damage: 5271,
    knockdown: "+24",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["リーサル"],
    description: "2MP確認から大放出。SA3締め。",
    videoAsset: comboVideoAsset("combo_11", "エレナ #11 中攻撃"),
    videoReferences: [
      {
        title: "ここから始めよう！エレナ基礎コンボと起き攻め",
        url: "https://www.youtube.com/watch?v=XJ7wPEuWk60",
        description: "Sea Leaf Dojoによる初心者向け基礎コンボガイド。",
        language: "ja",
      },
    ],
  },
  // ===== #12 SA2回復選択 =====
  {
    id: "combo_12",
    number: 12,
    title: "中攻撃PC",
    startup: "その他",
    notation: "(PC)5MK > 2MP xx (OD)214P~6P xx SA2",
    damage: 4146,
    knockdown: "+25",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["その他"],
    description: "SA2ホールド版で体力1600とドライブ1本回復を選べる局面。",
    patchNote: "SA2回復量1600に強化（2026年3月17日）",
    isPatchImpacted: true,
    patchImpactType: "sa2",
    videoAsset: comboVideoAsset("combo_12", "エレナ #12 中攻撃PC"),
    videoReferences: [
      {
        title: "Everything you need to know to Master Elena",
        url: "https://www.youtube.com/watch?v=8-19",
        description: "Brian_Fによるマスターランク向けガイド。SA活用法を解説。",
        language: "en",
      },
    ],
  },
  // ===== #20 スタン =====
  {
    id: "combo_20",
    number: 20,
    title: "スタン",
    startup: "スタン",
    notation: "DI(W! STN) > j.HP > 2HP xx (OD)236P~6LK > DR > 2LP xx 214MK~6P~6MK > SA1 > SA1 > 623HK",
    damage: 3967,
    knockdown: "+25",
    position: "端",
    difficulty: "中",
    situationTags: ["スタン"],
    description: "SA1を複数使う例。締めとしてはラウンド取得やドライブ削り目的。",
    videoAsset: comboVideoAsset("combo_20", "エレナ #20 スタン"),
    videoReferences: [],
  },
  // ===== #13 SA1追撃 =====
  {
    id: "combo_13",
    number: 13,
    title: "中攻撃PC",
    startup: "その他",
    notation: "(PC)5MP~MP xx (OD)236K > SA1 > 623HK",
    damage: 3400,
    knockdown: "+22",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["その他"],
    description: "ライノホーン連携強化でSA1を象徴するルート。",
    patchNote: "SA1吹き飛び時間増加で追撃が安定化（2026年3月17日）",
    isPatchImpacted: true,
    patchImpactType: "sa1",
    videoAsset: comboVideoAsset("combo_13", "エレナ #13 中攻撃PC"),
    videoReferences: [
      {
        title: "Street Fighter 6 Elena Combos! Complete Combo Guide",
        url: "https://www.youtube.com/watch?v=G_aSayiIcGg",
        description: "VesperArcadeによるSA活用コンボの解説。",
        language: "en",
      },
    ],
  },
  // ===== #18 DI端 =====
  {
    id: "combo_18",
    number: 18,
    title: "DI",
    startup: "壁やられ",
    notation: "DI(W!) > 5HP~HP > DR > 2HP xx 214MK~6P~6MK > 236LK > 623MK",
    damage: 3128,
    knockdown: "+25",
    position: "端",
    difficulty: "易",
    situationTags: ["壁やられ"],
    description: "ドライブインパクト壁やられからの実用例。",
    videoAsset: comboVideoAsset("combo_18", "エレナ #18 DI壁やられ"),
    videoReferences: [],
  },
  // ===== #19 DI反撃 =====
  {
    id: "combo_19",
    number: 19,
    title: "DI PC",
    startup: "(PC)DI",
    notation: "(PC)DI > 66 > 5HP~HP > DR > 2MK~HK > 214HP~6P",
    damage: 3056,
    knockdown: "+42",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["(PC)DI"],
    description: "前ダッシュしてから5HPを当てるのがポイント。",
    videoAsset: comboVideoAsset("combo_19", "エレナ #19 DI PC"),
    videoReferences: [],
  },
  // ===== #17 崩し後 =====
  {
    id: "combo_17",
    number: 17,
    title: "ロール/セットプレイ",
    startup: "セットプレイ",
    notation: "(PC)236P~6P~6HK > 5MP~MP xx 214LP~6P",
    damage: 2740,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["セットプレイ"],
    description: "+39後の236P~6HP~6HKロールの投げ読み・条件付け後に使う。",
    videoAsset: comboVideoAsset("combo_17", "エレナ #17 ロール/セットプレイ"),
    videoReferences: [],
  },
  // ===== #06 端起き攻め =====
  {
    id: "combo_06",
    number: 6,
    title: "ライトCH",
    startup: "運び・起き攻め",
    notation: "(CH)2LP > 5MK~HK xx (OD)214K~6P~6MK > 236LK > 623LK",
    damage: 2350,
    knockdown: "+39",
    position: "端付近",
    difficulty: "易",
    situationTags: ["運び・起き攻め"],
    description: "端付近で#05弱ライノホーンからスクラッチホイールへ。起き攻め重視。",
    videoAsset: comboVideoAsset("combo_06", "エレナ #06 ライトCH"),
    videoReferences: [
      {
        title: "ここから始めよう！エレナ基礎コンボと起き攻め",
        url: "https://www.youtube.com/watch?v=XJ7wPEuWk60",
        description: "起き攻めの基礎を学べるSea Leaf Dojoの動画。",
        language: "ja",
      },
    ],
  },
  // ===== #14 差し返し安定 =====
  {
    id: "combo_14",
    number: 14,
    title: "強攻撃",
    startup: "差し返し",
    notation: "5HP~HP > 2HK",
    damage: 2320,
    knockdown: "+37",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["差し返し"],
    description: "通常ヒットからの安定。距離次第で623K等も候補。",
    videoAsset: comboVideoAsset("combo_14", "エレナ #14 強攻撃"),
    videoReferences: [],
  },
  // ===== #05 OD伸ばし =====
  {
    id: "combo_05",
    number: 5,
    title: "ライトCH",
    startup: "運び",
    notation: "(CH)2LP > 5MK~HK xx (OD)214K~6P~6MK > 236MK",
    damage: 2280,
    knockdown: "+36",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["運び"],
    description: "ODスピニングサイズから中ライノホーンで締める実用伸ばし。",
    videoAsset: comboVideoAsset("combo_05", "エレナ #05 ライトCH"),
    videoReferences: [],
  },
  // ===== #16 差し返しOD =====
  {
    id: "combo_16",
    number: 16,
    title: "強攻撃PC",
    startup: "差し返し",
    notation: "(PC)5HK > (OD)236K",
    damage: 2280,
    knockdown: "+42",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["差し返し"],
    description: "SA2・SA3に派生可能。端ならSA1から623K追撃価値が上がる。",
    videoAsset: comboVideoAsset("combo_16", "エレナ #16 強攻撃PC"),
    videoReferences: [],
  },
  // ===== #09 差し返し =====
  {
    id: "combo_09",
    number: 9,
    title: "中攻撃",
    startup: "温存・起き攻め",
    notation: "5MP~MP xx 236MK",
    damage: 1960,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["温存・運び・起き攻め"],
    description: "立ち確認が必要だがノーゲージ最大リターン+39。",
    videoAsset: comboVideoAsset("combo_09", "エレナ #09 中攻撃"),
    videoReferences: [],
  },
  // ===== #10 確認・安全 =====
  {
    id: "combo_10",
    number: 10,
    title: "中攻撃",
    startup: "温存・起き攻め",
    notation: "2MP xx 214LP~6P",
    damage: 1880,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["温存・起き攻め"],
    description: "エレナ最強連携で確認が簡単+39。",
    videoAsset: comboVideoAsset("combo_10", "エレナ #10 中攻撃"),
    videoReferences: [],
  },
  // ===== #04 パッチ注目 =====
  {
    id: "combo_04",
    number: 4,
    title: "ライトCH",
    startup: "温存・運び",
    notation: "(CH)2LP > 5MK~HK xx 236HK",
    damage: 1820,
    knockdown: "+36",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["温存・運び"],
    description: "強ライノホーン調整の恩恵が大きい。近距離カウンター確認用。",
    patchNote: "強Rhino Horn吹き飛び時間増加で価値向上（2026年3月17日）",
    isPatchImpacted: true,
    patchImpactType: "rhino-horn",
    videoAsset: comboVideoAsset("combo_04", "エレナ #04 ライトCH"),
    videoReferences: [],
  },
  // ===== #07 反撃安定 =====
  {
    id: "combo_07",
    number: 7,
    title: "ライトPC",
    startup: "温存・起き攻め",
    notation: "(PC)2LP > 2MP xx 214LP~6P",
    damage: 1760,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["温存・起き攻め"],
    description: "近距離PC 2LP後の安定+39。",
    videoAsset: comboVideoAsset("combo_07", "エレナ #07 ライトPC"),
    videoReferences: [],
  },
  // ===== #08 近距離安定 =====
  {
    id: "combo_08",
    number: 8,
    title: "中P確認",
    startup: "その他",
    notation: "5MP~5MP xx (OD)236K > 623HK",
    damage: 2800,
    knockdown: "+22",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["その他"],
    description: "地上中P確認からの高火力。",
    videoAsset: comboVideoAsset("combo_08", "エレナ #08 中P確認"),
    videoReferences: [],
  },
  // ===== #03 起き攻め =====
  {
    id: "combo_03",
    number: 3,
    title: "ライト",
    startup: "起き攻め",
    notation: "2LP > 2LP > 2LP > 5LK xx 236LK",
    damage: 1480,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["起き攻め"],
    description: "立ち確認が必要だが+39を作れる。",
    videoAsset: comboVideoAsset("combo_03", "エレナ #03 ライト"),
    videoReferences: [],
  },
  // ===== #02 安定締め =====
  {
    id: "combo_02",
    number: 2,
    title: "ライト",
    startup: "温存",
    notation: "2LP > 2LP > 2LP > 5LK xx 623HK",
    damage: 1380,
    knockdown: "+22",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["温存"],
    description: "しゃがみ相手にも使いやすいスクラッチホイール締め。",
    videoAsset: comboVideoAsset("combo_02", "エレナ #02 ライト"),
    videoReferences: [],
  },
  // ===== #01 安定 =====
  {
    id: "combo_01",
    number: 1,
    title: "ライト",
    startup: "温存",
    notation: "2LP > 2LP > 5LP xx 214LK",
    damage: 1290,
    knockdown: "+34",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["温存"],
    description: "ノーゲージの基本。2LK始動や2LP×3への代替あり。",
    videoAsset: comboVideoAsset("combo_01", "エレナ #01 ライト"),
    videoReferences: [],
  },
  {
    id: "combo_21",
    number: 21,
    title: "(PC)DI運び",
    startup: "(PC)DI",
    notation: "(PC)DI > 66 > 5HP~5HP > DR > 2HP xx 214HK > 236HK",
    damage: 3397,
    knockdown: "+38",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["(PC)DI"],
    description: "運び用として",
    videoAsset: comboVideoAsset("combo_21", "エレナ #21 (PC)DI運び"),
    videoReferences: [],
  },
  {
    id: "combo_22",
    number: 22,
    title: "(PC)DI起き攻め",
    startup: "(PC)DI",
    notation: "(PC)DI > 66 > 5HP~5HP > DR > 2HP xx 214HK > DR > 2HK",
    damage: 3297,
    knockdown: "+39",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["(PC)DI"],
    description: "コンボ後236LP~6HKヒットで中段+4が可能",
    videoAsset: comboVideoAsset("combo_22", "エレナ #22 (PC)DI起き攻め"),
    videoReferences: [],
  },
  {
    id: "combo_23",
    number: 23,
    title: "(PC)DIゲージ回復",
    startup: "(PC)DI",
    notation: "(PC)DI > 66 > 2MK xx 214MK~6LP~6MK > 236MK",
    damage: 3240,
    knockdown: "+36",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["(PC)DI"],
    description: "ドライブゲージ回復目的。壁付近であれば最後236LK > 623LKも可",
    videoAsset: comboVideoAsset("combo_23", "エレナ #23 (PC)DIゲージ回復"),
    videoReferences: [],
  },
  {
    id: "combo_24",
    number: 24,
    title: "壁やられ高火力",
    startup: "壁やられ",
    notation: "DI(W!) > 2MP xx 214MK~6LP~6MK > 236LK > 623MK",
    damage: 2888,
    knockdown: "+25",
    position: "端",
    difficulty: "難",
    situationTags: ["壁やられ"],
    description: "リーサルなければこれも選択肢。前ダッシュ＋5〜投げなど",
    videoAsset: comboVideoAsset("combo_24", "エレナ #24 壁やられ高火力"),
    videoReferences: [],
  },
  {
    id: "combo_25",
    number: 25,
    title: "壁やられセットプレイ",
    startup: "壁やられ",
    notation: "DI(W!) > 2MP xx 214MK~6LP~6MK > 623LK > 623LK",
    damage: 2832,
    knockdown: "+36",
    position: "端",
    difficulty: "難",
    situationTags: ["壁やられ"],
    description: "リーサルなければこれ！+36セットプレイへ",
    videoAsset: comboVideoAsset("combo_25", "エレナ #25 壁やられセットプレイ"),
    videoReferences: [],
  },
  {
    id: "combo_26",
    number: 26,
    title: "セットプレイ安全",
    startup: "セットプレイ",
    notation: "236LP > MK > MK~HK xx 214LP~6P",
    damage: 2240,
    knockdown: "+42",
    position: "端",
    difficulty: "中",
    situationTags: ["セットプレイ"],
    description: "+36から再度+42の安全跳びへ",
    videoAsset: comboVideoAsset("combo_26", "エレナ #26 セットプレイ安全"),
    videoReferences: [],
  },
  {
    id: "combo_27",
    number: 27,
    title: "セットプレイリーサル",
    startup: "セットプレイ",
    notation: "236LP > MK > MK~HK xx (OD)214K > 6LP~6MK > 236LK > (OD)236K > SA3",
    damage: 5070,
    knockdown: "+24",
    position: "端",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+36からリーサル用高火力コンボ",
    videoAsset: comboVideoAsset("combo_27", "エレナ #27 セットプレイリーサル"),
    videoReferences: [],
  },
  {
    id: "combo_28",
    number: 28,
    title: "セットプレイ再セット",
    startup: "セットプレイ",
    notation: "236LP > MK > MK~HK xx (OD)214K > 6LP~6MK > 236LK > 623LK",
    damage: 3030,
    knockdown: "+39",
    position: "端",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+36から再度+39のセットプレイ可",
    videoAsset: comboVideoAsset("combo_28", "エレナ #28 セットプレイ再セット"),
    videoReferences: [],
  },
  {
    id: "combo_29",
    number: 29,
    title: "セットプレイ継続",
    startup: "セットプレイ",
    notation: "236LP > MK > MK~HK xx (OD)214K > 6LP~6MK > 623LK > 623LK",
    damage: 3090,
    knockdown: "+37",
    position: "端",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+36からのコンボその後5LP埋めからの6MKヒットで+4コンボへ",
    videoAsset: comboVideoAsset("combo_29", "エレナ #29 セットプレイ継続"),
    videoReferences: [],
  },
  {
    id: "combo_30",
    number: 30,
    title: "ロール中段択",
    startup: "セットプレイ",
    notation: "236LP~HK > 2LP xx 214LK",
    damage: 1670,
    knockdown: "+34",
    position: "どこでも",
    difficulty: "易",
    situationTags: ["セットプレイ"],
    description: "+39から中段択最後623HKで2020ダメSA1 > 623HKで2680ダメ",
    videoAsset: comboVideoAsset("combo_30", "エレナ #30 ロール中段択"),
    videoReferences: [],
  },
  {
    id: "combo_31",
    number: 31,
    title: "ロール中段択運び",
    startup: "セットプレイ",
    notation: "236LP~HK > 2LP xx DRC > 2LP > 2HP xx 214HK > DR > 2MP > 236HK > 623LK",
    damage: 2580,
    knockdown: "+36",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+39から中段択壁際から画面端まで運び+36へ",
    videoAsset: comboVideoAsset("combo_31", "エレナ #31 ロール中段択運び"),
    videoReferences: [],
  },
  {
    id: "combo_32",
    number: 32,
    title: "ロール中段択再択",
    startup: "セットプレイ",
    notation: "236LP~HK > 2LP xx DRC > 2LP > 2HP xx 214HK > 236MK",
    damage: 2429,
    knockdown: "+37",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+39から中段択画面端までギリ届かない時再度中段択5LP埋めからの6MKヒットで+4コンボへ",
    videoAsset: comboVideoAsset("combo_32", "エレナ #32 ロール中段択再択"),
    videoReferences: [],
  },
  {
    id: "combo_33",
    number: 33,
    title: "ロール回復ルート",
    startup: "セットプレイ",
    notation: "236LP~6HP~6LK > (OD)236K xx SA2",
    damage: 4360,
    knockdown: "+25",
    position: "どこでも",
    difficulty: "難",
    situationTags: ["セットプレイ"],
    description: "+39からヒット時にSA2で回復選択ルート",
    videoAsset: comboVideoAsset("combo_33", "エレナ #33 ロール回復ルート"),
    videoReferences: [],
  },
  {
    id: "combo_34",
    number: 34,
    title: "ドライブラッシュ先端",
    startup: "起き攻め",
    notation: "DR > 5LP > 2MP xx DRC > 5MK > 2HP xx 214HK > 236LK > 623LK",
    damage: 2342,
    knockdown: "+36",
    position: "端付近",
    difficulty: "中",
    situationTags: ["起き攻め"],
    description: "ドライブラッシュ先端5LPから2MP安定。ラッシュ待ちにも判定勝ちしやすい。",
    videoAsset: comboVideoAsset("combo_34", "エレナ #34 ドライブラッシュ先端"),
    videoReferences: [],
  },
  {
    id: "combo_35",
    number: 35,
    title: "フレーム消費投げ",
    startup: "セットプレイ",
    notation: "投げ",
    damage: 1200,
    knockdown: "+24",
    position: "端",
    difficulty: "易",
    situationTags: ["セットプレイ"],
    description: "+36からの2LP>5LKフレーム消費で+4からの投げ。",
    videoAsset: comboVideoAsset("combo_35", "エレナ #35 フレーム消費投げ"),
    videoReferences: [],
  },
  {
    id: "combo_36",
    number: 36,
    title: "安全跳びパニカン",
    startup: "起き攻め",
    notation: "(PC)5HP > 5HP > DR > 2MK~2HK xx 623LK",
    damage: 2914,
    knockdown: "+42",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["起き攻め"],
    description: "前ジャンプHPで相手の起き上がりに関わらず安全跳び。",
    videoAsset: comboVideoAsset("combo_36", "エレナ #36 安全跳びパニカン"),
    videoReferences: [],
  },
  {
    id: "combo_37",
    number: 37,
    title: "安全跳びジャンプ始動",
    startup: "起き攻め",
    notation: "j.HP > 2HP xx 214HK > DR > 2MP xx 236LP~6MK",
    damage: 3244,
    knockdown: "+42",
    position: "どこでも",
    difficulty: "中",
    situationTags: ["起き攻め"],
    description: "前ジャンプHPで相手の起き上がりに関わらず安全跳び。",
    videoAsset: comboVideoAsset("combo_37", "エレナ #37 安全跳びジャンプ始動"),
    videoReferences: [],
  },
];

// 計算結果をコンボデータに追加
export const comboDataWithCalculations = comboDataset.map((combo) => {
  const calculation = calculateGaugeCost(combo.notation);
  return {
    ...combo,
    driveConsumption: calculation.driveConsumption,
    superConsumption: calculation.superConsumption,
    driveGaugeCost: calculation.driveGaugeCost,
  };
});
