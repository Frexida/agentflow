# データベース設計書 — AgentFlow v2

## 1. 概要

- ORM: Drizzle ORM
- セルフホスト: SQLite (better-sqlite3)
- SaaS: PostgreSQL (Vercel Postgres / Neon)
- Drizzle の dialect 切り替えで両対応

## 2. ER図 (概念)

```
┌──────────────┐       ┌──────────────────┐
│   orgs       │──1:N──│   agents         │
│              │       │                  │
│  id (PK)     │       │  id (PK)         │
│  name        │       │  org_id (FK)     │
│  description │       │  agent_id        │
│  task_type   │       │  name            │
│  structure   │       │  role            │
│  metadata    │       │  model           │
│  created_at  │       │  system_prompt   │
│  updated_at  │       │  position_x      │
│              │       │  position_y      │
└──────┬───────┘       │  config_json     │
       │               └────────┬─────────┘
       │                        │
       │               ┌───────────────────┐
       │               │   edges           │
       │──1:N──────────│                   │
       │               │  id (PK)          │
       │               │  org_id (FK)      │
       │               │  source_agent (FK)│
       │               │  target_agent (FK)│
       │               │  edge_type        │
       │               │  direction        │
       │               │  source_port      │
       │               │  target_port      │
       │               │  metadata         │
       │               └───────────────────┘
       │
       │               ┌───────────────────┐
       │──1:N──────────│   groups          │
       │               │                   │
       │               │  id (PK)          │
       │               │  org_id (FK)      │
       │               │  name             │
       │               │  color            │
       │               │  position_x       │
       │               │  position_y       │
       │               │  width            │
       │               │  height           │
       │               └───────────────────┘
       │
       │               ┌───────────────────┐
       └──1:N──────────│   config_history  │
                       │                   │
                       │  id (PK)          │
                       │  org_id (FK)      │
                       │  version          │
                       │  config_yaml      │
                       │  applied_at       │
                       │  base_hash        │
                       └───────────────────┘
```

## 3. テーブル定義

### 3.1 orgs — 組織

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | TEXT (UUID) | PK | 組織ID |
| name | TEXT | NOT NULL | 組織名 |
| description | TEXT | | 説明 |
| task_type | TEXT | | `independent` / `sequential` / `reciprocal` |
| structure | TEXT | DEFAULT `graph` | `tree` / `graph` |
| metadata | TEXT (JSON) | | 追加メタデータ |
| created_at | TIMESTAMP | DEFAULT NOW | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新日時 |

### 3.2 agents — エージェントノード

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | TEXT (UUID) | PK | 内部ID |
| org_id | TEXT | FK → orgs.id, NOT NULL | 所属組織 |
| agent_id | TEXT | NOT NULL | OpenClaw agent ID (例: `dev-1`) |
| name | TEXT | NOT NULL | 表示名 |
| role | TEXT | | ロール (`coordinator` / `worker` / `reviewer`) |
| model | TEXT | | LLMモデル名 |
| system_prompt | TEXT | | システムプロンプト |
| position_x | REAL | DEFAULT 0 | キャンバスX座標 |
| position_y | REAL | DEFAULT 0 | キャンバスY座標 |
| config_json | TEXT (JSON) | | OpenClaw agent config全体 |
| created_at | TIMESTAMP | DEFAULT NOW | 作成日時 |

**UNIQUE制約**: (org_id, agent_id)

### 3.3 edges — 接続線

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | TEXT (UUID) | PK | 接続ID |
| org_id | TEXT | FK → orgs.id, NOT NULL | 所属組織 |
| source_agent | TEXT | FK → agents.id, NOT NULL | 接続元 |
| target_agent | TEXT | FK → agents.id, NOT NULL | 接続先 |
| edge_type | TEXT | DEFAULT `authority` | `authority` / `communication` / `review` |
| direction | TEXT | DEFAULT `unidirectional` | `unidirectional` / `bidirectional` |
| source_port | TEXT | | `output_1` / `output_2` |
| target_port | TEXT | | `input_1` / `input_2` |
| metadata | TEXT (JSON) | | 追加メタデータ |

