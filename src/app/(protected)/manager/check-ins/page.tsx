import { MessageSquareText } from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { ProgressBar } from '@/components/app/progress-ring'
import { StatusPill } from '@/components/app/status-pill'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getManagerOperatingQueue } from '@/lib/dal/dashboard.dal'
import { goalTitle } from '@/lib/goal-intelligence'

function latestProgress(
  updates: Array<{
    employeeComment: string | null
    progressScore: { toString: () => string } | null
    status: string
  }>,
) {
  const latest = updates[0]

  return {
    comment: latest?.employeeComment ?? null,
    score: latest?.progressScore ? Number(latest.progressScore.toString()) : 0,
    status: latest?.status ?? 'NOT_STARTED',
  }
}

export default async function ManagerCheckInsPage() {
  const user = await requireUser()
  const { sheets } = await getManagerOperatingQueue(user.id)
  const goals = sheets.flatMap((sheet) =>
    sheet.goals.map((goal) => ({
      employee: sheet.employee,
      goal,
      sheet,
    })),
  )

  return (
    <>
      <PageHeader
        description="A weekly operating layer for blocker detection, achievement signals, and manager coaching."
        eyebrow="Manager check-ins"
        meta={<Badge variant="outline">{goals.length} goal signals</Badge>}
        title="Team Progress Review"
      />

      <div className="p-5 xl:p-8">
        {goals.length === 0 ? (
          <EmptyState
            description="Once your team submits goals and check-ins, this view becomes a live coaching queue."
            icon={<MessageSquareText className="h-5 w-5" />}
            title="No check-in signals yet"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {goals.map(({ employee, goal, sheet }) => {
              const progress = latestProgress(goal.achievementUpdates)

              return (
                <Card className="premium-card" key={goal.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={progress.status} />
                      <Badge variant="outline">{sheet.orgUnit?.name ?? 'Org unit'}</Badge>
                    </div>
                    <CardTitle className="text-lg tracking-normal">
                      {employee.fullName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{goalTitle(goal) ?? 'Untitled goal'}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProgressBar label="Latest employee progress" value={progress.score} />
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {progress.comment ?? 'No employee note captured for this goal yet.'}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
