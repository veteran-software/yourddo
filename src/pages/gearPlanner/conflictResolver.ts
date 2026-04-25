import { getDisplayEnchantments } from './helpers'
import { ARTIFICER_PET_SLOTS, DRUID_PET_SLOTS, type GearItem, GearSlot, type LootEnchantment } from './types'

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

/**
 * Determines the owner of a specified slot.
 *
 * @param {string} slot - The name of the gear slot to check.
 * @returns {string} Returns the owner of the slot, which can be one of
 *                   'artificer_pet', 'druid_pet', or 'character'.
 */
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

  // If the bonus is numeric, it's typically an untyped/stacking bonus in DDO data
  if (normalized !== '' && !Number.isNaN(Number(normalized))) {
    return 'no type'
  }

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
  slottedAugments?: Record<string, Record<number, import('./types').GearAugment | null>>,
  slottedNearlyFinished?: Record<string, LootEnchantment | null>,
  slottedRitualTable?: Record<string, LootEnchantment | null>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>,
  slottedFountainOfNecroticMight: Record<string, boolean> = {},
  slottedStormreaverUpgrade: Record<string, boolean> = {},
  slottedZhentarimAttuned: Record<string, boolean> = {}
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

    const isFountainUpgraded = slottedFountainOfNecroticMight[item.id] ?? false
    const isStormreaverUpgraded = slottedStormreaverUpgrade[item.id] ?? false
    const isZhentarimUpgraded = slottedZhentarimAttuned[item.id] ?? false
    const baseEnchantments = getDisplayEnchantments(
      item,
      isFountainUpgraded,
      isStormreaverUpgraded,
      isZhentarimUpgraded
    )

    if (Array.isArray(baseEnchantments)) {
      baseEnchantments
        .filter(
          (e) =>
            e.name !== 'Craftable Rune Arm' &&
            e.name !== 'Nearly Finished' &&
            e.name !== 'Lost Purpose' &&
            e.name !== 'Ritual Table' &&
            e.name !== 'Sealed in Fire' &&
            e.name !== 'Sealed in Undeath' &&
            e.name !== 'Zhentarim Attuned' &&
            e.name !== 'Upgradeable Item (Black Abbot)' &&
            e.name !== 'Upgradeable Item (Stormreaver)'
        )
        .forEach((ench) => {
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

    const nearlyFinished = slottedNearlyFinished?.[item.id]
    if (nearlyFinished) {
      const enchWithModifier = {
        ...nearlyFinished,
        modifier: nearlyFinished.modifier ?? 'Enhancement'
      }
      allEnchantments.push({
        itemId: item.id,
        itemName: item.name,
        slot: item.slot,
        enchantment: enchWithModifier,
        parsedValue: parseModifierValue(enchWithModifier.modifier),
        owner,
        normalizedName: normalizeString(enchWithModifier.name),
        normalizedBonus: getBonus(enchWithModifier.bonus)
      })
    }

    const ritualTable = slottedRitualTable?.[item.id]
    if (ritualTable) {
      const enchWithModifier = {
        ...ritualTable,
        modifier: ritualTable.modifier ?? 'Enhancement'
      }
      allEnchantments.push({
        itemId: item.id,
        itemName: item.name,
        slot: item.slot,
        enchantment: enchWithModifier,
        parsedValue: parseModifierValue(enchWithModifier.modifier),
        owner,
        normalizedName: normalizeString(enchWithModifier.name),
        normalizedBonus: getBonus(enchWithModifier.bonus)
      })
    }

    const lostPurpose = slottedLostPurpose?.[item.id]
    if (lostPurpose) {
      const enchWithModifier = {
        ...lostPurpose,
        modifier: lostPurpose.modifier ?? 'Enhancement'
      }
      allEnchantments.push({
        itemId: item.id,
        itemName: item.name,
        slot: item.slot,
        enchantment: enchWithModifier,
        parsedValue: parseModifierValue(enchWithModifier.modifier),
        owner,
        normalizedName: normalizeString(enchWithModifier.name),
        normalizedBonus: getBonus(enchWithModifier.bonus)
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

  allEnchantments.forEach((entry, idx) => {
    // Bug #3: "no type" bonuses stack and should not be grouped for conflict resolution
    const key =
      entry.normalizedBonus === 'no type'
        ? `${entry.owner}|${entry.normalizedName}|no-type-${String(idx)}`
        : `${entry.owner}|${entry.normalizedName}|${entry.normalizedBonus}`

    if (!(key in grouped)) {
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

    if (!(normalizedName in conflicts)) {
      conflicts[normalizedName] = []
    }

    conflicts[normalizedName].push(conflict)
  })

  return conflicts
}

const findMatchingInherent = (
  item: GearItem,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedFountainOfNecroticMight: Record<string, boolean> = {},
  slottedStormreaverUpgrade: Record<string, boolean> = {},
  slottedZhentarimAttuned: Record<string, boolean> = {}
) => {
  let max = -Infinity
  const isFountainUpgraded = slottedFountainOfNecroticMight[item.id] ?? false
  const isStormreaverUpgraded = slottedStormreaverUpgrade[item.id] ?? false
  const isZhentarimUpgraded = slottedZhentarimAttuned[item.id] ?? false
  const baseEnchantments = getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)

  if (Array.isArray(baseEnchantments)) {
    baseEnchantments
      .filter(
        (e) =>
          e.name !== 'Nearly Finished' &&
          e.name !== 'Sealed in Fire' &&
          e.name !== 'Sealed in Undeath' &&
          e.name !== 'Zhentarim Attuned'
      )
      .forEach((ench) => {
        if (normalizeString(ench.name) === normalizedTargetName && getBonus(ench.bonus) === normalizedTargetBonus) {
          const val = parseModifierValue(ench.modifier)
          if (val > max) {
            max = val
          }
        }
      })
  }

  return max
}

const findMatchingNearlyFinished = (
  itemId: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedNearlyFinished?: Record<string, LootEnchantment | null>
) => {
  const nearlyFinished = slottedNearlyFinished?.[itemId]
  if (
    nearlyFinished &&
    normalizeString(nearlyFinished.name) === normalizedTargetName &&
    getBonus(nearlyFinished.bonus) === normalizedTargetBonus
  ) {
    return parseModifierValue(nearlyFinished.modifier ?? 'Enhancement')
  }
  return -Infinity
}

const findMatchingRitualTable = (
  itemId: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedRitualTable?: Record<string, LootEnchantment | null>
) => {
  const ritualTable = slottedRitualTable?.[itemId]
  if (
    ritualTable &&
    normalizeString(ritualTable.name) === normalizedTargetName &&
    getBonus(ritualTable.bonus) === normalizedTargetBonus
  ) {
    return parseModifierValue(ritualTable.modifier ?? 'Enhancement')
  }
  return -Infinity
}

const findMatchingLostPurpose = (
  itemId: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
) => {
  const lostPurpose = slottedLostPurpose?.[itemId]
  if (
    lostPurpose &&
    normalizeString(lostPurpose.name) === normalizedTargetName &&
    getBonus(lostPurpose.bonus) === normalizedTargetBonus
  ) {
    return parseModifierValue(lostPurpose.modifier ?? 'Enhancement')
  }
  return -Infinity
}

const findMatchingAugments = (
  itemId: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedAugments?: Record<string, Record<number, import('./types').GearAugment | null>>,
  ignoreSlotIndex?: number
) => {
  let max = -Infinity
  if (slottedAugments?.[itemId]) {
    Object.entries(slottedAugments[itemId]).forEach(([slotIdxStr, aug]) => {
      const slotIdx = Number(slotIdxStr)
      if (ignoreSlotIndex !== undefined && slotIdx === ignoreSlotIndex) {
        return
      }

      aug?.effectsAdded?.forEach((ench) => {
        if (normalizeString(ench.name) === normalizedTargetName && getBonus(ench.bonus) === normalizedTargetBonus) {
          const val = parseModifierValue(ench.modifier)
          if (val > max) max = val
        }
      })
    })
  }
  return max
}

const lostPurposeMax = (
  isSameItem: boolean,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  item: GearItem,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
) => {
  if (isSameItem) {
    return -Infinity
  }

  return findMatchingLostPurpose(item.id, normalizedTargetName, normalizedTargetBonus, slottedLostPurpose)
}

const nearlyFinishedMax = (
  isSameItem: boolean,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  item: GearItem,
  slottedNearlyFinished?: Record<string, LootEnchantment | null>
) => {
  if (isSameItem) {
    return -Infinity
  }

  return findMatchingNearlyFinished(item.id, normalizedTargetName, normalizedTargetBonus, slottedNearlyFinished)
}

const ritualTableMax = (
  isSameItem: boolean,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  item: GearItem,
  slottedRitualTable?: Record<string, LootEnchantment | null>
) => {
  if (isSameItem) {
    return -Infinity
  }

  return findMatchingRitualTable(item.id, normalizedTargetName, normalizedTargetBonus, slottedRitualTable)
}

const inherentMax = (
  isSameItem: boolean,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  item: GearItem,
  slottedFountainOfNecroticMight: Record<string, boolean> = {},
  slottedStormreaverUpgrade: Record<string, boolean> = {},
  slottedZhentarimAttuned: Record<string, boolean> = {}
) => {
  if (isSameItem) {
    return -Infinity
  }

  return findMatchingInherent(
    item,
    normalizedTargetName,
    normalizedTargetBonus,
    slottedFountainOfNecroticMight,
    slottedStormreaverUpgrade,
    slottedZhentarimAttuned
  )
}

const getItemEnchantmentMax = (
  item: GearItem,
  targetOwner: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  slottedAugments?: Record<string, Record<number, import('./types').GearAugment | null>>,
  slottedNearlyFinished?: Record<string, LootEnchantment | null>,
  slottedRitualTable?: Record<string, LootEnchantment | null>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>,
  slottedFountainOfNecroticMight: Record<string, boolean> = {},
  slottedStormreaverUpgrade: Record<string, boolean> = {},
  slottedZhentarimAttuned: Record<string, boolean> = {},
  ignoreItemId?: string,
  ignoreSlotIndex?: number
): number => {
  const isSameItem: boolean = item.id === ignoreItemId
  if (getSlotOwner(item.slot) !== targetOwner) {
    return -Infinity
  }

  if (
    normalizedTargetName === 'nearly finished' ||
    normalizedTargetName === 'lost purpose' ||
    normalizedTargetName === 'ritual table' ||
    normalizedTargetName === 'zhentarim attuned'
  ) {
    return -Infinity
  }

  const augMax: number = findMatchingAugments(
    item.id,
    normalizedTargetName,
    normalizedTargetBonus,
    slottedAugments,
    isSameItem ? ignoreSlotIndex : undefined
  )

  return Math.max(
    inherentMax(
      isSameItem,
      normalizedTargetName,
      normalizedTargetBonus,
      item,
      slottedFountainOfNecroticMight,
      slottedStormreaverUpgrade,
      slottedZhentarimAttuned
    ),
    nearlyFinishedMax(isSameItem, normalizedTargetName, normalizedTargetBonus, item, slottedNearlyFinished),
    ritualTableMax(isSameItem, normalizedTargetName, normalizedTargetBonus, item, slottedRitualTable),
    augMax,
    lostPurposeMax(isSameItem, normalizedTargetName, normalizedTargetBonus, item, slottedLostPurpose)
  )
}

/**
 * Checks if a specific enchantment on an item would conflict with currently equipped items.
 * A potential conflict is only checked against items from the same owner.
 */
export const checkPotentialConflict = (
  enchantment: LootEnchantment,
  equippedItems: GearItem[],
  slot?: GearSlot,
  slottedAugments?: Record<string, Record<number, import('./types').GearAugment | null>>,
  slottedNearlyFinished?: Record<string, LootEnchantment | null>,
  slottedRitualTable?: Record<string, LootEnchantment | null>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>,
  slottedFountainOfNecroticMight: Record<string, boolean> = {},
  slottedStormreaverUpgrade: Record<string, boolean> = {},
  slottedZhentarimAttuned: Record<string, boolean> = {},
  ignoreItemId?: string,
  ignoreSlotIndex?: number
): { isConflict: boolean; currentMax: number; isRedundant: boolean; isUpgrade?: boolean; isOverpowered?: boolean } => {
  const parsedValue = parseModifierValue(enchantment.modifier)
  const normalizedTargetName: string = normalizeString(enchantment.name)

  // Skip conflict check for upgrade placeholder enchantments
  if (
    normalizedTargetName === 'nearly finished' ||
    normalizedTargetName === 'lost purpose' ||
    normalizedTargetName === 'ritual table' ||
    normalizedTargetName === 'zhentarim attuned'
  ) {
    return { isConflict: false, currentMax: 0, isRedundant: false }
  }

  const normalizedTargetBonus: string = getBonus(enchantment.bonus)

  // Bug #3: "no type" bonuses stack and never conflict
  if (normalizedTargetBonus === 'no type') {
    return { isConflict: false, currentMax: 0, isRedundant: false }
  }

  const targetOwner = slot ? getSlotOwner(slot) : 'character'

  let currentMax = -Infinity
  let foundMatch = false

  for (const item of equippedItems) {
    const itemMax = getItemEnchantmentMax(
      item,
      targetOwner,
      normalizedTargetName,
      normalizedTargetBonus,
      slottedAugments,
      slottedNearlyFinished,
      slottedRitualTable,
      slottedLostPurpose,
      slottedFountainOfNecroticMight,
      slottedStormreaverUpgrade,
      slottedZhentarimAttuned,
      ignoreItemId,
      ignoreSlotIndex
    )

    if (itemMax !== -Infinity) {
      foundMatch = true
      if (itemMax > currentMax) {
        currentMax = itemMax
      }
    }
  }

  if (!foundMatch) {
    return { isConflict: false, currentMax: 0, isRedundant: false }
  }

  return {
    isConflict: true,
    currentMax,
    isRedundant: parsedValue === currentMax,
    isUpgrade: parsedValue > currentMax,
    isOverpowered: parsedValue < currentMax
  }
}
