'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Command, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage({
  searchParams,
}: {
  searchParams?: {
    next?: string
  }
}) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const nextPath =
      searchParams?.next && searchParams.next.startsWith('/')
        ? searchParams.next
        : '/'

    setLoading(false)
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border bg-card shadow-2xl md:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-grid hidden flex-col justify-between border-r bg-muted/30 p-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-normal">AlignOps</p>
              <p className="text-sm text-muted-foreground">Goal governance operating system</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Enterprise rhythm</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-normal">
              Goals, approvals, check-ins, and audit in one operating layer.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              A premium workspace for employees, managers, and HR leaders to run aligned execution with clear governance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['99%', 'Policy coverage'],
              ['15m', 'Review pulse'],
              ['1', 'Audit source'],
            ].map(([value, label]) => (
              <div className="rounded-2xl border bg-background/80 p-4" key={label}>
                <p className="text-2xl font-semibold tracking-normal">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-10">
          <Card className="w-full max-w-md border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              <div className="mb-8 lg:hidden">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border bg-background shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-semibold tracking-normal">AlignOps</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enterprise goal governance.</p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Secure sign in</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">Enter your workspace</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use your Supabase-authenticated AlignOps account.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <label className="block space-y-2 text-sm font-medium">
                  Email
                  <input
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block space-y-2 text-sm font-medium">
                  Password
                  <input
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    type="password"
                    value={password}
                  />
                </label>

                {error ? (
                  <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button className="h-11 w-full" disabled={loading} type="submit">
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-3">
                  <Command className="h-4 w-4" />
                  Cmd/Ctrl K ready
                </div>
                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-3">
                  <Activity className="h-4 w-4" />
                  Live governance
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
