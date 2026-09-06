import type { EssenceAffixPosition, EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import { isCompatibleGearPlannerAugment } from './augments.ts'
import { canApplyGearPlannerCurse, gearPlannerCurseIdentity } from './curses.ts'
import {
  type GearPlannerEssenceCraftingConfigurations,
  isEssenceCraftedGearPlannerItem,
  isGearPlannerEssenceAffixValid,
  isGearPlannerEssenceCraftingMaterial
} from './essenceCrafting.ts'
import {
  getGearPlannerMaxFiligreeSlots,
  isGearPlannerMinorArtifact,
  normalizeGearPlannerFiligreeName
} from './filigrees.ts'
import type { GearPlannerAugment, GearPlannerCurse, GearPlannerFiligree, GearPlannerItem } from './gearPlanner.types.ts'
import { gearPlannerCharacterSlots } from './gearPlanner.types.ts'
import {
  getEffectiveGearPlannerAugmentSlots,
  isGearPlannerReforgingStageStateValid,
  type GearPlannerReforgingData,
  type GearPlannerReforgingStage,
  type GearPlannerReforgingStageState,
  type GearPlannerReforgingState
} from './reforging.ts'

export type GearPlannerCharacterSlot = (typeof gearPlannerCharacterSlots)[number]

export type GearPlannerEquipment = Record<GearPlannerCharacterSlot, GearPlannerItem | null>

export type GearPlannerSlottedAugments = Readonly<Record<string, Readonly<Record<number, GearPlannerAugment>>>>
export type GearPlannerSlottedCurses = Readonly<Record<string, GearPlannerCurse>>
export type GearPlannerSlottedFiligrees = Readonly<Record<string, Readonly<Record<number, GearPlannerFiligree>>>>
export type GearPlannerUnlockedFiligreeSlots = Readonly<Record<string, number>>

export interface GearPlannerSelectionState {
  equipment: GearPlannerEquipment
  slottedAugments: GearPlannerSlottedAugments
  slottedCurses: GearPlannerSlottedCurses
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: GearPlannerUnlockedFiligreeSlots
  essenceCrafting: GearPlannerEssenceCraftingConfigurations
  reforging: GearPlannerReforgingState
}

export interface GearPlannerFilters {
  search: string
  minimumLevel: number
  maximumLevel: number
  type: string | null
  setName: string | null
}

export interface GearPlannerCandidate {
  item: GearPlannerItem
  searchText: string
  type: string
  sets: readonly string[]
}

const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase()

export const gearPlannerItemType = (item: GearPlannerItem): string => {
  const type = item.source.type?.trim()
  return type === undefined || type === '' ? 'Item' : type
}

export const createEmptyGearPlannerEquipment = (): GearPlannerEquipment =>
  Object.fromEntries(gearPlannerCharacterSlots.map((slot) => [slot, null])) as GearPlannerEquipment

export const createEmptyGearPlannerSelectionState = (): GearPlannerSelectionState => ({
  equipment: createEmptyGearPlannerEquipment(),
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  essenceCrafting: {},
  reforging: {}
})

export const equipGearPlannerItem = (
  equipment: GearPlannerEquipment,
  slot: GearPlannerCharacterSlot,
  item: GearPlannerItem | null
): GearPlannerEquipment => (item !== null && item.slot !== slot ? equipment : { ...equipment, [slot]: item })

const withoutSlottedAugments = (
  slottedAugments: GearPlannerSlottedAugments,
  itemId: string
): GearPlannerSlottedAugments => {
  if (!(itemId in slottedAugments)) return slottedAugments
  const { [itemId]: _, ...remaining } = slottedAugments
  return remaining
}

const withoutItemRecord = <T>(record: Readonly<Record<string, T>>, itemId: string): Readonly<Record<string, T>> => {
  if (!(itemId in record)) return record
  const { [itemId]: _, ...remaining } = record
  return remaining
}

export const hasOtherGearPlannerMinorArtifact = (
  equipment: GearPlannerEquipment,
  slot: GearPlannerCharacterSlot,
  item: GearPlannerItem
): boolean =>
  isGearPlannerMinorArtifact(item) &&
  Object.entries(equipment).some(
    ([equippedSlot, equipped]) => equippedSlot !== slot && equipped !== null && isGearPlannerMinorArtifact(equipped)
  )

export const equipGearPlannerItemInSelection = (
  state: GearPlannerSelectionState,
  slot: GearPlannerCharacterSlot,
  item: GearPlannerItem | null
): GearPlannerSelectionState => {
  if (item && hasOtherGearPlannerMinorArtifact(state.equipment, slot, item)) return state
  const equipment = equipGearPlannerItem(state.equipment, slot, item)
  if (equipment === state.equipment) return state

  const previousItem = state.equipment[slot]
  const slottedAugments =
    previousItem && previousItem.id !== item?.id
      ? withoutSlottedAugments(state.slottedAugments, previousItem.id)
      : state.slottedAugments
  const slottedCurses =
    previousItem && previousItem.id !== item?.id
      ? withoutItemRecord(state.slottedCurses, previousItem.id)
      : state.slottedCurses
  const slottedFiligrees =
    previousItem && previousItem.id !== item?.id
      ? withoutItemRecord(state.slottedFiligrees, previousItem.id)
      : state.slottedFiligrees
  const unlockedFiligreeSlots =
    previousItem && previousItem.id !== item?.id
      ? withoutItemRecord(state.unlockedFiligreeSlots, previousItem.id)
      : state.unlockedFiligreeSlots
  const essenceCrafting =
    previousItem && previousItem.id !== item?.id
      ? withoutItemRecord(state.essenceCrafting, previousItem.id)
      : state.essenceCrafting
  const reforging =
    previousItem && previousItem.id !== item?.id ? withoutItemRecord(state.reforging, previousItem.id) : state.reforging
  return {
    equipment,
    slottedAugments,
    slottedCurses,
    slottedFiligrees,
    unlockedFiligreeSlots,
    essenceCrafting,
    reforging
  }
}

export type GearPlannerEssenceCraftingUpdate =
  | { kind: 'minimum-level'; minimumLevel: number }
  | { kind: 'material'; material: string }
  | { kind: 'affix'; position: EssenceAffixPosition; enhancementId: string | null }

export const setGearPlannerEssenceCraftingConfiguration = (
  state: GearPlannerSelectionState,
  itemId: string,
  update: GearPlannerEssenceCraftingUpdate,
  data: EssenceCraftingData
): GearPlannerSelectionState => {
  const item = equippedItemById(state.equipment, itemId)
  const configuration = state.essenceCrafting[itemId]
  if (!item || !configuration) return state

  if (update.kind === 'minimum-level') {
    if (
      !Number.isInteger(update.minimumLevel) ||
      update.minimumLevel < data.rules.supportedItemLevels.minimum ||
      update.minimumLevel > data.rules.supportedItemLevels.maximum ||
      update.minimumLevel === configuration.minimumLevel
    ) {
      return state
    }
    return {
      ...state,
      essenceCrafting: { ...state.essenceCrafting, [itemId]: { ...configuration, minimumLevel: update.minimumLevel } }
    }
  }

  if (update.kind === 'material') {
    if (!isGearPlannerEssenceCraftingMaterial(update.material) || update.material === configuration.material)
      return state
    return {
      ...state,
      essenceCrafting: { ...state.essenceCrafting, [itemId]: { ...configuration, material: update.material } }
    }
  }

  const curse = state.slottedCurses[itemId]
  if (!isGearPlannerEssenceAffixValid(data, item, configuration, curse, update.position, update.enhancementId))
    return state
  const field = update.position === 'prefix' ? 'prefixId' : update.position === 'suffix' ? 'suffixId' : 'extraId'
  if (configuration[field] === update.enhancementId) return state
  return {
    ...state,
    essenceCrafting: { ...state.essenceCrafting, [itemId]: { ...configuration, [field]: update.enhancementId } }
  }
}

export const setGearPlannerSlottedAugment = (
  state: GearPlannerSelectionState,
  itemId: string,
  slotIndex: number,
  augment: GearPlannerAugment | null,
  augmentSlots?: readonly import('./gearPlanner.types.ts').GearPlannerAugmentSlot[]
): GearPlannerSelectionState => {
  const item = Object.values(state.equipment).find((equipped): equipped is GearPlannerItem => equipped?.id === itemId)
  const augmentSlot = augmentSlots?.[slotIndex] ?? item?.source.augments?.[slotIndex]
  if (!item || !augmentSlot || !Number.isInteger(slotIndex) || slotIndex < 0) return state
  if (augment && !isCompatibleGearPlannerAugment(augmentSlot, augment)) return state

  const currentItemAugments = state.slottedAugments[itemId] ?? {}
  const itemAugments = augment
    ? { ...currentItemAugments, [slotIndex]: augment }
    : Object.fromEntries(Object.entries(currentItemAugments).filter(([index]) => Number(index) !== slotIndex))

  const slottedAugments =
    Object.keys(itemAugments).length > 0
      ? { ...state.slottedAugments, [itemId]: itemAugments }
      : withoutSlottedAugments(state.slottedAugments, itemId)
  return { ...state, slottedAugments }
}

const sanitizeGearPlannerSlottedAugments = (
  slottedAugments: GearPlannerSlottedAugments,
  item: GearPlannerItem,
  augmentSlots: readonly import('./gearPlanner.types.ts').GearPlannerAugmentSlot[]
): GearPlannerSlottedAugments => {
  const current = slottedAugments[item.id]
  if (!current) return slottedAugments
  const valid = Object.fromEntries(
    Object.entries(current).filter(([index, augment]) => {
      const slot = augmentSlots[Number(index)]
      return (
        Number.isInteger(Number(index)) && Number(index) >= 0 && slot && isCompatibleGearPlannerAugment(slot, augment)
      )
    })
  ) as Readonly<Record<number, GearPlannerAugment>>
  if (Object.keys(valid).length === Object.keys(current).length) return slottedAugments
  return Object.keys(valid).length > 0
    ? { ...slottedAugments, [item.id]: valid }
    : withoutSlottedAugments(slottedAugments, item.id)
}

export const setGearPlannerItemReforgingState = (
  state: GearPlannerSelectionState,
  itemId: string,
  stage: GearPlannerReforgingStage,
  update: GearPlannerReforgingStageState | null,
  data: GearPlannerReforgingData
): GearPlannerSelectionState => {
  const item = equippedItemById(state.equipment, itemId)
  if (!item) return state
  if (update !== null && !isGearPlannerReforgingStageStateValid(item, stage, update, data)) return state
  const current = state.reforging[itemId] ?? {}
  if (update === null && current[stage] === undefined) return state
  if (
    update !== null &&
    current[stage]?.kind === update.kind &&
    (update.kind === 'active' || (current[stage]?.kind === 'choice' && current[stage].choiceId === update.choiceId))
  ) {
    return state
  }
  const nextItemState = update
    ? { ...current, [stage]: update }
    : Object.fromEntries(Object.entries(current).filter(([candidate]) => candidate !== stage))
  const reforging =
    Object.keys(nextItemState).length > 0
      ? { ...state.reforging, [itemId]: nextItemState }
      : withoutItemRecord(state.reforging, itemId)
  const slottedAugments = sanitizeGearPlannerSlottedAugments(
    state.slottedAugments,
    item,
    getEffectiveGearPlannerAugmentSlots(item, reforging[itemId], data)
  )
  return { ...state, reforging, slottedAugments }
}

const equippedItemById = (equipment: GearPlannerEquipment, itemId: string): GearPlannerItem | undefined =>
  Object.values(equipment).find((equipped): equipped is GearPlannerItem => equipped?.id === itemId)

export const setGearPlannerSlottedCurse = (
  state: GearPlannerSelectionState,
  itemId: string,
  curseId: string | null,
  curses: readonly GearPlannerCurse[]
): GearPlannerSelectionState => {
  const item = equippedItemById(state.equipment, itemId)
  if (!item || !canApplyGearPlannerCurse(item)) return state

  if (curseId === null) {
    const slottedCurses = withoutItemRecord(state.slottedCurses, itemId)
    return slottedCurses === state.slottedCurses ? state : { ...state, slottedCurses }
  }

  const curse = curses.find((candidate) => gearPlannerCurseIdentity(candidate) === curseId)
  if (!curse || state.slottedCurses[itemId] === curse) return state
  return { ...state, slottedCurses: { ...state.slottedCurses, [itemId]: curse } }
}

export const gearPlannerUnlockedFiligreeSlotCount = (
  item: GearPlannerItem,
  unlockedFiligreeSlots: GearPlannerUnlockedFiligreeSlots
): number => {
  const maximum = getGearPlannerMaxFiligreeSlots(item)
  if (maximum === 0) return 0
  const saved = unlockedFiligreeSlots[item.id]
  return Math.max(0, Math.min(maximum, Number.isInteger(saved) ? saved : 0))
}

export const setGearPlannerUnlockedFiligreeSlots = (
  state: GearPlannerSelectionState,
  itemId: string,
  requestedCount: number
): GearPlannerSelectionState => {
  const item = equippedItemById(state.equipment, itemId)
  const maximum = item ? getGearPlannerMaxFiligreeSlots(item) : 0
  if (!item || maximum === 0 || !Number.isInteger(requestedCount)) return state
  const count = Math.max(0, Math.min(maximum, requestedCount))
  const previousCount = gearPlannerUnlockedFiligreeSlotCount(item, state.unlockedFiligreeSlots)
  const currentFiligrees = state.slottedFiligrees[itemId] ?? {}
  const remainingFiligrees = Object.fromEntries(
    Object.entries(currentFiligrees).filter(([slotIndex]) => Number(slotIndex) < count)
  ) as Readonly<Record<number, GearPlannerFiligree>>
  const slottedFiligrees =
    Object.keys(remainingFiligrees).length > 0
      ? { ...state.slottedFiligrees, [itemId]: remainingFiligrees }
      : withoutItemRecord(state.slottedFiligrees, itemId)
  if (count === previousCount && slottedFiligrees === state.slottedFiligrees) return state
  return {
    ...state,
    slottedFiligrees,
    unlockedFiligreeSlots: { ...state.unlockedFiligreeSlots, [itemId]: count }
  }
}

export const setGearPlannerSlottedFiligree = (
  state: GearPlannerSelectionState,
  itemId: string,
  slotIndex: number,
  filigree: GearPlannerFiligree | null
): GearPlannerSelectionState => {
  const item = equippedItemById(state.equipment, itemId)
  if (
    !item ||
    !Number.isInteger(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= getGearPlannerMaxFiligreeSlots(item) ||
    slotIndex >= gearPlannerUnlockedFiligreeSlotCount(item, state.unlockedFiligreeSlots)
  ) {
    return state
  }
  const currentItemFiligrees = state.slottedFiligrees[itemId] ?? {}
  if (
    filigree &&
    Object.entries(currentItemFiligrees).some(
      ([currentSlot, selected]) =>
        Number(currentSlot) !== slotIndex &&
        normalizeGearPlannerFiligreeName(selected.name) === normalizeGearPlannerFiligreeName(filigree.name)
    )
  ) {
    return state
  }
  const itemFiligrees = filigree
    ? { ...currentItemFiligrees, [slotIndex]: filigree }
    : Object.fromEntries(
        Object.entries(currentItemFiligrees).filter(([currentSlot]) => Number(currentSlot) !== slotIndex)
      )
  const slottedFiligrees =
    Object.keys(itemFiligrees).length > 0
      ? { ...state.slottedFiligrees, [itemId]: itemFiligrees }
      : withoutItemRecord(state.slottedFiligrees, itemId)
  return slottedFiligrees === state.slottedFiligrees ? state : { ...state, slottedFiligrees }
}

export const prepareGearPlannerCandidates = (items: readonly GearPlannerItem[]): readonly GearPlannerCandidate[] =>
  items.map((item) => ({
    item,
    searchText: normalizeSearch(
      [item.source.name, ...(item.source.enchantments?.map(({ name }) => name) ?? [])].join(' ')
    ),
    type: gearPlannerItemType(item),
    sets: item.source.setBonus?.map(({ name }) => name) ?? []
  }))

export const filterGearPlannerCandidates = (
  candidates: readonly GearPlannerCandidate[],
  filters: GearPlannerFilters
): readonly GearPlannerCandidate[] => {
  const search = normalizeSearch(filters.search)

  return candidates
    .filter(({ item, searchText, type, sets }) => {
      return (
        item.minimumLevel >= filters.minimumLevel &&
        item.minimumLevel <= filters.maximumLevel &&
        (!search || searchText.includes(search)) &&
        (!filters.type || type === filters.type) &&
        (!filters.setName || sets.includes(filters.setName))
      )
    })
    .toSorted((a, b) => {
      const syntheticDifference =
        Number(isEssenceCraftedGearPlannerItem(b.item)) - Number(isEssenceCraftedGearPlannerItem(a.item))
      if (syntheticDifference !== 0) return syntheticDifference
      if (a.item.minimumLevel !== b.item.minimumLevel) return b.item.minimumLevel - a.item.minimumLevel
      const byName = a.item.source.name.localeCompare(b.item.source.name)
      return byName || a.item.id.localeCompare(b.item.id)
    })
}
