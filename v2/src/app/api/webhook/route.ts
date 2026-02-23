import { NextResponse } from 'next/server'
// Self-hosted mode: webhooks not available
const stub = () => NextResponse.json({ error: 'Not available in self-hosted mode' }, { status: 501 })
export { stub as POST }
