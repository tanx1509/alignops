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
  sharedGoalLink?: {
    sharedGoalDefinition?: {
      description?: string | null
      direction?: string | null
      targetDate?: Date | null
      targetNumeric?: DecimalLike
      thrustArea?: string | null
      title?: string | null
      uomType?: string | null
    } | null
  } | null
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
  dependencyWarning: boolean
  duplicate: boolean
  forecast: {
    confidence: number
    detail: string
    label: string
  }
  kpiConfidence: number
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
  unrealisticTarget: boolean
}

export type SheetIntelligence = {
  averageProgress: number
  approvalSlaDays: number
  checkinHealthScore: number
  completedGoals: number
  cycleProgress: number
  delayedSubmission: boolean
  delayedSubmissionDays: number
  executionRiskScore: number
  forecast: {
    confidence: number
    detail: string
    label: string
  }
  goalAnalyses: GoalIntelligence[]
  governanceHealth: number
  highRiskGoals: number
  kpiConfidence: number
  likelyToFailGoals: number
  latestCheckInAt: Date | null
  missingCheckIns: number
  momentumLabel: string
  nextWindow: CheckinWindowLike | null
  openWindow: CheckinWindowLike | null
  qualityScore: number
  riskPosture: 'controlled' | 'critical' | 'watch'
  signals: IntelligenceSignal[]
  stageProgress: number
  streak: number
  totalWeightage: number
  workloadBalanceScore: number
  workloadImbalance: boolean
  weightageValid: boolean
}

