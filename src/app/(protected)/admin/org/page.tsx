import { Building2 } from 'lucide-react'

import { BarList } from '@/components/app/charts'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminOrgPage() {
  const { orgUnits, sheets } = await getAdminControlTower()

  return (
    <>
      <PageHeader
        description="Department coverage, reporting surfaces, and goal-sheet ownership across the organization."
        eyebrow="Organization"
        meta={<Badge variant="outline">{orgUnits.length} active org units</Badge>}
        title="Org Setup"
      />

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_24rem] xl:p-8">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Org units
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orgUnits.map((unit) => (
              <div className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[1fr_auto_auto]" key={unit.id}>
                <div>
                  <p className="text-sm font-medium">{unit.name}</p>
                  <p className="text-xs text-muted-foreground">{unit.code} - {unit.type}</p>
                </div>
                <Badge variant="outline">{unit.members.length} members</Badge>
                <Badge variant="secondary">{unit.status}</Badge>
              </div>
            ))}
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
      </div>
    </>
  )
}
