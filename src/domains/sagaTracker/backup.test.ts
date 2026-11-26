import { describe, expect, it } from 'vitest'
import { createBackup, InvalidSagaTrackerBackupError, parseBackup } from './backup.ts'
import type { QuestDefinition, SagaDefinition } from './sagaTracker.types.ts'

const sagas: SagaDefinition[] = [
  { id: 'first', name: 'First', levelRange: '3', npcs: ['A'] },
  { id: 'second', name: 'Second', levelRange: '20', npcs: ['B'] }
]
const quests: QuestDefinition[] = [{ id: 'quest', name: 'Quest', level: 3, sagas: ['first'] }]
const valid = {
  version: 2,
  items: [{ id: 'first', completed: true, turnedIn: false }],
  questDoneAt: { quest: 10 },
  turnedInAt: { first: 5 }
}

describe('Saga Tracker backups', () => {
  it.each([false, true])(
    'imports legacy Planeswalker backups and prefers canonical values when present: %s',
    (both) => {
      const legacyId = 'the-planewalkers-path-epic'
      const currentId = '1879197212'
      const definitions = [{ ...sagas[0], id: currentId }]
      const oldQuestId = '04e8506f-1746-4b34-ae2b-90da57b7b5a5'
      const currentQuestId = '1879147898-epic'
      const definitionQuests = [{ ...quests[0], id: currentQuestId, sagas: [currentId] }]
      const backup = {
        ...valid,
        items: [
          ...(both ? [{ id: currentId, completed: false, turnedIn: false }] : []),
          { id: legacyId, completed: true, turnedIn: true }
        ],
        questDoneAt: { [oldQuestId]: 10, ...(both ? { [currentQuestId]: 30 } : {}) },
        turnedInAt: { [legacyId]: 5, ...(both ? { [currentId]: 0 } : {}) }
      }
      const progress = parseBackup(backup, definitions, definitionQuests)
      expect(progress.sagaStatus).toEqual({ [currentId]: { completed: !both, turnedIn: !both } })
      expect(progress.turnedInAt).toEqual({ [currentId]: both ? 0 : 5 })
      expect(progress.questDoneAt).toEqual({ [currentQuestId]: both ? 30 : 10 })
      expect(createBackup(definitions, progress)).toMatchObject({
        items: [{ id: currentId }],
        questDoneAt: { [currentQuestId]: both ? 30 : 10 }
      })
      expect(backup.items.at(-1)?.id).toBe(legacyId)
    }
  )

  it('exports version 2 items in authoritative saga order', () => {
    expect(
      createBackup(sagas, {
        sagaStatus: {
          second: { completed: true, turnedIn: true },
          first: { completed: false, turnedIn: false }
        },
        questDoneAt: {},
        turnedInAt: {}
      })
    ).toEqual({
      version: 2,
      items: [
        { id: 'first', completed: false, turnedIn: false },
        { id: 'second', completed: true, turnedIn: true }
      ],
      questDoneAt: {},
      turnedInAt: {}
    })
  })

  it('imports valid data, ignores unknown IDs, and defaults new sagas', () => {
    expect(
      parseBackup(
        {
          ...valid,
          items: [...valid.items, { id: 'unknown', completed: true, turnedIn: true }],
          questDoneAt: { quest: 10, unknown: 20 },
          turnedInAt: { first: 5, unknown: 20 }
        },
        sagas,
        quests
      )
    ).toEqual({
      sagaStatus: {
        first: { completed: true, turnedIn: false },
        second: { completed: false, turnedIn: false }
      },
      questDoneAt: { quest: 10 },
      turnedInAt: { first: 5 }
    })
  })

  it('rejects an invalid version or timestamp before returning progress', () => {
    expect(() => parseBackup({ ...valid, version: 1 }, sagas, quests)).toThrow(InvalidSagaTrackerBackupError)
    expect(() => parseBackup({ ...valid, questDoneAt: { quest: -1 } }, sagas, quests)).toThrow(
      /^Invalid Saga Tracker backup: questDoneAt must contain finite non-negative numbers$/
    )
    expect(() => parseBackup({ ...valid, turnedInAt: [] }, sagas, quests)).toThrow('must be an object')
  })

  it('omits the saga ID when a completion status is invalid', () => {
    const backup = { ...valid, items: [{ id: 'first', completed: 'yes', turnedIn: false }] }
    expect(() => parseBackup(backup, sagas, quests)).toThrow(
      /^Invalid Saga Tracker backup: saga completion and turn-in statuses must be booleans$/
    )
  })

  it('handles duplicate saga IDs deterministically with the last record winning', () => {
    const result = parseBackup(
      {
        ...valid,
        items: [
          { id: 'first', completed: false, turnedIn: false },
          { id: 'first', completed: true, turnedIn: true }
        ]
      },
      sagas,
      quests
    )
    expect(result.sagaStatus.first).toEqual({ completed: true, turnedIn: true })
  })
})
