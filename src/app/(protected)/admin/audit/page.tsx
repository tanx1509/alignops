import { History } from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Timeline } from '@/components/app/timeline'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminAuditPage() {
  const { auditLogs } = await getAdminControlTower()

  return (
    <>
      <PageHeader
        description="A tamper-evident operating ledger for submissions, reviews, unlocks, and system governance actions."
        eyebrow="Audit and compliance"
        meta={<Badge variant="outline">{auditLogs.length} recent audit events</Badge>}
        title="Audit Log"
      />

      <div className="p-5 xl:p-8">
        {auditLogs.length === 0 ? (
          <EmptyState
            description="Actions that change governance state will appear here with actor, entity, reason, and timestamp."
            icon={<History className="h-5 w-5" />}
            title="No audit events yet"
          />
        ) : (
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-base">Governance timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                items={auditLogs.map((log) => ({
                  description:
                    log.reason ??
                    `${log.entityType.toLowerCase().replaceAll('_', ' ')} changed at ${log.createdAt.toLocaleString()}`,
                  meta: log.actorRole ?? 'SYSTEM',
                  title: `${log.action} by ${log.actor?.fullName ?? 'System'}`,
                }))}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
