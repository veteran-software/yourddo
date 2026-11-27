// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { QuestDefinition, SagaDefinition } from './sagaTracker.types.ts'
import {
  loadProgress,
  LOCAL_ITEMS_KEY,
  LOCAL_QUESTS_KEY,
  LOCAL_TURNED_IN_KEY,
  QUEST_DONE_AT_KEY,
  SAGA_ITEMS_KEY,
  saveProgress,
  TURNED_IN_AT_KEY
} from './storage.ts'

const sagas: SagaDefinition[] = [
  { id: 'known', name: 'Known', levelRange: '3', npcs: ['A'] },
  { id: 'new', name: 'New', levelRange: '31', npcs: ['B'] }
]
const quests: QuestDefinition[] = [{ id: 'known-quest', name: 'Quest', level: 3, sagas: ['known'] }]

const driver = (values: Record<string, unknown> = {}, fail = false) => ({
  getValues: vi.fn((keys: string[]) =>
    fail ? Promise.reject(new Error('IDB unavailable')) : Promise.resolve(keys.map((key) => values[key]))
  ),
  setValues: vi.fn<(entries: [string, unknown][]) => Promise<void>>(() =>
    fail ? Promise.reject(new Error('IDB unavailable')) : Promise.resolve()
  )
})

afterEach(() => {
  localStorage.clear()
})

