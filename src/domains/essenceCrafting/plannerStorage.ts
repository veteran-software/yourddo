import { getAvailableAugmentEffectNames } from './augmentRules.ts'
import type { EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import { createEmptyEssencePlan, type EssencePlanState } from './plannerState.ts'
import { transitionEssencePlan } from './plannerTransitions.ts'

export const ESSENCE_CRAFTING_SESSION_STORAGE_KEY = 'yourddo:essence-crafting:plan:v1'
export const LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY = 'essenceCraftingState'
export const ESSENCE_CRAFTING_SESSION_PAYLOAD_VERSION = 1

export interface EssenceCraftingSessionStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

interface PersistedAugmentSlotV1 {
  augmentSlotTypeId: string
  augmentId: string | null
  selectedEffectNames: string[]
  filterMode: 'or' | 'and'
}

interface PersistedItemV1 {
  prefixEnhancementId: string | null
  suffixEnhancementId: string | null
  extraEnhancementId: string | null
  hasCannithMark: boolean
  minimumLevelOverride: number | null
  augmentSlots: PersistedAugmentSlotV1[]
}

/**
 * Compact, ID-only browser snapshot. Published CDN records and derived values
 * are deliberately excluded and are rejoined from the current decoded data.
 */
export interface EssenceCraftingSessionPayloadV1 {
  version: typeof ESSENCE_CRAFTING_SESSION_PAYLOAD_VERSION
  masterMinimumLevel: number
  activeSlotIds: string[]
  collapsedSlotIds: string[]
  itemsBySlotId: Record<string, PersistedItemV1>
}

export type EssenceCraftingStorageSource = 'empty' | 'v2' | 'legacy'

export interface LoadedEssenceCraftingPlan {
  plan: EssencePlanState
  source: EssenceCraftingStorageSource
}

const LEGACY_SLOT_ID_BY_KEY: Readonly<Partial<Record<string, EquipmentSlotId>>> = {
  mainHand: 'main-hand',
  offHand: 'off-hand',
  runeArm: 'rune-arm',
  orb: 'orb',
  armor: 'armor',
  belt: 'belt',
  boots: 'boots',
  bracers: 'bracers',
  cloak: 'cloak',
  gloves: 'gloves',
  goggles: 'goggles',
  helmet: 'helmet',
  necklace: 'necklace',
  ring1: 'ring-1',
  ring2: 'ring-2',
  trinket: 'trinket',
  shield: 'shield'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readStoredJson = (storage: EssenceCraftingSessionStorage | undefined, key: string): unknown => {
  if (!storage) return undefined
  try {
    const raw = storage.getItem(key)
    return raw === null ? undefined : (JSON.parse(raw) as unknown)
  } catch {
    return undefined
  }
}

const getBrowserSessionStorage = (): EssenceCraftingSessionStorage | undefined => {
  try {
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage
  } catch {
    return undefined
  }
}

const hasVersionOneShape = (value: unknown): value is EssenceCraftingSessionPayloadV1 =>
  isRecord(value) &&
  value.version === ESSENCE_CRAFTING_SESSION_PAYLOAD_VERSION &&
  typeof value.masterMinimumLevel === 'number' &&
  Array.isArray(value.activeSlotIds) &&
  Array.isArray(value.collapsedSlotIds) &&
  isRecord(value.itemsBySlotId)

const planFromExternalState = (data: EssenceCraftingData, externalState: unknown): EssencePlanState =>
  transitionEssencePlan(data, createEmptyEssencePlan(data), { type: 'hydrate-plan', externalState })

export const createEssenceCraftingSessionPayload = (plan: EssencePlanState): EssenceCraftingSessionPayloadV1 => {
  const itemsBySlotId: Record<string, PersistedItemV1> = {}
  for (const equipmentSlotId of plan.activeSlotIds) {
    const item = plan.itemsBySlotId[equipmentSlotId]
    if (!item) continue
    itemsBySlotId[equipmentSlotId] = {
      prefixEnhancementId: item.prefixEnhancementId,
      suffixEnhancementId: item.suffixEnhancementId,
      extraEnhancementId: item.extraEnhancementId,
      hasCannithMark: item.hasCannithMark,
      minimumLevelOverride: item.minimumLevelOverride,
      augmentSlots: item.augmentSlots.map(({ augmentSlotTypeId, augmentId, selectedEffectNames, filterMode }) => ({
        augmentSlotTypeId,
        augmentId,
        selectedEffectNames: [...selectedEffectNames],
        filterMode
      }))
    }
  }
  return {
    version: ESSENCE_CRAFTING_SESSION_PAYLOAD_VERSION,
    masterMinimumLevel: plan.masterMinimumLevel,
    activeSlotIds: [...plan.activeSlotIds],
    collapsedSlotIds: [...plan.collapsedSlotIds],
    itemsBySlotId
  }
}

export const saveEssenceCraftingPlan = (
  plan: EssencePlanState,
  storage: EssenceCraftingSessionStorage | undefined = getBrowserSessionStorage()
): boolean => {
  if (!storage) return false
  try {
    storage.setItem(ESSENCE_CRAFTING_SESSION_STORAGE_KEY, JSON.stringify(createEssenceCraftingSessionPayload(plan)))
    return true
  } catch {
    return false
  }
}

const resolveLegacyName = (value: unknown, records: readonly { id: string; displayName: string }[]): string | null => {
  const name =
    typeof value === 'string'
      ? value
      : isRecord(value)
        ? typeof value.name === 'string'
          ? value.name
          : typeof value.displayName === 'string'
            ? value.displayName
            : undefined
        : undefined
  if (!name) return null
  const matches = records.filter(({ displayName }) => displayName === name)
  return matches.length === 1 ? matches[0].id : null
}

const migrateLegacyAugmentSlots = (data: EssenceCraftingData, value: unknown): PersistedAugmentSlotV1[] => {
  if (!Array.isArray(value)) return []
  const slots: PersistedAugmentSlotV1[] = []
  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.slotType !== 'string') continue
    const availableEffectNames = new Set(getAvailableAugmentEffectNames(data, candidate.slotType))
    const selectedEffectNames = Array.isArray(candidate.filters)
      ? candidate.filters.filter(
          (effectName): effectName is string => typeof effectName === 'string' && availableEffectNames.has(effectName)
        )
      : []
    slots.push({
      augmentSlotTypeId: candidate.slotType,
      augmentId: resolveLegacyName(candidate.selectedAugment, data.augments),
      selectedEffectNames,
      filterMode: candidate.filterMode === 'AND' ? 'and' : 'or'
    })
  }
  return slots
}

