import { GoalSheetStatus } from '@prisma/client'

import { PageHeader } from '@/components/app/page-header'
import { SubmitGoalsButton } from '@/components/submit-goals-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getEmployeeGoalSheet } from '@/lib/dal/sheets.dal'

export default async function EmployeePage() {
  const user = await requireUser()
  const sheet = await getEmployeeGoalSheet(user.id)

  if (!sheet) {
    return (
      <>
        <PageHeader
          description="No active goal sheet is assigned to your profile."
          eyebrow="Employee"
          title="My Goal Workspace"
        />
        <div className="p-6">
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Contact an administrator if you expected a goal sheet for this cycle.
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const canSubmit = sheet.status === GoalSheetStatus.DRAFT

  return (
    <>
      <PageHeader
        actions={
          canSubmit ? (
            <SubmitGoalsButton
              sheetId={sheet.id}
              updatedAt={sheet.updatedAt.toISOString()}
            />
          ) : null
        }
        description={`${sheet.cycle.name} · Manager: ${sheet.manager.fullName}`}
        eyebrow={sheet.orgUnit?.name ?? 'Employee'}
        title="My Goal Workspace"
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Status: {sheet.status}</Badge>
          <Badge variant="outline">Cycle: {sheet.cycle.code}</Badge>
        </div>

        <div className="grid gap-4">
          {sheet.goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{goal.source}</Badge>
                  <Badge variant="secondary">{goal.status}</Badge>
                </div>
                <CardTitle className="text-lg">
                  {goal.title ?? 'Untitled goal'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {goal.description ? <p>{goal.description}</p> : null}
                <div className="flex flex-wrap gap-4 text-foreground">
                  <span>Weightage: {goal.weightage.toString()}%</span>
                  {goal.thrustArea ? <span>Area: {goal.thrustArea}</span> : null}
                  {goal.targetNumeric ? (
                    <span>Target: {goal.targetNumeric.toString()}</span>
                  ) : null}
                  {goal.targetDate ? (
                    <span>Target date: {goal.targetDate.toDateString()}</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
