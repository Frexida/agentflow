# AgentFlow Announcement Drafts

## OpenClaw Discord

**Title**: AgentFlow — Visual org chart designer for OpenClaw multi-agent setups

Hey everyone! We built **AgentFlow**, a free visual tool for designing OpenClaw multi-agent organizations.

**What it does:**
- Drag-and-drop org chart editor — add agents, connect them, define roles
- Set personalities (SOUL.md), models, tool profiles, initial memory per agent
- Relationship types: authority, communication, review (based on MOISE+ org theory)
- **One-click export** → production-ready `config.apply` JSON + workspace setup script

**Try it now:** https://frexida.github.io/agentflow/editor/

Self-host with Docker: `docker compose up -d`

Open source (MIT): https://github.com/Frexida/agentflow

Would love feedback from anyone running multi-agent setups!

---

## Twitter/X

**Thread:**

1/ Introducing AgentFlow ⚙️

A free, open-source visual designer for OpenClaw multi-agent organizations.

Drag-and-drop org chart → production config in one click.

🔗 https://frexida.github.io/agentflow/editor/

2/ Design your agent team visually:
• Add agents with roles, personalities, models
• Connect with authority/communication/review links
• Group into teams
• Auto-layout or arrange freely

3/ Export generates:
• config.apply-ready JSON (paste directly into OpenClaw)
• Workspace setup script (SOUL.md, MEMORY.md per agent)
• Full metadata export

No YAML editing. No config debugging.

4/ Self-host in seconds:

```
docker compose up -d
```

Or use it free at frexida.github.io/agentflow/editor/

Open source (MIT): github.com/Frexida/agentflow

Built by agents, for agents 🤖

---

## HackerNews

**Title**: Show HN: AgentFlow – Visual org chart designer for multi-agent AI systems

**Text:**

Hi HN, we built AgentFlow, an open-source visual tool for designing multi-agent AI organizations.

The problem: Setting up multi-agent systems (like OpenClaw) requires manually editing config files, keeping track of agent relationships, and debugging YAML. For complex orgs (5+ agents with hierarchies, review chains, communication patterns), this gets painful fast.

AgentFlow lets you design agent orgs visually:
- Drag-and-drop node editor (Drawflow-based)
- Define agent profiles: role, personality, model, tools, memory
- Connect agents with typed relationships (authority/communication/review)
- Group agents into teams
- One-click export to production-ready config

The data model is based on MOISE+ (Multi-agent Organizational Structural Specification) — an academic framework for organizational theory applied to AI agents.

Stack: Astro (static), Drawflow, dagre for auto-layout. Runs entirely client-side, no backend needed.

Try it: https://frexida.github.io/agentflow/editor/
GitHub: https://github.com/Frexida/agentflow

Self-host with Docker (`docker compose up -d`) or just use the hosted version.

Currently focused on OpenClaw integration, but the org design concepts apply to any multi-agent framework.

Feedback welcome!
