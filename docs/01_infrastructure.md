# インフラ構成図 — AgentFlow v2

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                      ユーザー (Browser)                    │
│                  https://agentflow.example.com             │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Static Assets│  │  SSR (Node)  │  │  API Routes   │  │
│  │  (Next.js)   │  │  /editor/*   │  │  /api/*       │  │
│  └──────────────┘  └──────────────┘  └───────┬───────┘  │
└──────────────────────────────────────────────┬──────────┘
                                               │
                    ┌──────────────────────────┼──────────┐
                    │                          │          │
                    ▼                          ▼          ▼
          ┌─────────────────┐      ┌────────────┐  ┌──────────┐
          │  Vercel Postgres │      │  OpenClaw   │  │  GitHub   │
          │  (SaaS mode)     │      │  Gateway    │  │  OAuth    │
          │                  │      │  WebSocket  │  │ (将来)    │
          └─────────────────┘      └────────────┘  └──────────┘
```

## 2. デプロイモード

### 2a. SaaS モード (Vercel)

| コンポーネント | サービス | 備考 |
|--------------|---------|------|
| フロントエンド + SSR | Vercel | Next.js App Router |
| API Routes | Vercel Serverless Functions | /api/* |
| データベース | Vercel Postgres | Neon ベース、無料枠あり |
| ファイルストレージ | Vercel Blob (将来) | エクスポートファイル等 |
| DNS/CDN | Vercel Edge Network | 自動HTTPS |

### 2b. セルフホストモード

```
┌──────────────────────────────────────────┐
│              ユーザーのマシン               │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Next.js (standalone)            │    │
│  │  localhost:3000                   │    │
│  │  ┌────────────┐ ┌─────────────┐  │    │
│  │  │ SSR + API  │ │ Static      │  │    │
│  │  └─────┬──────┘ └─────────────┘  │    │
│  │        │                          │    │
│  │  ┌─────▼──────┐                   │    │
│  │  │  SQLite    │                   │    │
│  │  │  data.db   │                   │    │
│  │  └────────────┘                   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  OpenClaw Gateway                │    │
│  │  ws://localhost:18789            │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

| コンポーネント | 実装 | 備考 |
|--------------|------|------|
| フロントエンド + SSR | Next.js standalone | `next start` or `node server.js` |
| API Routes | 同一プロセス | /api/* |
| データベース | SQLite (better-sqlite3) | `./data/agentflow.db` |
| Gateway連携 | WebSocket | ローカルまたはリモート |

## 3. ネットワーク構成

### 外部通信

| 通信先 | プロトコル | 用途 |
|-------|----------|------|
| OpenClaw Gateway | WebSocket (ws/wss) | セッション管理、チャット、config同期 |
| Vercel Postgres | TCP/TLS | DB接続 (SaaSモードのみ) |
| GitHub API | HTTPS | OAuth認証 (将来) |

### 内部通信

| 通信 | プロトコル | 用途 |
|------|----------|------|
| Browser → Next.js | HTTP/HTTPS | ページ/API |
| Next.js → DB | In-process (SQLite) / TCP (Postgres) | データ永続化 |
| Browser → Gateway | WebSocket | リアルタイム通信 (クライアント直接) |

## 4. 環境変数

```env
# 共通
NEXT_PUBLIC_APP_URL=http://localhost:3000

# DB (セルフホスト)
DATABASE_URL=file:./data/agentflow.db

# DB (SaaS)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...

# Gateway (サーバーサイド連携が必要な場合)
GATEWAY_URL=ws://localhost:18789
GATEWAY_TOKEN=...

# 認証 (将来)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
```

## 5. スケーリング方針

| フェーズ | ユーザー数 | 構成 |
|---------|----------|------|
| MVP | 1-50 | セルフホスト or Vercel無料枠 |
| 成長期 | 50-500 | Vercel Pro + Postgres |
| スケール | 500+ | Vercel Enterprise or 自前K8s |

## 6. セキュリティ

- Gateway トークンはサーバーサイドのみ（クライアントに露出しない）
- ただしブラウザ直接WebSocket接続時はクライアント側にトークン必要 → 接続フローで動的発行を検討
- HTTPS必須 (Vercelは自動)
- セルフホストは `localhost` 前提、外部公開時はリバースプロキシ (nginx/Caddy) 推奨
- SQLiteファイルのパーミッション: 600
