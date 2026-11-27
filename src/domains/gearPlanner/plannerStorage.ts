import { convertLegacyGearSave } from './legacyImport'
import { gearCraftGroups, applyGearCraft, craftStageOrder } from './crafting.ts'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import { gearPlannerAugmentIdentity, isCompatibleGearPlannerAugment } from './augments.ts'
import { canApplyGearPlannerCurse, collectSelectedGearPlannerCurses, gearPlannerCurseIdentity } from './curses.ts'
import {
  type GearPlannerEssenceCraftingConfiguration,
  isEssenceCraftedGearPlannerItem,
  isGearPlannerEssenceAffixValid,
  isGearPlannerEssenceCraftingMaterial,
  resolveEssenceCraftedGearPlannerItem
} from './essenceCrafting.ts'
import { getGearPlannerMaxFiligreeSlots } from './filigrees.ts'
import {
  catalogWeaponTypes,
  normalizeSavedWeaponFilters,
  savedWeaponFilterOptions,
  classNames,
  defaultCharacter,
  maxFocusStats,
  slotOwner,
  proficiencyOptions,
  type CharacterSettings
} from './character'
import {
  allGearPlannerSlots,
  gearPlannerPetSlots,
  gearPlannerCharacterSlots,
  type GearPlannerItem,
  type GearPlannerSlot,
  type GearPlannerData
} from './gearPlanner.types.ts'
import {
  allowsOffHand,
  createEmptyGearPlannerEquipment,
  setGearPlannerItemReforgingState,
  setGearPlannerSlottedAugment,
  setGearPlannerSlottedCurse,
  configureHostFiligree,
  configureHostFiligreeSlots
} from './planner.ts'
import {
  getEffectiveGearPlannerAugmentSlots,
  gearPlannerReforgingRecipeForStage,
  gearPlannerReforgingStages,
  gearPlannerReforgingChoiceForState,
  isGearPlannerReforgingStageStateValid,
  type GearPlannerItemReforgingState,
  type GearPlannerReforgingStageState
} from './reforging.ts'
import {
  createDefaultGearPlannerState,
  createGearPlannerSetup,
  gearPlannerMaximumLevel,
  gearPlannerMinimumLevel,
  type GearPlannerSetup,
  type GearPlannerSetupsState
} from './setups.ts'

// Keep the pre-catalog snapshot readable by older clients and available for recovery.
const preCatalogStorageKey = 'yourddo:gear-planner:v2'
export const GEAR_PLANNER_STORAGE_KEY = 'yourddo:gear-planner:items'
// V1 accepts additive optional fields, so filigree references keep prior v2 saves compatible.
export const GEAR_PLANNER_PERSISTED_VERSION = 1 as const
export const GEAR_PLANNER_EXPORT_FILENAME = 'yourddo-gear-planner-v2.json'

export interface GearPlannerStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface PersistedGearPlannerAugmentV1 {
  itemId: string
  slotIndex: number
  augmentId: string
}

export interface PersistedGearPlannerFiligreeV1 {
  itemId: string
  slotIndex: number
  filigreeId: string
}

export interface PersistedGearPlannerCurseV1 {
  itemId: string
  curseId: string
}

export interface PersistedGearPlannerUnlockedFiligreeSlotsV1 {
  itemId: string
  count: number
}

export interface PersistedGearPlannerEssenceCraftingV1 {
  itemId: string
  minimumLevel: number
  material: string
  prefixId: string | null
  suffixId: string | null
  extraId: string | null
}

export interface PersistedGearPlannerReforgingV1 {
  itemId: string
  stages: GearPlannerItemReforgingState
}

export interface PersistedGearPlannerSetupV1 {
  id: string
  name: string
  minimumLevel: number
  maximumLevel: number
  character?: CharacterSettings
  equipment: Record<(typeof gearPlannerCharacterSlots)[number], string | null> &
    Partial<Record<GearPlannerSlot, string | null>>
  selectedAugments: readonly PersistedGearPlannerAugmentV1[]
  selectedCurses?: readonly PersistedGearPlannerCurseV1[]
  selectedFiligrees?: readonly PersistedGearPlannerFiligreeV1[]
  unlockedFiligreeSlots?: readonly PersistedGearPlannerUnlockedFiligreeSlotsV1[]
  selectedEssenceCrafting?: readonly PersistedGearPlannerEssenceCraftingV1[]
  selectedCrafts?: readonly { itemId: string; system: string; choiceId: string }[]
  selectedReforging?: readonly PersistedGearPlannerReforgingV1[]
}

export interface PersistedGearPlannerStateV1 {
  version: typeof GEAR_PLANNER_PERSISTED_VERSION
  activeSetupId: string
  setups: readonly PersistedGearPlannerSetupV1[]
  exportedAt?: string
}

export interface GearPlannerRestoreIssue {
  kind:
    | 'legacy-selection'
    | 'invalid-craft'
    | 'invalid-state'
    | 'incompatible-off-hand'
    | 'missing-item'
    | 'missing-augment'
    | 'orphaned-augment'
    | 'incompatible-augment'
    | 'missing-curse'
    | 'orphaned-curse'
    | 'ineligible-curse'
    | 'missing-filigree'
    | 'orphaned-filigree'
    | 'invalid-filigree-slot'
    | 'missing-essence-data'
    | 'orphaned-essence'
    | 'ineligible-essence'
    | 'missing-essence-enhancement'
    | 'orphaned-reforging'
    | 'missing-reforging-recipe'
    | 'invalid-reforging-selection'
  message: string
}

export interface RestoredGearPlannerState {
  state: GearPlannerSetupsState
  issues: readonly GearPlannerRestoreIssue[]
}

export type GearPlannerStorageSource = 'empty' | 'v2' | 'legacy' | 'invalid'

