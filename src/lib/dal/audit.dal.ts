import { Prisma, AuditEntityType, AuditAction } from '@prisma/client'

export interface AuditEntry {
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  oldValue?: Prisma.JsonValue | null
  newValue?: Prisma.JsonValue | null
  changedById: string
  reason?: string | null
}

export async function writeAuditLog(
  entries: AuditEntry[],
  tx: Prisma.TransactionClient,
) {
  const now = new Date()

  await tx.auditLog.createMany({
    data: entries.map((entry) => ({
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      oldValue: entry.oldValue ?? null,
      newValue: entry.newValue ?? null,
      changedById: entry.changedById,
      changedAt: now,
      reason: entry.reason ?? null,
    })),
  })
}