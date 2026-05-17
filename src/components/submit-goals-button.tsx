"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { notify } from "@/components/app/toast-hub";
import { Button } from "@/components/ui/button";

type SubmitResponse = {
  error?: {
    message?: string;
  };
};

export function SubmitGoalsButton({
  sheetId,
  updatedAt,
}: {
  sheetId: string;
  updatedAt: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/sheets/${sheetId}/submit`, {
        body: JSON.stringify({ updatedAt }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | SubmitResponse
        | null;

      if (!response.ok) {
        const message = payload?.error?.message ?? "Unable to submit goals.";
        setError(message);
        notify({ description: message, title: "Submission blocked", type: "error" });
        return;
      }

      notify({
        description: "Your manager queue has been updated.",
        title: "Goals submitted",
        type: "success",
      });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button disabled={isSubmitting} onClick={handleSubmit} type="button">
        {isSubmitting ? "Submitting..." : "Submit Goals"}
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export default SubmitGoalsButton;
