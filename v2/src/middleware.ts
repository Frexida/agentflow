import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// No-auth mode: allow all routes without authentication
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
