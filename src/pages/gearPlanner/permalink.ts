import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment
} from './types.ts'

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
//     slottedGemSetBonuses: (string | null)[] | null
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
    (string | null)[] | null // slottedGemSetBonuses
  ][]
]

// ----- Encoding -----
export const encodeGearPermalink = (setup: GearSetup): string => {
  const items: V1Payload[8] = []

  Object.entries(setup.slots).forEach(([slot, item]) => {
    if (item) {
      const augments: [number, string][] = []
      const itemAugs = setup.slottedAugments[item.id]

      if (itemAugs) {
        Object.entries(itemAugs).forEach(([idx, aug]) => {
          if (aug) {
            augments.push([Number(idx), aug.name])
          }
        })
      }

      const curse = setup.slottedCurses[item.id]
      const curseName = curse ? curse.name : null

      const essenceEnch = setup.slottedEssenceEnchantments[item.id]
      const essenceEnchPayload: [string, string][] | null = essenceEnch
        ? Object.entries(essenceEnch)
            .filter((entry): entry is [string, string] => entry[1] !== null)
            .map(([slotName, id]) => [slotName, id])
        : null

      const nearlyFinished = setup.slottedNearlyFinished?.[item.id] ?? null
      const ritualTable = setup.slottedRitualTable?.[item.id] ?? null
      const lostPurpose = setup.slottedLostPurpose?.[item.id] ?? null

      const filigrees = setup.slottedFiligrees[item.id]
      const filigreeNames = filigrees
        ? filigrees.map((f) => (f ? f.name : null))
        : null

      const unlockedFiligreeSlots = setup.unlockedFiligreeSlots[item.id] ?? null
      const slottedGemSetBonuses = setup.slottedGemSetBonuses[item.id] ?? null

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
        slottedGemSetBonuses
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
      slottedNearlyFinished: {},
      slottedRitualTable: {},
      slottedLostPurpose: {}
    }

    items.forEach((itemPayload) => {
      decodeItemPayload(itemPayload, allItems, allAugments, allCurses, setup)
    })

    return { ok: true, data: setup }
  } catch {
    return { ok: false }
  }
}

const decodeItemPayload = (
  itemPayload: V1Payload[8][number],
  allItems: GearItem[],
  allAugments: GearAugment[],
  allCurses: Curse[],
  setup: GearSetup
) => {
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
    slottedGemSetBonuses
  ] = itemPayload

  // Find the item in allItems by name and slot to ensure we get the correct ID
  const gearSlot = slot as GearSlot
  if (!Object.values(GearSlot).includes(gearSlot)) {
    return
  }
  const item =
    allItems.find((i) => i.name === itemName && i.slot === gearSlot) ??
    allItems.find((i) => i.name === itemName)

  if (item) {
    setup.slots[gearSlot] = item
    decodeItemAugments(item, augments, allAugments, setup)
    decodeItemCurse(item, curseName, allCurses, setup)
    decodeItemEssenceCrafting(item, essenceCrafting, setup)
    if (nearlyFinished) setup.slottedNearlyFinished[item.id] = nearlyFinished
    if (ritualTable) setup.slottedRitualTable[item.id] = ritualTable
    if (lostPurpose) setup.slottedLostPurpose[item.id] = lostPurpose

    if (filigrees) {
      setup.slottedFiligrees[item.id] = filigrees.map((fName) => {
        if (!fName) return null
        return allItems.find((i) => i.name === fName) || null
      })
    }
    if (unlockedFiligreeSlots !== null && unlockedFiligreeSlots !== undefined) {
      setup.unlockedFiligreeSlots[item.id] = unlockedFiligreeSlots
    }
    if (slottedGemSetBonuses) {
      setup.slottedGemSetBonuses[item.id] = slottedGemSetBonuses
    }
  }
}

const decodeItemAugments = (
  item: GearItem,
  augments: [number, string][],
  allAugments: GearAugment[],
  setup: GearSetup
) => {
  if (augments.length > 0) {
    setup.slottedAugments[item.id] = {}
    augments.forEach(([idx, augName]) => {
      const augment = allAugments.find((a) => a.name === augName)
      if (augment) setup.slottedAugments[item.id][idx] = augment
    })
  }
}

const decodeItemCurse = (
  item: GearItem,
  curseName: string | null,
  allCurses: Curse[],
  setup: GearSetup
) => {
  if (curseName && item.slot !== GearSlot.Quiver) {
    const curse = allCurses.find((c) => c.name === curseName)
    if (curse) setup.slottedCurses[item.id] = curse
  }
}

const decodeItemEssenceCrafting = (
  item: GearItem,
  essenceCrafting: [string, string][] | null,
  setup: GearSetup
) => {
  if (essenceCrafting && essenceCrafting.length > 0) {
    setup.slottedEssenceEnchantments[item.id] = {}
    essenceCrafting.forEach(([slotName, enchId]) => {
      setup.slottedEssenceEnchantments[item.id][slotName] = enchId
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
  navigate: (
    to: { pathname?: string; search?: string },
    opts: { replace: boolean }
  ) => Promise<void> | void,
  location: LocationLike,
  source: 'search' | 'hash' | null,
  win: Window = globalThis as unknown as Window
): Promise<void> => {
  if (!source) return

  if (source === 'search') {
    await navigate(
      { pathname: location.pathname, search: '' },
      { replace: true }
    )

    return
  }

  if (win == undefined || typeof win.history.replaceState !== 'function') return

  const { origin, pathname, hash, search } = win.location
  const hashBody = (hash || '').replace(/^#/, '')
  const [hashPath, hashQuery] = hashBody.split('?')
  const params = new URLSearchParams(hashQuery)

  params.delete('gp')

  const newHash = params.toString()
    ? `#${hashPath}?${params.toString()}`
    : `#${hashPath}`

  const newUrl = `${origin}${pathname}${search}${newHash}`
  win.history.replaceState({}, '', newUrl)
}

export const buildPermalinkUrl = (
  encoded: string,
  location: LocationLike,
  win: Window = globalThis as unknown as Window
): string => {
  if (win == undefined) {
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
