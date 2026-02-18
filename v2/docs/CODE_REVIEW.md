# Code Review — 運用・保守性観点

## レビュー日: 2026-02-18

### ✅ 修正済み

| 問題 | 重要度 | 対応 |
|---|---|---|
| API JSON parse未catchで500 | 高 | try/catch + 400レスポンス追加 |
| UUID未バリデーション | 中 | 正規表現バリデーション追加 |
| Gateway client JSON-RPC形式 | 致命的 | プロトコルv3に完全リライト |
| `config.apply`の不正パラメータ | 高 | `reason`パラメータ削除 |
| session key mapping | 高 | `key`→`sessionKey`マッピング追加 |

### ⚠️ 既知の制約

| 項目 | 状態 | 対策 |
|---|---|---|
| ローカルSQLiteはVercelで動かない | 既知 | クラウド保存(Supabase)をprimary、ローカルはdev用 |
| service_role keyがサーバーサイドのみ | OK | `.env.local`に`NEXT_PUBLIC_`なしで格納 |
| RLS依存のセキュリティ | OK | Supabase RLS + middleware認証の二重防御 |
| GitHub OAuth未設定時 | 警告 | Email/Password loginでfallback可 |

### 📐 アーキテクチャ

```
認証フロー:
  Browser → middleware (セッション検証) → API Route → Supabase (RLS)

保存フロー:
  Editor Save → PUT /api/designs/[id] → Supabase designs table
  Dashboard → GET /api/designs → Supabase (user_id filtered)

Gateway連携:
  Browser → WebSocket → connect.challenge → connect auth → req/res frames
```

### テストカバレッジ

| テスト種別 | 件数 | 状態 |
|---|---|---|
| Unit (vitest) | 8 | ✅ |
| E2E (Playwright) | 13 | ✅ (鬼畜実行) |
| Gateway統合テスト | 6 API | ✅ (手動検証済み) |

### 改善提案（将来）

1. **Rate limiting** — API routesにrate limit追加（Vercel Edge Config or upstash/ratelimit）
2. **Input sanitization** — design nameのXSS対策（現在はReactがエスケープ）
3. **Pagination** — designs一覧にページネーション（100+デザイン時）
4. **Error boundary** — エディタページにReact Error Boundary追加
5. **Monitoring** — Sentry or Vercel Analytics連携
6. **DB migration tool** — Supabase CLIでマイグレーション管理
