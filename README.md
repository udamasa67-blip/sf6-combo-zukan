# SF6 Elena Combo Report 2026

ストリートファイター6（SF6）のキャラクター別コンボレポートプラットフォーム。エレナ、イングリッドなど複数キャラクターの実用的なコンボを始動・位置・ゲージ消費・起き攻め有利で比較できる静的レポートです。

## 概要

本プロジェクトは、SF6プレイヤーが各キャラクターのコンボを効率的に学習・比較できるプラットフォームを提供します。パッチ情報、コンボ理論、実用的なルートカードを一元管理し、ゲーム内での意思決定をサポートします。

## 機能

- **マルチキャラクター対応** — エレナ、イングリッド、および将来的に30+キャラクター対応可能な拡張可能なアーキテクチャ
- **コンボフィルター** — 位置（どこでも・端・端付近）、用途（温存・起き攻め・運び・リーサル・差し返し・セットプレイ・(PC)DI・壁やられ・スタン・その他）で絞り込み
- **メトリクス表示** — ダメージ、有利フレーム、SAゲージ消費、ドライブゲージ消費を視覚的に表示
- **パッチ情報** — 最新パッチの変更点と影響を受けたコンボを強調表示
- **検索機能** — コマンド表記、ゲージ消費、用途などで高速検索
- **お気に入り機能** — ローカルストレージでお気に入りコンボを保存

## 技術スタック

- **フロントエンド** — React 19 + Tailwind CSS 4 + shadcn/ui
- **ルーティング** — Wouter（軽量クライアント側ルーター）
- **ビルドツール** — Vite
- **言語** — TypeScript
- **パッケージマネージャー** — pnpm

## プロジェクト構造

```
client/
  src/
    pages/           # ページコンポーネント（Home.tsx, CharacterPage.tsx）
    components/      # UI コンポーネント（NotationDisplay, HPGaugeDisplay など）
    lib/
      characters/    # キャラクター設定（elena.ts, ingrid.ts）
      comboData.ts   # コンボデータ型定義と計算ロジック
      characterConfig.ts  # キャラクター登録システム
    App.tsx          # ルーティング定義
    index.css        # グローバルスタイル（Tailwind + カスタムトークン）
  public/            # 静的ファイル（favicon.ico など）
  index.html         # HTMLエントリーポイント
package.json         # 依存関係定義
```

## インストール

```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# ビルド
pnpm build

# プロダクション実行
pnpm start
```

## キャラクター追加ガイド

新しいキャラクターを追加するには、以下の手順を実行してください。

### 1. キャラクター設定ファイルを作成

`client/src/lib/characters/` ディレクトリに新しいファイルを作成します。例：`jun.ts`

```typescript
import { CharacterConfig } from '../characterConfig';
import { calculateGaugeCost } from '../comboData';

export const junConfig: CharacterConfig = {
  id: 'jun',
  name: 'Jun',
  description: 'ジュンの実用コンボを始動・位置・ゲージ消費・起き攻め有利で比較できるレポートです。',
  theory: {
    title: 'ジュンの特徴',
    content: 'ジュンの特徴説明...',
  },
  patchInfo: {
    date: '2026-XX-XX',
    title: 'パッチタイトル',
    updates: [
      { date: '2026-XX-XX', title: '変更内容', content: '詳細...' },
    ],
  },
  combos: calculateGaugeCost([
    {
      id: 1,
      position: 'どこでも',
      purpose: '温存',
      route: '5LP > 5LK > 2MK xx 214K',
      damage: 1800,
      knockdown: 24,
      super: 0,
      drive: 0,
      postPatchNote: 'ノーゲージの基本コンボ',
      videoReferences: [],
    },
    // ... その他のコンボ
  ]),
};
```

### 2. App.tsx にルートを追加

```typescript
import { junConfig } from './lib/characters/jun';
import { registerCharacter } from './lib/characterConfig';

// キャラクター登録
registerCharacter(junConfig);

// ルート追加
<Route path="/jun" component={() => <CharacterPage characterId="jun" />} />
```

### 3. ホームページにリンクを追加

`client/src/pages/Home.tsx` のキャラクター選択メニューに新しいキャラクターへのリンクを追加します。

## コンボデータ形式

各コンボは以下の構造を持ちます。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | number | コンボの一意識別子 |
| position | string | 始動位置（どこでも・端・端付近） |
| purpose | string | コンボの用途（温存・起き攻め・運び・リーサル など） |
| route | string | コマンド表記（例：5LP > 5LK > 2MK xx 214K） |
| damage | number | ダメージ値 |
| knockdown | number | ノックダウン有利フレーム |
| super | number | SAゲージ消費 |
| drive | number | ドライブゲージ消費 |
| postPatchNote | string | パッチ後の評価・説明 |
| videoReferences | array | 参考資料リンク |

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueを作成してください。
