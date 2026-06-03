/**
 * 技名検索システムと操作方式判定ロジック
 * 技名からコマンドを検索し、クラシック・モダン操作の対応状況を判定
 */

import { elenaControlGuide } from './characters/elena-control-guide';
import { ingridControlGuide } from './characters/ingrid-control-guide';
import { ControlGuide, LimitedTechnique, UnavailableTechnique } from './controlGuideData';

export interface MoveSearchResult {
  name: string;
  notation: string;
  type: 'normal' | 'special' | 'super';
  description: string;
  classicCommands: string[];
  modernCommands: string[];
  unavailableInModern: string[];
  isFullySupported: boolean;
  limitations?: string;
}

export interface ComboViabilityResult {
  isModernCompatible: boolean;
  isClassicOnly: boolean;
  incompatibleMoves: string[];
  warnings: string[];
}

type Technique = LimitedTechnique | UnavailableTechnique;

/**
 * 技名から操作方式ガイドを検索
 */
export function searchMoveByName(
  moveName: string,
  characterId: string = 'elena'
): MoveSearchResult | null {
  const guide = getControlGuideByCharacter(characterId);
  if (!guide) return null;

  // 技名を正規化（大文字・小文字・スペース対応）
  const normalizedSearch = moveName.toLowerCase().trim();

  // 使用不可の技を検索
  for (const tech of guide.unavailableInModern.normals) {
    if (tech.name.toLowerCase().includes(normalizedSearch)) {
      return {
        name: tech.name,
        notation: tech.notation,
        type: tech.type,
        description: tech.description,
        classicCommands: [tech.notation],
        modernCommands: [],
        unavailableInModern: [tech.notation],
        isFullySupported: false,
        limitations: `モダン操作では使用不可。${tech.description}`,
      };
    }
  }

  for (const tech of guide.unavailableInModern.specials) {
    if (tech.name.toLowerCase().includes(normalizedSearch)) {
      return {
        name: tech.name,
        notation: tech.notation,
        type: tech.type,
        description: tech.description,
        classicCommands: [tech.notation],
        modernCommands: [],
        unavailableInModern: [tech.notation],
        isFullySupported: false,
        limitations: `モダン操作では使用不可。${tech.description}`,
      };
    }
  }

  // 制限がある技を検索
  for (const tech of guide.limitedInModern) {
    if (tech.name.toLowerCase().includes(normalizedSearch)) {
      const unavailableVersions = tech.classicVersions.filter(
        (v) => !tech.modernVersions.includes(v)
      );
      return {
        name: tech.name,
        notation: tech.notation,
        type: tech.type,
        description: tech.description,
        classicCommands: tech.classicVersions.map((v) => `${v}版`),
        modernCommands: tech.modernVersions.map((v) => `${v}版`),
        unavailableInModern: unavailableVersions.map((v) => `${v}版`),
        isFullySupported: false,
        limitations: tech.limitation,
      };
    }
  }

  // 完全対応の技を検索
  for (const tech of guide.fullySupportedSpecials) {
    if (tech.name.toLowerCase().includes(normalizedSearch)) {
      return {
        name: tech.name,
        notation: tech.notation,
        type: tech.type,
        description: tech.description,
        classicCommands: ['全強度対応'],
        modernCommands: ['全強度対応'],
        unavailableInModern: [],
        isFullySupported: true,
      };
    }
  }

  return null;
}

/**
 * コンボ記法からクラシック・モダン操作の対応状況を判定
 */
export function analyzeComboViability(
  notation: string,
  characterId: string = 'elena'
): ComboViabilityResult {
  const guide = getControlGuideByCharacter(characterId);
  if (!guide) {
    return {
      isModernCompatible: true,
      isClassicOnly: false,
      incompatibleMoves: [],
      warnings: [],
    };
  }

  const incompatibleMoves: string[] = [];
  const warnings: string[] = [];
  let hasLimitedTechnique = false;

  // コンボ記法をトークン化して各技を抽出
  const tokens = tokenizeNotation(notation);

  for (const token of tokens) {
    if (!token || token.length === 0) continue;

    // 使用不可の技をチェック
    for (const tech of guide.unavailableInModern.normals) {
      if (matchesTechniqueToken(token, tech)) {
        incompatibleMoves.push(tech.name);
      }
    }

    for (const tech of guide.unavailableInModern.specials) {
      if (matchesTechniqueToken(token, tech)) {
        incompatibleMoves.push(tech.name);
      }
    }

    // 制限がある技をチェック
    for (const tech of guide.limitedInModern) {
      if (matchesTechniqueToken(token, tech)) {
        // 強度を抽出（LP, MP, HP, K等）
        const strength = extractStrength(token);
        if (strength && !tech.modernVersions.includes(strength)) {
          warnings.push(
            `${tech.name}の${strength}版はモダン操作では使用不可です`
          );
          hasLimitedTechnique = true;
        }
      }
    }
  }

  return {
    isModernCompatible: incompatibleMoves.length === 0 && warnings.length === 0,
    isClassicOnly: incompatibleMoves.length > 0 || warnings.length > 0,
    incompatibleMoves: Array.from(new Set(incompatibleMoves)),
    warnings: hasLimitedTechnique ? warnings : [],
  };
}

