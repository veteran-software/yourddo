import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hasDatasetFile, loadDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  InvalidSagaTrackerDataError,
  loadSagaTrackerData,
  parseQuests,
  parseSagas,
  QUEST_LIST_PAYLOAD,
  SAGA_LIST_PAYLOAD
} from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({
  hasDatasetFile: vi.fn(),
  loadDatasetFile: vi.fn(),
  loadManualPayload: vi.fn()
}))

const saga = { id: 'heroic-saga', name: 'Heroic Saga', npcs: ['The Contact'] }
const quest = { id: 'quest-1', name: 'A Quest', level: 3, sagas: ['heroic-saga'] }

beforeEach(() => {
  vi.mocked(hasDatasetFile).mockResolvedValue(false)
  vi.mocked(loadDatasetFile).mockReset()
  vi.mocked(loadManualPayload).mockReset()
})

describe('Saga Tracker data', () => {
  it('falls back to the manual payloads when the saga domain is absent', async () => {
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === SAGA_LIST_PAYLOAD ? [saga] : [quest])
    )
    await expect(loadSagaTrackerData()).resolves.toEqual({ sagas: [{ ...saga, levelRange: '3' }], quests: [quest] })
    expect(loadManualPayload).toHaveBeenCalledWith(SAGA_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledWith(QUEST_LIST_PAYLOAD)
    expect(loadManualPayload).toHaveBeenCalledTimes(2)
    expect(loadDatasetFile).not.toHaveBeenCalled()
  })

  it('uses the saga domain, with separate quest variants and tier-specific chains', async () => {
    vi.mocked(hasDatasetFile).mockResolvedValue(true)
    const resources = new Map<string, unknown>([
      [
        'sagas/manifest.json',
        { system: 'sagas', resources: { sagas: 'sagas.json', quests: 'quests.json', chains: 'chains.json' } }
      ],
      [
        'sagas/sagas.json',
        [
          { id: 1, name: 'Perils', tier: 'heroic', givers: [{ name: 'Heroic Contact' }], questIds: [2] },
          { id: 3, name: 'Perils', tier: 'epic', givers: [{ name: 'Epic Contact' }], questIds: [2] },
          { id: 4, name: 'Other Saga', tier: 'epic', givers: [{ name: 'Other Contact' }], questIds: [2] }
        ]
      ],
      [
        'sagas/quests.json',
        [{ id: 2, name: 'Outpost', epicName: 'Return to the Outpost', heroicLevel: 10, epicLevel: 24 }]
      ],
      [
        'sagas/chains.json',
        [
          { name: 'Heroic Chain', members: [{ questId: 2, tier: 'heroic' }] },
          { name: 'Epic Chain', members: [{ questId: 2, tier: 'epic' }] }
        ]
      ]
    ])
    vi.mocked(loadDatasetFile).mockImplementation((path) => Promise.resolve(resources.get(path)))

    const data = await loadSagaTrackerData()

    expect(data.sagas.map(({ id, tier, levelRange }) => ({ id, tier, levelRange }))).toEqual([
      { id: '1', tier: 'heroic', levelRange: '10' },
      { id: '3', tier: 'epic', levelRange: '24' },
      { id: '4', tier: 'epic', levelRange: '24' }
    ])
    expect(data.quests).toEqual([
      { id: '2-heroic', name: 'Outpost (H)', level: 10, chain: 'Heroic Chain', sagas: ['1'] },
      { id: '2-epic', name: 'Return to the Outpost (E)', level: 24, chain: 'Epic Chain', sagas: ['3', '4'] }
    ])
    expect(loadManualPayload).not.toHaveBeenCalled()
  })

  it('normalizes IDs even when the release still uses the legacy saga files', async () => {
    const sagaId = 'the-planeswalkers-path-epic'
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(
        name === SAGA_LIST_PAYLOAD
          ? [{ ...saga, id: sagaId }]
          : [{ ...quest, id: '04e8506f-1746-4b34-ae2b-90da57b7b5a5', sagas: [sagaId] }]
      )
    )
    const data = await loadSagaTrackerData()
    expect(data.sagas[0].id).toBe('1879197212')
    expect(data.quests[0]).toMatchObject({ id: '1879147898-epic', sagas: ['1879197212'] })
  })

  it('surfaces a broken native package instead of silently reading the manual data', async () => {
    vi.mocked(hasDatasetFile).mockResolvedValue(true)
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(new Error('Unavailable package'))
    await expect(loadSagaTrackerData()).rejects.toThrow('Unavailable package')
    expect(loadManualPayload).not.toHaveBeenCalled()
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
