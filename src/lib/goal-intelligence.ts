import { GoalSheetStatus } from '@prisma/client'

type DecimalLike = number | string | { toString: () => string } | null | undefined

export type IntelligenceSeverity = 'critical' | 'info' | 'positive' | 'warning'

export type IntelligenceSignal = {
  detail: string
  severity: IntelligenceSeverity
  title: string
}

export type GoalUpdateLike = {
  checkinWindow?: {
    name: string
    sequence: number
  } | null
  employeeComment?: string | null
  progressScore?: DecimalLike
  status?: string | null
  submittedAt?: Date | null
}

export type GoalLike = {
  achievementUpdates?: GoalUpdateLike[]
  description?: string | null
  direction?: string | null
  id?: string
  source?: string | null
  status?: string | null
  targetDate?: Date | null
  targetNumeric?: DecimalLike
  thrustArea?: string | null
  title?: string | null
  uomType?: string | null
  weightage?: DecimalLike
}

export type CheckinWindowLike = {
  closesAt: Date
  name: string
  opensAt: Date
  sequence: number
  status: string
}

export type SheetLike = {
  approvedAt?: Date | null
  cycle?: {
    checkinWindows?: CheckinWindowLike[]
    endsAt?: Date
    startsAt?: Date
  }
  goals: GoalLike[]
  returnedAt?: Date | null
  status: GoalSheetStatus
  submittedAt?: Date | null
  updatedAt?: Date
}

export type GoalIntelligence = {
  duplicate: boolean
  latestProgress: number
  qualityScore: number
  recommendations: string[]
  riskLevel: 'high' | 'low' | 'medium'
  riskScore: number
  signals: IntelligenceSignal[]
  smartCriteria: Array<{
    detail: string
    label: string
    state: 'fail' | 'pass' | 'warn'
  }>
}

export type SheetIntelligence = {
  averageProgress: number
  completedGoals: number
  cycleProgress: number
  goalAnalyses: GoalIntelligence[]
  governanceHealth: number
  highRiskGoals: number
  latestCheckInAt: Date | null
  missingCheckIns: number
  nextWindow: CheckinWindowLike | null
  openWindow: CheckinWindowLike | null
  qualityScore: number
  signals: IntelligenceSignal[]
  stageProgress: number
  streak: number
  totalWeightage: number
  weightageValid: boolean
}

const VAGUE_TERMS = [
  'assist',
  'better',
  'drive',
  'enable',
  'enhance',
  'help',
  'improve',
  'optimize',
  'own',
  'support',
  'work on',
]

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

export function toNumber(value: DecimalLike, fallback = 0) {
  if (value === null || value === undefined) return fallback

  const numeric = Number(value.toString())

  return Number.isFinite(numeric) ? numeric : fallback
}

export function latestProgress(goal: GoalLike) {
  return toNumber(goal.achievementUpdates?.[0]?.progressScore)
}

export function formatStatusLabel(status: string) {
  return status.toLowerCase().replaceAll('_', ' ')
}

function hasTarget(goal: GoalLike) {
  return goal.targetNumeric !== null && goal.targetNumeric !== undefined
    ? true
    : Boolean(goal.targetDate)
}

function hasVagueLanguage(goal: GoalLike) {
  const text = `${goal.title ?? ''} ${goal.description ?? ''}`.toLowerCase()
  const hasVagueTerm = VAGUE_TERMS.some((term) => text.includes(term))
  const hasNumber = /\d/.test(text) || hasTarget(goal)

  return hasVagueTerm && !hasNumber
}