function tokenizeNotation(notation: string): string[] {
  return notation
    .replace(/[（）]/g, " ")
    .split(/\s+|xx|>|~/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeToken(token: string): string {
  return token
    .toUpperCase()
    .replace(/\(OD\)|\(PC\)|\(CH\)|\(W! STN\)|\(W!\)|OD|▲|\+|,|：|:/g, "")
    .trim();
}

function expandNotation(notation: string): string[] {
  const normalized = notation.toUpperCase().replace(/\s+/g, "");
  const primaryNotation = normalized.split(/[>~]/)[0];
  const motionMatch = primaryNotation.match(/^(\d+)(LP|MP|HP|LK|MK|HK)(?:\/(LP|MP|HP|LK|MK|HK))*$/);
  if (motionMatch) {
    const motion = motionMatch[1];
    const strengths = primaryNotation.slice(motion.length).split("/");
    return strengths.map((strength) => `${motion}${strength}`);
  }
  if (primaryNotation.includes("/")) {
    return primaryNotation.split("/");
  }
  return [primaryNotation];
}

function matchesTechniqueToken(token: string, tech: Technique): boolean {
  const normalizedToken = normalizeToken(token);
  const notations = expandNotation(tech.notation);

  if (tech.type === "normal") {
    return notations.some((notation) => {
      const escaped = notation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (/^[1-9]/.test(notation)) {
        return new RegExp(`^${escaped}$`).test(normalizedToken);
      }
      return new RegExp(`^[1-9]?${escaped}$`).test(normalizedToken);
    });
  }

  return notations.some((notation) => normalizedToken.includes(notation));
}

/**
 * トークンから技の強度を抽出（弱・中・強）
 */
function extractStrength(token: string): string | null {
  const normalizedToken = normalizeToken(token);
  if (normalizedToken.includes('LP') || normalizedToken.includes('LK')) return '弱';
  if (normalizedToken.includes('MP') || normalizedToken.includes('MK')) return '中';
  if (normalizedToken.includes('HP') || normalizedToken.includes('HK')) return '強';
  if (normalizedToken.includes('L')) return '弱';
  if (normalizedToken.includes('M')) return '中';
  if (normalizedToken.includes('H')) return '強';
  return null;
}

/**
 * キャラクターIDからコントロールガイドを取得
 */
function getControlGuideByCharacter(characterId: string): ControlGuide | null {
  switch (characterId.toLowerCase()) {
    case 'elena':
      return elenaControlGuide;
    case 'ingrid':
      return ingridControlGuide;
    default:
      return null;
  }
}

/**
 * 技名の自動補完候補を取得
 */
export function getMoveAutocompleteSuggestions(
  query: string,
  characterId: string = 'elena'
): string[] {
  const guide = getControlGuideByCharacter(characterId);
  if (!guide) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: string[] = [];

  // 使用不可の技から候補を抽出
  for (const tech of [
    ...guide.unavailableInModern.normals,
    ...guide.unavailableInModern.specials,
  ]) {
    if (tech.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.push(tech.name);
    }
  }

  // 制限がある技から候補を抽出
  for (const tech of guide.limitedInModern) {
    if (tech.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.push(tech.name);
    }
  }

  // 完全対応の技から候補を抽出
  for (const tech of guide.fullySupportedSpecials) {
    if (tech.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.push(tech.name);
    }
  }

  // 重複を削除
  return Array.from(new Set(suggestions));
}

/**
 * 全ての技を取得（検索用）
 */
export function getAllMoves(characterId: string = 'elena'): MoveSearchResult[] {
  const guide = getControlGuideByCharacter(characterId);
  if (!guide) return [];

  const moves: MoveSearchResult[] = [];

  // 使用不可の技
  for (const tech of guide.unavailableInModern.normals) {
    moves.push({
      name: tech.name,
      notation: tech.notation,
      type: tech.type,
      description: tech.description,
      classicCommands: [tech.notation],
      modernCommands: [],
      unavailableInModern: [tech.notation],
      isFullySupported: false,
      limitations: `モダン操作では使用不可。${tech.description}`,
    });
  }

  for (const tech of guide.unavailableInModern.specials) {
    moves.push({
      name: tech.name,
      notation: tech.notation,
      type: tech.type,
      description: tech.description,
      classicCommands: [tech.notation],
      modernCommands: [],
      unavailableInModern: [tech.notation],
      isFullySupported: false,
      limitations: `モダン操作では使用不可。${tech.description}`,
    });
  }

  // 制限がある技
  for (const tech of guide.limitedInModern) {
    const unavailableVersions = tech.classicVersions.filter(
      (v) => !tech.modernVersions.includes(v)
    );
    moves.push({
      name: tech.name,
      notation: tech.notation,
      type: tech.type,
      description: tech.description,
      classicCommands: tech.classicVersions.map((v) => `${v}版`),
      modernCommands: tech.modernVersions.map((v) => `${v}版`),
      unavailableInModern: unavailableVersions.map((v) => `${v}版`),
      isFullySupported: false,
      limitations: tech.limitation,
    });
  }

  // 完全対応の技
  for (const tech of guide.fullySupportedSpecials) {
    moves.push({
      name: tech.name,
      notation: tech.notation,
      type: tech.type,
      description: tech.description,
      classicCommands: ['全強度対応'],
      modernCommands: ['全強度対応'],
      unavailableInModern: [],
      isFullySupported: true,
    });
  }

  return moves;
}
