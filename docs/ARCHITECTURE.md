# システムアーキテクチャ

## 概要

AgentFlow v3 のシステム構成。

## 全体構成

```mermaid
graph TD
    subgraph Client["クライアント"]
        BROWSER[ブラウザ]
    end

    subgraph Frontend["フロントエンド"]
        NEXT[Next.js 14<br/>App Router]
        FLOW[React Flow<br/>キャンバス]
    end

    subgraph Backend["バックエンド"]
        API[API Routes]
        WS[WebSocket<br/>Proxy]
    end

    subgraph Storage["ストレージ"]
        SUPA[Supabase<br/>PostgreSQL]
        LOCAL[ローカルDB<br/>SQLite]
    end

    subgraph External["外部サービス"]
        GATEWAY[OpenClaw<br/>Gateway]
        VERCEL[Vercel]
        FLY[Fly.io]
    end

    BROWSER --> NEXT
    NEXT --> FLOW
    NEXT --> API
    API --> SUPA
    API --> LOCAL
    API --> WS
    WS --> GATEWAY
    NEXT --> VERCEL
    GATEWAY --> FLY
```

## 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フレームワーク | Next.js 14 (App Router) | RSC、API Routes統合 |
| キャンバス | React Flow | 4辺ポート、スマートルーティング |
| 状態管理 | Zustand | シンプル、TypeScript親和性 |
| DB（SaaS） | Supabase PostgreSQL | Auth統合、RLS |
| DB（セルフホスト） | SQLite + Drizzle | 軽量、ファイルベース |
| デプロイ | Vercel | Next.js最適化 |
| Gateway | Fly.io | グローバル分散 |

## デプロイ構成

### SaaS版

```mermaid
graph LR
    USER[ユーザー] --> CDN[Vercel Edge]
    CDN --> NEXT[Next.js]
    NEXT --> SUPA[Supabase]
    NEXT --> MANAGED[マネージド<br/>Gateway]
```

### セルフホスト版

```mermaid
graph LR
    USER[ユーザー] --> LOCAL[ローカル<br/>Next.js]
    LOCAL --> SQLITE[SQLite]
    LOCAL --> SELF[セルフホスト<br/>Gateway]
```

## ディレクトリ構成（案）

```
/v3
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/       # API Routes
│   │   ├── dashboard/ # ダッシュボード
│   │   ├── editor/    # エディタ
│   │   └── settings/  # 設定
│   ├── components/    # UIコンポーネント
│   │   ├── ui/        # 基本UI
│   │   ├── flow/      # React Flow関連
│   │   └── chat/      # チャットパネル
│   ├── lib/           # ユーティリティ
│   ├── store/         # Zustand stores
│   └── types/         # TypeScript型
├── docs/              # 設計ドキュメント（ここ）
├── tests/             # テスト（QA管理）
└── public/            # 静的ファイル
```

## Secret管理（v3新機能）

```mermaid
graph TD
    subgraph Problem["v2の問題"]
        P1[.env.local]
        P2[Vercel ENV]
        P3[Fly.io Secrets]
        P4[Gateway config]
        P1 -.->|手動同期| P2
        P2 -.->|手動同期| P3
        P3 -.->|手動同期| P4
    end

    subgraph Solution["v3の解決策"]
        SM[Secret Manager]
        SM --> S1[暗号化ストレージ]
        SM --> S2[自動プロビジョニング]
        SM --> S3[監査ログ]
    end
```

## TODO

- [ ] WebSocket プロトコル詳細
- [ ] キャッシング戦略
- [ ] エラーハンドリング
- [ ] モニタリング・ログ
