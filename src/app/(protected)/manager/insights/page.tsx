import { GoalSheetStatus } from '@prisma/client'
import { BarChart3, Clock3, Target, TrendingUp } from 'lucide-react'

import { BarList, Sparkline } from '@/components/app/charts'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getManagerOperatingQueue, getStatusCount } from '@/lib/dal/dashboard.dal'

export default async function ManagerInsightsPage() {
  const user = await requireUser()
  const { escalations, sheets } = await getManagerOperatingQueue(user.id)
  const locked = getStatusCount(sheets, GoalSheetStatus.APPROVED_LOCKED)
  const submitted = getStatusCount(sheets, GoalSheetStatus.SUBMITTED)
  const drafts = getStatusCount(sheets, GoalSheetStatus.DRAFT)
  const returned = getStatusCount(sheets, GoalSheetStatus.RETURNED)
  const averageGoals =
    sheets.length > 0
      ? Math.round(
          sheets.reduce((sum, sheet) => sum + sheet.goals.length, 0) / sheets.length,
        )
      : 0

  return (
    <>
      <PageHeader
        description="Executive-level team analytics for throughput, bottlenecks, and coaching focus."
        eyebrow="Manager intelligence"
        meta={<Badge variant="outline">{sheets.length} people in scope</Badge>}
        title="Team Insights"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Approved sheets"
            icon={<Target className="h-4 w-4" />}
            label="Locked"
            value={locked}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Awaiting manager action"
            icon={<Clock3 className="h-4 w-4" />}
            label="Under review"
            value={submitted}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Average active goals"
            icon={<BarChart3 className="h-4 w-4" />}
            label="Goal load"
            value={averageGoals}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Open warnings"
            icon={<TrendingUp className="h-4 w-4" />}
            label="Escalations"
            value={escalations.length}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Goal lifecycle funnel</CardTitle>
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

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Throughput pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline
                data={sheets.map((sheet) => ({
                  label: sheet.employee.fullName,
                  value:
                    sheet.status === GoalSheetStatus.APPROVED_LOCKED
                      ? 100
                      : sheet.status === GoalSheetStatus.SUBMITTED
                        ? 65
                        : sheet.status === GoalSheetStatus.RETURNED
                          ? 35
                          : 15,
                }))}
              />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The pulse converts real sheet status into a comparable operating signal for the current team.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
