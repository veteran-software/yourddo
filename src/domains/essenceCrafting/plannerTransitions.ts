import {
  type AugmentEffectFilterMode,
  getAugmentSlotMinimumItemLevel,
  getAvailableAugmentEffectNames,
  isAugmentSlotTypeAvailable,
  isSelectedAugmentStillValid
} from './augmentRules.ts'
import { isSelectedEnhancementStillValid } from './enhancementEligibility.ts'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceAffixPosition, EssenceCraftingData } from './essenceCrafting.types.ts'
import {
  createEmptyEssencePlan,
  createPlannedAugmentSlotId,
  type EssencePlanState,
  type PlannedAugmentSlot,
  type PlannedItem
} from './plannerState.ts'

export type EssencePlanAction =
  | { type: 'set-master-minimum-level'; minimumLevel: number }
  | { type: 'activate-equipment-slot'; equipmentSlotId: string }
  | { type: 'deactivate-equipment-slot'; equipmentSlotId: string }
  | { type: 'collapse-equipment-slot'; equipmentSlotId: string }
  | { type: 'expand-equipment-slot'; equipmentSlotId: string }
  | { type: 'set-item-minimum-level-override'; equipmentSlotId: string; minimumLevel: number | null }
  | { type: 'select-prefix-enhancement'; equipmentSlotId: string; enhancementId: string | null }
  | { type: 'select-suffix-enhancement'; equipmentSlotId: string; enhancementId: string | null }
  | { type: 'set-cannith-mark'; equipmentSlotId: string; enabled: boolean }
  | { type: 'select-extra-enhancement'; equipmentSlotId: string; enhancementId: string | null }
  | { type: 'add-augment-slot'; equipmentSlotId: string; augmentSlotTypeId: string }
  | {
      type: 'change-augment-slot-type'
      equipmentSlotId: string
      augmentSlotId: string
      augmentSlotTypeId: string
    }
  | { type: 'remove-augment-slot'; equipmentSlotId: string; augmentSlotId: string }
  | { type: 'select-augment'; equipmentSlotId: string; augmentSlotId: string; augmentId: string }
  | { type: 'clear-augment'; equipmentSlotId: string; augmentSlotId: string }
  | { type: 'set-augment-filters'; equipmentSlotId: string; augmentSlotId: string; effectNames: readonly string[] }
  | {
      type: 'set-augment-filter-mode'
      equipmentSlotId: string
      augmentSlotId: string
      filterMode: AugmentEffectFilterMode
    }
  | { type: 'reset-planned-item'; equipmentSlotId: string }
  | { type: 'reset-plan' }
  | { type: 'hydrate-plan'; externalState: unknown }

const equipmentSlotIds = new Set<EquipmentSlotId>(EQUIPMENT_SLOTS.map(({ id }) => id))

const isEquipmentSlotId = (value: string): value is EquipmentSlotId => equipmentSlotIds.has(value as EquipmentSlotId)

const createEmptyPlannedItem = (): PlannedItem => ({
  prefixEnhancementId: null,
  suffixEnhancementId: null,
  extraEnhancementId: null,
  hasCannithMark: false,
  minimumLevelOverride: null,
  augmentSlots: []
})

const isSupportedMinimumLevel = (data: EssenceCraftingData, minimumLevel: number): boolean =>
  Number.isInteger(minimumLevel) &&
  minimumLevel >= data.rules.supportedItemLevels.minimum &&
  minimumLevel <= data.rules.supportedItemLevels.maximum

const getEffectiveMinimumLevel = (state: EssencePlanState, item: PlannedItem): number =>
  item.minimumLevelOverride ?? state.masterMinimumLevel

const orderEquipmentSlotIds = (slotIds: ReadonlySet<EquipmentSlotId>): EquipmentSlotId[] =>
  EQUIPMENT_SLOTS.map(({ id }) => id).filter((id) => slotIds.has(id))

