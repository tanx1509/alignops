import { GoalSheetStatus } from '@prisma/client'

import { StateTransitionError } from '@/lib/errors/domain.errors'

const VALID_TRANSITIONS: Readonly<
  Record<GoalSheetStatus, readonly GoalSheetStatus[]>
> = {
  [GoalSheetStatus.DRAFT]: [
    GoalSheetStatus.SUBMITTED,
    GoalSheetStatus.ARCHIVED,
  ],

  [GoalSheetStatus.SUBMITTED]: [
    GoalSheetStatus.RETURNED,
    GoalSheetStatus.APPROVED_LOCKED,
  ],

  [GoalSheetStatus.RETURNED]: [
    GoalSheetStatus.SUBMITTED,
    GoalSheetStatus.ARCHIVED,
  ],

  [GoalSheetStatus.APPROVED_LOCKED]: [
    GoalSheetStatus.ADMIN_UNLOCKED,
    GoalSheetStatus.ARCHIVED,
  ],

  [GoalSheetStatus.ADMIN_UNLOCKED]: [
    GoalSheetStatus.SUBMITTED,
    GoalSheetStatus.ARCHIVED,
  ],

  [GoalSheetStatus.ARCHIVED]: [],
} as const

export function assertTransition(
  current: GoalSheetStatus,
  next: GoalSheetStatus,
): void {
  const allowed = VALID_TRANSITIONS[current]

  if (!allowed.includes(next)) {
    throw new StateTransitionError(current, next)
  }
}

export function canTransition(
  current: GoalSheetStatus,
  next: GoalSheetStatus,
): boolean {
  return VALID_TRANSITIONS[current].includes(next)
}

export const SUBMITTABLE_STATUSES: readonly GoalSheetStatus[] = [
  GoalSheetStatus.DRAFT,
  GoalSheetStatus.RETURNED,
  GoalSheetStatus.ADMIN_UNLOCKED,
] as const