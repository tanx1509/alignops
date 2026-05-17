import {
  AppRole,
  ApprovalAction,
  AuditAction,
  AuditEntityType,
  GoalSheetStatus,
  Prisma,
} from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { writeAuditLog } from '@/lib/dal/audit.dal'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/domain.errors'
import {
  assertTransition,
  SUBMITTABLE_STATUSES,
} from '@/lib/state-machine/sheet.transitions'

function validateSheetForSubmission(
  goals: Array<{
    weightage: Prisma.Decimal
  }>,
) {
  if (goals.length === 0) {
    throw new ValidationError('At least one goal is required before submission')
  }

  if (goals.length > 8) {
    throw new ValidationError('Maximum 8 goals allowed per sheet')
  }

  const totalWeightage = goals.reduce(
    (sum, goal) => sum + Number(goal.weightage),
    0,
  )

  if (Math.abs(totalWeightage - 100) > 0.001) {
    throw new ValidationError(
      `Total weightage must equal 100. Current total: ${totalWeightage}`,
    )
  }
}

function approvalActionForSubmit(status: GoalSheetStatus) {
  return status === GoalSheetStatus.DRAFT
    ? ApprovalAction.SUBMITTED
    : ApprovalAction.RESUBMITTED
}

export async function getEmployeeGoalSheet(employeeId: string) {
  return prisma.goalSheet.findFirst({
    where: {
      deletedAt: null,
      employeeId,
    },
    include: {
      cycle: {
        select: {
          code: true,
          name: true,
        },
      },
      goals: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      manager: {
        select: {
          fullName: true,
        },
      },
      orgUnit: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export async function submitSheet({
  actorRole,
  clientUpdatedAt,
  employeeId,
  sheetId,
}: {
  actorRole: AppRole
  clientUpdatedAt: Date
  employeeId: string
  sheetId: string
}) {
  return prisma.$transaction(
    async (tx) => {
      const sheet = await tx.goalSheet.findUnique({
        where: {
          id: sheetId,
        },
        include: {
          goals: {
            where: {
              deletedAt: null,
            },
          },
        },
      })

      if (!sheet || sheet.deletedAt) {
        throw new NotFoundError('Goal sheet not found')
      }

      if (sheet.employeeId !== employeeId) {
        throw new ForbiddenError(
          'You do not have permission to submit this sheet',
        )
      }

      if (sheet.updatedAt.getTime() !== clientUpdatedAt.getTime()) {
        throw new ConflictError(
          'Sheet was modified by another session. Reload and retry.',
        )
      }

      assertTransition(sheet.status, GoalSheetStatus.SUBMITTED)
      validateSheetForSubmission(sheet.goals)

      const submittedAt = new Date()
      const updated = await tx.goalSheet.updateMany({
        where: {
          employeeId,
          id: sheetId,
          status: {
            in: [...SUBMITTABLE_STATUSES],
          },
          updatedAt: clientUpdatedAt,
        },
        data: {
          status: GoalSheetStatus.SUBMITTED,
          submittedAt,
          updatedById: employeeId,
        },
      })

      if (updated.count !== 1) {
        throw new ConflictError(
          'Sheet was modified by another session. Reload and retry.',
        )
      }

      await tx.approvalEvent.create({
        data: {
          action: approvalActionForSubmit(sheet.status),
          actorId: employeeId,
          comment: 'Submitted for manager review.',
          fromStatus: sheet.status,
          goalSheetId: sheetId,
          toStatus: GoalSheetStatus.SUBMITTED,
        },
      })

      await writeAuditLog(
        [
          {
            action: AuditAction.SUBMIT,
            actorId: employeeId,
            actorRole,
            after: {
              status: GoalSheetStatus.SUBMITTED,
              submittedAt: submittedAt.toISOString(),
            },
            before: {
              status: sheet.status,
              updatedAt: sheet.updatedAt.toISOString(),
            },
            entityId: sheetId,
            entityType: AuditEntityType.GOAL_SHEET,
          },
        ],
        tx,
      )

      return tx.goalSheet.findUniqueOrThrow({
        where: {
          id: sheetId,
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  )
}
