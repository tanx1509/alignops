"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command, LogOut, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { roleNavigation } from "@/config/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole, AuthUserSummary } from "@/types/auth";
import { notify } from "@/components/app/toast-hub";

type CommandItem = {
  href?: string;
  keywords: string;
  title: string;
};

const roleCommands: Record<AppRole, CommandItem[]> = {
  admin: [
    { href: "/admin", keywords: "control tower analytics executive", title: "Open control tower" },
    { href: "/admin/audit", keywords: "audit compliance history", title: "Review audit log" },
    { href: "/admin/governance", keywords: "policy unlock cycles", title: "Manage governance" },
    { href: "/admin/org", keywords: "organization departments employees", title: "Inspect organization" },
  ],
  employee: [
    { href: "/employee", keywords: "my goals workspace submit", title: "Open my goals" },
    { href: "/employee/check-ins", keywords: "progress blockers achievements", title: "Add a check-in" },
  ],
  manager: [
    { href: "/manager", keywords: "approvals team queue review", title: "Open approval queue" },
    { href: "/manager/check-ins", keywords: "team check-ins blockers", title: "Review team check-ins" },
    { href: "/manager/insights", keywords: "insights bottlenecks performance", title: "Open team insights" },
  ],
};

export function CommandPalette({
  activeRole,
  user,
}: {
  activeRole: AppRole;
  user: AuthUserSummary;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navCommands = roleNavigation[activeRole].map((item) => ({
    href: item.href,
    keywords: item.title.toLowerCase(),
    title: item.title,
  }));
  const commands = useMemo(
    () => [
      ...navCommands,
      ...roleCommands[activeRole],
      { href: "/", keywords: "home start dashboard", title: "Go to role home" },
    ],
    [activeRole, navCommands],
  );
  const filtered = commands.filter((command) => {
    const needle = `${command.title} ${command.keywords}`.toLowerCase();

    return needle.includes(query.toLowerCase());
  });

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();
    notify({ title: "Signed out", type: "success" });
    setIsOpen(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <Button className="hidden gap-2 text-muted-foreground md:flex" onClick={() => setIsOpen(true)} type="button" variant="outline">
        <Search className="h-4 w-4" />
        Command
        <span className="ml-4 rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</span>
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" role="presentation">
          <div className="mx-auto mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Command className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${user.name}'s workspace`}
                value={query}
              />
            </div>

            <div className="max-h-[24rem] overflow-y-auto p-2">
              {filtered.map((command) => (
                <Link
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors hover:bg-muted"
                  href={command.href ?? "/"}
                  key={`${command.title}-${command.href}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{command.title}</span>
                  <span className="text-xs text-muted-foreground">{command.href}</span>
                </Link>
              ))}

              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No command found.
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <span>{activeRole} workspace</span>
              <Button className="gap-2" onClick={logout} size="sm" type="button" variant="ghost">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
