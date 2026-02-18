# AgentFlow v2 技術選定 + アーキテクチャ設計

> v1の教訓: 機能に対してライブラリの能力が足りず、自前実装地獄に陥った。
> v2では**機能要件から逆算してライブラリを選定**する。

---

## 機能→ライブラリ マッピング

### キャンバス（最重要）
| 必要機能 | @xyflow/svelte | rete.js | JointJS | 自前 |
|---------|---------------|---------|---------|------|
| 4辺ポート | ✅ Handle position | ✅ | ✅ | ❌ v1で失敗 |
| スマートルーティング | ✅ smoothstep/bezier | △ プラグイン | ✅ orthogonal | ❌ v1で失敗 |
| カスタムノード | ✅ Svelte component | ✅ | ✅ | - |
| カスタムエッジ | ✅ Svelte component | △ | ✅ | - |
| ミニマップ | ✅ 組み込み | ❌ | ✅ | - |
| ズーム/パン | ✅ 組み込み | ✅ | ✅ | - |
| Undo/Redo | △ 自前実装 | ❌ | ✅ | - |
| ノード選択/複数選択 | ✅ 組み込み | ✅ | ✅ | - |
| Auto Layout | △ dagre/elkjs連携 | △ | ✅ | - |
| **ライセンス** | **MIT** | **MIT** | **MPL-2.0** | - |
| **Svelte対応** | **ネイティブ** | ❌ framework agnostic | ❌ Vanilla | - |

**選定: @xyflow/svelte**
- Svelteネイティブ、MIT、必要機能のカバー率最高
- Auto LayoutはElkjsを別途追加で対応

### レイアウトエンジン
| 必要機能 | elkjs | dagre | d3-hierarchy |
|---------|-------|-------|-------------|
| 階層レイアウト | ✅ | ✅ | ✅ |
| 直角折れ線ルーティング | ✅ | ❌ | ❌ |
| 多方向レイアウト（TB/LR） | ✅ | ✅ | △ |
| グループ/クラスタ | ✅ | △ | ❌ |
| **サイズ** | 500KB | 30KB | 10KB |

**選定: elkjs**
- スマートルーティング + グループ対応
- サイズはdefer loadで軽減

### UIコンポーネント
| 必要機能 | shadcn-svelte | Melt UI | Skeleton UI | 自前 |
|---------|-------------|---------|-------------|------|
| ダイアログ/モーダル | ✅ | ✅ | ✅ | 面倒 |
| ドロップダウン | ✅ | ✅ | ✅ | 面倒 |
| タブ | ✅ | ✅ | ✅ | 簡単 |
| トースト | ✅ | ❌ | ✅ | 簡単 |
| テーブル | ✅ | ❌ | ✅ | 面倒 |
| フォーム | ✅ | ✅ | ✅ | 面倒 |
| ダークテーマ | ✅ | ✅ | ✅ | - |
| Tailwind統合 | ✅ native | △ | ✅ | - |
| **カスタマイズ性** | **コピペ式（最高）** | ヘッドレス | テーマ式 | - |

**選定: shadcn-svelte (bits-ui ベース)**
- コピペ式 → 依存少ない、カスタマイズ自由
- Tailwind統合済み

### チャットUI
| 必要機能 | 自前Svelte | @chatscope | assistant-ui |
|---------|-----------|-----------|-------------|
| メッセージバブル | ✅ 簡単 | ✅ | ✅ |
| 入力欄 + 送信 | ✅ 簡単 | ✅ | ✅ |
| タイピングインジケータ | ✅ 簡単 | ✅ | ✅ |
| スクロール管理 | ✅ | ✅ | ✅ |
| マークダウン表示 | △ 別途 | ❌ | ✅ |
| **Svelte対応** | **ネイティブ** | **React** | **React** |
| **バンドルサイズ** | **最小** | 大 | 大 |

**選定: 自前Svelte**
- チャットUIは単純（バブル + 入力欄）
- React依存を入れたくない
- マークダウンは `marked` + `DOMPurify` で対応

### 状態管理
| 必要機能 | Svelte stores | nanostores | zustand |
|---------|-------------|-----------|---------|
| リアクティブ | ✅ native | ✅ | ✅ |
| Svelte統合 | ✅ native | ✅ | △ |
| Astro islands間共有 | △ | ✅ | △ |
| TypeScript | ✅ | ✅ | ✅ |
| 永続化 | △ 自前 | △ 自前 | △ |
| **学習コスト** | **ゼロ** | 低 | 低 |

**選定: Svelte stores（メイン）+ nanostores（Astro islands間共有用）**

### スタイリング
**選定: Tailwind CSS v4**
- shadcn-svelteとの統合
- ダークテーマ標準
- JIT、ユーティリティファースト

### データ永続化
| 必要機能 | localStorage | IndexedDB (idb) | Dexie.js |
|---------|-------------|-----------------|---------|
| 組織図保存 | ✅ 5MB制限 | ✅ 無制限 | ✅ |
| 複数組織図 | △ | ✅ | ✅ |
| バイナリデータ | ❌ | ✅ | ✅ |
| API | simple | 複雑 | ✅ 簡潔 |

**選定: Dexie.js**
- IndexedDBのラッパー、API簡潔
- 複数組織図の保存に対応
- 将来のオフライン対応にも有利

