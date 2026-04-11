import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  type GearItem,
  GearSlot,
  type LootEnchantment
} from './types'

export interface EnchantmentConflict {
  name: string
  bonus: string | number
  items: {
    itemId: string
    itemName: string
    slot: string
    value: number
    valueStr: string
    isEffective: boolean
  }[]
}

export const getSlotOwner = (slot: string): string => {
  if (ARTIFICER_PET_SLOTS.includes(slot as GearSlot)) {
    return 'artificer_pet'
  }

  if (DRUID_PET_SLOTS.includes(slot as GearSlot)) {
    return 'druid_pet'
  }

  return 'character'
}

export type RobustString = string | number | undefined | null

/**
 * Normalizes a string by trimming it and converting it to lowercase.
 * Handles non-string inputs gracefully.
 */
export const normalizeString = (str: RobustString): string => {
  if (str == null) {
    return ''
  }

  return String(str).trim().toLowerCase()
}

/**
 * Gets a normalized bonus type or 'no type'.
 */
export const getBonus = (bonus: RobustString): string => {
  const normalized = normalizeString(bonus)

  return normalized === '' ? 'no type' : normalized
}

/**
 * Parses a numeric value from a modifier string like "3", "+14%", or "2[W]".
 */
export const parseModifierValue = (modifier: RobustString): number => {
  if (modifier == null) {
    return 0
  }

  if (typeof modifier === 'number') {
    return modifier
  }

  // Remove +, %, [W], etc.
  const numericStr = modifier.replaceAll(/[+%[\]W]/g, '')
  const val = Number.parseFloat(numericStr)

  return Number.isNaN(val) ? 0 : val
}

/**
 * Identifies conflicting enchantments across a set of equipped items and slotted augments.
 * A conflict exists if multiple items provide the same enchantment (name + bonus type).
 * Only the highest value of a given (name, bonus) pair is "effective".
 * Conflicts only occur within the same "owner" (character, artificer pet, or druid pet).
 */
export const resolveConflicts = (
  equippedItems: GearItem[],
  slottedAugments?: Record<
    string,
    Record<number, import('./types').GearAugment | null>
  >
): Record<string, EnchantmentConflict[]> => {
  const allEnchantments: {
    itemId: string
    itemName: string
    slot: string
    enchantment: LootEnchantment
    parsedValue: number
    owner: string
    normalizedName: string
    normalizedBonus: string
  }[] = []

  equippedItems.forEach((item) => {
    const owner = getSlotOwner(item.slot)

    if (item.enchantments) {
      item.enchantments.forEach((ench) => {
        allEnchantments.push({
          itemId: item.id,
          itemName: item.name,
          slot: item.slot,
          enchantment: ench,
          parsedValue: parseModifierValue(ench.modifier),
          owner,
          normalizedName: normalizeString(ench.name),
          normalizedBonus: getBonus(ench.bonus)
        })
      })
    }

    // Include slotted augments for this item
    if (slottedAugments?.[item.id]) {
      Object.entries(slottedAugments[item.id]).forEach(([slotIdx, aug]) => {
        if (aug?.effectsAdded) {
          aug.effectsAdded.forEach((ench) => {
            allEnchantments.push({
              itemId: `${item.id}-aug-${slotIdx}`,
              itemName: `${item.name} (${aug.name})`,
              slot: item.slot,
              enchantment: ench,
              parsedValue: parseModifierValue(ench.modifier),
              owner,
              normalizedName: normalizeString(ench.name),
              normalizedBonus: getBonus(ench.bonus)
            })
          })
        }
      })
    }
  })

  // Group by (owner, normalizedName, normalizedBonus)
  const grouped: Record<string, typeof allEnchantments> = {}

  allEnchantments.forEach((entry) => {
    const key = `${entry.owner}|${entry.normalizedName}|${entry.normalizedBonus}`

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(entry)
  })

  const conflicts: Record<string, EnchantmentConflict[]> = {}

  Object.values(grouped).forEach((entries) => {
    if (entries.length <= 1) return

    const first = entries[0]
    const name = first.enchantment.name
    const bonus = first.enchantment.bonus ?? 'No Type'

    // Find max value
    const maxValue = Math.max(...entries.map((e) => e.parsedValue))

    const conflict: EnchantmentConflict = {
      name,
      bonus,
      items: entries.map((e) => ({
        itemId: e.itemId,
        itemName: e.itemName,
        slot: e.slot,
        value: e.parsedValue,
        valueStr: e.enchantment.modifier?.toString() ?? '0',
        isEffective: e.parsedValue === maxValue
      }))
    }

    const normalizedName = normalizeString(name)

    if (!conflicts[normalizedName]) {
      conflicts[normalizedName] = []
    }

    conflicts[normalizedName].push(conflict)
  })

  return conflicts
}

/**
 * Checks if a specific enchantment on an item would conflict with currently equipped items.
 * A potential conflict is only checked against items from the same owner.
 */
export const checkPotentialConflict = (
  enchantment: LootEnchantment,
  equippedItems: GearItem[],
  slot?: GearSlot,
  slottedAugments?: Record<
    string,
    Record<number, import('./types').GearAugment | null>
  >
): { isConflict: boolean; currentMax: number; isRedundant: boolean } => {
  const parsedValue = parseModifierValue(enchantment.modifier)
  const normalizedTargetName = normalizeString(enchantment.name)
  const normalizedTargetBonus = getBonus(enchantment.bonus)
  const targetOwner = slot ? getSlotOwner(slot) : 'character'

  let currentMax = -Infinity
  let foundMatch = false

  equippedItems.forEach((item) => {
    if (getSlotOwner(item.slot) !== targetOwner) {
      return
    }

    // Check inherent enchantments
    item.enchantments?.forEach((ench) => {
      if (
        normalizeString(ench.name) === normalizedTargetName &&
        getBonus(ench.bonus) === normalizedTargetBonus
      ) {
        foundMatch = true
        const val = parseModifierValue(ench.modifier)

        if (val > currentMax) {
          currentMax = val
        }
      }
    })

    // Check slotted augments
    if (slottedAugments?.[item.id]) {
      Object.values(slottedAugments[item.id]).forEach((aug) => {
        aug?.effectsAdded?.forEach((ench) => {
          if (
            normalizeString(ench.name) === normalizedTargetName &&
            getBonus(ench.bonus) === normalizedTargetBonus
          ) {
            foundMatch = true

            const val = parseModifierValue(ench.modifier)

            if (val > currentMax) {
              currentMax = val
            }
          }
        })
      })
    }
  })

  if (!foundMatch) {
    return { isConflict: false, currentMax: 0, isRedundant: false }
  }

  return {
    isConflict: true,
    currentMax,
    // Redundant ONLY if the exact same value already exists.
    // If our value is higher than currentMax, it's not redundant (it's an upgrade).
    // If our value is lower than currentMax, it's not redundant in the context of "exact match"
    // although it is ineffective. The UI will show "Conflicts: <currentMax>".
    isRedundant: parsedValue === currentMax
  }
}
