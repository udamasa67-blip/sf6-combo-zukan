# 公開手順

## 事前確認

```bash
pnpm install
pnpm check
pnpm build
```

## Vercel設定

GitHubにこのプロジェクトをアップロードしたあと、VercelでImportします。

- Framework Preset: Vite
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Root Directory: `.`

上記は `vercel.json` にも入れているため、通常はVercelが自動で読み取ります。

## 独自ドメインを使う場合

VercelのEnvironment Variablesに以下を追加してください。

- Name: `SITE_URL`
- Value: `https://あなたのドメイン`

例: `https://miyabi-combo.com`

`SITE_URL` を設定すると、`sitemap.xml` と `robots.txt` のURLもそのドメインで生成されます。

## 公開後

- Google Search Consoleに登録
- `https://公開URL/sitemap.xml` を送信
- X/Discord/YouTube概要欄などに公開URLを掲載