const orderItemsBySlotId = (
  activeSlotIds: readonly EquipmentSlotId[],
  itemsBySlotId: EssencePlanState['itemsBySlotId']
): EssencePlanState['itemsBySlotId'] => {
  const orderedItems: EssencePlanState['itemsBySlotId'] = {}
  for (const equipmentSlotId of activeSlotIds) {
    const item = itemsBySlotId[equipmentSlotId]
    if (item) orderedItems[equipmentSlotId] = item
  }
  return orderedItems
}

const getMaximumAugmentSlotFloor = (data: EssenceCraftingData, item: PlannedItem): number | undefined => {
  let maximumFloor: number | undefined
  for (const { augmentSlotTypeId } of item.augmentSlots) {
    const floor = getAugmentSlotMinimumItemLevel(data, augmentSlotTypeId)
    if (floor !== undefined && (maximumFloor === undefined || floor > maximumFloor)) maximumFloor = floor
  }
  return maximumFloor
}

const constrainOverrideToAugmentSlots = (
  data: EssenceCraftingData,
  masterMinimumLevel: number,
  item: PlannedItem,
  requestedOverride: number | null
): number | null => {
  const floor = getMaximumAugmentSlotFloor(data, item)
  const requestedEffectiveLevel = requestedOverride ?? masterMinimumLevel
  return floor !== undefined && requestedEffectiveLevel < floor ? floor : requestedOverride
}

const revalidateItemSelections = (
  data: EssenceCraftingData,
  equipmentSlotId: EquipmentSlotId,
  item: PlannedItem,
  masterMinimumLevel: number
): PlannedItem => {
  const minimumLevel = item.minimumLevelOverride ?? masterMinimumLevel
  const prefixEnhancementId = isSelectedEnhancementStillValid(
    data,
    item.prefixEnhancementId,
    equipmentSlotId,
    'prefix',
    minimumLevel
  )
    ? item.prefixEnhancementId
    : null
  const suffixEnhancementId = isSelectedEnhancementStillValid(
    data,
    item.suffixEnhancementId,
    equipmentSlotId,
    'suffix',
    minimumLevel
  )
    ? item.suffixEnhancementId
    : null
  const extraEnhancementId =
    item.hasCannithMark &&
    isSelectedEnhancementStillValid(data, item.extraEnhancementId, equipmentSlotId, 'extra', minimumLevel)
      ? item.extraEnhancementId
      : null
  const augmentSlots = item.augmentSlots.map((augmentSlot) => ({
    ...augmentSlot,
    augmentId: isSelectedAugmentStillValid(
      data,
      augmentSlot.augmentId,
      equipmentSlotId,
      augmentSlot.augmentSlotTypeId,
      minimumLevel
    )
      ? augmentSlot.augmentId
      : null
  }))

  return {
    ...item,
    prefixEnhancementId,
    suffixEnhancementId,
    extraEnhancementId,
    augmentSlots
  }
}

const updateActiveItem = (
  state: EssencePlanState,
  equipmentSlotId: string,
  update: (item: PlannedItem, slotId: EquipmentSlotId) => PlannedItem
): EssencePlanState => {
  if (!isEquipmentSlotId(equipmentSlotId) || !state.activeSlotIds.includes(equipmentSlotId)) return state
  const item = state.itemsBySlotId[equipmentSlotId]
  if (!item) return state
  const updatedItem = update(item, equipmentSlotId)
  if (updatedItem === item) return state
  return {
    ...state,
    itemsBySlotId: { ...state.itemsBySlotId, [equipmentSlotId]: updatedItem }
  }
}

const selectEnhancement = (
  data: EssenceCraftingData,
  state: EssencePlanState,
  equipmentSlotId: string,
  position: EssenceAffixPosition,
  enhancementId: string | null
): EssencePlanState =>
  updateActiveItem(state, equipmentSlotId, (item, slotId) => {
    if (
      enhancementId !== null &&
      !isSelectedEnhancementStillValid(data, enhancementId, slotId, position, getEffectiveMinimumLevel(state, item))
    ) {
      return item
    }
    if (position === 'extra' && !item.hasCannithMark && enhancementId !== null) return item

    const field =
      position === 'prefix'
        ? 'prefixEnhancementId'
        : position === 'suffix'
          ? 'suffixEnhancementId'
          : 'extraEnhancementId'
    return item[field] === enhancementId ? item : { ...item, [field]: enhancementId }
  })

