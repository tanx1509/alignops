import Link from 'next/link'
import {
  Activity,
  Download,
  FileSpreadsheet,
  Gauge,
  Target,
  TrendingUp,
} from 'lucide-react'

import { BarList, HeatMapGrid, SegmentedBar, Sparkline } from '@/components/app/charts'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'
import {
  analyzeSheet,
  goalThrustArea,
  goalUomType,
  latestProgress,
  toNumber,
} from '@/lib/goal-intelligence'

function average(values: number[]) {
  return values.length > 0
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0
}

export default async function AdminReportsPage() {
  const { sheets } = await getAdminControlTower()
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
  const goalViews = sheetViews
    .flatMap(({ intelligence, sheet }) =>
      sheet.goals.map((goal, index) => {
        const analysis = intelligence.goalAnalyses[index]

        return analysis
          ? {
              analysis,
              goal,
              sheet,
            }
          : null
      }),
    )
    .filter((view): view is NonNullable<typeof view> => view !== null)
  const completion = average(
    sheetViews.map((view) => view.intelligence.averageProgress),
  )
  const governance = average(
    sheetViews.map((view) => view.intelligence.governanceHealth),
  )
  const risk = average(
    sheetViews.map((view) => view.intelligence.executionRiskScore),
  )
  const confidence = average(
    sheetViews.map((view) => view.intelligence.kpiConfidence),
  )
  const uomDistribution = Array.from(
    goalViews.reduce((map, { goal }) => {
      const key = goalUomType(goal) ?? 'UNMAPPED'

      map.set(key, (map.get(key) ?? 0) + 1)

      return map
    }, new Map<string, number>()),
  ).map(([label, value]) => ({
    label: label.toLowerCase().replaceAll('_', ' '),
    value,
  }))
  const thrustAreaRows = Array.from(
    goalViews.reduce((map, { analysis, goal }) => {
      const key = goalThrustArea(goal) ?? 'Unmapped'
      const current = map.get(key) ?? {
        confidence: [] as number[],
        goals: 0,
        progress: [] as number[],
        risk: 0,
        weight: 0,
      }

      current.confidence.push(analysis.kpiConfidence)
      current.goals += 1
      current.progress.push(latestProgress(goal))
      current.risk += analysis.riskLevel === 'high' ? 1 : 0
      current.weight += toNumber(goal.weightage)
      map.set(key, current)

      return map
    }, new Map<string, {
      confidence: number[]
      goals: number
      progress: number[]
      risk: number
      weight: number
    }>()),
  ).map(([label, value]) => ({
    cells: [
      value.goals,
      Math.round(value.weight),
      average(value.confidence),
      average(value.progress),
      value.risk,
    ],
    label,
  }))
  const windows = sheetViews[0]?.sheet.cycle.checkinWindows ?? []
  const windowProgress = windows.map((window) => {
    const updates = sheetViews.flatMap(({ sheet }) =>
      sheet.goals.flatMap((goal) =>
        goal.achievementUpdates.filter(
          (update) => update.checkinWindow?.sequence === window.sequence,
        ),
      ),
    )

    return {
      label: window.name,
      value: average(
        updates.map((update) => toNumber(update.progressScore)),
      ),
    }
  })
  const lifecycleDistribution = [
    {
      label: 'Draft',
      value: sheets.filter((sheet) => sheet.status === 'DRAFT').length,
    },
    {
      label: 'Under review',
      value: sheets.filter((sheet) => sheet.status === 'SUBMITTED').length,
    },
    {
      label: 'Returned',
      value: sheets.filter((sheet) => sheet.status === 'RETURNED').length,
    },
    {
      label: 'Locked',
      value: sheets.filter((sheet) => sheet.status === 'APPROVED_LOCKED').length,
    },
  ]

  return (
    <>
      <PageHeader
        actions={
          <Link
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            href="/api/reports/governance.csv"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Link>
        }
        description="Downloadable governance reporting, completion analytics, thrust-area analysis, UoM distribution, and cycle trend signals."
        eyebrow="Reporting"
        meta={<Badge variant="outline">{goalViews.length} governed KPIs</Badge>}
        title="Analytics and Reports"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Average latest progress"
            icon={<Activity className="h-4 w-4" />}
            label="Completion trend"
            value={`${completion}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Average governance health"
            icon={<Gauge className="h-4 w-4" />}
            label="Org health"
            value={`${governance}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="SMART and target confidence"
            icon={<Target className="h-4 w-4" />}
            label="KPI confidence"
            value={`${confidence}%`}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Lower is better"
            icon={<TrendingUp className="h-4 w-4" />}
            label="Execution risk"
            value={`${risk}%`}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="h-4 w-4" />
                Thrust-area analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Columns: goals, weight, confidence, progress, high-risk KPIs.
              </p>
            </CardHeader>
            <CardContent>
              <HeatMapGrid
                columns={['Goals', 'Weight', 'Conf.', 'Progress', 'Risk']}
                rows={thrustAreaRows}
              />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">UoM distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BarList data={uomDistribution} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">QoQ completion trend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Sparkline data={windowProgress} />
              <BarList data={windowProgress} max={100} />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Lifecycle distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SegmentedBar data={lifecycleDistribution} />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
