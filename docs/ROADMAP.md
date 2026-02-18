# AgentFlow Roadmap

## Phase 1: Core Editor ✅
- Drag & drop agent nodes
- Connection types (Command/Communication/Review)
- Auto Layout (dagre, vertical hierarchy)
- Grid display + Factorio-style snap
- Orthogonal step-line routing
- Export to OpenClaw config
- Import from Gateway
- Apply to Gateway (merge strategy)
- Config version history + diff
- Groups
- Templates
- i18n (EN/JA)

## Phase 2: Polish & Adoption (Current)
- UI refinements (port centering, grid snap)
- Demo video (30s)
- English article (dev.to)
- OpenClaw community engagement
- First 5 users

## Phase 3: Organization Theory Features
### Direction & Structure Constraints
- Link direction toggle: unidirectional (→) / bidirectional (↔)
- Canvas structure mode: Tree / DAG / Graph
- Cycle detection + validation warnings
- Per-link `direction` property (independent of link type)

### Task-Driven Organization Wizard
Based on Thompson (1967) task interdependence model:
- **Pooled** (independent work) → Tree preset
- **Sequential** (A→B→C pipeline) → DAG preset  
- **Reciprocal** (tight collaboration) → Graph preset

User selects task characteristics → AgentFlow recommends structure constraints.
This captures the *intent* behind the organization, not just its shape.

Reference: Discord discussion 2026-02-18 (アライ研究員 research, 鬼畜 PM analysis)

### Deontic Specification (MOISE+)
- Obligations, permissions, prohibitions per role
- Prevents agent coordination issues (infinite loops, ambiguous authority)

## Phase 4: Advanced
- Chapter/Guild横断タグ (Spotify Model)
- Real-time agent status monitoring
- SaaS relay (outbound WebSocket from Gateway)
