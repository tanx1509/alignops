import { AppRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { updateEmployeeGoal } from '@/lib/dal/goals.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { UpdateGoalSchema } from '@/lib/validations/goal.schema'

type GoalRouteParams = {
  goalId: string
}

export const PATCH = withErrorHandling<GoalRouteParams>(
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

    const parsed = UpdateGoalSchema.safeParse(body)

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

    const goal = await updateEmployeeGoal({
      description: parsed.data.description,
      employeeId: session.userId,
      goalId: params.goalId,
      targetDate: parsed.data.targetDate,
      targetNumeric: parsed.data.targetNumeric,
      thrustArea: parsed.data.thrustArea,
      title: parsed.data.title,
      weightage: parsed.data.weightage,
    })

    revalidatePath('/employee')
    revalidatePath('/manager')
    revalidatePath('/manager/insights')
    revalidatePath('/admin')
    revalidatePath('/admin/audit')

    return Response.json({
      data: {
        goalId: goal.id,
        updatedAt: goal.updatedAt.toISOString(),
      },
    })
  },
)
