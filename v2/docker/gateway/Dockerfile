FROM node:22-slim

RUN apt-get update && apt-get install -y git openssl && rm -rf /var/lib/apt/lists/*

# Install openclaw globally
RUN npm install -g openclaw@latest

# Create workspace at /root (default HOME for Docker)
RUN mkdir -p /root/.openclaw/workspace
WORKDIR /root

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 18789

ENTRYPOINT ["/entrypoint.sh"]