const VAGUE_TERMS = [
  'align',
  'assist',
  'better',
  'collaborate',
  'coordinate',
  'drive',
  'enable',
  'enhance',
  'help out',
  'help',
  'improve',
  'leverage',
  'monitor',
  'optimize',
  'own',
  'participate',
  'streamline',
  'support',
  'synergy',
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

export function goalTitle(goal: GoalLike) {
  return goal.title ?? goal.sharedGoalLink?.sharedGoalDefinition?.title ?? null
}

export function goalDescription(goal: GoalLike) {
  return (
    goal.description ??
    goal.sharedGoalLink?.sharedGoalDefinition?.description ??
    null
  )
}

export function goalThrustArea(goal: GoalLike) {
  return goal.thrustArea ?? goal.sharedGoalLink?.sharedGoalDefinition?.thrustArea ?? null
}

export function goalUomType(goal: GoalLike) {
  return goal.uomType ?? goal.sharedGoalLink?.sharedGoalDefinition?.uomType ?? null
}

export function goalDirection(goal: GoalLike) {
  return goal.direction ?? goal.sharedGoalLink?.sharedGoalDefinition?.direction ?? null
}

export function goalTargetNumeric(goal: GoalLike) {
  return (
    goal.targetNumeric ??
    goal.sharedGoalLink?.sharedGoalDefinition?.targetNumeric ??
    null
  )
}

export function goalTargetDate(goal: GoalLike) {
  return goal.targetDate ?? goal.sharedGoalLink?.sharedGoalDefinition?.targetDate ?? null
}

export function formatStatusLabel(status: string) {
  return status.toLowerCase().replaceAll('_', ' ')
}

function hasTarget(goal: GoalLike) {
  return goalTargetNumeric(goal) !== null && goalTargetNumeric(goal) !== undefined
    ? true
    : Boolean(goalTargetDate(goal))
}

function hasVagueLanguage(goal: GoalLike) {
  const text = `${goalTitle(goal) ?? ''} ${goalDescription(goal) ?? ''}`.toLowerCase()
  const hasVagueTerm = VAGUE_TERMS.some((term) => text.includes(term))
  const hasNumber = /\d/.test(text) || hasTarget(goal)

  return hasVagueTerm && !hasNumber
}

function titleKey(goal: GoalLike) {
  return (goalTitle(goal) ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function titleTokens(goal: GoalLike) {
  return titleKey(goal)
    .split(' ')
    .filter((token) => token.length > 2)
}

function tokenOverlap(left: string[], right: string[]) {
  if (left.length === 0 || right.length === 0) return 0

  const rightSet = new Set(right)
  const overlap = left.filter((token) => rightSet.has(token)).length

  return overlap / Math.min(left.length, right.length)
}

function duplicateTitle(goal: GoalLike, allGoals: GoalLike[]) {
  const key = titleKey(goal)

  if (!key) return false

  if (allGoals.filter((candidate) => titleKey(candidate) === key).length > 1) {
    return true
  }

  const tokens = titleTokens(goal)

  if (tokens.length < 3) return false

  return allGoals.some((candidate) => {
    if (candidate === goal) return false

    const candidateTokens = titleTokens(candidate)

    return (
      candidateTokens.length >= 3 &&
      tokenOverlap(tokens, candidateTokens) >= 0.82
    )
  })
}

function daysBetween(start: Date | null | undefined, end: Date | null | undefined) {
  if (!start || !end) return 0

  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  )
}

function hasUnrealisticTarget(
  goal: GoalLike,
  options: {
    cycleEndsAt?: Date
    cycleStartsAt?: Date
    now: Date
  },
) {
  const targetNumericExists =
    goalTargetNumeric(goal) !== null && goalTargetNumeric(goal) !== undefined
  const targetNumeric = targetNumericExists ? toNumber(goalTargetNumeric(goal)) : null
  const weightage = toNumber(goal.weightage)
  const targetDate = goalTargetDate(goal)
  const uomType = goalUomType(goal)

  if (
    uomType === 'PERCENTAGE' &&
    targetNumeric !== null &&
    (targetNumeric < 0 || targetNumeric > 100)
  ) {
    return true
  }

  if (
    uomType === 'ZERO_BASED' &&
    targetNumeric !== null &&
    targetNumeric !== 0
  ) {
    return true
  }

  if (targetDate && options.cycleEndsAt && targetDate > options.cycleEndsAt) {
    return true
  }

  if (
    targetDate &&
    options.cycleStartsAt &&
    daysBetween(options.cycleStartsAt, targetDate) < 21 &&
    weightage >= 35
  ) {
    return true
  }

  return weightage > 55
}

function hasDependencyWarning(goal: GoalLike, allGoals: GoalLike[]) {
  const thrustArea = goalThrustArea(goal)?.trim().toLowerCase()

  if (!thrustArea) return false

  const relatedGoals = allGoals.filter(
    (candidate) =>
      candidate !== goal &&
      goalThrustArea(candidate)?.trim().toLowerCase() === thrustArea,
  )

  return goal.source === 'SHARED' && relatedGoals.length > 0 && latestProgress(goal) < 45
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
    cycleProgress?: number
    cycleStartsAt?: Date
    now?: Date
  } = {},
): GoalIntelligence {
  const now = options.now ?? new Date()
  const titleLength = goalTitle(goal)?.trim().length ?? 0
  const descriptionLength = goalDescription(goal)?.trim().length ?? 0
  const weightage = toNumber(goal.weightage)
  const progress = latestProgress(goal)
  const duplicate = duplicateTitle(goal, allGoals)
  const targetExists = hasTarget(goal)
  const vague = hasVagueLanguage(goal)
  const targetDate = goalTargetDate(goal)
  const targetDateOverdue = targetDate ? targetDate < now && progress < 100 : false
  const hasMetricConfig = Boolean(goalUomType(goal) && goalDirection(goal))
  const hasRelevantArea = Boolean(goalThrustArea(goal) || goal.source === 'SHARED')
  const hasReasonableWeight = weightage >= 10 && weightage <= 45
  const timeBound = Boolean(targetDate || options.cycleEndsAt)
  const unrealisticTarget = hasUnrealisticTarget(goal, {
    cycleEndsAt: options.cycleEndsAt,
    cycleStartsAt: options.cycleStartsAt,
    now,
  })
  const dependencyWarning = hasDependencyWarning(goal, allGoals)

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
      hasReasonableWeight && !targetDateOverdue && !unrealisticTarget,
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
      detail: `Current weightage is ${weightage}%. Goals outside the 10-45% band create planning risk.`,
      severity: 'warning',
      title: 'Weightage concentration',
    })
  }

  if (unrealisticTarget) {
    qualityScore -= 12
    signals.push({
      detail: 'The target, timing, or weightage does not look realistic for the current cycle.',
      severity: 'warning',
      title: 'Unrealistic target warning',
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

  if (dependencyWarning) {
    signals.push({
      detail: 'This shared KPI has related individual goals and low early progress. Downstream execution may stall.',
      severity: 'warning',
      title: 'Goal dependency warning',
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
    (targetDateOverdue ? 18 : 0) +
    (unrealisticTarget ? 12 : 0) +
    (dependencyWarning ? 8 : 0)
  const normalizedRisk = clamp(Math.round(riskScore))
  const cycleProgress = options.cycleProgress ?? 0
  const kpiConfidence = clamp(
    Math.round(
      normalizedQuality * 0.62 +
        progress * 0.2 +
        (targetExists ? 8 : 0) +
        (hasMetricConfig ? 6 : 0) +
        (hasRelevantArea ? 4 : 0) -
        normalizedRisk * 0.18,
    ),
  )
  const progressGap = Math.max(0, cycleProgress - progress)
  const forecastConfidence = clamp(
    Math.round(kpiConfidence - progressGap * 0.55 - normalizedRisk * 0.18),
  )
  const forecast =
    progress >= 100
      ? {
          confidence: 100,
          detail: 'Latest check-in marks the KPI complete.',
          label: 'Complete',
        }
      : normalizedRisk >= 55 || progressGap > 20
        ? {
            confidence: forecastConfidence,
            detail: 'Risk score and progress gap indicate a likely miss without intervention.',
            label: 'Likely to miss',
          }
        : normalizedRisk >= 28 || progressGap > 10
          ? {
              confidence: forecastConfidence,
              detail: 'Goal is viable, but it needs active coaching or sharper execution rhythm.',
              label: 'Watchlist',
            }
          : {
              confidence: forecastConfidence,
              detail: 'Quality, target model, and progress are consistent with the cycle.',
              label: 'On track',
            }

  return {
    dependencyWarning,
    duplicate,
    forecast,
    kpiConfidence,
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
    unrealisticTarget,
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
  const goalAnalyses = sheet.goals.map((goal) =>
    analyzeGoal(goal, sheet.goals, {
      cycleEndsAt: sheet.cycle?.endsAt,
      cycleProgress,
      cycleStartsAt: sheet.cycle?.startsAt,
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
  const highRiskGoals = goalAnalyses.filter(
    (goal) => goal.riskLevel === 'high',
  ).length
  const likelyToFailGoals = goalAnalyses.filter(
    (goal) => goal.forecast.label === 'Likely to miss',
  ).length
  const completedGoals = goalAnalyses.filter(
    (goal) => goal.latestProgress >= 100,
  ).length
  const weightageValid = Math.abs(totalWeightage - 100) < 0.001
  const expectedCheckIns = sheet.goals.length * closedWindows.length
  const checkinHealthScore =
    expectedCheckIns > 0
      ? clamp(Math.round(100 - (missingCheckIns / expectedCheckIns) * 100))
      : latestCheckInAt
        ? 90
        : sheet.status === GoalSheetStatus.APPROVED_LOCKED
          ? 72
          : 100
  const submittedAt = sheet.submittedAt ?? null
  const delayedSubmissionDays =
    sheet.cycle?.startsAt && submittedAt
      ? daysBetween(sheet.cycle.startsAt, submittedAt)
      : sheet.cycle?.startsAt && !submittedAt
        ? daysBetween(sheet.cycle.startsAt, now)
        : 0
  const delayedSubmission =
    sheet.status === GoalSheetStatus.DRAFT
      ? delayedSubmissionDays > 10
      : Boolean(submittedAt && delayedSubmissionDays > 14)
  const approvalSlaDays =
    sheet.status === GoalSheetStatus.SUBMITTED && submittedAt
      ? daysBetween(submittedAt, now)
      : 0
  const goalCount = sheet.goals.length
  const maxWeightage = sheet.goals.reduce(
    (max, goal) => Math.max(max, toNumber(goal.weightage)),
    0,
  )
  const minWeightage =
    sheet.goals.length > 0
      ? sheet.goals.reduce(
          (min, goal) => Math.min(min, toNumber(goal.weightage)),
          100,
        )
      : 0
  const workloadBalanceScore = clamp(
    Math.round(
      100 -
        Math.abs(goalCount - 4) * 8 -
        (maxWeightage > 45 ? 20 : 0) -
        (minWeightage > 0 && minWeightage < 10 ? 15 : 0) -
        (weightageValid ? 0 : 25),
    ),
  )
  const workloadImbalance = workloadBalanceScore < 72
  const kpiConfidence =
    goalAnalyses.length > 0
      ? Math.round(
          goalAnalyses.reduce((sum, goal) => sum + goal.kpiConfidence, 0) /
            goalAnalyses.length,
        )
      : 0
  const governanceHealth = clamp(
    Math.round(
      qualityScore * 0.36 +
        averageProgress * 0.2 +
        statusProgress(sheet.status) * 0.18 +
        checkinHealthScore * 0.12 +
        workloadBalanceScore * 0.09 +
        (weightageValid ? 5 : 0) -
        highRiskGoals * 5 -
        missingCheckIns * 2 -
        (delayedSubmission ? 4 : 0),
    ),
  )
  const progressGap = Math.max(0, cycleProgress - averageProgress)
  const executionRiskScore = clamp(
    Math.round(
      highRiskGoals * 18 +
        likelyToFailGoals * 14 +
        missingCheckIns * 7 +
        (100 - qualityScore) * 0.28 +
        progressGap * 0.45 +
        (delayedSubmission ? 16 : 0) +
        (approvalSlaDays > 5 ? 14 : approvalSlaDays > 3 ? 8 : 0) +
        (workloadImbalance ? 10 : 0),
    ),
  )
  const riskPosture =
    executionRiskScore >= 60
      ? 'critical'
      : executionRiskScore >= 34
        ? 'watch'
        : 'controlled'
  const momentumLabel =
    missingCheckIns > 0 || progressGap > 15
      ? 'Slipping'
      : averageProgress >= cycleProgress + 12 || completedGoals > 0
        ? 'Accelerating'
        : 'Steady'
  const forecast =
    likelyToFailGoals > 0
      ? {
          confidence: clamp(100 - executionRiskScore),
          detail: `${likelyToFailGoals} KPI${likelyToFailGoals === 1 ? '' : 's'} need intervention before the next operating review.`,
          label: 'Corrective action likely',
        }
      : delayedSubmission || approvalSlaDays > 5
        ? {
            confidence: clamp(100 - executionRiskScore),
            detail: 'Governance timing is the main risk even though execution may still recover.',
            label: 'Governance delay risk',
          }
        : averageProgress >= cycleProgress || sheet.status === GoalSheetStatus.APPROVED_LOCKED
          ? {
              confidence: clamp(Math.round(kpiConfidence * 0.7 + governanceHealth * 0.3)),
              detail: 'Current quality, progress, and lifecycle state are consistent with the cycle.',
              label: 'On-track operating plan',
            }
          : {
              confidence: clamp(100 - executionRiskScore),
              detail: 'Execution can recover, but the next check-in needs evidence of movement.',
              label: 'Watchlist',
            }
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

  if (delayedSubmission) {
    signals.push({
      detail: `Goal submission is ${delayedSubmissionDays} days from cycle start, outside the governance expectation.`,
      severity: sheet.status === GoalSheetStatus.DRAFT ? 'critical' : 'warning',
      title: 'Delayed submission signal',
    })
  }

  if (approvalSlaDays > 3) {
    signals.push({
      detail: `This sheet has waited ${approvalSlaDays} days for a manager decision.`,
      severity: approvalSlaDays > 5 ? 'warning' : 'info',
      title: 'Approval SLA aging',
    })
  }

  if (workloadImbalance) {
    signals.push({
      detail: 'Goal count or weightage distribution may create execution imbalance.',
      severity: 'warning',
      title: 'Workload imbalance',
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
    approvalSlaDays,
    checkinHealthScore,
    completedGoals,
    cycleProgress,
    delayedSubmission,
    delayedSubmissionDays,
    executionRiskScore,
    forecast,
    goalAnalyses,
    governanceHealth,
    highRiskGoals,
    kpiConfidence,
    likelyToFailGoals,
    latestCheckInAt,
    missingCheckIns,
    momentumLabel,
    nextWindow,
    openWindow,
    qualityScore: Math.round(qualityScore),
    riskPosture,
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
    workloadBalanceScore,
    workloadImbalance,
    weightageValid,
  }
}
