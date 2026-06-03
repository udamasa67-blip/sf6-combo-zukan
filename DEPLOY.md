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

## GitHub Pages + 独自ドメイン

このプロジェクトはGitHub Pagesでも公開できます。

- 公開ドメイン: `https://www.miyabi-combo.com`
- GitHub Actions: `.github/workflows/deploy.yml`
- 独自ドメイン設定: `client/public/CNAME`

GitHubのリポジトリ画面で以下を設定してください。

1. `Settings` → `Pages`
2. `Build and deployment` の `Source` を `GitHub Actions` にする
3. `Custom domain` に `www.miyabi-combo.com` を入力
4. DNS側で `www` のCNAMEを `udamasa67-blip.github.io` に向ける
5. HTTPSが有効になるまで待つ

DNS設定例:

```txt
CNAME  www  udamasa67-blip.github.io
```