/**
 * Converts only recognized legacy user choices. It never copies stored data
 * records: legacy names are resolved against the current decoded dataset.
 */
export const migrateLegacyEssenceCraftingPayload = (
  data: EssenceCraftingData,
  legacyPayload: unknown
): Omit<EssenceCraftingSessionPayloadV1, 'version'> | undefined => {
  if (!isRecord(legacyPayload) || !Array.isArray(legacyPayload.activeKeys) || !isRecord(legacyPayload.items)) {
    return undefined
  }

  const activeSlotIds: EquipmentSlotId[] = []
  const itemsBySlotId: Record<string, PersistedItemV1> = {}
  for (const legacySlotKey of legacyPayload.activeKeys) {
    if (typeof legacySlotKey !== 'string') continue
    const equipmentSlotId = LEGACY_SLOT_ID_BY_KEY[legacySlotKey]
    if (!equipmentSlotId || activeSlotIds.includes(equipmentSlotId)) continue
    const legacyItem = legacyPayload.items[legacySlotKey]
    if (!isRecord(legacyItem)) continue
    activeSlotIds.push(equipmentSlotId)
    itemsBySlotId[equipmentSlotId] = {
      prefixEnhancementId: resolveLegacyName(legacyItem.prefix, data.enhancements),
      suffixEnhancementId: resolveLegacyName(legacyItem.suffix, data.enhancements),
      extraEnhancementId: resolveLegacyName(legacyItem.extra, data.enhancements),
      hasCannithMark: legacyItem.hasCannithMark === true,
      minimumLevelOverride: typeof legacyItem.minLevelOverride === 'number' ? legacyItem.minLevelOverride : null,
      augmentSlots: migrateLegacyAugmentSlots(data, legacyItem.augmentSlots)
    }
  }

  const collapsedSlotIds: EquipmentSlotId[] = []
  if (Array.isArray(legacyPayload.collapsedKeys)) {
    for (const legacySlotKey of legacyPayload.collapsedKeys) {
      if (typeof legacySlotKey !== 'string') continue
      const equipmentSlotId = LEGACY_SLOT_ID_BY_KEY[legacySlotKey]
      if (equipmentSlotId && activeSlotIds.includes(equipmentSlotId) && !collapsedSlotIds.includes(equipmentSlotId)) {
        collapsedSlotIds.push(equipmentSlotId)
      }
    }
  }

  return {
    masterMinimumLevel: typeof legacyPayload.masterMinLevel === 'number' ? legacyPayload.masterMinLevel : NaN,
    activeSlotIds,
    collapsedSlotIds,
    itemsBySlotId
  }
}

export const loadEssenceCraftingPlan = (
  data: EssenceCraftingData,
  storage: EssenceCraftingSessionStorage | undefined = getBrowserSessionStorage()
): LoadedEssenceCraftingPlan => {
  const storedPayload = readStoredJson(storage, ESSENCE_CRAFTING_SESSION_STORAGE_KEY)
  if (hasVersionOneShape(storedPayload)) {
    return { plan: planFromExternalState(data, storedPayload), source: 'v2' }
  }

  const migratedPayload = migrateLegacyEssenceCraftingPayload(
    data,
    readStoredJson(storage, LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY)
  )
  if (!migratedPayload) return { plan: createEmptyEssencePlan(data), source: 'empty' }

  const plan = planFromExternalState(data, migratedPayload)
  saveEssenceCraftingPlan(plan, storage)
  return { plan, source: 'legacy' }
}
