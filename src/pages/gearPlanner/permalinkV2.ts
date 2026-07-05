import traceOfMadnessData from '../../data/traceOfMadness.json'
import { getSlotOwner } from './conflictResolver'
import { canApplyCurse, isEssenceCraftedName, reconstructEssenceCraftedItem } from './helpers'
import { initialPetState } from './initialState'
import { pickPlannerSetupMetadata } from './plannerStateFields'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type PetState,
  type UpgradeEntry
} from './types'
import { createEmptyItemUpgrades, createUpgradeViews, setItemUpgradeState } from './upgradeState'

export interface PermalinkSetupPayloadV2 {
  name: string
  minLevel: number
  maxLevel: number
  classes: (string | null)[]
  weaponFilters: string[]
  armorFilters: string[]
  shieldFilters: string[]
  allowMetalWithDruid: boolean
}

export interface PermalinkItemPayloadV2 {
  slot: GearSlot
  itemName: string
  itemId: string | null
  augments: [number, string][]
  curseName: string | null
  essenceCrafting: [string, string][] | null
  nearlyFinished: LootEnchantment | null
  almostThere: LootEnchantment | null
  finishingTouch: LootEnchantment | null
  ritualTable: LootEnchantment | null
  lostPurpose: LootEnchantment | null
  traceOfMadness: LootEnchantment | string | null
  mythicBoost: LootEnchantment | null
  filigrees: (string | null)[] | null
  unlockedFiligreeSlots: number | null
  slottedGemSetBonuses: (string | null)[] | null
  itemMinLevel: number | null
  itemMaterial: string | null
  isFountainUpgraded: boolean
  isStormreaverUpgraded: boolean
  isZhentarimUpgraded: boolean
  reaperForge: string | null
}

type TraceOfMadnessImportValue = LootEnchantment | string | null

export interface PermalinkPayloadV2 {
  version: 2
  setup: PermalinkSetupPayloadV2
  items: PermalinkItemPayloadV2[]
}

const isGearSlot = (value: string): value is GearSlot => {
  return (Object.values(GearSlot) as string[]).includes(value)
}

const getTargetState = (setup: GearSetup, gearSlot: GearSlot): GearSetup | PetState => {
  const owner = getSlotOwner(gearSlot)
  if (owner === 'artificer_pet') return setup.artificerPet
  if (owner === 'druid_pet') return setup.druidPet
  return setup
}

const decodeFiligrees = (
  item: GearItem,
  state: GearSetup | PetState,
  filigrees: (string | null)[] | null,
  allItems: GearItem[]
) => {
  if (filigrees) {
    state.slottedFiligrees[item.id] = filigrees.map((fName) => {
      if (!fName) return null
      return allItems.find((i) => i.name === fName) ?? null
    })
  }
}

const applyBooleanUpgradeFlags = (
  state: GearSetup | PetState,
  itemId: string,
  isFountainUpgraded: boolean,
  isStormreaverUpgraded: boolean,
  isZhentarimUpgraded: boolean
) => {
  if (isFountainUpgraded) setItemUpgradeState(state.itemUpgrades, itemId, 'fountainOfNecroticMight', true)
  if (isStormreaverUpgraded) setItemUpgradeState(state.itemUpgrades, itemId, 'stormreaverUpgrade', true)
  if (isZhentarimUpgraded) setItemUpgradeState(state.itemUpgrades, itemId, 'zhentarimAttuned', true)
}

const applyTraceOfMadnessUpgrade = (
  state: GearSetup | PetState,
  itemId: string,
  traceOfMadness: TraceOfMadnessImportValue
) => {
  if (!traceOfMadness) return

  if (typeof traceOfMadness === 'string') {
    const upgradeEntry = (traceOfMadnessData as UpgradeEntry[]).find((u) => u.name === traceOfMadness)
    setItemUpgradeState(state.itemUpgrades, itemId, 'traceOfMadness', upgradeEntry?.effectsAdded[0] ?? null)
    return
  }

  setItemUpgradeState(state.itemUpgrades, itemId, 'traceOfMadness', traceOfMadness)
}

