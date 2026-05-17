import { GoalSheetStatus } from '@prisma/client'
import { Activity, CalendarClock, FileCheck2, Send, Sparkles } from 'lucide-react'

import { BarList, Sparkline } from '@/components/app/charts'
import { EmptyState } from '@/components/app/empty-state'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { ProgressBar, ProgressRing } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { SubmitGoalsButton } from '@/components/submit-goals-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getEmployeeOperatingSystem } from '@/lib/dal/dashboard.dal'

function formatDate(value: Date | null) {
  return value
    ? value.toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
      })
    : 'Not set'
}

function latestProgress(
  updates: Array<{
    progressScore: { toString: () => string } | null
  }>,
) {
  const latest = updates[0]

  return latest?.progressScore ? Number(latest.progressScore.toString()) : 0
}

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

  const canSubmit = sheet.status === GoalSheetStatus.DRAFT
  const progressValues = sheet.goals.map((goal) => latestProgress(goal.achievementUpdates))
  const averageProgress =
    progressValues.length > 0
      ? progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length
      : sheet.status === GoalSheetStatus.APPROVED_LOCKED
        ? 100
        : 0
  const totalWeightage = sheet.goals.reduce(
    (sum, goal) => sum + Number(goal.weightage),
    0,
  )
  const nextWindow =
    sheet.cycle.checkinWindows.find((window) => window.status === 'OPEN') ??
    sheet.cycle.checkinWindows[0] ??
    null
  const timeline = sheet.approvalEvents.map((event) => ({
    description: event.comment,
    meta: formatDate(event.createdAt),
    title: `${event.action.toLowerCase().replaceAll('_', ' ')} by ${event.actor.fullName}`,
  }))

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
        eyebrow="Employee cockpit"
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusPill status={sheet.status} />
            <Badge variant="outline">Cycle {sheet.cycle.code}</Badge>
            <Badge variant="secondary">Weightage {totalWeightage}%</Badge>
          </div>
        }
        title="My Goal Workspace"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="premium-card overflow-hidden">
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Operating health
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                    {sheet.status === GoalSheetStatus.SUBMITTED
                      ? 'Your goals are under manager review.'
                      : sheet.status === GoalSheetStatus.APPROVED_LOCKED
                        ? 'Your goals are locked and execution has started.'
                        : 'Your draft is ready for final submission.'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    AlignOps tracks the handoff from goal creation to approval, then keeps check-ins tied to the same auditable sheet.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard
                    detail="Average latest check-in"
                    icon={<Activity className="h-4 w-4" />}
                    label="Progress"
                    value={`${Math.round(averageProgress)}%`}
                  />
                  <MetricCard
                    accent="bg-[color:var(--chart-2)]"
                    detail="Across active sheet"
                    icon={<FileCheck2 className="h-4 w-4" />}
                    label="Goals"
                    value={sheet.goals.length}
                  />
                  <MetricCard
                    accent="bg-[color:var(--chart-3)]"
                    detail={nextWindow ? `${formatDate(nextWindow.opensAt)} to ${formatDate(nextWindow.closesAt)}` : 'No window'}
                    icon={<CalendarClock className="h-4 w-4" />}
                    label="Next window"
                    value={nextWindow?.name ?? 'None'}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ProgressRing label="Execution pulse" size="lg" value={averageProgress} />
              </div>
            </div>
          </div>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-[color:var(--chart-1)]" />
                Smart nudges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="font-medium">Submission confidence</p>
                <p className="mt-1 text-muted-foreground">
                  Your weightage totals {totalWeightage}%. Submit is enabled only when the governance rules pass.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="font-medium">Manager visibility</p>
                <p className="mt-1 text-muted-foreground">
                  Every submit, return, approval, and unlock writes to the approval and audit timelines.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-4">
            {sheet.goals.map((goal) => {
              const goalProgress = latestProgress(goal.achievementUpdates)

              return (
                <Card className="premium-card" key={goal.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={goal.status} />
                      <Badge variant="outline">{goal.source}</Badge>
                      {goal.thrustArea ? <Badge variant="secondary">{goal.thrustArea}</Badge> : null}
                    </div>
                    <CardTitle className="text-lg tracking-normal">
                      {goal.title ?? 'Untitled goal'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {goal.description ? (
                      <p className="text-sm leading-6 text-muted-foreground">{goal.description}</p>
                    ) : null}
                    <div className="grid gap-4 md:grid-cols-[1fr_13rem]">
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
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-base">Progress trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Sparkline
                  data={sheet.goals.map((goal, index) => ({
                    label: goal.title ?? `Goal ${index + 1}`,
                    value: latestProgress(goal.achievementUpdates),
                  }))}
                />
                <div className="mt-4">
                  <BarList
                    data={sheet.goals.map((goal) => ({
                      label: goal.title ?? 'Untitled',
                      value: Number(goal.weightage),
                    }))}
                    max={100}
                  />
                </div>
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
