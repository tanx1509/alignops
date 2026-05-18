'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquareText,
  Send,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type EnterpriseNotification = {
  body: string
  channel: 'Email' | 'System' | 'Teams'
  createdAt: string
  ctaHref?: string
  ctaLabel?: string
  id: string
  previewBody: string
  previewSubject: string
  priority: 'high' | 'low' | 'medium'
  title: string
}

const channelIcon = {
  Email: Mail,
  System: Bell,
  Teams: MessageSquareText,
}

export function NotificationCenter({
  emptyLabel = 'No simulated enterprise notifications are queued.',
  notifications,
  title = 'Enterprise notification center',
}: {
  emptyLabel?: string
  notifications: EnterpriseNotification[]
  title?: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    notifications[0]?.id ?? null,
  )
  const selected = useMemo(
    () =>
      notifications.find((notification) => notification.id === selectedId) ??
      notifications[0] ??
      null,
    [notifications, selectedId],
  )
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="outline">{notifications.length} queued</Badge>
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = channelIcon[notification.channel]
              const isSelected = selected?.id === notification.id

              return (
                <button
                  className={cn(
                    'w-full rounded-lg border bg-muted/20 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-muted/35',
                    isSelected &&
                      'border-[color:var(--chart-1)] bg-[color:var(--chart-1)]/10',
                  )}
                  key={notification.id}
                  onClick={() => {
                    setSelectedId(notification.id)
                    setPreviewOpen(true)
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-2">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {notification.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {notification.body}
                        </span>
                      </span>
                    </div>
                    <Badge
                      variant={
                        notification.priority === 'high'
                          ? 'destructive'
                          : notification.priority === 'medium'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span>{notification.channel}</span>
                    <span>{notification.createdAt}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {previewOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-sm font-semibold">Email / Teams preview</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Simulated outbound notification. No external integration is called.
                </p>
              </div>
              <Button
                aria-label="Close notification preview"
                onClick={() => setPreviewOpen(false)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{selected.channel}</Badge>
                  <Badge variant="outline">{selected.priority} priority</Badge>
                </div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Subject</p>
                <p className="mt-1 text-lg font-semibold tracking-normal">
                  {selected.previewSubject}
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {selected.previewBody}
                </p>
              </div>

              <div className="rounded-xl border bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--chart-2)]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Approval card simulation</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      In production this maps cleanly to Teams adaptive cards, email actions, or Entra-protected workflow links.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">
              {selected.ctaHref ? (
                <Link
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  href={selected.ctaHref}
                >
                  <ExternalLink className="h-4 w-4" />
                  {selected.ctaLabel ?? 'Open workflow'}
                </Link>
              ) : null}
              <Button
                className="gap-2"
                onClick={() => setPreviewOpen(false)}
                type="button"
              >
                <Send className="h-4 w-4" />
                Close preview
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
