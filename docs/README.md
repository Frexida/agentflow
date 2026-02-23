# AgentFlow v3 設計ドキュメント

## 概要

AgentFlow v3 は「AIエージェント組織設計ツール」。
自社組織をdogfoodingとして設計・運用する。

## ドキュメント構成

| ファイル | 内容 |
|----------|------|
| [ORGANIZATION.md](./ORGANIZATION.md) | 組織図・役割定義 |
| [PERMISSIONS.md](./PERMISSIONS.md) | 権限設計（システム制御） |
| [GATES.md](./GATES.md) | Gate System（品質ゲート） |
| [API.md](./API.md) | API設計 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | システムアーキテクチャ |

## 設計原則

1. **プロンプトよりシステムで制御** — 権限はコードで強制
2. **Dogfooding** — 自社組織 = デモケース
3. **仕様書駆動** — 実装前に設計を固める

## v2からの教訓

| 問題 | v3での対策 |
|------|-----------|
| トークン4箇所同期 | Secret Manager機能 |
| 仕様なしで手戻り | 仕様書フェーズ必須 |
| 指揮系統曖昧 | 組織図 + CODEOWNERS |
| QAが後回し | Gate Systemでブロック |
