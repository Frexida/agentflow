---
title: I built a visual org chart editor for OpenClaw multi-agent systems
published: false
description: Design your AI agent team visually, export OpenClaw config in one click
tags: openclaw, ai, opensource, webdev
cover_image: https://raw.githubusercontent.com/Frexida/agentflow/main/docs/screenshots/editor-demo.png
---

## The problem: 5 agents, zero visibility

I was running a multi-agent setup on OpenClaw — a PM agent, a dev agent, a researcher, a critic, and myself as the human owner. Five agents, all talking to each other through different channels.

Within a day, I had no idea who was reporting to whom. The PM was supposed to manage the dev, but the critic was giving direct orders. The researcher was duplicating work the dev had already done. Config files were a mess of JSON with agent IDs pointing everywhere.

**Sound familiar?**

If you've tried running more than 2-3 agents on OpenClaw, you've probably hit the same wall: there's no way to *see* your organization. You're editing raw config and hoping the relationships make sense.

## What I wanted

Something dead simple:

- **See** all my agents and their relationships in one view
- **Drag and drop** to reorganize the hierarchy
- **Click** to define who reports to whom, who reviews whom
- **Export** a working OpenClaw config — not some abstract diagram, but actual `config.apply`-ready JSON

Basically: an org chart editor that speaks OpenClaw.

## So I built AgentFlow

![AgentFlow Editor](https://raw.githubusercontent.com/Frexida/agentflow/main/docs/screenshots/editor-demo.png)

**AgentFlow** is a browser-based visual editor for designing OpenClaw multi-agent organizations. No backend, no accounts — it runs entirely in your browser.

### What it does

**Design your org visually:**
- Add agents with one click
- Drag to arrange your hierarchy
- Connect nodes to define relationships

**Three relationship types:**
- 🔴 **Authority** (solid line) — command chain, who manages whom
- 🔵 **Communication** (dashed line) — information flow between peers
- 🟡 **Review** (dotted line) — who reviews whose work

**Configure each agent:**
- Name, role, personality (→ `SOUL.md`)
- Model selection (Claude, GPT, Gemini)
- Tool profile (minimal / coding / messaging / full)
- Initial memory (→ `MEMORY.md`)

**Export to OpenClaw:**
One click generates:
- `config.json` — ready for `openclaw config apply`
- `setup.sh` — creates agent workspace directories with SOUL.md and MEMORY.md
- Full export JSON with metadata

### Org templates

Don't want to start from scratch? Pick a template:
- 🚀 **Startup** — CEO → PM → Dev×2
- 🏢 **Hierarchy** — Director → Managers → Team members
- 🤝 **Flat** — Lead + peers, everyone communicates equally

## Try it

**Live demo (no install):** [frexida.github.io/agentflow/editor/](https://frexida.github.io/agentflow/editor/)

**Self-host with Docker:**
```bash
git clone https://github.com/Frexida/agentflow.git
cd agentflow
docker compose up -d
```

**GitHub:** [github.com/Frexida/agentflow](https://github.com/Frexida/agentflow)

## What's next

This is early — I'm looking for feedback from people who actually run multi-agent setups on OpenClaw. What's missing? What would make this useful for your workflow?

If AgentFlow looks interesting, ⭐ the repo and drop an issue with your thoughts. Every bit of feedback shapes what gets built next.

---

*AgentFlow is MIT licensed and 100% open source. Built with Astro, Drawflow, and dagre.*
