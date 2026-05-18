import { AchievementStatus, AppRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { submitCheckInProgress } from '@/lib/dal/checkins.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { SubmitCheckInSchema } from '@/lib/validations/checkin.schema'

export const POST = withErrorHandling(async (request: NextRequest) => {
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

  const parsed = SubmitCheckInSchema.safeParse(body)

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

  const update = await submitCheckInProgress({
    actualNumeric: parsed.data.actualNumeric,
    checkinWindowId: parsed.data.checkinWindowId,
    employeeComment: parsed.data.employeeComment,
    employeeId: session.userId,
    goalId: parsed.data.goalId,
    progressScore: parsed.data.progressScore,
    status: parsed.data.status as AchievementStatus,
  })

  revalidatePath('/employee')
  revalidatePath('/employee/check-ins')
  revalidatePath('/manager/check-ins')
  revalidatePath('/manager/insights')
  revalidatePath('/admin')

  return Response.json({
    data: {
      id: update.id,
      progressScore: update.progressScore?.toString() ?? null,
      status: update.status,
      submittedAt: update.submittedAt?.toISOString() ?? null,
    },
  })
})
