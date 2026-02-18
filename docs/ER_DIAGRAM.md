# AgentFlow v2 ER図（概念）

## 1. エンティティ関連図

```
┌─────────────────┐       ┌─────────────────┐
│   Organization  │       │     Agent       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ name            │   │   │ org_id (FK)     │───┐
│ description     │   └──►│ name            │   │
│ created_at      │       │ role            │   │
│ updated_at      │       │ model           │   │
│ config_json     │       │ icon            │   │
└─────────────────┘       │ position_x      │   │
                          │ position_y      │   │
                          │ config_json     │   │
                          │ created_at      │   │
                          └─────────────────┘   │
                                  │             │
                                  │             │
                                  ▼             │
                          ┌─────────────────┐   │
                          │   Connection    │   │
                          ├─────────────────┤   │
                          │ id (PK)         │   │
                          │ org_id (FK)     │◄──┘
                          │ source_id (FK)  │───► Agent
                          │ target_id (FK)  │───► Agent
                          │ type            │
                          │ direction       │
                          │ label           │
                          └─────────────────┘
                          
┌─────────────────┐       ┌─────────────────┐
│     Group       │       │    Setting      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ key (PK)        │
│ org_id (FK)     │       │ value           │
│ name            │       │ updated_at      │
│ color           │       └─────────────────┘
│ agent_ids       │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  ConfigHistory  │       │   ChatHistory   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │       │ agent_id (FK)   │
│ config_json     │       │ role            │
│ hash            │       │ content         │
│ created_at      │       │ timestamp       │
└─────────────────┘       └─────────────────┘
```

## 2. テーブル定義

### 2.1 organizations
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | UUID |
| name | TEXT | NOT NULL | 組織名 |
| description | TEXT | | 説明 |
| created_at | TEXT | NOT NULL | 作成日時 (ISO8601) |
| updated_at | TEXT | NOT NULL | 更新日時 (ISO8601) |
| config_json | TEXT | | OpenClaw config全体 |

### 2.2 agents
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | エージェントID |
| org_id | TEXT | FK → organizations.id | 所属組織 |
| name | TEXT | NOT NULL | 表示名 |
| role | TEXT | | 役割 |
| model | TEXT | | 使用モデル |
| icon | TEXT | | アイコン絵文字 |
| position_x | REAL | | キャンバスX座標 |
| position_y | REAL | | キャンバスY座標 |
| config_json | TEXT | | エージェント固有設定 |
| created_at | TEXT | NOT NULL | 作成日時 |

### 2.3 connections
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | UUID |
| org_id | TEXT | FK → organizations.id | 所属組織 |
| source_id | TEXT | FK → agents.id | 接続元 |
| target_id | TEXT | FK → agents.id | 接続先 |
| type | TEXT | NOT NULL | 'command' / 'communication' / 'review' |
| direction | TEXT | NOT NULL | 'unidirectional' / 'bidirectional' |
| label | TEXT | | 接続ラベル |

### 2.4 groups
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | UUID |
| org_id | TEXT | FK → organizations.id | 所属組織 |
| name | TEXT | NOT NULL | グループ名 |
| color | TEXT | | 表示色 |
| agent_ids | TEXT | | JSON配列 |

### 2.5 config_history
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | UUID |
| org_id | TEXT | FK → organizations.id | 所属組織 |
| config_json | TEXT | NOT NULL | 保存されたconfig |
| hash | TEXT | NOT NULL | configのハッシュ |
| created_at | TEXT | NOT NULL | 保存日時 |

### 2.6 chat_history
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | TEXT | PK | UUID |
| agent_id | TEXT | FK → agents.id | 対象エージェント |
| role | TEXT | NOT NULL | 'user' / 'assistant' |
| content | TEXT | NOT NULL | メッセージ内容 |
| timestamp | TEXT | NOT NULL | 送信日時 |

### 2.7 settings
| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| key | TEXT | PK | 設定キー |
| value | TEXT | | 設定値 (JSON) |
| updated_at | TEXT | NOT NULL | 更新日時 |

## 3. インデックス

```sql
CREATE INDEX idx_agents_org_id ON agents(org_id);
CREATE INDEX idx_connections_org_id ON connections(org_id);
CREATE INDEX idx_connections_source ON connections(source_id);
CREATE INDEX idx_connections_target ON connections(target_id);
CREATE INDEX idx_groups_org_id ON groups(org_id);
CREATE INDEX idx_config_history_org_id ON config_history(org_id);
CREATE INDEX idx_config_history_created ON config_history(created_at);
CREATE INDEX idx_chat_history_agent_id ON chat_history(agent_id);
CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp);
```

## 4. 関連性

| 関連 | カーディナリティ | 説明 |
|------|------------------|------|
| Organization → Agent | 1:N | 1組織に複数エージェント |
| Organization → Connection | 1:N | 1組織に複数接続 |
| Organization → Group | 1:N | 1組織に複数グループ |
| Organization → ConfigHistory | 1:N | 1組織に複数履歴 |
| Agent → Connection (source) | 1:N | 1エージェントから複数接続 |
| Agent → Connection (target) | 1:N | 1エージェントへ複数接続 |
| Agent → ChatHistory | 1:N | 1エージェントに複数チャット |

## 5. データ例

### organizations
```json
{
  "id": "org-001",
  "name": "AgentFlow Team",
  "description": "AI構成の会社実験",
  "created_at": "2026-02-18T07:00:00Z",
  "updated_at": "2026-02-18T07:58:00Z"
}
```

### agents
```json
{
  "id": "pm-1",
  "org_id": "org-001",
  "name": "PM鬼畜",
  "role": "Project Manager",
  "model": "claude-opus-4-6",
  "icon": "👹",
  "position_x": 400,
  "position_y": 200
}
```

### connections
```json
{
  "id": "conn-001",
  "org_id": "org-001",
  "source_id": "leith18",
  "target_id": "pm-1",
  "type": "command",
  "direction": "unidirectional",
  "label": "CEO→PM"
}
```
