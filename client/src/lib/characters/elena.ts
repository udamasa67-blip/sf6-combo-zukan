import { type CharacterConfig, registerCharacter } from "../characterConfig";
import { comboDataWithCalculations } from "../comboData";

const elenaConfig: CharacterConfig = {
  id: "elena",
  name: "Elena",
  nameJp: "エレナ",
  title: "ELENA COMBO DESK",
  subtitle: "2026年3月17日アップデート対応",
  seoTitle: "SF6 エレナ コンボ集｜起き攻め・リーサル・Drive効率検索",
  seoDescription:
    "SF6 エレナのコンボ集。起き攻め・リーサル・Drive効率を検索できます。",
  beginnerComboIds: [10, 34, 11],

  colors: {
    primary: "#22c55e",      // 緑
    accent: "#fbbf24",       // 金
    background: "linear-gradient(135deg, #0b100d 0%, #1a1410 50%, #0d0f0a 100%)",
  },

  description:
    "2026年3月17日アップデートで意味が増した強ライノホーン、SA1追撃、SA2ホールド回復を中心に、エレナの実用コンボを始動・位置・ゲージ消費・起き攻め有利で比較できる静的レポートです。",

  comboTheoryHeading: "エレナは「締めの有利」で次の択を作る",

  comboTheory:
    "エレナは+36、+39、+42のノックダウン有利を作る締めが重要。代表例はライノホーンの236LK/MK後、ムーングライド後、端の236LK > 623LK後。",

  patchFindings: [
    {
      date: "2026-03-17",
      change: "強ライノホーン（236HK）のヒット時吹き飛び時間増加",
      comboImpact:
        "中央ヒット後の状況が良くなり、画面端での追撃内容が改善。5MK~HKやCH 2LPからの236HK締めの価値が上がる。",
      confidence: "高",
    },
    {
      date: "2026-03-17",
      change: "SA1 （236236K）の地上ヒット時吹き飛び時間増加",
      comboImpact:
        "OD ライノホーンが連続ヒットしやすくなり、端でSA1後の追撃と攻勢継続が強化。",
      confidence: "高",
    },
    {
      date: "2026-03-17",
      change: "SA2 (236236P)ホールド版の回復量1300→1600、ドライブ1本回復追加",
      comboImpact:
        "高補正コンボやバーンアウト付近で、ダメージより体力・ドライブ回復を重視する判断が明確化。",
      confidence: "高",
    },
    {
      date: "2026-04-15",
      change: "確認中：236LK（弱ライノホーン）の追加調整の可能性",
      comboImpact:
        "確認中。パッチルートは3月17日の強化点を中心に評価します。",
      confidence: "中",
    },
  ],

  combos: comboDataWithCalculations,

  filterOptions: {
    positions: ["すべて", "どこでも", "端", "端付近"],
    purposes: [
      "すべて",
      "温存",
      "起き攻め",
      "運び",
      "リーサル",
      "差し返し",
      "セットプレイ",
      "(PC)DI",
      "壁やられ",
      "スタン",
      "その他",
    ],
    situationTags: [
      "温存",
      "起き攻め",
      "運び",
      "リーサル",
      "差し返し",
      "セットプレイ",
      "(PC)DI",
      "壁やられ",
      "スタン",
      "その他",
    ],
  },
};

// エレナを登録
registerCharacter(elenaConfig);

export default elenaConfig;
