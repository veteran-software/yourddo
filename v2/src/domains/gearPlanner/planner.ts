import { isCompatibleGearPlannerAugment } from './augments.ts'
import type { GearPlannerAugment, GearPlannerItem } from './gearPlanner.types.ts'
import { gearPlannerCharacterSlots } from './gearPlanner.types.ts'

export type GearPlannerCharacterSlot = (typeof gearPlannerCharacterSlots)[number]

export type GearPlannerEquipment = Record<GearPlannerCharacterSlot, GearPlannerItem | null>

export type GearPlannerSlottedAugments = Readonly<Record<string, Readonly<Record<number, GearPlannerAugment>>>>

export interface GearPlannerSelectionState {
  equipment: GearPlannerEquipment
  slottedAugments: GearPlannerSlottedAugments
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
  slottedAugments: {}
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

export const equipGearPlannerItemInSelection = (
  state: GearPlannerSelectionState,
  slot: GearPlannerCharacterSlot,
  item: GearPlannerItem | null
): GearPlannerSelectionState => {
  const equipment = equipGearPlannerItem(state.equipment, slot, item)
  if (equipment === state.equipment) return state

  const previousItem = state.equipment[slot]
  const slottedAugments =
    previousItem && previousItem.id !== item?.id
      ? withoutSlottedAugments(state.slottedAugments, previousItem.id)
      : state.slottedAugments
  return { equipment, slottedAugments }
}

export const setGearPlannerSlottedAugment = (
  state: GearPlannerSelectionState,
  itemId: string,
  slotIndex: number,
  augment: GearPlannerAugment | null
): GearPlannerSelectionState => {
  const item = Object.values(state.equipment).find((equipped): equipped is GearPlannerItem => equipped?.id === itemId)
  const augmentSlot = item?.source.augments?.[slotIndex]
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
      if (a.item.minimumLevel !== b.item.minimumLevel) return b.item.minimumLevel - a.item.minimumLevel
      const byName = a.item.source.name.localeCompare(b.item.source.name)
      return byName || a.item.id.localeCompare(b.item.id)
    })
}
