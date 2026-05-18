import { GoalSheetStatus } from '@prisma/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertTriangle,
  Building2,
  Download,
  FileClock,
  Gauge,
  LockKeyhole,
  MailCheck,
  Network,
  ShieldCheck,
  TimerReset,
  TrendingUp,
} from 'lucide-react'

import {
  BarList,
  SegmentedBar,
} from '@/components/app/charts'

const HeatMapGrid = dynamic(() => import('@/components/app/charts').then(mod => mod.HeatMapGrid), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />,
})
const StatusMatrix = dynamic(() => import('@/components/app/charts').then(mod => mod.StatusMatrix), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />,
})
const DonutGauge = dynamic(() => import('@/components/app/charts').then(mod => mod.DonutGauge), {
  loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
})
import {
  QualityMeter,
  SignalList,
} from '@/components/app/intelligence-panels'
import { MetricCard } from '@/components/app/metric-card'
import { NotificationCenter, type EnterpriseNotification } from '@/components/app/notification-center'
import {
  DecisionPanel,
  ExecutionHealthPanel,
} from '@/components/app/operating-panels'
import { PageHeader } from '@/components/app/page-header'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower, getStatusCount } from '@/lib/dal/dashboard.dal'
import { analyzeSheet } from '@/lib/goal-intelligence'

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

