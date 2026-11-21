import * as z from 'zod'

export const LootEnchantmentSchema = z.object({
  name: z.string().trim(),
  statModified: z.string().trim().optional(),
  modifier: z.union([z.string().trim(), z.number()]).optional(),
  bonus: z.union([z.string().trim(), z.number()]).optional(),
  stats: z.array(z.union([z.number(), z.string().trim()])).optional(),
  notes: z.string().trim().optional()
})
