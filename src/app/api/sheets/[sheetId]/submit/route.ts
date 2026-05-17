import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { SubmitSheetSchema } from '@/lib/validations/sheet.schema'
import { submitSheet } from '@/lib/dal/sheets.dal'
import { requireUser } from '@/lib/auth/session'

type SubmitRouteParams = { sheetId: string }

export const POST = withErrorHandling<SubmitRouteParams>(
  async (request: NextRequest, { params }) => {
    const user = await requireUser()

    const body: unknown = await request.json().catch(() => null)

    if (body === null) {
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
            message: 'Invalid request body',
            issues: parsed.error.flatten(),
          },
        },
        { status: 400 },
      )
    }

    const clientUpdatedAt = new Date(parsed.data.updatedAt)

    const result = await submitSheet(
      params.sheetId,
      user.id,
      clientUpdatedAt,
    )

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