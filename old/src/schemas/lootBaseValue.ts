import * as z from 'zod'

export const LootBaseValueSchema = z.object({
  platinum: z.string().trim().optional(),
  gold: z.string().trim().optional(),
  silver: z.string().trim().optional(),
  copper: z.string().trim().optional()
})
