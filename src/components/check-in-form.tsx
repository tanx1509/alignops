"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { notify } from "@/components/app/toast-hub";
import { Button } from "@/components/ui/button";

type CheckInResponse = {
  error?: {
    message?: string;
  };
};

export function CheckInForm({
  checkinWindowId,
  goalId,
}: {
  checkinWindowId: string;
  goalId: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(50);
  const [status, setStatus] = useState<"COMPLETED" | "NOT_STARTED" | "ON_TRACK">("ON_TRACK");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/check-ins/progress", {
        body: JSON.stringify({
          checkinWindowId,
          employeeComment: comment || undefined,
          goalId,
          progressScore: progress,
          status,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as CheckInResponse | null;

      if (!response.ok) {
        notify({
          description: payload?.error?.message ?? "Unable to save check-in.",
          title: "Check-in blocked",
          type: "error",
        });
        return;
      }

      notify({
        description: "Your progress timeline has been updated.",
        title: "Check-in saved",
        type: "success",
      });
      setComment("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-background/70 p-3">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Progress
          <input
            className="w-full accent-foreground"
            max={100}
            min={0}
            onChange={(event) => setProgress(Number(event.target.value))}
            type="range"
            value={progress}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Signal
          <select
            className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground"
            onChange={(event) => setStatus(event.target.value as "COMPLETED" | "NOT_STARTED" | "ON_TRACK")}
            value={status}
          >
            <option value="NOT_STARTED">Not started</option>
            <option value="ON_TRACK">On track</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
      </div>
      <textarea
        className="min-h-20 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
        onChange={(event) => setComment(event.target.value)}
        placeholder="What changed, what is blocked, and what support do you need?"
        value={comment}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{progress}% progress</span>
        <Button className="gap-2" disabled={isSubmitting} onClick={submit} size="sm" type="button">
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? "Saving..." : "Save check-in"}
        </Button>
      </div>
    </div>
  );
}
