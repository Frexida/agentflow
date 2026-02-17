/**
 * AgentFlow Data Model v1
 *
 * MOISE+ Structural Specification ベースのエージェント組織モデル。
 * Phase 1 MVP: 組織図エディタ → OpenClaw config エクスポート
 */

/** エージェント定義 — 組織内の個々のAIエージェント */
export interface Agent {
  /** 一意識別子 */
  id: string;
  /** 表示名 */
  name: string;
  /** 役割の説明（MOISE+ Role） */
  role: string;
  /** 性格定義（SOUL.md相当） */
  personality: string;
  /** アバターURL */
  icon?: string;
  /** LLMモデル指定（例: "anthropic/claude-opus-4-6"） */
  model?: string;
  /** カスタムシステムプロンプト */
  systemPrompt?: string;
  /** 初期記憶（MEMORY.md相当） */
  memory?: string;
  /** 使用可能ツールのリスト */
  tools?: string[];
}

/** エージェント間の関係（MOISE+ Link） */
export interface Link {
  /** 一意識別子 */
  id: string;
  /** 関係元 Agent ID */
  source: string;
  /** 関係先 Agent ID */
  target: string;
  /** リンクタイプ: authority=指揮, communication=通信, review=レビュー */
  type: 'authority' | 'communication' | 'review';
  /** 関係の補足説明 */
  label?: string;
}

/** チーム/グループ（MOISE+ Group / AGR Group） */
export interface Group {
  /** 一意識別子 */
  id: string;
  /** グループ名 */
  name: string;
  /** グループの説明 */
  description?: string;
  /** 所属エージェントIDリスト */
  agentIds: string[];
  /** 親グループID（入れ子構造用） */
  parentGroupId?: string;
}

/** 組織全体の定義 */
export interface Organization {
  /** 一意識別子 */
  id: string;
  /** 組織名 */
  name: string;
  /** 組織の説明 */
  description?: string;
  /** データモデルバージョン */
  version: 'v1';
  /** エージェント一覧 */
  agents: Agent[];
  /** エージェント間の関係一覧 */
  links: Link[];
  /** グループ一覧 */
  groups: Group[];

  // --- Phase 3 用フィールド（UIには出さない） ---
  /** Deontic仕様: 権限定義 */
  permissions?: Record<string, unknown>;
  /** リソース制限（トークン/コスト上限等） */
  resourceLimits?: Record<string, unknown>;
  /** エスカレーションルール */
  escalationRules?: Record<string, unknown>;
}

// --- キャンバス状態（UIのみ、エクスポートには含めない） ---

/** キャンバス上のノード位置 */
export interface NodePosition {
  /** 対応する Agent ID */
  agentId: string;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
}

/** キャンバスの表示状態 */
export interface CanvasState {
  /** 各ノードの位置情報 */
  positions: NodePosition[];
  /** ズームレベル */
  zoom: number;
  /** パン X オフセット */
  panX: number;
  /** パン Y オフセット */
  panY: number;
}
