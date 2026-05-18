import { GoalSheetStatus } from '@prisma/client'
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Gauge,
  Target,
  TrendingUp,
} from 'lucide-react'

import {
  BarList,
  HeatMapGrid,
  SegmentedBar,
  Sparkline,
} from '@/components/app/charts'
import { QualityMeter } from '@/components/app/intelligence-panels'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getManagerOperatingQueue, getStatusCount } from '@/lib/dal/dashboard.dal'
import { analyzeSheet } from '@/lib/goal-intelligence'

export default async function ManagerInsightsPage() {
  const user = await requireUser()
  const { escalations, sheets } = await getManagerOperatingQueue(user.id)
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
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
  const teamHealth =
    sheetViews.length > 0
      ? Math.round(
          sheetViews.reduce(
            (sum, view) => sum + view.intelligence.governanceHealth,
            0,
          ) / sheetViews.length,
        )
      : 0
  const riskGoals = sheetViews.reduce(
    (sum, view) => sum + view.intelligence.highRiskGoals,
    0,
  )
  const healthRows = sheetViews.map(({ intelligence, sheet }) => ({
    cells: [
      intelligence.governanceHealth,
      intelligence.qualityScore,
      intelligence.averageProgress,
      intelligence.highRiskGoals,
      intelligence.missingCheckIns,
    ],
    label: sheet.employee.fullName,
  }))

  return (
    <>
      <PageHeader
        description="Executive-level team analytics for throughput, bottlenecks, risk, and coaching focus."
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
            detail="Escalations and high-risk goals"
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Risk load"
            value={escalations.length + riskGoals}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4" />
                Employee health scoring
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Columns: health, goal quality, progress, high-risk goals, overdue gaps.
              </p>
            </CardHeader>
            <CardContent>
              <HeatMapGrid
                columns={['Health', 'Quality', 'Progress', 'Risk', 'Overdue']}
                rows={healthRows}
              />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Team health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QualityMeter
                detail="Blends goal quality, progress, approval state, and check-in coverage."
                label="Health"
                value={teamHealth}
              />
              <Sparkline
                data={sheetViews.map(({ intelligence, sheet }) => ({
                  label: sheet.employee.fullName,
                  value: intelligence.governanceHealth,
                }))}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Goal lifecycle funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <SegmentedBar
                data={[
                  { label: 'Draft', value: drafts },
                  { label: 'Under review', value: submitted },
                  { label: 'Returned', value: returned },
                  { label: 'Locked', value: locked },
                ]}
              />
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
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Throughput pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline
                data={sheetViews.map(({ intelligence, sheet }) => ({
                  label: sheet.employee.fullName,
                  value: intelligence.stageProgress,
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
