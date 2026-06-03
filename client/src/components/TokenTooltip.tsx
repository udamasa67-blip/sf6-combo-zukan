/**
 * TokenTooltip - コンボ表記のトークン単位でtooltipを表示するコンポーネント
 * - デスクトップ: hover（180ms遅延）でtooltip表示
 * - スマートフォン: tap / long press でtooltip表示
 * - コンボ本文レイアウトは変更しない
 *
 * ⚠️ Reactフックルール: 全フックは常に呼び出す（条件分岐による早期returnは禁止）
 */

import { useState, useRef, useEffect } from "react";
import { tokenizeNotation, type NotationToken } from "@/lib/notationTranslator";

// ===== 単一トークンのTooltipコンポーネント =====
type TokenProps = {
  token: NotationToken;
};

function Token({ token }: TokenProps) {
  // ⚠️ フックは常に最上位で呼び出す（条件分岐の前）
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // ドキュメントクリックで閉じる
  useEffect(() => {
    if (!visible) return;
    const close = () => setVisible(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [visible]);

  // セパレータや説明なしトークンはそのまま表示（フック呼び出し後に判定）
  if (token.isSeparator || !token.description) {
    // ~ セパレータは視覚的に区別するスタイルを適用
    const isTilde = token.symbol === "~";
    return (
      <span
        className={isTilde ? "token-tilde" : undefined}
        style={isTilde ? { opacity: 0.5, margin: "0 1px" } : undefined}
      >
        {token.symbol}
      </span>
    );
  }

  // xx トークンは少し控えめなスタイルで表示
  const isXx = token.symbol === "xx";

  const showTooltip = (x: number, y: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      setPos({ x, y });
      setVisible(true);
    }, 180);
  };

  const hideTooltip = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 100);
  };

  // デスクトップ: hover
  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    showTooltip(rect.left + rect.width / 2, rect.top);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  // スマートフォン: tap
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (visible) {
      setVisible(false);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setVisible(true);
  };

  // long press
  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
      setVisible(true);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <>
      <span
        className={isXx ? "token-hoverable token-xx" : "token-hoverable"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {token.symbol}
      </span>
      {visible && (
        <span
          className="token-tooltip"
          style={{
            position: "fixed",
            left: `${pos.x}px`,
            top: `${pos.y - 8}px`,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
          }}
          onMouseEnter={() => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
          }}
          onMouseLeave={hideTooltip}
        >
          {token.description}
        </span>
      )}
    </>
  );
}

// ===== コンボ表記全体をトークン化して表示するコンポーネント =====
type NotationDisplayProps = {
  notation: string;
  className?: string;
};

export function NotationDisplay({ notation, className }: NotationDisplayProps) {
  const tokens = tokenizeNotation(notation);

  return (
    <span className={className}>
      {tokens.map((token, idx) => (
        <Token key={idx} token={token} />
      ))}
    </span>
  );
}
