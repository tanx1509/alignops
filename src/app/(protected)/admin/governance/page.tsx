import { GoalSheetStatus } from '@prisma/client'
import {
  AlertTriangle,
  CheckCircle2,
  FileLock2,
  LockKeyhole,
  ShieldAlert,
  UnlockKeyhole,
} from 'lucide-react'

import { AdminUnlockButton } from '@/components/admin-unlock-button'
import {
  QualityMeter,
  SignalList,
} from '@/components/app/intelligence-panels'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { StatusPill } from '@/components/app/status-pill'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'
import { analyzeSheet } from '@/lib/goal-intelligence'

export default async function AdminGovernancePage() {
  const { activeCycle, sheets } = await getAdminControlTower()
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
  const lockedSheets = sheetViews.filter(
    ({ sheet }) => sheet.status === GoalSheetStatus.APPROVED_LOCKED,
  )
  const returnedSheets = sheetViews.filter(
    ({ sheet }) => sheet.status === GoalSheetStatus.RETURNED,
  )
  const unlockedSheets = sheetViews.filter(
    ({ sheet }) => sheet.status === GoalSheetStatus.ADMIN_UNLOCKED,
  )
  const policyHealth =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.governanceHealth,
            0,
          ) / sheetViews.length,
        )
      : 0

  return (
    <>
      <PageHeader
        description="Policy controls for locked goal sheets, revision exceptions, and cycle governance."
        eyebrow="Governance"
        meta={
          <div className="flex flex-wrap gap-2">
            {activeCycle ? <Badge variant="outline">{activeCycle.name}</Badge> : null}
            <Badge variant="secondary">{lockedSheets.length} locked sheets</Badge>
            <Badge variant="outline">{returnedSheets.length} returned sheets</Badge>
            <Badge variant={unlockedSheets.length > 0 ? 'destructive' : 'outline'}>
              {unlockedSheets.length} unlocked exceptions
            </Badge>
          </div>
        }
        title="Policy Enforcement and Unlock Intervention"
      />

      <div className="space-y-5 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Average sheet governance"
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Policy health"
            value={`${policyHealth}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Manager approved"
            icon={<FileLock2 className="h-4 w-4" />}
            label="Locked"
            value={lockedSheets.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Awaiting employee resubmit"
            icon={<UnlockKeyhole className="h-4 w-4" />}
            label="Unlocked"
            value={unlockedSheets.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Needs manager/employee action"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Returned"
            value={returnedSheets.length}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LockKeyhole className="h-4 w-4" />
                Unlock intervention center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lockedSheets.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background/70 p-8 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <p className="font-medium">No locked sheets</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Manager-approved sheets appear here when they can be force-unlocked by HR with a required reason.
                  </p>
                </div>
              ) : (
                lockedSheets.map(({ intelligence, sheet }) => (
                  <div className="rounded-xl border bg-muted/20 p-4" key={sheet.id}>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{sheet.employee.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sheet.orgUnit?.name ?? 'No org unit'} - manager {sheet.manager.fullName}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{intelligence.governanceHealth}% health</Badge>
                        <StatusPill status={sheet.status} />
                      </div>
                    </div>
                    <AdminUnlockButton sheetId={sheet.id} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-base">Policy readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <QualityMeter
                  detail="Measures goal quality, approval state, progress, and check-in coverage."
                  label="Governance"
                  value={policyHealth}
                />
                <SignalList
                  signals={[
                    ...(unlockedSheets.length > 0
                      ? [
                          {
                            detail: `${unlockedSheets.length} sheet${unlockedSheets.length === 1 ? '' : 's'} are open under admin exception.`,
                            severity: 'warning' as const,
                            title: 'Unlocked exception',
                          },
                        ]
                      : []),
                    ...(returnedSheets.length > 0
                      ? [
                          {
                            detail: `${returnedSheets.length} returned sheet${returnedSheets.length === 1 ? '' : 's'} are waiting for employee correction.`,
                            severity: 'info' as const,
                            title: 'Revision loop active',
                          },
                        ]
                      : []),
                  ]}
                  emptyLabel="No policy exceptions are open."
                />
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UnlockKeyhole className="h-4 w-4" />
                  Unlock and relock flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="font-medium">1. Admin unlocks with reason</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The sheet moves to admin unlocked and the audit log captures the policy exception.
                  </p>
                </div>
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="font-medium">2. Employee revises and resubmits</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The existing submit flow returns the sheet to manager review without bypassing controls.
                  </p>
                </div>
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="font-medium">3. Manager approves and relocks</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Relock is intentionally tied to manager approval so accountability stays intact.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {unlockedSheets.length > 0 ? (
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Unlocked exceptions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 xl:grid-cols-2">
              {unlockedSheets.map(({ intelligence, sheet }) => (
                <div className="rounded-xl border bg-muted/20 p-4" key={sheet.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{sheet.employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sheet.unlockReason ?? 'No unlock reason captured'}
                      </p>
                    </div>
                    <StatusPill status={sheet.status} />
                  </div>
                  <div className="mt-3">
                    <QualityMeter
                      detail="Exception health"
                      label="Health"
                      value={intelligence.governanceHealth}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  )
}
