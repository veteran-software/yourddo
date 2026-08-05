import { describe, expect, it } from 'vitest'
import {
  categorizeSaga,
  getHighlightParts,
  getSagaCompletionState,
  groupQuestsBySaga,
  isSearchActive,
  questCountsForSaga,
  resetProgress,
  sagaMatchesSearch,
  startNewRun,
  toggleQuest,
  toggleSagaQuests,
  toggleTurnedIn
} from './logic.ts'
import type { QuestDefinition, SagaDefinition } from './sagaTracker.types.ts'

const sagas: SagaDefinition[] = [
  { id: 'h', name: 'Heroic Story', levelRange: '3-5', npc: 'H' },
  { id: 'e', name: 'Epic Story', levelRange: '20-30', npc: 'E' },
  { id: 'l', name: 'Legendary Story', levelRange: '31', npc: 'L' }
]
const quests: QuestDefinition[] = [
  { id: 'z', name: 'Zulu Quest', sagas: ['h', 'e'] },
  { id: 'a', name: 'Alpha Quest', sagas: ['h'] }
]

describe('Saga Tracker logic', () => {
  it('categorizes the published level-range start', () => {
    expect(categorizeSaga('19-20')).toBe('heroic')
    expect(categorizeSaga('20')).toBe('epic')
    expect(categorizeSaga('30-32')).toBe('epic')
    expect(categorizeSaga('31')).toBe('legendary')
  })

  it('groups quests across sagas and sorts each display list alphabetically', () => {
    const grouped = groupQuestsBySaga(sagas, quests)
    expect(grouped.h.map(({ id }) => id)).toEqual(['a', 'z'])
    expect(grouped.e.map(({ id }) => id)).toEqual(['z'])
  })

  it('uses strict completion-after-cutoff semantics for shared quests', () => {
    expect(questCountsForSaga('h', 'z', { z: 20 }, { h: 10 })).toBe(true)
    expect(questCountsForSaga('h', 'z', { z: 10 }, { h: 10 })).toBe(false)
    expect(questCountsForSaga('e', 'z', { z: 20 }, { e: 30 })).toBe(false)
  })

  it('derives incomplete, indeterminate, and complete saga states', () => {
    expect(getSagaCompletionState('h', quests, {}, {})).toBe('incomplete')
    expect(getSagaCompletionState('h', quests, { a: 1 }, {})).toBe('indeterminate')
    expect(getSagaCompletionState('h', quests, { a: 1, z: 1 }, {})).toBe('complete')
  })

  it('toggles quests globally and saga quests with one injected timestamp', () => {
    expect(toggleQuest({}, 'z', true, 42)).toEqual({ z: 42 })
    expect(toggleQuest({ z: 42, a: 2 }, 'z', false, 99)).toEqual({ a: 2 })
    expect(toggleSagaQuests({}, quests, true, 50)).toEqual({ z: 50, a: 50 })
    expect(toggleSagaQuests({ z: 50, a: 50 }, quests, false, 60)).toEqual({})
  })

  it('turns in, clears turn-in, starts one new run, and resets globally', () => {
    const status = { h: { completed: true, turnedIn: false }, e: { completed: true, turnedIn: true } }
    expect(toggleTurnedIn(status, {}, 'h', true, 10)).toEqual({
      sagaStatus: { ...status, h: { completed: true, turnedIn: true } },
      turnedInAt: { h: 10 }
    })
    expect(toggleTurnedIn(status, { h: 10 }, 'h', false, 20).turnedInAt.h).toBe(0)
    expect(startNewRun(status, { e: 7 }, 'h', 30)).toEqual({
      sagaStatus: { ...status, h: { completed: false, turnedIn: false } },
      turnedInAt: { e: 7, h: 30 }
    })
    expect(resetProgress(sagas)).toEqual({
      sagaStatus: {
        h: { completed: false, turnedIn: false },
        e: { completed: false, turnedIn: false },
        l: { completed: false, turnedIn: false }
      },
      questDoneAt: {},
      turnedInAt: {}
    })
  })

  it('applies the three-character threshold and matches saga or quest names', () => {
    expect(isSearchActive(' ab ')).toBe(false)
    expect(isSearchActive(' alp ')).toBe(true)
    expect(sagaMatchesSearch(sagas[0], quests, 'hero')).toBe(true)
    expect(sagaMatchesSearch(sagas[0], quests, 'alpha')).toBe(true)
    expect(sagaMatchesSearch(sagas[0], quests, 'missing')).toBe(false)
  })

  it('highlights regex-significant text safely', () => {
    expect(getHighlightParts('Quest [A+B] complete', '[a+b]')).toEqual([
      { text: 'Quest ', match: false },
      { text: '[A+B]', match: true },
      { text: ' complete', match: false }
    ])
  })
})
