"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { roleNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";

export function SidebarNav({
  role,
  variant = "sidebar",
}: {
  role: AppRole;
  variant?: "mobile" | "sidebar";
}) {
  const pathname = usePathname();
  const items = roleNavigation[role];

  if (variant === "mobile") {
    return (
      <nav className="flex gap-2 overflow-x-auto border-b bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const activeItem = items.reduce<typeof items[0] | null>((best, item) => {
            if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
              if (!best || item.href.length > best.href.length) {
                return item;
              }
            }
            return best;
          }, null);

          const isActive = activeItem?.href === item.href;

          return (
            <Link
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                isActive && "bg-foreground text-background hover:bg-foreground hover:text-background",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 space-y-1.5 px-4 py-5">
      {items.map((item) => {
        const Icon = item.icon;
        const activeItem = items.reduce<typeof items[0] | null>((best, item) => {
          if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
            if (!best || item.href.length > best.href.length) {
              return item;
            }
          }
          return best;
        }, null);

        const isActive = activeItem?.href === item.href;

        return (
          <Link
            className={cn(
              "group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
              isActive && "bg-foreground text-background shadow-sm hover:bg-foreground hover:text-background",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1 truncate">{item.title}</span>
            {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-background" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
