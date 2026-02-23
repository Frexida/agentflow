# ローカル開発環境

## 方法1: docker-compose（推奨）

```bash
cd v2
docker-compose up
```

- `http://localhost:3000` — AgentFlow UI
- `ws://localhost:8080` — OpenClaw Gateway

トークンは `local-dev-token` で統一。同期問題なし。

## 方法2: 手動起動

### Gateway

```bash
cd /tmp && mkdir -p agentflow-gw && cd agentflow-gw
npm init -y && npm install openclaw

cat > openclaw.json << 'EOF'
{
  "gateway": {
    "port": 8080,
    "auth": { "mode": "token", "token": "local-dev-token" },
    "controlUi": { "allowedOrigins": ["http://localhost:3000"] }
  },
  "agents": { "defaults": {}, "list": [] }
}
EOF

npx openclaw gateway start --foreground
```

### Next.js

```bash
cd v2
GATEWAY_INTERNAL_URL=ws://localhost:8080 \
GATEWAY_INTERNAL_TOKEN=local-dev-token \
npm run dev
```

## デプロイルール

1. **ローカルで動作確認してからプッシュ**
2. **mainへの直プッシュ禁止** → PR経由
3. **env変更が必要な場合はARCHITECTURE.mdを先に更新**

## 環境変数（ローカル用）

| Key | Value |
|-----|-------|
| `GATEWAY_INTERNAL_URL` | `ws://localhost:8080` |
| `GATEWAY_INTERNAL_TOKEN` | `local-dev-token` |
| `NEXT_PUBLIC_SUPABASE_URL` | (そのまま使える) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (そのまま使える) |

Supabase / Stripe は本番と共有でOK（ローカルDBは不要）。
