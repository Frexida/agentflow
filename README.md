# AgentFlow

エージェント組織設計ツール — 組織図エディタ → OpenClaw config エクスポート

**Live**: https://agentflow.mtdnot1129.workers.dev

## Features

### エディタ
- **ビジュアル組織図** — Drawflow ベースのノード＆接続エディタ
- **エージェント追加** — ワンクリックでノード作成
- **ドラッグ＆ドロップ** — 自由配置、自動整列（dagre）
- **接続管理** — ノード間をドラッグして関係作成

### エージェント編集（サイドパネル）
ノードをダブルクリックで編集パネルを表示：
- アイコン（絵文字）
- 名前・役割
- 性格（SOUL.md に反映）
- モデル選択（Claude, GPT, Gemini）
- システムプロンプト
- **ツールプロファイル**（minimal / coding / messaging / full）
- **初期記憶**（MEMORY.md に反映）

### リンク編集
- **クリック** — リンクタイプ切替（authority → communication → review）
- **ダブルクリック** — モーダルでタイプ＋ラベル（説明文）編集
- **色分け** — 🔴 authority / 🔵 communication / 🟡 review

### グループ管理
- ツールバーの「📁 グループ」ボタンで左パネル表示
- グループ作成・削除
- エージェントのメンバー追加/削除（トグルボタン）

### エクスポート
「📤 エクスポート」ボタンで3ファイル生成：
1. **OpenClaw config JSON** — `config.apply` に直接使用可能
2. **Full export JSON** — config + メタデータ + ワークスペースファイル
3. **Setup script** — エージェントワークスペース作成用シェルスクリプト

### バリデーション
エクスポート時に自動チェック：
- ❌ エラー: エージェント0件、名前重複、名前未設定
- ⚠️ 警告: 役割未設定、プロンプト空、接続なしノード

### 保存
- **自動保存** — 5秒間隔でlocalStorageに保存
- **手動保存** — 「💾 保存」ボタン

## Stack

- **Astro** + **htmx** — SSR + 宣言的インタラクション
- **Drawflow** — ビジュアルノードエディタ
- **dagre** — 自動レイアウトエンジン
- **Cloudflare Workers** — エッジデプロイ

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

- `Agent` — エージェント定義（名前・性格・モデル・ツール・記憶）
- `Link` — エージェント間の関係（authority / communication / review）
- `Group` — チーム/グループ（入れ子対応）
- `Organization` — 組織全体

## Export

`src/lib/export-openclaw.ts` — Organization → OpenClaw config JSON 変換

生成されるconfigは OpenClaw の `config.apply` にそのまま使用可能。プレースホルダー（`REPLACE_WITH_*`）を実際のDiscord IDに置換してから適用。
