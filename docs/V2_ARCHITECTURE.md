# AgentFlow v2 Architecture

## Why v2
- editor.astro 4000行超 → 保守不能
- Drawflowで4辺ポート・スマートルーティングを全部自前実装 → ライブラリの意味なし
- ダッシュボード、セッション管理、トークン管理など管理画面がゼロ
- テスト困難、再利用性なし

## Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js** (App Router) | SSR + API Routes + Vercel統合、React経験活用 |
| Canvas | **React Flow** (@xyflow/react) | 週100万DL、豊富な情報、4辺ポート・ルーティング内蔵 |
| State | **Zustand** | React外アクセス可、TypeScript親和、軽量 |
| ORM | **Drizzle ORM** | SQLite/PostgreSQL両対応、TypeScriptファースト |
| UI Components | **shadcn/ui** | Radix UIベース、Tailwind統合 |
| Styling | **Tailwind CSS** | ユーティリティファースト、ダークテーマ |
| DB (self-host) | **SQLite** (better-sqlite3) | npm install完結 |
| DB (SaaS) | **Vercel Postgres** (Neon) | マネージド、無料枠あり |

## Pages
```
/                    → LP (SSG)
/dashboard           → 組織一覧 + 統計 (SSR)
/editor/[id]         → キャンバスエディタ (CSR, React Flow)
/settings            → Gateway接続設定 (SSR)
```

## Directory Structure
```
src/
  app/
    layout.tsx                # ルートレイアウト (ThemeProvider, Sidebar)
    page.tsx                  # LP (i18n EN/JA) — SSG
    dashboard/
      page.tsx                # 組織一覧 + 統計
      loading.tsx
    editor/
      [id]/
        page.tsx              # キャンバスエディタ (React Flow)
    settings/
      page.tsx                # Gateway接続設定
    api/
      orgs/
        route.ts              # CRUD: GET/POST
        [id]/
          route.ts            # CRUD: GET/PUT/DELETE
      gateway/
        connect/route.ts      # Gateway接続テスト
        config/route.ts       # config.get / config.apply proxy
      sessions/route.ts       # sessions.list proxy
      chat/route.ts           # chat.send / chat.history proxy
  components/
    canvas/
      AgentNode.tsx           # カスタムノード
      AgentEdge.tsx           # カスタムエッジ
      CanvasToolbar.tsx       # ツールバー
      TaskWizard.tsx          # Thompson 1967 ウィザード
    chat/
      ChatPanel.tsx           # サイドパネル チャットUI
      MessageBubble.tsx       # メッセージバブル
      ChatInput.tsx           # テキスト入力 + 送信
    dashboard/
      OrgCard.tsx             # 組織カード
      StatsBar.tsx            # トークン使用量、コスト
      AgentList.tsx           # エージェント一覧
    ui/                       # shadcn/ui コンポーネント
  stores/
    org.ts                    # 組織データ (nodes, edges, groups)
    gateway.ts                # Gateway接続状態 + RPC
    chat.ts                   # チャット状態
    sessions.ts               # セッション一覧 + 統計
    ui.ts                     # UI状態 (sidebar, panels, mode)
  lib/
    gateway-client.ts         # Gateway WebSocket JSON-RPC 2.0 client
    config-parser.ts          # OpenClaw config ↔ React Flow変換
    org-theory.ts             # Thompson 1967 wizard logic
    auto-layout.ts            # dagre自動レイアウト
  db/
    index.ts                  # DB接続 (SQLite or Postgres)
    schema.ts                 # Drizzle スキーマ
  types/
    org.ts                    # 組織関連型
    gateway.ts                # Gateway関連型
```

## Editor Features (carried from v1)
- ノード追加/編集/削除/ドラッグ
- React Flowカスタムノード (アイコン、名前、ロール、モデル、ステータスドット)
- カスタムエッジ (authority/communication/review × uni/bidirectional + フローアニメーション)
- 4ポートシステム: top(input_1), bottom(output_1), left(input_2), right(output_2)
- ミニマップ、ズームコントロール
- Auto Layout (dagre)
- 構造モード (Tree / Graph) + DFSサイクル検出
- タスク特性ウィザード (Independent/Sequential/Reciprocal)
- テンプレート、グループ (部門)
- チャットパネル、タイムラインパネル
- Config Import/Export/Apply
- Config自動更新 (baseHash polling 10s)

## Migration Strategy
1. v2ブランチ作成
2. Next.js + React Flow基本エディタ (ノード、エッジ、レイアウト)
3. チャット + タイムライン移植
4. ダッシュボード新規作成
5. v1と並行動作で確認
6. v2安定後にv1削除、mainにマージ

## Related Documents
- `01_infrastructure.md` — インフラ構成図
- `02_middleware.md` — ミドルウェア設定書
- `03_database.md` — データベース設計書
- `04_class_method.md` — クラス・メソッド定義書
- `SYSTEM_ARCHITECTURE.md` — システム機能構成図
- `ER_DIAGRAM.md` — ER図
- `EXTERNAL_INTERFACE.md` — 外部I/F仕様書
- `BATCH_PROCESSING.md` — バッチ処理設計書
