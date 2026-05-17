"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";

import { notify } from "@/components/app/toast-hub";
import { Button } from "@/components/ui/button";

type ReviewResponse = {
  error?: {
    message?: string;
  };
};

export function ManagerSheetActions({ sheetId }: { sheetId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<"approve" | "return" | null>(null);

  async function review(action: "approve" | "return") {
    setIsSubmitting(action);

    try {
      const response = await fetch(`/api/sheets/${sheetId}/review`, {
        body: JSON.stringify({ action, comment: comment || undefined }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as ReviewResponse | null;

      if (!response.ok) {
        notify({
          description: payload?.error?.message ?? "Unable to review sheet.",
          title: "Review blocked",
          type: "error",
        });
        return;
      }

      notify({
        description: action === "approve" ? "The sheet is locked for the cycle." : "The employee can revise and resubmit.",
        title: action === "approve" ? "Goals approved" : "Goals returned",
        type: "success",
      });
      setComment("");
      router.refresh();
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-20 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add decision context for the employee"
        value={comment}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          className="gap-2"
          disabled={isSubmitting !== null}
          onClick={() => review("approve")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isSubmitting === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          className="gap-2"
          disabled={isSubmitting !== null}
          onClick={() => review("return")}
          type="button"
          variant="outline"
        >
          <RotateCcw className="h-4 w-4" />
          {isSubmitting === "return" ? "Returning..." : "Return"}
        </Button>
      </div>
    </div>
  );
}
