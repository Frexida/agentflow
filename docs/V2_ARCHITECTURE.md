# AgentFlow v2 Architecture

## Why v2
- editor.astro 4000行超 → 保守不能
- Drawflowで4辺ポート・スマートルーティングを全部自前実装 → ライブラリの意味なし
- ダッシュボード、セッション管理、トークン管理など管理画面がゼロ
- テスト困難、再利用性なし

## Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Astro + Svelte** | LP静的生成 + Svelteコンポーネント、GitHub Pages維持 |
| Canvas | **Svelte Flow** (@xyflow/svelte) | 4辺ポート、スマートルーティング、ミニマップ、ズーム組み込み。MIT |
| State | **Svelte stores + nanostores** | フレームワーク非依存、シンプル |
| Chat UI | **自前Svelte** or **@chatscope** | シンプルなバブルUI、Gateway RPC連携 |
| UI Components | **Melt UI** or **shadcn-svelte** | Svelte向けヘッドレスUI |
| Styling | **Tailwind CSS** | ユーティリティファースト、ダークテーマ |

## Pages
```
/                    → LP (既存)
/dashboard           → 組織一覧 + 統計 + Gateway接続設定
/editor/[id]         → キャンバスエディタ (Svelte Flow)
/settings            → APIキー、Gateway設定、プロフィール
```

## Directory Structure
```
src/
  pages/
    index.astro              # LP (i18n EN/JA)
    dashboard.astro          # 組織一覧 + 統計
    editor/[id].astro        # キャンバスエディタ
    settings.astro           # 設定
  components/
    canvas/
      AgentNode.svelte       # カスタムノード (アイコン、名前、ロール、モデル、ステータス)
      AgentEdge.svelte       # カスタムエッジ (authority/comm/review + 方向)
      CanvasToolbar.svelte   # ツールバー (追加、レイアウト、モード切替等)
      Minimap.svelte         # ミニマップ
    chat/
      ChatPanel.svelte       # サイドパネル チャットUI
      MessageBubble.svelte   # メッセージバブル (user/assistant)
      ChatInput.svelte       # テキスト入力 + 送信
    dashboard/
      OrgCard.svelte         # 組織カード (名前、エージェント数、ステータス)
      StatsBar.svelte        # トークン使用量、コスト、セッション数
      AgentList.svelte       # エージェント一覧テーブル
    shared/
      Sidebar.svelte         # 左サイドバーナビゲーション
      Toast.svelte           # 通知
      Modal.svelte           # モーダル
  stores/
    org.ts                   # 組織データ (agents, links, groups)
    gateway.ts               # Gateway接続状態 + RPC
    chat.ts                  # チャット状態 (messages, polling)
    sessions.ts              # セッション一覧 + 統計
    canvas.ts                # キャンバス状態 (mode, selection)
  lib/
    gateway-client.ts        # Gateway WebSocket RPC client
    config-parser.ts         # OpenClaw config ↔ AgentFlow org 変換
    org-theory.ts            # Thompson 1967 wizard logic
    types.ts                 # TypeScript型定義
```

## Dashboard Features
- 保存した組織図の一覧 (localStorage / IndexedDB)
- 統計: Active Agents, Total Tokens, Cost, Sessions
- 各エージェントの稼働状態 (live/idle/offline)
- Gateway接続ステータス

## Editor Features (carried from v1)
- ノード追加/編集/削除/ドラッグ
- Svelte Flowのカスタムノード (アイコン、名前、ロール、モデル、ステータスドット)
- カスタムエッジ (3タイプ × 2方向 + フローアニメーション)
- ミニマップ、ズームコントロール
- Auto Layout (dagre or elkjs)
- 構造モード (Tree / Graph)
- タスク特性ウィザード
- テンプレート
- グループ (部門)
- チャットパネル (サイドパネル)
- タイムラインパネル
- Config Import/Export
- Config自動更新 (baseHash polling)

## Token/Cost Dashboard
- sessions.list の totalTokens, cost を集計
- per-agent breakdown
- 時系列グラフ (簡易、Chart.js or uPlot)
- モデル別使用量

## Migration Strategy
1. v2ブランチ作成
2. Svelte Flow + 基本エディタ (ノード、エッジ、レイアウト)
3. チャット + タイムライン移植
4. ダッシュボード新規作成
5. v1のeditor.astroと並行動作で確認
6. v2安定後にv1を削除、mainにマージ

## Timeline Estimate
- Phase 1 (エディタ基盤): 3-5日
- Phase 2 (チャット + モニター移植): 2-3日
- Phase 3 (ダッシュボード): 2-3日
- Phase 4 (テスト + 移行): 1-2日
- Total: ~2週間
