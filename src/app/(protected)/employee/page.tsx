import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDashboardPage() {
  return (
    <>
      <PageHeader
        description="Protected employee workspace foundation. Goal creation and quarterly updates plug in here."
        eyebrow="Employee"
        title="My Goal Workspace"
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {["Goal sheet", "Quarterly check-ins", "Manager comments"].map((title) => (
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