describe('Saga Tracker storage', () => {
  it.each(['IndexedDB', 'localStorage'])(
    'preserves legacy Planeswalker progress from %s before pruning',
    async (source) => {
      const legacyId = 'the-planewalkers-path-epic'
      const currentId = '1879197212'
      const definitions = [{ ...sagas[0], id: currentId }]
      const oldQuestId = '04e8506f-1746-4b34-ae2b-90da57b7b5a5'
      const currentQuestId = '1879147898-epic'
      const definitionQuests = [{ ...quests[0], id: currentQuestId, sagas: [currentId] }]
      const items = [{ id: legacyId, completed: true, turnedIn: true }]
      const fake = driver(
        source === 'IndexedDB'
          ? {
              [SAGA_ITEMS_KEY]: items,
              [QUEST_DONE_AT_KEY]: { [oldQuestId]: 100 },
              [TURNED_IN_AT_KEY]: { [legacyId]: 50 }
            }
          : {}
      )
      if (source === 'localStorage') {
        localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items))
        localStorage.setItem(LOCAL_QUESTS_KEY, JSON.stringify([{ id: oldQuestId, lastDoneAt: 100 }]))
        localStorage.setItem(LOCAL_TURNED_IN_KEY, JSON.stringify([{ id: legacyId, turnedInAt: 50 }]))
      }
      const { progress } = await loadProgress(definitions, definitionQuests, fake)
      expect(progress.sagaStatus).toEqual({ [currentId]: { completed: true, turnedIn: true } })
      expect(progress.turnedInAt).toEqual({ [currentId]: 50 })
      expect(progress.questDoneAt).toEqual({ [currentQuestId]: 100 })
      expect(fake.setValues).toHaveBeenCalledWith(
        expect.arrayContaining([[QUEST_DONE_AT_KEY, { [currentQuestId]: 100 }]])
      )
      expect(JSON.parse(localStorage.getItem(LOCAL_QUESTS_KEY) ?? '')).toEqual([
        { id: currentQuestId, lastDoneAt: 100 }
      ])
      expect(fake.setValues).toHaveBeenLastCalledWith(expect.arrayContaining([[TURNED_IN_AT_KEY, { [currentId]: 50 }]]))
    }
  )

  it('prefers canonical status and cleared cutoff over legacy values in storage', async () => {
    const legacyId = 'the-planewalkers-path-epic'
    const currentId = '1879197212'
    const fake = driver({
      [SAGA_ITEMS_KEY]: [
        { id: currentId, completed: false, turnedIn: false },
        { id: legacyId, completed: true, turnedIn: true }
      ],
      [TURNED_IN_AT_KEY]: { [legacyId]: 50, [currentId]: 0 }
    })
    const { progress } = await loadProgress([{ ...sagas[0], id: currentId }], quests, fake)
    expect(progress.sagaStatus[currentId]).toEqual({ completed: false, turnedIn: false })
    expect(progress.turnedInAt).toEqual({ [currentId]: 0 })
  })

  it('loads IndexedDB, prunes unknown IDs, and defaults newly published sagas', async () => {
    const fake = driver({
      [SAGA_ITEMS_KEY]: [
        { id: 'known', completed: true, turnedIn: true },
        { id: 'removed', completed: true, turnedIn: true }
      ],
      [QUEST_DONE_AT_KEY]: { 'known-quest': 10, removed: 20 },
      [TURNED_IN_AT_KEY]: { known: 5, removed: 20 }
    })
    await expect(loadProgress(sagas, quests, fake)).resolves.toEqual({
      storageAvailable: true,
      progress: {
        sagaStatus: {
          known: { completed: true, turnedIn: true },
          new: { completed: false, turnedIn: false }
        },
        questDoneAt: { 'known-quest': 10 },
        turnedInAt: { known: 5 }
      }
    })
  })

  it('migrates compatible localStorage records when IndexedDB keys are absent', async () => {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify([{ id: 'known', completed: true, turnedIn: false }]))
    localStorage.setItem(LOCAL_QUESTS_KEY, JSON.stringify([{ id: 'known-quest', lastDoneAt: 10 }]))
    localStorage.setItem(LOCAL_TURNED_IN_KEY, JSON.stringify([{ id: 'known', turnedInAt: 5 }]))
    const fake = driver()
    const result = await loadProgress(sagas, quests, fake)
    expect(result.progress.questDoneAt).toEqual({ 'known-quest': 10 })
    expect(result.progress.turnedInAt).toEqual({ known: 5 })
    expect(fake.setValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        [
          SAGA_ITEMS_KEY,
          [
            { id: 'known', completed: true, turnedIn: false },
            { id: 'new', completed: false, turnedIn: false }
          ]
        ]
      ])
    )
  })

  it('survives malformed storage and a complete IndexedDB failure in memory', async () => {
    localStorage.setItem(LOCAL_ITEMS_KEY, '{bad json')
    const result = await loadProgress(sagas, quests, driver({}, true))
    expect(result.storageAvailable).toBe(false)
    expect(result.progress.sagaStatus.new).toEqual({ completed: false, turnedIn: false })
  })

  it('restores the latest edit on reload while IndexedDB still holds the prior save', async () => {
    const values = {
      [SAGA_ITEMS_KEY]: [],
      [QUEST_DONE_AT_KEY]: {},
      [TURNED_IN_AT_KEY]: {}
    }
    const fake = driver(values)
    const commit = Promise.withResolvers<undefined>()
    fake.setValues.mockImplementationOnce(async (entries) => {
      await commit.promise
      Object.assign(values, Object.fromEntries(entries))
    })
    const progress = {
      sagaStatus: { known: { completed: true, turnedIn: true, runStartedAt: 5 } },
      questDoneAt: { 'known-quest': 10 },
      turnedInAt: { known: 20 }
    }
    const write = saveProgress(sagas, progress, fake)
    expect((await loadProgress(sagas, quests, fake)).progress).toMatchObject(progress)
    expect(fake.getValues).not.toHaveBeenCalled()
    commit.resolve(undefined)
    await expect(write).resolves.toBe(true)
    expect((await loadProgress(sagas, quests, fake)).progress).toMatchObject(progress)
    expect(fake.getValues).toHaveBeenCalledOnce()
  })

  it('writes all primary keys and compatible localStorage mirrors', async () => {
    const fake = driver()
    const progress = {
      sagaStatus: {
        known: { completed: true, turnedIn: false },
        new: { completed: false, turnedIn: false }
      },
      questDoneAt: { 'known-quest': 10 },
      turnedInAt: { known: 5 }
    }
    await expect(saveProgress(sagas, progress, fake)).resolves.toBe(true)
    expect(fake.setValues).toHaveBeenCalledWith(expect.arrayContaining([[QUEST_DONE_AT_KEY, progress.questDoneAt]]))
    expect(JSON.parse(localStorage.getItem(LOCAL_QUESTS_KEY) ?? '')).toEqual([{ id: 'known-quest', lastDoneAt: 10 }])
  })
})
