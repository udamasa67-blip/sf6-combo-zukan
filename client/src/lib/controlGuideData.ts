/**
 * 操作方式ガイド（クラシック・モダン操作の違い）
 * 各キャラクターのクラシック操作とモダン操作の違いを管理
 */

export interface UnavailableTechnique {
  name: string;           // 技名（日本語）
  notation: string;       // 表記（LP, HP, HK等）
  type: 'normal' | 'special' | 'super';  // 技の種類
  description: string;    // 説明
}

export interface LimitedTechnique {
  name: string;           // 技名（日本語）
  notation: string;       // 表記
  type: 'normal' | 'special' | 'super';
  classicVersions: string[];  // クラシックで使用可能な強度（「弱」「中」「強」等）
  modernVersions: string[];   // モダンで使用可能な強度
  limitation: string;     // 制限内容
  description: string;    // 説明
}

export interface FullySupportedTechnique {
  name: string;           // 技名（日本語）
  notation: string;       // 表記
  type: 'normal' | 'special' | 'super';
  description: string;    // 説明
}

export interface ControlGuide {
  characterId: string;
  characterName: string;
  
  // モダン操作で使用不可の技
  unavailableInModern: {
    normals: UnavailableTechnique[];      // 通常技
    specials: UnavailableTechnique[];     // 特殊技
  };
  
  // モダン操作で制限がある技
  limitedInModern: LimitedTechnique[];
  
  // モダン操作で完全対応の必殺技
  fullySupportedSpecials: FullySupportedTechnique[];
  
  // モダン適性の評価
  modernSuitability: {
    rating: 'very_high' | 'high' | 'moderate' | 'low';  // 「非常に高い」「高い」「中程度」「低い」
    summary: string;  // 総評
    concerns: string[];  // 懸念点
  };
  
  // 補足情報
  notes: string[];
}

// キャラクター別ガイドデータ
export const controlGuides: Record<string, ControlGuide> = {};
