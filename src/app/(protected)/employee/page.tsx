import { GoalSheetStatus } from '@prisma/client'
import {
  Activity,
  AlertTriangle,
  Award,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  History,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'

import { BarList, SegmentedBar, Sparkline } from '@/components/app/charts'
import { EmptyState } from '@/components/app/empty-state'
import {
  LifecycleRail,
  QualityMeter,
  SignalList,
  SmartCriteriaGrid,
} from '@/components/app/intelligence-panels'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { ProgressBar, ProgressRing } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { GoalRefinementButton } from '@/components/goal-refinement-button'
import { SubmitGoalsButton } from '@/components/submit-goals-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getEmployeeOperatingSystem } from '@/lib/dal/dashboard.dal'
import {
  analyzeSheet,
  formatStatusLabel,
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

function formatDateTime(value: Date | null | undefined) {
  return value
    ? value.toLocaleDateString('en', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
      })
    : 'Not recorded'
}

function formatInputDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : ''
}

const lifecycleStages = [
  { key: GoalSheetStatus.DRAFT, label: 'Draft' },
  { key: GoalSheetStatus.SUBMITTED, label: 'Review' },
  { key: GoalSheetStatus.APPROVED_LOCKED, label: 'Locked' },
  { key: 'EXECUTION', label: 'Check-ins' },
]

