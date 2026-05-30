import * as z from 'zod'

export const EnhancementSchema = z.object({
  name: z.string().trim(),
  ability: z.string().trim().optional(),
  basePriceModifier: z
    .object({
      randomLoot: z.number().optional(),
      essenceCrafting: z.number().optional()
    })
    .optional(),
  bonus: z.union([z.number(), z.string().trim()]).optional(),
  damage: z.array(z.string().trim()).optional(),
  description: z.string().trim().optional(),
  minLevelIncrease: z
    .object({
      noMinimumLevel: z.union([z.number(), z.string().trim()]).optional(),
      minimumLevel: z.union([z.number(), z.string().trim()]).optional()
    })
    .optional(),
  modifier: z.union([z.number(), z.string().trim()]).optional(),
  type: z.enum(['Prefix', 'Suffix', 'Extra', '--Crafting']).optional(),
  notes: z.string().trim().optional(),
  charges: z.union([z.number(), z.string().trim()]).optional(),
  rechargePerDay: z.union([z.number(), z.string().trim()]).optional(),
  numPiecesEquipped: z.number().optional()
})
