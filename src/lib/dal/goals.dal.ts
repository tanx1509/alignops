import {
  AppRole,
  AuditAction,
  AuditEntityType,
  GoalSource,
  Prisma,
} from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { writeAuditLog } from '@/lib/dal/audit.dal'
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/domain.errors'
import { SUBMITTABLE_STATUSES } from '@/lib/state-machine/sheet.transitions'

export async function updateEmployeeGoal({
  description,
  employeeId,
  goalId,
  targetDate,
  targetNumeric,
  thrustArea,
  title,
  weightage,
}: {
  description: string
  employeeId: string
  goalId: string
  targetDate?: string
  targetNumeric?: number
  thrustArea: string
  title: string
  weightage: number
}) {
  const targetDateValue = targetDate
    ? new Date(`${targetDate}T00:00:00.000Z`)
    : null

  if (targetDateValue && Number.isNaN(targetDateValue.getTime())) {
    throw new ValidationError('Target date must be a valid date')
  }

  if (targetNumeric === undefined && !targetDateValue) {
    throw new ValidationError('A numeric target or target date is required')
  }

  return prisma.$transaction(
    async (tx) => {
      const goal = await tx.goal.findUnique({
        include: {
          goalSheet: {
            select: {
              employeeId: true,
              status: true,
            },
          },
        },
        where: {
          id: goalId,
        },
      })

      if (!goal || goal.deletedAt) {
        throw new NotFoundError('Goal not found')
      }

      if (goal.goalSheet.employeeId !== employeeId) {
        throw new ForbiddenError('You can only update your own goals')
      }

      if (!SUBMITTABLE_STATUSES.includes(goal.goalSheet.status)) {
        throw new ForbiddenError('Only editable sheets can be revised')
      }

      if (goal.source === GoalSource.SHARED) {
        throw new ForbiddenError('Shared goals are governed centrally')
      }

      const updated = await tx.goal.update({
        data: {
          description,
          targetDate: targetDateValue,
          targetNumeric: targetNumeric ?? null,
          thrustArea,
          title,
          updatedById: employeeId,
          weightage,
        },
        where: {
          id: goalId,
        },
      })

      await tx.goalSheet.update({
        data: {
          updatedById: employeeId,
        },
        where: {
          id: goal.goalSheetId,
        },
      })

      await writeAuditLog(
        [
          {
            action: AuditAction.UPDATE,
            actorId: employeeId,
            actorRole: AppRole.EMPLOYEE,
            after: {
              description,
              targetDate: targetDateValue?.toISOString() ?? null,
              targetNumeric: targetNumeric ?? null,
              thrustArea,
              title,
              weightage,
            },
            before: {
              description: goal.description,
              targetDate: goal.targetDate?.toISOString() ?? null,
              targetNumeric: goal.targetNumeric?.toString() ?? null,
              thrustArea: goal.thrustArea,
              title: goal.title,
              weightage: goal.weightage.toString(),
            },
            entityId: goalId,
            entityType: AuditEntityType.GOAL,
            reason: 'Employee refined goal after governance review.',
          },
        ],
        tx,
      )

      return updated
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  )
}
