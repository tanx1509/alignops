import { CircleDot } from "lucide-react";

export type TimelineItem = {
  description?: string | null;
  meta?: string;
  title: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No activity has been recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div className="grid grid-cols-[1.5rem_1fr] gap-3" key={`${item.title}-${index}`}>
          <div className="relative flex justify-center">
            <CircleDot className="mt-1 h-4 w-4 text-[color:var(--chart-1)]" />
            {index < items.length - 1 ? <div className="absolute top-6 h-[calc(100%-0.5rem)] w-px bg-border" /> : null}
          </div>
          <div className="pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
            </div>
            {item.description ? (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
