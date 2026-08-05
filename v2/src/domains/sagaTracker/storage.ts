import { createStore, get, set } from 'idb-keyval'
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
export const ACTIVE_TAB_KEY = 'yourddo:saga-tracker:activeTab:v1'

export interface StoredSagaItem extends SagaStatus {
  id: string
}

interface StorageDriver {
  getValue: (key: string) => Promise<unknown>
  setValue: (key: string, value: unknown) => Promise<void>
}

const store = createStore('yourddo-db', 'saga-tracker')
const defaultDriver: StorageDriver = {
  getValue: (key) => get(key, store),
  setValue: (key, value) => set(key, value, store)
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
    items.push({ id: item.id, completed: item.completed, turnedIn: item.turnedIn })
  }
  return items
}

const parseTimestampMap = (value: unknown, legacyField?: string): TimestampMap | undefined => {
  if (Array.isArray(value) && legacyField) {
    const result: TimestampMap = {}
    for (const entry of value) {
      if (typeof entry !== 'object' || entry === null) continue
      const item = entry as Record<string, unknown>
      const timestamp = item[legacyField]
      if (
        typeof item.id === 'string' &&
        typeof timestamp === 'number' &&
        Number.isFinite(timestamp) &&
        timestamp >= 0
      ) {
        result[item.id] = timestamp
      }
    }
    return result
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const result: TimestampMap = {}
  for (const [id, timestamp] of Object.entries(value)) {
    if (typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp >= 0) result[id] = timestamp
  }
  return result
}

const buildProgress = (
  sagas: readonly SagaDefinition[],
  quests: readonly QuestDefinition[],
  items: StoredSagaItem[] | undefined,
  questDoneAt: TimestampMap | undefined,
  turnedInAt: TimestampMap | undefined
): SagaTrackerProgress => {
  const statusById = new Map(items?.map(({ id, completed, turnedIn }) => [id, { completed, turnedIn }]))
  const sagaStatus: SagaStatusMap = Object.fromEntries(
    sagas.map(({ id }) => [id, statusById.get(id) ?? { completed: false, turnedIn: false }])
  )
  const questIds = new Set(quests.map(({ id }) => id))
  const sagaIds = new Set(sagas.map(({ id }) => id))
  return {
    sagaStatus,
    questDoneAt: Object.fromEntries(Object.entries(questDoneAt ?? {}).filter(([id]) => questIds.has(id))),
    turnedInAt: Object.fromEntries(Object.entries(turnedInAt ?? {}).filter(([id]) => sagaIds.has(id)))
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
  await requestPersistentStorage()
  let idbValues: unknown[]
  let storageAvailable = true
  try {
    idbValues = await Promise.all([
      driver.getValue(SAGA_ITEMS_KEY),
      driver.getValue(QUEST_DONE_AT_KEY),
      driver.getValue(TURNED_IN_AT_KEY)
    ])
  } catch {
    storageAvailable = false
    idbValues = [undefined, undefined, undefined]
  }

  let items = parseItems(idbValues[0])
  let questDoneAt = parseTimestampMap(idbValues[1])
  let turnedInAt = parseTimestampMap(idbValues[2])
  const migrations: Promise<void>[] = []

  if (items === undefined) {
    items = parseItems(safeLocalRead(LOCAL_ITEMS_KEY))
    if (items) migrations.push(driver.setValue(SAGA_ITEMS_KEY, items))
  }
  if (questDoneAt === undefined) {
    questDoneAt = parseTimestampMap(safeLocalRead(LOCAL_QUESTS_KEY), 'lastDoneAt')
    if (questDoneAt) migrations.push(driver.setValue(QUEST_DONE_AT_KEY, questDoneAt))
  }
  if (turnedInAt === undefined) {
    turnedInAt = parseTimestampMap(safeLocalRead(LOCAL_TURNED_IN_KEY), 'turnedInAt')
    if (turnedInAt) migrations.push(driver.setValue(TURNED_IN_AT_KEY, turnedInAt))
  }
  if (migrations.length > 0) {
    const results = await Promise.allSettled(migrations)
    if (results.some(({ status }) => status === 'rejected')) storageAvailable = false
  }
  return { progress: buildProgress(sagas, quests, items, questDoneAt, turnedInAt), storageAvailable }
}

export const progressItems = (sagas: readonly SagaDefinition[], sagaStatus: Readonly<SagaStatusMap>) =>
  sagas.map(({ id }) => ({ id, ...(sagaStatus[id] ?? { completed: false, turnedIn: false }) }))

export const saveProgress = async (
  sagas: readonly SagaDefinition[],
  progress: SagaTrackerProgress,
  driver: StorageDriver = defaultDriver
): Promise<boolean> => {
  const items = progressItems(sagas, progress.sagaStatus)
  const localOk = [
    safeLocalWrite(LOCAL_ITEMS_KEY, items),
    safeLocalWrite(
      LOCAL_QUESTS_KEY,
      Object.entries(progress.questDoneAt).map(([id, lastDoneAt]) => ({ id, lastDoneAt }))
    ),
    safeLocalWrite(
      LOCAL_TURNED_IN_KEY,
      Object.entries(progress.turnedInAt).map(([id, turnedInAt]) => ({ id, turnedInAt }))
    )
  ].every(Boolean)
  const results = await Promise.allSettled([
    driver.setValue(SAGA_ITEMS_KEY, items),
    driver.setValue(QUEST_DONE_AT_KEY, progress.questDoneAt),
    driver.setValue(TURNED_IN_AT_KEY, progress.turnedInAt)
  ])
  return localOk && results.every(({ status }) => status === 'fulfilled')
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
