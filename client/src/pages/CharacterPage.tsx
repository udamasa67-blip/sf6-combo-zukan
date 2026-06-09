/*
Design reminder: Editorial Afro-Modernism × Competitive Data Desk.
Keep the full report in a dark, premium analytical atmosphere.
*/
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { analyzeComboViability } from "@/lib/moveSearchSystem";
import {
  BookOpen,
  Filter,
  Search,
  Zap,
} from "lucide-react";
import { type CharacterConfig, getCharacterConfig } from "@/lib/characterConfig";
import { type ComboVideoAsset, type VideoReference } from "@/lib/comboData";
import { DriveGauge } from "@/components/DriveGauge";
import { NotationDisplay } from "@/components/TokenTooltip";
import { ControlGuide } from "@/components/ControlGuide";
import { ComboVideo } from "@/components/ComboVideo";
import { elenaControlGuide } from "@/lib/characters/elena-control-guide";
import { ingridControlGuide } from "@/lib/characters/ingrid-control-guide";
import {
  canFilterSetupFrame,
  formatComboRouteForDisplay,
  getSetupFrameFromDescription,
  type SetupFrameFilter,
} from "@/lib/comboRouteDisplay";
import { matchesComboKeyword } from "@/lib/comboKeyword";
import { normalizeSearchText } from "@/lib/searchText";
import { formatComboNotationPreference } from "@/lib/comboNotationPreferences";
import type { DirectionNotationMode, NotationMode } from "@/lib/sf6ClickBuilderNotation";

type Combo = {
  id: number;
  starter: string;
  route: string;
  position: string;
  damage: number;
  damageLabel?: string;
  knockdown: string;
  drive: number;
  super: number;
  difficulty: "易" | "中" | "難";
  purpose: string;
  postPatchNote: string;
  isPatchImpacted?: boolean;
  patchImpactType?: "rhino-horn" | "sa1" | "sa2" | "general";
  videoAsset?: ComboVideoAsset;
  videoReferences?: VideoReference[];
  driveGaugeCost?: { driveCost: number; minimumDriveRequired: number; burnout: boolean };
  stock?: string;
};

type BeginnerStepItem = {
  combo: Combo;
  note?: string;
  filterPurpose?: string;
  starterDamageMin?: number;
  useSetupFrame?: boolean;
};

type PatchFinding = {
  date: string;
  change: string;
  comboImpact: string;
  confidence: string;
};

const DRIVE_GAUGE_MAX = 6;

function formatDriveGaugeValue(value: number) {
  return Math.min(DRIVE_GAUGE_MAX, value);
}

function formatDriveGaugeConsumption(combo: Pick<Combo, "drive" | "driveGaugeCost">) {
  const drive = formatDriveGaugeValue(combo.drive);
  const minimum = combo.driveGaugeCost
    ? formatDriveGaugeValue(combo.driveGaugeCost.minimumDriveRequired)
    : undefined;

  if (minimum === undefined || minimum === drive) return String(drive);
  return `${drive}（最低${minimum}）`;
}

function NotationPreferenceControls({
  directionMode,
  notationMode,
  onDirectionModeChange,
  onNotationModeChange,
}: {
  directionMode: DirectionNotationMode;
  notationMode: NotationMode;
  onDirectionModeChange: (mode: DirectionNotationMode) => void;
  onNotationModeChange: (mode: NotationMode) => void;
}) {
  return (
    <div className="notation-preference-controls" aria-label="入力コマンド表示切り替え">
      <div className="notation-preference-group" aria-label="方向表記">
        <span>方向</span>
        <div>
          <button
            type="button"
            className={directionMode === "arrow" ? "active" : ""}
            onClick={() => onDirectionModeChange("arrow")}
            aria-pressed={directionMode === "arrow"}
          >
            矢印
          </button>
          <button
            type="button"
            className={directionMode === "number" ? "active" : ""}
            onClick={() => onDirectionModeChange("number")}
            aria-pressed={directionMode === "number"}
          >
            数字
          </button>
        </div>
      </div>
      <div className="notation-preference-group attack" aria-label="攻撃表記">
        <span>攻撃</span>
        <div>
          <button
            type="button"
            className={notationMode === "en" ? "active" : ""}
            onClick={() => onNotationModeChange("en")}
            aria-pressed={notationMode === "en"}
          >
            LP
          </button>
          <button
            type="button"
            className={notationMode === "jp" ? "active" : ""}
            onClick={() => onNotationModeChange("jp")}
            aria-pressed={notationMode === "jp"}
          >
            弱P
          </button>
        </div>
      </div>
    </div>
  );
}

interface CharacterPageProps {
  characterId?: string;
  config?: CharacterConfig;
}

