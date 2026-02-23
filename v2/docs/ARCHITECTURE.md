# AgentFlow Architecture

## Infrastructure Overview

```
Browser (React + Zustand)
  │
  ├── JWT in Authorization header
  ▼
Vercel Serverless (/api/gateway/proxy)
  │  ├── POST: send frame to Gateway
  │  └── GET:  SSE stream from Gateway
  │
  ├── Supabase JWT verify
  ▼
Fly.io (nrt region) — OpenClaw Gateway
  │  └── WebSocket server
  │  └── 6 agents, 6 edges
  │
  └── Validates token from:
       - machine env: OPENCLAW_TOKEN
       - openclaw.json: gateway.auth.token
```

## Token Flow

```
Browser → (Supabase JWT) → Vercel → (GATEWAY_INTERNAL_TOKEN) → Fly.io Gateway
```

### Token Locations

| Location | Variable | Purpose |
|----------|----------|---------|
| Vercel ENV | `GATEWAY_INTERNAL_TOKEN` | Proxy → Gateway auth |
| Vercel ENV | `GATEWAY_INTERNAL_URL` | Gateway WebSocket URL |
| Fly.io machine env | `OPENCLAW_TOKEN` | Gateway reads on startup |
| Fly.io openclaw.json | `gateway.auth.token` | Gateway config file |

**⚠️ These must all match.** Token mismatch = `unauthorized: gateway token mismatch`.

### Token Sync Strategy

1. **Source of truth:** Fixed token set manually
2. **Vercel:** `GATEWAY_INTERNAL_TOKEN` env var (requires redeploy after change)
3. **Fly.io:** Set via `fly machine update` entrypoint override (writes openclaw.json on boot)
4. **DB:** `gateways.gateway_token` — NOT used by proxy architecture (legacy)

## Environment Variables

### Vercel (Production)

| Key | Description |
|-----|-------------|
| `GATEWAY_INTERNAL_TOKEN` | Token for Gateway WS auth |
| `GATEWAY_INTERNAL_URL` | `wss://agentflow-gateways.fly.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side) |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Fly.io (`agentflow-gateways`)

| Key | Description |
|-----|-------------|
| `OPENCLAW_TOKEN` | Gateway auth token (machine env, NOT secrets) |

**⚠️ Never use `fly secrets set` for tokens — secrets override machine env and persist across deploys.**

## Services

| Service | Provider | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://agentflow.frexida.com` |
| Gateway | Fly.io | `https://agentflow-gateways.fly.dev` |
| Database | Supabase | (project URL) |
| Payments | Stripe | (dashboard) |
| DNS | Cloudflare | `frexida.com` |

## Key Constraints

- **Vercel serverless:** No persistent WebSocket connections; each POST creates fresh WS
- **Vercel env changes require redeploy** (empty commit or Redeploy button)
- **Fly.io writable layer resets on restart** — config changes need Docker rebuild or entrypoint override
- **Gateway `client.id` must be `'webchat-ui'`** — unknown IDs are rejected
- **Gateway `lastMessage.content` can be array** (Anthropic content blocks) — always type-check
