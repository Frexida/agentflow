# AgentFlow

エージェント組織設計ツール — 組織図エディタ → OpenClaw config エクスポート

**Live Demo**: https://frexida.github.io/agentflow/editor/

## Quick Start

### Option A: Docker (推奨)

```bash
git clone https://github.com/Frexida/agentflow.git
cd agentflow
docker compose up -d
```

→ http://localhost:3000/editor/ でアクセス

### Option B: ローカルビルド

```bash
git clone https://github.com/Frexida/agentflow.git
cd agentflow
npm install
SITE_URL=http://localhost:4321 BASE_PATH=/ npm run build
```

ビルド成果物 `dist/` を任意のWebサーバーで配信。

開発モード:
```bash
npm run dev
```

### Option C: GitHub Pages (デプロイ不要)

https://frexida.github.io/agentflow/editor/ をそのまま使用。
データはブラウザのlocalStorageに保存されます。

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

## Self-Hosting

### 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `SITE_URL` | `https://frexida.github.io` | サイトURL |
| `BASE_PATH` | `/agentflow` | ベースパス（`/` でルート配信） |

### Docker カスタマイズ

ポート変更:
```bash
docker compose up -d  # デフォルト: 3000
# または docker-compose.yml の ports を編集
```

### リバースプロキシ

nginx/Caddy等の背後に置く場合、`SITE_URL` を実際のドメインに設定してビルド。

## Stack

- **Astro** — 静的サイトジェネレーター
- **Drawflow** — ビジュアルノードエディタ
- **dagre** — 自動レイアウトエンジン

## Data Model

`src/lib/types.ts` — MOISE+ Structural Specification ベースの v1 データモデル

- `Agent` — エージェント定義（名前・性格・モデル・ツール・記憶）
- `Link` — エージェント間の関係（authority / communication / review）
- `Group` — チーム/グループ（入れ子対応）
- `Organization` — 組織全体

## Export

`src/lib/export-openclaw.ts` — Organization → OpenClaw config JSON 変換

生成されるconfigは OpenClaw の `config.apply` にそのまま使用可能。プレースホルダー（`REPLACE_WITH_*`）を実際のDiscord IDに置換してから適用。

## License

MIT
