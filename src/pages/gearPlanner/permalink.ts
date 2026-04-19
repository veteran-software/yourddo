import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { getSlotOwner } from './conflictResolver.ts'
import { isEssenceCraftedName, reconstructEssenceCraftedItem } from './helpers.ts'
import { initialPetState } from './initialState.ts'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type PetState
} from './types.ts' // ----- Types for compact v1 payload -----

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
//     isFountainUpgraded: 0 | 1 | null
//   ][]
// ]

type V1Payload = [
  string, // name
  number, // minLevel
  number, // maxLevel
  (string | null)[], // classes
  string[], // weaponFilters
  string[], // armorFilters
  string[], // shieldFilters
  0 | 1, // allowMetalWithDruid
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
    0 | 1 | null // isFountainUpgraded
  ][]
]

// ----- Encoding -----
export const encodeGearPermalink = (setup: GearSetup): string => {
  const items: V1Payload[8] = []

  const allSlots = {
    ...setup.slots,
    ...setup.artificerPet.slots,
    ...setup.druidPet.slots
  }

  Object.entries(allSlots).forEach(([slot, item]) => {
    if (item) {
      const gearSlot = slot as GearSlot
      const owner = getSlotOwner(gearSlot)
      let state: GearSetup | PetState = setup
      if (owner === 'artificer_pet') state = setup.artificerPet
      if (owner === 'druid_pet') state = setup.druidPet

      const augments: [number, string][] = []
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const itemAugs = state.slottedAugments?.[item.id] as Record<number, GearAugment | null> | undefined

      if (itemAugs) {
        Object.entries(itemAugs).forEach(([idx, aug]) => {
          if (aug) {
            augments.push([Number(idx), aug.name])
          }
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const curse = state.slottedCurses?.[item.id]
      const curseName = curse ? curse.name : null

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const essenceEnch = state.slottedEssenceEnchantments?.[item.id] as Record<string, string | null> | undefined
      const essenceEnchPayload: [string, string][] | null = essenceEnch
        ? Object.entries(essenceEnch)
            .filter((entry): entry is [string, string] => entry[1] !== null)
            .map(([slotName, id]) => [slotName, id])
        : null

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const nearlyFinished = state.slottedNearlyFinished?.[item.id] ?? null
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const ritualTable = state.slottedRitualTable?.[item.id] ?? null
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const lostPurpose = state.slottedLostPurpose?.[item.id] ?? null

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const filigrees = state.slottedFiligrees?.[item.id] as (GearItem | null)[] | undefined
      const filigreeNames = filigrees ? filigrees.map((f) => (f ? f.name : null)) : null

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const unlockedFiligreeSlots = state.unlockedFiligreeSlots?.[item.id] ?? null
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const slottedGemSetBonuses = state.slottedGemSetBonuses?.[item.id] ?? null

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const isFountainUpgraded = state.slottedFountainOfNecroticMight?.[item.id] ?? false

      items.push([
        slot,
        item.name,
        augments,
        curseName,
        essenceEnchPayload,
        nearlyFinished,
        ritualTable,
        lostPurpose,
        filigreeNames,
        unlockedFiligreeSlots,
        slottedGemSetBonuses,
        Number(item.minLevel) || null,
        item.material || null,
        isFountainUpgraded ? 1 : 0
      ])
    }
  })

  const payload: V1Payload = [
    setup.name,
    setup.minLevel,
    setup.maxLevel,
    setup.classes,
    setup.weaponFilters,
    setup.armorFilters,
    setup.shieldFilters,
    setup.allowMetalWithDruid ? 1 : 0,
    items
  ]

  return compressToEncodedURIComponent(JSON.stringify(payload))
}

// ----- Decoding -----
export const tryDecodeGearPermalink = (
  gp: string,
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[]
): { ok: true; data: GearSetup } | { ok: false } => {
  try {
    const text = decompressFromEncodedURIComponent(gp)

    if (!text) {
      return { ok: false }
    }

    const payload = JSON.parse(text) as V1Payload

    const [name, minLevel, maxLevel, classes, weaponFilters, armorFilters, shieldFilters, allowMetalWithDruid, items] =
      payload

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
      slottedNearlyFinished: {},
      slottedRitualTable: {},
      slottedLostPurpose: {},
      slottedFountainOfNecroticMight: {},
      artificerPet: initialPetState(),
      druidPet: initialPetState()
    }

    if (Array.isArray(items)) {
      items.forEach((itemPayload) => {
        decodeItemPayload(itemPayload, allItems, allAugments, allCurses, setup)
      })
    }

    return { ok: true, data: setup }
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

const decodeSupplementaryProperties = (
  item: GearItem,
  state: GearSetup | PetState,
  allItems: GearItem[],
  nearlyFinished: LootEnchantment | null,
  ritualTable: LootEnchantment | null,
  lostPurpose: LootEnchantment | null,
  filigrees: (string | null)[] | null,
  unlockedFiligreeSlots: number | null,
  slottedGemSetBonuses: (string | null)[] | null,
  isFountainUpgraded: 0 | 1 | null
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (nearlyFinished && state.slottedNearlyFinished) state.slottedNearlyFinished[item.id] = nearlyFinished
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ritualTable && state.slottedRitualTable) state.slottedRitualTable[item.id] = ritualTable
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (lostPurpose && state.slottedLostPurpose) state.slottedLostPurpose[item.id] = lostPurpose
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (isFountainUpgraded && state.slottedFountainOfNecroticMight) state.slottedFountainOfNecroticMight[item.id] = true

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (filigrees && state.slottedFiligrees) {
    state.slottedFiligrees[item.id] = filigrees.map((fName) => {
      if (!fName) return null
      return allItems.find((i) => i.name === fName) ?? null
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (unlockedFiligreeSlots != null && state.unlockedFiligreeSlots) {
    state.unlockedFiligreeSlots[item.id] = unlockedFiligreeSlots
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (slottedGemSetBonuses && state.slottedGemSetBonuses) {
    state.slottedGemSetBonuses[item.id] = slottedGemSetBonuses
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
    isFountainUpgraded
  ] = itemPayload

  // Find the item in allItems by name and slot to ensure we get the correct ID
  const gearSlot = slot as GearSlot
  if (!Object.values(GearSlot).includes(gearSlot)) {
    return
  }
  let item =
    allItems.find((i) => i.name === itemName && i.slot === gearSlot) ?? allItems.find((i) => i.name === itemName)

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
  decodeSupplementaryProperties(
    item,
    state,
    allItems,
    nearlyFinished,
    ritualTable,
    lostPurpose,
    filigrees,
    unlockedFiligreeSlots,
    slottedGemSetBonuses,
    isFountainUpgraded
  )
}

const decodeItemAugments = (
  item: GearItem,
  augments: [number, string][],
  allAugments: GearAugment[],
  state: GearSetup | PetState
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (augments.length > 0 && state.slottedAugments) {
    state.slottedAugments[item.id] = {}
    augments.forEach(([idx, augName]) => {
      const augment = allAugments.find((a) => a.name === augName)
      if (augment) state.slottedAugments[item.id][idx] = augment
    })
  }
}

const decodeItemCurse = (item: GearItem, curseName: string | null, allCurses: Curse[], state: GearSetup | PetState) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (curseName && item.slot !== GearSlot.Quiver && state.slottedCurses) {
    const curse = allCurses.find((c) => c.name === curseName)
    if (curse) state.slottedCurses[item.id] = curse
  }
}

const decodeItemEssenceCrafting = (
  item: GearItem,
  essenceCrafting: [string, string][] | null,
  state: GearSetup | PetState
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (essenceCrafting && essenceCrafting.length > 0 && state.slottedEssenceEnchantments) {
    state.slottedEssenceEnchantments[item.id] = {}
    essenceCrafting.forEach(([slotName, enchId]) => {
      state.slottedEssenceEnchantments[item.id][slotName] = enchId
    })
  }
}

// ----- URL helpers -----
export interface LocationLike {
  pathname: string
  search: string
}

export const readGpFromUrl = (
  location: LocationLike,
  win: Window = globalThis as unknown as Window
): { gp: string | null; source: 'search' | 'hash' | null } => {
  try {
    const routerParams = new URLSearchParams(location.search)
    const gpFromRouter = routerParams.get('gp')

    if (gpFromRouter) return { gp: gpFromRouter, source: 'search' }

    const hash = win.location.hash

    if (hash.startsWith('#')) {
      const hashBody = hash.slice(1)
      const qm = hashBody.indexOf('?')

      if (qm >= 0) {
        const query = hashBody.slice(qm + 1)
        const hashParams = new URLSearchParams(query)
        const gpFromHash = hashParams.get('gp')

        if (gpFromHash) {
          return { gp: gpFromHash, source: 'hash' }
        }
      }
    }
  } catch {
    // ignore
  }

  return { gp: null, source: null }
}

export const removeGpFromUrl = async (
  navigate: (to: { pathname?: string; search?: string }, opts: { replace: boolean }) => Promise<void> | void,
  location: LocationLike,
  source: 'search' | 'hash' | null,
  win: Window = globalThis as unknown as Window
): Promise<void> => {
  if (!source) return

  if (source === 'search') {
    await navigate({ pathname: location.pathname, search: '' }, { replace: true })

    return
  }

  if ((win as Window | undefined) == undefined || typeof win.history.replaceState !== 'function') return

  const { origin, pathname, hash, search } = win.location
  const hashBody = (hash || '').replace(/^#/, '')
  const [hashPath, hashQuery] = hashBody.split('?')
  const params = new URLSearchParams(hashQuery)

  params.delete('gp')

  const newHash = params.toString() ? `#${hashPath}?${params.toString()}` : `#${hashPath}`

  const newUrl = `${origin}${pathname}${search}${newHash}`
  win.history.replaceState({}, '', newUrl)
}

export const buildPermalinkUrl = (
  encoded: string,
  location: LocationLike,
  win: Window = globalThis as unknown as Window
): string => {
  if ((win as Window | undefined) == undefined) {
    return `/gear-planner?gp=${encoded}`
  }

  const { origin, pathname, hash } = win.location
  const currentPath = location.pathname || '/gear-planner'

  if (hash.startsWith('#/')) {
    const params = new URLSearchParams()
    params.set('gp', encoded)
    return `${origin}${pathname}#${currentPath}?${params.toString()}`
  }
  const url = new URL(origin + currentPath)

  url.searchParams.set('gp', encoded)

  return url.toString()
}
