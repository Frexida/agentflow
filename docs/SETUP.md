# AgentFlow セットアップガイド

## 前提条件

- Node.js 18+
- npm or pnpm
- Supabase アカウント
- Vercel アカウント
- GitHub アカウント

## 1. ローカル開発環境

```bash
# リポジトリをクローン
git clone https://github.com/Frexida/agentflow.git
cd agentflow/v2

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
```

## 2. Supabase プロジェクト作成

1. https://supabase.com にアクセス
2. **Start your project** → GitHubでログイン
3. **New project** クリック
4. 以下を入力：
   - **Organization**: 任意（例: `Frexida`）
   - **Project name**: `agentflow`
   - **Database Password**: 強いパスワード（メモ必須）
   - **Region**: `Northeast Asia (Tokyo)`
5. **Create new project** → 約2分待つ

## 3. Supabase キー取得

1. Supabase Dashboard → **Settings** → **API**
2. 以下をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...`（⚠️ 秘密）

## 4. 環境変数設定

### ローカル開発用

`v2/.env.local` を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Vercel デプロイ用

1. Vercel Dashboard → プロジェクト → **Settings** → **Environment Variables**
2. 以下を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 5. GitHub OAuth 設定

### GitHub OAuth App 作成

1. https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. 入力：
   - **Application name**: `AgentFlow`
   - **Homepage URL**: `https://agentflow-l42k.vercel.app`
   - **Authorization callback URL**: `https://xxxxx.supabase.co/auth/v1/callback`
3. **Register application**
4. **Client ID** をコピー
5. **Generate a new client secret** → **Client Secret** をコピー

### Supabase に設定

1. Supabase Dashboard → **Authentication** → **Sign In / Providers**
2. **GitHub** を有効化
3. **Client ID** と **Client Secret** を貼り付け
4. **Save**

### Site URL 設定

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://agentflow-l42k.vercel.app`
3. **Save**

## 6. Vercel デプロイ

1. https://vercel.com → **New Project**
2. GitHub リポジトリをインポート
3. **Root Directory**: `v2`
4. **Framework Preset**: Next.js
5. 環境変数を追加（上記参照）
6. **Deploy**

## 7. 動作確認

- https://agentflow-l42k.vercel.app/login にアクセス
- GitHub ログインを試す
- ダッシュボードにリダイレクトされれば成功

## トラブルシューティング

### GitHub OAuth エラー

- **callback URL** が正しいか確認
- Supabase の **Site URL** が正しいか確認

### 環境変数エラー

- Vercel で環境変数が設定されているか確認
- 再デプロイが必要な場合あり

---

*Last updated: 2026-02-18*
