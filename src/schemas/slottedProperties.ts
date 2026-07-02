import * as z from 'zod'
import { CurseSchema } from './curse'
import { GearAugmentSchema } from './gearAugment'
import { GearItemSchema } from './gearItem'
import { LootEnchantmentSchema } from './lootEnchantment'

const ItemUpgradeStateSchema = z
  .object({
    nearlyFinished: LootEnchantmentSchema.nullable(),
    almostThere: LootEnchantmentSchema.nullable(),
    finishingTouch: LootEnchantmentSchema.nullable(),
    ritualTable: LootEnchantmentSchema.nullable(),
    lostPurpose: LootEnchantmentSchema.nullable(),
    traceOfMadness: LootEnchantmentSchema.nullable(),
    fountainOfNecroticMight: z.boolean(),
    stormreaverUpgrade: z.boolean(),
    zhentarimAttuned: z.boolean()
  })
  .partial()

export const SlottedPropertiesSchema = z.object({
  slots: z.record(z.string(), GearItemSchema.nullable()),
  slottedAugments: z.record(z.string(), z.record(z.string(), GearAugmentSchema.nullable())),
  slottedCurses: z.record(z.string(), CurseSchema.nullable()),
  slottedFiligrees: z.record(z.string(), z.array(GearItemSchema.nullable())),
  unlockedFiligreeSlots: z.record(z.string(), z.number()),
  slottedGemSetBonuses: z.record(z.string(), z.array(z.string().trim().nullable())),
  slottedEssenceEnchantments: z.record(z.string(), z.record(z.string(), z.string().trim().nullable())),
  itemUpgrades: z.record(z.string(), ItemUpgradeStateSchema)
})
