import React, { useState, useRef } from 'react';

interface DriveGaugeProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const OFF_COLOR = '#444444';
const BORDER_COLOR = '#888888';

// グラデーション色定義（HPGaugeDisplayのダイヤモンド色と同じ）
const GRADIENT_COLORS = ['#1cff1c', '#45ff1f', '#b9f11d', '#c7ef1f', '#d6eb22', '#ecec58'];

export function DriveGauge({ value, onChange, label = 'ドライブ消費' }: DriveGaugeProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 値を0.25刻みにスナップ
  const snapToGrid = (val: number) => {
    return Math.round(val * 4) / 4;
  };

  // マウス位置から値を計算
  const calculateValueFromPosition = (clientX: number) => {
    if (!containerRef.current) return value;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const newValue = snapToGrid(percentage * 6);

    return Math.max(0, Math.min(6, newValue));
  };

  // ドラッグ操作
  const handleMouseDown = (e: React.MouseEvent) => {
    const newValue = calculateValueFromPosition(e.clientX);
    onChange(newValue);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveValue = calculateValueFromPosition(moveEvent.clientX);
      onChange(moveValue);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // タップ操作
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const newValue = calculateValueFromPosition(touch.clientX);
    onChange(newValue);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const moveValue = calculateValueFromPosition(touch.clientX);
      onChange(moveValue);
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // ホバー時の値計算
  const handleMouseMove = (e: React.MouseEvent) => {
    const hoverValue = calculateValueFromPosition(e.clientX);
    setHoveredValue(hoverValue);
  };

  const handleMouseLeave = () => {
    setHoveredValue(null);
  };

  // セルを描画
  const renderCells = () => {
    const cells = [];

    for (let i = 0; i < 6; i++) {
      const cellStart = i;
      const cellEnd = i + 1;

      // 値がこのセルの範囲内かどうかを判定
      const isFullyFilled = value >= cellEnd;
      const isPartiallyFilled = value > cellStart && value < cellEnd;

      // 部分塗りの割合（0〜1）
      const fillPercentage = isPartiallyFilled ? (value - cellStart) : 0;

      // グラデーション色を計算
      const gradientId = `driveGradient-${i}`;
      const startColor = GRADIENT_COLORS[i];
      const endColor = GRADIENT_COLORS[Math.min(i + 1, 5)];

      cells.push(
        <div
          key={i}
          className="relative flex-1 h-full"
          style={{
            position: 'relative',
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              {/* セル形状のクリップパス */}
              <clipPath id={`cell-shape-${i}`}>
                <polygon points="5,2 95,2 90,18 10,18" />
              </clipPath>
              {/* グラデーション定義（インライン） */}
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            </defs>

            {/* 背景（OFF状態） */}
            <polygon
              points="5,2 95,2 90,18 10,18"
              fill={OFF_COLOR}
              stroke={BORDER_COLOR}
              strokeWidth="1"
            />

            {/* 塗りつぶし部分（ON状態） */}
            {(isFullyFilled || isPartiallyFilled) && (
              <>
                {/* グラデーション矩形 */}
                <rect
                  x="0"
                  y="0"
                  width={100 * (isFullyFilled ? 1 : fillPercentage)}
                  height="20"
                  fill={`url(#${gradientId})`}
                  clipPath={`url(#cell-shape-${i})`}
                />
              </>
            )}
          </svg>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="w-full">
      {label && <div className="text-sm font-semibold text-gray-300 mb-2">{label}</div>}

      <div className="flex items-center gap-3">
        {/* 値表示 */}
        <div className="text-lg font-bold text-yellow-400 min-w-12 text-right">
          {value.toFixed(2)}
        </div>

        {/* セルゲージ */}
        <div
          ref={containerRef}
          className="flex-1 h-6 flex gap-1 px-1 py-1 bg-gray-950 rounded cursor-pointer select-none"
          style={{
            backgroundColor: '#0a0a0a',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {renderCells()}
        </div>
      </div>

      {/* ホバー時のツールチップ */}
      {hoveredValue !== null && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          ホバー値: {hoveredValue.toFixed(2)}
        </div>
      )}

      {/* 値の範囲表示 */}
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
        <span>最小値: 0</span>
        <span>最大値: 6</span>
      </div>
    </div>
  );
}