export default async function AdminDashboardPage() {
  const { activeCycle, auditLogs, escalations, orgUnits, sheets } =
    await getAdminControlTower()
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
  const locked = getStatusCount(sheets, GoalSheetStatus.APPROVED_LOCKED)
  const submitted = getStatusCount(sheets, GoalSheetStatus.SUBMITTED)
  const drafts = getStatusCount(sheets, GoalSheetStatus.DRAFT)
  const returned = getStatusCount(sheets, GoalSheetStatus.RETURNED)
  const adminUnlocked = getStatusCount(sheets, GoalSheetStatus.ADMIN_UNLOCKED)
  const completionRate = percent(locked, sheets.length)
  const submissionRate = percent(
    sheets.length - drafts,
    sheets.length,
  )
  const governanceHealth =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.governanceHealth,
            0,
          ) / sheetViews.length,
        )
      : 0
  const overdueCheckIns = sheetViews.reduce(
    (sum, view) => sum + view.intelligence.missingCheckIns,
    0,
  )
  const highRiskSheets = sheetViews.filter(
    (view) => view.intelligence.highRiskGoals > 0,
  )
  const orgRiskScore =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.executionRiskScore,
            0,
          ) / sheetViews.length,
        )
      : 0
  const orgKpiConfidence =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.kpiConfidence,
            0,
          ) / sheetViews.length,
        )
      : 0
  const maxApprovalAging = sheetViews.reduce(
    (max, view) => Math.max(max, view.intelligence.approvalSlaDays),
    0,
  )
  const governanceBottlenecks = [
    {
      detail: `${drafts} sheet${drafts === 1 ? '' : 's'} have not entered manager review.`,
      label: `${percent(drafts, sheets.length)}% of org`,
      title: 'Employee submission drag',
    },
    {
      detail: `${submitted} sheet${submitted === 1 ? '' : 's'} are waiting for manager decisions.`,
      label: `${maxApprovalAging}d max SLA`,
      title: 'Approval bottleneck',
    },
    {
      detail: `${overdueCheckIns} check-in obligation${overdueCheckIns === 1 ? '' : 's'} are missing.`,
      label: 'Quarterly compliance',
      title: 'Check-in compliance',
    },
    {
      detail: `${adminUnlocked} policy exception${adminUnlocked === 1 ? '' : 's'} are open under HR control.`,
      label: 'Unlock control',
      title: 'Exception governance',
    },
  ].filter((item) => !item.detail.startsWith('0 '))
  const enterpriseNotifications: EnterpriseNotification[] = [
    ...escalations.slice(0, 4).map((event) => ({
      body: `${event.employee.fullName} has an open ${event.currentLevel} escalation owned by ${event.manager?.fullName ?? 'HR'}.`,
      channel: 'Email' as const,
      createdAt: event.triggeredAt.toLocaleDateString(),
      ctaHref: '/admin/governance',
      ctaLabel: 'Open governance',
      id: `escalation-${event.id}`,
      previewBody: `Escalation owner: ${event.manager?.fullName ?? 'HR'}\nEmployee: ${event.employee.fullName}\nDue: ${event.dueAt.toLocaleDateString()}\n\nRecommended action: review the policy exception, acknowledge ownership, and document resolution notes.`,
      previewSubject: `Escalation requires governance review: ${event.employee.fullName}`,
      priority: 'high' as const,
      title: 'Escalation tracking alert',
    })),
    ...auditLogs.slice(0, 3).map((log) => ({
      body: `${log.action} on ${log.entityType} by ${log.actor?.fullName ?? 'System'}.`,
      channel: 'System' as const,
      createdAt: log.createdAt.toLocaleDateString(),
      ctaHref: '/admin/audit',
      ctaLabel: 'Open audit log',
      id: `audit-${log.id}`,
      previewBody: `${log.reason ?? 'No reason captured.'}\n\nActor role: ${log.actorRole ?? 'SYSTEM'}\nTimestamp: ${log.createdAt.toLocaleString()}`,
      previewSubject: `Audit event captured: ${log.action}`,
      priority: log.action === 'UNLOCK' ? ('high' as const) : ('low' as const),
      title: 'Audit intelligence event',
    })),
  ].slice(0, 6)
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
  const departmentHeatmap = orgUnits
    .filter((unit) => sheets.some((sheet) => sheet.orgUnit?.id === unit.id))
    .map((unit) => {
      const unitViews = sheetViews.filter(
        (view) => view.sheet.orgUnit?.id === unit.id,
      )
      const unitLocked = unitViews.filter(
        (view) => view.sheet.status === GoalSheetStatus.APPROVED_LOCKED,
      ).length
      const unitSubmitted = unitViews.filter(
        (view) => view.sheet.status !== GoalSheetStatus.DRAFT,
      ).length
      const unitRisk = unitViews.reduce(
        (sum, view) => sum + view.intelligence.highRiskGoals,
        0,
      )
      const unitOverdue = unitViews.reduce(
        (sum, view) => sum + view.intelligence.missingCheckIns,
        0,
      )
      const unitHealth =
        unitViews.length > 0
          ? Math.round(
              unitViews.reduce(
                (sum, view) => sum + view.intelligence.governanceHealth,
                0,
              ) / unitViews.length,
            )
          : 0

      return {
        cells: [
          unitHealth,
          percent(unitSubmitted, unitViews.length),
          percent(unitLocked, unitViews.length),
          unitRisk,
          unitOverdue,
        ],
        label: unit.name,
      }
    })

  return (
    <>
      <PageHeader
        description="Org-wide governance, policy readiness, auditability, and operating risk in one executive-grade control tower."
        eyebrow="Admin command center"
        meta={
          <div className="flex flex-wrap gap-2">
            {activeCycle ? <Badge variant="outline">Active cycle {activeCycle.code}</Badge> : null}
            <Badge variant="secondary">{sheets.length} goal sheets</Badge>
            <Badge variant="outline">{orgUnits.length} org units</Badge>
            <Badge variant={governanceHealth >= 75 ? 'secondary' : 'destructive'}>
              Governance health {governanceHealth}%
            </Badge>
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
            detail="Submitted, returned, unlocked, or locked"
            icon={<FileClock className="h-4 w-4" />}
            label="Submission rate"
            value={`${submissionRate}%`}
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
            detail="Escalations, risk, overdue gaps"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Risk signals"
            value={escalations.length + highRiskSheets.length + overdueCheckIns}
          />
        </section>

        <ExecutionHealthPanel
          confidence={orgKpiConfidence}
          cycleProgress={sheetViews[0]?.intelligence.cycleProgress ?? 0}
          forecastDetail={`${governanceBottlenecks.length} governance bottleneck${governanceBottlenecks.length === 1 ? '' : 's'} detected across submissions, manager approvals, check-ins, and unlocks.`}
          forecastLabel="Org execution governance pulse"
          momentum={
            orgRiskScore >= 55
              ? 'Governance intervention'
              : governanceHealth >= 78
                ? 'Enterprise rhythm healthy'
                : 'Bottleneck watch'
          }
          riskScore={orgRiskScore}
          score={governanceHealth}
          stageProgress={completionRate}
          title="Organizational execution health engine"
        />

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-4 w-4" />
                  Governance health score
                </CardTitle>
                <Link href="/admin/governance" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  View Governance Flow &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[14rem_1fr]">
              <DonutGauge label="Org health" value={governanceHealth} />
              <div className="space-y-4">
                <SegmentedBar
                  data={[
                    { label: 'Draft', value: drafts },
                    { label: 'Under review', value: submitted },
                    { label: 'Returned', value: returned },
                    { label: 'Admin unlocked', value: adminUnlocked },
                    { label: 'Locked', value: locked },
                  ]}
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <QualityMeter
                    detail="Average sheet governance health."
                    label="Health"
                    value={governanceHealth}
                  />
                  <QualityMeter
                    detail="Goal sheets that have left draft."
                    label="Submission"
                    value={submissionRate}
                  />
                  <QualityMeter
                    detail="Manager-approved goal sheets."
                    label="Compliance"
                    value={completionRate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Escalation trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <BarList
                data={[
                  {
                    label: 'Manager level',
                    value: escalations.filter((event) => event.currentLevel === 'MANAGER').length,
                  },
                  {
                    label: 'HR level',
                    value: escalations.filter((event) => event.currentLevel === 'HR').length,
                  },
                  {
                    label: 'Overdue gaps',
                    value: overdueCheckIns,
                  },
                  {
                    label: 'High-risk sheets',
                    value: highRiskSheets.length,
                  },
                ]}
              />
              <SignalList
                signals={[
                  ...(highRiskSheets.length > 0
                    ? [
                        {
                          detail: `${highRiskSheets.length} sheet${highRiskSheets.length === 1 ? '' : 's'} include high-risk goals.`,
                          severity: 'warning' as const,
                          title: 'Quality risk detected',
                        },
                      ]
                    : []),
                  ...(overdueCheckIns > 0
                    ? [
                        {
                          detail: `${overdueCheckIns} check-in obligation${overdueCheckIns === 1 ? '' : 's'} are overdue.`,
                          severity: 'warning' as const,
                          title: 'Check-in compliance gap',
                        },
                      ]
                    : []),
                ]}
                emptyLabel="No elevated governance trends."
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TimerReset className="h-4 w-4" />
                    Governance bottleneck insights
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Deterministic queue pressure across the current operating cycle.
                  </p>
                </div>
                <Link
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  href="/api/reports/governance.csv"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {governanceBottlenecks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No meaningful cycle bottleneck is currently visible.
                </p>
              ) : (
                governanceBottlenecks.map((item) => (
                  <DecisionPanel
                    icon={<AlertTriangle className="h-4 w-4 text-[color:var(--chart-4)]" />}
                    key={item.title}
                    label={item.label}
                    title={item.title}
                  >
                    <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </DecisionPanel>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="h-4 w-4" />
                Role hierarchy visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">Admin to managers</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  HR controls cycle governance, policy unlocks, and audit review across {orgUnits.length} org units.
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">Managers to employees</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Submitted goal sheets require manager decision before execution locks.
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">Entra-ready identity boundary</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Roles are normalized in the app layer and can be mapped from Entra groups through Supabase claims.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Department governance heatmap</CardTitle>
                <Link href="/admin/reports" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  View Governance Report &rarr;
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Columns: health, submitted, locked, risk goals, overdue check-ins.
              </p>
            </CardHeader>
            <CardContent>
              <HeatMapGrid
                columns={['Health', 'Submit', 'Locked', 'Risk', 'Overdue']}
                rows={departmentHeatmap}
              />
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
                  { label: 'Admin unlocked', value: adminUnlocked },
                  { label: 'Locked', value: locked },
                ]}
              />
            </CardContent>
          </Card>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <LockKeyhole className="h-4 w-4" />
                Lock controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">{locked} locked sheets</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  HR can unlock exceptions in Governance with a required audit reason.
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-sm font-medium">{adminUnlocked} unlocked exceptions</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Relock happens through the existing employee resubmit and manager approve flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Recent sheets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sheetViews.slice(0, 8).map(({ intelligence, sheet }) => (
                <div className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[1fr_auto_auto]" key={sheet.id}>
                  <div>
                    <p className="text-sm font-medium">{sheet.employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sheet.orgUnit?.name ?? 'No org unit'} - Manager {sheet.manager.fullName}
                    </p>
                  </div>
                  <Badge
                    variant={intelligence.governanceHealth >= 75 ? 'secondary' : 'destructive'}
                  >
                    {intelligence.governanceHealth}%
                  </Badge>
                  <StatusPill status={sheet.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Audit pulse</CardTitle>
                <Link href="/admin/audit" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Open Audit Timeline &rarr;
                </Link>
              </div>
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

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MailCheck className="h-4 w-4" />
                Enterprise notification simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationCenter notifications={enterpriseNotifications} />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Platform operational metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QualityMeter
                detail="CSV exports and dashboards are computed from existing Prisma data without external AI or paid services."
                label="Cost efficiency"
                value={96}
              />
              <QualityMeter
                detail={`${auditLogs.length} recent events available for compliance traceability.`}
                label="Audit coverage"
                value={Math.min(100, auditLogs.length * 5)}
              />
              <QualityMeter
                detail={`${adminUnlocked} active unlock exception${adminUnlocked === 1 ? '' : 's'} under HR control.`}
                label="Exception control"
                value={adminUnlocked === 0 ? 100 : Math.max(40, 100 - adminUnlocked * 18)}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
