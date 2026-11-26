import type { QuestDefinition, SagaDefinition, SagaTrackerProgress, TimestampMap } from './sagaTracker.types.ts'
import { buildProgress, progressItems } from './storage.ts'

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

const parseTimestamps = (value: unknown, label: string): TimestampMap => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidSagaTrackerBackupError(`${label} must be an object`)
  }
  const timestamps: TimestampMap = {}
  for (const [id, timestamp] of Object.entries(value)) {
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp < 0) {
      throw new InvalidSagaTrackerBackupError(`${label} must contain finite non-negative numbers`)
    }
    timestamps[id] = timestamp
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
  const items = backup.items.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new InvalidSagaTrackerBackupError('every item must be an object')
    }
    const item = entry as Record<string, unknown>
    if (typeof item.id !== 'string') throw new InvalidSagaTrackerBackupError('item IDs must be strings')
    if (typeof item.completed !== 'boolean' || typeof item.turnedIn !== 'boolean') {
      throw new InvalidSagaTrackerBackupError('saga completion and turn-in statuses must be booleans')
    }
    return { id: item.id, completed: item.completed, turnedIn: item.turnedIn }
  })

  return buildProgress(
    sagas,
    quests,
    items,
    parseTimestamps(backup.questDoneAt, 'questDoneAt'),
    parseTimestamps(backup.turnedInAt, 'turnedInAt')
  )
}

export const downloadBackup = (backup: SagaTrackerBackup): void => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = BACKUP_FILENAME
  link.click()
  URL.revokeObjectURL(url)
}
