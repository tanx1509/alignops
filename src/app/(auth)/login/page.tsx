import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border bg-background">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>AlignOps access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Supabase Auth is wired at the platform layer. Add the login form in
            the next implementation phase without changing route protection.
          </p>
          <p>
            For demo users, store role metadata as{" "}
            <code className="rounded bg-muted px-1 py-0.5">employee</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5">manager</code>, or{" "}
            <code className="rounded bg-muted px-1 py-0.5">admin</code>.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
