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

# Find openclaw's dist/index.js
OPENCLAW_INDEX=$(node -e "console.log(require.resolve('openclaw/dist/index.js'))")

# Start gateway directly (no systemd needed)
exec node "$OPENCLAW_INDEX" gateway --port 18789