const updateAugmentSlot = (
  state: EssencePlanState,
  equipmentSlotId: string,
  augmentSlotId: string,
  update: (augmentSlot: PlannedAugmentSlot, item: PlannedItem, slotId: EquipmentSlotId) => PlannedAugmentSlot
): EssencePlanState =>
  updateActiveItem(state, equipmentSlotId, (item, slotId) => {
    const index = item.augmentSlots.findIndex(({ id }) => id === augmentSlotId)
    if (index < 0) return item
    const augmentSlot = item.augmentSlots[index]
    const updatedAugmentSlot = update(augmentSlot, item, slotId)
    if (updatedAugmentSlot === augmentSlot) return item
    const augmentSlots = [...item.augmentSlots]
    augmentSlots[index] = updatedAugmentSlot
    return { ...item, augmentSlots }
  })

const sanitizeEffectNames = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string,
  effectNames: readonly unknown[]
): string[] => {
  const requested = new Set(effectNames.filter((value): value is string => typeof value === 'string'))
  return getAvailableAugmentEffectNames(data, augmentSlotTypeId).filter((effectName) => requested.has(effectName))
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readNullableString = (value: unknown): string | null => (typeof value === 'string' ? value : null)

const sanitizeHydratedAugmentSlots = (
  data: EssenceCraftingData,
  equipmentSlotId: EquipmentSlotId,
  value: unknown
): { slots: PlannedAugmentSlot[]; selectedAugmentIds: (string | null)[] } => {
  if (!Array.isArray(value)) return { slots: [], selectedAugmentIds: [] }

  const slots: PlannedAugmentSlot[] = []
  const selectedAugmentIds: (string | null)[] = []
  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.augmentSlotTypeId !== 'string') continue
    const alreadyAddedTypeIds = slots.map(({ augmentSlotTypeId }) => augmentSlotTypeId)
    if (!isAugmentSlotTypeAvailable(data, equipmentSlotId, candidate.augmentSlotTypeId, alreadyAddedTypeIds)) continue
    const floor = getAugmentSlotMinimumItemLevel(data, candidate.augmentSlotTypeId)
    if (floor === undefined || floor > data.rules.supportedItemLevels.maximum) continue

    slots.push({
      id: createPlannedAugmentSlotId(candidate.augmentSlotTypeId),
      augmentSlotTypeId: candidate.augmentSlotTypeId,
      augmentId: null,
      selectedEffectNames: sanitizeEffectNames(
        data,
        candidate.augmentSlotTypeId,
        Array.isArray(candidate.selectedEffectNames) ? candidate.selectedEffectNames : []
      ),
      filterMode: candidate.filterMode === 'and' ? 'and' : 'or'
    })
    selectedAugmentIds.push(readNullableString(candidate.augmentId))
  }
  return { slots, selectedAugmentIds }
}

const sanitizeHydratedItem = (
  data: EssenceCraftingData,
  equipmentSlotId: EquipmentSlotId,
  masterMinimumLevel: number,
  value: unknown
): PlannedItem => {
  const candidate = isRecord(value) ? value : {}
  const hydratedOverride =
    typeof candidate.minimumLevelOverride === 'number' && isSupportedMinimumLevel(data, candidate.minimumLevelOverride)
      ? candidate.minimumLevelOverride
      : null
  const { slots, selectedAugmentIds } = sanitizeHydratedAugmentSlots(data, equipmentSlotId, candidate.augmentSlots)
  let item: PlannedItem = {
    prefixEnhancementId: readNullableString(candidate.prefixEnhancementId),
    suffixEnhancementId: readNullableString(candidate.suffixEnhancementId),
    extraEnhancementId: readNullableString(candidate.extraEnhancementId),
    hasCannithMark: candidate.hasCannithMark === true,
    minimumLevelOverride: hydratedOverride,
    augmentSlots: slots
  }
  item = {
    ...item,
    minimumLevelOverride: constrainOverrideToAugmentSlots(data, masterMinimumLevel, item, hydratedOverride),
    augmentSlots: item.augmentSlots.map((augmentSlot, index) => ({
      ...augmentSlot,
      augmentId: selectedAugmentIds[index] ?? null
    }))
  }
  return revalidateItemSelections(data, equipmentSlotId, item, masterMinimumLevel)
}

