import { getSlotOwner } from './conflictResolver'
import { canApplyCurse, isEssenceCraftedName, reconstructEssenceCraftedItem } from './helpers'
import { initialPetState } from './initialState'
import {
  decodeItemAugments,
  decodeItemCurse,
  decodeItemEssenceCrafting,
  decodeSupplementaryProperties,
  getTargetState
} from './permalinkShared'
import { pickPlannerSetupMetadata } from './plannerStateFields'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type PetState
} from './types'
import { createEmptyItemUpgrades, createUpgradeViews } from './upgradeState'

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

export interface PermalinkPayloadV2 {
  version: 2
  setup: PermalinkSetupPayloadV2
  items: PermalinkItemPayloadV2[]
}

const isGearSlot = (value: string): value is GearSlot => (Object.values(GearSlot) as string[]).includes(value)

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

  if (!(Object.values(GearSlot) as string[]).includes(slot)) return

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
