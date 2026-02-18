#!/bin/bash
set -e

CONFIG_DIR="${HOME}/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"

# Always regenerate config to pick up latest changes
if true; then
  TOKEN=${OPENCLAW_GATEWAY_TOKEN:-${OPENCLAW_TOKEN:-$(openssl rand -hex 24)}}
  
  cat > "$CONFIG_FILE" << EOF
{
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  },
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "port": 18789,
    "auth": {
      "token": "$TOKEN"
    },
    "controlUi": {
      "allowedOrigins": ["*"]
    },
    "trustedProxies": ["172.16.0.0/12", "10.0.0.0/8"]
  }
}
EOF
  echo "Config generated. Token prefix: ${TOKEN:0:8}..."
fi

# Start gateway in foreground (run = foreground mode)
exec npx openclaw gateway run --bind lan --port 18789