export const hydrateEssencePlan = (data: EssenceCraftingData, externalState: unknown): EssencePlanState => {
  if (!isRecord(externalState)) return createEmptyEssencePlan(data)
  const masterMinimumLevel =
    typeof externalState.masterMinimumLevel === 'number' &&
    isSupportedMinimumLevel(data, externalState.masterMinimumLevel)
      ? externalState.masterMinimumLevel
      : data.rules.supportedItemLevels.minimum
  const requestedActiveIds = new Set<EquipmentSlotId>()
  if (Array.isArray(externalState.activeSlotIds)) {
    for (const value of externalState.activeSlotIds) {
      if (typeof value === 'string' && isEquipmentSlotId(value)) requestedActiveIds.add(value)
    }
  }
  const activeSlotIds = orderEquipmentSlotIds(requestedActiveIds)
  const rawItems = isRecord(externalState.itemsBySlotId) ? externalState.itemsBySlotId : {}
  const itemsBySlotId: EssencePlanState['itemsBySlotId'] = {}
  for (const equipmentSlotId of activeSlotIds) {
    itemsBySlotId[equipmentSlotId] = sanitizeHydratedItem(
      data,
      equipmentSlotId,
      masterMinimumLevel,
      rawItems[equipmentSlotId]
    )
  }

  const requestedCollapsedIds = new Set<EquipmentSlotId>()
  if (Array.isArray(externalState.collapsedSlotIds)) {
    for (const value of externalState.collapsedSlotIds) {
      if (typeof value === 'string' && isEquipmentSlotId(value) && requestedActiveIds.has(value)) {
        requestedCollapsedIds.add(value)
      }
    }
  }

  return {
    masterMinimumLevel,
    activeSlotIds,
    collapsedSlotIds: orderEquipmentSlotIds(requestedCollapsedIds),
    itemsBySlotId
  }
}

