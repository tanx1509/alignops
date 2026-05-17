import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        description="Protected HR/admin foundation. Cycle governance, audit logs, and control tower analytics plug in here."
        eyebrow="Admin / HR"
        title="Goal Governance Control Tower"
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {["Cycle health", "Escalations", "Audit readiness"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Module slot reserved for the next implementation phase.
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
