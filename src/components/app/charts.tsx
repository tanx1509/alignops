import { cn } from "@/lib/utils";

export type ChartPoint = {
  label: string;
  value: number;
};

export function BarList({
  data,
  max,
}: {
  data: ChartPoint[];
  max?: number;
}) {
  const ceiling = max ?? Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const width = ceiling === 0 ? 0 : (item.value / ceiling) * 100;

        return (
          <div className="space-y-1.5" key={item.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  index % 3 === 0 && "bg-[color:var(--chart-1)]",
                  index % 3 === 1 && "bg-[color:var(--chart-2)]",
                  index % 3 === 2 && "bg-[color:var(--chart-3)]",
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SegmentedBar({
  data,
}: {
  data: ChartPoint[];
}) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {data.map((item, index) => (
          <div
            className={cn(
              "h-full transition-all duration-500",
              index % 5 === 0 && "bg-[color:var(--chart-1)]",
              index % 5 === 1 && "bg-[color:var(--chart-2)]",
              index % 5 === 2 && "bg-[color:var(--chart-3)]",
              index % 5 === 3 && "bg-[color:var(--chart-4)]",
              index % 5 === 4 && "bg-[color:var(--chart-5)]",
            )}
            key={item.label}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: ${item.value}`}
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((item, index) => (
          <div className="flex items-center justify-between gap-3 text-xs" key={item.label}>
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  index % 5 === 0 && "bg-[color:var(--chart-1)]",
                  index % 5 === 1 && "bg-[color:var(--chart-2)]",
                  index % 5 === 2 && "bg-[color:var(--chart-3)]",
                  index % 5 === 3 && "bg-[color:var(--chart-4)]",
                  index % 5 === 4 && "bg-[color:var(--chart-5)]",
                )}
              />
              <span className="truncate text-muted-foreground">{item.label}</span>
            </span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutGauge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className="relative flex aspect-square min-h-40 items-center justify-center rounded-xl border bg-background/70"
      style={{
        background: `conic-gradient(var(--chart-2) ${normalized * 3.6}deg, color-mix(in oklab, var(--muted) 88%, transparent) 0deg)`,
      }}
    >
      <div className="absolute inset-4 rounded-lg bg-card shadow-inner" />
      <div className="relative text-center">
        <p className="text-3xl font-semibold tracking-normal">{normalized}%</p>
        <p className="mt-1 text-xs font-medium uppercase text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  height = 52,
}: {
  data: ChartPoint[];
  height?: number;
}) {
  const width = 240;
  const values = data.length > 0 ? data.map((item) => item.value) : [0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 8) - 4;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-full overflow-visible" height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        points={points}
        stroke="color-mix(in oklab, var(--chart-1) 88%, white)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function StatusMatrix({
  rows,
}: {
  rows: Array<{
    cells: number[];
    label: string;
  }>;
}) {
  const max = Math.max(...rows.flatMap((row) => row.cells), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div className="grid grid-cols-[minmax(7rem,1fr)_repeat(5,2rem)] items-center gap-2" key={row.label}>
          <span className="truncate text-xs font-medium text-muted-foreground">{row.label}</span>
          {row.cells.map((cell, index) => {
            const opacity = Math.max(0.12, cell / max);

            return (
              <div
                className="flex h-8 items-center justify-center rounded-md border text-[10px] font-medium"
                key={`${row.label}-${index}`}
                style={{
                  backgroundColor: `color-mix(in oklab, var(--chart-1) ${Math.round(opacity * 70)}%, transparent)`,
                }}
                title={`${cell}`}
              >
                {cell}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function HeatMapGrid({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<{
    cells: number[];
    label: string;
  }>;
}) {
  const max = Math.max(...rows.flatMap((row) => row.cells), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[34rem] space-y-2">
        <div
          className="grid items-center gap-2"
          style={{ gridTemplateColumns: `minmax(9rem,1fr) repeat(${columns.length}, minmax(4rem,0.5fr))` }}
        >
          <span />
          {columns.map((column) => (
            <span className="text-center text-[11px] font-medium uppercase text-muted-foreground" key={column}>
              {column}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div
            className="grid items-center gap-2"
            key={row.label}
            style={{ gridTemplateColumns: `minmax(9rem,1fr) repeat(${columns.length}, minmax(4rem,0.5fr))` }}
          >
            <span className="truncate text-xs font-medium text-muted-foreground">{row.label}</span>
            {row.cells.map((cell, index) => {
              const strength = Math.max(10, Math.round((cell / max) * 78));

              return (
                <div
                  className="flex h-10 items-center justify-center rounded-lg border text-xs font-semibold"
                  key={`${row.label}-${index}`}
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--chart-${(index % 5) + 1}) ${strength}%, transparent)`,
                  }}
                  title={`${columns[index]}: ${cell}`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
