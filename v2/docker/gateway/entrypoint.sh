#!/bin/bash
set -e

CONFIG_DIR="${HOME}/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"

# Generate config if it doesn't exist
if [ ! -f "$CONFIG_FILE" ]; then
  TOKEN=${OPENCLAW_GATEWAY_TOKEN:-${OPENCLAW_TOKEN:-$(openssl rand -hex 24)}}
  
  cat > "$CONFIG_FILE" << EOF
{
  "gateway": {
    "token": "$TOKEN",
    "mode": "local",
    "bind": "lan",
    "port": 18789
  },
  "providers": {
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY:-}"
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY:-}"
    }
  },
  "agents": {}
}
EOF
  echo "Generated config with token: ${TOKEN:0:8}..."
fi

# Start gateway (explicit host/port to ensure 0.0.0.0 binding)
exec npx openclaw gateway start --foreground --host 0.0.0.0 --port 18789
