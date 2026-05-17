import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, ShieldCheck } from "lucide-react";

import { CommandPalette } from "@/components/app/command-palette";
import { LogoutButton } from "@/components/logout-button";
import { RoleBadge } from "@/components/app/role-badge";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { ToastHub } from "@/components/app/toast-hub";
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
    <div className="min-h-screen bg-background">
      <ToastHub />
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-sidebar/95 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <div className="px-5 py-5">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border bg-foreground text-background shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-normal">AlignOps</span>
                <span className="block text-xs text-muted-foreground">Enterprise goal governance</span>
              </span>
            </Link>
          </div>

          <Separator />

          <SidebarNav items={navItems} />

          <Separator />

          <div className="space-y-4 px-5 py-5">
            <div className="rounded-xl border bg-background/70 p-3">
              <div className="mb-3 flex items-center justify-between">
                <RoleBadge role={activeRole} />
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                  Live
                </span>
              </div>

              <div>
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur xl:px-6">
          <div className="flex items-center gap-3">
            <Link className="font-semibold lg:hidden" href="/">
              AlignOps
            </Link>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Operating rhythm healthy
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette activeRole={activeRole} user={user} />
            <button
              aria-label="Notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              type="button"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--chart-4)]" />
            </button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="lg:hidden">
              <RoleBadge role={activeRole} />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
