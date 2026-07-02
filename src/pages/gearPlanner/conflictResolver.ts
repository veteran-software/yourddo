import { UPGRADE_PLACEHOLDER_ENCHANTMENTS } from './constants'
import { getDisplayEnchantments } from './helpers'
import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootEnchantment
} from './types'
import type {
  ItemUpgrades,
  LegacyBooleanUpgradeMap,
  LegacyLootEnchantmentMap,
  LegacyTraceOfMadnessMap
} from './upgradeState'
import { createUpgradeViews, getItemUpgradeView, resolveItemUpgrades } from './upgradeState'

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
interface ResolveConflictsOptions {
  slottedAugments?: Record<string, Record<number, GearAugment | null>>
  itemUpgrades?: ItemUpgrades
  slottedNearlyFinished?: LegacyLootEnchantmentMap
  slottedAlmostThere?: LegacyLootEnchantmentMap
  slottedFinishingTouch?: LegacyLootEnchantmentMap
  slottedRitualTable?: LegacyLootEnchantmentMap
  slottedLostPurpose?: LegacyLootEnchantmentMap
  slottedTraceOfMadness?: LegacyTraceOfMadnessMap
  slottedFountainOfNecroticMight?: LegacyBooleanUpgradeMap
  slottedStormreaverUpgrade?: LegacyBooleanUpgradeMap
  slottedZhentarimAttuned?: LegacyBooleanUpgradeMap
}

