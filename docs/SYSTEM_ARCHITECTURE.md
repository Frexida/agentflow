# AgentFlow v2 システム機能構成図

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────────────────┐
│                        AgentFlow v2                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Browser   │    │   Next.js   │    │   SQLite    │         │
│  │   (React)   │◄──►│   Server    │◄──►│   Database  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│        │                   │                                     │
│        │                   │                                     │
│        ▼                   ▼                                     │
│  ┌─────────────┐    ┌─────────────┐                             │
│  │ React Flow  │    │  API Routes │                             │
│  │  (Canvas)   │    │  (Gateway)  │                             │
│  └─────────────┘    └─────────────┘                             │
│                            │                                     │
└────────────────────────────│─────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    OpenClaw     │
                    │    Gateway      │
                    │  (External)     │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Agent Sessions │
                    │  (pm-1, dev-1,  │
                    │   research-1)   │
                    └─────────────────┘
```

## 2. フロントエンド構成

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages                                                           │
│  ├── / (Dashboard)                                               │
│  │   ├── StatsBar (統計表示)                                     │
│  │   ├── OrgList (組織一覧)                                      │
│  │   └── AgentTable (エージェント一覧)                           │
│  │                                                               │
│  ├── /editor/[id] (Editor)                                       │
│  │   ├── Canvas (React Flow)                                     │
│  │   │   ├── AgentNode (カスタムノード)                          │
│  │   │   ├── AgentEdge (カスタムエッジ)                          │
│  │   │   └── Minimap                                             │
│  │   ├── Toolbar                                                 │
│  │   └── SidePanel                                               │
│  │       ├── PropertiesTab                                       │
│  │       ├── ChatTab                                             │
│  │       └── TimelineTab                                         │
│  │                                                               │
│  └── /settings (Settings)                                        │
│      ├── GatewayConnection                                       │
│      └── ThemeSelector                                           │
│                                                                  │
│  State Management (Zustand)                                      │
│  ├── orgStore (組織データ)                                       │
│  ├── canvasStore (キャンバス状態)                                │
│  ├── gatewayStore (Gateway接続)                                  │
│  └── chatStore (チャット状態)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. バックエンド構成

```
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Next.js API Routes)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api                                                            │
│  ├── /orgs                                                       │
│  │   ├── GET    / (組織一覧取得)                                 │
│  │   ├── POST   / (組織作成)                                     │
│  │   ├── GET    /[id] (組織詳細取得)                             │
│  │   ├── PUT    /[id] (組織更新)                                 │
│  │   └── DELETE /[id] (組織削除)                                 │
│  │                                                               │
│  ├── /gateway                                                    │
│  │   ├── POST   /connect (Gateway接続)                           │
│  │   ├── POST   /config/get (config取得)                         │
│  │   ├── POST   /config/apply (config適用)                       │
│  │   ├── POST   /sessions/list (セッション一覧)                  │
│  │   ├── POST   /chat/send (メッセージ送信)                      │
│  │   └── POST   /chat/history (履歴取得)                         │
│  │                                                               │
│  └── /settings                                                   │
│      ├── GET    / (設定取得)                                     │
│      └── PUT    / (設定更新)                                     │
│                                                                  │
│  Services                                                        │
│  ├── OrgService (組織CRUD)                                       │
│  ├── GatewayService (Gateway通信)                                │
│  └── ConfigService (設定管理)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. データフロー

### 4.1 組織図編集フロー
```
User Input → React Flow → canvasStore → OrgService → SQLite
                                      ↓
                              GatewayService → OpenClaw
```

### 4.2 チャットフロー
```
User Message → ChatTab → chatStore → GatewayService → OpenClaw Gateway
                                                            ↓
                                                      Agent Session
                                                            ↓
Response ← ChatTab ← chatStore ← GatewayService ← OpenClaw Gateway
```

### 4.3 Config同期フロー
```
AgentFlow Canvas
      ↓
Export to OpenClaw Config
      ↓
GatewayService.configApply()
      ↓
OpenClaw Gateway
      ↓
Agent Sessions (restart)
```

## 5. 機能一覧

| 機能カテゴリ | 機能名 | 説明 |
|-------------|--------|------|
| **組織図編集** | ノード追加 | エージェントノードをキャンバスに追加 |
| | ノード編集 | エージェントの名前、役割、モデル等を編集 |
| | ノード削除 | エージェントノードを削除 |
| | 接続作成 | エージェント間の関係を接続線で表現 |
| | 接続タイプ | Command/Communication/Review |
| | 方向切り替え | 単方向/双方向 |
| | グループ | 部門/チームのグルーピング |
| | Auto Layout | dagre/elkjsによる自動配置 |
| **OpenClaw連携** | Config Import | OpenClaw configをインポートして可視化 |
| | Config Export | 組織図をOpenClaw config形式で出力 |
| | Config Apply | Gatewayに直接適用 |
| | Config History | 変更履歴の保存と復元 |
| **リアルタイム監視** | Session Status | エージェントのオンライン状態 |
| | Activity Monitor | アクティビティのパルス表示 |
| | Timeline | ログのタイムライン表示 |
| **チャット** | Agent Chat | エージェントとの直接対話 |
| | History | 会話履歴の表示 |
| **管理** | Dashboard | 組織一覧と統計 |
| | Settings | Gateway接続設定 |
| | Theme | ダーク/ライトモード |

## 6. セキュリティ

| 項目 | 対策 |
|------|------|
| Gateway Token | サーバーサイドで管理、クライアントに露出しない |
| API認証 | 将来的にNextAuth.js導入 |
| データ保護 | SQLiteファイルのアクセス制限 |
| XSS対策 | React標準のエスケープ |

## 7. パフォーマンス目標

| 指標 | 目標値 |
|------|--------|
| 初期読み込み | < 2秒 |
| 操作レスポンス | < 100ms |
| キャンバス操作 | 60fps |
| 最大ノード数 | 100ノード |
