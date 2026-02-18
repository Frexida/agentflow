# AgentFlow v2 外部I/F仕様書

## 1. 外部システム一覧

| システム名 | 接続方式 | 用途 |
|-----------|----------|------|
| OpenClaw Gateway | HTTP/RPC | エージェント操作、config管理 |

## 2. OpenClaw Gateway I/F

### 2.1 接続情報

| 項目 | 値 |
|------|-----|
| プロトコル | **WebSocket** |
| デフォルトURL | ws://localhost:18789 |
| 認証 | Token (接続時に送信) |
| フォーマット | JSON-RPC 2.0 |

### 2.2 RPC 通信

全てのRPCは **WebSocket接続上でJSON-RPC 2.0** 形式で送信:

```json
{
  "method": "<method_name>",
  "params": { ... }
}
```

### 2.3 メソッド一覧

#### 2.3.1 config.get
**説明**: 現在のOpenClaw configを取得

**リクエスト**:
```json
{
  "method": "config.get",
  "params": {}
}
```

**レスポンス**:
```json
{
  "config": {
    "agents": {
      "pm-1": {
        "name": "PM鬼畜",
        "model": "anthropic/claude-opus-4-6",
        "workspace": "/home/user/.openclaw/workspace-pm",
        "subagents": {
          "allowAgents": ["dev-1", "research-1"]
        }
      }
    }
  },
  "baseHash": "abc123..."
}
```

#### 2.3.2 config.apply
**説明**: configを適用してGatewayを再起動

**リクエスト**:
```json
{
  "method": "config.apply",
  "params": {
    "raw": "<YAML形式のconfig>",
    "baseHash": "abc123...",
    "reason": "AgentFlow v2 update"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "newHash": "def456..."
}
```

#### 2.3.3 sessions.list
**説明**: アクティブなセッション一覧を取得

**リクエスト**:
```json
{
  "method": "sessions.list",
  "params": {
    "kinds": ["main"],
    "includeLastMessage": true,
    "messageLimit": 5
  }
}
```

**レスポンス**:
```json
{
  "sessions": [
    {
      "sessionKey": "agent:pm-1:discord:guild:123",
      "agentId": "pm-1",
      "kind": "main",
      "activeAt": "2026-02-18T07:50:00Z",
      "lastMessages": [...]
    }
  ]
}
```

#### 2.3.4 chat.send
**説明**: エージェントセッションにメッセージ送信

**リクエスト**:
```json
{
  "method": "chat.send",
  "params": {
    "sessionKey": "agent:pm-1:discord:guild:123",
    "message": "Hello from AgentFlow",
    "idempotencyKey": "unique-key-123"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "messageId": "msg-001"
}
```

#### 2.3.5 chat.history
**説明**: セッションのチャット履歴を取得

**リクエスト**:
```json
{
  "method": "chat.history",
  "params": {
    "sessionKey": "agent:pm-1:discord:guild:123",
    "limit": 20
  }
}
```

**レスポンス**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": [{"type": "text", "text": "Hello"}],
      "timestamp": "2026-02-18T07:45:00Z"
    },
    {
      "role": "assistant",
      "content": [{"type": "text", "text": "Hi there!"}],
      "timestamp": "2026-02-18T07:45:05Z"
    }
  ]
}
```

## 3. エラーハンドリング

### 3.1 エラーレスポンス形式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### 3.2 エラーコード一覧

| コード | HTTP Status | 説明 |
|--------|-------------|------|
| UNAUTHORIZED | 401 | 認証エラー |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | パラメータ不正 |
| GATEWAY_ERROR | 502 | Gateway接続エラー |
| INTERNAL_ERROR | 500 | 内部エラー |

## 4. AgentFlow API Routes → Gateway マッピング

| AgentFlow API | Gateway Method |
|---------------|----------------|
| POST /api/gateway/config/get | config.get |
| POST /api/gateway/config/apply | config.apply |
| POST /api/gateway/sessions/list | sessions.list |
| POST /api/gateway/chat/send | chat.send |
| POST /api/gateway/chat/history | chat.history |

## 5. データ変換

### 5.1 AgentFlow → OpenClaw Config

```typescript
// AgentFlow内部形式
interface AgentFlowAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  connections: { targetId: string; type: string }[];
}

// OpenClaw config形式
interface OpenClawAgentConfig {
  name: string;
  model: string;
  workspace: string;
  subagents?: {
    allowAgents: string[];
  };
}

// 変換関数
function toOpenClawConfig(agents: AgentFlowAgent[]): OpenClawConfig {
  const config = { agents: {} };
  for (const agent of agents) {
    config.agents[agent.id] = {
      name: agent.name,
      model: agent.model,
      workspace: `/home/user/.openclaw/workspace-${agent.id}`,
      subagents: {
        allowAgents: agent.connections
          .filter(c => c.type === 'command')
          .map(c => c.targetId)
      }
    };
  }
  return config;
}
```

### 5.2 OpenClaw Config → AgentFlow

```typescript
function fromOpenClawConfig(config: OpenClawConfig): AgentFlowAgent[] {
  const agents: AgentFlowAgent[] = [];
  for (const [id, agentConfig] of Object.entries(config.agents)) {
    agents.push({
      id,
      name: agentConfig.name,
      role: '',
      model: agentConfig.model,
      connections: (agentConfig.subagents?.allowAgents || [])
        .map(targetId => ({ targetId, type: 'command' }))
    });
  }
  return agents;
}
```

## 6. 通信シーケンス

### 6.1 Config Import

```
AgentFlow                  Next.js API              OpenClaw Gateway
    │                          │                          │
    │ GET /api/gateway/config  │                          │
    │─────────────────────────►│                          │
    │                          │ POST /rpc (config.get)   │
    │                          │─────────────────────────►│
    │                          │◄─────────────────────────│
    │◄─────────────────────────│                          │
    │                          │                          │
```

### 6.2 Chat Send

```
AgentFlow                  Next.js API              OpenClaw Gateway
    │                          │                          │
    │ POST /api/gateway/chat   │                          │
    │─────────────────────────►│                          │
    │                          │ POST /rpc (chat.send)    │
    │                          │─────────────────────────►│
    │                          │◄─────────────────────────│
    │◄─────────────────────────│                          │
    │                          │                          │
```