export const transitionEssencePlan = (
  data: EssenceCraftingData,
  state: EssencePlanState,
  action: EssencePlanAction
): EssencePlanState => {
  switch (action.type) {
    case 'set-master-minimum-level': {
      if (!isSupportedMinimumLevel(data, action.minimumLevel) || action.minimumLevel === state.masterMinimumLevel) {
        return state
      }
      const itemsBySlotId = { ...state.itemsBySlotId }
      for (const equipmentSlotId of state.activeSlotIds) {
        const item = itemsBySlotId[equipmentSlotId]
        if (item?.minimumLevelOverride !== null) continue
        const constrainedOverride = constrainOverrideToAugmentSlots(data, action.minimumLevel, item, null)
        itemsBySlotId[equipmentSlotId] = revalidateItemSelections(
          data,
          equipmentSlotId,
          { ...item, minimumLevelOverride: constrainedOverride },
          action.minimumLevel
        )
      }
      return { ...state, masterMinimumLevel: action.minimumLevel, itemsBySlotId }
    }
    case 'activate-equipment-slot': {
      if (!isEquipmentSlotId(action.equipmentSlotId)) return state
      const activeIds = new Set(state.activeSlotIds)
      activeIds.add(action.equipmentSlotId)
      const activeSlotIds = orderEquipmentSlotIds(activeIds)
      const item = state.itemsBySlotId[action.equipmentSlotId]
      if (item && state.activeSlotIds.includes(action.equipmentSlotId)) return state
      const itemsBySlotId = {
        ...state.itemsBySlotId,
        [action.equipmentSlotId]: item ?? createEmptyPlannedItem()
      }
      return {
        ...state,
        activeSlotIds,
        itemsBySlotId: orderItemsBySlotId(activeSlotIds, itemsBySlotId)
      }
    }
    case 'deactivate-equipment-slot': {
      if (!isEquipmentSlotId(action.equipmentSlotId) || !state.activeSlotIds.includes(action.equipmentSlotId)) {
        return state
      }
      const itemsBySlotId = { ...state.itemsBySlotId }
      Reflect.deleteProperty(itemsBySlotId, action.equipmentSlotId)
      return {
        ...state,
        activeSlotIds: state.activeSlotIds.filter((id) => id !== action.equipmentSlotId),
        collapsedSlotIds: state.collapsedSlotIds.filter((id) => id !== action.equipmentSlotId),
        itemsBySlotId
      }
    }
    case 'collapse-equipment-slot': {
      if (
        !isEquipmentSlotId(action.equipmentSlotId) ||
        !state.activeSlotIds.includes(action.equipmentSlotId) ||
        state.collapsedSlotIds.includes(action.equipmentSlotId)
      ) {
        return state
      }
      return {
        ...state,
        collapsedSlotIds: orderEquipmentSlotIds(new Set([...state.collapsedSlotIds, action.equipmentSlotId]))
      }
    }
    case 'expand-equipment-slot': {
      if (!isEquipmentSlotId(action.equipmentSlotId) || !state.collapsedSlotIds.includes(action.equipmentSlotId)) {
        return state
      }
      return {
        ...state,
        collapsedSlotIds: state.collapsedSlotIds.filter((id) => id !== action.equipmentSlotId)
      }
    }
    case 'set-item-minimum-level-override': {
      if (action.minimumLevel !== null && !isSupportedMinimumLevel(data, action.minimumLevel)) return state
      return updateActiveItem(state, action.equipmentSlotId, (item, slotId) => {
        const minimumLevelOverride = constrainOverrideToAugmentSlots(
          data,
          state.masterMinimumLevel,
          item,
          action.minimumLevel
        )
        if (minimumLevelOverride === item.minimumLevelOverride) return item
        return revalidateItemSelections(data, slotId, { ...item, minimumLevelOverride }, state.masterMinimumLevel)
      })
    }
    case 'select-prefix-enhancement':
      return selectEnhancement(data, state, action.equipmentSlotId, 'prefix', action.enhancementId)
    case 'select-suffix-enhancement':
      return selectEnhancement(data, state, action.equipmentSlotId, 'suffix', action.enhancementId)
    case 'set-cannith-mark':
      return updateActiveItem(state, action.equipmentSlotId, (item) =>
        item.hasCannithMark === action.enabled
          ? item
          : {
              ...item,
              hasCannithMark: action.enabled,
              extraEnhancementId: action.enabled ? item.extraEnhancementId : null
            }
      )
    case 'select-extra-enhancement':
      return selectEnhancement(data, state, action.equipmentSlotId, 'extra', action.enhancementId)
    case 'add-augment-slot':
      return updateActiveItem(state, action.equipmentSlotId, (item, slotId) => {
        if (
          !isAugmentSlotTypeAvailable(
            data,
            slotId,
            action.augmentSlotTypeId,
            item.augmentSlots.map(({ augmentSlotTypeId }) => augmentSlotTypeId)
          )
        ) {
          return item
        }
        const floor = getAugmentSlotMinimumItemLevel(data, action.augmentSlotTypeId)
        if (floor === undefined || floor > data.rules.supportedItemLevels.maximum) return item
        const augmentSlots = [
          ...item.augmentSlots,
          {
            id: createPlannedAugmentSlotId(action.augmentSlotTypeId),
            augmentSlotTypeId: action.augmentSlotTypeId,
            augmentId: null,
            selectedEffectNames: [],
            filterMode: 'or' as const
          }
        ]
        const itemWithSlot = { ...item, augmentSlots }
        return {
          ...itemWithSlot,
          minimumLevelOverride:
            getEffectiveMinimumLevel(state, item) < floor ? floor : itemWithSlot.minimumLevelOverride
        }
      })
    case 'change-augment-slot-type':
      return updateActiveItem(state, action.equipmentSlotId, (item, slotId) => {
        const index = item.augmentSlots.findIndex(({ id }) => id === action.augmentSlotId)
        if (index < 0) return item
        const current = item.augmentSlots[index]
        if (current.augmentSlotTypeId === action.augmentSlotTypeId) return item
        const otherTypeIds = item.augmentSlots
          .filter((_, candidateIndex) => candidateIndex !== index)
          .map(({ augmentSlotTypeId }) => augmentSlotTypeId)
        if (!isAugmentSlotTypeAvailable(data, slotId, action.augmentSlotTypeId, otherTypeIds)) return item
        const floor = getAugmentSlotMinimumItemLevel(data, action.augmentSlotTypeId)
        if (floor === undefined || floor > data.rules.supportedItemLevels.maximum) return item
        const minimumLevelOverride = getEffectiveMinimumLevel(state, item) < floor ? floor : item.minimumLevelOverride
        const minimumLevel = minimumLevelOverride ?? state.masterMinimumLevel
        const changedSlot: PlannedAugmentSlot = {
          id: createPlannedAugmentSlotId(action.augmentSlotTypeId),
          augmentSlotTypeId: action.augmentSlotTypeId,
          augmentId: isSelectedAugmentStillValid(
            data,
            current.augmentId,
            slotId,
            action.augmentSlotTypeId,
            minimumLevel
          )
            ? current.augmentId
            : null,
          selectedEffectNames: sanitizeEffectNames(data, action.augmentSlotTypeId, current.selectedEffectNames),
          filterMode: current.filterMode
        }
        const augmentSlots = [...item.augmentSlots]
        augmentSlots[index] = changedSlot
        return { ...item, minimumLevelOverride, augmentSlots }
      })
    case 'remove-augment-slot':
      return updateActiveItem(state, action.equipmentSlotId, (item) => {
        const augmentSlots = item.augmentSlots.filter(({ id }) => id !== action.augmentSlotId)
        return augmentSlots.length === item.augmentSlots.length ? item : { ...item, augmentSlots }
      })
    case 'select-augment':
      return updateAugmentSlot(state, action.equipmentSlotId, action.augmentSlotId, (augmentSlot, item, slotId) => {
        if (
          augmentSlot.augmentId === action.augmentId ||
          !isSelectedAugmentStillValid(
            data,
            action.augmentId,
            slotId,
            augmentSlot.augmentSlotTypeId,
            getEffectiveMinimumLevel(state, item)
          )
        ) {
          return augmentSlot
        }
        return { ...augmentSlot, augmentId: action.augmentId }
      })
    case 'clear-augment':
      return updateAugmentSlot(state, action.equipmentSlotId, action.augmentSlotId, (augmentSlot) =>
        augmentSlot.augmentId === null ? augmentSlot : { ...augmentSlot, augmentId: null }
      )
    case 'set-augment-filters':
      return updateAugmentSlot(state, action.equipmentSlotId, action.augmentSlotId, (augmentSlot) => {
        const selectedEffectNames = sanitizeEffectNames(data, augmentSlot.augmentSlotTypeId, action.effectNames)
        return selectedEffectNames.length === augmentSlot.selectedEffectNames.length &&
          selectedEffectNames.every((effectName, index) => effectName === augmentSlot.selectedEffectNames[index])
          ? augmentSlot
          : { ...augmentSlot, selectedEffectNames }
      })
    case 'set-augment-filter-mode':
      return updateAugmentSlot(state, action.equipmentSlotId, action.augmentSlotId, (augmentSlot) =>
        augmentSlot.filterMode === action.filterMode ? augmentSlot : { ...augmentSlot, filterMode: action.filterMode }
      )
    case 'reset-planned-item':
      return updateActiveItem(state, action.equipmentSlotId, () => createEmptyPlannedItem())
    case 'reset-plan':
      return createEmptyEssencePlan(data)
    case 'hydrate-plan':
      return hydrateEssencePlan(data, action.externalState)
  }
}
