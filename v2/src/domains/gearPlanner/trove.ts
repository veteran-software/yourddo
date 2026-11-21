export const troveStorageKey = 'yourddo:gear-planner:trove-items'
const itemKey = (name: string) => name.trim().toLowerCase()

export type TroveInventory = ReadonlyMap<string, readonly string[]>

export interface TroveHolding {
  location: string
  character: string
  quantity: number
  binding: 'character' | 'transferable' | 'unknown'
}

export class TroveSnapshot extends Map<string, string[]> {
  readonly holdings = new Map<string, TroveHolding[]>()

  record(name: string, location: string, character: unknown, quantity: number, binding: unknown) {
    const key = itemKey(name)
    addTroveOwner(this, key, location)
    const entries = this.holdings.get(key) ?? []
    const shared = location.startsWith('Shared Bank') || location.startsWith('Shared Crafting Bank')
    const owner = !shared && typeof character === 'string' && !/^[-—–]$/.test(character.trim()) ? character.trim() : ''
    const restriction =
      binding === 'BtC' || binding === 'BoundToCharacter'
        ? 'character'
        : ['BtA', 'BoundToAccount', 'None', 'Unbound'].includes(String(binding))
          ? 'transferable'
          : 'unknown'
    const match = entries.find((h) => h.location === location && h.character === owner && h.binding === restriction)
    if (match) match.quantity += quantity
    else entries.push({ location, character: owner, quantity, binding: restriction })
    this.holdings.set(key, entries)
  }
}

export function serializeTroveInventory(inventory: TroveInventory) {
  return JSON.stringify(
    [...inventory].map(([name, owners]) => [
      name,
      owners,
      inventory instanceof TroveSnapshot ? inventory.holdings.get(name) : undefined
    ])
  )
}

export function getTroveOwners(inventory: TroveInventory, name: string, filigree = false) {
  const key = itemKey(name)
  return inventory.get(key) ?? (filigree ? inventory.get(key.replace(/ \(rare\)$/, '')) : undefined)
}

export function ownsTroveItem(inventory: TroveInventory, name: string, filigree = false) {
  return getTroveOwners(inventory, name, filigree) !== undefined
}

export function addTroveOwner(inventory: Map<string, string[]>, name: string, owner: string) {
  const key = itemKey(name)
  if (!key) return
  const owners = inventory.get(key)
  if (!owners) inventory.set(key, owner ? [owner] : [])
  else if (owner && !owners.includes(owner)) owners.push(owner)
}

export function troveOwner(character: unknown, location: string, details: readonly string[] = []) {
  const shared = location === 'SharedBank' || location === 'SharedCrafting'
  const container = shared ? (location === 'SharedBank' ? 'Shared Bank' : 'Shared Crafting Bank') : location
  const where = [container, ...details].filter(Boolean).join(' · ')
  if (shared) return where
  const name = typeof character === 'string' ? character.trim() : ''
  return name && !/^[-—–]$/.test(name) ? (where ? name + ' (' + where + ')' : name) : where
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readTroveInventory(): TroveInventory {
  const inventory = new TroveSnapshot()
  try {
    const saved = localStorage.getItem(troveStorageKey)
    if (saved !== null) {
      const list: unknown = JSON.parse(saved)
      if (Array.isArray(list)) {
        for (const entry of list) {
          // Earlier v2 imports kept only the item names.
          if (typeof entry === 'string') addTroveOwner(inventory, entry, '')
          else if (Array.isArray(entry) && typeof entry[0] === 'string' && Array.isArray(entry[1])) {
            addTroveOwner(inventory, entry[0], '')
            if (Array.isArray(entry[2])) {
              const holdings = entry[2].filter(
                (h: unknown): h is TroveHolding =>
                  isRecord(h) &&
                  typeof h.location === 'string' &&
                  typeof h.character === 'string' &&
                  typeof h.quantity === 'number' &&
                  Number.isSafeInteger(h.quantity) &&
                  h.quantity > 0 &&
                  (h.binding === 'character' || h.binding === 'transferable' || h.binding === 'unknown')
              )
              if (holdings.length) inventory.holdings.set(entry[0], holdings)
            }
            for (const owner of entry[1]) if (typeof owner === 'string') addTroveOwner(inventory, entry[0], owner)
          }
        }
      }
      if (![...inventory.values()].some((owners) => !owners.length)) return inventory
    }
    // Older v2 snapshots stored only names. Recover matching holdings from the legacy save when available.
    const missing =
      saved === null ? null : new Set([...inventory].filter(([, owners]) => !owners.length).map(([key]) => key))
    const legacy: unknown = JSON.parse(localStorage.getItem('troveData') ?? 'null')
    if (isRecord(legacy)) {
      for (const [name, entry] of Object.entries(legacy)) {
        if (missing && !missing.has(itemKey(name))) continue
        const holdings = isRecord(entry) ? entry.byCharacter : undefined
        const rows = Array.isArray(holdings)
          ? holdings
          : isRecord(holdings)
            ? Object.entries(holdings).map(([character, locations]) => ({ character, locations }))
            : []
        for (const row of rows) {
          if (!isRecord(row) || !isRecord(row.locations)) continue
          for (const [location, qty] of Object.entries(row.locations)) {
            if (typeof qty === 'number' && qty > 0) addTroveOwner(inventory, name, troveOwner(row.character, location))
          }
        }
        if (!rows.length) addTroveOwner(inventory, name, '')
      }
    }
  } catch {
    // Ownership can still be imported when browser storage is unavailable.
  }
  return inventory
}

export async function parseTroveCsv(text: string): Promise<TroveInventory> {
  const { default: Papa } = await import('papaparse')
  const parsed = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    delimiter: ',',
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim()
  })
  if (!['Name', 'Quantity', 'Character', 'Location'].every((h) => parsed.meta.fields?.includes(h))) {
    throw new Error('Choose a Dungeon Helper Trove CSV with Name, Quantity, Character and Location columns.')
  }
  if (parsed.errors.length) throw new Error('The Trove CSV contains an invalid row. The previous inventory was kept.')
  const inventory = new TroveSnapshot()
  for (const row of parsed.data) {
    if (Number.isFinite(Number(row.Quantity)) && Number(row.Quantity) > 0) {
      inventory.record(
        row.Name,
        troveOwner(row.Character, row.Location.trim(), row.Tab?.trim() ? ['Tab ' + row.Tab.trim()] : []),
        row.Character,
        Number(row.Quantity),
        row.Binding
      )
    }
  }
  return inventory
}
