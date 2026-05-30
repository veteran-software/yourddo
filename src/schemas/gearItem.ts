import * as z from 'zod'
import { LootEnchantmentSchema } from './lootEnchantment'
import { LootItemSchema } from './lootItem'

export const GearItemSchema = LootItemSchema.extend({
  id: z.string().trim(),
  slot: z.string().trim(),
  augmentType: z.string().trim().optional(),
  minimumLevel: z.number().optional(),
  effectsAdded: z.array(LootEnchantmentSchema).optional(),
  grouping: z.string().trim().optional(),
  isEssenceCrafted: z.boolean().optional(),
  essenceSlots: z.array(z.string().trim()).optional(),
  normalizedName: z.string().trim().optional(),
  normalizedEnchantments: z.array(z.string().trim()).optional()
})
