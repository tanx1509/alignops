import type { ReactNode } from "react";

export function PageHeader({
  actions,
  description,
  eyebrow,
  meta,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  meta?: ReactNode;
  title: string;
}) {
  return (
    <div className="border-b bg-background/70 px-5 py-6 backdrop-blur xl:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
          {meta ? <div className="pt-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
