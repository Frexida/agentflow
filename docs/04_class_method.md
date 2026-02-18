# クラス・メソッド定義書 — AgentFlow v2

## 1. ディレクトリ構成

```
src/
  app/                    # Next.js App Router
    layout.tsx
    page.tsx              # LP
    dashboard/page.tsx
    editor/[id]/page.tsx
    settings/page.tsx
    api/                  # API Routes
      orgs/route.ts
      gateway/config/route.ts
      sessions/route.ts
      chat/route.ts
  components/
    canvas/               # React Flow カスタムコンポーネント
    chat/                 # チャットUI
    dashboard/            # ダッシュボード
    ui/                   # shadcn/ui コンポーネント
  stores/                 # Zustand ストア
  lib/                    # ユーティリティ
  db/                     # Drizzle スキーマ + 接続
  types/                  # TypeScript 型定義
```

## 2. 型定義 (src/types/)

### types/org.ts

```ts
// タスク特性 (Thompson 1967)
type TaskType = 'independent' | 'sequential' | 'reciprocal'

// 構造モード
type StructureMode = 'tree' | 'graph'

// エッジタイプ
type EdgeType = 'authority' | 'communication' | 'review'

// 方向
type Direction = 'unidirectional' | 'bidirectional'

// ポート
type PortId = 'input_1' | 'input_2' | 'output_1' | 'output_2'

// エージェントロール
type AgentRole = 'coordinator' | 'worker' | 'reviewer' | 'custom'

interface OrgMetadata {
  id: string
  name: string
  description?: string
  taskType?: TaskType
  structure: StructureMode
  createdAt: Date
  updatedAt: Date
}

interface AgentNodeData {
  agentId: string         // OpenClaw agent ID
  name: string
  role?: AgentRole
  model?: string
  systemPrompt?: string
  status?: 'active' | 'idle' | 'offline'
  configJson?: Record<string, unknown>
}

interface AgentEdgeData {
  edgeType: EdgeType
  direction: Direction
}
```

### types/gateway.ts

```ts
interface GatewayConfig {
  url: string
  token: string
}

interface GatewaySession {
  key: string
  agentId?: string
  kind: string
  status: string
  lastMessage?: ChatMessage
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface RPCRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: Record<string, unknown>
}

interface RPCResponse {
  jsonrpc: '2.0'
  id: number
  result?: unknown
  error?: { code: number; message: string }
}
```

## 3. Zustand ストア (src/stores/)

### stores/org.ts — 組織データ

```ts
interface OrgStore {
  // State
  orgs: OrgMetadata[]
  currentOrg: OrgMetadata | null
  nodes: Node<AgentNodeData>[]       // React Flow Node
  edges: Edge<AgentEdgeData>[]       // React Flow Edge

  // Actions
  loadOrgs(): Promise<void>
  createOrg(name: string, taskType?: TaskType): Promise<string>
  deleteOrg(id: string): Promise<void>
  loadOrg(id: string): Promise<void>
  saveOrg(): Promise<void>

  // Node operations
  addAgent(data: AgentNodeData, position: XYPosition): void
  updateAgent(nodeId: string, data: Partial<AgentNodeData>): void
  removeAgent(nodeId: string): void

  // Edge operations
  addEdge(source: string, target: string, data: AgentEdgeData): void
  removeEdge(edgeId: string): void

  // React Flow callbacks
  onNodesChange(changes: NodeChange[]): void
  onEdgesChange(changes: EdgeChange[]): void
  onConnect(connection: Connection): void
}
```

### stores/gateway.ts — Gateway接続

```ts
interface GatewayStore {
  // State
  connected: boolean
  config: GatewayConfig | null
  client: GatewayClient | null
  configHash: string | null

  // Actions
  connect(config: GatewayConfig): Promise<void>
  disconnect(): void

  // RPC
  getSessions(): Promise<GatewaySession[]>
  getConfig(): Promise<{ config: string; hash: string }>
  applyConfig(yaml: string, baseHash: string): Promise<void>
  sendChat(sessionKey: string, message: string): Promise<void>
  getChatHistory(sessionKey: string): Promise<ChatMessage[]>
}
```

### stores/chat.ts — チャット

```ts
interface ChatStore {
  // State
  activeSession: string | null
  messages: Map<string, ChatMessage[]>  // sessionKey → messages
  polling: boolean

  // Actions
  setActiveSession(sessionKey: string): void
  sendMessage(text: string): Promise<void>
  startPolling(): void
  stopPolling(): void
}
```

### stores/ui.ts — UI状態

```ts
interface UIStore {
  // State
  sidebarOpen: boolean
  chatPanelOpen: boolean
  timelinePanelOpen: boolean
  canvasMode: StructureMode
  selectedNodeId: string | null

  // Actions
  toggleSidebar(): void
  toggleChatPanel(): void
  toggleTimelinePanel(): void
  setCanvasMode(mode: StructureMode): void
  selectNode(id: string | null): void
}
```

