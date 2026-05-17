import { NextRequest } from 'next/server'
import { AppRole } from '@prisma/client'

import { withErrorHandling } from '@/lib/api-handler'
import { SubmitSheetSchema } from '@/lib/validations/sheet.schema'
import { submitSheet } from '@/lib/dal/sheets.dal'
import { getCurrentUser } from '@/lib/auth/session'
import {
  assertAuthenticated,
  assertRole,
} from '@/lib/guards/rbac'

type SubmitRouteParams = {
  sheetId: string
}

export const POST = withErrorHandling<SubmitRouteParams>(
  async (request: NextRequest, { params }) => {
    const user = await getCurrentUser()

    const session = user
      ? {
          userId: user.id,
          email: user.email ?? '',
          role: AppRole.EMPLOYEE,
        }
      : null

    assertAuthenticated(session)

    assertRole(
      session,
      AppRole.EMPLOYEE,
      AppRole.ADMIN,
    )

    const formData = await request.formData()

        const body = {
            updatedAt: formData.get('updatedAt'),
        }

    if (body === null) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'Request body is missing or is not valid JSON',
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
            message: 'Invalid request body',
            issues: parsed.error.flatten(),
          },
        },
        { status: 400 },
      )
    }

    const clientUpdatedAt = new Date(
      parsed.data.updatedAt,
    )

    const result = await submitSheet(
      params.sheetId,
      session.userId,
      clientUpdatedAt,
    )

    return Response.json(
      {
        data: {
          sheetId: result.id,
          status: result.status,
          submittedAt:
            result.submittedAt?.toISOString() ?? null,
          updatedAt:
            result.updatedAt.toISOString(),
        },
      },
      { status: 200 },
    )
  },
)