function HPGaugeDisplay({ damage }: { damage: number }) {
  const maxHP = 10000;
  const currentHP = Math.max(0, maxHP - damage);
  const damagePercent = Math.max(0, Math.min(100, (damage / maxHP) * 100));

  // ダメージ部分の幅を計算
  const damageWidth =
    damagePercent >= 100
      ? 'calc(100% - 2px)'
      : `calc(${damagePercent}% + 12px)`;

  const isDanger = damage <= 2500; // ダメージが2500以下の場合は危険（黄色表示）

  // ダメージ部分が青（左側）、残り体力がグレー（右側）
  const damageGradient = isDanger
    ? 'linear-gradient(90deg, #f7ef72 0%, #f5e85d 35%, #efd93d 70%, #e6c92a 100%)'
    : 'linear-gradient(90deg, #2d7cff 0%, #2a6df1 35%, #1f57c9 70%, #173f99 100%)';

  const damageGlow = isDanger
    ? 'inset 0 2px 4px rgba(255,255,255,0.22), 0 0 18px rgba(255,235,120,0.65)'
    : 'inset 1px 0 0 rgba(255,255,255,0.75), inset 0 2px 4px rgba(255,255,255,0.18), 0 0 14px rgba(59,130,246,0.45)';

  // ひし形は体力バーの47%位置に右端を合わせる
  const baselinePercent = 47; // 4700HP / 10000HP = 47%

  const diamonds = [
    {
      start: '#1cff1c',
      end: '#12c812',
      glow: 'rgba(60,255,60,0.45)',
    },
    {
      start: '#45ff1f',
      end: '#2fd318',
      glow: 'rgba(90,255,60,0.45)',
    },
    {
      start: '#b9f11d',
      end: '#96d812',
      glow: 'rgba(200,255,80,0.4)',
    },
    {
      start: '#c7ef1f',
      end: '#a8d816',
      glow: 'rgba(220,255,90,0.4)',
    },
    {
      start: '#d6eb22',
      end: '#b9d816',
      glow: 'rgba(240,255,100,0.42)',
    },
    {
      start: '#ecec58',
      end: '#d9dc48',
      glow: 'rgba(255,245,140,0.32)',
    },
  ];

  return (
    <div className="hp-gauge-container">
      <div className="hp-gauge-bar" style={{
        position: 'relative',
        height: '33px',
        width: '100%',
        overflow: 'visible',
        borderRadius: '4px',
        backgroundColor: '#27272a',
        paddingLeft: '12px',
        paddingRight: '12px',
      }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'skewX(-20deg)',
            transformOrigin: 'left center',
            background: '#d8d2c8',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '0px',
            top: '2px',
            height: '29px',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
            width: damageWidth,
            transform: 'skewX(-20deg)',
            transformOrigin: 'left center',
            background: damageGradient,
            boxShadow: damageGlow,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '40%',
              width: '100%',
              opacity: 0.3,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>
      </div>

      <div style={{
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        width: `${baselinePercent}%`,
        gap: '4px',
      }}>
        {diamonds.map((diamond, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              height: '12px',
              flex: 1,
              overflow: 'hidden',
              transform: 'skewX(-20deg)',
              background: '#d8d2c8',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '1px',
                background: `linear-gradient(90deg, ${diamond.start} 0%, ${diamond.end} 100%)`,
                boxShadow:
                  index === diamonds.length - 1
                    ? `0 0 12px ${diamond.glow}`
                    : 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoriteButton({
  comboId,
  isFavorite,
  onToggle,
}: {
  comboId: number;
  isFavorite: boolean;
  onToggle: (comboId: number) => void;
}) {
  return (
    <button
      onClick={() => onToggle(comboId)}
      className={`favorite-button ${isFavorite ? "active" : ""}`}
      title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <span className="favorite-icon">★</span>
    </button>
  );
}

function PatchBadge({ type }: { type?: "rhino-horn" | "sa1" | "sa2" | "general" }) {
  if (!type) return null;
  
  const badgeConfig = {
    "rhino-horn": { label: "ライノホーン", color: "bg-orange-600" },
    "sa1": { label: "SA1 強化", color: "bg-green-600" },
    "sa2": { label: "SA2 回復", color: "bg-blue-600" },
    "general": { label: "パッチ対象", color: "bg-purple-600" },
  };
  
  const config = badgeConfig[type];
  return (
    <span className={`patch-badge ${config.color}`}>
      <Zap size={12} />
      {config.label}
    </span>
  );
}

export default function CharacterPage({ characterId, config }: CharacterPageProps) {
  // characterIdから設定を取得
  const resolvedConfig = config || (characterId ? getCharacterConfig(characterId) : null);

  if (!resolvedConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">キャラクターが見つかりません</p>
      </div>
    );
  }

  const [selectedPosition, setSelectedPosition] = useState("すべて");
  const [selectedPurpose, setSelectedPurpose] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("damage");
  const [maxDrive, setMaxDrive] = useState(6);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesLoadedKey, setFavoritesLoadedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "control-guide">("all");
  const [selectedControlScheme, setSelectedControlScheme] = useState<"classic" | "modern">("classic");
  const [setupFrameFilter, setSetupFrameFilter] = useState<SetupFrameFilter | null>(null);
  const [setupSourceComboId, setSetupSourceComboId] = useState<number | null>(null);
  const [singleLinkedComboId, setSingleLinkedComboId] = useState<number | null>(null);
  const [singleLinkReturn, setSingleLinkReturn] = useState<{ comboId: number; purpose: string } | null>(null);
  const [starterDamageMinFilter, setStarterDamageMinFilter] = useState<number | null>(null);
  const [showIngridSa2Branches, setShowIngridSa2Branches] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [routeDirectionMode, setRouteDirectionMode] = useState<DirectionNotationMode>("number");
  const [routeNotationMode, setRouteNotationMode] = useState<NotationMode>("en");

  // 操作方式ガイドを取得
  const getControlGuide = () => {
    if (characterId === "ingrid") return ingridControlGuide;
    return elenaControlGuide;
  };
  const controlGuide = getControlGuide();

  useEffect(() => {
    setFavoritesLoadedKey(null);
    if (typeof window === "undefined" || !window.localStorage) {
      setFavorites([]);
      setFavoritesLoadedKey(resolvedConfig.id);
      return;
    }

    const stored = window.localStorage.getItem(`sf6-combo-favorites:${resolvedConfig.id}`);
    if (!stored) {
      setFavorites([]);
      setFavoritesLoadedKey(resolvedConfig.id);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setFavorites(Array.isArray(parsed) ? parsed.filter((id) => Number.isFinite(id)) : []);
    } catch {
      setFavorites([]);
    }
    setFavoritesLoadedKey(resolvedConfig.id);
  }, [resolvedConfig.id]);

  useEffect(() => {
    if (favoritesLoadedKey !== resolvedConfig.id) return;
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(`sf6-combo-favorites:${resolvedConfig.id}`, JSON.stringify(favorites));
  }, [favorites, favoritesLoadedKey, resolvedConfig.id]);

  useEffect(() => {
    const title =
      resolvedConfig.seoTitle ||
      `SF6 ${resolvedConfig.nameJp} コンボまとめ 2026 | ${resolvedConfig.title}`;
    const description = resolvedConfig.seoDescription || resolvedConfig.description;
    const canonicalPath = `/${resolvedConfig.id}`;

    if (window.location.pathname === "/" && resolvedConfig.id === "elena") {
      window.history.replaceState(null, "", canonicalPath);
    }

    document.title = title;

    const setMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes)
          .filter(([key]) => key !== "content")
          .forEach(([key, value]) => element?.setAttribute(key, value));
        document.head.appendChild(element);
      }
      if (attributes.content) element.setAttribute("content", attributes.content);
    };

    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: `${window.location.origin}${canonicalPath}` });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${canonicalPath}`;
  }, [resolvedConfig]);

  // Map comboData to Combo type
  const combos: Combo[] = useMemo(
    () =>
      resolvedConfig.combos.map((data) => ({
        id: parseInt(data.id.replace("combo_", "")) || data.number,
        starter: data.title,
        route: data.notation,
        position: data.position,
        damage: data.damage,
        damageLabel: (data as any).damageLabel,
        knockdown: data.knockdown,
        drive: (data as any).driveConsumption || 0,
        super: (data as any).superConsumption || 0,
        difficulty: data.difficulty,
        purpose: data.startup,
        postPatchNote: data.description,
        isPatchImpacted: (data as any).isPatchImpacted || false,
        patchImpactType: (data as any).patchImpactType,
        videoAsset: data.videoAsset,
        videoReferences: data.videoReferences || [],
        driveGaugeCost: (data as any).driveGaugeCost,
        stock: (data as any).stock,
      })),
    [resolvedConfig.combos]
  );

  const shouldShowStock = resolvedConfig.id === "ingrid";

  const beginnerSteps = useMemo<BeginnerStepItem[]>(() => {
    if (resolvedConfig.beginnerSteps?.length) {
      return resolvedConfig.beginnerSteps
        .map((step) => {
          const combo = combos.find((item) => item.id === step.comboId);
          return combo ? { ...step, combo } : null;
        })
        .filter((step): step is NonNullable<typeof step> => Boolean(step));
    }

    const ids = resolvedConfig.beginnerComboIds || combos.slice(0, 3).map((combo) => combo.id);
    return ids
      .map((id) => {
        const combo = combos.find((item) => item.id === id);
        return combo ? { combo } : null;
      })
      .filter((step): step is NonNullable<typeof step> => Boolean(step));
  }, [combos, resolvedConfig.beginnerComboIds, resolvedConfig.beginnerSteps]);

  const positionOptions = resolvedConfig.filterOptions?.positions || [
    "すべて",
    "どこでも",
    "端",
    "端付近",
  ];
  const purposeOptions = resolvedConfig.filterOptions?.purposes || [
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
  ];

  // フィルタリング
  const filteredCombos = useMemo(() => {
    return combos.filter((combo) => {
      // 位置フィルター：「端付近」を選択した場合は「端」も含む
      const positionMatch =
        selectedPosition === "すべて" ||
        combo.position === selectedPosition ||
        (selectedPosition === "端付近" && combo.position === "端");
      const purposeMatch = matchesComboKeyword(combo.purpose, selectedPurpose);
      const driveMatch = combo.driveGaugeCost && combo.driveGaugeCost.minimumDriveRequired <= maxDrive;
      const normalizedSearch = normalizeSearchText(searchQuery);
      const searchMatch =
        normalizedSearch === "" ||
        normalizeSearchText(`#${combo.id.toString().padStart(2, "0")}`).includes(normalizedSearch) ||
        combo.id.toString().includes(normalizedSearch) ||
        combo.damage.toString().includes(normalizedSearch) ||
        normalizeSearchText(combo.route).includes(normalizedSearch) ||
        normalizeSearchText(combo.starter).includes(normalizedSearch) ||
        normalizeSearchText(combo.position).includes(normalizedSearch) ||
        normalizeSearchText(combo.purpose).includes(normalizedSearch) ||
        normalizeSearchText(combo.knockdown).includes(normalizedSearch) ||
        normalizeSearchText(combo.postPatchNote).includes(normalizedSearch);
      const favoriteMatch = activeTab !== "favorites" || favorites.includes(combo.id);

      const controlSchemeMatch =
        selectedControlScheme === "classic" ||
        analyzeComboViability(combo.route, resolvedConfig.id).isModernCompatible;
      const setupFrameMatch =
        !setupFrameFilter ||
        getSetupFrameFromDescription(combo.postPatchNote) === setupFrameFilter;
      const starterDamageMatch =
        !starterDamageMinFilter ||
        combo.damage >= starterDamageMinFilter;

      return positionMatch && purposeMatch && driveMatch && searchMatch && favoriteMatch && controlSchemeMatch && setupFrameMatch && starterDamageMatch;
    });
  }, [combos, selectedPosition, selectedPurpose, maxDrive, searchQuery, activeTab, favorites, selectedControlScheme, resolvedConfig.id, setupFrameFilter, starterDamageMinFilter]);

  const searchViability = useMemo(() => {
    if (selectedControlScheme !== "modern" || !searchQuery.trim()) return null;
    const result = analyzeComboViability(searchQuery, resolvedConfig.id);
    return result.isModernCompatible ? null : result;
  }, [searchQuery, selectedControlScheme, resolvedConfig.id]);

  const availableSetupFrames = useMemo(() => {
    const frames = new Set<SetupFrameFilter>();
    combos.forEach((combo) => {
      const frame = getSetupFrameFromDescription(combo.postPatchNote);
      if (frame) frames.add(frame);
    });
    return frames;
  }, [combos]);

  const canOpenSetupFrame = (combo: Pick<Combo, "knockdown">): combo is Pick<Combo, "knockdown"> & { knockdown: SetupFrameFilter } =>
    canFilterSetupFrame(combo.knockdown) && availableSetupFrames.has(combo.knockdown);

  // ソート
  const sortedCombos = useMemo(() => {
    const sorted = [...filteredCombos];
    switch (sortBy) {
      case "damage":
        return sorted.sort((a, b) => b.damage - a.damage);
      case "knockdown":
        return sorted.sort((a, b) => {
          const aVal = parseInt(a.knockdown) || 0;
          const bVal = parseInt(b.knockdown) || 0;
          return bVal - aVal;
        });
      case "efficiency":
        return sorted.sort((a, b) => {
          const aEff = a.damage / (a.drive || 1);
          const bEff = b.damage / (b.drive || 1);
          return bEff - aEff;
        });
      case "patch":
        return sorted.sort((a, b) => {
          if (a.isPatchImpacted && !b.isPatchImpacted) return -1;
          if (!a.isPatchImpacted && b.isPatchImpacted) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  }, [filteredCombos, sortBy]);

  // パッチ情報
  const patchFindings: PatchFinding[] = resolvedConfig.patchFindings || [];

  // 統計情報
  const noGaugeCount = sortedCombos.filter((c) => c.drive === 0 && c.super === 0).length;
  const postPatchCount = sortedCombos.filter((c) => c.isPatchImpacted).length;

  const toggleFavorite = (comboId: number) => {
    setFavorites((prev) =>
      prev.includes(comboId) ? prev.filter((id) => id !== comboId) : [...prev, comboId]
    );
  };

  const clearSetupFrameFilter = (resetRouteFilters = false) => {
    if (resetRouteFilters && singleLinkReturn) {
      setSelectedPosition("すべて");
      setSelectedPurpose(singleLinkReturn.purpose);
      setSearchQuery("");
      setMaxDrive(6);
      setActiveTab("all");
      setSetupFrameFilter(null);
      setSetupSourceComboId(singleLinkReturn.comboId);
      setSingleLinkedComboId(null);
      setSingleLinkReturn(null);
      setStarterDamageMinFilter(null);
      setShowIngridSa2Branches(false);
      return;
    }

    setSetupFrameFilter(null);
    setSetupSourceComboId(null);
    setSingleLinkedComboId(null);
    setSingleLinkReturn(null);
    setStarterDamageMinFilter(null);
    setShowIngridSa2Branches(false);

    if (resetRouteFilters) {
      setSelectedPosition("すべて");
      setSelectedPurpose("すべて");
      setSearchQuery("");
      setMaxDrive(6);
      setActiveTab("all");
    }
  };

  const applySetupFrameFilter = (frame: SetupFrameFilter, comboId: number) => {
    setSelectedPosition("すべて");
    setSelectedPurpose("すべて");
    setSearchQuery("");
    setMaxDrive(6);
    setActiveTab("all");
    setSetupFrameFilter(frame);
    setSetupSourceComboId(comboId);
    setSingleLinkedComboId(null);
    setSingleLinkReturn(null);
    setStarterDamageMinFilter(null);
    setShowIngridSa2Branches(false);
    window.setTimeout(() => {
      document.getElementById("combos")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const applyStarterComboFilter = (step: BeginnerStepItem, index: number) => {
    const { combo } = step;
    setSelectedPosition("すべて");
    setSelectedPurpose("すべて");
    setSearchQuery("");
    setMaxDrive(6);
    setActiveTab("all");

    if (step.filterPurpose) {
      setSelectedPurpose(step.filterPurpose);
      setSetupFrameFilter(null);
      setSetupSourceComboId(combo.id);
      setSingleLinkedComboId(null);
      setSingleLinkReturn(null);
      setStarterDamageMinFilter(step.starterDamageMin ?? null);
      setShowIngridSa2Branches(false);
      window.setTimeout(() => {
        document.getElementById("combos")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    if ((step.useSetupFrame ?? index < 2) && canOpenSetupFrame(combo)) {
      setSetupFrameFilter(combo.knockdown as SetupFrameFilter);
      setSetupSourceComboId(combo.id);
      setSingleLinkedComboId(null);
      setSingleLinkReturn(null);
      setStarterDamageMinFilter(null);
      setShowIngridSa2Branches(false);
      return;
    }

    setSetupFrameFilter(null);
    setSetupSourceComboId(null);
    setSingleLinkedComboId(null);
    setSingleLinkReturn(null);
    setStarterDamageMinFilter(step.starterDamageMin ?? 5000);
    setShowIngridSa2Branches(false);
  };

  const applyComboDescriptionLink = (
    comboId: number,
    purpose: string,
    returnTarget?: { comboId: number; purpose: string },
    sourceComboId = comboId,
  ) => {
    setSelectedPosition("すべて");
    setSelectedPurpose(purpose);
    setSearchQuery("");
    setMaxDrive(6);
    setActiveTab("all");
    setSetupFrameFilter(null);
    setSetupSourceComboId(sourceComboId);
    setSingleLinkedComboId(comboId);
    setSingleLinkReturn(returnTarget ?? null);
    setStarterDamageMinFilter(null);
    setShowIngridSa2Branches(false);
    window.setTimeout(() => {
      document.getElementById("combos")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const setupSourceCombo = setupSourceComboId
    ? combos.find((combo) => combo.id === setupSourceComboId) ?? null
    : null;
  const isIngridStep1BranchView = resolvedConfig.id === "ingrid" && setupSourceCombo?.id === 34 && selectedPurpose === "その他" && !singleLinkedComboId;
  const isIngridStep2BranchView = resolvedConfig.id === "ingrid" && setupSourceCombo?.id === 26 && selectedPurpose === "起き攻め" && !singleLinkedComboId;
  const isSa2BranchCombo = (combo: Combo) => normalizeSearchText(combo.route).includes("sa2");
  const isSunflareCombo = (combo: Combo) => combo.starter.includes("サンフレア") || combo.postPatchNote.includes("サンフレア");
  const baseVisibleCombos = setupSourceCombo
    ? singleLinkedComboId
      ? singleLinkedComboId === setupSourceCombo.id
        ? []
        : sortedCombos.filter((combo) => combo.id === singleLinkedComboId)
      : sortedCombos.filter((combo) => combo.id !== setupSourceCombo.id)
    : sortedCombos;
  const shouldShowIngridSa2BranchCard = isIngridStep1BranchView && !showIngridSa2Branches && baseVisibleCombos.some(isSa2BranchCombo);
  const visibleCombos = isIngridStep1BranchView
    ? showIngridSa2Branches
      ? baseVisibleCombos.filter(isSa2BranchCombo)
      : baseVisibleCombos.filter((combo) => !isSa2BranchCombo(combo))
    : isIngridStep2BranchView
      ? baseVisibleCombos.filter((combo) => !isSunflareCombo(combo))
      : baseVisibleCombos;
  const displayedComboCount = visibleCombos.length + (setupSourceCombo ? 1 : 0) + (shouldShowIngridSa2BranchCard ? 1 : 0);
  const setupRouteSizeClass = !setupSourceCombo
    ? ""
    : (visibleCombos.length + (shouldShowIngridSa2BranchCard ? 1 : 0)) <= 3
      ? "setup-route-small"
      : (visibleCombos.length + (shouldShowIngridSa2BranchCard ? 1 : 0)) <= 6
        ? "setup-route-medium"
        : "setup-route-large";

  const formatRouteForCardDisplay = (combo: Combo) =>
    formatComboNotationPreference(
      formatComboRouteForDisplay(combo.route, combo.postPatchNote),
      routeDirectionMode,
      routeNotationMode,
    );

  const renderComboDescription = (combo: Combo) => {
    const parts: ReactNode[] = [];
    const linkPattern = /#(\d+)の派生|インパクト返し可/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(combo.postPatchNote)) !== null) {
      if (match.index > lastIndex) {
        parts.push(combo.postPatchNote.slice(lastIndex, match.index));
      }

      const matchedText = match[0];
      const derivedComboId = match[1] ? Number(match[1]) : null;
      if (derivedComboId && combos.some((item) => item.id === derivedComboId)) {
        parts.push(
          <button
            key={`derived-${combo.id}-${derivedComboId}-${match.index}`}
            type="button"
            className="combo-description-link"
            onClick={() => applyComboDescriptionLink(derivedComboId, "すべて", undefined, combo.id)}
          >
            {matchedText}
          </button>
        );
      } else if (resolvedConfig.id === "ingrid" && combo.id === 26 && matchedText === "インパクト返し可") {
        parts.push(
          <button
            key={`impact-${combo.id}-${match.index}`}
            type="button"
            className="combo-description-link"
            onClick={() => applyComboDescriptionLink(32, "その他", { comboId: 26, purpose: "起き攻め" })}
          >
            {matchedText}
          </button>
        );
      } else {
        parts.push(matchedText);
      }

      lastIndex = match.index + matchedText.length;
    }

    if (lastIndex < combo.postPatchNote.length) {
      parts.push(combo.postPatchNote.slice(lastIndex));
    }

    return <p>{parts.length > 0 ? parts : combo.postPatchNote}</p>;
  };

  const renderIngridSa2BranchCard = () => {
    const branchCount = baseVisibleCombos.filter(isSa2BranchCombo).length;

    return (
      <article
        key="ingrid-sa2-branch-card"
        className="combo-card combo-branch-card has-next-card"
        role="button"
        tabIndex={0}
        onClick={() => setShowIngridSa2Branches(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setShowIngridSa2Branches(true);
          }
        }}
      >
        <div className="combo-topline">
          <span>派生</span>
          <b>その他</b>
          <em>中級〜上級</em>
        </div>
        <h3 className="combo-notation combo-branch-notation">SA2を含む派生</h3>
        <div className="combo-branch-summary">
          <strong>{branchCount}</strong>
          <span>件のSA2派生ルート</span>
        </div>
        <p>中級〜上級</p>
        <button type="button" className="setup-filter-clear" onClick={() => setShowIngridSa2Branches(true)}>
          派生一覧を見る
        </button>
      </article>
    );
  };

  const renderComboCard = (combo: Combo) => (
    <article id={`combo-card-${combo.id}`} key={combo.id} className={`combo-card ${canOpenSetupFrame(combo) ? "has-next-card" : ""}`}>
      <div className="combo-topline">
        <span>#{combo.id.toString().padStart(2, "0")}</span>
        <b>{combo.position}</b>
        <em>{combo.purpose}</em>
        <FavoriteButton comboId={combo.id} isFavorite={favorites.includes(combo.id)} onToggle={toggleFavorite} />
      </div>
      <h3 className="combo-notation"><NotationDisplay notation={formatRouteForCardDisplay(combo)} /></h3>
      <HPGaugeDisplay damage={combo.damage} />
      <div className={`combo-metrics ${shouldShowStock ? "has-stock" : ""}`}>
        <span className="metric-damage"><small>ダメージ</small><strong>{combo.damageLabel || combo.damage}</strong></span>
        <span className="metric-knockdown">
          <small>有利フレーム</small>
          {canOpenSetupFrame(combo) ? (
            <button
              type="button"
              className={`setup-frame-link ${setupFrameFilter === combo.knockdown ? "active" : ""}`}
              onClick={() => applySetupFrameFilter(combo.knockdown as SetupFrameFilter, combo.id)}
            >
              {combo.knockdown}
            </button>
          ) : (
            <strong>{combo.knockdown}</strong>
          )}
        </span>
        <span className="metric-super"><small>SAゲージ消費</small><strong>{combo.super}</strong></span>
        {shouldShowStock && <span className="metric-stock"><small>ストック</small><strong>{combo.stock || "0"}</strong></span>}
        <span className="metric-drive"><small>ドライブゲージ消費</small><strong>{formatDriveGaugeConsumption(combo)}</strong></span>
      </div>
      {renderComboDescription(combo)}
      <ComboVideo asset={combo.videoAsset} notation={formatRouteForCardDisplay(combo)} description={combo.postPatchNote} />
    </article>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* ヒーロー */}
      <section className="hero-shell" style={{ backgroundImage: `linear-gradient(90deg, rgba(6, 9, 7, .96), rgba(6, 9, 7, .74), rgba(6, 9, 7, .45))` }}>
        <div className="hero-grid">
          <nav className="research-rail" aria-label="レポート内ナビゲーション">
            <span className="rail-mark">{resolvedConfig.name.toUpperCase()} / 2026</span>
            <a href="#combo-theory">Theory</a>
            <a href="#starter-combos">Start</a>
            <a href="#combos">Combos</a>
          </nav>

          <article className="hero-content">
            <h1>{resolvedConfig.name} COMBO DESK</h1>
            <p>{resolvedConfig.description}</p>
            <div className="hero-actions">
              <a href="#starter-combos" className="cta-button">まず覚えるコンボ</a>
              <a href="#combos" className="cta-button">コンボを絞り込む</a>
            </div>
            <div className="character-selector">
              <p className="selector-label">他のキャラクターを見る</p>
              <div className="character-links">
                <a href="/elena" className={`character-link ${characterId === "elena" || !characterId ? "active" : ""}`}>エレナ</a>
                <a href="/ingrid" className={`character-link ${characterId === "ingrid" ? "active" : ""}`}>イングリッド</a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Combo Theory */}
      <section id="combo-theory" className="combo-theory-zone">
        <div className="section-heading">
          <p className="kicker">Combo theory</p>
          <h2>{resolvedConfig.comboTheoryHeading ?? `${resolvedConfig.name}の特徴`}</h2>
        </div>
        <article className="theory-content">
          <p>{resolvedConfig.comboTheory}</p>
        </article>
      </section>

      <section id="starter-combos" className="starter-combos-zone">
        <div className="section-heading">
          <p className="kicker">Start here</p>
          <h2>まず覚える{resolvedConfig.nameJp}コンボ</h2>
          <p>初見の人が迷わず触れるように、安定・起き攻め・リーサルの代表ルートを先に並べています。</p>
        </div>
        <div className="starter-combo-grid">
          {beginnerSteps.map((step, index) => {
            const { combo } = step;
            return (
            <article key={combo.id} className="starter-combo-card">
              <span className="starter-combo-rank">STEP {index + 1}</span>
              <div className="starter-combo-title">
                <strong>#{combo.id.toString().padStart(2, "0")} {combo.starter}</strong>
                <em>{combo.purpose}</em>
              </div>
              <p>{combo.postPatchNote}</p>
              <div className="starter-combo-metrics">
                <span>ダメージ <b>{combo.damageLabel || combo.damage}</b></span>
                <span>有利 <b>{combo.knockdown}</b></span>
                <span>Drive <b>{formatDriveGaugeValue(combo.drive)}</b></span>
              </div>
              {step.note && <p className="starter-combo-note">{step.note}</p>}
              <a
                href="#combos"
                className="starter-combo-link"
                onClick={() => applyStarterComboFilter(step, index)}
              >
                このコンボを見る
              </a>
            </article>
            );
          })}
        </div>
      </section>

      {/* Combos & Control Guide */}
      <section id="combos" className={`combo-zone ${setupSourceCombo ? "setup-route-zone" : ""}`}>
        <aside className="combo-filters">
          <div className="combo-tabs">
            <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              すべてのコンボ
            </button>
            <button className={`tab-button ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>
              お気に入り ({favorites.length})
            </button>
            <button className={`tab-button ${activeTab === "control-guide" ? "active" : ""}`} onClick={() => setActiveTab("control-guide")}>
              操作方式ガイド
            </button>
          </div>

          <button
            type="button"
            className="mobile-filter-toggle"
            onClick={() => setIsFilterPanelOpen((open) => !open)}
            aria-expanded={isFilterPanelOpen}
            aria-controls="combo-filter-panel"
          >
            絞り込み
            <span>{displayedComboCount}件</span>
          </button>

          <div id="combo-filter-panel" className={`combo-filter-panel ${isFilterPanelOpen ? "open" : ""}`}>
            <h3>Combo filters</h3>
            <label>
              位置
              <select value={selectedPosition} onChange={(event) => setSelectedPosition(event.target.value)}>
                {positionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label>
              用途
              <select value={selectedPurpose} onChange={(event) => setSelectedPurpose(event.target.value)}>
                {purposeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label>
              <DriveGauge value={maxDrive} onChange={setMaxDrive} />
            </label>

            <label>
              並び替え
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="damage">ダメージ高い順</option>
                <option value="knockdown">起き攻め有利順</option>
                <option value="efficiency">ゲージ効率順</option>
                <option value="patch">パッチ影響順</option>
              </select>
            </label>

            <div className="control-scheme-toggle" aria-label="入力候補の操作方式">
              <span>操作方式</span>
              <div className="control-scheme-options">
                <button
                  type="button"
                  className={selectedControlScheme === "classic" ? "active" : ""}
                  onClick={() => setSelectedControlScheme("classic")}
                >
                  クラシック
                </button>
                <button
                  type="button"
                  className={selectedControlScheme === "modern" ? "active" : ""}
                  onClick={() => setSelectedControlScheme("modern")}
                >
                  モダン
                </button>
              </div>
            </div>

            <label className="search-box">
              検索
              <span>
                <Search size={16} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="例: +42 / SA1 / 2MP"
                />
              </span>
            </label>

            {searchViability && (
              <div className="modern-command-warning">
                <strong>モダン非対応の入力です</strong>
                {searchViability.incompatibleMoves.length > 0 && (
                  <span>{searchViability.incompatibleMoves.join("・")}はモダンでは使用できません。</span>
                )}
                {searchViability.warnings.length > 0 && (
                  <span>{searchViability.warnings.join(" / ")}</span>
                )}
              </div>
            )}

            <div className="filter-readout">
              <strong>{displayedComboCount}</strong>
              <span>件を表示中</span>
              <small>ノーゲージ: {noGaugeCount} / パッチ対象: {postPatchCount}</small>
              {starterDamageMinFilter && (
                <button type="button" className="setup-filter-clear" onClick={() => clearSetupFrameFilter()}>
                  ダメージ{starterDamageMinFilter}以上を解除
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="combo-content">
          {activeTab === "control-guide" ? (
            <ControlGuide guide={controlGuide} />
          ) : (
            <>
              <div className="combo-route-heading">
                <div className="section-heading">
                  <p className="kicker">Route cards</p>
                  <h2>始動別コンボ一覧</h2>
                  <p>カードはダメージ、起き攻め有利、Drive/Super消費、次の連携候補を同時に確認できるよう構成しています。有利フレームから次のカードを開けるコンボは強調表示されます。</p>
                </div>
                <NotationPreferenceControls
                  directionMode={routeDirectionMode}
                  notationMode={routeNotationMode}
                  onDirectionModeChange={setRouteDirectionMode}
                  onNotationModeChange={setRouteNotationMode}
                />
              </div>
              <div className={setupSourceCombo ? `setup-route-board ${setupRouteSizeClass}` : "combo-grid"}>
                {setupSourceCombo && (
                  <article id={`combo-card-${setupSourceCombo.id}`} className={`combo-card setup-origin-card ${canOpenSetupFrame(setupSourceCombo) ? "has-next-card" : ""}`}>
                    <div className="combo-topline">
                      <span>#{setupSourceCombo.id.toString().padStart(2, "0")}</span>
                      <b>{setupSourceCombo.position}</b>
                      <em>{setupSourceCombo.purpose}</em>
                      <FavoriteButton comboId={setupSourceCombo.id} isFavorite={favorites.includes(setupSourceCombo.id)} onToggle={toggleFavorite} />
                    </div>
                    <h3 className="combo-notation"><NotationDisplay notation={formatRouteForCardDisplay(setupSourceCombo)} /></h3>
                    <HPGaugeDisplay damage={setupSourceCombo.damage} />
                    <div className={`combo-metrics ${shouldShowStock ? "has-stock" : ""}`}>
                      <span className="metric-damage"><small>ダメージ</small><strong>{setupSourceCombo.damageLabel || setupSourceCombo.damage}</strong></span>
                      <span className="metric-knockdown">
                        <small>有利フレーム</small>
                        {canOpenSetupFrame(setupSourceCombo) ? (
                          <button
                            type="button"
                            className={`setup-frame-link ${setupFrameFilter === setupSourceCombo.knockdown ? "active" : ""}`}
                            onClick={() => applySetupFrameFilter(setupSourceCombo.knockdown as SetupFrameFilter, setupSourceCombo.id)}
                          >
                            {setupSourceCombo.knockdown}
                          </button>
                        ) : (
                          <strong>{setupSourceCombo.knockdown}</strong>
                        )}
                      </span>
                      <span className="metric-super"><small>SAゲージ消費</small><strong>{setupSourceCombo.super}</strong></span>
                      {shouldShowStock && <span className="metric-stock"><small>ストック</small><strong>{setupSourceCombo.stock || "0"}</strong></span>}
                      <span className="metric-drive"><small>ドライブゲージ消費</small><strong>{formatDriveGaugeConsumption(setupSourceCombo)}</strong></span>
                    </div>
                    {renderComboDescription(setupSourceCombo)}
                    <ComboVideo asset={setupSourceCombo.videoAsset} notation={formatRouteForCardDisplay(setupSourceCombo)} description={setupSourceCombo.postPatchNote} />
                    <button type="button" className="setup-filter-clear" onClick={() => clearSetupFrameFilter(true)}>
                      連携解除
                    </button>
                  </article>
                )}
                {setupSourceCombo ? (
                  (visibleCombos.length > 0 || shouldShowIngridSa2BranchCard) && (
                    <div className="setup-route-candidates">
                      {visibleCombos.map(renderComboCard)}
                      {shouldShowIngridSa2BranchCard && renderIngridSa2BranchCard()}
                    </div>
                  )
                ) : (
                  visibleCombos.map(renderComboCard)
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Back button */}
      <div className="back-button-container">
        <a href="/" className="back-button">Main Menu</a>
      </div>
    </div>
  );
}
