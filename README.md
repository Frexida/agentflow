# AgentFlow

エージェント組織設計ツール — 組織図エディタ → OpenClaw config エクスポート

## Stack

- **Astro** + **htmx** — サーバーサイドレンダリング + 宣言的インタラクション
- **Cloudflare Workers** — エッジデプロイ
- **ビジュアルエディタ** — TBD（ライブラリ選定中）

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
npx wrangler deploy
```

## Data Model

`src/lib/types.ts` — MOISE+ Structural Specification ベースの v1 データモデル

- `Agent` — エージェント定義（名前・性格・モデル・ツール）
- `Link` — エージェント間の関係（authority / communication / review）
- `Group` — チーム/グループ（入れ子対応）
- `Organization` — 組織全体

## Export

`src/lib/export-openclaw.ts` — Organization → OpenClaw config JSON 変換
