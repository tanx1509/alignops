import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { RoleBadge } from "@/components/app/role-badge";
import { Separator } from "@/components/ui/separator";
import { roleNavigation } from "@/config/navigation";
import { getHighestRoleFromRoles } from "@/lib/auth/roles";
import type { AuthUserSummary } from "@/types/auth";

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUserSummary;
}) {
  const activeRole = getHighestRoleFromRoles(user.roles);
  const navItems = roleNavigation[activeRole];

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-background lg:block">
        <div className="flex h-full flex-col">
          <div className="px-6 py-5">
            <p className="text-lg font-semibold tracking-normal">AlignOps</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Goal governance OS
            </p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <Separator />

          <div className="space-y-3 px-6 py-5">
            <RoleBadge role={activeRole} />

            <div className="space-y-3">
              <div>
                <p className="truncate text-sm font-medium">{user.name}</p>

                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
          <Link className="font-semibold" href="/">
            AlignOps
          </Link>

          <RoleBadge role={activeRole} />
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}