import { AppRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { reviewSheet } from '@/lib/dal/reviews.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { ReviewSheetSchema } from '@/lib/validations/review.schema'

type ReviewRouteParams = {
  sheetId: string
}

export const POST = withErrorHandling<ReviewRouteParams>(
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
    assertRole(session, AppRole.MANAGER)

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

    const parsed = ReviewSheetSchema.safeParse(body)

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

    const sheet = await reviewSheet({
      action: parsed.data.action,
      comment: parsed.data.comment,
      managerId: session.userId,
      sheetId: params.sheetId,
    })

    revalidatePath('/manager')
    revalidatePath('/manager/check-ins')
    revalidatePath('/manager/insights')
    revalidatePath('/employee')
    revalidatePath('/admin')
    revalidatePath('/admin/governance')
    revalidatePath('/admin/audit')

    return Response.json({
      data: {
        sheetId: sheet.id,
        status: sheet.status,
        updatedAt: sheet.updatedAt.toISOString(),
      },
    })
  },
)