export interface LoadedGearPlannerState extends RestoredGearPlannerState {
  source: GearPlannerStorageSource
  legacySaveImported?: boolean
  carryover?: { kind: 'success' | 'error'; message: string }
}

export class InvalidGearPlannerStateError extends Error {
  constructor(message: string) {
    super(`Invalid Gear Planner saved state: ${message}`)
    this.name = 'InvalidGearPlannerStateError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const requiredRecord = (value: unknown, path: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new InvalidGearPlannerStateError(`${path} must be an object`)
  return value
}

const requiredString = (value: unknown, path: string): string => {
  if (typeof value !== 'string' || !value.trim())
    throw new InvalidGearPlannerStateError(`${path} must be a non-empty string`)
  return value
}

const requiredLevel = (value: unknown, path: string): number => {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < gearPlannerMinimumLevel ||
    value > gearPlannerMaximumLevel
  ) {
    throw new InvalidGearPlannerStateError(`${path} must be an integer from 1 to 36`)
  }
  return value
}

function parseCharacter(value: unknown, path: string, availableWeapons: readonly string[]): CharacterSettings {
  const record = requiredRecord(value, path)
  const character = defaultCharacter()
  for (const key of ['classes', 'weapons', 'armor', 'shields'] as const) {
    const raw = record[key]
    const values = key === 'weapons' && Array.isArray(raw) ? normalizeSavedWeaponFilters(raw, availableWeapons) : raw
    const options =
      key === 'classes'
        ? classNames
        : key === 'weapons'
          ? savedWeaponFilterOptions(availableWeapons)
          : proficiencyOptions[key]
    if (
      !Array.isArray(values) ||
      !values.every((v: unknown): v is string => typeof v === 'string' && options.includes(v)) ||
      new Set(values).size !== values.length ||
      (key === 'classes' && values.length > 3)
    )
      throw new InvalidGearPlannerStateError(path + '.' + key + ' contains invalid selections')
    character[key] = values
  }
  if (record.focusStats !== undefined) {
    const names: unknown = record.focusStats
    if (
      !Array.isArray(names) ||
      names.length > maxFocusStats ||
      !names.every((name: unknown): name is string => typeof name === 'string' && Boolean(name.trim())) ||
      new Set(names.map((name) => name.toLowerCase())).size !== names.length
    )
      throw new InvalidGearPlannerStateError(
        `${path}.focusStats must contain up to ${String(maxFocusStats)} distinct stat names`
      )
    character.focusStats = names
  }
  if (record.disabledProficiencies !== undefined) {
    const disabled = record.disabledProficiencies
    if (
      !Array.isArray(disabled) ||
      !disabled.every(
        (key: unknown): key is keyof typeof proficiencyOptions =>
          (key === 'weapons' || key === 'armor' || key === 'shields') && character[key].length === 0
      )
    )
      throw new InvalidGearPlannerStateError(path + '.disabledProficiencies contains invalid selections')
    character.disabledProficiencies = [...new Set(disabled)]
  }
  if (typeof record.allowMetalWithDruid !== 'boolean')
    throw new InvalidGearPlannerStateError(path + '.allowMetalWithDruid must be a boolean')
  return { ...character, allowMetalWithDruid: record.allowMetalWithDruid }
}

const parseEquipment = (value: unknown, path: string): PersistedGearPlannerSetupV1['equipment'] => {
  const record = requiredRecord(value, path)
  const validSlots = new Set<string>(allGearPlannerSlots)
  for (const key of Object.keys(record)) {
    if (!validSlots.has(key)) throw new InvalidGearPlannerStateError(`${path} contains an unknown equipment slot`)
  }
  const equipment = {} as PersistedGearPlannerSetupV1['equipment']
  for (const slot of allGearPlannerSlots) {
    if (!Object.hasOwn(record, slot) && (gearPlannerPetSlots as readonly GearPlannerSlot[]).includes(slot)) continue
    const itemId = record[slot]
    if (itemId !== null && (typeof itemId !== 'string' || !itemId.trim())) {
      throw new InvalidGearPlannerStateError(`${path}.${slot} must be an item ID or null`)
    }
    equipment[slot] = itemId
  }
  return equipment
}

const parseSelectedAugments = (value: unknown, path: string): readonly PersistedGearPlannerAugmentV1[] => {
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, index) => {
    const record = requiredRecord(entry, `${path}[${String(index)}]`)
    const itemId = requiredString(record.itemId, `${path}[${String(index)}].itemId`)
    const augmentId = requiredString(record.augmentId, `${path}[${String(index)}].augmentId`)
    if (!Number.isInteger(record.slotIndex) || (record.slotIndex as number) < 0) {
      throw new InvalidGearPlannerStateError(`${path}[${String(index)}].slotIndex must be a non-negative integer`)
    }
    const slotIndex = record.slotIndex as number
    const identity = `${itemId}\u0000${String(slotIndex)}`
    if (seen.has(identity)) throw new InvalidGearPlannerStateError(`${path} contains duplicate augment selections`)
    seen.add(identity)
    return { itemId, slotIndex, augmentId }
  })
}

const parseSelectedFiligrees = (value: unknown, path: string): readonly PersistedGearPlannerFiligreeV1[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, index) => {
    const entryPath = `${path}[${String(index)}]`
    const record = requiredRecord(entry, entryPath)
    const itemId = requiredString(record.itemId, `${entryPath}.itemId`)
    const filigreeId = requiredString(record.filigreeId, `${entryPath}.filigreeId`)
    if (!Number.isInteger(record.slotIndex) || (record.slotIndex as number) < 0) {
      throw new InvalidGearPlannerStateError(`${entryPath}.slotIndex must be a non-negative integer`)
    }
    const slotIndex = record.slotIndex as number
    const identity = `${itemId}\u0000${String(slotIndex)}`
    if (seen.has(identity)) throw new InvalidGearPlannerStateError(`${path} contains duplicate filigree selections`)
    seen.add(identity)
    return { itemId, slotIndex, filigreeId }
  })
}

