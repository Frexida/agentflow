# AgentFlow SaaS 要件定義

## ビジネスモデル

OSS SaaS化モデル（Redmine → My Redmine / GitLab → GitLab.com パターン）

- **OSS版**: エディタ + ローカルExport（無料・セルフホスト）
- **SaaS版**: クラウド保存 + 独自機能 + (将来) クラウド実行

## 競合差別化

| | SimpleClaw ($25/mo) | AgentFlow |
|---|---|---|
| コンセプト | 簡単にOpenClawを動かせる | **組織を設計**して動かせる |
| 設計 | YAML手書き | GUIビジュアルエディタ |
| テンプレート | なし | 業種別テンプレート |
| モニタリング | ログ | リアルタイム可視化 |

## 独自機能

### 実装済み
- GUIでエージェント構造作成
- ワンクリックExport (YAML/JSON)
- Auto Layout
- グループ機能
- タスク特性ウィザード（Thompson 1967）
- バージョン履歴（config history）

### 要実装（SaaS向け）
- 認証（ユーザーアカウント）
- クラウド保存（設計をアカウントに紐付け）
- 課金ゲート（有料機能へのアクセス制御）
- チームコラボ（複数人で編集）
- クラウド実行（Gatewayホスティング）
- エージェント稼働統計

## 料金プラン案

| プラン | 価格 | 内容 |
|---|---|---|
| Free | $0 | エディタ + ローカルExport（現状と同じ） |
| Pro | $15-25/mo | クラウド保存 + バージョン履歴 + テンプレート |
| Team | $50+/mo | 複数Gateway + コラボ + 統計 |

## 技術スタック

| 層 | 選定 | 理由 |
|---|---|---|
| 認証 | Supabase Auth | 安い + DB付き |
| DB | Supabase PostgreSQL | 認証と統合 |
| 課金 | Stripe | デファクト |
| ホスティング | Fly.io | コンテナベース、低コスト |

## MVP フェーズ

### Phase 1: 認証 + クラウド保存
- Supabase Auth 統合
- 設計データのクラウド永続化
- Free tier（エディタ + ローカルExport は変わらず）

### Phase 2: 課金ゲート
- Stripe 統合
- Pro プラン（クラウド保存 + バージョン履歴）

### Phase 3: クラウド実行
- Fly.io でGatewayインスタンス起動
- ユーザーのAPI Key で LLM 呼び出し（従量課金転嫁）

## 法的考慮

- Claude Pro/Max、ChatGPT Plus → 二次利用 **NG**（Consumer Terms）
- Anthropic API / OpenAI API → 商用利用 **OK**（Commercial Terms）
- SaaSバックエンドでは API（従量課金）を使用する必要あり

## 収益構造

```
ユーザー → AgentFlow SaaS (月額課金)
               ↓
         AgentFlow Cloud → LLM API (従量課金、ユーザーに転嫁)
               or
         ユーザーの自前OpenClaw (AgentFlowはconfig出力のみ)
```