### 3.4 groups — グループ/部門

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | TEXT (UUID) | PK | グループID |
| org_id | TEXT | FK → orgs.id, NOT NULL | 所属組織 |
| name | TEXT | NOT NULL | グループ名 |
| color | TEXT | | 背景色 |
| position_x | REAL | DEFAULT 0 | キャンバスX座標 |
| position_y | REAL | DEFAULT 0 | キャンバスY座標 |
| width | REAL | DEFAULT 400 | 幅 |
| height | REAL | DEFAULT 300 | 高さ |

### 3.5 group_members — グループ所属

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| group_id | TEXT | FK → groups.id | グループ |
| agent_id | TEXT | FK → agents.id | エージェント |

**PK**: (group_id, agent_id)

### 3.6 config_history — 設定履歴

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | TEXT (UUID) | PK | 履歴ID |
| org_id | TEXT | FK → orgs.id, NOT NULL | 対象組織 |
| version | INTEGER | NOT NULL | バージョン番号 |
| config_yaml | TEXT | NOT NULL | YAML全文 |
| applied_at | TIMESTAMP | DEFAULT NOW | 適用日時 |
| base_hash | TEXT | | Gateway config hash |

**UNIQUE制約**: (org_id, version)

## 4. Drizzle スキーマ (src/db/schema.ts)

```ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const orgs = sqliteTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  taskType: text('task_type'),
  structure: text('structure').default('graph'),
  metadata: text('metadata'),   // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
})

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  name: text('name').notNull(),
  role: text('role'),
  model: text('model'),
  systemPrompt: text('system_prompt'),
  positionX: real('position_x').default(0),
  positionY: real('position_y').default(0),
  configJson: text('config_json'),  // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
})

export const edges = sqliteTable('edges', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  sourceAgent: text('source_agent').notNull().references(() => agents.id),
  targetAgent: text('target_agent').notNull().references(() => agents.id),
  edgeType: text('edge_type').default('authority'),
  direction: text('direction').default('unidirectional'),
  sourcePort: text('source_port'),
  targetPort: text('target_port'),
  metadata: text('metadata'),
})

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color'),
  positionX: real('position_x').default(0),
  positionY: real('position_y').default(0),
  width: real('width').default(400),
  height: real('height').default(300),
})

export const groupMembers = sqliteTable('group_members', {
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
})

export const configHistory = sqliteTable('config_history', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  configYaml: text('config_yaml').notNull(),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).defaultNow(),
  baseHash: text('base_hash'),
})
```

## 5. インデックス

```sql
CREATE INDEX idx_agents_org ON agents(org_id);
CREATE INDEX idx_edges_org ON edges(org_id);
CREATE INDEX idx_edges_source ON edges(source_agent);
CREATE INDEX idx_edges_target ON edges(target_agent);
CREATE INDEX idx_groups_org ON groups(org_id);
CREATE INDEX idx_config_history_org ON config_history(org_id);
CREATE UNIQUE INDEX idx_agents_org_agent ON agents(org_id, agent_id);
CREATE UNIQUE INDEX idx_config_history_org_ver ON config_history(org_id, version);
```

## 6. マイグレーション方針

- `drizzle-kit push` で開発中はスキーマ直接適用
- 本番リリース後は `drizzle-kit generate` + `drizzle-kit migrate` でマイグレーションファイル管理
- SQLite → PostgreSQL 移行時は Drizzle の dialect 切り替え + `drizzle-kit push` で対応

## 7. データ量見積もり

| テーブル | 想定レコード数/組織 | 備考 |
|---------|------------------|------|
| orgs | 1-10 | ユーザーあたり |
| agents | 5-50 | 組織あたり |
| edges | 10-100 | 組織あたり |
| groups | 1-10 | 組織あたり |
| config_history | 最大50 | 組織あたり (古いものは削除) |

SQLiteでMVP〜数百ユーザーは問題なし。
