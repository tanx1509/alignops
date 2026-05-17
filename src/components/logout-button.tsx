'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { notify } from '@/components/app/toast-hub'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()

    notify({ title: 'Signed out', type: 'success' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <Button
      className="flex-1 gap-2"
      onClick={handleLogout}
      size="sm"
      type="button"
      variant="outline"
    >
      <LogOut className="h-3.5 w-3.5" />
      Logout
    </Button>
  )
}
