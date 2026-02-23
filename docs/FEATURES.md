# 機能要件 — AgentFlow v3

## OpenClawマルチエージェント機能の不足点 → v3で解決

| 不足点 | 現状 | AgentFlow v3で解決 |
|--------|------|-------------------|
| **会話フロー可視化** | ログのみ | リアルタイムフローチャート |
| **組織図エディタ** | JSON手書き | GUIで視覚的に設計 |
| **権限設計UI** | 設定ファイル | ドラッグ&ドロップで割り当て |
| **エージェント間通信の追跡** | なし | 誰→誰のメッセージ履歴 |
| **タスク進捗ダッシュボード** | なし | カンバン/ガント表示 |
| **Gate System UI** | なし | 承認待ち一覧、承認ボタン |
| **Secret Manager** | 手動同期 | 1箇所で管理→自動配布 |
| **Environment View** | なし | どこで何が動いてるか可視化 |

---

## v3 コア機能（優先度: 高）

### 1. 組織図エディタ
- ノード追加/削除/編集
- 接続線（レポートライン）
- グループ化
- Config Export (OpenClaw YAML)

### 2. 会話フロー可視化
- リアルタイムでエージェント間メッセージを表示
- フローチャート形式
- 時系列タイムライン

### 3. 権限設計UI
- Trust Level設定（High/Medium/Low）
- Role Type選択（Secretary/Developer/Sandbox）
- Capability割り当て（Browser/CLI/環境変更）

---

## v3 拡張機能（優先度: 中）

### 4. Gate System UI
- 承認待ちタスク一覧
- OK/NGボタン
- エスカレーション履歴

### 5. タスク進捗ダッシュボード
- カンバンビュー
- ガントチャート
- エージェント別稼働状況

### 6. Environment View
- マシン構成の可視化
- Gateway接続状態
- エージェント配置図

---

## v3 将来機能（優先度: 低）

### 7. Secret Manager
- 暗号化ストレージ
- 自動プロビジョニング
- 監査ログ

### 8. Multi-Gateway対応
- 複数Gatewayの統合ビュー
- 分散環境のSecret同期

---

## 機能 → 画面マッピング

| 機能 | 画面 |
|------|------|
| 組織図エディタ | `/editor/[id]` |
| 会話フロー可視化 | `/monitor/[id]` |
| 権限設計UI | `/editor/[id]` (サイドパネル) |
| Gate System UI | `/gates` |
| タスク進捗 | `/dashboard` |
| Environment View | `/environments` |
| Secret Manager | `/settings/secrets` |
