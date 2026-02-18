import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const orgs = sqliteTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  taskType: text('task_type'),
  structure: text('structure').default('graph'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  name: text('name').notNull(),
  role: text('role'),
  model: text('model'),
  icon: text('icon'),
  systemPrompt: text('system_prompt'),
  positionX: real('position_x').default(0),
  positionY: real('position_y').default(0),
  configJson: text('config_json'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const edges = sqliteTable('edges', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  sourceAgent: text('source_agent').notNull(),
  targetAgent: text('target_agent').notNull(),
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
  appliedAt: integer('applied_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  baseHash: text('base_hash'),
})
