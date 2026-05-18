'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquareText,
  RotateCcw,
  X,
} from 'lucide-react'

import { notify } from '@/components/app/toast-hub'
import { Button } from '@/components/ui/button'

type ReviewResponse = {
  error?: {
    message?: string
  }
}

type ReviewAction = 'approve' | 'return'

export function ManagerSheetActions({
  employeeName = 'this employee',
  riskLevel = 'low',
  sheetId,
}: {
  employeeName?: string
  riskLevel?: 'high' | 'low' | 'medium'
  sheetId: string
}) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [activeAction, setActiveAction] = useState<ReviewAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<ReviewAction | null>(null)

  async function review(action: ReviewAction) {
    setIsSubmitting(action)

    try {
      const response = await fetch(`/api/sheets/${sheetId}/review`, {
        body: JSON.stringify({ action, comment: comment || undefined }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const payload = (await response.json().catch(() => null)) as ReviewResponse | null

      if (!response.ok) {
        notify({
          description: payload?.error?.message ?? 'Unable to review sheet.',
          title: 'Review blocked',
          type: 'error',
        })
        return
      }

      notify({
        description:
          action === 'approve'
            ? 'The sheet is locked for the cycle.'
            : 'The employee can revise and resubmit.',
        title: action === 'approve' ? 'Goals approved' : 'Goals returned',
        type: 'success',
      })
      setComment('')
      setActiveAction(null)
      router.refresh()
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <div className="rounded-xl border bg-background/70 p-3">
      <div className="mb-4 flex items-start gap-2">
        <MessageSquareText className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Manager decision</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Approvals lock the sheet. Returns reopen the employee revision loop with your context.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="gap-2"
          onClick={() => setActiveAction('approve')}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>
        <Button
          className="gap-2"
          onClick={() => setActiveAction('return')}
          type="button"
          variant={riskLevel === 'high' ? 'destructive' : 'outline'}
        >
          <RotateCcw className="h-4 w-4" />
          Return
        </Button>
      </div>

      {activeAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-sm font-semibold">
                  {activeAction === 'approve' ? 'Approve goal sheet' : 'Return goal sheet'}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activeAction === 'approve'
                    ? `${employeeName}'s goals will be locked for this cycle.`
                    : `${employeeName} will receive your comments and can resubmit after edits.`}
                </p>
              </div>
              <Button
                aria-label="Close decision dialog"
                onClick={() => setActiveAction(null)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 p-4">
              {riskLevel !== 'low' ? (
                <div className="rounded-lg border border-[color:var(--chart-4)]/25 bg-[color:var(--chart-4)]/10 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm leading-5">
                      This sheet has {riskLevel} governance risk. Add decision context so the audit trail is useful.
                    </p>
                  </div>
                </div>
              ) : null}

              <label className="space-y-2 text-sm font-medium">
                Decision comment
                <textarea
                  className="min-h-28 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={
                    activeAction === 'approve'
                      ? 'Optional: note why this sheet is ready to lock.'
                      : 'Required for a strong return: explain exactly what should change.'
                  }
                  value={comment}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">
              <Button
                disabled={isSubmitting !== null}
                onClick={() => setActiveAction(null)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                className="gap-2"
                disabled={
                  isSubmitting !== null ||
                  (activeAction === 'return' && comment.trim().length < 8)
                }
                onClick={() => review(activeAction)}
                type="button"
                variant={activeAction === 'return' ? 'destructive' : 'default'}
              >
                {activeAction === 'approve' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                {isSubmitting === activeAction
                  ? activeAction === 'approve'
                    ? 'Approving...'
                    : 'Returning...'
                  : activeAction === 'approve'
                    ? 'Approve and lock'
                    : 'Return with comment'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
