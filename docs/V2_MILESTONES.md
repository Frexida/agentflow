# AgentFlow v2 マイルストーン

## M1: 基盤構築（3日）
**Goal:** Svelte Flow + Astroで基本エディタが動く
- [ ] v2ブランチ作成
- [ ] Astro Svelteインテグレーション設定
- [ ] Svelte Flow導入 + カスタムAgentノード
- [ ] カスタムエッジ（authority/comm/review × 方向）
- [ ] ノード追加/削除/編集
- [ ] ミニマップ + ズームコントロール
- [ ] Auto Layout (dagre or elkjs)
**完了基準:** v1と同等のキャンバス操作ができる

## M2: Gateway連携（2日）
**Goal:** Gateway接続 + チャット + config同期
- [ ] Gateway WebSocket接続（gateway-client.ts）
- [ ] Config Import/Export
- [ ] Config自動更新（baseHashポーリング）
- [ ] チャットパネル（chat.send / chat.history）
- [ ] セッションステータス表示
**完了基準:** v1のGateway機能が全て動く

## M3: ダッシュボード（3日）
**Goal:** 組織管理画面
- [ ] /dashboard ページ作成
- [ ] サイドバーナビゲーション（Dashboard / Editor / Settings）
- [ ] 組織一覧（保存/読み込み/削除）
- [ ] 統計バー（Active Agents / Total Tokens / Cost / Sessions）
- [ ] エージェント一覧テーブル（名前、モデル、ステータス、トークン使用量）
**完了基準:** n8nのOverviewに相当する画面がある

## M4: 設定・認証（1日）
**Goal:** 設定画面
- [ ] /settings ページ作成
- [ ] Gateway接続設定（URL、トークン）
- [ ] 接続テスト
- [ ] テーマ設定
**完了基準:** 設定がUIから管理できる

## M5: 磨き込み + 移行（2日）
**Goal:** v1→v2移行完了
- [ ] タスク特性ウィザード移植
- [ ] テンプレート移植
- [ ] グループ機能移植
- [ ] タイムラインパネル移植
- [ ] v1との機能パリティ確認
- [ ] v1 editor.astro削除
- [ ] mainにマージ
**完了基準:** v1の全機能がv2で動く

---

## タイムライン
```
Week 1: M1 (3日) + M2 (2日)
Week 2: M3 (3日) + M4 (1日) + M5 (2日)
```

## リスク
- Svelte Flowの学習コスト
- v1機能の移植漏れ
- Astro + Svelteのビルド設定問題
