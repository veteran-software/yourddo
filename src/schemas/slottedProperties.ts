import * as z from 'zod'
import { CurseSchema } from './curse'
import { GearAugmentSchema } from './gearAugment'
import { GearItemSchema } from './gearItem'
import { LootEnchantmentSchema } from './lootEnchantment'

export const SlottedPropertiesSchema = z.object({
  slots: z.record(z.string(), GearItemSchema.nullable()),
  slottedAugments: z.record(z.string(), z.record(z.string(), GearAugmentSchema.nullable())),
  slottedCurses: z.record(z.string(), CurseSchema.nullable()),
  slottedFiligrees: z.record(z.string(), z.array(GearItemSchema.nullable())),
  unlockedFiligreeSlots: z.record(z.string(), z.number()),
  slottedGemSetBonuses: z.record(z.string(), z.array(z.string().trim().nullable())),
  slottedEssenceEnchantments: z.record(z.string(), z.record(z.string(), z.string().trim().nullable())),
  slottedNearlyFinished: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedAlmostThere: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedFinishingTouch: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedRitualTable: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedLostPurpose: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedTraceOfMadness: z.record(z.string(), LootEnchantmentSchema.nullable()),
  slottedFountainOfNecroticMight: z.record(z.string(), z.boolean()),
  slottedStormreaverUpgrade: z.record(z.string(), z.boolean()),
  slottedZhentarimAttuned: z.record(z.string(), z.boolean())
})
