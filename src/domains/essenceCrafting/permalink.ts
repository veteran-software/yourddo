import LZString from 'lz-string'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import { LEGACY_V3_AUGMENT_NAMES, LEGACY_V3_EFFECT_NAMES } from './legacyPermalinkV3Data.ts'
import type { EssencePlanState, PlannedAugmentSlot, PlannedItem } from './plannerState.ts'
import { hydrateEssencePlan } from './plannerTransitions.ts'

export const ESSENCE_CRAFTING_PERMALINK_VERSION = 4
export const ESSENCE_CRAFTING_PERMALINK_QUERY_PARAMETER = 'cc'
export const ESSENCE_CRAFTING_PERMALINK_PATH = '/essence-crafting'

export type EssenceCraftingPermalinkV4Augment = [
  augmentSlotTypeId: string,
  augmentId: string,
  filterMode: 0 | 1,
  filterEffectIds?: string[]
]

export type EssenceCraftingPermalinkV4Item = [
  equipmentSlotId: string,
  minimumLevelOverride: number,
  hasCannithMark: 0 | 1,
  prefixEnhancementId: string,
  suffixEnhancementId: string,
  extraEnhancementId: string,
  augments: EssenceCraftingPermalinkV4Augment[]
]

export interface EssenceCraftingPermalinkV4Payload {
  v: typeof ESSENCE_CRAFTING_PERMALINK_VERSION
  ml: number
  c: string[]
  i: EssenceCraftingPermalinkV4Item[]
}

export type EssenceCraftingPermalinkDecodeFailure = 'malformed-payload' | 'unsupported-version'

export type EssenceCraftingPermalinkDecodeResult =
  { ok: true; version: 3 | 4; plan: EssencePlanState } | { ok: false; reason: EssenceCraftingPermalinkDecodeFailure }

const LEGACY_V3_SLOT_IDS: readonly EquipmentSlotId[] = [
  'main-hand',
  'off-hand',
  'rune-arm',
  'orb',
  'armor',
  'belt',
  'boots',
  'bracers',
  'cloak',
  'gloves',
  'goggles',
  'helmet',
  'necklace',
  'ring-1',
  'ring-2',
  'trinket',
  'shield'
]

const LEGACY_V3_AUGMENT_SLOT_TYPE_IDS = ['colorless', 'red', 'blue', 'yellow', 'green', 'purple', 'orange'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isIntegerNumber = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value)

const compareStableIds = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0)

const readString = (value: unknown): string => (typeof value === 'string' ? value : '')

const resolveUniqueNamedId = (
  displayName: string | undefined,
  records: readonly { id: string; displayName: string }[]
): string | null => {
  if (!displayName) return null
  const matches = records.filter((record) => record.displayName === displayName)
  return matches.length === 1 ? matches[0].id : null
}

const getCanonicalFilterEffectId = (data: EssenceCraftingData, displayName: string): string | undefined => {
  const ids = new Set<string>()
  for (const augment of data.augments) {
    for (const effect of augment.effects) {
      if (effect.displayName === displayName) ids.add(effect.id)
    }
  }
  return [...ids].sort(compareStableIds)[0]
}

const encodeV4Augment = (
  data: EssenceCraftingData,
  augmentSlot: PlannedAugmentSlot
): EssenceCraftingPermalinkV4Augment => {
  const filterEffectIds = augmentSlot.selectedEffectNames
    .map((effectName) => getCanonicalFilterEffectId(data, effectName))
    .filter((effectId): effectId is string => effectId !== undefined)
    .sort(compareStableIds)
  const base: EssenceCraftingPermalinkV4Augment = [
    augmentSlot.augmentSlotTypeId,
    augmentSlot.augmentId ?? '',
    augmentSlot.filterMode === 'and' ? 1 : 0
  ]
  if (filterEffectIds.length > 0) base.push(filterEffectIds)
  return base
}

