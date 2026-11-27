import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Each mounted app shell owns one session, including during static rendering.
export const CraftingSession = createContext<object | null>(null)

export function createCraftingCatalog<T>(load: () => Promise<T>) {
  const catalogs = new WeakMap<object, Promise<T>>()
  return function useCraftingCatalog() {
    const session = useContext(CraftingSession)
    return useCallback(() => {
      if (!session) return load()
      const cached = catalogs.get(session)
      if (cached) return cached
      const pending = load().catch((error: unknown) => {
        catalogs.delete(session)
        throw error
      })
      catalogs.set(session, pending)
      return pending
    }, [session])
  }
}

export function createCraftingSelection<T>(initial: () => T) {
  const saved = new WeakMap<object, { value: T }>()
  return function useCraftingSelection() {
    const session = useContext(CraftingSession)
    const [value, setValue] = useState(() => {
      const entry = session && saved.get(session)
      return entry ? entry.value : initial()
    })
    useEffect(() => {
      if (session) saved.set(session, { value })
    }, [session, value])
    return [value, setValue] as const
  }
}
