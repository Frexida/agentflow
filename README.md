<div align="center">

# 🔀 AgentFlow

**Visual agent organization designer — Org chart editor → OpenClaw config export**

エージェント組織設計ツール — 組織図エディタ → OpenClaw config エクスポート

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Now-blue?style=for-the-badge)](https://frexida.github.io/agentflow/editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=for-the-badge&logo=github)](https://frexida.github.io/agentflow/)

</div>

---

## Why AgentFlow?

OpenClaw lets you run multi-agent teams — but designing them means hand-editing YAML/JSON configs. AgentFlow gives you a **visual drag-and-drop editor** to design your agent org, then exports a ready-to-use OpenClaw config.

- 🎨 **Design visually** — Drag nodes, draw connections, see your org chart in real time
- ⚡ **Export instantly** — One click to generate OpenClaw-compatible config JSON + setup scripts
- 🚀 **Zero setup** — Works in the browser. No backend, no accounts, no install required
- 🏠 **Self-hostable** — Docker one-liner or static build for your own infra

> **No OpenClaw GUI for multi-agent design exists yet.** AgentFlow fills that gap.

---

## Quick Start

### Option A: Use it now (no install)

👉 **https://frexida.github.io/agentflow/editor/**

Data stays in your browser (localStorage). Nothing is sent to any server.

### Option B: Docker (self-hosted)

```bash
git clone https://github.com/Frexida/agentflow.git
cd agentflow
docker compose up -d
```

→ Open http://localhost:3000/editor/

### Option C: Local build

```bash
git clone https://github.com/Frexida/agentflow.git
cd agentflow
npm install
SITE_URL=http://localhost:4321 BASE_PATH=/ npm run build
```

Serve `dist/` with any web server, or `npm run dev` for development.

---

## Features

### 🖼️ Visual Org Chart Editor

- **Drag & drop** nodes to arrange your agent hierarchy
- **Auto-layout** with dagre for clean org charts
- **Connection types** — authority (🔴), communication (🔵), review (🟡)
- Click links to toggle type, double-click for detailed editing

### 🤖 Agent Configuration

Double-click any node to configure:

| Setting | Description |
|---------|-------------|
| Icon | Emoji identifier |
| Name & Role | Agent identity |
| Personality | Maps to `SOUL.md` |
| Model | Claude, GPT, Gemini, etc. |
| System Prompt | Core instructions |
| Tool Profile | minimal / coding / messaging / full |
| Initial Memory | Maps to `MEMORY.md` |

### 📁 Group Management

Organize agents into teams/departments with nested group support.

### 📤 One-Click Export

Generates 3 files:

1. **OpenClaw config JSON** — Drop into `config.apply` directly
2. **Full export JSON** — Config + metadata + workspace files
3. **Setup script** — Shell script to create agent workspaces

### ✅ Built-in Validation

Catches errors before export:
- ❌ No agents, duplicate names, unnamed agents
- ⚠️ Missing roles, empty prompts, disconnected nodes

### 💾 Auto-Save

Saves to localStorage every 5 seconds. Manual save button available.

---

## Self-Hosting

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | `https://frexida.github.io` | Your site URL |
| `BASE_PATH` | `/agentflow` | Base path (`/` for root) |

### Reverse Proxy

Set `SITE_URL` to your actual domain when building behind nginx/Caddy.

---

## Architecture

| Layer | Tech |
|-------|------|
| Framework | [Astro](https://astro.build/) (static output) |
| Editor | [Drawflow](https://github.com/jerosoler/Drawflow) |
| Layout | [dagre](https://github.com/dagrejs/dagre) |
| Data Model | MOISE+ Structural Specification (v1) |

Key source files:
- `src/pages/editor.astro` — Main editor UI
- `src/lib/types.ts` — Agent/Link/Group/Organization types
- `src/lib/export-openclaw.ts` — Organization → OpenClaw config

---

## Contributing

Issues and PRs welcome. See [Issues](https://github.com/Frexida/agentflow/issues) for current tasks.

---

## License

MIT
