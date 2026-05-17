import { AppRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { submitSheet } from '@/lib/dal/sheets.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { SubmitSheetSchema } from '@/lib/validations/sheet.schema'

type SubmitRouteParams = {
  sheetId: string
}

export const POST = withErrorHandling<SubmitRouteParams>(
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
    assertRole(session, AppRole.EMPLOYEE)

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

    const parsed = SubmitSheetSchema.safeParse(body)

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

    const result = await submitSheet({
      actorRole: user.primaryDbRole,
      clientUpdatedAt: new Date(parsed.data.updatedAt),
      employeeId: session.userId,
      sheetId: params.sheetId,
    })

    revalidatePath('/employee')

    return Response.json(
      {
        data: {
          sheetId: result.id,
          status: result.status,
          submittedAt: result.submittedAt?.toISOString() ?? null,
          updatedAt: result.updatedAt.toISOString(),
        },
      },
      { status: 200 },
    )
  },
)
