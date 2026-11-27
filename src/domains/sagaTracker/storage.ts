import { createStore, getMany, setMany } from 'idb-keyval'
import {
  canonicalQuestId,
  canonicalSagaId,
  withCompatibleQuestIds,
  withCompatibleSagaIds
} from './withCompatibleSagaIds.ts'
import type {
  QuestDefinition,
  SagaDefinition,
  SagaStatus,
  SagaStatusMap,
  SagaTrackerProgress,
  TimestampMap
} from './sagaTracker.types.ts'

export const SAGA_ITEMS_KEY = 'items'
export const QUEST_DONE_AT_KEY = 'questDoneAt'
export const TURNED_IN_AT_KEY = 'turnedInAt'
export const LOCAL_ITEMS_KEY = 'yourddo:saga-tracker:v2'
export const LOCAL_QUESTS_KEY = 'yourddo:saga-tracker:quests:v1'
export const LOCAL_TURNED_IN_KEY = 'yourddo:saga-tracker:turnedInAt:v1'
const PENDING_PROGRESS_KEY = 'yourddo:saga-tracker:pending-progress:v1'
export const ACTIVE_TAB_KEY = 'yourddo:saga-tracker:activeTab:v1'

export interface StoredSagaItem extends SagaStatus {
  id: string
}

interface StorageDriver {
  getValues: (keys: string[]) => Promise<unknown[]>
  setValues: (entries: [string, unknown][]) => Promise<void>
}

const store = createStore('yourddo-db', 'saga-tracker')
const defaultDriver: StorageDriver = {
  getValues: (keys) => getMany(keys, store),
  setValues: (entries) => setMany(entries, store)
}

const safeLocalRead = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : undefined
  } catch {
    return undefined
  }
}

const safeLocalWrite = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const parseItems = (value: unknown): StoredSagaItem[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const items: StoredSagaItem[] = []
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue
    const item = entry as Record<string, unknown>
    if (typeof item.id !== 'string' || typeof item.completed !== 'boolean' || typeof item.turnedIn !== 'boolean') {
      continue
    }
    items.push({
      id: item.id,
      completed: item.completed,
      turnedIn: item.turnedIn,
      ...(typeof item.runStartedAt === 'number' &&
        Number.isFinite(item.runStartedAt) &&
        item.runStartedAt >= 0 && { runStartedAt: item.runStartedAt })
    })
  }
  return items
}

function parseLegacyTimestamps(values: unknown[], legacyField: string): TimestampMap {
  const result: TimestampMap = {}
  for (const entry of values) {
    if (typeof entry !== 'object' || entry === null) continue
    const item = entry as Record<string, unknown>
    const timestamp = item[legacyField]
    if (typeof item.id === 'string' && typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp >= 0) {
      result[item.id] = timestamp
    }
  }
  return result
}

const parseTimestampMap = (value: unknown, legacyField?: string): TimestampMap | undefined => {
  if (Array.isArray(value) && legacyField) return parseLegacyTimestamps(value, legacyField)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const result: TimestampMap = {}
  for (const [id, timestamp] of Object.entries(value)) {
    if (typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp >= 0) result[id] = timestamp
  }
  return result
}

export const buildProgress = (
  sagas: readonly SagaDefinition[],
  quests: readonly QuestDefinition[],
  items: StoredSagaItem[] | undefined,
  questDoneAt: TimestampMap | undefined,
  turnedInAt: TimestampMap | undefined
): SagaTrackerProgress => {
  const statusById = withCompatibleSagaIds(Object.fromEntries((items ?? []).map(({ id, ...status }) => [id, status])))
  const sagaStatus: SagaStatusMap = Object.fromEntries(
    sagas.map(({ id }) => [id, statusById[id] ?? { completed: false, turnedIn: false }])
  )
  const questIds = new Set(quests.map(({ id }) => id))
  const sagaIds = new Set(sagas.map(({ id }) => id))
  return {
    sagaStatus,
    questDoneAt: Object.fromEntries(
      Object.entries(withCompatibleQuestIds(questDoneAt ?? {})).filter(([id]) => questIds.has(id))
    ),
    turnedInAt: Object.fromEntries(
      Object.entries(withCompatibleSagaIds(turnedInAt ?? {})).filter(([id]) => sagaIds.has(id))
    )
  }
}

export interface LoadProgressResult {
  progress: SagaTrackerProgress
  storageAvailable: boolean
}

export const requestPersistentStorage = async (): Promise<void> => {
  try {
    await navigator.storage.persist()
  } catch {
    // Persistence is an optional browser optimization.
  }
}

