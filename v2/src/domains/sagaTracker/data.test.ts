import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDataset, loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  InvalidSagaTrackerDataError,
  loadSagaTrackerData,
  parseQuests,
  parseSagas,
  QUEST_LIST_PAYLOAD,
  SAGA_LIST_PAYLOAD
} from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDataset: vi.fn(), loadManualPayload: vi.fn() }))

const saga = { id: 'heroic-saga', name: 'Heroic Saga', levelRange: '3-5', npc: 'The Contact' }
const quest = { id: 'quest-1', name: 'A Quest', sagas: ['heroic-saga'] }

beforeEach(() => {
  vi.mocked(loadDataset).mockReset()
  vi.mocked(loadManualPayload).mockReset()
})

describe('Saga Tracker data', () => {
  it('loads both exact manual payload contracts together without using a generated dataset', async () => {
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === SAGA_LIST_PAYLOAD ? [saga] : [quest])
    )
    await expect(loadSagaTrackerData()).resolves.toEqual({ sagas: [saga], quests: [quest] })
    expect(loadManualPayload).toHaveBeenCalledWith(SAGA_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledWith(QUEST_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledTimes(2)
    expect(loadDataset).not.toHaveBeenCalled()
  })

  it('rejects invalid saga and quest payloads', () => {
    expect(() => parseSagas({})).toThrow(InvalidSagaTrackerDataError)
    expect(() => parseSagas([{ ...saga, name: '' }])).toThrow('name')
    expect(() => parseSagas([{ ...saga, levelRange: 3 }])).toThrow('level range')
    expect(() => parseSagas([{ ...saga, npc: null }])).toThrow('NPC')
    expect(() => parseQuests({}, new Set([saga.id]))).toThrow(InvalidSagaTrackerDataError)
    expect(() => parseQuests([{ ...quest, sagas: 'heroic-saga' }], new Set([saga.id]))).toThrow('array')
  })

  it('rejects duplicate IDs, duplicate references, and missing saga references', () => {
    expect(() => parseSagas([saga, saga])).toThrow('duplicate saga ID')
    expect(() => parseQuests([quest, quest], new Set([saga.id]))).toThrow('duplicate quest ID')
    expect(() => parseQuests([{ ...quest, sagas: [saga.id, saga.id] }], new Set([saga.id]))).toThrow(
      'duplicate saga references'
    )
    expect(() => parseQuests([{ ...quest, sagas: ['missing'] }], new Set([saga.id]))).toThrow('unknown saga')
  })
})
