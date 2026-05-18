import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/types/auth";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin / HR",
  employee: "Employee",
  manager: "Manager",
};

const roleStyles: Record<AppRole, string> = {
  admin: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  manager: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  employee: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
};

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge
      className={cn("border px-2.5 py-1 text-[11px] font-semibold uppercase", roleStyles[role])}
      variant="outline"
    >
      {roleLabel[role]}
    </Badge>
  );
}
