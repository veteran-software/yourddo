export const troveStorageKey = 'yourddo:gear-planner:trove-items'
const itemKey = (name: string) => name.trim().toLowerCase()

export type TroveInventory = ReadonlyMap<string, readonly string[]>

export interface TroveHolding {
  location: string
  character: string
  quantity: number
  binding: 'character' | 'transferable' | 'unknown'
}

function bindingRestriction(binding: unknown): TroveHolding['binding'] {
  if (binding === 'BtC' || binding === 'BoundToCharacter') return 'character'
  return ['BtA', 'BoundToAccount', 'None', 'Unbound'].includes(String(binding)) ? 'transferable' : 'unknown'
}

export class TroveSnapshot extends Map<string, string[]> {
  importedAt?: string
  readonly holdings = new Map<string, TroveHolding[]>()

  record(name: string, location: string, character: unknown, quantity: number, binding: unknown) {
    const key = itemKey(name)
    addTroveOwner(this, key, location)
    const entries = this.holdings.get(key) ?? []
    const shared = location.startsWith('Shared Bank') || location.startsWith('Shared Crafting Bank')
    const owner = !shared && typeof character === 'string' && !/^[-—–]$/.test(character.trim()) ? character.trim() : ''
    const restriction = bindingRestriction(binding)
    const match = entries.find((h) => h.location === location && h.character === owner && h.binding === restriction)
    if (match) match.quantity += quantity
    else entries.push({ location, character: owner, quantity, binding: restriction })
    this.holdings.set(key, entries)
  }
}

export function troveCharacterNames(inventory: TroveInventory) {
  const characters = new Set<string>()
  for (const owners of inventory.values())
    for (const owner of owners) {
      const name = /^(.*?) \(/.exec(owner)?.[1]
      if (name) characters.add(name)
    }
  if (inventory instanceof TroveSnapshot)
    for (const h of [...inventory.holdings.values()].flat()) if (h.character) characters.add(h.character)
  return [...characters].sort((a, b) => a.localeCompare(b))
}

export function serializeTroveInventory(inventory: TroveInventory, importedAt: string) {
  const items = [...inventory].map(([name, owners]) => [
    name,
    owners,
    inventory instanceof TroveSnapshot ? inventory.holdings.get(name) : undefined
  ])
  return JSON.stringify({ items, importedAt })
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
  const labels: Readonly<Record<string, string>> = { SharedBank: 'Shared Bank', SharedCrafting: 'Shared Crafting Bank' }
  const container = shared ? labels[location] : location
  const where = [container, ...details].filter(Boolean).join(' · ')
  if (shared) return where
  const name = typeof character === 'string' ? character.trim() : ''
  if (name && !/^[-—–]$/.test(name)) {
    if (where) {
      return name + ' (' + where + ')'
    }
    return name
  }
  return where
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isHolding(h: unknown): h is TroveHolding {
  return (
    isRecord(h) &&
    typeof h.location === 'string' &&
    typeof h.character === 'string' &&
    typeof h.quantity === 'number' &&
    Number.isSafeInteger(h.quantity) &&
    h.quantity > 0 &&
    (h.binding === 'character' || h.binding === 'transferable' || h.binding === 'unknown')
  )
}

function restoreEntry(inventory: TroveSnapshot, entry: unknown) {
  // Earlier v2 imports kept only the item names.
  if (typeof entry === 'string') {
    addTroveOwner(inventory, entry, '')
    return
  }
  if (!Array.isArray(entry)) return
  const fields: readonly unknown[] = entry
  const [name, owners, quantities] = fields
  if (typeof name !== 'string' || !Array.isArray(owners)) return
  addTroveOwner(inventory, name, '')
  if (Array.isArray(quantities)) {
    const holdings = quantities.filter(isHolding)
    if (holdings.length) inventory.holdings.set(name, holdings)
  }
  for (const owner of owners) if (typeof owner === 'string') addTroveOwner(inventory, name, owner)
}

function restoreSnapshot(inventory: TroveSnapshot, saved: string) {
  const payload: unknown = JSON.parse(saved)
  const items = isRecord(payload) ? payload.items : payload
  if (!Array.isArray(items)) return
  if (isRecord(payload) && typeof payload.importedAt === 'string' && Number.isFinite(Date.parse(payload.importedAt))) {
    inventory.importedAt = payload.importedAt
  }
  for (const entry of items) restoreEntry(inventory, entry)
}

function legacyRows(holdings: unknown): readonly unknown[] {
  if (Array.isArray(holdings)) return holdings
  if (!isRecord(holdings)) return []
  return Object.entries(holdings).map(([character, locations]) => ({ character, locations }))
}

function restoreLegacyHoldings(inventory: TroveSnapshot, name: string, entry: unknown) {
  const rows = legacyRows(isRecord(entry) ? entry.byCharacter : undefined)
  if (!rows.length) addTroveOwner(inventory, name, '')
  for (const row of rows) {
    if (!isRecord(row) || !isRecord(row.locations)) continue
    for (const [location, qty] of Object.entries(row.locations)) {
      if (typeof qty === 'number' && qty > 0)
        inventory.record(
          name,
          troveOwner(row.character, location),
          row.character,
          qty,
          isRecord(entry) ? entry.binding : undefined
        )
    }
  }
}

export function readTroveInventory(): TroveSnapshot {
  const inventory = new TroveSnapshot()
  try {
    const saved = localStorage.getItem(troveStorageKey)
    let missing: Set<string> | undefined
    if (saved !== null) {
      restoreSnapshot(inventory, saved)
      missing = new Set([...inventory].filter(([, owners]) => !owners.length).map(([key]) => key))
      if (!missing.size) return inventory
    }
    const legacy: unknown = JSON.parse(localStorage.getItem('troveData') ?? 'null')
    if (isRecord(legacy)) {
      for (const [name, entry] of Object.entries(legacy))
        if (!missing || missing.has(itemKey(name))) restoreLegacyHoldings(inventory, name, entry)
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
