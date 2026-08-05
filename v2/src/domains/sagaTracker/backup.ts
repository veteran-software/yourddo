import type {
  QuestDefinition,
  SagaDefinition,
  SagaStatusMap,
  SagaTrackerProgress,
  TimestampMap
} from './sagaTracker.types.ts'
import { progressItems } from './storage.ts'

export const BACKUP_FILENAME = 'yourddo-saga-backup.json'

export interface SagaTrackerBackup {
  version: 2
  items: { id: string; completed: boolean; turnedIn: boolean }[]
  questDoneAt: TimestampMap
  turnedInAt: TimestampMap
}

export class InvalidSagaTrackerBackupError extends Error {
  constructor(message: string) {
    super(`Invalid Saga Tracker backup: ${message}`)
    this.name = 'InvalidSagaTrackerBackupError'
  }
}

export const createBackup = (sagas: readonly SagaDefinition[], progress: SagaTrackerProgress): SagaTrackerBackup => ({
  version: 2,
  items: progressItems(sagas, progress.sagaStatus),
  questDoneAt: { ...progress.questDoneAt },
  turnedInAt: { ...progress.turnedInAt }
})

const parseTimestamps = (value: unknown, label: string, validIds: ReadonlySet<string>): TimestampMap => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidSagaTrackerBackupError(`${label} must be an object`)
  }
  const timestamps: TimestampMap = {}
  for (const [id, timestamp] of Object.entries(value)) {
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp < 0) {
      throw new InvalidSagaTrackerBackupError(`${label}.${id} must be a finite non-negative number`)
    }
    if (validIds.has(id)) timestamps[id] = timestamp
  }
  return timestamps
}

export const parseBackup = (
  value: unknown,
  sagas: readonly SagaDefinition[],
  quests: readonly QuestDefinition[]
): SagaTrackerProgress => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidSagaTrackerBackupError('payload must be an object')
  }
  const backup = value as Record<string, unknown>
  if (backup.version !== 2) throw new InvalidSagaTrackerBackupError('version must be exactly 2')
  if (!Array.isArray(backup.items)) throw new InvalidSagaTrackerBackupError('items must be an array')
  const sagaIds = new Set(sagas.map(({ id }) => id))
  const questIds = new Set(quests.map(({ id }) => id))
  const imported = new Map<string, { completed: boolean; turnedIn: boolean }>()

  for (const entry of backup.items) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new InvalidSagaTrackerBackupError('every item must be an object')
    }
    const item = entry as Record<string, unknown>
    if (typeof item.id !== 'string') throw new InvalidSagaTrackerBackupError('item IDs must be strings')
    if (typeof item.completed !== 'boolean' || typeof item.turnedIn !== 'boolean') {
      throw new InvalidSagaTrackerBackupError(`item ${item.id} status values must be booleans`)
    }
    if (sagaIds.has(item.id)) imported.set(item.id, { completed: item.completed, turnedIn: item.turnedIn })
  }

  const sagaStatus: SagaStatusMap = Object.fromEntries(
    sagas.map(({ id }) => [id, imported.get(id) ?? { completed: false, turnedIn: false }])
  )
  return {
    sagaStatus,
    questDoneAt: parseTimestamps(backup.questDoneAt, 'questDoneAt', questIds),
    turnedInAt: parseTimestamps(backup.turnedInAt, 'turnedInAt', sagaIds)
  }
}

export const downloadBackup = (backup: SagaTrackerBackup): void => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = BACKUP_FILENAME
  link.click()
  URL.revokeObjectURL(url)
}
