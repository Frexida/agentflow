# AgentFlow — Feature List

## Pages

### Landing Page (`/`)
- Hero section with product description
- "Try the Editor" button → `/editor/demo`
- Navigation to Login/Signup

### Login (`/login`)
- GitHub OAuth login via Supabase Auth
- Redirect to `/dashboard` on success

### Signup (`/signup`)
- GitHub OAuth signup via Supabase Auth

### Dashboard (`/dashboard`)
- List of saved designs
- Create new design
- Open existing design → `/editor/[id]`
- Requires authentication

### Editor (`/editor/[id]`)
- **Canvas** — React Flow based agent organization editor
  - Agent nodes (drag, resize, reposition)
  - Edge connections between agents (animated dashed lines)
  - Background grid (dots)
  - MiniMap (bottom-right)
  - Controls (zoom in/out/fit)
- **Agent Nodes** — Display: name, role, icon, status (active/idle/offline), model
  - Double-click → NodeEditModal (edit agent properties)
  - Right-click → Context menu (delete, duplicate, etc.)
- **Toolbar** — Add Agent, Undo, Redo, Save, Export, Versions
- **Save** — Persists design to Supabase (requires auth)
- **Export** — Export design as OpenClaw config (YAML)
- **Versions** — Version history panel (save/restore snapshots)
- **Command Palette** — Keyboard shortcut (Cmd+K) for quick actions
- **Onboarding** — 4-step Quick Start tooltip for new users
- **Auth Gate** — Modal prompting login when unauthenticated user tries save/export
- **Demo Mode** (`/editor/demo` or `/editor/new`)
  - Pre-loaded with 6 demo agents (Coordinator, Planner, Developer, Researcher, Writer, Reviewer)
  - 6 edges connecting them
  - Banner: "Demo mode — designs won't be saved"
  - Sign in link for full access
- **ChatPanel** — Floating 💬 button (bottom-right)
  - Always visible (dimmed when Gateway disconnected)
  - Click → slides in from right
  - Session selector (1:1 or Group mode)
  - Single agent chat (assistant-ui powered)
  - Multi-agent chat (Discord-style with agent avatars/colors)
  - "Connect to Gateway first" message when disconnected
- **Status Bar** — Bottom: connection status, agent count, edge count, zoom level
- **Side Panel** — Node editing panel
- **Keyboard Shortcuts** — Undo (Cmd+Z), Redo (Cmd+Shift+Z), Delete (Backspace/Delete)

### Settings (`/settings`)
- **Gateway Section**
  - Cloud (Automatic) / Self-Host toggle
  - Status, Region, URL display
  - Connected/Disconnected indicator
  - Connect/Destroy buttons
- **API Keys Section**
  - Anthropic API Key (save/remove, masked display)
  - OpenAI API Key (optional, save)
  - "Bring Your Own Key" info
- **Plan & Billing Section** (PricingCards)
  - Free ($0/mo) — 3 designs, local save, demo mode
  - Pro ($19/mo) — Unlimited designs, cloud save, gateway hosting, priority support
  - Team ($49/mo) — Everything in Pro, 5 team members, 3 gateway instances, shared designs, team management
  - Current plan indicator
  - Upgrade buttons → Stripe Checkout
- **Navigation** — Back to Dashboard link

### Privacy Policy (`/privacy`)
- Static legal page

### Terms of Service (`/terms`)
- Static legal page

## API Routes

### `GET /api/billing`
- Returns current user's subscription plan
- Requires auth

### `POST /api/checkout`
- Creates Stripe Checkout session
- Requires auth + priceId

### `POST /api/webhook`
- Stripe webhook handler
- Updates subscription status in Supabase

### `GET/POST /api/designs`
- CRUD for saved designs
- Requires auth

### `GET/POST /api/designs/[id]`
- Single design CRUD
- Requires auth

### `GET/POST /api/gateway`
- Gateway provisioning (Fly.io)
- Requires auth

### `GET/POST /api/keys`
- API key storage (encrypted)
- Requires auth

### `GET/POST /api/orgs`
- Organization management
- Requires auth

## Stores (Client State)

- **org** — Nodes, edges, canvas state (React Flow)
- **gateway** — WebSocket connection, sessions list, connection status
- **chat** — Active session/channel, messages, chat mode (single/multi)
- **sessions** — Session management

## Infrastructure

- **Frontend:** Next.js 16, Turbopack, Vercel
- **Auth:** Supabase (GitHub OAuth)
- **Database:** Supabase (PostgreSQL)
- **Gateway:** Fly.io (WebSocket relay)
- **Payments:** Stripe (Checkout, Webhooks)
- **Domain:** agentflow.frexida.com
