import { NextResponse } from 'next/server'
// Self-hosted mode: auth callback not needed
export function GET() {
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
