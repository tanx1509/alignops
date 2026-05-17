import { cn } from "@/lib/utils";

export function ProgressRing({
  label,
  size = "md",
  value,
}: {
  label?: string;
  size?: "lg" | "md";
  value: number;
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const dimension = size === "lg" ? 112 : 84;
  const radius = dimension / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ height: dimension, width: dimension }}>
        <svg className="-rotate-90" height={dimension} width={dimension}>
          <circle
            className="stroke-muted"
            cx={dimension / 2}
            cy={dimension / 2}
            fill="none"
            r={radius}
            strokeWidth="8"
          />
          <circle
            className="stroke-[color:var(--chart-1)] transition-all duration-500"
            cx={dimension / 2}
            cy={dimension / 2}
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-semibold tracking-normal", size === "lg" ? "text-2xl" : "text-lg")}>
            {normalized}%
          </span>
        </div>
      </div>
      {label ? <p className="text-xs font-medium text-muted-foreground">{label}</p> : null}
    </div>
  );
}

export function ProgressBar({
  label,
  value,
}: {
  label?: string;
  value: number;
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{normalized}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[color:var(--chart-1)] transition-all duration-500"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
