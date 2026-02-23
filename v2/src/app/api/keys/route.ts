import { NextResponse } from 'next/server'
// Self-hosted mode: API key management not available
const stub = () => NextResponse.json({ error: 'Not available in self-hosted mode' }, { status: 501 })
export { stub as GET, stub as POST, stub as DELETE }