const parseSelectedCurses = (value: unknown, path: string): readonly PersistedGearPlannerCurseV1[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, index) => {
    const entryPath = `${path}[${String(index)}]`
    const record = requiredRecord(entry, entryPath)
    const itemId = requiredString(record.itemId, `${entryPath}.itemId`)
    const curseId = requiredString(record.curseId, `${entryPath}.curseId`)
    if (seen.has(itemId)) throw new InvalidGearPlannerStateError(`${path} contains duplicate item IDs`)
    seen.add(itemId)
    return { itemId, curseId }
  })
}

const parseUnlockedFiligreeSlots = (
  value: unknown,
  path: string
): readonly PersistedGearPlannerUnlockedFiligreeSlotsV1[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, index) => {
    const entryPath = `${path}[${String(index)}]`
    const record = requiredRecord(entry, entryPath)
    const itemId = requiredString(record.itemId, `${entryPath}.itemId`)
    if (!Number.isInteger(record.count) || (record.count as number) < 0) {
      throw new InvalidGearPlannerStateError(`${entryPath}.count must be a non-negative integer`)
    }
    if (seen.has(itemId)) throw new InvalidGearPlannerStateError(`${path} contains duplicate item IDs`)
    seen.add(itemId)
    return { itemId, count: record.count as number }
  })
}

const nullableSelectionId = (value: unknown, path: string): string | null => {
  if (value === null) return null
  if (typeof value !== 'string' || !value.trim()) {
    throw new InvalidGearPlannerStateError(`${path} must be an enhancement ID or null`)
  }
  return value
}

const parseSelectedEssenceCrafting = (
  value: unknown,
  path: string
): readonly PersistedGearPlannerEssenceCraftingV1[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, index) => {
    const entryPath = `${path}[${String(index)}]`
    const record = requiredRecord(entry, entryPath)
    const itemId = requiredString(record.itemId, `${entryPath}.itemId`)
    if (seen.has(itemId)) throw new InvalidGearPlannerStateError(`${path} contains duplicate item IDs`)
    seen.add(itemId)
    if (typeof record.material !== 'string')
      throw new InvalidGearPlannerStateError(`${entryPath}.material must be a string`)
    return {
      itemId,
      minimumLevel: requiredLevel(record.minimumLevel, `${entryPath}.minimumLevel`),
      material: record.material,
      prefixId: nullableSelectionId(record.prefixId, `${entryPath}.prefixId`),
      suffixId: nullableSelectionId(record.suffixId, `${entryPath}.suffixId`),
      extraId: nullableSelectionId(record.extraId, `${entryPath}.extraId`)
    }
  })
}

const parseReforgingStageState = (value: unknown, path: string): GearPlannerReforgingStageState => {
  const record = requiredRecord(value, path)
  if (record.kind === 'active') return { kind: 'active' }
  if (record.kind === 'choice') return { kind: 'choice', choiceId: requiredString(record.choiceId, `${path}.choiceId`) }
  throw new InvalidGearPlannerStateError(`${path}.kind must be active or choice`)
}

const parseSelectedReforging = (value: unknown, path: string): readonly PersistedGearPlannerReforgingV1[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  const stages = new Set<string>(gearPlannerReforgingStages)
  return value.map((entry, index) => {
    const entryPath = `${path}[${String(index)}]`
    const record = requiredRecord(entry, entryPath)
    const itemId = requiredString(record.itemId, `${entryPath}.itemId`)
    if (seen.has(itemId)) throw new InvalidGearPlannerStateError(`${path} contains duplicate item IDs`)
    seen.add(itemId)
    const sourceStages = requiredRecord(record.stages, `${entryPath}.stages`)
    const parsed: Partial<Record<(typeof gearPlannerReforgingStages)[number], GearPlannerReforgingStageState>> = {}
    for (const [stage, state] of Object.entries(sourceStages)) {
      if (!stages.has(stage))
        throw new InvalidGearPlannerStateError(`${entryPath}.stages contains an unsupported stage`)
      parsed[stage as (typeof gearPlannerReforgingStages)[number]] = parseReforgingStageState(
        state,
        `${entryPath}.stages.${stage}`
      )
    }
    if (Object.keys(parsed).length === 0)
      throw new InvalidGearPlannerStateError(`${entryPath}.stages must not be empty`)
    return { itemId, stages: parsed }
  })
}

const parseSelectedCrafts = (value: unknown, path: string) => {
  if (!Array.isArray(value)) throw new InvalidGearPlannerStateError(`${path} must be an array`)
  const seen = new Set<string>()
  return value.map((entry, i) => {
    const key = `${path}[${String(i)}]`
    const record = requiredRecord(entry, key)
    const itemId = requiredString(record.itemId, key + '.itemId')
    const system = requiredString(record.system, key + '.system')
    const identity = JSON.stringify([itemId, system])
    if (seen.has(identity)) throw new InvalidGearPlannerStateError(`${path} contains duplicate crafting selections`)
    seen.add(identity)
    return { itemId, system, choiceId: requiredString(record.choiceId, key + '.choiceId') }
  })
}