export const loadProgress = async (
  sagas: readonly SagaDefinition[],
  quests: readonly QuestDefinition[],
  driver: StorageDriver = defaultDriver
): Promise<LoadProgressResult> => {
  const pending = safeLocalRead(PENDING_PROGRESS_KEY)
  if (
    pending &&
    typeof pending === 'object' &&
    'items' in pending &&
    'questDoneAt' in pending &&
    'turnedInAt' in pending
  ) {
    const items = parseItems(pending.items)
    const questDoneAt = parseTimestampMap(pending.questDoneAt)
    const turnedInAt = parseTimestampMap(pending.turnedInAt)
    if (items && questDoneAt && turnedInAt) {
      return { progress: buildProgress(sagas, quests, items, questDoneAt, turnedInAt), storageAvailable: true }
    }
  }

  await requestPersistentStorage()
  let idbValues: unknown[]
  let storageAvailable = true
  try {
    idbValues = await driver.getValues([SAGA_ITEMS_KEY, QUEST_DONE_AT_KEY, TURNED_IN_AT_KEY])
  } catch {
    storageAvailable = false
    idbValues = [undefined, undefined, undefined]
  }

  const storedItems = parseItems(idbValues[0])
  const storedQuests = parseTimestampMap(idbValues[1])
  const storedCutoffs = parseTimestampMap(idbValues[2])
  const items = storedItems ?? parseItems(safeLocalRead(LOCAL_ITEMS_KEY))
  const questDoneAt = storedQuests ?? parseTimestampMap(safeLocalRead(LOCAL_QUESTS_KEY), 'lastDoneAt')
  const turnedInAt = storedCutoffs ?? parseTimestampMap(safeLocalRead(LOCAL_TURNED_IN_KEY), 'turnedInAt')
  const progress = buildProgress(sagas, quests, items, questDoneAt, turnedInAt)
  const restoredLocal = items !== storedItems || questDoneAt !== storedQuests || turnedInAt !== storedCutoffs
  const hasLegacySagaItems = items?.some(({ id }) => canonicalSagaId(id) !== id) ?? false
  const hasLegacyIds =
    hasLegacySagaItems ||
    Object.keys(questDoneAt ?? {}).some((id) => canonicalQuestId(id) !== id) ||
    Object.keys(turnedInAt ?? {}).some((id) => canonicalSagaId(id) !== id)
  if (restoredLocal || hasLegacyIds) {
    const saved = await saveProgress(sagas, progress, driver)
    storageAvailable = storageAvailable && saved
  }
  return { progress, storageAvailable }
}

export const progressItems = (sagas: readonly SagaDefinition[], sagaStatus: Readonly<SagaStatusMap>) =>
  sagas.map(({ id }) => ({ id, ...(sagaStatus[id] ?? { completed: false, turnedIn: false }) }))

export const saveProgress = async (
  sagas: readonly SagaDefinition[],
  progress: SagaTrackerProgress,
  driver: StorageDriver = defaultDriver
): Promise<boolean> => {
  const items = progressItems(sagas, progress.sagaStatus)
  // Keep a synchronous snapshot until the matching IndexedDB transaction has committed.
  const previousPending = safeLocalRead(PENDING_PROGRESS_KEY)
  const pending = { items, questDoneAt: progress.questDoneAt, turnedInAt: progress.turnedInAt }
  const pendingSaved = safeLocalWrite(PENDING_PROGRESS_KEY, pending)
  safeLocalWrite(LOCAL_ITEMS_KEY, items)
  safeLocalWrite(
    LOCAL_QUESTS_KEY,
    Object.entries(progress.questDoneAt).map(([id, lastDoneAt]) => ({ id, lastDoneAt }))
  )
  safeLocalWrite(
    LOCAL_TURNED_IN_KEY,
    Object.entries(progress.turnedInAt).map(([id, turnedInAt]) => ({ id, turnedInAt }))
  )
  try {
    await driver.setValues([
      [SAGA_ITEMS_KEY, items],
      [QUEST_DONE_AT_KEY, progress.questDoneAt],
      [TURNED_IN_AT_KEY, progress.turnedInAt]
    ])
  } catch {
    return pendingSaved
  }
  try {
    const written = pendingSaved ? pending : previousPending
    if (localStorage.getItem(PENDING_PROGRESS_KEY) === JSON.stringify(written)) {
      localStorage.removeItem(PENDING_PROGRESS_KEY)
    }
  } catch {
    // IndexedDB has committed even if localStorage cannot be accessed to clear the snapshot.
  }
  return true
}

export const readActiveTab = (): 'heroic' | 'epic' | 'legendary' => {
  try {
    const value = localStorage.getItem(ACTIVE_TAB_KEY)
    return value === 'epic' || value === 'legendary' ? value : 'heroic'
  } catch {
    return 'heroic'
  }
}

export const writeActiveTab = (value: string): void => {
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, value)
  } catch {
    // The selected tab remains available in memory.
  }
}
