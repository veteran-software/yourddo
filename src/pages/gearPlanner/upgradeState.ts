import traceOfMadnessData from '../../data/traceOfMadness.json'
import type { LootEnchantment } from './types'

export interface ItemUpgradeState {
  nearlyFinished?: LootEnchantment | null
  almostThere?: LootEnchantment | null
  finishingTouch?: LootEnchantment | null
  ritualTable?: LootEnchantment | null
  lostPurpose?: LootEnchantment | null
  traceOfMadness?: LootEnchantment | null
  fountainOfNecroticMight?: boolean
  stormreaverUpgrade?: boolean
  zhentarimAttuned?: boolean
  reaperForge?: string | null
}

export type ItemUpgrades = Record<string, ItemUpgradeState>

export type ItemUpgradeKind = keyof ItemUpgradeState

export type LegacyLootEnchantmentMap = Record<string, LootEnchantment | null>
export type LegacyTraceOfMadnessMap = Record<string, LootEnchantment | null | string>
export type LegacyBooleanUpgradeMap = Record<string, boolean>
type EnchantmentUpgradeKind = Exclude<
  ItemUpgradeKind,
  'fountainOfNecroticMight' | 'stormreaverUpgrade' | 'zhentarimAttuned' | 'reaperForge'
>
type BooleanUpgradeKind = Extract<
  ItemUpgradeKind,
  'fountainOfNecroticMight' | 'stormreaverUpgrade' | 'zhentarimAttuned'
>
type EnchantmentViewKey = keyof Pick<
  UpgradeViews,
  | 'slottedNearlyFinished'
  | 'slottedAlmostThere'
  | 'slottedFinishingTouch'
  | 'slottedRitualTable'
  | 'slottedLostPurpose'
  | 'slottedTraceOfMadness'
>
type BooleanViewKey = keyof Pick<
  UpgradeViews,
  'slottedFountainOfNecroticMight' | 'slottedStormreaverUpgrade' | 'slottedZhentarimAttuned'
>

export interface UpgradeViews {
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedAlmostThere: Record<string, LootEnchantment | null>
  slottedFinishingTouch: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  slottedTraceOfMadness: Record<string, LootEnchantment | null>
  slottedFountainOfNecroticMight: Record<string, boolean>
  slottedStormreaverUpgrade: Record<string, boolean>
  slottedZhentarimAttuned: Record<string, boolean>
  slottedReaperForge: Record<string, string | null>
}

export const createEmptyItemUpgrades = (): ItemUpgrades => ({})

export const createEmptyItemUpgradeState = (): ItemUpgradeState => ({})

export const resolveItemUpgrades = (source: LegacySlottedProperties | undefined): ItemUpgrades => {
  if (source?.itemUpgrades) return source.itemUpgrades
  return migrateLegacyItemUpgrades(source, createEmptyItemUpgrades())
}

export const getItemUpgradeState = (itemUpgrades: ItemUpgrades | undefined, itemId: string): ItemUpgradeState => {
  return itemUpgrades?.[itemId] ?? {}
}

export const hasAnyItemUpgrade = (upgradeState: ItemUpgradeState | undefined): boolean => {
  if (!upgradeState) return false
  return Object.values(upgradeState).some((value) => value !== undefined && value !== null && value !== false)
}

export const setItemUpgradeState = <T extends ItemUpgradeKind>(
  itemUpgrades: ItemUpgrades,
  itemId: string,
  kind: T,
  value: ItemUpgradeState[T]
): void => {
  itemUpgrades[itemId] ??= {}
  itemUpgrades[itemId][kind] = value
}

export const clearItemUpgradeState = (itemUpgrades: ItemUpgrades, itemId: string): void => {
  Reflect.deleteProperty(itemUpgrades, itemId)
}

