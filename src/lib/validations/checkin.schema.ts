import { z } from 'zod'

export const SubmitCheckInSchema = z.object({
  actualNumeric: z.coerce.number().finite().optional(),
  checkinWindowId: z.string().uuid(),
  employeeComment: z.string().trim().max(1000).optional(),
  goalId: z.string().uuid(),
  progressScore: z.coerce.number().min(0).max(100),
  status: z.enum(['NOT_STARTED', 'ON_TRACK', 'COMPLETED']),
})
