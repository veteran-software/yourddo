import { describe, expect, it } from 'vitest'
import { createBackup, InvalidSagaTrackerBackupError, parseBackup } from './backup.ts'
import type { QuestDefinition, SagaDefinition } from './sagaTracker.types.ts'

const sagas: SagaDefinition[] = [
  { id: 'first', name: 'First', levelRange: '3', npc: 'A' },
  { id: 'second', name: 'Second', levelRange: '20', npc: 'B' }
]
const quests: QuestDefinition[] = [{ id: 'quest', name: 'Quest', sagas: ['first'] }]
const valid = {
  version: 2,
  items: [{ id: 'first', completed: true, turnedIn: false }],
  questDoneAt: { quest: 10 },
  turnedInAt: { first: 5 }
}

describe('Saga Tracker backups', () => {
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
    expect(() => parseBackup({ ...valid, questDoneAt: { quest: -1 } }, sagas, quests)).toThrow('non-negative')
    expect(() => parseBackup({ ...valid, turnedInAt: [] }, sagas, quests)).toThrow('must be an object')
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