export const createUpgradeViews = (itemUpgrades: ItemUpgrades | undefined): UpgradeViews => {
  const result: UpgradeViews = {
    slottedNearlyFinished: {},
    slottedAlmostThere: {},
    slottedFinishingTouch: {},
    slottedRitualTable: {},
    slottedLostPurpose: {},
    slottedTraceOfMadness: {},
    slottedFountainOfNecroticMight: {},
    slottedStormreaverUpgrade: {},
    slottedZhentarimAttuned: {},
    slottedReaperForge: {}
  }

  if (!itemUpgrades) return result

  const enchantmentKinds: {
    kind: EnchantmentUpgradeKind
    view: EnchantmentViewKey
  }[] = [
    { kind: 'nearlyFinished', view: 'slottedNearlyFinished' },
    { kind: 'almostThere', view: 'slottedAlmostThere' },
    { kind: 'finishingTouch', view: 'slottedFinishingTouch' },
    { kind: 'ritualTable', view: 'slottedRitualTable' },
    { kind: 'lostPurpose', view: 'slottedLostPurpose' },
    { kind: 'traceOfMadness', view: 'slottedTraceOfMadness' }
  ]

  const booleanKinds: {
    kind: BooleanUpgradeKind
    view: BooleanViewKey
  }[] = [
    { kind: 'fountainOfNecroticMight', view: 'slottedFountainOfNecroticMight' },
    { kind: 'stormreaverUpgrade', view: 'slottedStormreaverUpgrade' },
    { kind: 'zhentarimAttuned', view: 'slottedZhentarimAttuned' }
  ]

  for (const [itemId, state] of Object.entries(itemUpgrades)) {
    for (const { kind, view } of enchantmentKinds) {
      const value = state[kind]
      if (value !== undefined) {
        result[view][itemId] = value ?? null
      }
    }

    for (const { kind, view } of booleanKinds) {
      const value = state[kind]
      if (value !== undefined) {
        result[view][itemId] = value
      }
    }

    if (state.reaperForge !== undefined) {
      result.slottedReaperForge[itemId] = state.reaperForge
    }
  }

  return result
}

export const getItemUpgradeView = (itemUpgrades: ItemUpgrades | undefined, itemId: string): ItemUpgradeState => {
  return itemUpgrades?.[itemId] ?? {}
}

export interface LegacySlottedProperties {
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

export const migrateLegacyItemUpgrades = (
  source: LegacySlottedProperties | undefined,
  target: ItemUpgrades
): ItemUpgrades => {
  if (!source) return target

  const applyEntries = <T>(sourceMap: Record<string, T> | undefined, apply: (itemId: string, value: T) => void) => {
    for (const [itemId, value] of Object.entries(sourceMap ?? {})) {
      apply(itemId, value)
    }
  }

  applyEntries(source.slottedNearlyFinished, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'nearlyFinished', value)
  })
  applyEntries(source.slottedAlmostThere, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'almostThere', value)
  })
  applyEntries(source.slottedFinishingTouch, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'finishingTouch', value)
  })
  applyEntries(source.slottedRitualTable, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'ritualTable', value)
  })
  applyEntries(source.slottedLostPurpose, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'lostPurpose', value)
  })

  for (const [itemId, value] of Object.entries(source.slottedTraceOfMadness ?? {})) {
    const resolved =
      typeof value === 'string'
        ? ((traceOfMadnessData as { name: string; effectsAdded: LootEnchantment[] }[]).find(
            (entry) => entry.name === value
          )?.effectsAdded[0] ?? null)
        : value
    setItemUpgradeState(target, itemId, 'traceOfMadness', resolved)
  }

  applyEntries(source.slottedFountainOfNecroticMight, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'fountainOfNecroticMight', value)
  })
  applyEntries(source.slottedStormreaverUpgrade, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'stormreaverUpgrade', value)
  })
  applyEntries(source.slottedZhentarimAttuned, (itemId, value) => {
    setItemUpgradeState(target, itemId, 'zhentarimAttuned', value)
  })

  return target
}
