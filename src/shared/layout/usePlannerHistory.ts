import { useCallback, useReducer } from 'react'

const historyLimit = 50
const journalLimit = 100
type Planner = 'essence-crafting' | 'gear-planner'

export interface PlannerHistoryEntry {
  id: string
  at: string
  description: string
}

interface HistoryStep<T> {
  value: T
  description: string
}

interface History<T> {
  past: HistoryStep<T>[]
  current: T
  future: HistoryStep<T>[]
  entries: PlannerHistoryEntry[]
}

type EventTime = Pick<PlannerHistoryEntry, 'id' | 'at'>
type DescribeEdit<T> = string | ((previous: T, next: T) => string | undefined)

type HistoryAction<T> =
  | { type: 'edit'; update: (current: T) => T; describe?: DescribeEdit<T>; time: EventTime }
  | { type: 'reset'; value: T }
  | { type: 'clear'; update: (current: T) => T }
  | { type: 'undo' | 'redo'; time: EventTime }

const journalKey = (planner: Planner) => `yourddo:${planner}:edit-history:v1`
const journalStorage = (planner: Planner) =>
  planner === 'essence-crafting' ? window.sessionStorage : window.localStorage

function isHistoryEntry(value: unknown): value is PlannerHistoryEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'at' in value &&
    typeof value.at === 'string' &&
    Number.isFinite(Date.parse(value.at)) &&
    'description' in value &&
    typeof value.description === 'string'
  )
}

function readJournal(planner: Planner): PlannerHistoryEntry[] {
  try {
    const saved: unknown = JSON.parse(journalStorage(planner).getItem(journalKey(planner)) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isHistoryEntry).slice(0, journalLimit) : []
  } catch {
    return []
  }
}

function recordEntry(previous: PlannerHistoryEntry[], time: EventTime, description: string) {
  return [{ ...time, description }, ...previous.slice(0, journalLimit - 1)]
}

function changeHistory<T>(state: History<T>, action: HistoryAction<T>): History<T> {
  switch (action.type) {
    case 'reset':
      return { ...state, past: [], current: action.value, future: [] }
    case 'clear':
      return { past: [], current: action.update(state.current), future: [], entries: [] }
    case 'edit': {
      const current = action.update(state.current)
      if (Object.is(current, state.current)) return state
      const description =
        typeof action.describe === 'function' ? action.describe(state.current, current) : action.describe
      if (!description) return { ...state, current }
      return {
        past: [...state.past.slice(1 - historyLimit), { value: state.current, description }],
        current,
        future: [],
        entries: recordEntry(state.entries, action.time, description)
      }
    }
    case 'undo': {
      const step = state.past.at(-1)
      if (!step) return state
      return {
        past: state.past.slice(0, -1),
        current: step.value,
        future: [{ value: state.current, description: step.description }, ...state.future],
        entries: recordEntry(state.entries, action.time, 'Undo · ' + step.description)
      }
    }
    case 'redo': {
      const step = state.future[0]
      if (!step) return state
      return {
        past: [...state.past, { value: state.current, description: step.description }],
        current: step.value,
        future: state.future.slice(1),
        entries: recordEntry(state.entries, action.time, 'Redo · ' + step.description)
      }
    }
  }
}

const eventTime = (): EventTime => ({
  at: new Date().toISOString(),
  id: globalThis.crypto.randomUUID?.() ?? globalThis.crypto.getRandomValues(new Uint32Array(4)).join('-')
})

export function usePlannerHistory<T>(initialize: () => T, planner: Planner) {
  const [state, dispatch] = useReducer(changeHistory<T>, initialize, (create) => ({
    past: [],
    current: create(),
    future: [],
    entries: readJournal(planner)
  }))

  const saveEntries = () => {
    try {
      const storage = journalStorage(planner)
      if (state.entries.length) storage.setItem(journalKey(planner), JSON.stringify(state.entries))
      else storage.removeItem(journalKey(planner))
      return true
    } catch {
      return false
    }
  }

  return {
    current: state.current,
    entries: state.entries,
    saveEntries,
    edit: useCallback((update: (current: T) => T, describe?: DescribeEdit<T>) => {
      dispatch({ type: 'edit', update, describe, time: eventTime() })
    }, []),
    reset: useCallback((value: T) => {
      dispatch({ type: 'reset', value })
    }, []),
    clear: useCallback((update: (current: T) => T) => {
      dispatch({ type: 'clear', update })
    }, []),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undo: useCallback(() => {
      dispatch({ type: 'undo', time: eventTime() })
    }, []),
    redo: useCallback(() => {
      dispatch({ type: 'redo', time: eventTime() })
    }, [])
  }
}