const parseSetup = (
  value: unknown,
  index: number,
  availableWeapons: readonly string[]
): PersistedGearPlannerSetupV1 => {
  const path = `setups[${String(index)}]`
  const record = requiredRecord(value, path)
  const id = requiredString(record.id, `${path}.id`)
  if (id !== id.trim()) throw new InvalidGearPlannerStateError(`${path}.id must not have surrounding whitespace`)
  const name = requiredString(record.name, `${path}.name`).trim()
  const minimumLevel = requiredLevel(record.minimumLevel, `${path}.minimumLevel`)
  const maximumLevel = requiredLevel(record.maximumLevel, `${path}.maximumLevel`)
  if (minimumLevel > maximumLevel) throw new InvalidGearPlannerStateError(`${path} has an invalid level range`)
  return {
    id,
    name,
    minimumLevel,
    maximumLevel,
    ...(record.character === undefined
      ? {}
      : { character: parseCharacter(record.character, path + '.character', availableWeapons) }),
    equipment: parseEquipment(record.equipment, `${path}.equipment`),
    selectedAugments: parseSelectedAugments(record.selectedAugments, `${path}.selectedAugments`),
    ...(record.selectedCurses === undefined
      ? {}
      : { selectedCurses: parseSelectedCurses(record.selectedCurses, `${path}.selectedCurses`) }),
    ...(record.selectedFiligrees === undefined
      ? {}
      : { selectedFiligrees: parseSelectedFiligrees(record.selectedFiligrees, `${path}.selectedFiligrees`) }),
    ...(record.unlockedFiligreeSlots === undefined
      ? {}
      : {
          unlockedFiligreeSlots: parseUnlockedFiligreeSlots(
            record.unlockedFiligreeSlots,
            `${path}.unlockedFiligreeSlots`
          )
        }),
    ...(record.selectedEssenceCrafting === undefined
      ? {}
      : {
          selectedEssenceCrafting: parseSelectedEssenceCrafting(
            record.selectedEssenceCrafting,
            `${path}.selectedEssenceCrafting`
          )
        }),
    ...(record.selectedCrafts === undefined
      ? {}
      : { selectedCrafts: parseSelectedCrafts(record.selectedCrafts, `${path}.selectedCrafts`) }),
    ...(record.selectedReforging === undefined
      ? {}
      : { selectedReforging: parseSelectedReforging(record.selectedReforging, `${path}.selectedReforging`) })
  }
}

export const parsePersistedGearPlannerState = (value: unknown, data?: GearPlannerData): PersistedGearPlannerStateV1 => {
  const record = requiredRecord(value, 'payload')
  if (record.version !== GEAR_PLANNER_PERSISTED_VERSION) {
    throw new InvalidGearPlannerStateError(`version must be ${String(GEAR_PLANNER_PERSISTED_VERSION)}`)
  }
  if (!Array.isArray(record.setups) || record.setups.length === 0) {
    throw new InvalidGearPlannerStateError('setups must be a non-empty array')
  }
  const availableWeapons = data ? catalogWeaponTypes(data) : proficiencyOptions.weapons
  const setups = record.setups.map((setup, index) => parseSetup(setup, index, availableWeapons))
  const ids = new Set<string>()
  for (const setup of setups) {
    if (ids.has(setup.id)) throw new InvalidGearPlannerStateError('setup IDs must be unique')
    ids.add(setup.id)
  }
  const activeSetupId = requiredString(record.activeSetupId, 'activeSetupId')
  if (!ids.has(activeSetupId)) throw new InvalidGearPlannerStateError('activeSetupId must reference an imported setup')
  if (
    record.exportedAt !== undefined &&
    (typeof record.exportedAt !== 'string' || Number.isNaN(Date.parse(record.exportedAt)))
  ) {
    throw new InvalidGearPlannerStateError('exportedAt must be an ISO date string when present')
  }
  return {
    version: GEAR_PLANNER_PERSISTED_VERSION,
    activeSetupId,
    setups,
    ...(record.exportedAt === undefined ? {} : { exportedAt: record.exportedAt })
  }
}

export const serializeGearPlannerState = (state: GearPlannerSetupsState): PersistedGearPlannerStateV1 => ({
  version: GEAR_PLANNER_PERSISTED_VERSION,
  activeSetupId: state.activeSetupId,
  setups: state.setups.map((setup) => ({
    id: setup.id,
    name: setup.name,
    minimumLevel: setup.minimumLevel,
    maximumLevel: setup.maximumLevel,
    character: setup.character,
    equipment: Object.fromEntries(
      allGearPlannerSlots
        .filter((slot) => slotOwner(slot) === 'Character' || setup.equipment[slot])
        .map((slot) => [slot, setup.equipment[slot]?.id ?? null])
    ) as PersistedGearPlannerSetupV1['equipment'],
    selectedAugments: Object.values(setup.equipment)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .flatMap((item) =>
        Object.entries(setup.slottedAugments[item.id] ?? {}).map(([slotIndex, augment]) => ({
          itemId: item.id,
          slotIndex: Number(slotIndex),
          augmentId: gearPlannerAugmentIdentity(augment)
        }))
      )
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId) || left.slotIndex - right.slotIndex),
    selectedCurses: collectSelectedGearPlannerCurses(setup.equipment, setup.slottedCurses)
      .map(({ item, curse }) => ({ itemId: item.id, curseId: gearPlannerCurseIdentity(curse) }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId)),
    selectedFiligrees: Object.entries(setup.slottedFiligrees)
      .flatMap(([itemId, slots]) =>
        Object.entries(slots).map(([index, filigree]) => ({
          itemId,
          slotIndex: Number(index),
          filigreeId: filigree.id
        }))
      )
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId) || left.slotIndex - right.slotIndex),
    unlockedFiligreeSlots: Object.entries(setup.unlockedFiligreeSlots)
      .map(([itemId, count]) => ({ itemId, count }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId)),
    selectedEssenceCrafting: Object.values(setup.equipment)
      .filter(isEssenceCraftedGearPlannerItem)
      .flatMap((item) => {
        const configuration = setup.essenceCrafting[item.id]
        return configuration
          ? [
              {
                itemId: item.id,
                minimumLevel: configuration.minimumLevel,
                material: configuration.material,
                prefixId: configuration.prefixId,
                suffixId: configuration.suffixId,
                extraId: configuration.extraId
              }
            ]
          : []
      })
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId)),
    selectedCrafts: Object.values(setup.equipment).flatMap(
      (item) => item?.crafts?.map((craft) => ({ itemId: item.id, system: craft.system, choiceId: craft.id })) ?? []
    ),
    selectedReforging: Object.values(setup.equipment)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .flatMap((item) => {
        const stages = setup.reforging[item.id]
        return stages && Object.keys(stages).length > 0 ? [{ itemId: item.id, stages: { ...stages } }] : []
      })
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId))
  }))
})

