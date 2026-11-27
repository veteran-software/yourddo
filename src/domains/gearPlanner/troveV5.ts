import { TroveSnapshot, troveOwner } from './trove.ts'

export interface TroveEquippedItem {
  character: string
  name: string
  slots: string[]
  minimumLevel?: number
}

export const pendingTroveEquippedKey = 'yourddo:gear-planner:trove-equipped-pending:v1'
export const emptyTroveEquipped: readonly TroveEquippedItem[] = []

function isEquippedItem(value: unknown): value is TroveEquippedItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'character' in value &&
    typeof value.character === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    'slots' in value &&
    Array.isArray(value.slots) &&
    value.slots.every((slot: unknown) => typeof slot === 'string') &&
    (!('minimumLevel' in value) ||
      (typeof value.minimumLevel === 'number' && Number.isSafeInteger(value.minimumLevel) && value.minimumLevel > 0))
  )
}

export function readPendingTroveEquipped(raw: string | undefined): readonly TroveEquippedItem[] {
  try {
    const rows: unknown = JSON.parse(raw ?? 'null')
    return Array.isArray(rows) ? rows.filter(isEquippedItem) : emptyTroveEquipped
  } catch {
    return emptyTroveEquipped
  }
}

// Trove repeats "Name" in effects, tabs and metadata. Only inventory rows represent owned items.
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object')
  return value as Record<string, unknown>
}

function itemDetails(where: string, row: Record<string, unknown>, bankDetails: readonly string[]) {
  const { Tab, Row, Column, EquipsTo } = row
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
  return details
}

function collectItems(
  rows: unknown,
  inventory: TroveSnapshot,
  character: unknown,
  location: string,
  bankDetails: readonly string[] | ((item: Record<string, unknown>) => readonly string[]) = [],
  equipped?: TroveEquippedItem[]
) {
  if (!Array.isArray(rows)) throw new Error('Expected an item list')
  for (const row of rows) {
    const item = record(row)
    const { Name, Quantity, CharacterName, Container, Binding } = item
    if (typeof Name !== 'string' || !Name.trim()) throw new Error('Expected an item name')
    if (Quantity !== undefined && (typeof Quantity !== 'number' || !Number.isFinite(Quantity))) {
      throw new Error('Expected a numeric quantity')
    }
    // Equipped and other single items can omit Quantity.
    if (Quantity !== undefined && Quantity <= 0) continue
    const where = location === 'Inventory' && Container === 'Equipped' ? 'Equipped' : location
    const owner = character ?? CharacterName
    if (where === 'Equipped' && equipped) {
      const { EquipsTo, MinimumLevel, MinLevel } = item
      const level = MinimumLevel ?? MinLevel
      const minimumLevel = typeof level === 'number' || typeof level === 'string' ? Number(level) : 0
      const slots = Array.isArray(EquipsTo) ? EquipsTo : [EquipsTo]
      equipped.push({
        character: typeof owner === 'string' && !/^[-—–]$/.test(owner.trim()) ? owner.trim() : '',
        name: Name.trim(),
        slots: slots.filter((slot): slot is string => typeof slot === 'string' && slot.trim() !== ''),
        ...(Number.isSafeInteger(minimumLevel) && minimumLevel > 0 && { minimumLevel })
      })
    }
    const details = itemDetails(where, item, typeof bankDetails === 'function' ? bankDetails(item) : bankDetails)
    inventory.record(Name, troveOwner(owner, where, details), owner, Quantity ?? 1, Binding)
  }
}

function collectBank(bank: unknown, inventory: TroveSnapshot, character: unknown, location: string) {
  const snapshot = record(bank)
  const tabs = record(snapshot.Tabs)
  if (Object.hasOwn(snapshot, 'Items')) {
    // Newer snapshots list items once at bank level. Tab reports describe scan progress.
    collectItems(Object.values(record(snapshot.Items)), inventory, character, location, ({ TabName, TabIId }) => {
      if (typeof TabName === 'string' && TabName.trim()) return [TabName.trim()]
      const id = typeof TabIId === 'string' || typeof TabIId === 'number' ? String(TabIId) : ''
      const name = id && Object.hasOwn(tabs, id) ? record(tabs[id]).Name : undefined
      return typeof name === 'string' && name.trim() ? [name.trim()] : []
    })
    return
  }

  for (const tab of Object.values(tabs)) {
    const { Name, Pages } = record(tab)
    for (const [pageNumber, page] of Object.entries(record(Pages))) {
      const details = typeof Name === 'string' && Name.trim() ? [Name.trim()] : []
      details.push('Page ' + pageNumber)
      collectItems(record(page).Items, inventory, character, location, details)
    }
  }
}

function collectSnapshotBanks(
  fileName: string,
  data: Record<string, unknown>,
  inventory: TroveSnapshot,
  character?: string
) {
  const banks: Record<string, string> =
    fileName.toLowerCase() === 'account.json'
      ? { SharedBank: 'SharedBank', CraftingBank: 'SharedCrafting' }
      : { PersonalBank: 'Bank', ReincarnationBank: 'Reincarnation Cache' }
  const present = Object.keys(banks).filter((key) => data[key] != null)
  if (!present.length) throw new Error('Missing bank data')
  for (const key of present) collectBank(data[key], inventory, character, banks[key])
}

export async function importTroveV5(files: readonly File[]) {
  const snapshots = files.filter((f) => /^(?:account|.*-(?:bank|inventory))\.json$/i.test(f.name))
  if (!snapshots.length)
    throw new Error(
      'No Trove v5 snapshots found. Choose your server folder or select its inventory and bank JSON files.'
    )
  const inventory = new TroveSnapshot()
  const equipped: TroveEquippedItem[] = []
  // Read one snapshot at a time. An account bank alone can be several megabytes.
  async function importSnapshot(file: File) {
    try {
      const data = record(JSON.parse((await file.text()).replace(/^\uFEFF/, '')))
      const character = typeof data.Name === 'string' && data.Name.trim() ? data.Name : undefined
      if (/-inventory\.json$/i.test(file.name)) {
        collectItems(data.Inventory, inventory, character, 'Inventory', [], equipped)
      } else {
        collectSnapshotBanks(file.name, data, inventory, character)
      }
    } catch {
      throw new Error(`Could not read ${file.name} as a Trove v5 snapshot. Your previous inventory was kept.`)
    }
  }
  await snapshots.reduce((previous, file) => previous.then(() => importSnapshot(file)), Promise.resolve())
  return { inventory, equipped, fileCount: snapshots.length }
}
