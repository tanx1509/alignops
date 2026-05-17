import { z } from 'zod'

export const SubmitSheetSchema = z.object({
  updatedAt: z
    .string()
    .datetime('updatedAt must be a valid ISO datetime'),
})