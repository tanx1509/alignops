import { Prisma, GoalSheetStatus } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { writeAuditLog } from '@/lib/dal/audit.dal'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/domain.errors'
import { assertTransition } from '@/lib/state-machine/sheet.transitions'

function validateSheetForSubmission(
  goals: Array<{
    weightage: Prisma.Decimal
  }>,
) {
  if (goals.length === 0) {
    throw new ValidationError(
      'At least one goal is required before submission',
    )
  }

  if (goals.length > 8) {
    throw new ValidationError(
      'Maximum 8 goals allowed per sheet',
    )
  }

  const totalWeightage = goals.reduce(
    (sum, goal) => sum + Number(goal.weightage),
    0,
  )

  if (totalWeightage !== 100) {
    throw new ValidationError(
      `Total weightage must equal 100. Current total: ${totalWeightage}`,
    )
  }
}
/*
export async function submitSheet(
  sheetId: string,
  employeeId: string,
  clientUpdatedAt: Date,
) {
  return prisma.$transaction(
    async (tx) => {
      const sheet = await tx.goalSheet.findUnique({
        where: { id: sheetId },
        include: {
          goals: true,
        },
      })

      if (!sheet) {
        throw new NotFoundError('Goal sheet not found')
      }

      if (
        sheet.updatedAt.getTime() !==
        clientUpdatedAt.getTime()
      ) {
        throw new ConflictError(
          'Sheet was modified by another session. Reload and retry.',
        )
      }

      assertTransition(
        sheet.status as GoalSheetStatus,
        GoalSheetStatus.SUBMITTED,
      )

      validateSheetForSubmission(sheet.goals)

      const updatedSheet = await tx.goalSheet.update({
        where: {
          id: sheetId,
        },
        data: {
          status: GoalSheetStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      })

      await writeAuditLog(
        [
          {
            entityType: 'GOAL_SHEET',
            entityId: sheetId,
            action: 'SUBMIT',
            oldValue: sheet.status,
            newValue: GoalSheetStatus.SUBMITTED,
            changedById: employeeId,
          },
        ],
        tx,
      )

      return updatedSheet
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  )
}
*/
export async function submitSheet(
  sheetId: string,
  employeeId: string,
  clientUpdatedAt: Date,
) {
  return prisma.goalSheet.update({
    where: {
      id: sheetId,
    },
    data: {
      status: GoalSheetStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  })
}
