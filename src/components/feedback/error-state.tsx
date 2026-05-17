"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ErrorState({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something failed</AlertTitle>
        <AlertDescription className="mt-2">
          The page could not be loaded. Retry before changing data.
        </AlertDescription>
        <Button className="mt-4" onClick={reset} variant="outline">
          Retry
        </Button>
      </Alert>
    </div>
  );
}
