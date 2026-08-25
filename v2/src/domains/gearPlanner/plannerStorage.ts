import {
  collectSelectedGearPlannerAugments,
  gearPlannerAugmentIdentity,
  isCompatibleGearPlannerAugment
} from './augments.ts'
import { canApplyGearPlannerCurse, collectSelectedGearPlannerCurses, gearPlannerCurseIdentity } from './curses.ts'
import { collectSelectedGearPlannerFiligrees, getGearPlannerMaxFiligreeSlots } from './filigrees.ts'
import { gearPlannerCharacterSlots, type GearPlannerData } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerEquipment,
  setGearPlannerSlottedAugment,
  setGearPlannerSlottedCurse,
  setGearPlannerSlottedFiligree,
  setGearPlannerUnlockedFiligreeSlots
} from './planner.ts'
import {
  createDefaultGearPlannerState,
  createGearPlannerSetup,
  gearPlannerMaximumLevel,
  gearPlannerMinimumLevel,
  type GearPlannerSetup,
  type GearPlannerSetupsState
} from './setups.ts'

export const GEAR_PLANNER_STORAGE_KEY = 'yourddo:gear-planner:v2'
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

export interface PersistedGearPlannerSetupV1 {
  id: string
  name: string
  minimumLevel: number
  maximumLevel: number
  equipment: Record<(typeof gearPlannerCharacterSlots)[number], string | null>
  selectedAugments: readonly PersistedGearPlannerAugmentV1[]
  selectedCurses?: readonly PersistedGearPlannerCurseV1[]
  selectedFiligrees?: readonly PersistedGearPlannerFiligreeV1[]
  unlockedFiligreeSlots?: readonly PersistedGearPlannerUnlockedFiligreeSlotsV1[]
}

export interface PersistedGearPlannerStateV1 {
  version: typeof GEAR_PLANNER_PERSISTED_VERSION
  activeSetupId: string
  setups: readonly PersistedGearPlannerSetupV1[]
  exportedAt?: string
}

export interface GearPlannerRestoreIssue {
  kind:
    | 'invalid-state'
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
  message: string
}

export interface RestoredGearPlannerState {
  state: GearPlannerSetupsState
  issues: readonly GearPlannerRestoreIssue[]
}

export type GearPlannerStorageSource = 'empty' | 'v2' | 'invalid'

export interface LoadedGearPlannerState extends RestoredGearPlannerState {
  source: GearPlannerStorageSource
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

const parseEquipment = (value: unknown, path: string): PersistedGearPlannerSetupV1['equipment'] => {
  const record = requiredRecord(value, path)
  const validSlots = new Set<string>(gearPlannerCharacterSlots)
  for (const key of Object.keys(record)) {
    if (!validSlots.has(key)) throw new InvalidGearPlannerStateError(`${path}.${key} is not a character equipment slot`)
  }
  const equipment = {} as PersistedGearPlannerSetupV1['equipment']
  for (const slot of gearPlannerCharacterSlots) {
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

const parseSetup = (value: unknown, index: number): PersistedGearPlannerSetupV1 => {
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
        })
  }
}

