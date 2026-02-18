import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/agentflow.db'

const dir = dirname(DB_PATH)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    structure TEXT DEFAULT 'graph',
    metadata TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    model TEXT,
    icon TEXT,
    system_prompt TEXT,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    config_json TEXT,
    created_at INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    source_agent TEXT NOT NULL,
    target_agent TEXT NOT NULL,
    edge_type TEXT DEFAULT 'authority',
    direction TEXT DEFAULT 'unidirectional',
    source_port TEXT,
    target_port TEXT,
    metadata TEXT
  );
  
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    width REAL DEFAULT 400,
    height REAL DEFAULT 300
  );
  
  CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, agent_id)
  );
  
  CREATE TABLE IF NOT EXISTS config_history (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    config_yaml TEXT NOT NULL,
    applied_at INTEGER,
    base_hash TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(org_id);
  CREATE INDEX IF NOT EXISTS idx_edges_org ON edges(org_id);
  CREATE INDEX IF NOT EXISTS idx_groups_org ON groups(org_id);
  CREATE INDEX IF NOT EXISTS idx_config_history_org ON config_history(org_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_org_agent ON agents(org_id, agent_id);
`)

console.log('Database initialized:', DB_PATH)
db.close()
