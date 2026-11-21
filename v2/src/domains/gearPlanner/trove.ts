export const troveStorageKey = 'yourddo:gear-planner:trove-items'
const itemKey = (name: string) => name.trim().toLowerCase()

export type TroveInventory = ReadonlyMap<string, readonly string[]>

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

export function troveOwner(character: unknown, location: string) {
  if (location === 'SharedBank') return 'Shared Bank'
  if (location === 'SharedCrafting') return 'Shared Crafting Bank'
  const name = typeof character === 'string' ? character.trim() : ''
  return name && !/^[-—–]$/.test(name) ? (location ? name + ' (' + location + ')' : name) : location
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readTroveInventory(): TroveInventory {
  const inventory = new Map<string, string[]>()
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
            for (const owner of entry[1]) if (typeof owner === 'string') addTroveOwner(inventory, entry[0], owner)
          }
        }
      }
      return inventory
    }
    const legacy: unknown = JSON.parse(localStorage.getItem('troveData') ?? 'null')
    if (isRecord(legacy)) {
      for (const [name, entry] of Object.entries(legacy)) {
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
  const inventory = new Map<string, string[]>()
  for (const row of parsed.data) {
    if (Number.isFinite(Number(row.Quantity)) && Number(row.Quantity) > 0) {
      addTroveOwner(inventory, row.Name, troveOwner(row.Character, row.Location.trim()))
    }
  }
  return inventory
}
