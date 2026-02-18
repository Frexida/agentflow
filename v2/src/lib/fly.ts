/**
 * Fly.io Machines API client for Gateway provisioning
 * Docs: https://fly.io/docs/machines/api/
 */

const FLY_API_URL = 'https://api.machines.dev/v1'
const FLY_APP = process.env.FLY_APP_NAME || 'agentflow-gateways'
const FLY_TOKEN = process.env.FLY_API_TOKEN

interface MachineConfig {
  userId: string
  anthropicKey?: string
  openaiKey?: string
  gatewayToken: string
  region?: string
}

interface Machine {
  id: string
  name: string
  state: string
  region: string
  instance_id: string
  private_ip: string
  created_at: string
}

async function flyRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  if (!FLY_TOKEN) throw new Error('FLY_API_TOKEN not set')
  
  const res = await fetch(`${FLY_API_URL}/apps/${FLY_APP}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${FLY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fly API error ${res.status}: ${text}`)
  }
  
  return res.json()
}

export async function createGateway(config: MachineConfig): Promise<Machine> {
  const machineName = `gw-${config.userId.substring(0, 8)}`
  
  const machine = await flyRequest('/machines', 'POST', {
    name: machineName,
    region: config.region || 'nrt', // Tokyo default
    config: {
      image: 'registry.fly.io/agentflow-gateways:deployment-01KHS9MG82YN7W6516RS3D3Y4Z',
      env: {
        OPENCLAW_GATEWAY_TOKEN: config.gatewayToken,
        OPENCLAW_TOKEN: config.gatewayToken, // entrypoint.sh reads this
        ANTHROPIC_API_KEY: config.anthropicKey || '',
        OPENAI_API_KEY: config.openaiKey || '',
      },
      guest: {
        cpu_kind: 'shared',
        cpus: 1,
        memory_mb: 256,
      },
      services: [
        {
          ports: [{ port: 443, handlers: ['tls', 'http'] }],
          protocol: 'tcp',
          internal_port: 18789,
        },
      ],
    },
  })
  
  return machine as Machine
}

export async function stopGateway(machineId: string): Promise<void> {
  await flyRequest(`/machines/${machineId}/stop`, 'POST')
}

export async function startGateway(machineId: string): Promise<void> {
  await flyRequest(`/machines/${machineId}/start`, 'POST')
}

export async function destroyGateway(machineId: string): Promise<void> {
  await flyRequest(`/machines/${machineId}?force=true`, 'DELETE')
}

export async function getGateway(machineId: string): Promise<Machine> {
  return await flyRequest(`/machines/${machineId}`, 'GET') as Machine
}

export async function listGateways(): Promise<Machine[]> {
  return await flyRequest('/machines', 'GET') as Machine[]
}

/**
 * Get the public WSS URL for a user's gateway
 */
export function getGatewayUrl(_machineName: string): string {
  return `wss://${FLY_APP}.fly.dev`
}