const encodeV4Item = (
  data: EssenceCraftingData,
  equipmentSlotId: EquipmentSlotId,
  item: PlannedItem
): EssenceCraftingPermalinkV4Item => [
  equipmentSlotId,
  item.minimumLevelOverride ?? 0,
  item.hasCannithMark ? 1 : 0,
  item.prefixEnhancementId ?? '',
  item.suffixEnhancementId ?? '',
  item.hasCannithMark ? (item.extraEnhancementId ?? '') : '',
  [...item.augmentSlots]
    .sort((left, right) => compareStableIds(left.augmentSlotTypeId, right.augmentSlotTypeId))
    .map((augmentSlot) => encodeV4Augment(data, augmentSlot))
]

export const createEssenceCraftingPermalinkV4Payload = (
  data: EssenceCraftingData,
  plan: EssencePlanState
): EssenceCraftingPermalinkV4Payload => {
  const activeIds = new Set(plan.activeSlotIds)
  const orderedActiveSlotIds = EQUIPMENT_SLOTS.map(({ id }) => id).filter((id) => activeIds.has(id))
  const collapsedIds = new Set(plan.collapsedSlotIds)
  const items: EssenceCraftingPermalinkV4Item[] = []
  for (const equipmentSlotId of orderedActiveSlotIds) {
    const item = plan.itemsBySlotId[equipmentSlotId]
    if (item) items.push(encodeV4Item(data, equipmentSlotId, item))
  }

  return {
    v: ESSENCE_CRAFTING_PERMALINK_VERSION,
    ml: plan.masterMinimumLevel,
    c: orderedActiveSlotIds.filter((equipmentSlotId) => collapsedIds.has(equipmentSlotId)),
    i: items
  }
}

export const encodeEssenceCraftingPermalink = (data: EssenceCraftingData, plan: EssencePlanState): string =>
  LZString.compressToEncodedURIComponent(JSON.stringify(createEssenceCraftingPermalinkV4Payload(data, plan)))

const decodeV4Augments = (
  data: EssenceCraftingData,
  value: unknown
):
  | {
      augmentSlotTypeId: string
      augmentId: string | null
      selectedEffectNames: string[]
      filterMode: 'or' | 'and'
    }[]
  | null => {
  if (!Array.isArray(value)) return null
  const effectNameById = new Map<string, string>()
  for (const augment of data.augments) {
    for (const effect of augment.effects) effectNameById.set(effect.id, effect.displayName)
  }

  const decoded = []
  for (const candidate of value) {
    if (!Array.isArray(candidate) || candidate.length < 3 || typeof candidate[0] !== 'string') return null
    if (typeof candidate[1] !== 'string' || (candidate[2] !== 0 && candidate[2] !== 1)) return null
    if (candidate[3] !== undefined && !Array.isArray(candidate[3])) return null
    const selectedEffectNames = Array.isArray(candidate[3])
      ? candidate[3]
          .map((effectId) => (typeof effectId === 'string' ? effectNameById.get(effectId) : undefined))
          .filter((effectName): effectName is string => effectName !== undefined)
      : []
    decoded.push({
      augmentSlotTypeId: candidate[0],
      augmentId: candidate[1] || null,
      selectedEffectNames,
      filterMode: candidate[2] === 1 ? ('and' as const) : ('or' as const)
    })
  }
  return decoded
}

