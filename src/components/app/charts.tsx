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
