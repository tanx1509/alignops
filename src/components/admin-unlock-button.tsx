"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlock } from "lucide-react";

import { notify } from "@/components/app/toast-hub";
import { Button } from "@/components/ui/button";

type UnlockResponse = {
  error?: {
    message?: string;
  };
};

export function AdminUnlockButton({ sheetId }: { sheetId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function unlock() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/sheets/${sheetId}/unlock`, {
        body: JSON.stringify({ reason }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as UnlockResponse | null;

      if (!response.ok) {
        notify({
          description: payload?.error?.message ?? "Unable to unlock sheet.",
          title: "Unlock blocked",
          type: "error",
        });
        return;
      }

      notify({
        description: "The employee can revise and resubmit goals.",
        title: "Sheet unlocked",
        type: "success",
      });
      setReason("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
        onChange={(event) => setReason(event.target.value)}
        placeholder="Unlock reason"
        value={reason}
      />
      <Button className="gap-2" disabled={isSubmitting || reason.trim().length < 5} onClick={unlock} size="sm" type="button">
        <Unlock className="h-3.5 w-3.5" />
        {isSubmitting ? "Unlocking..." : "Unlock"}
      </Button>
    </div>
  );
}