export const resolveConflicts = (
  equippedItems: GearItem[],
  options: ResolveConflictsOptions = {}
): Record<string, EnchantmentConflict[]> => {
  const { slottedAugments } = options
  const resolvedItemUpgrades = resolveItemUpgrades(options)
  const upgradeViews = createUpgradeViews(resolvedItemUpgrades)
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

  const pushUpgradeEnchantment = (ench: LootEnchantment, item: GearItem, owner: string) => {
    const enchWithModifier = { ...ench, modifier: ench.modifier ?? 'Enhancement' }
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

  equippedItems.forEach((item) => {
    const owner = getSlotOwner(item.slot)

    const itemUpgrade = getItemUpgradeView(resolvedItemUpgrades, item.id)
    const isFountainUpgraded = itemUpgrade.fountainOfNecroticMight ?? false
    const isStormreaverUpgraded = itemUpgrade.stormreaverUpgrade ?? false
    const isZhentarimUpgraded = itemUpgrade.zhentarimAttuned ?? false
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
            !UPGRADE_PLACEHOLDER_ENCHANTMENTS.has(e.name) &&
            !(normalizeString(e.name).includes('enhancement bonus') && !normalizeString(e.name).includes('to '))
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

    const nearlyFinished = upgradeViews.slottedNearlyFinished[item.id]
    if (nearlyFinished) pushUpgradeEnchantment(nearlyFinished, item, owner)

    const ritualTable = upgradeViews.slottedRitualTable[item.id]
    if (ritualTable) pushUpgradeEnchantment(ritualTable, item, owner)

    const lostPurpose = upgradeViews.slottedLostPurpose[item.id]
    if (lostPurpose) pushUpgradeEnchantment(lostPurpose, item, owner)

    const traceEnch = upgradeViews.slottedTraceOfMadness[item.id]
    if (traceEnch) pushUpgradeEnchantment(traceEnch, item, owner)

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
  itemUpgrades?: import('./upgradeState').ItemUpgrades
) => {
  let max = -Infinity
  const itemUpgrade = getItemUpgradeView(itemUpgrades, item.id)
  const isFountainUpgraded = itemUpgrade.fountainOfNecroticMight ?? false
  const isStormreaverUpgraded = itemUpgrade.stormreaverUpgrade ?? false
  const isZhentarimUpgraded = itemUpgrade.zhentarimAttuned ?? false
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
  itemUpgrades?: import('./upgradeState').ItemUpgrades
) => {
  const nearlyFinished = getItemUpgradeView(itemUpgrades, itemId).nearlyFinished
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
  itemUpgrades?: import('./upgradeState').ItemUpgrades
) => {
  const ritualTable = getItemUpgradeView(itemUpgrades, itemId).ritualTable
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
  itemUpgrades?: import('./upgradeState').ItemUpgrades
) => {
  const lostPurpose = getItemUpgradeView(itemUpgrades, itemId).lostPurpose
  if (
    lostPurpose &&
    normalizeString(lostPurpose.name) === normalizedTargetName &&
    getBonus(lostPurpose.bonus) === normalizedTargetBonus
  ) {
    return parseModifierValue(lostPurpose.modifier ?? 'Enhancement')
  }
  return -Infinity
}

const findMatchingTraceOfMadness = (
  itemId: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  itemUpgrades?: import('./upgradeState').ItemUpgrades
) => {
  const ench = getItemUpgradeView(itemUpgrades, itemId).traceOfMadness
  if (!ench) return -Infinity
  if (normalizeString(ench.name) === normalizedTargetName && getBonus(ench.bonus) === normalizedTargetBonus) {
    return parseModifierValue(ench.modifier ?? 'Enhancement')
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

interface GetItemEnchantmentMaxOptions {
  slottedAugments?: Record<string, Record<number, GearAugment | null>>
  itemUpgrades?: ItemUpgrades
  slottedNearlyFinished?: LegacyLootEnchantmentMap
  slottedAlmostThere?: LegacyLootEnchantmentMap
  slottedFinishingTouch?: LegacyLootEnchantmentMap
  slottedRitualTable?: LegacyLootEnchantmentMap
  slottedLostPurpose?: LegacyLootEnchantmentMap
  slottedTraceOfMadness?: LegacyTraceOfMadnessMap
  slottedFountainOfNecroticMight?: LegacyBooleanUpgradeMap
  slottedStormreaverUpgrade?: LegacyBooleanUpgradeMap
  slottedZhentarimAttuned?: LegacyBooleanUpgradeMap
  ignoreItemId?: string
  ignoreSlotIndex?: number
}

const getItemEnchantmentMax = (
  item: GearItem,
  targetOwner: string,
  normalizedTargetName: string,
  normalizedTargetBonus: string,
  options: GetItemEnchantmentMaxOptions = {}
): number => {
  const { slottedAugments, ignoreItemId, ignoreSlotIndex } = options
  const resolvedItemUpgrades = resolveItemUpgrades(options)
  const isSameItem: boolean = item.id === ignoreItemId
  if (getSlotOwner(item.slot) !== targetOwner) {
    return -Infinity
  }

  if (
    normalizedTargetName === 'nearly finished' ||
    normalizedTargetName === 'lost purpose' ||
    normalizedTargetName === 'trace of madness' ||
    normalizedTargetName === 'ritual table' ||
    normalizedTargetName === 'zhentarim attuned' ||
    (normalizedTargetName.includes('enhancement bonus') && !normalizedTargetName.includes('to '))
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

  // For the same item, only augments can contribute (the item's own upgrades don't compete with itself)
  if (isSameItem) return augMax

  return Math.max(
    findMatchingInherent(item, normalizedTargetName, normalizedTargetBonus, resolvedItemUpgrades),
    findMatchingNearlyFinished(item.id, normalizedTargetName, normalizedTargetBonus, resolvedItemUpgrades),
    findMatchingRitualTable(item.id, normalizedTargetName, normalizedTargetBonus, resolvedItemUpgrades),
    augMax,
    findMatchingLostPurpose(item.id, normalizedTargetName, normalizedTargetBonus, resolvedItemUpgrades),
    findMatchingTraceOfMadness(item.id, normalizedTargetName, normalizedTargetBonus, resolvedItemUpgrades)
  )
}

export interface CheckPotentialConflictOptions {
  slottedAugments?: Record<string, Record<number, GearAugment | null>>
  itemUpgrades?: ItemUpgrades
  slottedNearlyFinished?: LegacyLootEnchantmentMap
  slottedRitualTable?: LegacyLootEnchantmentMap
  slottedLostPurpose?: LegacyLootEnchantmentMap
  slottedTraceOfMadness?: LegacyTraceOfMadnessMap
  slottedFountainOfNecroticMight?: LegacyBooleanUpgradeMap
  slottedStormreaverUpgrade?: LegacyBooleanUpgradeMap
  slottedZhentarimAttuned?: LegacyBooleanUpgradeMap
  ignoreItemId?: string
  ignoreSlotIndex?: number
}

/**
 * Checks if a specific enchantment on an item would conflict with currently equipped items.
 * A potential conflict is only checked against items from the same owner.
 */
export const checkPotentialConflict = (
  enchantment: LootEnchantment,
  equippedItems: GearItem[],
  slot?: GearSlot,
  options: CheckPotentialConflictOptions = {}
): { isConflict: boolean; currentMax: number; isRedundant: boolean; isUpgrade?: boolean; isOverpowered?: boolean } => {
  const { slottedAugments, ignoreItemId, ignoreSlotIndex } = options
  const resolvedItemUpgrades = resolveItemUpgrades(options)
  const parsedValue = parseModifierValue(enchantment.modifier)
  const normalizedTargetName: string = normalizeString(enchantment.name)

  // Skip conflict check for upgrade placeholder enchantments and base item enhancement bonuses
  if (
    normalizedTargetName === 'nearly finished' ||
    normalizedTargetName === 'lost purpose' ||
    normalizedTargetName === 'trace of madness' ||
    normalizedTargetName === 'ritual table' ||
    normalizedTargetName === 'zhentarim attuned' ||
    (normalizedTargetName.includes('enhancement bonus') && !normalizedTargetName.includes('to '))
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
    const itemMax = getItemEnchantmentMax(item, targetOwner, normalizedTargetName, normalizedTargetBonus, {
      slottedAugments,
      itemUpgrades: resolvedItemUpgrades,
      ignoreItemId,
      ignoreSlotIndex
    })

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
