# AgentFlow — Test Scenarios

Natural language test scenarios for AI-driven E2E testing.
These are read by test agents (e.g. red) — no Playwright code needed.

---

## 1. Landing Page

### 1.1 Page loads
- Go to `/`
- Expect: Hero section visible, "Try the Editor" button present

### 1.2 Demo entry
- Click "Try the Editor"
- Expect: Redirected to `/editor/demo`, canvas loads with 6 agents

---

## 2. Demo Editor

### 2.1 Canvas renders
- Go to `/editor/demo`
- Expect: 6 agent nodes visible (Coordinator, Planner, Developer, Researcher, Writer, Reviewer)
- Expect: 6 edges connecting them (red animated dashed lines)
- Expect: Demo mode banner at top
- Expect: Status bar shows "6 agents 6 edges"

### 2.2 Node interaction
- Double-click an agent node
- Expect: Edit modal opens with agent properties

### 2.3 Toolbar
- Expect: Add Agent, Undo, Redo, Save, Export, Versions buttons visible
- Click Save in demo mode
- Expect: Auth gate modal ("Sign in for full access")

### 2.4 ChatPanel (disconnected)
- Click 💬 button (bottom-right area)
- Expect: Chat panel slides in from right
- Expect: "Connect to Gateway first" message (no sessions listed)
- Click ✕ to close
- Expect: Panel closes

### 2.5 Command Palette
- Press Cmd+K (or Ctrl+K)
- Expect: Command palette opens

---

## 3. Authentication

### 3.1 Login flow
- Go to `/login`
- Expect: GitHub login button visible
- Click GitHub login
- Expect: Redirect to GitHub OAuth → back to `/dashboard`

### 3.2 Auth redirect
- Go to `/settings` while logged out
- Expect: Redirect to `/login`

---

## 4. Settings

### 4.1 Page structure
- Log in, go to `/settings`
- Expect: Gateway section (Cloud/Self-Host toggle, status)
- Expect: API Keys section (Anthropic, OpenAI fields)
- Expect: Plan & Billing section (Free/Pro/Team cards)
- Expect: Dashboard navigation link at bottom

### 4.2 PricingCards display
- On `/settings`
- Expect: Three pricing cards (Free $0, Pro $19, Team $49)
- Expect: Free card shows "Current Plan" button
- Expect: Pro card shows "Upgrade to Pro" button
- Expect: Team card shows "Upgrade to Team" button

### 4.3 Gateway connection
- On `/settings`, click Cloud (Automatic)
- Expect: Gateway status changes to "Connected 🟢"
- Expect: Region and WSS URL displayed

### 4.4 API Key save
- Enter an API key in Anthropic field, click Save
- Expect: "Key saved ✅" confirmation, key masked

---

## 5. Dashboard

### 5.1 Design list
- Log in, go to `/dashboard`
- Expect: List of saved designs (or empty state for new users)

### 5.2 Create new design
- Click create new design button
- Expect: Redirected to `/editor/[new-id]`

---

## 6. Editor (Authenticated)

### 6.1 Save design
- Open editor with a design, make changes
- Click Save
- Expect: Design saved successfully (no auth gate)

### 6.2 Export
- Click Export
- Expect: Export modal with OpenClaw YAML config

### 6.3 ChatPanel (connected)
- Ensure Gateway is connected (Settings → Cloud)
- Open editor, click 💬
- Expect: Chat panel opens with session list (or "No sessions found" if none active)
- If sessions exist: select one, send a message
- Expect: Message appears, agent response received

### 6.4 Version history
- Click Versions
- Expect: Version panel opens with save history

---

## 7. Billing

### 7.1 Stripe checkout
- On `/settings`, click "Upgrade to Pro"
- Expect: Redirect to Stripe Checkout page
- Expect: Correct price ($19/mo) displayed

---

## 8. Responsive / Edge Cases

### 8.1 Mobile viewport
- Resize to 375px width
- Expect: Layout adapts, sidebar collapses

### 8.2 Offline state
- Disconnect network
- Expect: Gateway shows "Disconnected", graceful error handling
