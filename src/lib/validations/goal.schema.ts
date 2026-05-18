import { z } from 'zod'

export const UpdateGoalSchema = z.object({
  description: z.string().trim().min(10).max(1000),
  targetDate: z.string().trim().optional(),
  targetNumeric: z.coerce.number().finite().optional(),
  thrustArea: z.string().trim().min(2).max(120),
  title: z.string().trim().min(5).max(160),
  weightage: z.coerce.number().min(1).max(100),
})