const findEquippedItem = (setup: GearPlannerSetup, itemId: string) =>
  Object.values(setup.equipment).find((item) => item?.id === itemId) ?? null

function savedFields(key: string) {
  try {
    return key.split('|').map(decodeURIComponent)
  } catch {
    return []
  }
}

function savedName(name: string) {
  return name.replaceAll('’', "'").replace(/\s+/g, ' ').trim().toLowerCase()
}

function restoreCatalog(data: GearPlannerData, essenceData?: EssenceCraftingData) {
  const itemsById = new Map(data.items.map((item) => [item.id, item]))
  const augmentsById = new Map(data.augments.map((augment) => [gearPlannerAugmentIdentity(augment), augment]))
  const cursesById = new Map(data.curses.map((curse) => [gearPlannerCurseIdentity(curse), curse]))
  const filigreesById = new Map(data.filigrees.map((filigree) => [filigree.id, filigree]))
  return { data, essenceData, itemsById, augmentsById, cursesById, filigreesById }
}

type RestoreCatalog = ReturnType<typeof restoreCatalog>
type ReportIssue = (kind: GearPlannerRestoreIssue['kind'], message: string) => void

function legacyEquipmentFields(id: string) {
  const parts = id.split('|')
  if (parts.length !== 5) return undefined
  try {
    return parts.map(decodeURIComponent)
  } catch {
    return undefined
  }
}

// Pre-catalog saves identified equipment by source page, filename, name and level.
function migrateEquipmentReferences(
  setup: PersistedGearPlannerSetupV1,
  catalog: RestoreCatalog,
  report: ReportIssue
): PersistedGearPlannerSetupV1 {
  const replacements = new Map<string, string>()
  const equipment = { ...setup.equipment }
  for (const slot of allGearPlannerSlots) {
    const oldId = equipment[slot]
    if (!oldId || catalog.itemsById.has(oldId)) continue
    const fields = legacyEquipmentFields(oldId)
    if (!fields) continue
    const [savedSlot, file, , name, level] = fields
    if (savedSlot !== slot) continue
    const matches = catalog.data.itemsBySlot[slot].filter(
      (item) =>
        item.source.catalogId !== undefined &&
        item.source.name.toLowerCase() === name.toLowerCase() &&
        item.minimumLevel === Number(level) &&
        (item.sourceFile === file ||
          (item.sourceFile === 'cloth.json' && (file === 'robe.json' || file === 'outfit.json')))
    )
    if (matches.length === 1) {
      replacements.set(oldId, matches[0].id)
      equipment[slot] = matches[0].id
    } else {
      const reason = matches.length ? 'matches multiple catalog items' : 'has no catalog match'
      report('missing-item', `${slot}: ${name} (ML ${level}) ${reason}.`)
      equipment[slot] = null
    }
  }
  if (!replacements.size) return { ...setup, equipment }
  const remap = <T extends { itemId: string }>(entry: T): T => ({
    ...entry,
    itemId: replacements.get(entry.itemId) ?? entry.itemId
  })
  return {
    ...setup,
    equipment,
    selectedAugments: setup.selectedAugments.map(remap),
    selectedCrafts: setup.selectedCrafts?.map(remap),
    selectedCurses: setup.selectedCurses?.map(remap),
    unlockedFiligreeSlots: setup.unlockedFiligreeSlots?.map(remap),
    selectedFiligrees: setup.selectedFiligrees?.map(remap),
    selectedReforging: setup.selectedReforging?.map(remap),
    selectedEssenceCrafting: setup.selectedEssenceCrafting?.map(remap)
  }
}

function restoreEquipment(savedSetup: PersistedGearPlannerSetupV1, { itemsById }: RestoreCatalog, report: ReportIssue) {
  const equipment = createEmptyGearPlannerEquipment()
  for (const slot of allGearPlannerSlots) {
    const itemId = savedSetup.equipment[slot]
    if (itemId == null) continue
    const item = itemsById.get(itemId) ?? resolveEssenceCraftedGearPlannerItem(itemId, slot)
    if (item?.slot !== slot) {
      report('missing-item', `${slot} item is no longer available`)
      continue
    }
    const mainHand = equipment['Main Hand']
    if (slot === 'Off Hand' && mainHand && !allowsOffHand(mainHand, item)) {
      report(
        'incompatible-off-hand',
        `${item.source.name} was unequipped because it cannot be used with ${mainHand.source.name}.`
      )
      continue
    }
    equipment[slot] = item
  }
  return equipment
}

function restoreGearCrafts(
  equipment: GearPlannerSetup['equipment'],
  savedSetup: PersistedGearPlannerSetupV1,
  { data }: RestoreCatalog,
  report: ReportIssue
) {
  for (const { itemId, system, choiceId } of (savedSetup.selectedCrafts ?? []).toSorted(
    (a, b) => craftStageOrder(a.system) - craftStageOrder(b.system)
  )) {
    const slot = allGearPlannerSlots.find((s) => equipment[s]?.id === itemId)
    const item = slot && equipment[slot]
    const group = item && gearCraftGroups(item, data.crafting).find((g) => g.system === system)
    if (slot && item && group) {
      // Older exports used "Slave's Endurance" for the published Slaver's Endurance set.
      const restoredChoice =
        system === 'slave-lords' && item.slaveLordsBase
          ? choiceId.replace("Slave's Endurance", "Slaver's Endurance")
          : choiceId
      const updated = applyGearCraft(item, group, restoredChoice, data.crafting)
      if (updated !== item) {
        equipment[slot] = updated
        continue
      }
    }
    report('invalid-craft', `${system} selection is unavailable for its item`)
  }
}

