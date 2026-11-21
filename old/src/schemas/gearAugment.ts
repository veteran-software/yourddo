import * as z from 'zod'
import { LootBindingSchema } from './lootBinding'
import { LootEnchantmentSchema } from './lootEnchantment'
import { SetBonusSchema } from './setBonus'

export const GearAugmentSchema = z.object({
  name: z.string().trim(),
  augmentType: z.string().trim(),
  minLevel: z.number(),
  binding: LootBindingSchema.optional(),
  description: z.string().trim().optional(),
  foundIn: z.array(z.string().trim()).optional(),
  image: z.string().trim().optional(),
  weight: z.number().optional(),
  update: z.number().optional(),
  effectsAdded: z.array(LootEnchantmentSchema).optional(),
  setBonus: z.array(SetBonusSchema).optional()
})
