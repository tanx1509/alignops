import { GoalSheetStatus } from '@prisma/client'
import { LockKeyhole, ShieldAlert } from 'lucide-react'

import { AdminUnlockButton } from '@/components/admin-unlock-button'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { StatusPill } from '@/components/app/status-pill'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminGovernancePage() {
  const { activeCycle, sheets } = await getAdminControlTower()
  const lockedSheets = sheets.filter((sheet) => sheet.status === GoalSheetStatus.APPROVED_LOCKED)
  const returnedSheets = sheets.filter((sheet) => sheet.status === GoalSheetStatus.RETURNED)

  return (
    <>
      <PageHeader
        description="Policy controls for locked goal sheets, revision exceptions, and cycle governance."
        eyebrow="Governance"
        meta={
          <div className="flex flex-wrap gap-2">
            {activeCycle ? <Badge variant="outline">{activeCycle.name}</Badge> : null}
            <Badge variant="secondary">{lockedSheets.length} locked sheets</Badge>
            <Badge variant="outline">{returnedSheets.length} returned sheets</Badge>
          </div>
        }
        title="Policy Enforcement"
      />

      <div className="space-y-5 p-5 xl:p-8">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LockKeyhole className="h-4 w-4" />
              Locked sheets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lockedSheets.length === 0 ? (
              <EmptyState
                description="Manager-approved sheets appear here when they can be force-unlocked by HR with a required reason."
                icon={<ShieldAlert className="h-5 w-5" />}
                title="No locked sheets"
              />
            ) : (
              lockedSheets.map((sheet) => (
                <div className="rounded-xl border bg-muted/20 p-4" key={sheet.id}>
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{sheet.employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sheet.orgUnit?.name ?? 'No org unit'} - manager {sheet.manager.fullName}
                      </p>
                    </div>
                    <StatusPill status={sheet.status} />
                  </div>
                  <AdminUnlockButton sheetId={sheet.id} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
