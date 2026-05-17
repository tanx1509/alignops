import { CheckCircle2, CircleDot, Clock3, LockKeyhole, RotateCcw, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    className: string;
    icon: typeof CircleDot;
    label: string;
  }
> = {
  ACTIVE: {
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CircleDot,
    label: "Active",
  },
  ADMIN_UNLOCKED: {
    className: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: RotateCcw,
    label: "Admin unlocked",
  },
  APPROVED_LOCKED: {
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: LockKeyhole,
    label: "Approved and locked",
  },
  ARCHIVED: {
    className: "border-muted bg-muted text-muted-foreground",
    icon: Clock3,
    label: "Archived",
  },
  CLOSED: {
    className: "border-muted bg-muted text-muted-foreground",
    icon: Clock3,
    label: "Closed",
  },
  DRAFT: {
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: CircleDot,
    label: "Draft",
  },
  LOCKED: {
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: LockKeyhole,
    label: "Locked",
  },
  OPEN: {
    className: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: CircleDot,
    label: "Open",
  },
  RETURNED: {
    className: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: ShieldAlert,
    label: "Returned",
  },
  SUBMITTED: {
    className: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: CheckCircle2,
    label: "Under review",
  },
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusPill({
  className,
  status,
}: {
  className?: string;
  status: string;
}) {
  const config = statusConfig[status] ?? {
    className: "border-border bg-muted text-muted-foreground",
    icon: CircleDot,
    label: humanize(status),
  };
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1.5 border", config.className, className)} variant="outline">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
