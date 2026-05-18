import { AppRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { unlockSheet } from '@/lib/dal/reviews.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { UnlockSheetSchema } from '@/lib/validations/review.schema'

type UnlockRouteParams = {
  sheetId: string
}

export const POST = withErrorHandling<UnlockRouteParams>(
  async (request: NextRequest, { params }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new UnauthorizedError('Authentication required')
    }

    const session = {
      email: user.email ?? '',
      roles: user.dbRoles,
      userId: user.id,
    }

    assertAuthenticated(session)
    assertRole(session, AppRole.ADMIN)

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body is missing or is not valid JSON',
          },
        },
        { status: 400 },
      )
    }

    const parsed = UnlockSheetSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            issues: parsed.error.flatten(),
            message: 'Invalid request body',
          },
        },
        { status: 400 },
      )
    }

    const sheet = await unlockSheet({
      adminId: session.userId,
      reason: parsed.data.reason,
      sheetId: params.sheetId,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/governance')
    revalidatePath('/admin/audit')
    revalidatePath('/employee')
    revalidatePath('/manager')
    revalidatePath('/manager/insights')

    return Response.json({
      data: {
        sheetId: sheet.id,
        status: sheet.status,
        updatedAt: sheet.updatedAt.toISOString(),
      },
    })
  },
)
