/**
 * OpenClaw Config Exporter v1
 *
 * Organization → OpenClaw config JSON 変換
 * マルチエージェント組織をDiscord guild+channels構造で表現
 */

import type { Organization, Agent, Link, Group } from './types';

export interface OpenClawConfig {
  _meta: {
    exportedFrom: 'agentflow';
    version: 'v1';
    organizationId: string;
    organizationName: string;
    exportedAt: string;
  };
  agents: {
    defaults: {
      model: { primary: string };
      workspace: string;
    };
    configs: Record<string, {
      name: string;
      model?: { primary: string };
      systemPrompt?: string;
      soul?: string;
    }>;
  };
  channels: {
    discord: {
      enabled: boolean;
      guilds: Record<string, {
        name: string;
        categories: Record<string, {
          name: string;
          channels: Record<string, {
            name: string;
            agentId: string;
            sessions_send?: string[];
          }>;
        }>;
        channels: Record<string, {
          name: string;
          agentId: string;
          sessions_send?: string[];
        }>;
      }>;
    };
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unnamed';
}

function buildSystemPrompt(agent: Agent): string | undefined {
  const parts: string[] = [];
  if (agent.personality) parts.push(`# Personality\n${agent.personality}`);
  if (agent.role) parts.push(`# Role\n${agent.role}`);
  if (agent.systemPrompt) parts.push(agent.systemPrompt);
  return parts.length > 0 ? parts.join('\n\n') : undefined;
}

function getAuthorityTargets(agentId: string, links: Link[]): string[] {
  return links
    .filter(l => l.source === agentId && l.type === 'authority')
    .map(l => l.target);
}

export function exportToOpenClawConfig(org: Organization): OpenClawConfig {
  const guildId = `GUILD_${slugify(org.name).toUpperCase()}`;
  
  // Find primary model (most common or first)
  const models = org.agents.map(a => a.model).filter(Boolean);
  const primaryModel = models[0] || 'anthropic/claude-opus-4-6';

  // Agent configs
  const agentConfigs: OpenClawConfig['agents']['configs'] = {};
  for (const agent of org.agents) {
    const prompt = buildSystemPrompt(agent);
    agentConfigs[agent.id] = {
      name: agent.name,
      ...(agent.model && { model: { primary: agent.model } }),
      ...(prompt && { systemPrompt: prompt }),
      ...(agent.personality && { soul: agent.personality }),
    };
  }

  // Group agents by group
  const groupMap = new Map<string, Group>();
  for (const g of org.groups) groupMap.set(g.id, g);
  
  const agentToGroup = new Map<string, string>();
  for (const g of org.groups) {
    for (const aid of g.agentIds) agentToGroup.set(aid, g.id);
  }

  // Build channel structure
  const categories: OpenClawConfig['channels']['discord']['guilds'][string]['categories'] = {};
  const ungroupedChannels: OpenClawConfig['channels']['discord']['guilds'][string]['channels'] = {};

  // Create categories from groups
  for (const group of org.groups) {
    const catId = `CAT_${slugify(group.name).toUpperCase()}`;
    const catChannels: Record<string, { name: string; agentId: string; sessions_send?: string[] }> = {};
    
    for (const agentId of group.agentIds) {
      const agent = org.agents.find(a => a.id === agentId);
      if (!agent) continue;
      const chId = `CH_${slugify(agent.name).toUpperCase()}`;
      const targets = getAuthorityTargets(agent.id, org.links);
      catChannels[chId] = {
        name: agent.name,
        agentId: agent.id,
        ...(targets.length > 0 && { sessions_send: targets }),
      };
    }
    
    categories[catId] = {
      name: group.name,
      channels: catChannels,
    };
  }

  // Ungrouped agents
  for (const agent of org.agents) {
    if (agentToGroup.has(agent.id)) continue;
    const chId = `CH_${slugify(agent.name).toUpperCase()}`;
    const targets = getAuthorityTargets(agent.id, org.links);
    ungroupedChannels[chId] = {
      name: agent.name,
      agentId: agent.id,
      ...(targets.length > 0 && { sessions_send: targets }),
    };
  }

  return {
    _meta: {
      exportedFrom: 'agentflow',
      version: 'v1',
      organizationId: org.id,
      organizationName: org.name,
      exportedAt: new Date().toISOString(),
    },
    agents: {
      defaults: {
        model: { primary: primaryModel },
        workspace: '/path/to/workspace',
      },
      configs: agentConfigs,
    },
    channels: {
      discord: {
        enabled: true,
        guilds: {
          [guildId]: {
            name: org.name,
            categories,
            channels: ungroupedChannels,
          },
        },
      },
    },
  };
}

export function exportToJSON(org: Organization): string {
  return JSON.stringify(exportToOpenClawConfig(org), null, 2);
}
