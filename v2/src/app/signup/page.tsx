import { redirect } from 'next/navigation'

// Self-hosted mode: no signup required
export default function SignupPage() {
  redirect('/dashboard')
}
