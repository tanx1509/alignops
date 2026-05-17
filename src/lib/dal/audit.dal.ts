import { Prisma, AuditEntityType, AuditAction } from '@prisma/client'

export interface AuditEntry {
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  actorId?: string | null
  actorRole?: Prisma.AuditLogCreateManyInput['actorRole'] | null
  before?: Prisma.InputJsonValue | null
  after?: Prisma.InputJsonValue | null
  metadata?: Prisma.InputJsonValue | null
  reason?: string | null
  requestId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

export async function writeAuditLog(
  entries: AuditEntry[],
  tx: Prisma.TransactionClient,
) {
  if (entries.length === 0) {
    return
  }

  await tx.auditLog.createMany({
    data: entries.map((entry) => ({
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      actorId: entry.actorId ?? null,
      actorRole: entry.actorRole ?? null,
      before: entry.before ?? undefined,
      after: entry.after ?? undefined,
      metadata: entry.metadata ?? undefined,
      reason: entry.reason ?? null,
      requestId: entry.requestId ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    })),
  })
}