const decodeV4Payload = (data: EssenceCraftingData, payload: Record<string, unknown>): EssencePlanState | null => {
  if (!isFiniteNumber(payload.ml) || !Array.isArray(payload.c) || !Array.isArray(payload.i)) return null

  const activeSlotIds: string[] = []
  const itemsBySlotId: Record<string, unknown> = {}
  for (const candidate of payload.i) {
    if (!Array.isArray(candidate) || candidate.length < 7 || typeof candidate[0] !== 'string') return null
    if (!isFiniteNumber(candidate[1]) || (candidate[2] !== 0 && candidate[2] !== 1)) return null
    if (![candidate[3], candidate[4], candidate[5]].every((value) => typeof value === 'string')) return null
    const augmentSlots = decodeV4Augments(data, candidate[6])
    if (!augmentSlots) return null
    const equipmentSlotId = candidate[0]
    activeSlotIds.push(equipmentSlotId)
    itemsBySlotId[equipmentSlotId] = {
      minimumLevelOverride: candidate[1] || null,
      hasCannithMark: candidate[2] === 1,
      prefixEnhancementId: readString(candidate[3]) || null,
      suffixEnhancementId: readString(candidate[4]) || null,
      extraEnhancementId: candidate[2] === 1 ? readString(candidate[5]) || null : null,
      augmentSlots
    }
  }

  return hydrateEssencePlan(data, {
    masterMinimumLevel: payload.ml,
    activeSlotIds,
    collapsedSlotIds: payload.c,
    itemsBySlotId
  })
}

const createLegacyEnhancementIdByRecipeId = (data: EssenceCraftingData): ReadonlyMap<number, string> => {
  const recipeById = new Map(data.recipes.map((recipe) => [recipe.id, recipe]))
  const resolved = new Map<number, string>()
  const ambiguous = new Set<number>()
  for (const enhancement of data.enhancements) {
    const recipe = recipeById.get(enhancement.recipes.boundRecipeId)
    if (recipe?.kind !== 'enhancement-shard') continue
    const sourceRecipeId = Number(recipe.sourceRecipeId)
    if (!Number.isInteger(sourceRecipeId) || sourceRecipeId <= 0) continue
    if (resolved.has(sourceRecipeId)) ambiguous.add(sourceRecipeId)
    else resolved.set(sourceRecipeId, enhancement.id)
  }
  for (const sourceRecipeId of ambiguous) resolved.delete(sourceRecipeId)
  return resolved
}

const decodeLegacyV3Augments = (
  data: EssenceCraftingData,
  value: unknown
): {
  augmentSlotTypeId: string
  augmentId: string | null
  selectedEffectNames: string[]
  filterMode: 'or' | 'and'
}[] => {
  if (!Array.isArray(value)) return []
  const decoded = []
  for (const candidate of value) {
    if (!Array.isArray(candidate)) continue
    const tuple = candidate as unknown[]
    const colorCode = tuple[0]
    const augmentCode = tuple[1]
    const filterMode = tuple[2]
    const filterCodes = tuple[3]
    if (!isIntegerNumber(colorCode) || !isIntegerNumber(augmentCode)) continue
    const augmentSlotTypeId = LEGACY_V3_AUGMENT_SLOT_TYPE_IDS[colorCode] ?? 'colorless'
    const legacyAugmentName = augmentCode > 0 ? LEGACY_V3_AUGMENT_NAMES[augmentCode - 1] : undefined
    const selectedEffectNames: string[] = []
    if (Array.isArray(filterCodes)) {
      for (const effectCode of filterCodes) {
        const effectName = isIntegerNumber(effectCode) ? LEGACY_V3_EFFECT_NAMES[effectCode] : undefined
        if (effectName !== undefined) selectedEffectNames.push(effectName)
      }
    }
    decoded.push({
      augmentSlotTypeId,
      augmentId: resolveUniqueNamedId(legacyAugmentName, data.augments),
      selectedEffectNames,
      filterMode: filterMode === 1 ? ('and' as const) : ('or' as const)
    })
  }
  return decoded
}

