import type { EssenceAffixPosition, EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import { candidateSetDetails, matchesGearEffect } from './finding'
import { ownsTroveItem, type TroveInventory } from './trove'
import { isCompatibleGearPlannerAugment } from './augments.ts'
import { canApplyGearPlannerCurse, gearPlannerCurseIdentity } from './curses.ts'
import {
  createGearPlannerEssenceCraftingConfiguration,
  getGearPlannerEssenceEnhancementChoices,
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
import type {
  GearPlannerAugment,
  GearPlannerCurse,
  GearPlannerEffect,
  GearPlannerFiligree,
  GearPlannerItem,
  GearPlannerData
} from './gearPlanner.types.ts'
import { slotOwner } from './character'
import { allGearPlannerSlots, gearPlannerCharacterSlots, type GearPlannerSlot } from './gearPlanner.types.ts'
import {
  getEffectiveGearPlannerAugmentSlots,
  isGearPlannerReforgingStageStateValid,
  type GearPlannerReforgingData,
  type GearPlannerReforgingStage,
  type GearPlannerReforgingStageState,
  type GearPlannerReforgingState
} from './reforging.ts'

export type GearPlannerCharacterSlot = (typeof gearPlannerCharacterSlots)[number]

export type GearPlannerEquipment = Record<GearPlannerSlot, GearPlannerItem | null>

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
  inventory?: TroveInventory
  ownedOnly?: boolean
  isConflicting?: (item: GearPlannerItem) => boolean
  exactEffect?: boolean
  bonusType?: string | null
  search: string
  minimumLevel: number
  maximumLevel: number
  type: string | null
  setName: string | null
}

export interface GearPlannerCandidate {
  item: GearPlannerItem
  effects: readonly (GearPlannerEffect & { craft?: string })[]
  searchText: string
  type: string
  sets: readonly string[]
  craftGroups: ReturnType<typeof candidateSetDetails>['craftGroups']
}

const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase()

export const gearPlannerItemType = (item: GearPlannerItem): string => {
  const type = item.source.type?.trim()
  return type === undefined || type === '' ? 'Item' : type
}

export const createEmptyGearPlannerEquipment = (): GearPlannerEquipment =>
  Object.fromEntries(allGearPlannerSlots.map((slot) => [slot, null])) as GearPlannerEquipment

export const createEmptyGearPlannerSelectionState = (): GearPlannerSelectionState => ({
  equipment: createEmptyGearPlannerEquipment(),
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  essenceCrafting: {},
  reforging: {}
})

const twoHandedSources = new Set([
  'falchion.json',
  'greatAxe.json',
  'greatClub.json',
  'greatSword.json',
  'handwraps.json',
  'maul.json',
  'quarterstaff.json',
  'longBow.json',
  'shortBow.json'
])
const crossbowSources = new Set([
  'greatCrossbow.json',
  'heavyCrossbow.json',
  'lightCrossbow.json',
  'repeatingHeavyCrossbow.json',
  'repeatingLightCrossbow.json'
])

export const occupiesBothHands = (item: GearPlannerItem) => twoHandedSources.has(item.sourceFile)

export function allowsOffHand(main: GearPlannerItem | null, off: GearPlannerItem): boolean {
  if (!main) return true
  if (crossbowSources.has(main.sourceFile)) return off.sourceFile === 'runeArm.json' || off.source.type === 'Rune Arm'
  return !occupiesBothHands(main)
}

export const equipGearPlannerItem = (
  equipment: GearPlannerEquipment,
  slot: GearPlannerSlot,
  item: GearPlannerItem | null
): GearPlannerEquipment => {
  if (item && (item.slot !== slot || (slot === 'Off Hand' && !allowsOffHand(equipment['Main Hand'], item)))) {
    return equipment
  }
  const off = equipment['Off Hand']
  if (slot === 'Main Hand' && off && !allowsOffHand(item, off)) {
    return { ...equipment, 'Main Hand': item, 'Off Hand': null }
  }
  return { ...equipment, [slot]: item }
}

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
  slot: GearPlannerSlot,
  item: GearPlannerItem
): boolean =>
  isGearPlannerMinorArtifact(item) &&
  Object.entries(equipment).some(
    ([equippedSlot, equipped]) =>
      equippedSlot !== slot &&
      slotOwner(equippedSlot) === slotOwner(slot) &&
      equipped !== null &&
      isGearPlannerMinorArtifact(equipped) &&
      !(slot === 'Main Hand' && equippedSlot === 'Off Hand' && !allowsOffHand(item, equipped))
  )

