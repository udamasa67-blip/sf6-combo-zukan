import { useCallback, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ATTACK_TOKENS,
  CROUCH_ATTACK_TOKENS,
  STAND_ATTACK_TOKENS,
  DIRECTION_TOKENS,
  MOTION_TOKENS,
  CANCEL_TOKENS,
  MODIFIER_TOKENS,
  TOKEN_MAP,
  buildNotation,
  formatTokenLabel,
  formatTokenNotation,
  type ComboEntry,
  type DirectionNotationMode,
  type NotationMode,
  type PaletteToken,
} from "@/lib/sf6ClickBuilderNotation";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] text-cyan-200 uppercase tracking-widest font-mono mb-1 mt-2 first:mt-0">
      {children}
    </p>
  );
}

function PaletteButton({
  token,
  onAdd,
  notationMode,
  directionMode,
}: {
  token: PaletteToken;
  onAdd: (id: string) => void;
  notationMode: NotationMode;
  directionMode: DirectionNotationMode;
}) {
  const [pressing, setPressing] = useState(false);

  const handleClick = () => {
    setPressing(true);
    onAdd(token.id);
    setTimeout(() => setPressing(false), 160);
  };

  return (
    <button
      onClick={handleClick}
      className={`palette-btn ${token.color} ${token.border} ${token.textColor} px-2.5 py-1 text-xs`}
      style={{
        boxShadow: pressing
          ? `0 0 12px ${token.glowColor}, 0 0 24px ${token.glowColor}`
          : undefined,
        transition: "box-shadow 120ms ease-out, transform 120ms ease-out",
      }}
    >
      {formatTokenLabel(token, notationMode, directionMode)}
    </button>
  );
}

function DirectionNumpad({
  onAdd,
  directionMode,
}: {
  onAdd: (id: string) => void;
  directionMode: DirectionNotationMode;
}) {
  const numpadLayout = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
  ];

  const dirLabels: Record<string, string> = {
    "7": "↖", "8": "↑", "9": "↗",
    "4": "←", "5": "N", "6": "→",
    "1": "↙", "2": "↓", "3": "↘",
  };

  return (
    <div className="flex flex-col gap-1">
      {numpadLayout.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((num) => (
            <button
              key={num}
              onClick={() => onAdd(num)}
              className="palette-btn bg-slate-800 border border-slate-500 text-slate-200 w-10 h-10 flex flex-col items-center justify-center leading-none"
            >
              <span className="text-lg">
                {directionMode === "arrow" ? dirLabels[num] : num}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function AttackGrid({
  tokens,
  cols,
  onAdd,
  notationMode,
  directionMode,
}: {
  tokens: PaletteToken[];
  cols: number;
  onAdd: (id: string) => void;
  notationMode: NotationMode;
  directionMode: DirectionNotationMode;
}) {
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {tokens.map((t) => (
        <PaletteButton
          key={t.id}
          token={t}
          onAdd={onAdd}
          notationMode={notationMode}
          directionMode={directionMode}
        />
      ))}
    </div>
  );
}

function ComboChip({
  entry,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
  notationMode,
  directionMode,
}: {
  entry: ComboEntry;
  index: number;
  onRemove: (uid: string) => void;
  onDragStart: (uid: string) => void;
  onDragOver: (uid: string) => void;
  onDrop: (targetUid: string) => void;
  isDragging: boolean;
  isDragOver: boolean;
  notationMode: NotationMode;
  directionMode: DirectionNotationMode;
}) {
  const token = TOKEN_MAP[entry.tokenId];
  if (!token) return null;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(entry.uid)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(entry.uid);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(entry.uid);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          onDragOver("");
        }
      }}
      className={`combo-token token-enter ${token.color} ${token.border} ${token.textColor} group ${
        isDragging ? "dragging" : ""
      } ${isDragOver ? "drag-over" : ""}`}
      style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
    >
      <span>{formatTokenNotation(token, notationMode, directionMode).trim()}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(entry.uid); }}
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-xs leading-none hover:text-red-400 active:scale-90"
        title="削除"
        aria-label={`${token.label}を削除`}
      >
        ✕
      </button>
    </div>
  );
}

interface SavedCombo {
  id: string;
  name: string;
  entries: ComboEntry[];
}

const createBuilderId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

