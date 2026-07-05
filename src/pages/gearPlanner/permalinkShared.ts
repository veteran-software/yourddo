import traceOfMadnessData from '../../data/traceOfMadness.json'
import { getSlotOwner } from './conflictResolver'
import { canApplyCurse } from './helpers'
import type { Curse, GearAugment, GearItem, GearSetup, LootEnchantment, PetState, UpgradeEntry } from './types'
import { setItemUpgradeState } from './upgradeState'

export const getTargetState = (setup: GearSetup, gearSlot: string): GearSetup | PetState => {
  const owner = getSlotOwner(gearSlot)
  if (owner === 'artificer_pet') return setup.artificerPet
  if (owner === 'druid_pet') return setup.druidPet
  return setup
}

export const decodeFiligrees = (
  item: GearItem,
  state: GearSetup | PetState,
  filigrees: (string | null)[] | null,
  allItems: GearItem[]
): void => {
  if (!filigrees) {
    return
  }

  state.slottedFiligrees[item.id] = filigrees.map((fName) => {
    if (!fName) {
      return null
    }

    return allItems.find((i) => i.name === fName) ?? null
  })
}

export const decodeItemAugments = (
  item: GearItem,
  augments: [number, string][],
  allAugments: GearAugment[],
  state: GearSetup | PetState
): void => {
  if (augments.length === 0) {
    return
  }

  state.slottedAugments[item.id] = {}
  augments.forEach(([idx, augName]) => {
    const augment = allAugments.find((a) => a.name === augName)
    if (augment) {
      state.slottedAugments[item.id][idx] = augment
    }
  })
}

export const decodeItemCurse = (
  item: GearItem,
  curseName: string | null,
  allCurses: Curse[],
  state: GearSetup | PetState
): void => {
  if (!curseName || !canApplyCurse(item)) {
    return
  }

  const curse = allCurses.find((c) => c.name === curseName)
  if (curse) {
    state.slottedCurses[item.id] = curse
  }
}

export const decodeItemEssenceCrafting = (
  item: GearItem,
  essenceCrafting: [string, string][] | null,
  state: GearSetup | PetState
): void => {
  if (!essenceCrafting || essenceCrafting.length === 0) {
    return
  }

  state.slottedEssenceEnchantments[item.id] = {}
  essenceCrafting.forEach(([slotName, enchId]) => {
    state.slottedEssenceEnchantments[item.id][slotName] = enchId
  })
}

interface DecodeSupplementaryPropertiesOptions {
  nearlyFinished: LootEnchantment | null
  almostThere: LootEnchantment | null
  finishingTouch: LootEnchantment | null
  ritualTable: LootEnchantment | null
  lostPurpose: LootEnchantment | null
  filigrees: (string | null)[] | null
  unlockedFiligreeSlots: number | null
  slottedGemSetBonuses: (string | null)[] | null
  isFountainUpgraded: boolean
  isStormreaverUpgraded: boolean
  isZhentarimUpgraded: boolean
  traceOfMadness: LootEnchantment | string | null
  mythicBoost?: LootEnchantment | null
  reaperForge?: string | null
}

const applyTraceOfMadnessUpgrade = (
  state: GearSetup | PetState,
  itemId: string,
  traceOfMadness: LootEnchantment | string | null
): void => {
  if (!traceOfMadness) {
    return
  }

  if (typeof traceOfMadness === 'string') {
    const upgradeEntry = (traceOfMadnessData as UpgradeEntry[]).find((u) => u.name === traceOfMadness)
    setItemUpgradeState(state.itemUpgrades, itemId, 'traceOfMadness', upgradeEntry?.effectsAdded[0] ?? null)
    return
  }

  setItemUpgradeState(state.itemUpgrades, itemId, 'traceOfMadness', traceOfMadness)
}

const applyBooleanUpgradeFlags = (
  state: GearSetup | PetState,
  itemId: string,
  flags: [boolean, 'fountainOfNecroticMight' | 'stormreaverUpgrade' | 'zhentarimAttuned'][]
): void => {
  for (const [enabled, upgradeKey] of flags) {
    if (enabled) {
      setItemUpgradeState(state.itemUpgrades, itemId, upgradeKey, true)
    }
  }
}

export const decodeSupplementaryProperties = (
  item: GearItem,
  state: GearSetup | PetState,
  allItems: GearItem[],
  options: DecodeSupplementaryPropertiesOptions
): void => {
  const {
    nearlyFinished,
    almostThere,
    finishingTouch,
    ritualTable,
    lostPurpose,
    filigrees,
    unlockedFiligreeSlots,
    slottedGemSetBonuses,
    isFountainUpgraded,
    isStormreaverUpgraded,
    isZhentarimUpgraded,
    traceOfMadness,
    mythicBoost,
    reaperForge
  } = options

  if (nearlyFinished) setItemUpgradeState(state.itemUpgrades, item.id, 'nearlyFinished', nearlyFinished)
  if (almostThere) setItemUpgradeState(state.itemUpgrades, item.id, 'almostThere', almostThere)
  if (finishingTouch) setItemUpgradeState(state.itemUpgrades, item.id, 'finishingTouch', finishingTouch)
  if (ritualTable) setItemUpgradeState(state.itemUpgrades, item.id, 'ritualTable', ritualTable)
  if (lostPurpose) setItemUpgradeState(state.itemUpgrades, item.id, 'lostPurpose', lostPurpose)

  applyTraceOfMadnessUpgrade(state, item.id, traceOfMadness)
  applyBooleanUpgradeFlags(state, item.id, [
    [isFountainUpgraded, 'fountainOfNecroticMight'],
    [isStormreaverUpgraded, 'stormreaverUpgrade'],
    [isZhentarimUpgraded, 'zhentarimAttuned']
  ])
  if (mythicBoost) setItemUpgradeState(state.itemUpgrades, item.id, 'mythicBoost', mythicBoost)
  if (reaperForge) setItemUpgradeState(state.itemUpgrades, item.id, 'reaperForge', reaperForge)

  decodeFiligrees(item, state, filigrees, allItems)

  if (unlockedFiligreeSlots != null) {
    state.unlockedFiligreeSlots[item.id] = unlockedFiligreeSlots
  }
  if (slottedGemSetBonuses) {
    state.slottedGemSetBonuses[item.id] = slottedGemSetBonuses
  }
}
