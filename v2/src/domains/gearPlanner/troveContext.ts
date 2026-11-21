import { createContext, useContext } from 'react'
import type { TroveInventory } from './trove'
export const TroveContext = createContext<{
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
