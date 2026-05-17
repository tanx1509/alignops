import {
  AchievementStatus,
  AuditAction,
  AuditEntityType,
  Prisma,
} from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { writeAuditLog } from '@/lib/dal/audit.dal'
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/domain.errors'

export async function submitCheckInProgress({
  actualNumeric,
  checkinWindowId,
  employeeComment,
  employeeId,
  goalId,
  progressScore,
  status,
}: {
  actualNumeric?: number
  checkinWindowId: string
  employeeComment?: string
  employeeId: string
  goalId: string
  progressScore: number
  status: AchievementStatus
}) {
  if (progressScore < 0 || progressScore > 100) {
    throw new ValidationError('Progress score must be between 0 and 100')
  }

  return prisma.$transaction(
    async (tx) => {
      const goal = await tx.goal.findUnique({
        where: {
          id: goalId,
        },
        include: {
          goalSheet: {
            select: {
              employeeId: true,
            },
          },
        },
      })

      if (!goal || goal.deletedAt) {
        throw new NotFoundError('Goal not found')
      }

      if (goal.goalSheet.employeeId !== employeeId) {
        throw new ForbiddenError('You can only update your own check-ins')
      }

      const window = await tx.checkinWindow.findUnique({
        where: {
          id: checkinWindowId,
        },
      })

      if (!window) {
        throw new NotFoundError('Check-in window not found')
      }

      const submittedAt = new Date()
      const update = await tx.achievementUpdate.upsert({
        create: {
          actualNumeric,
          checkinWindowId,
          createdById: employeeId,
          employeeComment,
          enteredById: employeeId,
          goalId,
          progressScore,
          status,
          submittedAt,
          updatedById: employeeId,
        },
        update: {
          actualNumeric,
          employeeComment,
          enteredById: employeeId,
          progressScore,
          status,
          submittedAt,
          updatedById: employeeId,
        },
        where: {
          goalId_checkinWindowId: {
            checkinWindowId,
            goalId,
          },
        },
      })

      await writeAuditLog(
        [
          {
            action: AuditAction.UPDATE,
            actorId: employeeId,
            after: {
              progressScore,
              status,
            },
            entityId: update.id,
            entityType: AuditEntityType.ACHIEVEMENT_UPDATE,
          },
        ],
        tx,
      )

      return update
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  )
}
