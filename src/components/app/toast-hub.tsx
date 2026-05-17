"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlignOpsToast = {
  description?: string;
  id?: string;
  title: string;
  type?: "error" | "info" | "success";
};

export function notify(toast: AlignOpsToast) {
  window.dispatchEvent(
    new CustomEvent<AlignOpsToast>("alignops:toast", {
      detail: toast,
    }),
  );
}

export function ToastHub() {
  const [toasts, setToasts] = useState<Array<Required<AlignOpsToast>>>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<AlignOpsToast>).detail;
      const toast = {
        description: detail.description ?? "",
        id: detail.id ?? crypto.randomUUID(),
        title: detail.title,
        type: detail.type ?? "info",
      };

      setToasts((current) => [toast, ...current].slice(0, 3));
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 4200);
    }

    window.addEventListener("alignops:toast", handleToast);

    return () => window.removeEventListener("alignops:toast", handleToast);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.type === "success" ? CheckCircle2 : Info;

        return (
          <div
            className={cn(
              "rounded-xl border bg-background/95 p-4 shadow-2xl backdrop-blur",
              toast.type === "success" && "border-emerald-500/20",
              toast.type === "error" && "border-destructive/30",
            )}
            key={toast.id}
          >
            <div className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 text-muted-foreground",
                  toast.type === "success" && "text-emerald-600",
                  toast.type === "error" && "text-destructive",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{toast.description}</p>
                ) : null}
              </div>
              <Button
                aria-label="Dismiss notification"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
