# API設計

## 概要

AgentFlow v3 のAPI設計。
Next.js API Routes + OpenClaw Gateway WebSocket。

---

## 認証

| 方式 | 用途 | ヘッダー |
|------|------|---------|
| Supabase Auth | SaaS版ユーザー認証 | `Authorization: Bearer {jwt}` |
| API Key | セルフホスト版 | `X-API-Key: {key}` |
| Gateway Token | OpenClaw接続 | WebSocket handshake時 |

---

## エンドポイント一覧

### Organizations

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/organizations` | 組織一覧取得 |
| POST | `/api/organizations` | 組織作成 |
| GET | `/api/organizations/:id` | 組織詳細取得 |
| PUT | `/api/organizations/:id` | 組織更新 |
| DELETE | `/api/organizations/:id` | 組織削除 |

### Agents

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/organizations/:id/agents` | エージェント一覧 |
| POST | `/api/organizations/:id/agents` | エージェント追加 |
| PUT | `/api/organizations/:id/agents/:agentId` | エージェント更新 |
| DELETE | `/api/organizations/:id/agents/:agentId` | エージェント削除 |

### Connections

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/organizations/:id/connections` | 接続一覧 |
| POST | `/api/organizations/:id/connections` | 接続追加 |
| DELETE | `/api/organizations/:id/connections/:connId` | 接続削除 |

### Export

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/organizations/:id/export` | OpenClaw YAML エクスポート |
| POST | `/api/organizations/:id/export/apply` | Gateway に直接適用 |

### Gateway

| メソッド | パス | 説明 |
|---------|------|------|
| WebSocket | `/api/gateway/ws` | Gateway リアルタイム接続 |
| GET | `/api/gateway/status` | Gateway 接続状態 |
| GET | `/api/gateway/sessions` | セッション一覧 |
| POST | `/api/gateway/chat` | メッセージ送信 |

---

## Request/Response スキーマ

### POST /api/organizations

**Request**
```json
{
  "name": "Frexida",
  "description": "MAS研究OSS、受託開発",
  "settings": {
    "gatewayUrl": "ws://localhost:18789",
    "gatewayToken": "xxx"
  }
}
```

**Response: 201 Created**
```json
{
  "id": "org_abc123",
  "name": "Frexida",
  "description": "MAS研究OSS、受託開発",
  "settings": { ... },
  "created_at": "2026-02-23T12:00:00Z"
}
```

### POST /api/organizations/:id/agents

**Request**
```json
{
  "agentId": "pm-1",
  "name": "Project Manager",
  "role": "pm",
  "config": {
    "model": "anthropic/claude-sonnet-4-20250514",
    "workspace": "/workspace-pm-1",
    "capabilities": ["exec", "browser"],
    "trustLevel": "medium"
  },
  "position": { "x": 200, "y": 300 }
}
```

**Response: 201 Created**
```json
{
  "id": "agent_xyz789",
  "org_id": "org_abc123",
  "agentId": "pm-1",
  "name": "Project Manager",
  "role": "pm",
  "config": { ... },
  "position": { "x": 200, "y": 300 },
  "created_at": "2026-02-23T12:00:00Z"
}
```

### POST /api/organizations/:id/connections

**Request**
```json
{
  "from": "manager-1",
  "to": "pm-1",
  "type": "reports_to",
  "label": "日常報告"
}
```

**Response: 201 Created**
```json
{
  "id": "conn_def456",
  "org_id": "org_abc123",
  "from": "manager-1",
  "to": "pm-1",
  "type": "reports_to",
  "label": "日常報告"
}
```

### GET /api/organizations/:id/export

**Response: 200 OK**
```yaml
agents:
  list:
    - id: pm-1
      workspace: /home/user/.openclaw/workspace-pm-1
      model:
        primary: anthropic/claude-sonnet-4-20250514
    - id: dev-1
      workspace: /home/user/.openclaw/workspace-dev-1
      model:
        primary: anthropic/claude-sonnet-4-20250514
  subagents:
    allowAgents: ["*"]
```

### POST /api/gateway/chat

**Request**
```json
{
  "sessionKey": "pm-1",
  "message": "タスクの進捗を報告して"
}
```

**Response: 200 OK**
```json
{
  "sessionKey": "pm-1",
  "response": "現在の進捗は...",
  "timestamp": "2026-02-23T12:00:00Z"
}
```

---

## WebSocket プロトコル

### 接続

```
ws://localhost:3000/api/gateway/ws?token={gatewayToken}
```

### メッセージ形式（JSON-RPC 2.0）

**Request**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "chat.send",
  "params": {
    "sessionKey": "pm-1",
    "message": "hello"
  }
}
```

**Response**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "response": "Hi! I'm pm-1...",
    "timestamp": "2026-02-23T12:00:00Z"
  }
}
```

**Server Push（イベント）**
```json
{
  "jsonrpc": "2.0",
  "method": "session.message",
  "params": {
    "sessionKey": "pm-1",
    "role": "assistant",
    "content": "タスク完了しました"
  }
}
```

---

## エラーハンドリング

| HTTPコード | 意味 | 例 |
|-----------|------|-----|
| 400 | Bad Request | 必須パラメータ不足 |
| 401 | Unauthorized | 認証失敗 |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースなし |
| 409 | Conflict | 重複作成 |
| 500 | Internal Server Error | サーバーエラー |
| 502 | Bad Gateway | Gateway接続失敗 |

**エラーレスポンス形式**
```json
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent pm-1 not found in organization",
    "details": { "agentId": "pm-1" }
  }
}
```

---

## Rate Limiting

| プラン | リクエスト/分 | WebSocket接続数 |
|--------|-------------|----------------|
| Free | 60 | 1 |
| Pro | 300 | 5 |
| Enterprise | Unlimited | Unlimited |

**レート制限ヘッダー**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1708696800
```

---

## データモデル

```mermaid
erDiagram
    User ||--o{ Organization : owns
    Organization ||--o{ Agent : has
    Organization ||--o{ Connection : has
    Agent ||--o{ Connection : from
    Agent ||--o{ Connection : to

    User {
        string id PK
        string email
        string plan
        timestamp created_at
    }

    Organization {
        string id PK
        string user_id FK
        string name
        string description
        json settings
        timestamp created_at
    }

    Agent {
        string id PK
        string org_id FK
        string agentId
        string name
        string role
        json config
        json position
        timestamp created_at
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

---

## TODO

- [x] エンドポイント一覧
- [x] Request/Response スキーマ
- [x] WebSocket プロトコル
- [x] エラーハンドリング
- [x] Rate limiting
- [ ] OpenAPI/Swagger 仕様書生成
- [ ] SDK（TypeScript）