## 4. コンポーネント (src/components/)

### canvas/AgentNode.tsx

```ts
// React Flow カスタムノード
// Props: NodeProps<AgentNodeData>
// 表示: アイコン、名前、ロール、モデル、ステータスドット
// ポート: top(input_1), bottom(output_1), left(input_2), right(output_2)
// イベント: ダブルクリック → 編集モーダル

function AgentNode({ data, selected }: NodeProps<AgentNodeData>): JSX.Element
```

### canvas/AgentEdge.tsx

```ts
// React Flow カスタムエッジ
// Props: EdgeProps<AgentEdgeData>
// 表示: タイプ別スタイル (実線/点線/波線) + 方向矢印 + フローアニメーション

function AgentEdge(props: EdgeProps<AgentEdgeData>): JSX.Element
```

### canvas/CanvasToolbar.tsx

```ts
// ツールバー
// 機能: ノード追加、自動レイアウト、モード切替、ズーム、エクスポート
// 位置: キャンバス上部

function CanvasToolbar(): JSX.Element
```

### canvas/TaskWizard.tsx

```ts
// Thompson 1967 タスク特性ウィザード
// 3択: Independent / Sequential / Reciprocal
// 選択 → 自動レイアウト生成 (hub-spoke / chain / mesh)

function TaskWizard({ onSelect }: { onSelect: (type: TaskType) => void }): JSX.Element
```

### chat/ChatPanel.tsx

```ts
// サイドパネルチャットUI
// 機能: セッション選択、メッセージ表示、送信
// Gateway WebSocket経由

function ChatPanel(): JSX.Element
```

### dashboard/OrgList.tsx

```ts
// 組織一覧
// 機能: カード表示、新規作成、削除、エディタへ遷移

function OrgList(): JSX.Element
```

## 5. ライブラリ (src/lib/)

### lib/gateway-client.ts

```ts
class GatewayClient {
  constructor(url: string, token: string)

  connect(): Promise<void>
  disconnect(): void
  isConnected(): boolean

  // JSON-RPC 2.0
  rpc(method: string, params?: Record<string, unknown>): Promise<unknown>

  // 便利メソッド
  sessionsList(opts?: { kinds?: string[] }): Promise<GatewaySession[]>
  chatSend(sessionKey: string, message: string): Promise<void>
  chatHistory(sessionKey: string, opts?: { limit?: number }): Promise<ChatMessage[]>
  configGet(): Promise<{ config: string; hash: string }>
  configApply(raw: string, baseHash: string): Promise<void>

  // イベント
  on(event: 'connected' | 'disconnected' | 'error', handler: Function): void
  off(event: string, handler: Function): void
}
```

### lib/config-parser.ts

```ts
// OpenClaw YAML config ↔ React Flow nodes/edges 変換

function configToGraph(yamlString: string): {
  nodes: Node<AgentNodeData>[]
  edges: Edge<AgentEdgeData>[]
}

function graphToConfig(
  nodes: Node<AgentNodeData>[],
  edges: Edge<AgentEdgeData>[],
  orgMetadata: OrgMetadata
): string  // YAML
```

### lib/org-theory.ts

```ts
// Thompson 1967 タスク特性 → 推奨構造

function getRecommendedLayout(taskType: TaskType): {
  structure: StructureMode
  edgeTypes: EdgeType[]
  description: string
}

function generateTemplate(
  taskType: TaskType,
  agentCount: number
): { nodes: Node<AgentNodeData>[]; edges: Edge<AgentEdgeData>[] }

function validateStructure(
  nodes: Node[],
  edges: Edge[],
  mode: StructureMode
): { valid: boolean; errors: string[] }
```

### lib/auto-layout.ts

```ts
// dagre ベースの自動レイアウト

function autoLayout(
  nodes: Node[],
  edges: Edge[],
  options?: { direction?: 'TB' | 'LR'; spacing?: number }
): Node[]  // 座標更新済みノード
```

## 6. API Routes (src/app/api/)

### api/orgs/route.ts

```ts
// GET  /api/orgs          → 組織一覧
// POST /api/orgs          → 組織作成 { name, taskType? }
```

### api/orgs/[id]/route.ts

```ts
// GET    /api/orgs/:id    → 組織詳細 (agents, edges, groups含む)
// PUT    /api/orgs/:id    → 組織更新 (nodes, edges一括保存)
// DELETE /api/orgs/:id    → 組織削除
```

### api/gateway/config/route.ts

```ts
// POST /api/gateway/config  { action: 'get' | 'apply', ... }
// サーバーサイドでGateway RPCを代理
```

### api/sessions/route.ts

```ts
// GET /api/sessions
// Gateway sessions.list のプロキシ
```

### api/chat/route.ts

```ts
// POST /api/chat  { action: 'send' | 'history', sessionKey, message? }
// Gateway chat.send / chat.history のプロキシ
```
