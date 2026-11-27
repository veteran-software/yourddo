import { createContext, useContext } from 'react'
import type { TroveInventory } from './trove'
import { emptyTroveEquipped, type TroveEquippedItem } from './troveV5'
export const TroveContext = createContext<{
  importedAt?: string
  inventory: TroveInventory
  ownedOnly: boolean
  setOwnedOnly: (value: boolean) => void
  replace: (inventory: TroveInventory) => void
  pendingEquipped: readonly TroveEquippedItem[]
  queueEquipped: (rows: readonly TroveEquippedItem[]) => void
  clearPendingEquipped: (rows: readonly TroveEquippedItem[]) => void
}>({
  inventory: new Map(),
  ownedOnly: false,
  setOwnedOnly: () => undefined,
  replace: () => undefined,
  pendingEquipped: emptyTroveEquipped,
  queueEquipped: () => undefined,
  clearPendingEquipped: () => undefined
})
export const useTroveInventory = () => useContext(TroveContext)
