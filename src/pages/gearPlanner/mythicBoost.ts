import rawMythicBoost from './mythicBoost.json'
import { type GearItem, GearSlot, type LootEnchantment } from './types'

export type MythicBoostBonus =
  'Melee Power' | 'Ranged Power' | 'Universal Spell Power' | 'Physical Resistance Rating' | 'Magical Resistance Rating'

export interface MythicBoostChoice {
  label: string
  selectionLabel: string
  enchantments: LootEnchantment[]
  amount: number
}

interface MythicBoostRule {
  id: string
  slots: GearSlot[]
  types: string[]
  magnitudes: number[]
  dropdownLabelTemplate: string
  bonuses: { name: MythicBoostBonus; abbreviation: string }[]
}

interface MythicBoostReference {
  rules: MythicBoostRule[]
}

const mythicBoostReference = rawMythicBoost as MythicBoostReference

const ACCESSORY_LABELS = new Set(['Belt', 'Gloves', 'Goggles', 'Ring', 'Trinket'])

const getDefenseLabel = (item: GearItem): string => {
  if (item.slot === GearSlot.Armor) return 'Armor'
  if (item.slot === GearSlot.Feet) return 'Feet'
  if (item.slot === GearSlot.Wrists) return 'Bracers'
  if (item.slot === GearSlot.Cloak) return 'Cloak'
  if (item.slot === GearSlot.Head) return 'Headwear'
  if (item.slot === GearSlot.Neck) return 'Necklace'
  if (item.type.includes('Shield')) return 'Shield'
  return 'Defense'
}

const getSelectionLabel = (item: GearItem, rule: MythicBoostRule): string => {
  if (rule.id === 'accessory' && ACCESSORY_LABELS.has(item.type)) {
    return `Mythic ${item.type} Boost`
  }
  if (rule.id === 'orb') return 'Mythic Orb Boost'
  if (rule.id === 'weapon' || rule.id === 'weapon-offhand') return 'Mythic Weapon Boost'
  if (rule.id === 'defense') return `Mythic ${getDefenseLabel(item)} Boost`
  return rule.dropdownLabelTemplate.replace(' +<amount>', '')
}

const getRule = (item: GearItem): MythicBoostRule | null => {
  const typeName = item.type

  return (
    mythicBoostReference.rules.find((rule) => {
      if (!rule.slots.includes(item.slot)) return false
      if (rule.types.length === 0) return true
      return rule.types.some((type) => typeName.includes(type))
    }) ?? null
  )
}

export const getMythicBoostChoices = (item: GearItem): MythicBoostChoice[] => {
  const rule = getRule(item)
  if (!rule) return []

  const selectionLabel = getSelectionLabel(item, rule)

  return rule.magnitudes.map((amount) => ({
    label: `${selectionLabel} +${String(amount)}`,
    selectionLabel,
    enchantments: rule.bonuses.map((ruleBonus) => ({
      name: ruleBonus.name,
      modifier: amount,
      bonus: 'Mythic'
    })),
    amount
  }))
}

export const getMythicBoostEnchantments = (
  item: GearItem,
  mythicBoost: LootEnchantment | null = null
): LootEnchantment[] => {
  if (!mythicBoost) return []

  const choice = getMythicBoostChoices(item).find(
    (candidate) =>
      candidate.selectionLabel === mythicBoost.name && String(candidate.amount) === String(mythicBoost.modifier)
  )

  if (choice) return choice.enchantments

  return [mythicBoost]
}
