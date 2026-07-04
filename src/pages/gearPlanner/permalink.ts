import LZString from 'lz-string'
import traceOfMadnessData from '../../data/traceOfMadness.json'
import {
  buildQueryParamUrl,
  type LocationLike,
  readQueryParamFromLocation,
  removeQueryParamFromLocation
} from '../../utils/urlHelpers.ts'
import { getSlotOwner } from './conflictResolver.ts'
import { canApplyCurse, isEssenceCraftedName, reconstructEssenceCraftedItem } from './helpers.ts'
import { initialPetState } from './initialState.ts'
import {
  buildPermalinkPayloadV2,
  decodePermalinkPayloadV2,
  isPermalinkPayloadV2,
  type PermalinkPayloadV2
} from './permalinkV2.ts'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type PetState,
  type UpgradeEntry
} from './types.ts' // ----- Types for compact v1 payload -----
import { createEmptyItemUpgrades, setItemUpgradeState } from './upgradeState'

// ----- Types for compact v1 payload -----
// We use a compact format to keep the URL short.
// V1 Payload structure:
// [
//   name: string,
//   minLevel: number,
//   maxLevel: number,
//   classes: (string | null)[],
//   weaponFilters: string[],
//   armorFilters: string[],
//   shieldFilters: string[],
//   allowMetalWithDruid: 0 | 1,
//   items: [
//     slot: string,
//     itemName: string,
//     augments: [slotIndex: number, augmentName: string][],
//     curseName: string | null,
//     essenceCrafting: [slotName: string, enchantmentId: string][] | null,
//     nearlyFinished: LootEnchantment | null,
//     ritualTable: LootEnchantment | null,
//     lostPurpose: LootEnchantment | null,
//     slottedFiligrees: (string | null)[] | null,
//     unlockedFiligreeSlots: number | null,
//     slottedGemSetBonuses: (string | null)[] | null,
//     itemMinLevel: number | null,
//     itemMaterial: string | null,
//     isFountainUpgraded: 0 | 1 | null,
//     isStormreaverUpgraded: 0 | 1 | null,
//     itemId: string | null,
//     isZhentarimUpgraded: 0 | 1 | null
//   ][]
// ]

type EncodedBoolean = 0 | 1
type OptionalEncodedBoolean = EncodedBoolean | null

type V1Payload = [
  string, // name
  number, // minLevel
  number, // maxLevel
  (string | null)[], // classes
  string[], // weaponFilters
  string[], // armorFilters
  string[], // shieldFilters
  EncodedBoolean, // allowMetalWithDruid
  [
    string, // slot (GearSlot)
    string, // itemName
    [number, string][], // augments: [slotIndex, augmentName]
    string | null, // curseName
    [string, string][] | null, // essenceCrafting: [slotName, enchantmentId]
    LootEnchantment | null, // nearlyFinished
    LootEnchantment | null, // ritualTable
    LootEnchantment | null, // lostPurpose
    (string | null)[] | null, // slottedFiligrees (item names)
    number | null, // unlockedFiligreeSlots
    (string | null)[] | null, // slottedGemSetBonuses
    number | null, // itemMinLevel
    string | null, // itemMaterial
    OptionalEncodedBoolean, // isFountainUpgraded
    OptionalEncodedBoolean, // isStormreaverUpgraded
    string | null, // itemId
    OptionalEncodedBoolean, // isZhentarimUpgraded
    LootEnchantment | string | null, // traceOfMadness
    LootEnchantment | null, // almostThere
    LootEnchantment | null // finishingTouch
  ][]
]

// ----- Encoding -----
export const encodeGearPermalink = (setup: GearSetup): string => {
  return LZString.compressToEncodedURIComponent(JSON.stringify(buildPermalinkPayloadV2(setup)))
}

