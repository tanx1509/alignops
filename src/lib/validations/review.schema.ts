import { z } from 'zod'

export const ReviewSheetSchema = z.object({
  action: z.enum(['approve', 'return']),
  comment: z.string().trim().max(1200).optional(),
})

export const UnlockSheetSchema = z.object({
  reason: z.string().trim().min(5).max(1200),
})
