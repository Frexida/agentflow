# ミドルウェア設定書 — AgentFlow v2

## 1. Next.js 設定

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // セルフホスト用スタンドアロンビルド
  output: 'standalone',

  // React Flow はCSS importが必要
  transpilePackages: ['@xyflow/react'],

  // 画像最適化 (セルフホスト時はsharp必要)
  images: {
    unoptimized: process.env.SELF_HOSTED === 'true',
  },

  // セキュリティヘッダー
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
}

module.exports = nextConfig
```

### App Router 構成

```
app/
  layout.tsx              # ルートレイアウト (ThemeProvider, Sidebar)
  page.tsx                # LP (/) — SSG
  dashboard/
    page.tsx              # 組織一覧 — SSR
    loading.tsx           # Suspense fallback
  editor/
    [id]/
      page.tsx            # キャンバスエディタ — CSR (React Flow)
  settings/
    page.tsx              # 設定 — SSR
  api/
    orgs/
      route.ts            # CRUD: GET/POST
      [id]/
        route.ts          # CRUD: GET/PUT/DELETE
    gateway/
      connect/
        route.ts          # Gateway接続テスト
      config/
        route.ts          # config.get / config.apply proxy
    sessions/
      route.ts            # sessions.list proxy
    chat/
      route.ts            # chat.send / chat.history proxy
```

## 2. データベース (Drizzle ORM)

### 選定理由
- TypeScript ファースト
- SQLite / PostgreSQL 両対応
- マイグレーション組み込み
- 軽量 (Prisma比)

### drizzle.config.ts

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // セルフホスト: better-sqlite3 / SaaS: postgres
  dialect: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgresql' : 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./data/agentflow.db',
  },
})
```

### DB接続 (src/db/index.ts)

```ts
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePg } from 'drizzle-orm/vercel-postgres'

export const db = process.env.POSTGRES_URL
  ? drizzlePg(/* ... */)
  : drizzleSqlite(/* ... */)
```

## 3. React Flow 設定

### カスタムノードタイプ

```ts
const nodeTypes = {
  agent: AgentNode,      // エージェントノード
  group: GroupNode,      // 部門/グループノード
}
```

### カスタムエッジタイプ

```ts
const edgeTypes = {
  authority: AuthorityEdge,    // 指揮系統 (実線)
  communication: CommEdge,     // 連絡 (点線)
  review: ReviewEdge,          // レビュー (波線)
}
```

### React Flow デフォルト設定

```ts
const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
}

const fitViewOptions = {
  padding: 0.2,
  maxZoom: 1.5,
}
```

## 4. Tailwind CSS 設定

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',    // ダークテーマデフォルト
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // v1 デザインシステムから継承
        surface: {
          DEFAULT: '#1a1a2e',
          elevated: '#16213e',
        },
        accent: {
          DEFAULT: '#0f3460',
          bright: '#e94560',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),  // shadcn/ui 用
  ],
}

export default config
```

## 5. shadcn/ui

### 使用コンポーネント

| コンポーネント | 用途 |
|-------------|------|
| Dialog | モーダル (エクスポート、設定) |
| Sheet | サイドパネル (チャット) |
| Tabs | エクスポートモーダルのタブ |
| Select | モデル選択、ロール選択 |
| Input | テキスト入力 |
| Button | 各種ボタン |
| Toast | 通知 |
| DropdownMenu | コンテキストメニュー |
| Tooltip | ツールチップ |

## 6. 状態管理 (Zustand)

### 選定理由
- React外からもアクセス可能
- TypeScript親和性高い
- ボイラープレート少ない
- DevTools対応

### ストア構成

```ts
// stores/org.ts      — 組織データ (nodes, edges, metadata)
// stores/gateway.ts  — Gateway接続状態
// stores/chat.ts     — チャットメッセージ
// stores/sessions.ts — セッション一覧
// stores/ui.ts       — UI状態 (sidebar, panels, mode)
```

## 7. WebSocket (Gateway連携)

### クライアント側

ブラウザから直接Gateway WebSocketに接続:

```ts
// lib/gateway-client.ts
// v1の public/gateway-client.js をTypeScript化
// JSON-RPC 2.0 over WebSocket
// 対応RPC: sessions.list, chat.send, chat.history, config.get, config.apply
```

### サーバー側 (API Routes)

Gateway トークンを隠蔽する必要がある場合:

```ts
// app/api/gateway/config/route.ts
// サーバーサイドでGateway RPCを代理実行
// クライアントにトークンを渡さない
```

## 8. ビルド & デプロイ

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Vercel デプロイ

```
vercel.json は不要 (Next.js自動検出)
環境変数は Vercel Dashboard で設定
```

### セルフホスト デプロイ

```bash
npm install
npm run db:push        # DBスキーマ適用
npm run build          # standalone ビルド
node .next/standalone/server.js  # 起動
```
