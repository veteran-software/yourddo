import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { type Curse, type GearAugment, type GearItem, type GearSetup, GearSlot } from './types.ts'

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
//     curseName: string | null
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
    string | null // curseName
  ][]
]

export interface GearPermalinkPayload {
  setup: GearSetup
}

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

      items.push([slot, item.name, augments, curseName])
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
    if (!text) return { ok: false }
    const payload = JSON.parse(text) as V1Payload

    const [name, minLevel, maxLevel, classes, weaponFilters, armorFilters, shieldFilters, allowMetalWithDruid, items] =
      payload

    const setup: GearSetup = {
      id: `pl-${Date.now()}`,
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
      slottedCurses: {}
    }

    items.forEach(([slot, itemName, augments, curseName]) => {
      const item = allItems.find((i) => i.name === itemName)
      if (item) {
        const gearSlot = slot as GearSlot
        setup.slots[gearSlot] = item

        if (augments.length > 0) {
          setup.slottedAugments[item.id] = {}
          augments.forEach(([idx, augName]) => {
            const augment = allAugments.find((a) => a.name === augName)
            if (augment) {
              setup.slottedAugments[item.id][idx] = augment
            }
          })
        }

        if (curseName) {
          const curse = allCurses.find((c) => c.name === curseName)
          if (curse) {
            setup.slottedCurses[item.id] = curse
          }
        }
      }
    })

    return { ok: true, data: setup }
  } catch {
    return { ok: false }
  }
}

// ----- URL helpers -----
export interface LocationLike {
  pathname: string
  search: string
}

export const readGpFromUrl = (
  location: LocationLike,
  win: Window = window
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
        if (gpFromHash) return { gp: gpFromHash, source: 'hash' }
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
  win: Window = window
): Promise<void> => {
  if (!source) return

  if (source === 'search') {
    await navigate({ pathname: location.pathname, search: '' }, { replace: true })
    return
  }

  if (typeof win === 'undefined' || typeof win.history.replaceState !== 'function') return

  const { origin, pathname, hash, search } = win.location
  const hashBody = (hash || '').replace(/^#/, '')
  const [hashPath, hashQuery] = hashBody.split('?')
  const params = new URLSearchParams(hashQuery)
  params.delete('gp')
  const newHash = params.toString() ? `#${hashPath}?${params.toString()}` : `#${hashPath}`
  const newUrl = `${origin}${pathname}${search}${newHash}`
  win.history.replaceState({}, '', newUrl)
}

export const buildPermalinkUrl = (encoded: string, location: LocationLike, win: Window = window): string => {
  if (typeof win === 'undefined') {
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