// ----- Decoding -----
export const tryDecodeGearPermalink = (
  gp: string,
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[]
): { ok: true; data: GearSetup } | { ok: false } => {
  try {
    const text = LZString.decompressFromEncodedURIComponent(gp)

    if (!text) {
      return { ok: false }
    }

    const payload = JSON.parse(text) as V1Payload | PermalinkPayloadV2

    if (Array.isArray(payload)) {
      const [
        name,
        minLevel,
        maxLevel,
        classes,
        weaponFilters,
        armorFilters,
        shieldFilters,
        allowMetalWithDruid,
        items
      ] = payload

      const setup: GearSetup = {
        id: `pl-${Date.now().toString()}`,
        name,
        minLevel,
        maxLevel,
        classes,
        weaponFilters,
        armorFilters,
        shieldFilters,
        allowMetalWithDruid: Boolean(allowMetalWithDruid),
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

      if (Array.isArray(items)) {
        items.forEach((itemPayload) => {
          decodeItemPayload(itemPayload, allItems, allAugments, allCurses, setup)
        })
      }

      return { ok: true, data: setup }
    }

    if (isPermalinkPayloadV2(payload)) {
      return { ok: true, data: decodePermalinkPayloadV2(payload, allItems, allAugments, allCurses) }
    }

    return { ok: false }
  } catch {
    return { ok: false }
  }
}

const getTargetState = (setup: GearSetup, gearSlot: GearSlot): GearSetup | PetState => {
  const owner = getSlotOwner(gearSlot)
  if (owner === 'artificer_pet') return setup.artificerPet
  if (owner === 'druid_pet') return setup.druidPet
  return setup
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
  isFountainUpgraded: OptionalEncodedBoolean
  isStormreaverUpgraded: OptionalEncodedBoolean
  isZhentarimUpgraded: OptionalEncodedBoolean
  traceOfMadness: LootEnchantment | string | null
}

const decodeSupplementaryProperties = (
  item: GearItem,
  state: GearSetup | PetState,
  allItems: GearItem[],
  {
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
    traceOfMadness
  }: DecodeSupplementaryPropertiesOptions
) => {
  if (nearlyFinished) setItemUpgradeState(state.itemUpgrades, item.id, 'nearlyFinished', nearlyFinished)
  if (almostThere) setItemUpgradeState(state.itemUpgrades, item.id, 'almostThere', almostThere)
  if (finishingTouch) setItemUpgradeState(state.itemUpgrades, item.id, 'finishingTouch', finishingTouch)
  if (ritualTable) setItemUpgradeState(state.itemUpgrades, item.id, 'ritualTable', ritualTable)
  if (lostPurpose) setItemUpgradeState(state.itemUpgrades, item.id, 'lostPurpose', lostPurpose)
  if (traceOfMadness) {
    if (typeof traceOfMadness === 'string') {
      // Legacy format: string was the upgrade name — look up the enchantment
      const upgradeEntry = (traceOfMadnessData as UpgradeEntry[]).find((u) => u.name === traceOfMadness)
      setItemUpgradeState(state.itemUpgrades, item.id, 'traceOfMadness', upgradeEntry?.effectsAdded[0] ?? null)
    } else {
      setItemUpgradeState(state.itemUpgrades, item.id, 'traceOfMadness', traceOfMadness)
    }
  }
  if (isFountainUpgraded) setItemUpgradeState(state.itemUpgrades, item.id, 'fountainOfNecroticMight', true)
  if (isStormreaverUpgraded) setItemUpgradeState(state.itemUpgrades, item.id, 'stormreaverUpgrade', true)
  if (isZhentarimUpgraded) setItemUpgradeState(state.itemUpgrades, item.id, 'zhentarimAttuned', true)

  decodeFiligrees(item, state, filigrees, allItems)

  if (unlockedFiligreeSlots != null) {
    state.unlockedFiligreeSlots[item.id] = unlockedFiligreeSlots
  }
  if (slottedGemSetBonuses) {
    state.slottedGemSetBonuses[item.id] = slottedGemSetBonuses
  }
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

const decodeItemPayload = (
  itemPayload: V1Payload[8][number],
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[],
  setup: GearSetup
) => {
  if (!Array.isArray(itemPayload)) return

  const decoded = decodeV1ItemPayload(itemPayload)
  if (!decoded) return

  const {
    slot,
    itemName,
    augments,
    curseName,
    essenceCrafting,
    nearlyFinished,
    ritualTable,
    lostPurpose,
    filigrees,
    unlockedFiligreeSlots,
    slottedGemSetBonuses,
    itemMinLevel,
    itemMaterial,
    isFountainUpgraded,
    isStormreaverUpgraded,
    itemId,
    isZhentarimUpgraded,
    traceOfMadness,
    almostThere,
    finishingTouch
  } = decoded

  // Find the item in allItems by ID (preferred) or name and slot
  if (!(Object.values(GearSlot) as string[]).includes(slot)) {
    return
  }
  const gearSlot = slot as GearSlot
  let item = itemId ? allItems.find((i) => i.id === itemId) : null

  item ??= allItems.find((i) => i.name === itemName && i.slot === gearSlot) ?? allItems.find((i) => i.name === itemName)

  if (!item && isEssenceCraftedName(itemName)) {
    item = reconstructEssenceCraftedItem(itemName, gearSlot, itemMinLevel ?? setup.minLevel)
  }

  if (!item) return

  // Clone to avoid modifying the original in allItems
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

interface DecodedV1ItemPayload {
  slot: string
  itemName: string
  augments: [number, string][]
  curseName: string | null
  essenceCrafting: [string, string][] | null
  nearlyFinished: LootEnchantment | null
  ritualTable: LootEnchantment | null
  lostPurpose: LootEnchantment | null
  filigrees: (string | null)[] | null
  unlockedFiligreeSlots: number | null
  slottedGemSetBonuses: (string | null)[] | null
  itemMinLevel: number | null
  itemMaterial: string | null
  isFountainUpgraded: OptionalEncodedBoolean
  isStormreaverUpgraded: OptionalEncodedBoolean
  itemId: string | null
  isZhentarimUpgraded: OptionalEncodedBoolean
  traceOfMadness: LootEnchantment | string | null
  almostThere: LootEnchantment | null
  finishingTouch: LootEnchantment | null
}

const decodeV1ItemPayload = (itemPayload: unknown[]): DecodedV1ItemPayload | null => {
  if (itemPayload.length >= 20) {
    const [
      slot,
      itemName,
      augments,
      curseName,
      essenceCrafting,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      filigrees,
      unlockedFiligreeSlots,
      slottedGemSetBonuses,
      itemMinLevel,
      itemMaterial,
      isFountainUpgraded,
      isStormreaverUpgraded,
      itemId,
      isZhentarimUpgraded,
      traceOfMadness,
      almostThere,
      finishingTouch
    ] = itemPayload as V1Payload[8][number]

    return {
      slot,
      itemName,
      augments,
      curseName,
      essenceCrafting,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      filigrees,
      unlockedFiligreeSlots,
      slottedGemSetBonuses,
      itemMinLevel,
      itemMaterial,
      isFountainUpgraded,
      isStormreaverUpgraded,
      itemId,
      isZhentarimUpgraded,
      traceOfMadness: traceOfMadness ?? null,
      almostThere: almostThere ?? null,
      finishingTouch: finishingTouch ?? null
    }
  }

  if (itemPayload.length >= 15) {
    const [
      slot,
      itemName,
      augments,
      curseName,
      essenceCrafting,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      filigrees,
      unlockedFiligreeSlots,
      slottedGemSetBonuses,
      itemMinLevel,
      itemMaterial,
      isFountainUpgraded,
      isStormreaverUpgraded
    ] = itemPayload as unknown as [
      string,
      string,
      [number, string][],
      string | null,
      [string, string][] | null,
      LootEnchantment | null,
      LootEnchantment | null,
      LootEnchantment | null,
      (string | null)[] | null,
      number | null,
      (string | null)[] | null,
      number | null,
      string | null,
      OptionalEncodedBoolean,
      OptionalEncodedBoolean
    ]

    return {
      slot,
      itemName,
      augments,
      curseName,
      essenceCrafting,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      filigrees,
      unlockedFiligreeSlots,
      slottedGemSetBonuses,
      itemMinLevel,
      itemMaterial,
      isFountainUpgraded,
      isStormreaverUpgraded,
      itemId: null,
      isZhentarimUpgraded: null,
      traceOfMadness: null,
      almostThere: null,
      finishingTouch: null
    }
  }

  return null
}

export const readGpFromUrl = (
  location: LocationLike,
  win?: Window
): { gp: string | null; source: 'search' | 'hash' | null } => {
  const result = readQueryParamFromLocation(location, 'gp', win)
  return { gp: result.value, source: result.source }
}

export const removeGpFromUrl = async (
  navigate: (to: { pathname?: string; search?: string }, opts: { replace: boolean }) => Promise<void> | void,
  location: LocationLike,
  source: 'search' | 'hash' | null,
  win?: Window
): Promise<void> => {
  await removeQueryParamFromLocation(navigate, location, source, 'gp', win)
}

export const buildPermalinkUrl = (encoded: string, location: LocationLike, win?: Window): string => {
  return buildQueryParamUrl(encoded, location, 'gp', '/gear-planner', win)
}
