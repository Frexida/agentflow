/**
 * OpenClaw Config Exporter v1
 *
 * Organization → OpenClaw config JSON 変換
 *
 * MVP検証基準（倫理アンチ承認済み）:
 * 1. config.apply で通る
 * 2. エージェントがセッションを持てる
 * 3. sessions_send で組織図通りの指示関係が動く
 */

import type { Organization, Agent, Link } from './types';

/** OpenClaw agent config の型（エクスポート用） */
export interface OpenClawAgentConfig {
  name: string;
  model?: { primary: string };
  systemPrompt?: string;
  workspace?: string;
}

/** OpenClaw config 全体の型 */
export interface OpenClawConfig {
  agents: Record<string, OpenClawAgentConfig>;
  // TODO: channels, gateway 等の設定
  _meta: {
    exportedFrom: 'agentflow';
    version: 'v1';
    organizationId: string;
    organizationName: string;
    exportedAt: string;
  };
}

/**
 * Organization を OpenClaw config JSON に変換する
 *
 * TODO: 以下を実装
 * - Agent → agents config マッピング
 * - Link (authority) → sessions_send 許可設定
 * - Link (communication) → channel 設定
 * - Group → channel/workspace 構造
 */
export function exportToOpenClawConfig(org: Organization): OpenClawConfig {
  const agents: Record<string, OpenClawAgentConfig> = {};

  for (const agent of org.agents) {
    agents[agent.id] = mapAgent(agent);
  }

  // TODO: Link の authority 関係を設定に反映
  // TODO: Group をチャンネル構造に反映

  return {
    agents,
    _meta: {
      exportedFrom: 'agentflow',
      version: 'v1',
      organizationId: org.id,
      organizationName: org.name,
      exportedAt: new Date().toISOString(),
    },
  };
}

/** Agent → OpenClaw agent config 変換 */
function mapAgent(agent: Agent): OpenClawAgentConfig {
  const config: OpenClawAgentConfig = {
    name: agent.name,
  };

  if (agent.model) {
    config.model = { primary: agent.model };
  }

  // personality + systemPrompt を結合してシステムプロンプトに
  const promptParts: string[] = [];
  if (agent.personality) promptParts.push(agent.personality);
  if (agent.systemPrompt) promptParts.push(agent.systemPrompt);
  if (promptParts.length > 0) {
    config.systemPrompt = promptParts.join('\n\n');
  }

  return config;
}

/**
 * エクスポートしたconfigをJSON文字列として返す
 */
export function exportToJSON(org: Organization): string {
  return JSON.stringify(exportToOpenClawConfig(org), null, 2);
}
