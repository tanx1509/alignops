import type { ReactNode } from 'react'
import { Activity, Gauge, Radar, ShieldCheck, TrendingUp } from 'lucide-react'

import { QualityMeter } from '@/components/app/intelligence-panels'
import { ProgressBar, ProgressRing } from '@/components/app/progress-ring'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ExecutionHealthPanel({
  confidence,
  cycleProgress,
  forecastDetail,
  forecastLabel,
  momentum,
  riskScore,
  score,
  stageProgress,
  title = 'Execution health engine',
}: {
  confidence: number
  cycleProgress: number
  forecastDetail: string
  forecastLabel: string
  momentum: string
  riskScore: number
  score: number
  stageProgress: number
  title?: string
}) {
  const posture =
    riskScore >= 60 ? 'critical' : riskScore >= 34 ? 'watch' : 'controlled'

  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-[color:var(--chart-1)]" />
              {title}
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Deterministic scoring across quality, progress, lifecycle, SLA, and workload signals.
            </p>
          </div>
          <Badge
            variant={
              posture === 'critical'
                ? 'destructive'
                : posture === 'watch'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {posture} posture
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[12rem_1fr]">
        <div className="flex items-center justify-center rounded-lg border bg-background/70 p-4">
          <ProgressRing label="Health" size="lg" value={score} />
        </div>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <QualityMeter
              detail="Likelihood that the KPI set is measurable and actionable."
              label="KPI confidence"
              value={confidence}
            />
            <QualityMeter
              detail="Inverse of execution risk; lower control means intervention is more likely."
              label="Risk control"
              value={100 - riskScore}
            />
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[color:var(--chart-2)]" />
                <p className="text-sm font-medium">{momentum}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Momentum compares progress, cycle elapsed time, and check-in coverage.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ProgressBar label="Cycle elapsed" value={cycleProgress} />
            <ProgressBar label="Workflow maturity" value={stageProgress} />
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[color:var(--chart-1)]" />
              <p className="text-sm font-medium">{forecastLabel}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{forecastDetail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuarterlyTimeline({
  items,
}: {
  items: Array<{
    detail: string
    label: string
    state: 'closed' | 'current' | 'future'
  }>
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <div
          className={cn(
            'rounded-lg border bg-background/70 p-3 transition-colors',
            item.state === 'current' &&
              'border-[color:var(--chart-1)] bg-[color:var(--chart-1)]/10',
            item.state === 'closed' && 'border-emerald-500/25 bg-emerald-500/10',
          )}
          key={`${item.label}-${index}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                item.state === 'closed' && 'border-emerald-500 bg-emerald-500 text-white',
                item.state === 'current' && 'border-[color:var(--chart-1)] text-foreground',
              )}
            >
              {item.state === 'closed' ? <ShieldCheck className="h-3 w-3" /> : index + 1}
            </span>
            <p className="text-xs font-semibold">{item.label}</p>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function DecisionPanel({
  children,
  icon,
  label,
  title,
}: {
  children: ReactNode
  icon?: ReactNode
  label?: string
  title: string
}) {
  return (
    <div className="rounded-xl border bg-background/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ?? <Activity className="h-4 w-4 text-muted-foreground" />}
          <p className="text-sm font-medium">{title}</p>
        </div>
        {label ? <Badge variant="outline">{label}</Badge> : null}
      </div>
      {children}
    </div>
  )
}