const decodeSupplementaryProperties = (
  item: GearItem,
  state: GearSetup | PetState,
  allItems: GearItem[],
  options: {
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
    mythicBoost: LootEnchantment | null
    reaperForge: string | null
    traceOfMadness: LootEnchantment | string | null
  }
) => {
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
    mythicBoost,
    reaperForge,
    traceOfMadness
  } = options

  if (nearlyFinished) setItemUpgradeState(state.itemUpgrades, item.id, 'nearlyFinished', nearlyFinished)
  if (almostThere) setItemUpgradeState(state.itemUpgrades, item.id, 'almostThere', almostThere)
  if (finishingTouch) setItemUpgradeState(state.itemUpgrades, item.id, 'finishingTouch', finishingTouch)
  if (ritualTable) setItemUpgradeState(state.itemUpgrades, item.id, 'ritualTable', ritualTable)
  if (lostPurpose) setItemUpgradeState(state.itemUpgrades, item.id, 'lostPurpose', lostPurpose)
  applyTraceOfMadnessUpgrade(state, item.id, traceOfMadness)
  applyBooleanUpgradeFlags(state, item.id, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)
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

const decodePermalinkItemPayload = (
  itemPayload: PermalinkItemPayloadV2,
  setup: GearSetup,
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[]
) => {
  const {
    slot,
    itemName,
    itemId,
    augments,
    curseName,
    essenceCrafting,
    nearlyFinished,
    almostThere,
    finishingTouch,
    ritualTable,
    lostPurpose,
    traceOfMadness,
    mythicBoost,
    filigrees,
    unlockedFiligreeSlots,
    slottedGemSetBonuses,
    itemMinLevel,
    itemMaterial,
    isFountainUpgraded,
    isStormreaverUpgraded,
    isZhentarimUpgraded,
    reaperForge
  } = itemPayload

  if (!isGearSlot(slot)) return

  const gearSlot = slot

  let item = itemId ? allItems.find((i) => i.id === itemId) : null
  item ??= allItems.find((i) => i.name === itemName && i.slot === gearSlot) ?? allItems.find((i) => i.name === itemName)

  if (!item && isEssenceCraftedName(itemName)) {
    item = reconstructEssenceCraftedItem(itemName, gearSlot, itemMinLevel ?? setup.minLevel)
  }

  if (!item) return

  item = { ...item }
  if (itemMinLevel != null) item.minLevel = String(itemMinLevel)
  if (itemMaterial != null) item.material = itemMaterial

  const state = getTargetState(setup, gearSlot)

  state.slots[gearSlot] = item
  decodeItemAugments(item, augments, allAugments, state)
  decodeItemCurse(item, curseName, allCurses, state)
  decodeItemEssenceCrafting(item, essenceCrafting, state)
  decodeSupplementaryProperties(item, state, allItems, {
    nearlyFinished,
    almostThere: almostThere ?? null,
    finishingTouch: finishingTouch ?? null,
    ritualTable,
    lostPurpose,
    filigrees,
    unlockedFiligreeSlots,
    slottedGemSetBonuses,
    isFountainUpgraded,
    isStormreaverUpgraded,
    isZhentarimUpgraded,
    mythicBoost: mythicBoost ?? null,
    reaperForge,
    traceOfMadness: traceOfMadness ?? null
  })
}

const decodeItemAugments = (
  item: GearItem,
  augments: [number, string][],
  allAugments: GearAugment[],
  state: GearSetup | PetState
) => {
  if (augments.length > 0) {
    state.slottedAugments[item.id] = {}
    augments.forEach(([idx, augName]) => {
      const augment = allAugments.find((a) => a.name === augName)
      if (augment) state.slottedAugments[item.id][idx] = augment
    })
  }
}

const decodeItemCurse = (item: GearItem, curseName: string | null, allCurses: Curse[], state: GearSetup | PetState) => {
  if (curseName && canApplyCurse(item)) {
    const curse = allCurses.find((c) => c.name === curseName)
    if (curse) state.slottedCurses[item.id] = curse
  }
}

const decodeItemEssenceCrafting = (
  item: GearItem,
  essenceCrafting: [string, string][] | null,
  state: GearSetup | PetState
) => {
  if (essenceCrafting && essenceCrafting.length > 0) {
    state.slottedEssenceEnchantments[item.id] = {}
    essenceCrafting.forEach(([slotName, enchId]) => {
      state.slottedEssenceEnchantments[item.id][slotName] = enchId
    })
  }
}

