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

const saga = { id: 'heroic-saga', name: 'Heroic Saga', npcs: ['The Contact'] }
const quest = { id: 'quest-1', name: 'A Quest', level: 3, sagas: ['heroic-saga'] }

beforeEach(() => {
  vi.mocked(loadDataset).mockReset()
  vi.mocked(loadManualPayload).mockReset()
})

describe('Saga Tracker data', () => {
  it('loads both exact manual payload contracts together without using a generated dataset', async () => {
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === SAGA_LIST_PAYLOAD ? [saga] : [quest])
    )
    await expect(loadSagaTrackerData()).resolves.toEqual({ sagas: [{ ...saga, levelRange: '3' }], quests: [quest] })
    expect(loadManualPayload).toHaveBeenCalledWith(SAGA_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledWith(QUEST_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledTimes(2)
    expect(loadDataset).not.toHaveBeenCalled()
  })

  it('rejects invalid saga and quest payloads', () => {
    expect(() => parseSagas({})).toThrow(InvalidSagaTrackerDataError)
    expect(() => parseSagas([{ ...saga, name: '' }])).toThrow('name')
    expect(() => parseSagas([{ ...saga, npcs: [] }])).toThrow('NPC')
    expect(() => parseSagas([{ ...saga, npcs: [null] }])).toThrow('NPC')
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

  it('requires positive integer quest levels and validates optional chain names', () => {
    for (const level of [undefined, null, '3', 0, -1, 1.5, Infinity]) {
      expect(() => parseQuests([{ ...quest, level }], new Set([saga.id]))).toThrow('positive integer')
    }
    expect(() => parseQuests([{ ...quest, chain: '' }], new Set([saga.id]))).toThrow('chain')
    expect(parseQuests([{ ...quest, chain: 'Part One' }], new Set([saga.id]))[0].chain).toBe('Part One')
  })

  it('derives ranges from all associated quests and retains multiple contacts', async () => {
    const metadata = { ...saga, npcs: ['First Contact', 'Second Contact'], levelRange: '99' }
    const shared = { ...quest, id: 'shared', level: 12, sagas: [saga.id, 'second'] }
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(
        name === SAGA_LIST_PAYLOAD ? [metadata, { ...saga, id: 'second' }] : [{ ...quest, level: 10 }, shared]
      )
    )
    const data = await loadSagaTrackerData()
    expect(data.sagas.map(({ levelRange }) => levelRange)).toEqual(['10-12', '12'])
    expect(data.sagas[0].npcs).toEqual(metadata.npcs)
  })

  it('accepts an empty dataset and rejects sagas with no quest-derived range', async () => {
    vi.mocked(loadManualPayload).mockResolvedValue([])
    await expect(loadSagaTrackerData()).resolves.toEqual({ sagas: [], quests: [] })
    vi.mocked(loadManualPayload).mockImplementation((name) => Promise.resolve(name === SAGA_LIST_PAYLOAD ? [saga] : []))
    await expect(loadSagaTrackerData()).rejects.toThrow('has no quests')
  })
})
