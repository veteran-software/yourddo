import { createStore, get, set } from 'idb-keyval'

// A small IndexedDB wrapper for saga tracker persistence
const db = createStore('yourddo-db', 'saga-tracker')

export interface StoredSagaItem {
  id: string
  completed: boolean
  turnedIn: boolean
}

export const getSagaItems = () => get<StoredSagaItem[] | undefined>('items', db)
export const setSagaItems = (items: StoredSagaItem[]) => set('items', items, db)

export const getQuestDoneAt = () => get<Record<string, number> | undefined>('questDoneAt', db)
export const setQuestDoneAt = (m: Record<string, number>) => set('questDoneAt', m, db)

export const getTurnedInAt = () => get<Record<string, number> | undefined>('turnedInAt', db)
export const setTurnedInAt = (m: Record<string, number>) => set('turnedInAt', m, db)

export const requestPersistentStorage = async () => {
  try {
    // Ask the browser not to evict our data under storage pressure
    if (navigator.storage?.persist) {
      await navigator.storage.persist()
    }
  } catch {
    // ignore
  }
}
