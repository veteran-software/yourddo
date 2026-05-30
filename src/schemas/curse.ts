import * as z from 'zod'
import { LootEnchantmentSchema } from './lootEnchantment'

export const CurseSchema = z.object({
  name: z.string().trim(),
  enchantments: z.array(LootEnchantmentSchema).optional(),
  type: z.string().trim()
})
