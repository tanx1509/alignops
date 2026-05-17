import { GoalSheetStatus } from '@prisma/client'
import { AlertTriangle, CheckCircle2, Clock3, Inbox, Users } from 'lucide-react'

import { BarList } from '@/components/app/charts'
import { EmptyState } from '@/components/app/empty-state'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { ProgressBar } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { ManagerSheetActions } from '@/components/manager-sheet-actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getManagerOperatingQueue, getStatusCount } from '@/lib/dal/dashboard.dal'

function latestProgress(
  updates: Array<{
    progressScore: { toString: () => string } | null
  }>,
) {
  return updates[0]?.progressScore ? Number(updates[0].progressScore.toString()) : 0
}

export default async function ManagerDashboardPage() {
  const user = await requireUser()
  const { escalations, notifications, sheets } = await getManagerOperatingQueue(user.id)
  const pending = sheets.filter((sheet) => sheet.status === GoalSheetStatus.SUBMITTED)
  const drafts = getStatusCount(sheets, GoalSheetStatus.DRAFT)
  const locked = getStatusCount(sheets, GoalSheetStatus.APPROVED_LOCKED)
  const completionRate = sheets.length > 0 ? Math.round((locked / sheets.length) * 100) : 0

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
            detail="Open and acknowledged"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Escalations"
            value={escalations.length}
          />
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
              pending.map((sheet) => (
                <Card className="premium-card" key={sheet.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={sheet.status} />
                      <Badge variant="outline">{sheet.orgUnit?.name ?? 'No org unit'}</Badge>
                      <Badge variant="secondary">{sheet.goals.length} goals</Badge>
                    </div>
                    <CardTitle className="text-xl tracking-normal">
                      {sheet.employee.fullName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{sheet.employee.title}</p>
                  </CardHeader>
                  <CardContent className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                    <div className="space-y-3">
                      {sheet.goals.map((goal) => (
                        <div className="rounded-xl border bg-muted/20 p-3" key={goal.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{goal.title ?? 'Untitled goal'}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {goal.thrustArea ?? goal.source} - {goal.weightage.toString()}%
                              </p>
                            </div>
                            <StatusPill status={goal.status} />
                          </div>
                          <div className="mt-3">
                            <ProgressBar value={latestProgress(goal.achievementUpdates)} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <ManagerSheetActions sheetId={sheet.id} />
                  </CardContent>
                </Card>
              ))
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
                    { label: 'Returned', value: getStatusCount(sheets, GoalSheetStatus.RETURNED) },
                  ]}
                />
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
                  <Users className="h-4 w-4" />
                  Recent signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No manager notifications yet.</p>
                ) : (
                  notifications.map((notification) => (
                    <div className="rounded-lg border bg-muted/30 p-3" key={notification.id}>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </>
  )
}
