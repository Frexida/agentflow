/**
 * OpenClaw Config Exporter v2
 *
 * Organization → OpenClaw config JSON (schema-compliant)
 * agents.list[] + bindings[] + channels.discord.guilds 構造
 */

import type { Organization, Agent, Link, Group } from './types';

// --- OpenClaw config types (schema-compliant subset) ---

interface AgentIdentity {
  name?: string;
  emoji?: string;
  avatar?: string;
}

interface AgentEntry {
  id: string;
  name?: string;
  model?: string | { primary: string; fallbacks?: string[] };
  workspace?: string;
  identity?: AgentIdentity;
  subagents?: {
    allowAgents?: string[];
  };
  tools?: {
    profile?: 'minimal' | 'coding' | 'messaging' | 'full';
  };
}

interface Binding {
  agentId: string;
  match: {
    channel: string;
    guildId?: string;
    peer?: {
      kind: 'direct' | 'group' | 'channel' | 'dm';
      id: string;
    };
  };
}

interface DiscordChannelConfig {
  allow?: boolean;
  requireMention?: boolean;
  systemPrompt?: string;
}

interface DiscordGuildConfig {
  requireMention?: boolean;
  users?: string[];
  channels?: Record<string, DiscordChannelConfig>;
}

interface OpenClawConfig {
  agents: {
    defaults: {
      model: { primary: string; fallbacks?: string[] };
      workspace: string;
    };
    list: AgentEntry[];
  };
  bindings: Binding[];
  channels: {
    discord: {
      enabled: boolean;
      groupPolicy: 'open' | 'disabled' | 'allowlist';
      guilds: Record<string, DiscordGuildConfig>;
    };
  };
  commands: {
    native: 'auto' | boolean;
    nativeSkills: 'auto' | boolean;
  };
}

/** AgentFlow metadata (separate from OpenClaw config) */
export interface ExportResult {
  /** Schema-compliant OpenClaw config (can be fed to config.apply) */
  config: OpenClawConfig;
  /** AgentFlow metadata for reference */
  meta: {
    exportedFrom: 'agentflow';
    version: 'v2';
    organizationId: string;
    organizationName: string;
    exportedAt: string;
    /** Workspace files to create per agent (SOUL.md, AGENTS.md, etc.) */
    workspaceFiles: Record<string, Record<string, string>>;
    /** Organization links for documentation */
    links: Array<{ source: string; target: string; type: string; label?: string }>;
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unnamed';
}

/**
 * Build SOUL.md content from agent definition
 */
function buildSoulMd(agent: Agent): string | undefined {
  const parts: string[] = [];
  if (agent.name) parts.push(`# ${agent.name}`);
  if (agent.personality) parts.push(`## Personality\n${agent.personality}`);
  if (agent.role) parts.push(`## Role\n${agent.role}`);
  if (agent.systemPrompt) parts.push(`## Instructions\n${agent.systemPrompt}`);
  return parts.length > 0 ? parts.join('\n\n') + '\n' : undefined;
}

/**
 * Build MEMORY.md content from agent initial memory
 */
function buildMemoryMd(agent: Agent): string | undefined {
  if (!agent.memory) return undefined;
  return `# Initial Memory\n\n${agent.memory}\n`;
}

/**
 * Get authority targets (agents this agent can delegate to via sessions_spawn)
 */
function getAuthorityTargets(agentId: string, links: Link[]): string[] {
  return links
    .filter(l => l.source === agentId && l.type === 'authority')
    .map(l => l.target);
}

export function exportToOpenClaw(org: Organization): ExportResult {
  // Placeholder IDs — user must replace with real Discord IDs
  const GUILD_PLACEHOLDER = 'REPLACE_WITH_GUILD_ID';
  const channelPlaceholder = (agentId: string) => `REPLACE_WITH_CHANNEL_ID_FOR_${slugify(agentId).toUpperCase()}`;

  // Find primary model
  const models = org.agents.map(a => a.model).filter(Boolean);
  const primaryModel = models[0] || 'anthropic/claude-opus-4-6';

  // Base workspace path
  const baseWorkspace = '/home/user/.openclaw/workspace';

  // Build agents.list
  const agentList: AgentEntry[] = [];
  const workspaceFiles: Record<string, Record<string, string>> = {};

  for (const agent of org.agents) {
    const agentSlug = slugify(agent.name || agent.id);
    const agentWorkspace = `${baseWorkspace}/${agentSlug}`;
    const authorityTargets = getAuthorityTargets(agent.id, org.links);

    const entry: AgentEntry = {
      id: agent.id,
      name: agent.name,
      workspace: agentWorkspace,
      identity: {
        name: agent.name,
        ...(agent.icon && { avatar: agent.icon }),
      },
    };

    // Per-agent model override (only if different from default)
    if (agent.model && agent.model !== primaryModel) {
      entry.model = agent.model;
    }

    // Authority links → subagents.allowAgents
    if (authorityTargets.length > 0) {
      entry.subagents = { allowAgents: authorityTargets };
    }

    agentList.push(entry);

    // Workspace files for this agent
    const files: Record<string, string> = {};
    const soul = buildSoulMd(agent);
    if (soul) files['SOUL.md'] = soul;
    const memory = buildMemoryMd(agent);
    if (memory) files['MEMORY.md'] = memory;

    if (Object.keys(files).length > 0) {
      workspaceFiles[agent.id] = files;
    }
  }

  // Build bindings (agent → Discord channel)
  const bindings: Binding[] = org.agents.map(agent => ({
    agentId: agent.id,
    match: {
      channel: 'discord',
      guildId: GUILD_PLACEHOLDER,
      peer: {
        kind: 'channel' as const,
        id: channelPlaceholder(agent.id),
      },
    },
  }));

  // Build Discord guild channels config
  const channelConfigs: Record<string, DiscordChannelConfig> = {};
  for (const agent of org.agents) {
    channelConfigs[channelPlaceholder(agent.id)] = {
      allow: true,
      requireMention: false,
    };
  }

  const config: OpenClawConfig = {
    agents: {
      defaults: {
        model: { primary: primaryModel },
        workspace: baseWorkspace,
      },
      list: agentList,
    },
    bindings,
    channels: {
      discord: {
        enabled: true,
        groupPolicy: 'allowlist',
        guilds: {
          [GUILD_PLACEHOLDER]: {
            requireMention: true,
            users: ['*'],
            channels: channelConfigs,
          } as DiscordGuildConfig,
        },
      },
    },
    commands: {
      native: 'auto',
      nativeSkills: 'auto',
    },
  };

  return {
    config,
    meta: {
      exportedFrom: 'agentflow',
      version: 'v2',
      organizationId: org.id,
      organizationName: org.name,
      exportedAt: new Date().toISOString(),
      workspaceFiles,
      links: org.links.map(l => ({
        source: l.source,
        target: l.target,
        type: l.type,
        ...(l.label && { label: l.label }),
      })),
    },
  };
}

/**
 * Export OpenClaw config JSON only (for config.apply)
 */
export function exportConfigJSON(org: Organization): string {
  const result = exportToOpenClaw(org);
  return JSON.stringify(result.config, null, 2);
}

/**
 * Export full result (config + meta + workspace files)
 */
export function exportFullJSON(org: Organization): string {
  return JSON.stringify(exportToOpenClaw(org), null, 2);
}

// Legacy compat
export const exportToJSON = exportFullJSON;