### グラフ/チャート（ダッシュボード統計）
**選定: uPlot**
- 軽量（~35KB）、高速
- 時系列グラフに最適
- Chart.js（200KB+）は重すぎる

---

## アーキテクチャ設計

### レイヤー構成
```
┌──────────────────────────────────────┐
│           Pages (Astro)              │  ← ルーティング、SSG
├──────────────────────────────────────┤
│     Components (Svelte)              │  ← UI、インタラクション
├──────────────────────────────────────┤
│        Stores (State)                │  ← リアクティブ状態管理
├──────────────────────────────────────┤
│       Services (Lib)                 │  ← ビジネスロジック、API通信
├──────────────────────────────────────┤
│     Persistence (Dexie)              │  ← データ永続化
└──────────────────────────────────────┘
```

### 依存関係ルール（v1の肥大化防止）
1. **Components → Stores**: OK（storeを$subscribeで参照）
2. **Components → Services**: ❌ 禁止（storeを経由する）
3. **Stores → Services**: OK（storeがserviceを呼ぶ）
4. **Services → Services**: OK（lib間の呼び出し）
5. **Pages → Components**: OK（Astro islandとして配置）
6. **下位 → 上位**: ❌ 絶対禁止

### ファイルサイズ制限（v1の二の舞防止）
- **1コンポーネント: 200行以下**（超えたら分割）
- **1 store: 150行以下**
- **1 service: 300行以下**
- 違反時はPRレビューで指摘

### Store設計
```typescript
// stores/org.ts — 組織データ
interface OrgStore {
  id: string;
  name: string;
  agents: Agent[];
  links: Link[];
  groups: Group[];
  taskType: 'independent' | 'sequential' | 'reciprocal';
  canvasMode: 'tree' | 'graph';
}

// stores/gateway.ts — Gateway接続
interface GatewayStore {
  connected: boolean;
  url: string;
  sessions: Session[];
  configHash: string;
}

// stores/chat.ts — チャット状態
interface ChatStore {
  activeAgentId: string | null;
  sessionKey: string | null;
  messages: ChatMessage[];
  polling: boolean;
}

// stores/ui.ts — UI状態
interface UIStore {
  sidePanel: 'edit' | 'chat' | 'timeline' | null;
  selectedNodeId: string | null;
  toasts: Toast[];
}
```

### Service設計
```typescript
// lib/gateway-client.ts
class GatewayClient {
  connect(url, token): Promise<void>
  disconnect(): void
  rpc(method, params): Promise<any>
  // 高レベルAPI
  getSessions(): Promise<Session[]>
  getConfig(): Promise<Config>
  sendChat(sessionKey, message): Promise<void>
  getChatHistory(sessionKey, limit): Promise<ChatMessage[]>
}

// lib/config-parser.ts
function openclawToOrg(config: OpenClawConfig): OrgData
function orgToOpenclaw(org: OrgData, existingConfig?: Config): OpenClawConfig

// lib/org-theory.ts
function suggestStructure(taskType): StructureSuggestion
function validateTree(agents, links): ValidationResult

// lib/persistence.ts (Dexie)
class OrgDatabase extends Dexie {
  orgs: Table<OrgRecord>;
  save(org): Promise<void>
  load(id): Promise<OrgRecord>
  list(): Promise<OrgRecord[]>
  delete(id): Promise<void>
}
```

---

## 最終選定サマリー（改訂: SvelteKit移行）

> 静的縛りを外し、SvelteKitフルスタックに移行。
> npm install && npm start でセルフホスト完結。

### M1 最小構成（必須）
| Layer | Library | License | Notes |
|-------|---------|---------|-------|
| Framework | **SvelteKit** | MIT | Astroから移行。SSR + API routes |
| Canvas | **@xyflow/svelte** | MIT | 4辺ポート、ルーティング、ミニマップ組み込み |
| Styling | **Tailwind CSS v4** | MIT | JIT、ダークテーマ |
| State | **Svelte stores** | MIT | built-in、追加不要 |
| DB | **better-sqlite3** | MIT | npm install完結、ファイルDB |

### 必要になったら追加
| Library | Trigger | License |
|---------|---------|---------|
| dagre | Auto Layout実装時 | MIT |
| shadcn-svelte | UI複雑化時 | MIT |
| marked + DOMPurify | チャットmarkdown表示時 | MIT |
| uPlot | ダッシュボードグラフ時 | MIT |
| elkjs | グループレイアウト時 | EPL-2.0 |

### デプロイ
```bash
npm install
npm run build
npm start        # → http://localhost:3000
```
データ: `~/.agentflow/data.db` (SQLite)

---

## v1との比較

| 観点 | v1 | v2 |
|------|-----|-----|
| キャンバス | Drawflow + pathfinding.js (自前) | @xyflow/svelte (組み込み) |
| ルーティング | 自前A* | elkjs (組み込み) |
| ポート | 自前4辺実装 | Handle position (組み込み) |
| ミニマップ | なし | 組み込み |
| Undo/Redo | なし | store history |
| ファイル構成 | 1ファイル4000行 | 50+ファイル各200行以下 |
| 状態管理 | グローバル変数 | typed stores |
| テスト | 不可能 | store/service単体テスト可能 |
| データ保存 | localStorage (1つ) | IndexedDB (複数組織図) |
