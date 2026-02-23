# API設計

## 概要

AgentFlow v3 のAPI設計。
詳細は設計フェーズで決定。

## エンドポイント（案）

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/organizations` | GET/POST | 組織一覧・作成 |
| `/api/organizations/:id` | GET/PUT/DELETE | 組織詳細・更新・削除 |
| `/api/organizations/:id/agents` | GET/POST | エージェント一覧・追加 |
| `/api/organizations/:id/connections` | GET/POST | 接続関係一覧・追加 |
| `/api/organizations/:id/export` | GET | OpenClaw config エクスポート |
| `/api/gateway/connect` | WebSocket | Gateway接続 |
| `/api/gateway/sessions` | GET | セッション一覧 |
| `/api/gateway/chat` | POST | メッセージ送信 |

## 認証（案）

| 方式 | 用途 |
|------|------|
| Supabase Auth | ユーザー認証（SaaS版） |
| API Key | セルフホスト版 |
| Gateway Token | OpenClaw接続 |

## データモデル

```mermaid
erDiagram
    Organization ||--o{ Agent : has
    Organization ||--o{ Connection : has
    Agent ||--o{ Connection : from
    Agent ||--o{ Connection : to

    Organization {
        string id PK
        string name
        string description
        json settings
        timestamp created_at
    }

    Agent {
        string id PK
        string org_id FK
        string name
        string role
        json config
        json position
    }

    Connection {
        string id PK
        string org_id FK
        string from_agent FK
        string to_agent FK
        string type
        string label
    }
```

## TODO

- [ ] 詳細なリクエスト/レスポンス仕様
- [ ] エラーハンドリング
- [ ] Rate limiting
- [ ] WebSocket プロトコル詳細
