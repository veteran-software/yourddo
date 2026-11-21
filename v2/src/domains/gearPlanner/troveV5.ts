import { TroveSnapshot, troveOwner } from './trove.ts'

// Trove repeats "Name" in effects, tabs and metadata. Only inventory rows represent owned items.
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object')
  return value as Record<string, unknown>
}

function collectItems(
  rows: unknown,
  inventory: TroveSnapshot,
  character: unknown,
  location: string,
  bankDetails: string[] = []
) {
  if (!Array.isArray(rows)) throw new Error('Expected an item list')
  for (const row of rows) {
    const { Name, Quantity, CharacterName, Container, Tab, Row, Column, EquipsTo, Binding } = record(row)
    if (typeof Name !== 'string' || !Name.trim()) throw new Error('Expected an item name')
    if (Quantity !== undefined && (typeof Quantity !== 'number' || !Number.isFinite(Quantity))) {
      throw new Error('Expected a numeric quantity')
    }
    // Equipped and other single items can omit Quantity.
    if (Quantity === undefined || Quantity > 0) {
      const where = location === 'Inventory' && Container === 'Equipped' ? 'Equipped' : location
      const details = [...bankDetails]
      if (where === 'Inventory') {
        if (typeof Tab === 'number') details.push('Tab ' + String(Tab))
        if (typeof Row === 'number' && typeof Column === 'number')
          details.push(`Row ${String(Row)}, column ${String(Column)}`)
      } else if (
        where === 'Equipped' &&
        Array.isArray(EquipsTo) &&
        EquipsTo.length === 1 &&
        typeof EquipsTo[0] === 'string'
      ) {
        details.push(EquipsTo[0])
      }
      inventory.record(
        Name,
        troveOwner(character ?? CharacterName, where, details),
        character ?? CharacterName,
        Quantity ?? 1,
        Binding
      )
    }
  }
}

function collectBank(bank: unknown, inventory: TroveSnapshot, character: unknown, location: string) {
  for (const tab of Object.values(record(record(bank).Tabs))) {
    const { Name, Pages } = record(tab)
    for (const [pageNumber, page] of Object.entries(record(Pages))) {
      const details = typeof Name === 'string' && Name.trim() ? [Name.trim()] : []
      details.push('Page ' + pageNumber)
      collectItems(record(page).Items, inventory, character, location, details)
    }
  }
}

export async function importTroveV5(files: readonly File[]) {
  const snapshots = files.filter((f) => /^(?:account|.*-(?:bank|inventory))\.json$/i.test(f.name))
  if (!snapshots.length)
    throw new Error(
      'No Trove v5 snapshots found. Choose your server folder or select its inventory and bank JSON files.'
    )
  const inventory = new TroveSnapshot()
  // Read one snapshot at a time. An account bank alone can be several megabytes.
  for (const file of snapshots) {
    try {
      const data = record(JSON.parse((await file.text()).replace(/^\uFEFF/, '')))
      const character = typeof data.Name === 'string' && data.Name.trim() ? data.Name : undefined
      if (/-inventory\.json$/i.test(file.name)) {
        collectItems(data.Inventory, inventory, character, 'Inventory')
      } else {
        const banks: Record<string, string> =
          file.name.toLowerCase() === 'account.json'
            ? { SharedBank: 'SharedBank', CraftingBank: 'SharedCrafting' }
            : { PersonalBank: 'Bank', ReincarnationBank: 'Reincarnation Cache' }
        const present = Object.keys(banks).filter((key) => data[key] != null)
        if (!present.length) throw new Error('Missing bank data')
        for (const key of present) collectBank(data[key], inventory, character, banks[key])
      }
    } catch {
      throw new Error(`Could not read ${file.name} as a Trove v5 snapshot. Your previous inventory was kept.`)
    }
  }
  return { inventory, fileCount: snapshots.length }
}
