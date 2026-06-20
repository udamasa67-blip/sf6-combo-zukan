import { type ComboData } from "./comboData";

/**
 * キャラクター共通設定型
 * 各キャラ専用ページで使用するデータ構造
 */
export interface CharacterConfig {
  // キャラ基本情報
  id: string;                          // キャラID（elena, ingrid等）
  name: string;                        // キャラ名
  nameJp: string;                      // キャラ名（日本語）
  title: string;                       // ページタイトル
  subtitle: string;                    // ページサブタイトル
  seoTitle?: string;                    // 検索結果向けタイトル
  seoDescription?: string;              // 検索結果向け説明文
  beginnerComboIds?: number[];          // 初見ユーザー向けのおすすめコンボ番号
  beginnerSteps?: Array<{                 // START HERE専用設定
    comboId: number;
    note?: string;
    description?: string;
    filterPurpose?: string;
    candidateComboIds?: number[];
    starterDamageMin?: number;
    useSetupFrame?: boolean;
  }>;

  // ビジュアル設定
  colors: {
    primary: string;                   // プライマリカラー（16進数）
    accent: string;                    // アクセントカラー（16進数）
    background: string;                // 背景グラデーション
  };

  // メタ情報
  description: string;                 // キャラクター説明
  comboTheoryHeading?: string;          // コンボ理論見出し
  comboTheory: string;                 // コンボ理論説明
  comboTheoryDetail?: string;          // コンボ理論詳細

  // パッチ情報
  patchFindings: Array<{
    date: string;
    change: string;
    comboImpact: string;
    confidence: string;
  }>;

  // コンボデータ
  combos: ComboData[];

  // 参考資料
  sources?: Array<{
    title: string;
    url: string;
    type: "guide" | "video" | "wiki" | "community";
    language: "ja" | "en";
    description?: string;
  }>;

  // フィルター選択肢（キャラごとにカスタマイズ可能）
  filterOptions?: {
    positions?: string[];
    purposes?: string[];
    situationTags?: string[];
  };
}

/**
 * キャラクター設定の登録
 */
export const characterRegistry: Record<string, CharacterConfig> = {};

/**
 * キャラクター設定を登録
 */
export function registerCharacter(config: CharacterConfig) {
  characterRegistry[config.id] = config;
}

/**
 * キャラクター設定を取得
 */
export function getCharacterConfig(characterId: string): CharacterConfig | null {
  return characterRegistry[characterId] || null;
}

/**
 * 登録済みキャラクター一覧を取得
 */
export function getAvailableCharacters(): CharacterConfig[] {
  return Object.values(characterRegistry);
}
