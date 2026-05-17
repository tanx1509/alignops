import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { getUserRoles } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell
      user={{
        email: user.email ?? null,
        id: user.id,
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email ??
          "Workspace user",
        roles: getUserRoles(user),
      }}
    >
      {children}
    </AppShell>
  );
}