export default async function EmployeePage() {
  const user = await requireUser()
  const sheet = await getEmployeeOperatingSystem(user.id)

  if (!sheet) {
    return (
      <>
        <PageHeader
          description="Your profile is active, but no goal sheet is assigned for the current cycle."
          eyebrow="Employee cockpit"
          title="My Goal Workspace"
        />
        <div className="p-6 xl:p-8">
          <EmptyState
            description="When HR opens a cycle, your goals, check-ins, manager review history, and nudges will appear here."
            title="No active goal sheet"
          />
        </div>
      </>
    )
  }

  const intelligence = analyzeSheet(sheet)
  const canSubmit =
    sheet.status === GoalSheetStatus.DRAFT ||
    sheet.status === GoalSheetStatus.RETURNED ||
    sheet.status === GoalSheetStatus.ADMIN_UNLOCKED
  const activeLifecycle =
    sheet.status === GoalSheetStatus.APPROVED_LOCKED
      ? 'EXECUTION'
      : sheet.status
  const timeline = sheet.approvalEvents.map((event) => ({
    description: event.comment,
    meta: formatDate(event.createdAt),
    title: `${formatStatusLabel(event.action)} by ${event.actor.fullName}`,
  }))
  const progressTrend = sheet.goals.map((goal, index) => ({
    label: goal.title ?? `Goal ${index + 1}`,
    value: latestProgress(goal),
  }))
  const completionData = [
    { label: 'Complete', value: intelligence.completedGoals },
    {
      label: 'In progress',
      value: Math.max(sheet.goals.length - intelligence.completedGoals, 0),
    },
  ]

  return (
    <>
      <PageHeader
        actions={
          canSubmit ? (
            <SubmitGoalsButton
              sheetId={sheet.id}
              updatedAt={sheet.updatedAt.toISOString()}
            />
          ) : null
        }
        description={`${sheet.cycle.name} with ${sheet.manager.fullName}. ${sheet.goals.length} goals mapped to ${sheet.orgUnit?.name ?? 'your function'}.`}
        eyebrow="Employee goal cockpit"
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusPill status={sheet.status} />
            <Badge variant="outline">Cycle {sheet.cycle.code}</Badge>
            <Badge variant={intelligence.weightageValid ? 'secondary' : 'destructive'}>
              Weightage {intelligence.totalWeightage}%
            </Badge>
            <Badge variant="outline">
              Last check-in {formatDate(intelligence.latestCheckInAt)}
            </Badge>
          </div>
        }
        title="My Goal Workspace"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="premium-card overflow-hidden">
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Operating health
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                    {sheet.status === GoalSheetStatus.SUBMITTED
                      ? 'Your sheet is in manager decision mode.'
                      : sheet.status === GoalSheetStatus.APPROVED_LOCKED
                        ? 'Execution mode is active and check-ins are live.'
                        : sheet.status === GoalSheetStatus.RETURNED
                          ? 'Manager feedback is ready for revision.'
                          : 'Your draft is ready for quality review.'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    AlignOps connects goal quality, progress, manager review, and check-in accountability in one auditable operating layer.
                  </p>
                </div>

                <LifecycleRail active={activeLifecycle} stages={lifecycleStages} />

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard
                    detail="Average latest check-in"
                    icon={<Activity className="h-4 w-4" />}
                    label="Progress"
                    trend={{
                      direction: intelligence.averageProgress >= 70 ? 'up' : 'flat',
                      label: `${intelligence.completedGoals}/${sheet.goals.length} done`,
                    }}
                    value={`${intelligence.averageProgress}%`}
                  />
                  <MetricCard
                    accent="bg-[color:var(--chart-2)]"
                    detail="SMART and governance checks"
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Quality"
                    value={`${intelligence.qualityScore}%`}
                  />
                  <MetricCard
                    accent="bg-[color:var(--chart-3)]"
                    detail={
                      intelligence.nextWindow
                        ? `${formatDate(intelligence.nextWindow.opensAt)} to ${formatDate(intelligence.nextWindow.closesAt)}`
                        : 'No window'
                    }
                    icon={<CalendarClock className="h-4 w-4" />}
                    label="Next window"
                    value={intelligence.nextWindow?.name ?? 'None'}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ProgressRing
                  label="Governance health"
                  size="lg"
                  value={intelligence.governanceHealth}
                />
              </div>
            </div>
          </div>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-[color:var(--chart-1)]" />
                Intelligent nudges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <SignalList signals={intelligence.signals.slice(0, 4)} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <QualityMeter
                  detail="Blends SMART quality, progress, sheet status, check-in coverage, and weightage balance."
                  label="Governance score"
                  value={intelligence.governanceHealth}
                />
                <div className="rounded-lg border bg-background/70 p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[color:var(--chart-4)]" />
                    <p className="text-sm font-medium">{intelligence.streak} window streak</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Achievement streak is based on check-in windows with recorded updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="KPI completion indicators"
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Completed goals"
            value={`${intelligence.completedGoals}/${sheet.goals.length}`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-5)]"
            detail="Goals needing attention"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="High risk"
            value={intelligence.highRiskGoals}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Completed cycle time"
            icon={<Clock3 className="h-4 w-4" />}
            label="Cycle elapsed"
            value={`${intelligence.cycleProgress}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Closed-window gaps"
            icon={<History className="h-4 w-4" />}
            label="Overdue check-ins"
            value={intelligence.missingCheckIns}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-4">
            {sheet.goals.map((goal, index) => {
              const analysis = intelligence.goalAnalyses[index]!
              const goalProgress = latestProgress(goal)

              return (
                <Card className="premium-card" key={goal.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={goal.status} />
                      <Badge variant="outline">{goal.source}</Badge>
                      {goal.thrustArea ? <Badge variant="secondary">{goal.thrustArea}</Badge> : null}
                      <Badge
                        variant={
                          analysis.riskLevel === 'high'
                            ? 'destructive'
                            : analysis.riskLevel === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {analysis.riskLevel} risk
                      </Badge>
                      {canSubmit && goal.source === 'INDIVIDUAL' ? (
                        <GoalRefinementButton
                          description={goal.description ?? ''}
                          goalId={goal.id}
                          targetDate={formatInputDate(goal.targetDate)}
                          targetNumeric={goal.targetNumeric?.toString() ?? ''}
                          thrustArea={goal.thrustArea ?? ''}
                          title={goal.title ?? ''}
                          weightage={goal.weightage.toString()}
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle className="text-lg tracking-normal">
                          {goal.title ?? 'Untitled shared KPI'}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {goal.description ?? 'Description is missing from this goal.'}
                        </p>
                      </div>
                      <QualityMeter
                        detail="SMART quality"
                        label="Goal quality"
                        value={analysis.qualityScore}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_15rem]">
                      <ProgressBar label="Latest check-in progress" value={goalProgress} />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="mt-1 font-semibold">{goal.weightage.toString()}%</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">Target</p>
                          <p className="mt-1 truncate font-semibold">
                            {goal.targetNumeric?.toString() ?? formatDate(goal.targetDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <SmartCriteriaGrid analysis={analysis} />

                    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
                      <SignalList signals={analysis.signals.slice(0, 2)} />
                      <div className="rounded-lg border bg-background/70 p-3">
                        <div className="mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 text-[color:var(--chart-2)]" />
                          <p className="text-sm font-medium">Check-in history</p>
                        </div>
                        {goal.achievementUpdates.length === 0 ? (
                          <p className="text-xs leading-5 text-muted-foreground">
                            No progress entries have been submitted yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {goal.achievementUpdates.slice(0, 3).map((update) => (
                              <div
                                className="rounded-md border bg-muted/20 p-2"
                                key={update.id}
                              >
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="font-medium">
                                    {update.checkinWindow.name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {update.progressScore?.toString() ?? 0}%
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {formatDateTime(update.submittedAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Progress trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Sparkline data={progressTrend} />
                <SegmentedBar data={completionData} />
                <BarList
                  data={sheet.goals.map((goal) => ({
                    label: goal.title ?? 'Untitled',
                    value: Number(goal.weightage),
                  }))}
                  max={100}
                />
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4" />
                  Approval timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline items={timeline} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}
