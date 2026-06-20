import * as z from 'zod'
import { GearAugmentSlotSchema } from './gearAugmentSlot'
import { LootBaseValueSchema } from './lootBaseValue'
import { LootBindingSchema } from './lootBinding'
import { LootDropLocationSchema } from './lootDropLocation'
import { LootEnchantmentSchema } from './lootEnchantment'
import { SetBonusSchema } from './setBonus'

export const LootItemSchema = z.object({
  pageTitle: z.string().trim(),
  name: z.string().trim(),
  type: z.string().trim(),
  description: z.string().trim(),
  minLevel: z.union([z.string().trim(), z.number()]),
  absoluteMinLevel: z.string().trim().optional(),
  binding: LootBindingSchema.optional(),
  restriction: z.string().trim(),
  material: z.string().trim(),
  hardness: z.string().trim(),
  durability: z.string().trim(),
  weight: z.string().trim(),
  baseValue: LootBaseValueSchema.optional(),
  artifactType: z.string().trim().optional(),
  capacity: z.string().trim().optional(),
  maxStackSize: z.string().trim().optional(),
  dropLocations: z
    .array(LootDropLocationSchema)
    .nullable()
    .transform((v) => v ?? []),
  update: z.string().trim(),
  details: z.string().trim(),
  upgradeable: z.string().trim(),
  upgradedFrom: z.string().trim(),
  icon: z.string().trim(),
  image: z.string().trim(),
  enchantments: z.array(LootEnchantmentSchema).optional(),
  augments: z.array(GearAugmentSlotSchema).optional(),
  essenceSlots: z.array(z.string().trim()).optional(),
  setBonus: z.array(SetBonusSchema).optional()
})