const decodeLegacyV3Payload = (
  data: EssenceCraftingData,
  payload: Record<string, unknown>
): EssencePlanState | null => {
  if (
    !isFiniteNumber(payload.ml) ||
    !Array.isArray(payload.a) ||
    !Array.isArray(payload.c) ||
    !Array.isArray(payload.i)
  ) {
    return null
  }
  const enhancementIdByRecipeId = createLegacyEnhancementIdByRecipeId(data)
  const activeSlotIds = payload.a
    .map((slotIndex) => (Number.isInteger(slotIndex) ? LEGACY_V3_SLOT_IDS[slotIndex as number] : undefined))
    .filter((slotId): slotId is EquipmentSlotId => slotId !== undefined)
  const collapsedSlotIds = payload.c
    .map((slotIndex) => (Number.isInteger(slotIndex) ? LEGACY_V3_SLOT_IDS[slotIndex as number] : undefined))
    .filter((slotId): slotId is EquipmentSlotId => slotId !== undefined)
  const itemsBySlotId: Record<string, unknown> = {}

  for (const candidate of payload.i) {
    if (!Array.isArray(candidate) || candidate.length < 7) continue
    const equipmentSlotId = Number.isInteger(candidate[0]) ? LEGACY_V3_SLOT_IDS[candidate[0] as number] : undefined
    if (!equipmentSlotId) continue
    const decodeEnhancementId = (value: unknown): string | null =>
      typeof value === 'number' && value > 0 ? (enhancementIdByRecipeId.get(value) ?? null) : null
    const hasCannithMark = Boolean(candidate[2])
    itemsBySlotId[equipmentSlotId] = {
      minimumLevelOverride: isFiniteNumber(candidate[1]) && candidate[1] !== 0 ? candidate[1] : null,
      hasCannithMark,
      prefixEnhancementId: decodeEnhancementId(candidate[3]),
      suffixEnhancementId: decodeEnhancementId(candidate[4]),
      extraEnhancementId: hasCannithMark ? decodeEnhancementId(candidate[5]) : null,
      augmentSlots: decodeLegacyV3Augments(data, candidate[6])
    }
  }

  return hydrateEssencePlan(data, {
    masterMinimumLevel: payload.ml,
    activeSlotIds,
    collapsedSlotIds,
    itemsBySlotId
  })
}

export const decodeEssenceCraftingPermalink = (
  data: EssenceCraftingData,
  encoded: string
): EssenceCraftingPermalinkDecodeResult => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return { ok: false, reason: 'malformed-payload' }
    const payload: unknown = JSON.parse(json)
    if (!isRecord(payload)) return { ok: false, reason: 'malformed-payload' }
    if (payload.v !== 3 && payload.v !== ESSENCE_CRAFTING_PERMALINK_VERSION) {
      return { ok: false, reason: 'unsupported-version' }
    }
    const plan =
      payload.v === ESSENCE_CRAFTING_PERMALINK_VERSION
        ? decodeV4Payload(data, payload)
        : decodeLegacyV3Payload(data, payload)
    return plan ? { ok: true, version: payload.v, plan } : { ok: false, reason: 'malformed-payload' }
  } catch {
    return { ok: false, reason: 'malformed-payload' }
  }
}

export const readEssenceCraftingPermalinkFromSearch = (search?: string): string | null => {
  const currentSearch = search ?? (typeof window === 'undefined' ? '' : window.location.search)
  return new URLSearchParams(currentSearch).get(ESSENCE_CRAFTING_PERMALINK_QUERY_PARAMETER)
}

export const buildEssenceCraftingPermalinkUrl = (encoded: string, baseUrl?: string): string => {
  const fallbackBase = typeof window === 'undefined' ? 'http://localhost/' : window.location.href
  const url = new URL(ESSENCE_CRAFTING_PERMALINK_PATH, baseUrl ?? fallbackBase)
  url.searchParams.set(ESSENCE_CRAFTING_PERMALINK_QUERY_PARAMETER, encoded)
  return url.toString()
}

export const removeEssenceCraftingPermalinkFromCurrentUrl = (
  browserWindow: Pick<Window, 'history' | 'location'> | undefined = typeof window === 'undefined' ? undefined : window
): boolean => {
  if (!browserWindow) return false
  const url = new URL(browserWindow.location.href)
  if (!url.searchParams.has(ESSENCE_CRAFTING_PERMALINK_QUERY_PARAMETER)) return false
  url.searchParams.delete(ESSENCE_CRAFTING_PERMALINK_QUERY_PARAMETER)
  browserWindow.history.replaceState(browserWindow.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  return true
}
