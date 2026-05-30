import * as z from 'zod'

export const LootDropLocationSchema = z.looseObject({
  sourceType: z.string().trim(),
  questWildernessChain: z.string().trim().optional(),
  whichChestPerson: z.string().trim().optional(),
  difficulty: z.string().trim().optional(),
  vendorTable: z.object({ vendorsRaw: z.string().trim() }).optional(),
  isCraftOnly: z.boolean().optional(),
  vipMonths: z.string().trim().optional(),
  adventurePack: z.string().trim().optional()
})
