import { GoalSheetStatus } from '@prisma/client'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  GitPullRequest,
  Inbox,
  LineChart,
  MailCheck,
  ShieldAlert,
  Sparkles,
  TimerReset,
} from 'lucide-react'

import { BarList, DonutGauge, SegmentedBar } from '@/components/app/charts'
import { EmptyState } from '@/components/app/empty-state'
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
import { ProgressBar } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { ManagerSheetActions } from '@/components/manager-sheet-actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getManagerOperatingQueue, getStatusCount } from '@/lib/dal/dashboard.dal'
import {
  analyzeSheet,
  formatStatusLabel,
  goalThrustArea,
  goalTitle,
  latestProgress,
} from '@/lib/goal-intelligence'

function formatDate(value: Date | null | undefined) {
  return value
    ? value.toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
      })
    : 'Not set'
}

function riskLevelFromSheet(score: number, highRiskGoals: number) {
  if (highRiskGoals > 0 || score < 55) return 'high'
  if (score < 78) return 'medium'

  return 'low'
}

export default async function ManagerDashboardPage() {
  const user = await requireUser()
  const { escalations, notifications, sheets } = await getManagerOperatingQueue(user.id)
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
  const pending = sheetViews
    .filter(({ sheet }) => sheet.status === GoalSheetStatus.SUBMITTED)
    .sort(
      (left, right) =>
        right.intelligence.highRiskGoals - left.intelligence.highRiskGoals ||
        left.intelligence.governanceHealth - right.intelligence.governanceHealth,
    )
  const drafts = getStatusCount(sheets, GoalSheetStatus.DRAFT)
  const locked = getStatusCount(sheets, GoalSheetStatus.APPROVED_LOCKED)
  const returned = getStatusCount(sheets, GoalSheetStatus.RETURNED)
  const completionRate = sheets.length > 0 ? Math.round((locked / sheets.length) * 100) : 0
  const teamHealth =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.governanceHealth,
            0,
          ) / sheetViews.length,
        )
      : 0
  const highRiskGoals = sheetViews.flatMap(({ intelligence, sheet }) =>
    sheet.goals
      .map((goal, index) => ({
        analysis: intelligence.goalAnalyses[index]!,
        employee: sheet.employee,
        goal,
        orgUnit: sheet.orgUnit,
      }))
      .filter(({ analysis }) => analysis.riskLevel === 'high'),
  )
  const missingCheckIns = sheetViews.reduce(
    (sum, view) => sum + view.intelligence.missingCheckIns,
    0,
  )
  const bottleneck =
    pending.length > drafts && pending.length > 0
      ? 'Manager approvals are the current bottleneck.'
      : drafts > pending.length
        ? 'Employee submissions are the current bottleneck.'
        : 'No dominant lifecycle bottleneck detected.'
  const approvalSlaAging = pending.reduce(
    (max, view) => Math.max(max, view.intelligence.approvalSlaDays),
    0,
  )
  const teamRiskScore =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.executionRiskScore,
            0,
          ) / sheetViews.length,
        )
      : 0
  const managerEffectiveness = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        teamHealth * 0.45 +
          completionRate * 0.35 +
          Math.max(0, 100 - approvalSlaAging * 12) * 0.2,
      ),
    ),
  )
  const performanceDistribution = [
    {
      label: 'Controlled',
      value: sheetViews.filter(
        (view) => view.intelligence.riskPosture === 'controlled',
      ).length,
    },
    {
      label: 'Watch',
      value: sheetViews.filter((view) => view.intelligence.riskPosture === 'watch')
        .length,
    },
    {
      label: 'Critical',
      value: sheetViews.filter(
        (view) => view.intelligence.riskPosture === 'critical',
      ).length,
    },
  ]
  const attentionQueue = [
    ...pending.slice(0, 3).map(({ intelligence, sheet }) => ({
      detail: `${sheet.goals.length} goals, ${intelligence.approvalSlaDays}d approval SLA age`,
      label: sheet.employee.fullName,
      severity:
        intelligence.approvalSlaDays > 5 || intelligence.highRiskGoals > 0
          ? 'high'
          : 'medium',
      title: 'Decision required',
    })),
    ...highRiskGoals.slice(0, 3).map(({ analysis, employee, goal }) => ({
      detail: `${goalTitle(goal) ?? 'Untitled shared KPI'} - risk ${analysis.riskScore}`,
      label: employee.fullName,
      severity: 'high',
      title: 'KPI intervention',
    })),
    ...escalations.slice(0, 2).map((event) => ({
      detail: `${event.currentLevel} escalation due ${event.dueAt.toLocaleDateString()}`,
      label: event.employee.fullName,
      severity: 'high',
      title: 'Escalation open',
    })),
  ].slice(0, 6)
  const enterpriseNotifications: EnterpriseNotification[] =
    notifications.length > 0
      ? notifications.map((notification) => ({
          body: notification.body,
          channel:
            notification.type === 'GOAL_SUBMITTED'
              ? 'Teams'
              : notification.type === 'ESCALATION'
                ? 'Email'
                : 'System',
          createdAt: formatDate(notification.createdAt),
          ctaHref: notification.linkHref ?? '/manager',
          ctaLabel: 'Open queue',
          id: notification.id,
          previewBody: `${notification.body}\n\nRecommended action: review the sheet, add a decision comment, and keep the audit trail complete.`,
          previewSubject: notification.title,
          priority: notification.type === 'ESCALATION' ? 'high' : 'medium',
          title: notification.title,
        }))
      : pending.slice(0, 2).map(({ intelligence, sheet }) => ({
          body: `${sheet.employee.fullName} is waiting for a manager decision.`,
          channel: 'Teams',
          createdAt: formatDate(sheet.submittedAt),
          ctaHref: '/manager',
          ctaLabel: 'Review sheet',
          id: `pending-${sheet.id}`,
          previewBody: `Hi ${user.name},\n\n${sheet.employee.fullName}'s FY2026 goal sheet is in your approval queue with ${intelligence.highRiskGoals} high-risk KPI signal${intelligence.highRiskGoals === 1 ? '' : 's'}.\n\nDecision options: approve and lock, or return with comments.`,
          previewSubject: `Approval needed: ${sheet.employee.fullName}`,
          priority: intelligence.highRiskGoals > 0 ? 'high' : 'medium',
          title: 'Goal approval card ready',
        }))

  return (
    <>
      <PageHeader
        description="A command center for manager review, employee comparison, escalation triage, and approval throughput."
        eyebrow="Manager operating queue"
        meta={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{sheets.length} direct reports</Badge>
            <Badge variant="secondary">{pending.length} pending decisions</Badge>
            <Badge variant="outline">{escalations.length} active escalations</Badge>
            <Badge variant={teamHealth >= 75 ? 'secondary' : 'destructive'}>
              Team health {teamHealth}%
            </Badge>
          </div>
        }
        title="Team Goal Control"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Submitted goal sheets"
            icon={<Inbox className="h-4 w-4" />}
            label="Approval queue"
            trend={{ direction: pending.length > 0 ? 'up' : 'flat', label: `${pending.length} open` }}
            value={pending.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Approved and locked"
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Completion"
            value={`${completionRate}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Need employee action"
            icon={<Clock3 className="h-4 w-4" />}
            label="Drafts"
            value={drafts}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Risk or SLA warnings"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Governance alerts"
            value={escalations.length + highRiskGoals.length + missingCheckIns}
          />
        </section>

        <ExecutionHealthPanel
          confidence={Math.round(
            sheetViews.length > 0
              ? sheetViews.reduce(
                  (sum, view) => sum + view.intelligence.kpiConfidence,
                  0,
                ) / sheetViews.length
              : 0,
          )}
          cycleProgress={
            sheetViews[0]?.intelligence.cycleProgress ?? 0
          }
          forecastDetail={`${attentionQueue.length} prioritized item${attentionQueue.length === 1 ? '' : 's'} across approvals, KPI risk, and escalations.`}
          forecastLabel="Team execution pulse"
          momentum={
            teamRiskScore >= 55
              ? 'Intervention needed'
              : teamHealth >= 78
                ? 'Operating cleanly'
                : 'Watchlist active'
          }
          riskScore={teamRiskScore}
          score={teamHealth}
          stageProgress={completionRate}
          title="Manager execution health engine"
        />

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4" />
                Team performance overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[14rem_1fr]">
              <DonutGauge label="Team health" value={teamHealth} />
              <div className="space-y-4">
                <SegmentedBar
                  data={[
                    { label: 'Draft', value: drafts },
                    { label: 'Under review', value: pending.length },
                    { label: 'Returned', value: returned },
                    { label: 'Locked', value: locked },
                  ]}
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <QualityMeter
                    detail="Average governance health across your reporting line."
                    label="Health score"
                    value={teamHealth}
                  />
                  <QualityMeter
                    detail="Approval throughput against the current team population."
                    label="Completion"
                    value={completionRate}
                  />
                  <QualityMeter
                    detail="Blends team health, completion, and approval SLA aging."
                    label="Manager effectiveness"
                    value={managerEffectiveness}
                  />
                  <div className="rounded-lg border bg-background/70 p-3">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-[color:var(--chart-1)]" />
                      <p className="text-sm font-medium">Bottleneck detection</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{bottleneck}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-[color:var(--chart-1)]" />
                Governance alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalList
                signals={[
                  ...(pending.length > 0
                    ? [
                        {
                          detail: `${pending.length} submitted sheet${pending.length === 1 ? '' : 's'} need a manager decision.`,
                          severity: 'info' as const,
                          title: 'Approval queue active',
                        },
                      ]
                    : []),
                  ...(highRiskGoals.length > 0
                    ? [
                        {
                          detail: `${highRiskGoals.length} goal${highRiskGoals.length === 1 ? '' : 's'} contain quality or execution risk.`,
                          severity: 'warning' as const,
                          title: 'High-risk goals',
                        },
                      ]
                    : []),
                  ...(missingCheckIns > 0
                    ? [
                        {
                          detail: `${missingCheckIns} closed-window check-in gap${missingCheckIns === 1 ? '' : 's'} found.`,
                          severity: 'warning' as const,
                          title: 'Check-in gap',
                        },
                      ]
                    : []),
                ]}
                emptyLabel="No active governance alerts."
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TimerReset className="h-4 w-4" />
                Needs attention queue
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {attentionQueue.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No priority action is open across approvals, escalations, or KPI risk.
                </p>
              ) : (
                attentionQueue.map((item, index) => (
                  <DecisionPanel
                    icon={<AlertTriangle className="h-4 w-4 text-[color:var(--chart-4)]" />}
                    key={`${item.title}-${item.label}-${index}`}
                    label={item.severity}
                    title={item.title}
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </DecisionPanel>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChart className="h-4 w-4" />
                Performance distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BarList data={performanceDistribution} />
              <QualityMeter
                detail={`${approvalSlaAging} day max approval aging across submitted sheets.`}
                label="SLA control"
                value={Math.max(0, 100 - approvalSlaAging * 12)}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-4">
            {pending.length === 0 ? (
              <EmptyState
                description="When employees submit or resubmit sheets, decision cards with comments, risk signals, and approval actions appear here."
                icon={<Inbox className="h-5 w-5" />}
                title="Approval queue is clear"
              />
            ) : (
              pending.map(({ intelligence, sheet }) => {
                const riskLevel = riskLevelFromSheet(
                  intelligence.governanceHealth,
                  intelligence.highRiskGoals,
                )

                return (
                  <Card className="premium-card" key={sheet.id}>
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={sheet.status} />
                        <Badge variant="outline">{sheet.orgUnit?.name ?? 'No org unit'}</Badge>
                        <Badge variant="secondary">{sheet.goals.length} goals</Badge>
                        <Badge
                          variant={
                            riskLevel === 'high'
                              ? 'destructive'
                              : riskLevel === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {riskLevel} risk
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                          <CardTitle className="text-xl tracking-normal">
                            {sheet.employee.fullName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {sheet.employee.title} - submitted {formatDate(sheet.submittedAt)}
                          </p>
                        </div>
                        <QualityMeter
                          detail="Sheet health"
                          label="Health"
                          value={intelligence.governanceHealth}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                      <div className="space-y-3">
                        <SignalList signals={intelligence.signals.slice(0, 2)} />
                        {sheet.goals.map((goal, index) => {
                          const analysis = intelligence.goalAnalyses[index]!

                          return (
                            <div className="rounded-xl border bg-muted/20 p-3" key={goal.id}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {goalTitle(goal) ?? 'Untitled shared KPI'}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {goalThrustArea(goal) ?? goal.source} - {goal.weightage.toString()}%
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    analysis.riskLevel === 'high'
                                      ? 'destructive'
                                      : analysis.riskLevel === 'medium'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {analysis.qualityScore}%
                                </Badge>
                              </div>
                              <div className="mt-3">
                                <ProgressBar value={latestProgress(goal)} />
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="space-y-4">
                        <ManagerSheetActions
                          employeeName={sheet.employee.fullName}
                          riskLevel={riskLevel}
                          sheetId={sheet.id}
                        />
                        <div className="rounded-xl border bg-background/70 p-3">
                          <p className="mb-3 text-sm font-medium">Review timeline</p>
                            <Timeline
                              items={sheet.approvalEvents.map((event) => ({
                                description: event.comment,
                                meta: formatDate(event.createdAt),
                                title: `${formatStatusLabel(event.action)} by ${event.actor.fullName}`,
                              }))}
                            />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          <aside className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-base">Team status mix</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  data={[
                    { label: 'Draft', value: drafts },
                    { label: 'Under review', value: pending.length },
                    { label: 'Locked', value: locked },
                    { label: 'Returned', value: returned },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="h-4 w-4 text-[color:var(--chart-4)]" />
                  High-risk goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {highRiskGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No high-risk goals detected.</p>
                ) : (
                  highRiskGoals.slice(0, 5).map(({ analysis, employee, goal, orgUnit }) => (
                    <div className="rounded-lg border bg-muted/30 p-3" key={goal.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{employee.fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {goalTitle(goal) ?? 'Untitled shared KPI'}
                          </p>
                        </div>
                        <Badge variant="destructive">{analysis.riskScore}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {orgUnit?.name ?? 'No org unit'} - {analysis.signals[0]?.title}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-[color:var(--chart-4)]" />
                  Escalation radar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {escalations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active escalation events.</p>
                ) : (
                  escalations.map((event) => (
                    <div className="rounded-lg border bg-muted/30 p-3" key={event.id}>
                      <p className="text-sm font-medium">{event.employee.fullName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.currentLevel} - due {event.dueAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MailCheck className="h-4 w-4" />
                  Notification simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter notifications={enterpriseNotifications} />
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </>
  )
}
