import { Settings } from 'lucide-react'

import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminSettingsPage() {
  const { activeCycle, cycles } = await getAdminControlTower()

  return (
    <>
      <PageHeader
        description="System-level policy posture, cycle configuration, and governance defaults."
        eyebrow="Settings"
        meta={<Badge variant="outline">{cycles.length} cycles configured</Badge>}
        title="Workspace Settings"
      />

      <div className="grid gap-5 p-5 xl:grid-cols-3 xl:p-8">
        <Card className="premium-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Cycle policy
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Active cycle</p>
              <p className="mt-2 font-semibold">{activeCycle?.name ?? 'None'}</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Approval policy</p>
              <p className="mt-2 font-semibold">Manager lock required</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Exception policy</p>
              <p className="mt-2 font-semibold">Admin reason required</p>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-base">Configured cycles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cycles.map((cycle) => (
              <div className="rounded-lg border bg-muted/20 p-3" key={cycle.id}>
                <p className="text-sm font-medium">{cycle.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{cycle.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