function restoreReforging(
  setup: GearPlannerSetup,
  savedReforging: PersistedGearPlannerReforgingV1,
  { data }: RestoreCatalog,
  report: ReportIssue
) {
  const item = findEquippedItem(setup, savedReforging.itemId)
  if (!item) {
    report('orphaned-reforging', 'reforging host item is not equipped')
    return setup
  }
  for (const stage of gearPlannerReforgingStages) {
    const selected = savedReforging.stages[stage]
    if (!selected) continue
    if (!gearPlannerReforgingRecipeForStage(item, stage, data.reforging)) {
      report('missing-reforging-recipe', 'reforging recipe is unavailable')
      continue
    }
    if (!isGearPlannerReforgingStageStateValid(item, stage, selected, data.reforging)) {
      report('invalid-reforging-selection', 'reforging selection is invalid')
      continue
    }
    const choice = gearPlannerReforgingChoiceForState(item, stage, selected, data.reforging)
    const selection = setGearPlannerItemReforgingState(
      setup,
      item.id,
      stage,
      choice ? { kind: 'choice', choiceId: choice.id } : selected,
      data.reforging
    )
    setup = { ...setup, ...selection }
  }
  return setup
}

function restoreAugment(
  setup: GearPlannerSetup,
  savedAugment: PersistedGearPlannerAugmentV1,
  { augmentsById, data }: RestoreCatalog,
  report: ReportIssue
): GearPlannerSetup {
  const item = findEquippedItem(setup, savedAugment.itemId)
  if (!item) {
    report('orphaned-augment', 'augment host item is not equipped')
    return setup
  }
  let augment = augmentsById.get(savedAugment.augmentId)
  if (!augment) {
    const [type, level, name] = savedFields(savedAugment.augmentId)
    if (name) {
      const matches = data.augments.filter(
        (a) => a.augmentType === type && a.minLevel === Number(level) && savedName(a.name) === savedName(name)
      )
      if (matches.length === 1) augment = matches[0]
    }
  }
  if (!augment) {
    report('missing-augment', 'selected augment is no longer available')
    return setup
  }
  const augmentSlots = getEffectiveGearPlannerAugmentSlots(item, setup.reforging[item.id], data.reforging)
  const augmentSlot = augmentSlots[savedAugment.slotIndex]
  if (!augmentSlot || !isCompatibleGearPlannerAugment(augmentSlot, augment)) {
    report('incompatible-augment', 'selected augment is no longer compatible')
    return setup
  }
  const selection = setGearPlannerSlottedAugment(setup, item.id, savedAugment.slotIndex, augment, augmentSlots)
  return { ...setup, ...selection }
}

function restoreCurse(
  setup: GearPlannerSetup,
  savedCurse: PersistedGearPlannerCurseV1,
  { cursesById, data }: RestoreCatalog,
  report: ReportIssue
): GearPlannerSetup {
  const item = findEquippedItem(setup, savedCurse.itemId)
  if (!item) {
    report('orphaned-curse', 'curse host item is not equipped')
    return setup
  }
  if (!canApplyGearPlannerCurse(item)) {
    report('ineligible-curse', 'curses cannot be applied to Quiver')
    return setup
  }
  if (!cursesById.has(savedCurse.curseId)) {
    report('missing-curse', 'selected curse is no longer available')
    return setup
  }
  const selection = setGearPlannerSlottedCurse(setup, item.id, savedCurse.curseId, data.curses)
  return { ...setup, ...selection }
}

function restoreEssenceConfiguration(
  setup: GearPlannerSetup,
  item: GearPlannerItem,
  savedEssence: PersistedGearPlannerEssenceCraftingV1,
  essenceData: EssenceCraftingData,
  report: ReportIssue
) {
  const configuration: GearPlannerEssenceCraftingConfiguration = {
    minimumLevel: savedEssence.minimumLevel,
    material: isGearPlannerEssenceCraftingMaterial(savedEssence.material) ? savedEssence.material : '',
    prefixId: null,
    suffixId: null,
    extraId: null
  }
  if (!isGearPlannerEssenceCraftingMaterial(savedEssence.material)) {
    report('ineligible-essence', 'Essence Crafted material is invalid')
  }
  for (const [position, enhancementId] of [
    ['prefix', savedEssence.prefixId],
    ['suffix', savedEssence.suffixId],
    ['extra', savedEssence.extraId]
  ] as const) {
    if (enhancementId === null) continue
    if (!essenceData.indexes.enhancementById.has(enhancementId)) {
      report('missing-essence-enhancement', 'Essence enhancement is unavailable')
      continue
    }
    if (
      !isGearPlannerEssenceAffixValid(
        essenceData,
        item,
        configuration,
        setup.slottedCurses[item.id],
        position,
        enhancementId
      )
    ) {
      report('ineligible-essence', 'Essence enhancement is no longer eligible')
      continue
    }
    configuration[`${position}Id`] = enhancementId
  }
  return configuration
}

