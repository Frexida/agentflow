#!/bin/sh
set -e

# Generate openclaw.json from environment
mkdir -p /root/.openclaw
cat > /root/.openclaw/openclaw.json <<EOF
{
  "version": 1,
  "gateway": {
    "auth": {
      "token": "${OPENCLAW_TOKEN}"
    },
    "host": "0.0.0.0",
    "port": 18789,
    "allowedOrigins": ["https://agentflow-l42k.vercel.app", "https://agentflow.dev"]
  },
  "providers": {
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}"
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}"
    }
  },
  "agents": []
}
EOF

# Find openclaw global install path and run gateway
OPENCLAW_BIN=$(which openclaw)
OPENCLAW_DIR=$(dirname $(dirname "$OPENCLAW_BIN"))
OPENCLAW_INDEX="$OPENCLAW_DIR/lib/node_modules/openclaw/dist/index.js"

exec node "$OPENCLAW_INDEX" gateway --port 18789
