import { loadManualPayload } from '../../shared/data/loadDataset.ts'
import type { QuestDefinition, SagaDefinition, SagaTrackerData } from './sagaTracker.types.ts'

export const SAGA_LIST_PAYLOAD = 'saga.sagaList'
export const QUEST_LIST_PAYLOAD = 'saga.questList'

export class InvalidSagaTrackerDataError extends Error {
  constructor(message: string) {
    super(`Invalid Saga Tracker data: ${message}`)
    this.name = 'InvalidSagaTrackerDataError'
  }
}

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidSagaTrackerDataError(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

const nonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InvalidSagaTrackerDataError(`${label} must be a non-empty string`)
  }
  return value
}

export const parseSagas = (value: unknown): SagaDefinition[] => {
  if (!Array.isArray(value)) throw new InvalidSagaTrackerDataError('saga payload must be an array')
  const ids = new Set<string>()

  return value.map((entry, index) => {
    const item = record(entry, `saga ${index.toString()}`)
    const id = nonEmptyString(item.id, `saga ${index.toString()} ID`)
    if (ids.has(id)) throw new InvalidSagaTrackerDataError(`duplicate saga ID: ${id}`)
    ids.add(id)
    return {
      id,
      name: nonEmptyString(item.name, `saga ${id} name`),
      levelRange: nonEmptyString(item.levelRange, `saga ${id} level range`),
      npc: nonEmptyString(item.npc, `saga ${id} NPC`)
    }
  })
}

export const parseQuests = (value: unknown, sagaIds: ReadonlySet<string>): QuestDefinition[] => {
  if (!Array.isArray(value)) throw new InvalidSagaTrackerDataError('quest payload must be an array')
  const ids = new Set<string>()

  return value.map((entry, index) => {
    const item = record(entry, `quest ${index.toString()}`)
    const id = nonEmptyString(item.id, `quest ${index.toString()} ID`)
    if (ids.has(id)) throw new InvalidSagaTrackerDataError(`duplicate quest ID: ${id}`)
    ids.add(id)
    if (!Array.isArray(item.sagas) || !item.sagas.every((sagaId) => typeof sagaId === 'string')) {
      throw new InvalidSagaTrackerDataError(`quest ${id} sagas must be an array of strings`)
    }
    const sagas = item.sagas
    const uniqueReferences = new Set(sagas)
    if (uniqueReferences.size !== sagas.length) {
      throw new InvalidSagaTrackerDataError(`quest ${id} contains duplicate saga references`)
    }
    for (const sagaId of sagas) {
      if (!sagaIds.has(sagaId)) {
        throw new InvalidSagaTrackerDataError(`quest ${id} references unknown saga: ${sagaId}`)
      }
    }
    return { id, name: nonEmptyString(item.name, `quest ${id} name`), sagas: [...sagas] }
  })
}

export const loadSagaTrackerData = async (): Promise<SagaTrackerData> => {
  const [sagaPayload, questPayload] = await Promise.all([
    loadManualPayload<unknown>(SAGA_LIST_PAYLOAD),
    loadManualPayload<unknown>(QUEST_LIST_PAYLOAD)
  ])
  const sagas = parseSagas(sagaPayload)
  const quests = parseQuests(questPayload, new Set(sagas.map(({ id }) => id)))
  return { sagas, quests }
}