function restoreEssence(
  setup: GearPlannerSetup,
  savedEssence: PersistedGearPlannerEssenceCraftingV1,
  { essenceData }: RestoreCatalog,
  report: ReportIssue
) {
  const item = findEquippedItem(setup, savedEssence.itemId)
  if (!item) {
    report('orphaned-essence', 'Essence Crafted host item is not equipped')
    return setup
  }
  if (!isEssenceCraftedGearPlannerItem(item)) {
    report('ineligible-essence', 'item is not Essence Crafted')
    return setup
  }
  if (!essenceData) {
    report('missing-essence-data', 'Essence Crafting data is unavailable')
    return setup
  }
  if (
    savedEssence.minimumLevel < essenceData.rules.supportedItemLevels.minimum ||
    savedEssence.minimumLevel > essenceData.rules.supportedItemLevels.maximum
  ) {
    report('ineligible-essence', 'Essence Crafted ML is invalid')
    return setup
  }
  const configuration = restoreEssenceConfiguration(setup, item, savedEssence, essenceData, report)
  return { ...setup, essenceCrafting: { ...setup.essenceCrafting, [item.id]: configuration } }
}

function restoreFiligreeSlots(
  setup: GearPlannerSetup,
  savedUnlockedSlots: PersistedGearPlannerUnlockedFiligreeSlotsV1,
  { itemsById }: RestoreCatalog,
  report: ReportIssue
): GearPlannerSetup {
  const item = findEquippedItem(setup, savedUnlockedSlots.itemId) ?? itemsById.get(savedUnlockedSlots.itemId)
  if (!item) {
    report('orphaned-filigree', 'filigree host item is unavailable')
    return setup
  }
  if (getGearPlannerMaxFiligreeSlots(item) === 0) return setup
  const selection = configureHostFiligreeSlots(setup, item, savedUnlockedSlots.count)
  return { ...setup, ...selection }
}

function restoreFiligree(
  setup: GearPlannerSetup,
  savedFiligree: PersistedGearPlannerFiligreeV1,
  { itemsById, filigreesById }: RestoreCatalog,
  report: ReportIssue
): GearPlannerSetup {
  const item = findEquippedItem(setup, savedFiligree.itemId) ?? itemsById.get(savedFiligree.itemId)
  if (!item) {
    report('orphaned-filigree', 'filigree host item is unavailable')
    return setup
  }
  let filigree = filigreesById.get(savedFiligree.filigreeId)
  if (!filigree) {
    const [, name] = savedFields(savedFiligree.filigreeId)
    if (name) {
      const matches = [...filigreesById.values()].filter((f) => savedName(f.name) === savedName(name))
      if (matches.length === 1) filigree = matches[0]
    }
  }
  if (!filigree) {
    report('missing-filigree', 'selected filigree is no longer available')
    return setup
  }
  if (savedFiligree.slotIndex >= getGearPlannerMaxFiligreeSlots(item)) {
    report('invalid-filigree-slot', 'filigree slot is no longer available')
    return setup
  }
  const selection = configureHostFiligree(setup, item, savedFiligree.slotIndex, filigree)
  if (selection === setup) {
    report(
      'invalid-filigree-slot',
      `could not slot ${filigree.name} on ${item.source.name}: the slot is locked, occupied, or this type is already slotted`
    )
    return setup
  }
  return { ...setup, ...selection }
}

export const restorePersistedGearPlannerState = (
  persisted: PersistedGearPlannerStateV1,
  data: GearPlannerData,
  essenceData?: EssenceCraftingData
): RestoredGearPlannerState => {
  const catalog = restoreCatalog(data, essenceData)
  const issues: GearPlannerRestoreIssue[] = []
  const setups = persisted.setups.map((original) => {
    const report: ReportIssue = (kind, message) => {
      issues.push({ kind, message: `${original.name}: ${message}` })
    }
    const savedSetup = migrateEquipmentReferences(original, catalog, report)
    const equipment = restoreEquipment(savedSetup, catalog, report)
    restoreGearCrafts(equipment, savedSetup, catalog, report)
    const character = savedSetup.character ?? defaultCharacter()
    const focusStats = character.focusStats?.map((name) => data.enchantmentAliases?.get(name.toLowerCase()) ?? name)
    let setup: GearPlannerSetup = {
      ...createGearPlannerSetup(savedSetup.id, savedSetup.name),
      character: focusStats ? { ...character, focusStats: [...new Set(focusStats)] } : character,
      minimumLevel: savedSetup.minimumLevel,
      maximumLevel: savedSetup.maximumLevel,
      equipment
    }
    for (const saved of savedSetup.selectedReforging ?? []) setup = restoreReforging(setup, saved, catalog, report)
    for (const saved of savedSetup.selectedAugments) setup = restoreAugment(setup, saved, catalog, report)
    for (const saved of savedSetup.selectedCurses ?? []) setup = restoreCurse(setup, saved, catalog, report)
    for (const saved of savedSetup.selectedEssenceCrafting ?? []) setup = restoreEssence(setup, saved, catalog, report)
    for (const saved of savedSetup.unlockedFiligreeSlots ?? [])
      setup = restoreFiligreeSlots(setup, saved, catalog, report)
    for (const saved of savedSetup.selectedFiligrees ?? []) setup = restoreFiligree(setup, saved, catalog, report)
    return setup
  })
  return { state: { setups, activeSetupId: persisted.activeSetupId }, issues }
}

const browserStorage = (): GearPlannerStorage | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function combineBrowserSetups(
  current: PersistedGearPlannerStateV1 | undefined,
  loaded: LoadedGearPlannerState,
  legacy: PersistedGearPlannerStateV1
) {
  if (!current) return { payload: legacy, added: legacy.setups.length }
  const comparable = loaded.issues.length ? current : serializeGearPlannerState(loaded.state)
  const blank = JSON.stringify(serializeGearPlannerState(createDefaultGearPlannerState()).setups[0])
  if (comparable.setups.length === 1 && JSON.stringify(comparable.setups[0]) === blank) {
    return { payload: legacy, added: legacy.setups.length }
  }

  const existing = new Map(comparable.setups.map((s) => [s.id, JSON.stringify(s)]))
  const ids = new Set([...existing.keys(), ...legacy.setups.map((s) => s.id)])
  const additions = legacy.setups.flatMap((setup) => {
    const content = JSON.stringify(setup)
    if (content === blank || existing.get(setup.id) === content) return []
    if (!existing.has(setup.id)) return [setup]
    let id = 'legacy-' + setup.id
    while (ids.has(id)) id = 'legacy-' + id
    ids.add(id)
    return [{ ...setup, id, name: setup.name + ' (legacy)' }]
  })
  // Keep the original v2 references even if the current catalog cannot resolve them.
  return { payload: { ...current, setups: [...current.setups, ...additions] }, added: additions.length }
}

