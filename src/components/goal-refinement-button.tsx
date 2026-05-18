'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Save, X } from 'lucide-react'

import { notify } from '@/components/app/toast-hub'
import { Button } from '@/components/ui/button'

type GoalUpdateResponse = {
  error?: {
    message?: string
  }
}

export function GoalRefinementButton({
  description,
  goalId,
  targetDate,
  targetNumeric,
  thrustArea,
  title,
  weightage,
}: {
  description: string
  goalId: string
  targetDate: string
  targetNumeric: string
  thrustArea: string
  title: string
  weightage: string
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draft, setDraft] = useState({
    description,
    targetDate,
    targetNumeric,
    thrustArea,
    title,
    weightage,
  })

  async function save() {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        body: JSON.stringify({
          description: draft.description,
          targetDate: draft.targetDate || undefined,
          targetNumeric:
            draft.targetNumeric.trim().length > 0
              ? Number(draft.targetNumeric)
              : undefined,
          thrustArea: draft.thrustArea,
          title: draft.title,
          weightage: Number(draft.weightage),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })
      const payload = (await response.json().catch(() => null)) as GoalUpdateResponse | null

      if (!response.ok) {
        notify({
          description: payload?.error?.message ?? 'Unable to update goal.',
          title: 'Goal update blocked',
          type: 'error',
        })
        return
      }

      notify({
        description: 'Your goal quality signals have been recalculated.',
        title: 'Goal updated',
        type: 'success',
      })
      setIsOpen(false)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button className="gap-2" onClick={() => setIsOpen(true)} size="sm" type="button" variant="outline">
        <Pencil className="h-3.5 w-3.5" />
        Refine
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-sm font-semibold">Refine goal</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Edits are allowed only while the sheet is draft, returned, or admin unlocked.
                </p>
              </div>
              <Button
                aria-label="Close goal refinement"
                onClick={() => setIsOpen(false)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium md:col-span-2">
                Title
                <input
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:border-ring"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  value={draft.title}
                />
              </label>

              <label className="space-y-2 text-sm font-medium md:col-span-2">
                Description
                <textarea
                  className="min-h-28 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-ring"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  value={draft.description}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                Thrust area
                <input
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:border-ring"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      thrustArea: event.target.value,
                    }))
                  }
                  value={draft.thrustArea}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                Weightage
                <input
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:border-ring"
                  min="1"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      weightage: event.target.value,
                    }))
                  }
                  type="number"
                  value={draft.weightage}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                Numeric target
                <input
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:border-ring"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetNumeric: event.target.value,
                    }))
                  }
                  type="number"
                  value={draft.targetNumeric}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                Target date
                <input
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:border-ring"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={draft.targetDate}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">
              <Button
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button className="gap-2" disabled={isSubmitting} onClick={save} type="button">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save revision'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
