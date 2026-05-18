import { MessageSquareText, TrendingUp } from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { ProgressBar } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { Timeline } from '@/components/app/timeline'
import { CheckInForm } from '@/components/check-in-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getEmployeeCheckInDesk } from '@/lib/dal/dashboard.dal'
import { goalTitle } from '@/lib/goal-intelligence'

function progressValue(
  updates: Array<{
    progressScore: { toString: () => string } | null
  }>,
) {
  return updates[0]?.progressScore ? Number(updates[0].progressScore.toString()) : 0
}

export default async function EmployeeCheckInsPage() {
  const user = await requireUser()
  const desk = await getEmployeeCheckInDesk(user.id)

  if (!desk) {
    return (
      <>
        <PageHeader
          description="Check-ins appear once a goal sheet is assigned."
          eyebrow="Employee check-ins"
          title="Progress Journal"
        />
        <div className="p-6 xl:p-8">
          <EmptyState
            description="Your check-ins will connect blockers, achievements, and manager context to the same auditable goals."
            icon={<MessageSquareText className="h-5 w-5" />}
            title="No check-in workspace yet"
          />
        </div>
      </>
    )
  }

  const { openWindow, sheet } = desk

  return (
    <>
      <PageHeader
        description="Capture progress, blockers, and achievements without losing governance history."
        eyebrow="Employee check-ins"
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusPill status={sheet.status} />
            {openWindow ? <Badge variant="outline">{openWindow.name}</Badge> : null}
          </div>
        }
        title="Progress Journal"
      />

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_24rem] xl:p-8">
        <div className="space-y-4">
          {sheet.goals.map((goal) => {
            const latest = goal.achievementUpdates[0]

            return (
              <Card className="premium-card" key={goal.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={goal.status} />
                    <Badge variant="secondary">{goal.source}</Badge>
                  </div>
                  <CardTitle className="text-lg tracking-normal">
                    {goalTitle(goal) ?? 'Untitled goal'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar label="Latest progress" value={progressValue(goal.achievementUpdates)} />
                  {latest?.employeeComment ? (
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {latest.employeeComment}
                    </div>
                  ) : null}
                  {openWindow ? (
                    <CheckInForm checkinWindowId={openWindow.id} goalId={goal.id} />
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <aside className="space-y-4">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-[color:var(--chart-1)]" />
                Window cadence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                items={sheet.cycle.checkinWindows.map((window) => ({
                  description: `${window.status.toLowerCase().replaceAll('_', ' ')} from ${window.opensAt.toLocaleDateString()} to ${window.closesAt.toLocaleDateString()}`,
                  meta: `Q${window.sequence}`,
                  title: window.name,
                }))}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