export const equipGearPlannerItemInSelection = (
  state: GearPlannerSelectionState,
  slot: GearPlannerSlot,
  item: GearPlannerItem | null
): GearPlannerSelectionState => {
  if (item && state.equipment[slot]?.id === item.id) return state
  const equipment = equipGearPlannerItem(state.equipment, slot, item)
  if (equipment === state.equipment || (item && hasOtherGearPlannerMinorArtifact(state.equipment, slot, item)))
    return state

  let next = { ...state, equipment }
  for (const changedSlot of new Set([slot, 'Off Hand'] as const)) {
    const previous = state.equipment[changedSlot]
    if (!previous || previous.id === equipment[changedSlot]?.id) continue
    next = {
      ...next,
      slottedAugments: withoutItemRecord(next.slottedAugments, previous.id),
      slottedCurses: withoutItemRecord(next.slottedCurses, previous.id),
      slottedFiligrees: withoutItemRecord(next.slottedFiligrees, previous.id),
      unlockedFiligreeSlots: withoutItemRecord(next.unlockedFiligreeSlots, previous.id),
      essenceCrafting: withoutItemRecord(next.essenceCrafting, previous.id),
      reforging: withoutItemRecord(next.reforging, previous.id)
    }
  }
  return next
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

export const prepareGearPlannerCandidates = (
  items: readonly GearPlannerItem[],
  data?: GearPlannerData,
  essence?: EssenceCraftingData
): readonly GearPlannerCandidate[] =>
  items.map((item) => {
    const { sets, craftGroups } = candidateSetDetails(item, data)
    let effects: GearPlannerCandidate['effects'] = item.source.enchantments ?? []
    if (essence && isEssenceCraftedGearPlannerItem(item)) {
      const configuration = createGearPlannerEssenceCraftingConfiguration(essence, item.minimumLevel)
      effects = (['prefix', 'suffix', 'extra'] as const).flatMap((position) =>
        getGearPlannerEssenceEnhancementChoices(essence, item, configuration, null, position).flatMap((choice) =>
          choice.effects.map((effect) => ({
            name: effect.displayName,
            bonus: essence.bonusTypes.find((type) => type.id === effect.bonusTypeId)?.displayName,
            craft: position + ' · ' + choice.displayName
          }))
        )
      )
    }
    return {
      item,
      effects,
      searchText: normalizeSearch([item.source.name, ...effects.map((e) => e.name), ...sets].join(' ')),
      type: gearPlannerItemType(item),
      sets,
      craftGroups
    }
  })

export const filterGearPlannerCandidates = (
  candidates: readonly GearPlannerCandidate[],
  filters: GearPlannerFilters
): readonly GearPlannerCandidate[] => {
  const search = normalizeSearch(filters.search)

  return candidates
    .filter(({ item, searchText, type, sets, effects }) => {
      return (
        item.minimumLevel >= filters.minimumLevel &&
        item.minimumLevel <= filters.maximumLevel &&
        (!search || searchText.includes(search)) &&
        (!filters.type || type === filters.type) &&
        (!filters.setName || sets.includes(filters.setName)) &&
        ((!filters.bonusType && !filters.exactEffect) ||
          effects.some((e) => matchesGearEffect(e, search, filters.bonusType, Boolean(filters.exactEffect)))) &&
        (!filters.ownedOnly ||
          Boolean(item.essenceCrafting) ||
          (filters.inventory && ownsTroveItem(filters.inventory, item.source.name))) &&
        !filters.isConflicting?.(item)
      )
    })
    .toSorted((a, b) => {
      const syntheticDifference =
        Number(isEssenceCraftedGearPlannerItem(b.item)) - Number(isEssenceCraftedGearPlannerItem(a.item))
      if (syntheticDifference !== 0) return syntheticDifference
      if (filters.inventory?.size) {
        const owned =
          Number(ownsTroveItem(filters.inventory, b.item.source.name)) -
          Number(ownsTroveItem(filters.inventory, a.item.source.name))
        if (owned) return owned
      }
      if (a.item.minimumLevel !== b.item.minimumLevel) return b.item.minimumLevel - a.item.minimumLevel
      const byName = a.item.source.name.localeCompare(b.item.source.name)
      return byName || a.item.id.localeCompare(b.item.id)
    })
}
