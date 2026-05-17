import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManagerDashboardPage() {
  return (
    <>
      <PageHeader
        description="Protected manager workspace foundation. Approval queues and check-in reviews plug in here."
        eyebrow="Manager"
        title="Team Operating Queue"
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {["Pending approvals", "Check-in reviews", "Team visibility"].map((title) => (
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