export const parsePersistedGearPlannerState = (value: unknown): PersistedGearPlannerStateV1 => {
  const record = requiredRecord(value, 'payload')
  if (record.version !== GEAR_PLANNER_PERSISTED_VERSION) {
    throw new InvalidGearPlannerStateError(`version must be ${String(GEAR_PLANNER_PERSISTED_VERSION)}`)
  }
  if (!Array.isArray(record.setups) || record.setups.length === 0) {
    throw new InvalidGearPlannerStateError('setups must be a non-empty array')
  }
  const setups = record.setups.map(parseSetup)
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
    equipment: Object.fromEntries(
      gearPlannerCharacterSlots.map((slot) => [slot, setup.equipment[slot]?.id ?? null])
    ) as PersistedGearPlannerSetupV1['equipment'],
    selectedAugments: collectSelectedGearPlannerAugments(setup.equipment, setup.slottedAugments)
      .map(({ item, slotIndex, augment }) => ({
        itemId: item.id,
        slotIndex,
        augmentId: gearPlannerAugmentIdentity(augment)
      }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId) || left.slotIndex - right.slotIndex),
    selectedCurses: collectSelectedGearPlannerCurses(setup.equipment, setup.slottedCurses)
      .map(({ item, curse }) => ({ itemId: item.id, curseId: gearPlannerCurseIdentity(curse) }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId)),
    selectedFiligrees: collectSelectedGearPlannerFiligrees(setup.equipment, setup.slottedFiligrees)
      .map(({ item, slotIndex, filigree }) => ({ itemId: item.id, slotIndex, filigreeId: filigree.id }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId) || left.slotIndex - right.slotIndex),
    unlockedFiligreeSlots: Object.values(setup.equipment)
      .filter((item): item is NonNullable<typeof item> => item !== null && getGearPlannerMaxFiligreeSlots(item) > 0)
      .map((item) => ({
        itemId: item.id,
        count: Math.max(0, Math.min(getGearPlannerMaxFiligreeSlots(item), setup.unlockedFiligreeSlots[item.id] ?? 0))
      }))
      .toSorted((left, right) => left.itemId.localeCompare(right.itemId))
  }))
})

const findEquippedItem = (setup: GearPlannerSetup, itemId: string) =>
  Object.values(setup.equipment).find((item) => item?.id === itemId) ?? null

