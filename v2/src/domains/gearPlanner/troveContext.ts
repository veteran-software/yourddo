import { createContext, useContext } from 'react'
import type { TroveInventory } from './trove'
export const TroveContext = createContext<{
  importedAt?: string
  inventory: TroveInventory
  ownedOnly: boolean
  setOwnedOnly: (value: boolean) => void
  replace: (inventory: TroveInventory) => void
}>({
  inventory: new Map(),
  ownedOnly: false,
  setOwnedOnly: () => undefined,
  replace: () => undefined
})
export const useTroveInventory = () => useContext(TroveContext)