function titleKey(goal: GoalLike) {
  return (goal.title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function duplicateTitle(goal: GoalLike, allGoals: GoalLike[]) {
  const key = titleKey(goal)

  if (!key) return false

  return allGoals.filter((candidate) => titleKey(candidate) === key).length > 1
}

function criterion(
  label: string,
  condition: boolean,
  warningCondition: boolean,
  passDetail: string,
  warnDetail: string,
  failDetail: string,
) {
  if (condition) {
    return {
      detail: passDetail,
      label,
      state: 'pass' as const,
    }
  }

  if (warningCondition) {
    return {
      detail: warnDetail,
      label,
      state: 'warn' as const,
    }
  }

  return {
    detail: failDetail,
    label,
    state: 'fail' as const,
  }
}

export function analyzeGoal(
  goal: GoalLike,
  allGoals: GoalLike[] = [],
  options: {
    cycleEndsAt?: Date
    now?: Date
  } = {},
): GoalIntelligence {
  const now = options.now ?? new Date()
  const titleLength = goal.title?.trim().length ?? 0
  const descriptionLength = goal.description?.trim().length ?? 0
  const weightage = toNumber(goal.weightage)
  const progress = latestProgress(goal)
  const duplicate = duplicateTitle(goal, allGoals)
  const targetExists = hasTarget(goal)
  const vague = hasVagueLanguage(goal)
  const targetDateOverdue = goal.targetDate ? goal.targetDate < now && progress < 100 : false
  const hasMetricConfig = Boolean(goal.uomType && goal.direction)
  const hasRelevantArea = Boolean(goal.thrustArea || goal.source === 'SHARED')
  const hasReasonableWeight = weightage >= 10 && weightage <= 45
  const timeBound = Boolean(goal.targetDate || options.cycleEndsAt)

  const smartCriteria = [
    criterion(
      'Specific',
      titleLength >= 12 && descriptionLength >= 45 && !vague,
      titleLength >= 8 || descriptionLength >= 30,
      'Clear business outcome and context.',
      'Readable, but could use sharper scope.',
      'Needs a specific outcome and context.',
    ),
    criterion(
      'Measurable',
      targetExists && hasMetricConfig,
      targetExists || hasMetricConfig,
      'Metric, direction, and target are defined.',
      'Metric exists but the target model is incomplete.',
      'Missing a measurable target or direction.',
    ),
    criterion(
      'Achievable',
      hasReasonableWeight && !targetDateOverdue,
      weightage > 0 && !targetDateOverdue,
      'Weightage and timing look realistic.',
      'Weightage is valid but may need calibration.',
      'Target, timing, or weightage looks risky.',
    ),
    criterion(
      'Relevant',
      hasRelevantArea,
      Boolean(goal.source),
      'Mapped to a business thrust area.',
      'Source is known, but business area is weak.',
      'Business relevance is not explicit.',
    ),
    criterion(
      'Time-bound',
      timeBound,
      Boolean(options.cycleEndsAt),
      'Tied to a target date or active cycle.',
      'Cycle bound, but no goal-level milestone.',
      'No timing boundary is visible.',
    ),
  ]

  let qualityScore = 100
  const signals: IntelligenceSignal[] = []
  const recommendations: string[] = []

  if (titleLength === 0) {
    qualityScore -= 24
    signals.push({
      detail: 'A reviewer cannot understand ownership or business intent without a title.',
      severity: 'critical',
      title: 'Missing goal title',
    })
  } else if (titleLength < 12) {
    qualityScore -= 10
    recommendations.push('Make the goal title outcome-oriented and specific.')
  }

  if (descriptionLength === 0) {
    qualityScore -= 14
    recommendations.push('Add context that explains the business outcome and scope.')
  } else if (descriptionLength < 45) {
    qualityScore -= 7
    recommendations.push('Expand the description with scope, owner action, and expected result.')
  }

  if (vague) {
    qualityScore -= 10
    signals.push({
      detail: 'The wording reads directional but not accountable. Add a metric or explicit target.',
      severity: 'warning',
      title: 'Vague goal language',
    })
  }

  if (!targetExists) {
    qualityScore -= 18
    signals.push({
      detail: 'Every enterprise goal should define how success is measured.',
      severity: 'critical',
      title: 'Missing target',
    })
  }

  if (!hasMetricConfig) {
    qualityScore -= 8
    recommendations.push('Set a unit of measure and direction so progress can be interpreted.')
  }

  if (!hasRelevantArea) {
    qualityScore -= 8
    recommendations.push('Connect the goal to a thrust area or shared business priority.')
  }

  if (!hasReasonableWeight) {
    qualityScore -= 10
    signals.push({
      detail: `Current weightage is ${weightage}%. Goals above 45% create concentration risk.`,
      severity: 'warning',
      title: 'Weightage concentration',
    })
  }

  if (duplicate) {
    qualityScore -= 12
    signals.push({
      detail: 'Another goal on this sheet has the same KPI wording. Consolidate or differentiate ownership.',
      severity: 'warning',
      title: 'Duplicate KPI warning',
    })
  }

  if (targetDateOverdue) {
    qualityScore -= 12
    signals.push({
      detail: 'The target date is in the past and the latest progress is not complete.',
      severity: 'critical',
      title: 'Overdue target',
    })
  }

  if (progress >= 100) {
    signals.push({
      detail: 'The latest check-in marks this KPI complete.',
      severity: 'positive',
      title: 'Completion captured',
    })
  } else if (progress > 0 && progress < 35) {
    signals.push({
      detail: `Latest progress is ${Math.round(progress)}%. This may need coaching before the next review.`,
      severity: 'warning',
      title: 'Slow progress',
    })
  }

  const normalizedQuality = clamp(Math.round(qualityScore))
  const riskScore =
    (100 - normalizedQuality) * 0.55 +
    (progress < 30 ? 22 : progress < 60 ? 10 : 0) +
    (duplicate ? 12 : 0) +
    (targetDateOverdue ? 18 : 0)
  const normalizedRisk = clamp(Math.round(riskScore))

  return {
    duplicate,
    latestProgress: progress,
    qualityScore: normalizedQuality,
    recommendations: recommendations.slice(0, 3),
    riskLevel:
      normalizedRisk >= 55 ? 'high' : normalizedRisk >= 28 ? 'medium' : 'low',
    riskScore: normalizedRisk,
    signals:
      signals.length > 0
        ? signals
        : [
            {
              detail: 'No material quality or risk issues detected for this goal.',
              severity: 'positive',
              title: 'Governance ready',
            },
          ],
    smartCriteria,
  }
}

function statusProgress(status: GoalSheetStatus) {
  switch (status) {
    case GoalSheetStatus.DRAFT:
      return 24
    case GoalSheetStatus.RETURNED:
      return 38
    case GoalSheetStatus.SUBMITTED:
      return 62
    case GoalSheetStatus.ADMIN_UNLOCKED:
      return 70
    case GoalSheetStatus.APPROVED_LOCKED:
      return 100
    case GoalSheetStatus.ARCHIVED:
      return 100
    default:
      return 0
  }
}

export function analyzeSheet(
  sheet: SheetLike,
  options: {
    now?: Date
  } = {},
): SheetIntelligence {
  const now = options.now ?? new Date()
  const windows = sheet.cycle?.checkinWindows ?? []
  const openWindow =
    windows.find((window) => window.status === 'OPEN') ??
    windows.find((window) => window.opensAt <= now && window.closesAt >= now) ??
    null
  const nextWindow =
    windows.find((window) => window.opensAt >= now) ??
    openWindow ??
    windows[windows.length - 1] ??
    null
  const totalWeightage = sheet.goals.reduce(
    (sum, goal) => sum + toNumber(goal.weightage),
    0,
  )
  const goalAnalyses = sheet.goals.map((goal) =>
    analyzeGoal(goal, sheet.goals, {
      cycleEndsAt: sheet.cycle?.endsAt,
      now,
    }),
  )
  const averageProgress =
    goalAnalyses.length > 0
      ? goalAnalyses.reduce((sum, goal) => sum + goal.latestProgress, 0) /
        goalAnalyses.length
      : sheet.status === GoalSheetStatus.APPROVED_LOCKED
        ? 100
        : 0
  const qualityScore =
    goalAnalyses.length > 0
      ? goalAnalyses.reduce((sum, goal) => sum + goal.qualityScore, 0) /
        goalAnalyses.length
      : 0
  const closedWindows = windows.filter((window) => window.closesAt < now)
  const missingCheckIns = sheet.goals.reduce((sum, goal) => {
    const completedSequences = new Set(
      (goal.achievementUpdates ?? [])
        .map((update) => update.checkinWindow?.sequence)
        .filter((sequence): sequence is number => typeof sequence === 'number'),
    )

    return (
      sum +
      closedWindows.filter((window) => !completedSequences.has(window.sequence))
        .length
    )
  }, 0)
  const updatedWindowSequences = new Set(
    sheet.goals.flatMap((goal) =>
      (goal.achievementUpdates ?? [])
        .map((update) => update.checkinWindow?.sequence)
        .filter((sequence): sequence is number => typeof sequence === 'number'),
    ),
  )
  const latestCheckInAt =
    sheet.goals
      .flatMap((goal) => goal.achievementUpdates ?? [])
      .map((update) => update.submittedAt)
      .filter((date): date is Date => Boolean(date))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null
  const cycleProgress =
    sheet.cycle?.startsAt && sheet.cycle.endsAt
      ? clamp(
          Math.round(
            ((now.getTime() - sheet.cycle.startsAt.getTime()) /
              (sheet.cycle.endsAt.getTime() - sheet.cycle.startsAt.getTime())) *
              100,
          ),
        )
      : 0
  const highRiskGoals = goalAnalyses.filter(
    (goal) => goal.riskLevel === 'high',
  ).length
  const completedGoals = goalAnalyses.filter(
    (goal) => goal.latestProgress >= 100,
  ).length
  const weightageValid = Math.abs(totalWeightage - 100) < 0.001
  const governanceHealth = clamp(
    Math.round(
      qualityScore * 0.45 +
        averageProgress * 0.25 +
        statusProgress(sheet.status) * 0.2 +
        (weightageValid ? 10 : 0) -
        highRiskGoals * 5 -
        missingCheckIns * 2,
    ),
  )
  const signals: IntelligenceSignal[] = []

  if (!weightageValid) {
    signals.push({
      detail: `Total weightage is ${totalWeightage}%. Submission requires exactly 100%.`,
      severity: 'critical',
      title: 'Weightage imbalance',
    })
  }

  if (highRiskGoals > 0) {
    signals.push({
      detail: `${highRiskGoals} goal${highRiskGoals === 1 ? '' : 's'} need manager-quality review.`,
      severity: 'warning',
      title: 'High-risk goals detected',
    })
  }

  if (missingCheckIns > 0) {
    signals.push({
      detail: `${missingCheckIns} expected check-in${missingCheckIns === 1 ? '' : 's'} are missing from closed windows.`,
      severity: 'warning',
      title: 'Check-in coverage gap',
    })
  }

  if (sheet.status === GoalSheetStatus.SUBMITTED) {
    signals.push({
      detail: 'The next accountable owner is the manager. Approval or return should happen before the review SLA slips.',
      severity: 'info',
      title: 'Manager decision pending',
    })
  }

  if (sheet.status === GoalSheetStatus.APPROVED_LOCKED) {
    signals.push({
      detail: 'Goals are locked and execution updates are now the main operating signal.',
      severity: 'positive',
      title: 'Execution mode active',
    })
  }

  return {
    averageProgress: Math.round(averageProgress),
    completedGoals,
    cycleProgress,
    goalAnalyses,
    governanceHealth,
    highRiskGoals,
    latestCheckInAt,
    missingCheckIns,
    nextWindow,
    openWindow,
    qualityScore: Math.round(qualityScore),
    signals:
      signals.length > 0
        ? signals
        : [
            {
              detail: 'The sheet is balanced, measurable, and ready for the next governance step.',
              severity: 'positive',
              title: 'No active governance gaps',
            },
          ],
    stageProgress: statusProgress(sheet.status),
    streak: updatedWindowSequences.size,
    totalWeightage,
    weightageValid,
  }
}
