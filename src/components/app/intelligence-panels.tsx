import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  ShieldAlert,
} from 'lucide-react'

import type {
  GoalIntelligence,
  IntelligenceSeverity,
  IntelligenceSignal,
} from '@/lib/goal-intelligence'
import { cn } from '@/lib/utils'

const severityStyles: Record<
  IntelligenceSeverity,
  {
    icon: typeof Info
    tone: string
  }
> = {
  critical: {
    icon: ShieldAlert,
    tone: 'border-destructive/25 bg-destructive/10 text-destructive',
  },
  info: {
    icon: Info,
    tone: 'border-[color:var(--chart-1)]/25 bg-[color:var(--chart-1)]/10 text-foreground',
  },
  positive: {
    icon: CheckCircle2,
    tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    icon: AlertTriangle,
    tone: 'border-[color:var(--chart-4)]/25 bg-[color:var(--chart-4)]/10 text-foreground',
  },
}

export function QualityMeter({
  detail,
  label = 'Quality score',
  value,
}: {
  detail?: string
  label?: string
  value: number
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium uppercase text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{normalized}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            normalized >= 80 && 'bg-[color:var(--chart-2)]',
            normalized >= 55 && normalized < 80 && 'bg-[color:var(--chart-3)]',
            normalized < 55 && 'bg-[color:var(--chart-4)]',
          )}
          style={{ width: `${normalized}%` }}
        />
      </div>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

export function SignalList({
  emptyLabel = 'No active signals.',
  signals,
}: {
  emptyLabel?: string
  signals: IntelligenceSignal[]
}) {
  if (signals.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <div className="space-y-2">
      {signals.map((signal, index) => {
        const style = severityStyles[signal.severity]
        const Icon = style.icon

        return (
          <div
            className={cn('rounded-lg border p-3', style.tone)}
            key={`${signal.title}-${index}`}
          >
            <div className="flex gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{signal.title}</p>
                <p className="mt-1 text-xs leading-5 opacity-80">{signal.detail}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SmartCriteriaGrid({
  analysis,
}: {
  analysis: GoalIntelligence
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {analysis.smartCriteria.map((item) => (
        <div
          className={cn(
            'rounded-lg border bg-background/70 p-2.5',
            item.state === 'pass' && 'border-emerald-500/25',
            item.state === 'warn' && 'border-[color:var(--chart-4)]/30',
            item.state === 'fail' && 'border-destructive/30',
          )}
          key={item.label}
        >
          <div className="flex items-center gap-1.5">
            <Circle
              className={cn(
                'h-2.5 w-2.5 fill-current',
                item.state === 'pass' && 'text-emerald-500',
                item.state === 'warn' && 'text-[color:var(--chart-4)]',
                item.state === 'fail' && 'text-destructive',
              )}
            />
            <p className="text-xs font-semibold">{item.label}</p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function LifecycleRail({
  active,
  stages,
}: {
  active: string
  stages: Array<{
    key: string
    label: string
  }>
}) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.key === active),
  )

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {stages.map((stage, index) => {
        const isComplete = index < activeIndex
        const isActive = index === activeIndex

        return (
          <div
            className={cn(
              'rounded-lg border bg-background/70 p-3 transition-colors',
              isActive && 'border-[color:var(--chart-1)] bg-[color:var(--chart-1)]/10',
              isComplete && 'border-emerald-500/25 bg-emerald-500/10',
            )}
            key={stage.key}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold',
                  isActive && 'border-[color:var(--chart-1)] text-foreground',
                  isComplete && 'border-emerald-500 bg-emerald-500 text-white',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
              </span>
              <span className="text-xs font-medium">{stage.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
