import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string'
import augmentMaster from '../../data/augments/augmentMaster.ts'
import {
  ALL_SLOT_KEYS,
  DATASET,
  type ItemAugmentSlotState,
  type ItemState
} from './types.ts'

// ----- Internal: runtime dictionaries and constants (computed once per module load) -----
const ENHANCEMENT_NAME_TO_ID: Map<string, number> = (() => {
  const names = DATASET.map((e) => e.name).toSorted((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
  const map = new Map<string, number>()
  names.forEach((n, i) => map.set(n, i))
  return map
})()

const AUGMENT_NAME_TO_ID: Map<string, number> = (() => {
  const names = augmentMaster.map((a) => a.name).toSorted((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
  const map = new Map<string, number>()
  names.forEach((n, i) => map.set(n, i))
  return map
})()

const EFFECT_NAME_TO_ID: Map<string, number> = (() => {
  const set = new Set<string>()
  augmentMaster.forEach((a) => {
    const effects = (a as unknown as { effectsAdded?: { name?: string }[] }).effectsAdded
    effects?.forEach((e) => {
      if (e.name) set.add(e.name)
    })
  })
  const names = Array.from(set).toSorted((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
  const map = new Map<string, number>()
  names.forEach((n, i) => map.set(n, i))
  return map
})()

const SLOT_INDEX: Map<string, number> = (() => {
  const map = new Map<string, number>()
  ALL_SLOT_KEYS.forEach((s, i) => map.set(s.key, i))
  return map
})()

const COLOR_CODE: Record<string, number> = { colorless: 0, red: 1, blue: 2, yellow: 3, green: 4, purple: 5, orange: 6 }

const COLOR_FROM_CODE: string[] = Object.entries(COLOR_CODE)
  .sort((a, b) => a[1] - b[1])
  .map(([k]) => k)

// ----- Types for compact v2 payload -----
type V2ItemSlot = [
  s: number, // slot index
  ml: number, // 0 = inherit, else explicit ML
  mark: 0 | 1, // hasCannithMark
  p: number, // 0 = none, else enhancementId+1
  su: number, // 0 = none, else enhancementId+1
  x: number, // 0 = none, else enhancementId+1
  aug: [color: number, augId: number, mode: 0 | 1, filters?: number[]][]
]

interface V2Payload {
  v: 2
  ml: number
  a: number[] // active slot indices
  c: number[] // collapsed slot indices
  i: V2ItemSlot[]
}

export interface PermalinkStatePayload {
  items: Record<string, ItemState>
  activeKeys: string[]
  collapsedKeys: string[]
  masterMinLevel: number
}

// ----- Helpers -----
const genId = (): string =>
  (globalThis.crypto as Crypto | undefined)?.randomUUID() ??
  // eslint-disable-next-line sonarjs/pseudo-random
  `cc-${Date.now().toString()}-${Math.random().toString(36).slice(2)}`

// ----- Encoding -----
export const encodeCannithPermalink = (args: {
  items: Record<string, ItemState>
  activeKeys: string[]
  collapsedKeys: string[]
  masterMinLevel: number
}): string => {
  const { items, activeKeys, collapsedKeys, masterMinLevel } = args

  const active = activeKeys.map((k) => SLOT_INDEX.get(k) ?? -1).filter((i) => i >= 0)
  const collapsed = collapsedKeys.map((k) => SLOT_INDEX.get(k) ?? -1).filter((i) => i >= 0)

  const encEnh = (name: string | null): number => (name ? (ENHANCEMENT_NAME_TO_ID.get(name) ?? -1) + 1 : 0)

  const itemSlots: V2ItemSlot[] = active.map((slotIdx) => {
    const slotKey = ALL_SLOT_KEYS[slotIdx].key
    const it = items[slotKey]
    const ml = it.minLevelOverride ?? 0
    const mark: 0 | 1 = it.hasCannithMark ? 1 : 0
    const p = encEnh(it.prefix)
    const su = encEnh(it.suffix)
    const x = encEnh(it.hasCannithMark ? it.extra : null)
    const aug: V2ItemSlot[6] = it.augmentSlots.map((s) => {
      const color = COLOR_CODE[s.slotType] ?? 0
      const augId = s.selectedAugment ? (AUGMENT_NAME_TO_ID.get(s.selectedAugment.name) ?? -1) + 1 : 0
      const mode: 0 | 1 = s.filterMode === 'AND' ? 1 : 0
      const filters = s.filters.map((fx) => EFFECT_NAME_TO_ID.get(fx)).filter((n): n is number => typeof n === 'number')
      return filters.length ? [color, augId, mode, filters] : [color, augId, mode]
    })
    return [slotIdx, ml, mark, p, su, x, aug]
  })

  const payload: V2Payload = { v: 2, ml: masterMinLevel, a: active, c: collapsed, i: itemSlots }
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

// ----- Decoding -----
export const tryDecodeCannithPermalink = (cc: string): { ok: true; data: PermalinkStatePayload } | { ok: false } => {
  try {
    const text = decompressFromEncodedURIComponent(cc)
    if (!text) return { ok: false }
    const obj = JSON.parse(text) as unknown
    const v = (obj as { v?: number }).v
    if (v !== 2) return { ok: false }
    const p = obj as V2Payload

    const activeKeysDecoded = p.a.map((i) => ALL_SLOT_KEYS[i]?.key).filter(Boolean)
    const collapsedDecoded = p.c.map((i) => ALL_SLOT_KEYS[i]?.key).filter(Boolean)

    const enhById = new Map<number, string>(
      Array.from(ENHANCEMENT_NAME_TO_ID.entries()).map(([name, id]) => [id, name])
    )
    const augById = new Map<number, string>(Array.from(AUGMENT_NAME_TO_ID.entries()).map(([name, id]) => [id, name]))
    const effectById = new Map<number, string>(Array.from(EFFECT_NAME_TO_ID.entries()).map(([name, id]) => [id, name]))

    const nextItems: Record<string, ItemState> = {}

    p.i.forEach(([slotIdx, ml, mark, pId, suId, xId, augArr]) => {
      const slotKey = ALL_SLOT_KEYS[slotIdx]?.key
      if (!slotKey) return

      const decodeEnh = (n: number): string | null => (n > 0 ? (enhById.get(n - 1) ?? null) : null)
      const item: ItemState = {
        slotKey,
        prefix: decodeEnh(pId),
        suffix: decodeEnh(suId),
        extra: mark ? decodeEnh(xId) : null,
        hasCannithMark: Boolean(mark),
        augmentSlots: [],
        minLevelOverride: ml || null,
        bindingOverride: null
      }

      item.augmentSlots = augArr.map((a) => {
        const colorCode = a[0]
        const color = COLOR_FROM_CODE[colorCode] ?? 'colorless'
        const augId = a[1]
        const mode: 'OR' | 'AND' = a[2] === 1 ? 'AND' : 'OR'
        const filtersIdx = a[3] ?? []
        const filters = filtersIdx.map((id) => effectById.get(id)).filter((s): s is string => !!s)
        const selectedAugmentName = augId > 0 ? (augById.get(augId - 1) ?? null) : null
        const selectedAugment = selectedAugmentName
          ? (augmentMaster.find((am) => am.name === selectedAugmentName) ?? null)
          : null

        return {
          id: genId(),
          slotType: color,
          selectedAugment,
          filters,
          filterMode: mode
        } as ItemAugmentSlotState
      })

      nextItems[slotKey] = item
    })

    return {
      ok: true,
      data: {
        items: nextItems,
        activeKeys: activeKeysDecoded,
        collapsedKeys: collapsedDecoded,
        masterMinLevel: p.ml
      }
    }
  } catch {
    return { ok: false }
  }
}

// ----- URL helpers (BrowserRouter + HashRouter) -----
export interface LocationLike {
  pathname: string
  search: string
}

export const readCcFromUrl = (
  location: LocationLike,
  win: Window = window
): { cc: string | null; source: 'search' | 'hash' | null } => {
  try {
    const routerParams = new URLSearchParams(location.search)
    const ccFromRouter = routerParams.get('cc')
    if (ccFromRouter) return { cc: ccFromRouter, source: 'search' }

    const hash = win.location.hash
    if (hash.startsWith('#')) {
      const hashBody = hash.slice(1)
      const qm = hashBody.indexOf('?')
      if (qm >= 0) {
        const query = hashBody.slice(qm + 1)
        const hashParams = new URLSearchParams(query)
        const ccFromHash = hashParams.get('cc')
        if (ccFromHash) return { cc: ccFromHash, source: 'hash' }
      }
    }
  } catch {
    // ignore
  }
  return { cc: null, source: null }
}

export const removeCcFromUrl = async (
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
  params.delete('cc')
  const newHash = params.toString() ? `#${hashPath}?${params.toString()}` : `#${hashPath}`
  const newUrl = `${origin}${pathname}${search}${newHash}`
  win.history.replaceState({}, '', newUrl)
}

export const buildPermalinkUrl = (encoded: string, location: LocationLike, win: Window = window): string => {
  if (typeof win === 'undefined') {
    return `/cannith-crafting?cc=${encoded}`
  }
  const { origin, pathname, hash } = win.location
  const currentPath = location.pathname || '/cannith-crafting'
  if (hash.startsWith('#/')) {
    const params = new URLSearchParams()
    params.set('cc', encoded)
    return `${origin}${pathname}#${currentPath}?${params.toString()}`
  }
  const url = new URL(origin + currentPath)
  url.searchParams.set('cc', encoded)
  return url.toString()
}
