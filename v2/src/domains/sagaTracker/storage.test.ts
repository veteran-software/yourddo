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
  { id: 'known', name: 'Known', levelRange: '3', npc: 'A' },
  { id: 'new', name: 'New', levelRange: '31', npc: 'B' }
]
const quests: QuestDefinition[] = [{ id: 'known-quest', name: 'Quest', sagas: ['known'] }]

const driver = (values: Record<string, unknown> = {}, fail = false) => ({
  getValue: vi.fn((key: string) =>
    fail ? Promise.reject(new Error('IDB unavailable')) : Promise.resolve(values[key])
  ),
  setValue: vi.fn(() => (fail ? Promise.reject(new Error('IDB unavailable')) : Promise.resolve()))
})

afterEach(() => {
  localStorage.clear()
})

describe('Saga Tracker storage', () => {
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
    expect(fake.setValue).toHaveBeenCalledWith(SAGA_ITEMS_KEY, [{ id: 'known', completed: true, turnedIn: false }])
  })

  it('survives malformed storage and a complete IndexedDB failure in memory', async () => {
    localStorage.setItem(LOCAL_ITEMS_KEY, '{bad json')
    const result = await loadProgress(sagas, quests, driver({}, true))
    expect(result.storageAvailable).toBe(false)
    expect(result.progress.sagaStatus.new).toEqual({ completed: false, turnedIn: false })
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
    expect(fake.setValue).toHaveBeenCalledWith(QUEST_DONE_AT_KEY, progress.questDoneAt)
    expect(JSON.parse(localStorage.getItem(LOCAL_QUESTS_KEY) ?? '')).toEqual([{ id: 'known-quest', lastDoneAt: 10 }])
  })
})