function carryoverStatus(
  saved: boolean,
  added: number,
  issues: readonly GearPlannerRestoreIssue[]
): LoadedGearPlannerState['carryover'] {
  if (!saved)
    return { kind: 'error', message: 'Legacy setups opened for this session. The browser could not save the v2 copy.' }
  if (added)
    return {
      kind: 'success',
      message: `Carried over ${String(added)} legacy Gear Planner ${added === 1 ? 'setup' : 'setups'}.`
    }
  if (issues.length)
    return { kind: 'success', message: 'Legacy setups were already present. Review the import details.' }
  return undefined
}

function loadLegacyBrowserSave(
  storage: GearPlannerStorage,
  current: PersistedGearPlannerStateV1 | undefined,
  loaded: LoadedGearPlannerState,
  data: GearPlannerData,
  essenceData?: EssenceCraftingData
): LoadedGearPlannerState {
  try {
    const raw = storage.getItem('gearPlannerState')
    if (raw === null) return loaded
    const legacy = importGearPlannerState(raw, data, essenceData)
    const { payload, added } = combineBrowserSetups(current, loaded, serializeGearPlannerState(legacy.state))
    const restored = current ? restorePersistedGearPlannerState(payload, data, essenceData) : legacy
    const issues = current ? [...legacy.issues, ...restored.issues] : legacy.issues
    const saved = writeBrowserSave(storage, payload, true)
    const carryover = carryoverStatus(saved, added, issues)
    return { source: 'legacy', state: restored.state, issues, carryover, legacySaveImported: true }
  } catch (error) {
    return {
      ...loaded,
      source: 'invalid',
      carryover: { kind: 'error', message: 'The legacy Gear Planner save could not be imported.' },
      issues: [
        ...loaded.issues,
        { kind: 'invalid-state', message: error instanceof Error ? error.message : 'Invalid legacy save.' }
      ]
    }
  }
}

export const loadGearPlannerState = (
  data: GearPlannerData,
  essenceDataOrStorage?: EssenceCraftingData | GearPlannerStorage,
  suppliedStorage?: GearPlannerStorage
): LoadedGearPlannerState => {
  const essenceData =
    essenceDataOrStorage && 'rules' in essenceDataOrStorage && 'indexes' in essenceDataOrStorage
      ? essenceDataOrStorage
      : undefined
  const storage =
    essenceData === undefined
      ? ((essenceDataOrStorage as GearPlannerStorage | undefined) ?? browserStorage())
      : (suppliedStorage ?? browserStorage())
  const empty: LoadedGearPlannerState = { source: 'empty', state: createDefaultGearPlannerState(), issues: [] }
  if (!storage) return empty
  let current: PersistedGearPlannerStateV1 | undefined
  let loaded = empty
  try {
    const raw = storage.getItem(GEAR_PLANNER_STORAGE_KEY) ?? storage.getItem(preCatalogStorageKey)
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw)
      current = parsePersistedGearPlannerState(parsed, data)
      loaded = { source: 'v2', ...restorePersistedGearPlannerState(current, data, essenceData) }
      if (isRecord(parsed) && parsed.legacySaveImported === true) return { ...loaded, legacySaveImported: true }
    }
  } catch (error) {
    return {
      ...empty,
      source: 'invalid',
      issues: [
        {
          kind: 'invalid-state',
          message: error instanceof Error ? error.message : 'Unable to read saved Gear Planner state'
        }
      ]
    }
  }
  return loadLegacyBrowserSave(storage, current, loaded, data, essenceData)
}

function writeBrowserSave(
  storage: GearPlannerStorage,
  payload: PersistedGearPlannerStateV1,
  legacySaveImported: boolean
) {
  try {
    storage.setItem(
      GEAR_PLANNER_STORAGE_KEY,
      JSON.stringify({ ...payload, ...(legacySaveImported && { legacySaveImported: true }) })
    )
    return true
  } catch {
    return false
  }
}

export const saveGearPlannerState = (
  state: GearPlannerSetupsState,
  storage: GearPlannerStorage | undefined = browserStorage(),
  legacySaveImported?: boolean
): boolean => {
  if (!storage) return false
  if (legacySaveImported === undefined) {
    try {
      const previous: unknown = JSON.parse(
        storage.getItem(GEAR_PLANNER_STORAGE_KEY) ?? storage.getItem(preCatalogStorageKey) ?? 'null'
      )
      legacySaveImported = isRecord(previous) && previous.legacySaveImported === true
    } catch {
      legacySaveImported = false
    }
  }
  return writeBrowserSave(storage, serializeGearPlannerState(state), legacySaveImported)
}

export const createGearPlannerExport = (state: GearPlannerSetupsState): PersistedGearPlannerStateV1 => ({
  ...serializeGearPlannerState(state),
  exportedAt: new Date().toISOString()
})

export const importGearPlannerState = (
  text: string,
  data: GearPlannerData,
  essenceData?: EssenceCraftingData
): RestoredGearPlannerState => {
  const payload: unknown = JSON.parse(text)
  const legacy = convertLegacyGearSave(payload, data, essenceData)
  const restored = restorePersistedGearPlannerState(
    parsePersistedGearPlannerState(legacy?.payload ?? payload, data),
    data,
    essenceData
  )
  return legacy ? { state: restored.state, issues: [...legacy.issues, ...restored.issues] } : restored
}
