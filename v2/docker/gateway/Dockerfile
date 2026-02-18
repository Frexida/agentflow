FROM node:22-slim

# Install openclaw globally
RUN npm install -g openclaw@latest

# Create workspace
RUN mkdir -p /home/openclaw/.openclaw/workspace
WORKDIR /home/openclaw

# Environment variables (injected at runtime)
# OPENCLAW_TOKEN - gateway auth token
# ANTHROPIC_API_KEY - LLM provider key
# OPENAI_API_KEY - optional

# Generate default config if not mounted
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 18789

ENTRYPOINT ["/entrypoint.sh"]
