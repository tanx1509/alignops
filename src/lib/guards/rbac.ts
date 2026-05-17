import { Prisma, AppRole } from '@prisma/client'

import {
  ForbiddenError,
  UnauthorizedError,
} from '@/lib/errors/domain.errors'

export interface Session {
  userId: string
  roles: AppRole[]
  email: string
}

const roleRank: Record<AppRole, number> = {
  [AppRole.EMPLOYEE]: 1,
  [AppRole.MANAGER]: 2,
  [AppRole.ADMIN]: 3,
}

export function assertAuthenticated(
  session: Session | null,
): asserts session is Session {
  if (session === null || session === undefined) {
    throw new UnauthorizedError('Authentication required')
  }
}

export function assertRole(
  session: Session,
  ...allowedRoles: AppRole[]
): void {
  const allowed = allowedRoles.some((allowedRole) =>
    session.roles.some(
      (sessionRole) => roleRank[sessionRole] >= roleRank[allowedRole],
    ),
  )

  if (!allowed) {
    throw new ForbiddenError(
      'Your role is not permitted to perform this action',
    )
  }
}

export async function assertOwnsSheet(
  userId: string,
  sheetId: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const sheet = await tx.goalSheet.findFirst({
    where: {
      id: sheetId,
      employeeId: userId,
    },
    select: {
      id: true,
    },
  })

  if (!sheet) {
    throw new ForbiddenError(
      'You do not have permission to access this goal sheet',
    )
  }
}

export async function assertManagerOwnsSheet(
  managerId: string,
  sheetId: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const sheet = await tx.goalSheet.findFirst({
    where: {
      id: sheetId,
      managerId,
    },
    select: {
      id: true,
    },
  })

  if (!sheet) {
    throw new ForbiddenError(
      'This goal sheet does not belong to a member of your team',
    )
  }
}
