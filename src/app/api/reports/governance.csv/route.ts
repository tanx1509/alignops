import { AppRole } from '@prisma/client'
import { withErrorHandling } from '@/lib/api-handler'
import { getCurrentUser } from '@/lib/auth/session'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'
import { UnauthorizedError } from '@/lib/errors/domain.errors'
import { assertAuthenticated, assertRole } from '@/lib/guards/rbac'
import { analyzeSheet } from '@/lib/goal-intelligence'

function csvCell(value: string | number | null | undefined) {
  const raw = value === null || value === undefined ? '' : String(value)

  return `"${raw.replaceAll('"', '""')}"`
}

export const GET = withErrorHandling(async () => {
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

  const { activeCycle, sheets } = await getAdminControlTower()
  const headers = [
    'cycle',
    'employee',
    'manager',
    'org_unit',
    'status',
    'goals',
    'governance_health',
    'kpi_confidence',
    'execution_risk',
    'quality_score',
    'average_progress',
    'high_risk_goals',
    'missing_checkins',
    'approval_sla_days',
    'workload_balance',
    'forecast',
  ]
  const rows = sheets.map((sheet) => {
    const intelligence = analyzeSheet(sheet)

    return [
      activeCycle?.code ?? sheet.cycle.code,
      sheet.employee.fullName,
      sheet.manager.fullName,
      sheet.orgUnit?.name ?? '',
      sheet.status,
      sheet.goals.length,
      intelligence.governanceHealth,
      intelligence.kpiConfidence,
      intelligence.executionRiskScore,
      intelligence.qualityScore,
      intelligence.averageProgress,
      intelligence.highRiskGoals,
      intelligence.missingCheckIns,
      intelligence.approvalSlaDays,
      intelligence.workloadBalanceScore,
      intelligence.forecast.label,
    ]
  })
  const csv = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => row.map(csvCell).join(',')),
  ].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Disposition': 'attachment; filename="alignops-governance-report.csv"',
      'Content-Type': 'text/csv; charset=utf-8',
    },
  })
})
