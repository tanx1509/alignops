import { GoalSheetStatus } from '@prisma/client'
import { KeyRound, LockKeyhole, Settings, ShieldCheck, Users } from 'lucide-react'

import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminSettingsPage() {
  const { activeCycle, cycles, orgUnits, sheets } = await getAdminControlTower()
  const lockedSheets = sheets.filter(
    (sheet) => sheet.status === GoalSheetStatus.APPROVED_LOCKED,
  ).length
  const adminUnlocked = sheets.filter(
    (sheet) => sheet.status === GoalSheetStatus.ADMIN_UNLOCKED,
  ).length
  const memberCount = orgUnits.reduce((sum, unit) => sum + unit.members.length, 0)

  return (
    <>
      <PageHeader
        description="System-level policy posture, cycle configuration, and governance defaults."
        eyebrow="Settings"
        meta={<Badge variant="outline">{cycles.length} cycles configured</Badge>}
        title="Workspace Settings"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            detail="Current governance period"
            icon={<Settings className="h-4 w-4" />}
            label="Active cycle"
            value={activeCycle?.code ?? 'None'}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Users mapped to org units"
            icon={<Users className="h-4 w-4" />}
            label="User coverage"
            value={memberCount}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Open admin exceptions"
            icon={<LockKeyhole className="h-4 w-4" />}
            label="Unlocks"
            value={adminUnlocked}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                Governance policy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Approval policy</p>
                <p className="mt-2 font-semibold">Manager lock required</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Submitted sheets cannot lock without the assigned manager.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Exception policy</p>
                <p className="mt-2 font-semibold">Admin reason required</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Unlocks write an auditable reason and preserve state history.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Relock policy</p>
                <p className="mt-2 font-semibold">Resubmit and approve</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Relock stays tied to employee revision and manager approval.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Policy posture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">{lockedSheets} locked sheets</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Execution accountability is active for approved sheets.
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">{orgUnits.length} org units</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Role and reporting surfaces are mapped through org ownership.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-base">Configured cycles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cycles.map((cycle) => (
              <div className="rounded-lg border bg-muted/20 p-3" key={cycle.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{cycle.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cycle.startsAt.toLocaleDateString()} to {cycle.endsAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={cycle.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                    {cycle.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              Entra-ready identity placeholders
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Group claim mapping</p>
              <p className="mt-2 font-semibold">Admin / Manager / Employee</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Supabase role claims are already normalized before RBAC checks run.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">SSO boundary</p>
              <p className="mt-2 font-semibold">Supabase Auth adapter</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Entra SAML/OIDC can land in the existing session and metadata flow.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Audit alignment</p>
              <p className="mt-2 font-semibold">Actor and role persisted</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Critical lifecycle actions retain actor role, entity, reason, and timestamp.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