export const buildPermalinkItemPayloadV2 = (
  slot: GearSlot,
  item: GearItem,
  setup: GearSetup
): PermalinkItemPayloadV2 => {
  const owner = getSlotOwner(slot)
  let state: GearSetup | PetState = setup
  if (owner === 'artificer_pet') state = setup.artificerPet
  if (owner === 'druid_pet') state = setup.druidPet

  const itemAugs = state.slottedAugments[item.id] ?? {}
  const augments: [number, string][] = []
  for (const [idx, aug] of Object.entries(itemAugs)) {
    if (aug) {
      augments.push([Number(idx), aug.name])
    }
  }

  const essenceEnch = state.slottedEssenceEnchantments[item.id] ?? {}
  const essenceCrafting: [string, string][] | null = Object.entries(essenceEnch)
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([slotName, id]) => [slotName, id])

  const itemUpgrade = createUpgradeViews(state.itemUpgrades)
  const filigrees = state.slottedFiligrees[item.id] ?? []

  return {
    slot,
    itemName: item.name,
    itemId: item.id,
    augments,
    curseName: canApplyCurse(item) ? (state.slottedCurses[item.id]?.name ?? null) : null,
    essenceCrafting: essenceCrafting.length > 0 ? essenceCrafting : null,
    nearlyFinished: itemUpgrade.slottedNearlyFinished[item.id] ?? null,
    almostThere: itemUpgrade.slottedAlmostThere[item.id] ?? null,
    finishingTouch: itemUpgrade.slottedFinishingTouch[item.id] ?? null,
    ritualTable: itemUpgrade.slottedRitualTable[item.id] ?? null,
    lostPurpose: itemUpgrade.slottedLostPurpose[item.id] ?? null,
    traceOfMadness: itemUpgrade.slottedTraceOfMadness[item.id] ?? null,
    mythicBoost: itemUpgrade.slottedMythicBoost[item.id] ?? null,
    filigrees: filigrees.map((f) => (f ? f.name : null)),
    unlockedFiligreeSlots: state.unlockedFiligreeSlots[item.id] ?? null,
    slottedGemSetBonuses: state.slottedGemSetBonuses[item.id] ?? null,
    itemMinLevel: Number(item.minLevel) || null,
    itemMaterial: item.material || null,
    isFountainUpgraded: itemUpgrade.slottedFountainOfNecroticMight[item.id] ?? false,
    isStormreaverUpgraded: itemUpgrade.slottedStormreaverUpgrade[item.id] ?? false,
    isZhentarimUpgraded: itemUpgrade.slottedZhentarimAttuned[item.id] ?? false,
    reaperForge: itemUpgrade.slottedReaperForge[item.id] ?? null
  }
}

export const buildPermalinkPayloadV2 = (setup: GearSetup): PermalinkPayloadV2 => {
  const items: PermalinkItemPayloadV2[] = []
  const allSlots = {
    ...setup.slots,
    ...setup.artificerPet.slots,
    ...setup.druidPet.slots
  }

  Object.entries(allSlots).forEach(([slot, item]) => {
    if (item && isGearSlot(slot)) {
      items.push(buildPermalinkItemPayloadV2(slot, item, setup))
    }
  })

  return {
    version: 2,
    setup: pickPlannerSetupMetadata(setup),
    items
  }
}

export const isPermalinkPayloadV2 = (payload: unknown): payload is PermalinkPayloadV2 => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return false
  }

  return (payload as { version?: unknown }).version === 2
}

export const decodePermalinkPayloadV2 = (
  payload: PermalinkPayloadV2,
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[]
): GearSetup => {
  const setup: GearSetup = {
    id: `pl-${Date.now().toString()}`,
    name: payload.setup.name,
    minLevel: payload.setup.minLevel,
    maxLevel: payload.setup.maxLevel,
    classes: payload.setup.classes,
    weaponFilters: payload.setup.weaponFilters,
    armorFilters: payload.setup.armorFilters,
    shieldFilters: payload.setup.shieldFilters,
    allowMetalWithDruid: payload.setup.allowMetalWithDruid,
    slots: {} as Record<GearSlot, GearItem | null>,
    slottedAugments: {},
    slottedCurses: {},
    slottedFiligrees: {},
    unlockedFiligreeSlots: {},
    slottedGemSetBonuses: {},
    slottedEssenceEnchantments: {},
    itemUpgrades: createEmptyItemUpgrades(),
    artificerPet: initialPetState(),
    druidPet: initialPetState()
  }

  payload.items.forEach((itemPayload) => {
    decodePermalinkItemPayload(itemPayload, setup, allItems, allAugments, allCurses)
  })

  return setup
}
