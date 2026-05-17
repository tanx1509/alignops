import { GoalSheetStatus } from '@prisma/client'
import { AlertTriangle, Building2, FileClock, ShieldCheck } from 'lucide-react'

import { BarList, StatusMatrix } from '@/components/app/charts'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower, getStatusCount } from '@/lib/dal/dashboard.dal'

export default async function AdminDashboardPage() {
  const { activeCycle, auditLogs, escalations, orgUnits, sheets } =
    await getAdminControlTower()
  const locked = getStatusCount(sheets, GoalSheetStatus.APPROVED_LOCKED)
  const submitted = getStatusCount(sheets, GoalSheetStatus.SUBMITTED)
  const drafts = getStatusCount(sheets, GoalSheetStatus.DRAFT)
  const returned = getStatusCount(sheets, GoalSheetStatus.RETURNED)
  const completionRate = sheets.length > 0 ? Math.round((locked / sheets.length) * 100) : 0
  const orgRows = orgUnits
    .filter((unit) => sheets.some((sheet) => sheet.orgUnit?.id === unit.id))
    .map((unit) => {
      const unitSheets = sheets.filter((sheet) => sheet.orgUnit?.id === unit.id)

      return {
        cells: [
          unitSheets.filter((sheet) => sheet.status === GoalSheetStatus.DRAFT).length,
          unitSheets.filter((sheet) => sheet.status === GoalSheetStatus.SUBMITTED).length,
          unitSheets.filter((sheet) => sheet.status === GoalSheetStatus.RETURNED).length,
          unitSheets.filter((sheet) => sheet.status === GoalSheetStatus.APPROVED_LOCKED).length,
          unit.members.length,
        ],
        label: unit.name,
      }
    })

  return (
    <>
      <PageHeader
        description="Org-wide governance, policy readiness, auditability, and operating risk in one executive-grade control tower."
        eyebrow="Admin control tower"
        meta={
          <div className="flex flex-wrap gap-2">
            {activeCycle ? <Badge variant="outline">Active cycle {activeCycle.code}</Badge> : null}
            <Badge variant="secondary">{sheets.length} goal sheets</Badge>
            <Badge variant="outline">{orgUnits.length} org units</Badge>
          </div>
        }
        title="Goal Governance Control Tower"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Approved and locked"
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Completion"
            value={`${completionRate}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Awaiting manager review"
            icon={<FileClock className="h-4 w-4" />}
            label="Under review"
            value={submitted}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Organization units"
            icon={<Building2 className="h-4 w-4" />}
            label="Coverage"
            value={orgUnits.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Open governance risks"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Escalations"
            value={escalations.length}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Org status matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Columns: draft, under review, returned, locked, members.
              </p>
            </CardHeader>
            <CardContent>
              <StatusMatrix rows={orgRows} />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Lifecycle distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BarList
                data={[
                  { label: 'Draft', value: drafts },
                  { label: 'Under review', value: submitted },
                  { label: 'Returned', value: returned },
                  { label: 'Locked', value: locked },
                ]}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Recent sheets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sheets.slice(0, 8).map((sheet) => (
                <div className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[1fr_auto_auto]" key={sheet.id}>
                  <div>
                    <p className="text-sm font-medium">{sheet.employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sheet.orgUnit?.name ?? 'No org unit'} - Manager {sheet.manager.fullName}
                    </p>
                  </div>
                  <StatusPill status={sheet.status} />
                  <span className="text-xs text-muted-foreground">{sheet.updatedAt.toLocaleDateString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Audit pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                items={auditLogs.slice(0, 6).map((log) => ({
                  description: log.reason,
                  meta: log.createdAt.toLocaleDateString(),
                  title: `${log.action} ${log.entityType} by ${log.actor?.fullName ?? 'System'}`,
                }))}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
