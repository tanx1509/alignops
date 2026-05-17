import {
  AppRole,
  ApprovalAction,
  AuditAction,
  AuditEntityType,
  GoalSheetStatus,
  GoalStatus,
  Prisma,
} from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { writeAuditLog } from '@/lib/dal/audit.dal'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/errors/domain.errors'
import { assertTransition } from '@/lib/state-machine/sheet.transitions'

export async function reviewSheet({
  action,
  comment,
  managerId,
  sheetId,
}: {
  action: 'approve' | 'return'
  comment?: string
  managerId: string
  sheetId: string
}) {
  return prisma.$transaction(
    async (tx) => {
      const sheet = await tx.goalSheet.findUnique({
        where: {
          id: sheetId,
        },
        include: {
          goals: true,
        },
      })

      if (!sheet || sheet.deletedAt) {
        throw new NotFoundError('Goal sheet not found')
      }

      if (sheet.managerId !== managerId) {
        throw new ForbiddenError('This goal sheet is not assigned to you')
      }

      if (sheet.status !== GoalSheetStatus.SUBMITTED) {
        throw new ConflictError('Only submitted goal sheets can be reviewed')
      }

      const nextStatus =
        action === 'approve'
          ? GoalSheetStatus.APPROVED_LOCKED
          : GoalSheetStatus.RETURNED
      const approvalAction =
        action === 'approve' ? ApprovalAction.APPROVED : ApprovalAction.RETURNED
      const reviewedAt = new Date()

      assertTransition(sheet.status, nextStatus)

      const updatedSheet = await tx.goalSheet.update({
        data: {
          approvedAt: action === 'approve' ? reviewedAt : null,
          approvedById: action === 'approve' ? managerId : null,
          lockedAt: action === 'approve' ? reviewedAt : null,
          lockReason:
            action === 'approve' ? 'Manager approval completed' : null,
          returnedAt: action === 'return' ? reviewedAt : null,
          status: nextStatus,
          updatedById: managerId,
        },
        where: {
          id: sheetId,
        },
      })

      if (action === 'approve') {
        await tx.goal.updateMany({
          data: {
            lockedAt: reviewedAt,
            status: GoalStatus.LOCKED,
            updatedById: managerId,
          },
          where: {
            goalSheetId: sheetId,
          },
        })
      }

      await tx.approvalEvent.create({
        data: {
          action: approvalAction,
          actorId: managerId,
          comment:
            comment ??
            (action === 'approve'
              ? 'Approved and locked.'
              : 'Returned for modification.'),
          fromStatus: sheet.status,
          goalSheetId: sheetId,
          toStatus: nextStatus,
        },
      })

      await writeAuditLog(
        [
          {
            action:
              action === 'approve' ? AuditAction.APPROVE : AuditAction.RETURN,
            actorId: managerId,
            actorRole: AppRole.MANAGER,
            after: {
              status: nextStatus,
            },
            before: {
              status: sheet.status,
            },
            entityId: sheetId,
            entityType: AuditEntityType.GOAL_SHEET,
            reason: comment ?? null,
          },
        ],
        tx,
      )

      return updatedSheet
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  )
}

export async function unlockSheet({
  adminId,
  reason,
  sheetId,
}: {
  adminId: string
  reason: string
  sheetId: string
}) {
  return prisma.$transaction(
    async (tx) => {
      const sheet = await tx.goalSheet.findUnique({
        where: {
          id: sheetId,
        },
      })

      if (!sheet || sheet.deletedAt) {
        throw new NotFoundError('Goal sheet not found')
      }

      assertTransition(sheet.status, GoalSheetStatus.ADMIN_UNLOCKED)

      const unlockedAt = new Date()
      const updatedSheet = await tx.goalSheet.update({
        data: {
          lockedAt: null,
          unlockReason: reason,
          unlockedAt,
          status: GoalSheetStatus.ADMIN_UNLOCKED,
          updatedById: adminId,
        },
        where: {
          id: sheetId,
        },
      })

      await tx.goal.updateMany({
        data: {
          lockedAt: null,
          status: GoalStatus.ACTIVE,
          updatedById: adminId,
        },
        where: {
          goalSheetId: sheetId,
        },
      })

      await tx.approvalEvent.create({
        data: {
          action: ApprovalAction.ADMIN_UNLOCKED,
          actorId: adminId,
          comment: reason,
          fromStatus: sheet.status,
          goalSheetId: sheetId,
          toStatus: GoalSheetStatus.ADMIN_UNLOCKED,
        },
      })

      await writeAuditLog(
        [
          {
            action: AuditAction.UNLOCK,
            actorId: adminId,
            actorRole: AppRole.ADMIN,
            after: {
              status: GoalSheetStatus.ADMIN_UNLOCKED,
              unlockedAt: unlockedAt.toISOString(),
            },
            before: {
              status: sheet.status,
            },
            entityId: sheetId,
            entityType: AuditEntityType.GOAL_SHEET,
            reason,
          },
        ],
        tx,
      )

      return updatedSheet
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  )
}