export const restorePersistedGearPlannerState = (
  persisted: PersistedGearPlannerStateV1,
  data: GearPlannerData
): RestoredGearPlannerState => {
  const itemsById = new Map(data.items.map((item) => [item.id, item]))
  const augmentsById = new Map(data.augments.map((augment) => [gearPlannerAugmentIdentity(augment), augment]))
  const cursesById = new Map(data.curses.map((curse) => [gearPlannerCurseIdentity(curse), curse]))
  const filigreesById = new Map(data.filigrees.map((filigree) => [filigree.id, filigree]))
  const issues: GearPlannerRestoreIssue[] = []
  const setups = persisted.setups.map((savedSetup) => {
    const equipment = createEmptyGearPlannerEquipment()
    for (const slot of gearPlannerCharacterSlots) {
      const itemId = savedSetup.equipment[slot]
      if (itemId === null) continue
      const item = itemsById.get(itemId)
      if (!item || item.slot !== slot) {
        issues.push({ kind: 'missing-item', message: `${savedSetup.name}: ${slot} item is no longer available` })
        continue
      }
      equipment[slot] = item
    }
    let setup: GearPlannerSetup = {
      ...createGearPlannerSetup(savedSetup.id, savedSetup.name),
      minimumLevel: savedSetup.minimumLevel,
      maximumLevel: savedSetup.maximumLevel,
      equipment
    }
    for (const savedAugment of savedSetup.selectedAugments) {
      const item = findEquippedItem(setup, savedAugment.itemId)
      if (!item) {
        issues.push({ kind: 'orphaned-augment', message: `${savedSetup.name}: augment host item is not equipped` })
        continue
      }
      const augment = augmentsById.get(savedAugment.augmentId)
      if (!augment) {
        issues.push({ kind: 'missing-augment', message: `${savedSetup.name}: selected augment is no longer available` })
        continue
      }
      const augmentSlot = item.source.augments?.[savedAugment.slotIndex]
      if (!augmentSlot || !isCompatibleGearPlannerAugment(augmentSlot, augment)) {
        issues.push({
          kind: 'incompatible-augment',
          message: `${savedSetup.name}: selected augment is no longer compatible`
        })
        continue
      }
      const selection = setGearPlannerSlottedAugment(setup, item.id, savedAugment.slotIndex, augment)
      setup = selection === setup ? setup : { ...setup, ...selection }
    }
    for (const savedCurse of savedSetup.selectedCurses ?? []) {
      const item = findEquippedItem(setup, savedCurse.itemId)
      if (!item) {
        issues.push({ kind: 'orphaned-curse', message: `${savedSetup.name}: curse host item is not equipped` })
        continue
      }
      if (!canApplyGearPlannerCurse(item)) {
        issues.push({ kind: 'ineligible-curse', message: `${savedSetup.name}: curses cannot be applied to Quiver` })
        continue
      }
      if (!cursesById.has(savedCurse.curseId)) {
        issues.push({ kind: 'missing-curse', message: `${savedSetup.name}: selected curse is no longer available` })
        continue
      }
      const selection = setGearPlannerSlottedCurse(setup, item.id, savedCurse.curseId, data.curses)
      setup = selection === setup ? setup : { ...setup, ...selection }
    }
    for (const savedUnlockedSlots of savedSetup.unlockedFiligreeSlots ?? []) {
      const item = findEquippedItem(setup, savedUnlockedSlots.itemId)
      if (!item) {
        issues.push({ kind: 'orphaned-filigree', message: `${savedSetup.name}: filigree host item is not equipped` })
        continue
      }
      if (getGearPlannerMaxFiligreeSlots(item) === 0) continue
      const selection = setGearPlannerUnlockedFiligreeSlots(setup, item.id, savedUnlockedSlots.count)
      setup = selection === setup ? setup : { ...setup, ...selection }
    }
    for (const savedFiligree of savedSetup.selectedFiligrees ?? []) {
      const item = findEquippedItem(setup, savedFiligree.itemId)
      if (!item) {
        issues.push({ kind: 'orphaned-filigree', message: `${savedSetup.name}: filigree host item is not equipped` })
        continue
      }
      const filigree = filigreesById.get(savedFiligree.filigreeId)
      if (!filigree) {
        issues.push({
          kind: 'missing-filigree',
          message: `${savedSetup.name}: selected filigree is no longer available`
        })
        continue
      }
      if (savedFiligree.slotIndex >= getGearPlannerMaxFiligreeSlots(item)) {
        issues.push({
          kind: 'invalid-filigree-slot',
          message: `${savedSetup.name}: filigree slot is no longer available`
        })
        continue
      }
      const selection = setGearPlannerSlottedFiligree(setup, item.id, savedFiligree.slotIndex, filigree)
      if (selection === setup) {
        issues.push({ kind: 'invalid-filigree-slot', message: `${savedSetup.name}: filigree slot is not unlocked` })
        continue
      }
      setup = { ...setup, ...selection }
    }
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

export const loadGearPlannerState = (
  data: GearPlannerData,
  storage: GearPlannerStorage | undefined = browserStorage()
): LoadedGearPlannerState => {
  if (!storage) return { source: 'empty', state: createDefaultGearPlannerState(), issues: [] }
  try {
    const raw = storage.getItem(GEAR_PLANNER_STORAGE_KEY)
    if (raw === null) return { source: 'empty', state: createDefaultGearPlannerState(), issues: [] }
    return { source: 'v2', ...restorePersistedGearPlannerState(parsePersistedGearPlannerState(JSON.parse(raw)), data) }
  } catch (error) {
    return {
      source: 'invalid',
      state: createDefaultGearPlannerState(),
      issues: [
        {
          kind: 'invalid-state',
          message: error instanceof Error ? error.message : 'Unable to read saved Gear Planner state'
        }
      ]
    }
  }
}

export const saveGearPlannerState = (
  state: GearPlannerSetupsState,
  storage: GearPlannerStorage | undefined = browserStorage()
): boolean => {
  if (!storage) return false
  try {
    storage.setItem(GEAR_PLANNER_STORAGE_KEY, JSON.stringify(serializeGearPlannerState(state)))
    return true
  } catch {
    return false
  }
}

export const createGearPlannerExport = (state: GearPlannerSetupsState): PersistedGearPlannerStateV1 => ({
  ...serializeGearPlannerState(state),
  exportedAt: new Date().toISOString()
})

export const importGearPlannerState = (text: string, data: GearPlannerData): RestoredGearPlannerState =>
  restorePersistedGearPlannerState(parsePersistedGearPlannerState(JSON.parse(text)), data)
