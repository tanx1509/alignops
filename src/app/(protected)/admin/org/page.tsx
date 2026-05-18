import { GoalSheetStatus } from '@prisma/client'
import { Building2, GitBranch, ShieldCheck, Users } from 'lucide-react'

import { BarList, HeatMapGrid } from '@/components/app/charts'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'
import { analyzeSheet } from '@/lib/goal-intelligence'

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

export default async function AdminOrgPage() {
  const { orgUnits, sheets } = await getAdminControlTower()
  const sheetViews = sheets.map((sheet) => ({
    intelligence: analyzeSheet(sheet),
    sheet,
  }))
  const coveredUnits = orgUnits.filter((unit) =>
    sheets.some((sheet) => sheet.orgUnit?.id === unit.id),
  )
  const totalMembers = orgUnits.reduce((sum, unit) => sum + unit.members.length, 0)
  const locked = sheets.filter(
    (sheet) => sheet.status === GoalSheetStatus.APPROVED_LOCKED,
  ).length
  const orgHealthRows = coveredUnits.map((unit) => {
    const unitViews = sheetViews.filter((view) => view.sheet.orgUnit?.id === unit.id)
    const unitLocked = unitViews.filter(
      (view) => view.sheet.status === GoalSheetStatus.APPROVED_LOCKED,
    ).length
    const unitSubmitted = unitViews.filter(
      (view) => view.sheet.status !== GoalSheetStatus.DRAFT,
    ).length
    const unitHealth =
      unitViews.length > 0
        ? Math.round(
            unitViews.reduce(
              (sum, view) => sum + view.intelligence.governanceHealth,
              0,
            ) / unitViews.length,
          )
        : 0

    return {
      cells: [
        unit.members.length,
        unitViews.length,
        unitHealth,
        percent(unitSubmitted, unitViews.length),
        percent(unitLocked, unitViews.length),
      ],
      label: unit.name,
    }
  })

  return (
    <>
      <PageHeader
        description="Department coverage, reporting surfaces, and goal-sheet ownership across the organization."
        eyebrow="Organization"
        meta={<Badge variant="outline">{orgUnits.length} active org units</Badge>}
        title="Org Setup"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Configured org units"
            icon={<GitBranch className="h-4 w-4" />}
            label="Org units"
            value={orgUnits.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Members mapped to units"
            icon={<Users className="h-4 w-4" />}
            label="Members"
            value={totalMembers}
          />
          <MetricCard
            accent="bg-[color:var(--chart-3)]"
            detail="Goal sheets with org ownership"
            icon={<Building2 className="h-4 w-4" />}
            label="Coverage"
            value={sheets.length}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Approved sheets"
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Locked"
            value={locked}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Org unit health
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Columns: members, sheets, health, submitted, locked.
              </p>
            </CardHeader>
            <CardContent>
              <HeatMapGrid
                columns={['Members', 'Sheets', 'Health', 'Submit', 'Locked']}
                rows={orgHealthRows}
              />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Goal sheets by org</CardTitle>
            </CardHeader>
            <CardContent>
              <BarList
                data={orgUnits.map((unit) => ({
                  label: unit.name,
                  value: sheets.filter((sheet) => sheet.orgUnit?.id === unit.id).length,
                }))}
              />
            </CardContent>
          </Card>
        </section>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-base">Role and user management surface</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orgUnits.map((unit) => (
              <div className="rounded-xl border bg-muted/20 p-4" key={unit.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{unit.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {unit.code} - {unit.type}
                    </p>
                  </div>
                  <Badge variant="secondary">{unit.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border bg-background/70 p-2">
                    <p className="text-muted-foreground">Members</p>
                    <p className="mt-1 text-base font-semibold">{unit.members.length}</p>
                  </div>
                  <div className="rounded-lg border bg-background/70 p-2">
                    <p className="text-muted-foreground">Sheets</p>
                    <p className="mt-1 text-base font-semibold">
                      {sheets.filter((sheet) => sheet.orgUnit?.id === unit.id).length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
