#!/bin/bash
set -e

CONFIG_DIR="${HOME}/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"

# Generate config if it doesn't exist
if [ ! -f "$CONFIG_FILE" ]; then
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
    }
  }
}
EOF
  echo "Config generated. Token prefix: ${TOKEN:0:8}..."
fi

# Start gateway in foreground (run = foreground mode)
exec npx openclaw gateway run --bind lan --port 18789
