import * as z from 'zod'

export const LootBindingSchema = z.object({
  type: z.string().trim(),
  to: z.string().trim(),
  from: z.string().trim()
})
