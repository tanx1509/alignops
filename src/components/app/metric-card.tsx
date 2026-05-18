import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export function MetricCard({
  accent = "bg-[color:var(--chart-1)]",
  detail,
  icon,
  label,
  trend,
  value,
}: {
  accent?: string;
  detail?: string;
  icon?: ReactNode;
  label: string;
  trend?: {
    direction: "down" | "flat" | "up";
    label: string;
  };
  value: ReactNode;
}) {
  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUpRight
      : trend?.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <div className="premium-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <div className="metric-value">{value}</div>
        </div>
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full w-2/3 rounded-full", accent)} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{detail}</span>
        {trend ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <TrendIcon className="h-3 w-3" />
            {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
