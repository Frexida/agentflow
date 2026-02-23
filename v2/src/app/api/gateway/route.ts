import { NextResponse } from 'next/server'

// Self-hosted mode: cloud gateway provisioning not available
// Use OpenClaw Gateway running locally via GATEWAY_INTERNAL_URL env var
const stub = () => NextResponse.json({ error: 'Cloud gateway provisioning not available in self-hosted mode' }, { status: 501 })
export { stub as GET, stub as POST, stub as DELETE }
