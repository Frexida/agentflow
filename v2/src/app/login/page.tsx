import { redirect } from 'next/navigation'

// Self-hosted mode: no login required
export default function LoginPage() {
  redirect('/dashboard')
}
