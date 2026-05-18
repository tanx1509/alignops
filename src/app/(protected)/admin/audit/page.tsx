import { History, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { MetricCard } from '@/components/app/metric-card'
import { PageHeader } from '@/components/app/page-header'
import { Timeline } from '@/components/app/timeline'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminControlTower } from '@/lib/dal/dashboard.dal'

export default async function AdminAuditPage() {
  const { auditLogs } = await getAdminControlTower()
  const submitEvents = auditLogs.filter((log) => log.action === 'SUBMIT').length
  const reviewEvents = auditLogs.filter((log) =>
    ['APPROVE', 'RETURN'].includes(log.action),
  ).length
  const unlockEvents = auditLogs.filter((log) => log.action === 'UNLOCK').length

  return (
    <>
      <PageHeader
        description="A tamper-evident operating ledger for submissions, reviews, unlocks, and system governance actions."
        eyebrow="Audit and compliance"
        meta={<Badge variant="outline">{auditLogs.length} recent audit events</Badge>}
        title="Audit Log"
      />

      <div className="space-y-6 p-5 xl:p-8">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            detail="Employee goal submissions"
            icon={<UserCheck className="h-4 w-4" />}
            label="Submissions"
            value={submitEvents}
          />
          <MetricCard
            accent="bg-[color:var(--chart-2)]"
            detail="Manager approve or return events"
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Reviews"
            value={reviewEvents}
          />
          <MetricCard
            accent="bg-[color:var(--chart-4)]"
            detail="Admin policy exceptions"
            icon={<LockKeyhole className="h-4 w-4" />}
            label="Unlocks"
            value={unlockEvents}
          />
        </section>

        {auditLogs.length === 0 ? (
          <EmptyState
            description="Actions that change governance state will appear here with actor, entity, reason, and timestamp."
            icon={<History className="h-5 w-5" />}
            title="No audit events yet"
          />
        ) : (
          <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
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

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-base">Control posture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="text-sm font-medium">Actor attribution</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Events retain actor, role, entity, and timestamp for demo-ready audit review.
                  </p>
                </div>
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="text-sm font-medium">Reason capture</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Manager returns and admin unlocks carry comments into the operating ledger.
                  </p>
                </div>
                <div className="rounded-lg border bg-background/70 p-3">
                  <p className="text-sm font-medium">State traceability</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Before and after payloads are stored for critical goal-sheet transitions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </>
  )
}