export function ComboClickBuilder() {
  const [combo, setCombo] = useState<ComboEntry[]>([]);
  const [comboName, setComboName] = useState("");
  const [saved, setSaved] = useState<SavedCombo[]>([]);
  const [copied, setCopied] = useState(false);
  const [notationMode, setNotationMode] = useState<NotationMode>("en");
  const [directionMode, setDirectionMode] = useState<DirectionNotationMode>("arrow");
  const [draggedUid, setDraggedUid] = useState<string | null>(null);
  const [dragOverUid, setDragOverUid] = useState<string | null>(null);

  const addToken = useCallback((tokenId: string) => {
    setCombo((prev) => [...prev, { uid: createBuilderId(), tokenId }]);
  }, []);

  const removeToken = useCallback((uid: string) => {
    setCombo((prev) => prev.filter((e) => e.uid !== uid));
  }, []);

  const clearCombo = useCallback(() => {
    setCombo([]);
  }, []);

  const undoLast = useCallback(() => {
    setCombo((prev) => prev.slice(0, -1));
  }, []);

  const handleDragStart = useCallback((uid: string) => {
    setDraggedUid(uid);
  }, []);

  const handleDragOver = useCallback((uid: string) => {
    setDragOverUid(uid);
  }, []);

  const handleDrop = useCallback((targetUid: string) => {
    if (!draggedUid || draggedUid === targetUid) {
      setDraggedUid(null);
      setDragOverUid(null);
      return;
    }

    setCombo((prev) => {
      const draggedIndex = prev.findIndex((e) => e.uid === draggedUid);
      const targetIndex = prev.findIndex((e) => e.uid === targetUid);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newCombo = [...prev];
      const [draggedItem] = newCombo.splice(draggedIndex, 1);
      newCombo.splice(targetIndex, 0, draggedItem);

      return newCombo;
    });

    setDraggedUid(null);
    setDragOverUid(null);
    toast.success("コンボを並び替えました");
  }, [draggedUid]);

  const notation = buildNotation(combo, notationMode, directionMode);

  const saveCombo = useCallback(() => {
    if (combo.length === 0) return;
    const name = comboName.trim() || `コンボ ${saved.length + 1}`;
    setSaved((prev) => [
      ...prev,
      {
        id: createBuilderId(),
        name,
        entries: [...combo],
      },
    ]);
    setComboName("");
    toast.success(`「${name}」を保存しました`);
  }, [combo, comboName, saved.length, notationMode, directionMode]);

  const loadCombo = useCallback((sc: SavedCombo) => {
    setCombo(sc.entries.map((e) => ({ ...e, uid: createBuilderId() })));
    toast.info(`「${sc.name}」をロードしました`);
  }, []);

  const deleteSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!notation) return;

    try {
      await navigator.clipboard.writeText(notation);
      setCopied(true);
      toast.success("コンボをコピーしました", {
        description: notation,
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("クリップボードへのコピーに失敗しました");
    }
  }, [notation]);

  const prefixDirections = DIRECTION_TOKENS.filter((t) =>
    ["j", "cr", "st"].includes(t.id)
  );

  return (
    <section className="combo-builder-shell" aria-labelledby="combo-builder-title">
      <header className="combo-builder-header">
        <div className="flex items-center gap-1.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #ff3c00 0%, #ff6b00 100%)",
              boxShadow: "0 0 12px rgba(255,60,0,0.5)",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            SF
          </div>
          <h2
            id="combo-builder-title"
            className="text-sm font-bold tracking-wide"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              color: "#ff6b00",
              textShadow: "0 0 12px rgba(255,107,0,0.6)",
            }}
          >
            SF6コンボ入力コマンド作成ツール
          </h2>
        </div>
        <p className="combo-builder-subtitle">クリックだけでコンボ表記を作成</p>
        <div className="flex items-center gap-1 rounded border border-cyan-700/70 bg-cyan-950/25 p-1 font-mono text-xs shadow-[0_0_10px_rgba(8,145,178,0.15)]">
          <span className="px-1.5 text-[11px] font-semibold text-cyan-200">方向</span>
          <div className="flex items-center rounded bg-zinc-950/70 p-0.5">
            <button
              type="button"
              onClick={() => setDirectionMode("arrow")}
              className={`px-3 py-1.5 rounded font-bold transition-all duration-100 ${
                directionMode === "arrow"
                  ? "bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
                  : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
              aria-pressed={directionMode === "arrow"}
            >
              矢印
            </button>
            <button
              type="button"
              onClick={() => setDirectionMode("number")}
              className={`px-3 py-1.5 rounded font-bold transition-all duration-100 ${
                directionMode === "number"
                  ? "bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
                  : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
              aria-pressed={directionMode === "number"}
            >
              数字
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded border border-orange-700/70 bg-orange-950/25 p-1 font-mono text-xs shadow-[0_0_10px_rgba(234,88,12,0.15)]">
          <span className="px-1.5 text-[11px] font-semibold text-orange-200">攻撃</span>
          <div className="flex items-center rounded bg-zinc-950/70 p-0.5">
            <button
              type="button"
              onClick={() => setNotationMode("en")}
              className={`px-3 py-1.5 rounded font-bold transition-all duration-100 ${
                notationMode === "en"
                  ? "bg-orange-500 text-zinc-950 shadow-[0_0_10px_rgba(251,146,60,0.35)]"
                  : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
              aria-pressed={notationMode === "en"}
            >
              LP
            </button>
            <button
              type="button"
              onClick={() => setNotationMode("jp")}
              className={`px-3 py-1.5 rounded font-bold transition-all duration-100 ${
                notationMode === "jp"
                  ? "bg-orange-500 text-zinc-950 shadow-[0_0_10px_rgba(251,146,60,0.35)]"
                  : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
              aria-pressed={notationMode === "jp"}
            >
              弱P
            </button>
          </div>
        </div>
      </header>

      <div className="combo-builder-layout">
        <aside className="combo-builder-palette">
          <div className="p-2 flex-1 overflow-y-auto">
            <p className="text-[10px] text-cyan-200 uppercase tracking-widest mb-2 font-mono border-b border-zinc-800 pb-1">
              ボタンパレット
            </p>

            <SectionLabel>方向入力</SectionLabel>
            <div className="flex gap-2 items-start">
              <DirectionNumpad onAdd={addToken} directionMode={directionMode} />
              <div className="flex flex-col gap-0.5 pt-0.5">
                {prefixDirections.map((t) => (
                  <PaletteButton
                    key={t.id}
                    token={t}
                    onAdd={addToken}
                    notationMode={notationMode}
                    directionMode={directionMode}
                  />
                ))}
              </div>
            </div>

            <SectionLabel>技 / コマンド</SectionLabel>
            <div className="flex flex-wrap gap-1">
              {MOTION_TOKENS.map((t) => (
                <PaletteButton
                  key={t.id}
                  token={t}
                  onAdd={addToken}
                  notationMode={notationMode}
                  directionMode={directionMode}
                />
              ))}
            </div>

            <SectionLabel>攻撃（基本）</SectionLabel>
            <AttackGrid
              tokens={ATTACK_TOKENS}
              cols={5}
              onAdd={addToken}
              notationMode={notationMode}
              directionMode={directionMode}
            />

            <SectionLabel>攻撃（立ち）</SectionLabel>
            <AttackGrid
              tokens={STAND_ATTACK_TOKENS}
              cols={3}
              onAdd={addToken}
              notationMode={notationMode}
              directionMode={directionMode}
            />

            <SectionLabel>
              攻撃（しゃがみ {directionMode === "arrow" ? "↓+" : "2+"}）
            </SectionLabel>
            <AttackGrid
              tokens={CROUCH_ATTACK_TOKENS}
              cols={3}
              onAdd={addToken}
              notationMode={notationMode}
              directionMode={directionMode}
            />

            <SectionLabel>キャンセル / 接続</SectionLabel>
            <div className="flex flex-wrap gap-1">
              {CANCEL_TOKENS.map((t) => (
                <PaletteButton
                  key={t.id}
                  token={t}
                  onAdd={addToken}
                  notationMode={notationMode}
                  directionMode={directionMode}
                />
              ))}
            </div>

            <SectionLabel>修飾子 / 特殊</SectionLabel>
            <div className="flex flex-wrap gap-1 pb-1">
              {MODIFIER_TOKENS.map((t) => (
                <PaletteButton
                  key={t.id}
                  token={t}
                  onAdd={addToken}
                  notationMode={notationMode}
                  directionMode={directionMode}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="combo-builder-main">
          <section className="panel-glow rounded-md bg-zinc-900/60 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-widest uppercase text-cyan-200 font-mono">
                  コンボシーケンス
                </span>
                {combo.length > 0 && (
                  <span className="text-[10px] bg-orange-950 border border-orange-800 text-orange-400 px-1.5 py-0.5 rounded font-mono">
                    {combo.length}要素
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={undoLast}
                  disabled={combo.length === 0}
                  className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-30 transition-all duration-100"
                >
                  ← 戻す
                </button>
                <button
                  onClick={clearCombo}
                  disabled={combo.length === 0}
                  className="text-xs px-2 py-1 rounded border border-red-900 text-red-400 hover:border-red-600 hover:text-red-300 disabled:opacity-30 transition-all duration-100"
                >
                  全消去
                </button>
              </div>
            </div>

            <div className="combo-sequence" style={{ minHeight: "8rem" }}>
              {combo.length === 0 ? (
                <div className="flex items-center justify-center w-full py-4">
                  <p className="text-zinc-400 text-sm font-mono">
                    ← 左のパレットからボタンをクリックして追加
                  </p>
                </div>
              ) : (
                combo.map((entry, i) => (
                  <ComboChip
                    key={entry.uid}
                    entry={entry}
                    index={i}
                    onRemove={removeToken}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedUid === entry.uid}
                    isDragOver={dragOverUid === entry.uid}
                    notationMode={notationMode}
                    directionMode={directionMode}
                  />
                ))
              )}
            </div>
          </section>

          <section className="panel-glow rounded-md bg-zinc-900/60" style={{ flexShrink: 0 }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold tracking-widest uppercase text-cyan-200 font-mono">
                コンボ表記 (テキスト出力)
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!notation}
                className={`text-xs px-3 py-1 rounded border transition-all duration-150 disabled:opacity-30 ${
                  copied
                    ? "border-green-500 text-green-400 bg-green-950"
                    : "border-orange-700 text-orange-400 hover:border-orange-500 hover:text-orange-300 hover:bg-orange-950/30"
                }`}
                style={{ boxShadow: copied ? "0 0 8px rgba(74,222,128,0.4)" : undefined }}
              >
                {copied ? "✓ コピー済み" : "クリップボードにコピー"}
              </button>
            </div>
            <div
              className="px-4 py-3 min-h-[3rem] flex items-center cursor-pointer hover:bg-zinc-800/30 transition-colors duration-100 rounded-b-md"
              onClick={copyToClipboard}
              title="クリックでコピー"
            >
              {notation ? (
                <div className="flex items-center justify-between w-full gap-4">
                  <code
                    className="text-base text-orange-300 break-all leading-relaxed flex-1"
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      textShadow: "0 0 8px rgba(255,150,50,0.5)",
                    }}
                  >
                    {notation}
                  </code>
                  <span className="text-[10px] text-zinc-400 shrink-0">クリックでコピー</span>
                </div>
              ) : (
                <span className="text-zinc-400 text-sm font-mono">
                  コンボを組み立てると、ここに表記が表示されます
                </span>
              )}
            </div>
          </section>

          <section className="panel-glow rounded-md bg-zinc-900/60">
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold tracking-widest uppercase text-cyan-200 font-mono shrink-0">
                保存
              </span>
              <input
                type="text"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
                placeholder="コンボ名（キーボード入力可）"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder-zinc-400 font-mono outline-none focus:border-orange-600"
              />
              <button
                onClick={saveCombo}
                disabled={combo.length === 0}
                className="text-xs px-3 py-1 rounded border border-orange-700 text-orange-400 hover:border-orange-500 hover:bg-orange-950/30 disabled:opacity-30 transition-all duration-100 shrink-0"
              >
                保存
              </button>
            </div>
            {saved.length > 0 ? (
              <div className="px-4 py-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
                {saved.map((sc) => (
                  <div key={sc.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => loadCombo(sc)}
                      className="flex-1 text-left text-xs font-mono text-zinc-300 hover:text-orange-300 transition-colors duration-100 truncate"
                    >
                      <span className="text-zinc-300 mr-2">▶</span>
                      <span className="text-orange-400 mr-2">{sc.name}</span>
                      <span className="text-zinc-300">
                        {buildNotation(sc.entries, notationMode, directionMode)}
                      </span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            buildNotation(sc.entries, notationMode, directionMode)
                          );
                          toast.success(`「${sc.name}」をコピーしました`);
                        } catch {
                          toast.error("クリップボードへのコピーに失敗しました");
                        }
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-100"
                    >
                      コピー
                    </button>
                    <button
                      onClick={() => deleteSaved(sc.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400 hover:text-red-300 hover:border-red-700 opacity-0 group-hover:opacity-100 transition-all duration-100"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-2 text-xs text-zinc-400 font-mono">
                保存されたコンボはありません
              </p>
            )}
          </section>

          <section className="panel-glow rounded-md bg-zinc-900/40 px-4 py-3">
            <p className="text-[10px] text-cyan-200 uppercase tracking-widest font-mono mb-2">
              クイックリファレンス
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-zinc-300 font-mono">
              {[
                ["xx",   "通常キャンセル"],
                ["DR>",  "ドライブラッシュ1ゲージ"],
                ["DRC>", "ドライブラッシュ3ゲージ"],
                [">",    "通常つなぎ"],
                ["▲",    "フレーム消費"],
                [directionMode === "arrow" ? "→↓↘" : "623", "昇竜拳コマンド"],
                [directionMode === "arrow" ? "↓↘→" : "236", "波動拳コマンド"],
                ["OD",   "オーバードライブ"],
                ["CH",   "カウンターヒット時"],
                ["PC",   "パニッシュカウンター時"],
                ["DI",   "ドライブインパクト"],
                ["CA",   "クリティカルアーツ"],
                ["(W!)", "壁やられ状態"],
                ["(W! STN)", "壁やられスタン状態"],
              ].map(([sym, desc]) => (
                <div key={`${sym}-${desc}`} className="flex gap-2 py-0.5">
                  <span
                    className="text-yellow-400 w-16 shrink-0"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {sym}
                  </span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
