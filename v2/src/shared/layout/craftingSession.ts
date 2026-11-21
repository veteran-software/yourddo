import { createContext, useContext, useEffect, useState } from 'react'

// Each mounted app shell owns one session, including during static rendering.
export const CraftingSession = createContext<object | null>(null)

export function createCraftingSelection<T>(initial: () => T) {
  const saved = new WeakMap<object, { value: T }>()
  return function useCraftingSelection() {
    const session = useContext(CraftingSession)
    const state = useState(() => {
      const entry = session && saved.get(session)
      return entry ? entry.value : initial()
    })
    const [value] = state
    useEffect(() => {
      if (session) saved.set(session, { value })
    }, [session, value])
    return state
  }
}
