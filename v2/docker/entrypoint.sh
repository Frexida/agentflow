#!/bin/bash
set -e

# Support both OPENCLAW_GATEWAY_TOKEN and OPENCLAW_TOKEN
GW_TOKEN="${OPENCLAW_GATEWAY_TOKEN:-${OPENCLAW_TOKEN:-}}"

# Generate openclaw.json from environment
mkdir -p /root/.openclaw
cat > /root/.openclaw/openclaw.json <<EOF
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "lan",
    "controlUi": {
      "allowedOrigins": ["https://agentflow.frexida.com", "https://agentflow-l42k.vercel.app", "http://localhost:3000", "http://localhost:3001"]
    },
    "trustedProxies": ["172.16.0.0/12", "10.0.0.0/8"],
    "auth": {
      "mode": "token",
      "token": "${GW_TOKEN}"
    }
  },
  "auth": {
    "profiles": {
      "anthropic:default": {
        "provider": "anthropic",
        "mode": "api_key"
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514"
      }
    },
    "list": [
      {
        "id": "assistant",
        "name": "Assistant",
        "workspace": "/root/.openclaw/workspace",
        "identity": {
          "name": "Assistant",
          "avatar": "🤖"
        }
      }
    ]
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  }
}
EOF

echo "Config generated with assistant agent. Token prefix: ${GW_TOKEN:0:8}..."
echo "Listening on 0.0.0.0:18789"

# Find openclaw global install path and run gateway
OPENCLAW_BIN=$(which openclaw)
OPENCLAW_DIR=$(dirname $(dirname "$OPENCLAW_BIN"))
OPENCLAW_INDEX="$OPENCLAW_DIR/lib/node_modules/openclaw/dist/index.js"

exec node "$OPENCLAW_INDEX" gateway --port 18789 --allow-unconfigured
