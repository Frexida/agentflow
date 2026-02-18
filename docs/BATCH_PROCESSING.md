# AgentFlow v2 バッチ処理設計書

## 1. バッチ処理一覧

| バッチID | 名称 | 実行タイミング | 説明 |
|----------|------|----------------|------|
| BATCH-001 | Session Polling | 10秒間隔 | セッション状態の更新 |
| BATCH-002 | Config Polling | 10秒間隔 | Config変更の検知 |
| BATCH-003 | Chat Polling | 5秒間隔 | チャット履歴の更新 |
| BATCH-004 | History Cleanup | 1日1回 | 古い履歴の削除 |
| BATCH-005 | Health Check | 60秒間隔 | Gateway接続確認 |

## 2. バッチ処理詳細

### 2.1 BATCH-001: Session Polling

**目的**: エージェントセッションの状態をリアルタイムで監視

**実行タイミング**: 10秒間隔

**処理フロー**:
```
1. Gateway API呼び出し (sessions.list)
2. レスポンスからセッション状態を抽出
3. 前回状態との差分を検出
4. UIの状態を更新 (Zustand store)
5. 変更があればパルスアニメーション発火
```

**入力**:
- Gateway URL
- Gateway Token

**出力**:
- sessions[] (セッション一覧)
- activeAgents[] (アクティブなエージェントID)

**エラー処理**:
- Gateway接続エラー → リトライ (最大3回)
- タイムアウト (10秒) → スキップして次回実行

**実装**:
```typescript
// lib/batch/sessionPolling.ts
export async function pollSessions(gatewayClient: GatewayClient) {
  const result = await gatewayClient.rpc('sessions.list', {
    kinds: ['main'],
    includeLastMessage: true
  });
  
  return result.sessions.map(s => ({
    agentId: s.agentId,
    status: getStatus(s.activeAt),
    lastMessage: s.lastMessages?.[0]
  }));
}

function getStatus(activeAt: string): 'active' | 'idle' | 'offline' {
  const diff = Date.now() - new Date(activeAt).getTime();
  if (diff < 60000) return 'active';   // 1分以内
  if (diff < 300000) return 'idle';    // 5分以内
  return 'offline';
}
```

### 2.2 BATCH-002: Config Polling

**目的**: OpenClaw configの変更を検知して組織図を自動更新

**実行タイミング**: 30秒間隔

**処理フロー**:
```
1. Gateway API呼び出し (config.get)
2. baseHashを前回値と比較
3. 変更あり → 組織図を再構築
4. 変更なし → スキップ
```

**入力**:
- Gateway URL
- Gateway Token
- 前回のbaseHash

**出力**:
- configChanged: boolean
- newConfig: OpenClawConfig (変更時のみ)
- newHash: string

**実装**:
```typescript
// lib/batch/configPolling.ts
let lastHash: string | null = null;

export async function pollConfig(gatewayClient: GatewayClient) {
  const result = await gatewayClient.rpc('config.get', {});
  
  if (result.baseHash === lastHash) {
    return { changed: false };
  }
  
  lastHash = result.baseHash;
  return {
    changed: true,
    config: result.config,
    hash: result.baseHash
  };
}
```

### 2.3 BATCH-003: Chat Polling

**目的**: 選択中エージェントのチャット履歴を更新

**実行タイミング**: 5秒間隔 (チャットパネル表示中のみ)

**処理フロー**:
```
1. 選択中のエージェントセッションを取得
2. Gateway API呼び出し (chat.history)
3. 最新メッセージのtimestampを前回値と比較
4. 新規メッセージあり → UIに追加
```

**入力**:
- sessionKey
- 前回の最新timestamp

**出力**:
- newMessages[] (新規メッセージ)

**実装**:
```typescript
// lib/batch/chatPolling.ts
export async function pollChat(
  gatewayClient: GatewayClient,
  sessionKey: string,
  lastTimestamp: string | null
) {
  const result = await gatewayClient.rpc('chat.history', {
    sessionKey,
    limit: 20
  });
  
  if (!lastTimestamp) {
    return result.messages;
  }
  
  return result.messages.filter(
    m => new Date(m.timestamp) > new Date(lastTimestamp)
  );
}
```

### 2.4 BATCH-004: History Cleanup

**目的**: 古いconfig履歴とチャット履歴を削除してストレージを節約

**実行タイミング**: 毎日 03:00 UTC

**処理フロー**:
```
1. config_history: 30日以上前のレコードを削除
2. chat_history: 7日以上前のレコードを削除
3. 削除件数をログ出力
```

**保持期間**:
| データ | 保持期間 |
|--------|----------|
| config_history | 30日 |
| chat_history | 7日 |

**実装**:
```typescript
// lib/batch/historyCleanup.ts
export async function cleanupHistory(db: Database) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const configDeleted = db.prepare(
    'DELETE FROM config_history WHERE created_at < ?'
  ).run(thirtyDaysAgo);
  
  const chatDeleted = db.prepare(
    'DELETE FROM chat_history WHERE timestamp < ?'
  ).run(sevenDaysAgo);
  
  return {
    configDeleted: configDeleted.changes,
    chatDeleted: chatDeleted.changes
  };
}
```

### 2.5 BATCH-005: Health Check

**目的**: Gateway接続の健全性を確認

**実行タイミング**: 60秒間隔

**処理フロー**:
```
1. Gateway API呼び出し (config.get) with timeout 5s
2. 成功 → status: 'connected'
3. 失敗 → status: 'disconnected', エラー詳細をログ
```

**出力**:
- status: 'connected' | 'disconnected'
- latency: number (ms)
- error?: string

**実装**:
```typescript
// lib/batch/healthCheck.ts
export async function checkHealth(gatewayClient: GatewayClient) {
  const start = Date.now();
  
  try {
    await gatewayClient.rpc('config.get', {}, { timeout: 5000 });
    return {
      status: 'connected',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'disconnected',
      latency: Date.now() - start,
      error: error.message
    };
  }
}
```

## 3. バッチ管理

### 3.1 スケジューラー

```typescript
// lib/batch/scheduler.ts
import { useEffect } from 'react';

export function useBatchScheduler() {
  useEffect(() => {
    const intervals = [
      setInterval(pollSessions, 10000),
      setInterval(pollConfig, 30000),
      setInterval(healthCheck, 60000)
    ];
    
    return () => intervals.forEach(clearInterval);
  }, []);
}
```

### 3.2 エラーハンドリング方針

| バッチ | エラー時の動作 |
|--------|----------------|
| Session Polling | 3回リトライ後スキップ |
| Config Polling | スキップ、次回実行 |
| Chat Polling | スキップ、次回実行 |
| History Cleanup | ログ出力、管理者通知 |
| Health Check | UI表示を'disconnected'に更新 |

## 4. 監視・ログ

### 4.1 ログ出力

```typescript
// 各バッチの実行ログ
console.log(`[BATCH-001] Session polling: ${sessions.length} sessions`);
console.log(`[BATCH-002] Config polling: changed=${changed}`);
console.log(`[BATCH-004] Cleanup: config=${configDeleted}, chat=${chatDeleted}`);
console.log(`[BATCH-005] Health: status=${status}, latency=${latency}ms`);
```

### 4.2 メトリクス

| メトリクス | 説明 |
|-----------|------|
| batch_execution_count | バッチ実行回数 |
| batch_execution_duration | バッチ実行時間 |
| batch_error_count | バッチエラー回数 |
| gateway_latency | Gateway応答時間 |
