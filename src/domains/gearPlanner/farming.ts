import { enabledOwners, ownerSlots } from './character'
import type { GearPlannerSetup } from './setups'
import { TroveSnapshot, type TroveHolding, type TroveInventory } from './trove'

interface Need {
  name: string
  uses: string[]
  filigree: boolean
}
export type FarmStatus = 'Farm' | 'Collect' | 'Owned' | 'Check'
export interface FarmTask {
  name: string
  uses: string[]
  status: FarmStatus
  group: string
  quantity: number
  notes: string[]
}

function equippedNeeds(setup: GearPlannerSetup) {
  const needs = new Map<string, Need>()
  function add(name: string, use: string, filigree = false) {
    const key = name.trim().toLowerCase()
    const existing = needs.get(key)
    if (existing) {
      existing.uses.push(use)
      return
    }
    needs.set(key, { name, uses: [use], filigree })
  }
  for (const owner of enabledOwners(setup.character.classes))
    for (const slot of ownerSlots[owner]) {
      const item = setup.equipment[slot]
      if (!item) continue
      add(item.source.name, slot)
      for (const aug of Object.values(setup.slottedAugments[item.id] ?? {})) add(aug.name, slot + ' · Augment')
      for (const fil of Object.values(setup.slottedFiligrees[item.id] ?? {})) add(fil.name, slot + ' · Filigree', true)
    }
  return needs
}

export function farmingList(
  setup: GearPlannerSetup,
  inventory: TroveInventory,
  character: string,
  names?: ReadonlySet<string>
) {
  const tasks: FarmTask[] = []
  const target = character.trim().toLowerCase()
  for (const [key, need] of equippedNeeds(setup)) {
    if (!names || names.has(need.name.toLowerCase())) tasks.push(...farmingTasks(key, need, inventory, target))
  }
  return tasks
}

function farmingTasks(key: string, need: Need, inventory: TroveInventory, target: string) {
  const tasks: FarmTask[] = []
  let remaining = need.uses.length
  function task(status: FarmStatus, group: string, quantity: number, notes: string[] = []) {
    const offset = need.uses.length - remaining
    const uses = need.uses.slice(offset, offset + quantity)
    const previous = tasks.find((t) => t.name === need.name && t.status === status && t.group === group)
    if (previous) {
      previous.quantity += quantity
      previous.uses.push(...uses)
    } else tasks.push({ ...need, uses, status, group, quantity, notes })
    remaining -= quantity
  }
  const owners = inventory.get(key)
  const holdings = inventory instanceof TroveSnapshot ? inventory.holdings.get(key) : undefined
  // Earlier imports prove at least one copy at each named location.
  const stock =
    holdings ??
    owners?.map((location) => ({
      location,
      character: /^(.*?) \(/.exec(location)?.[1] ?? '',
      quantity: 1,
      binding: 'unknown' as const
    }))
  const blocked: string[] = []
  function allocateStock(copies: readonly TroveHolding[]) {
    const available = copies.map((h) => ({ h, status: troveHoldingAvailability(h, target) }))
    for (const status of ['Owned', 'Collect', 'Check', 'bound'] as const) {
      for (const { h, status: kind } of available) {
        if (!remaining || kind !== status) continue
        if (status === 'bound') {
          blocked.push(h.location + ' · Character-bound')
          continue
        }
        task(
          status,
          h.location || 'Location unavailable',
          Math.min(remaining, h.quantity),
          status === 'Check' ? ['Verify owner or binding in Trove.'] : []
        )
      }
    }
  }
  if (stock?.length) allocateStock(stock)
  if (remaining && owners !== undefined && !holdings) {
    task('Check', 'Earlier Trove import', remaining, [...owners, 'Reimport Trove to verify quantities and binding.'])
  } else if (remaining && need.filigree && key.endsWith(' (rare)') && inventory.has(key.replace(/ \(rare\)$/, ''))) {
    task('Check', 'Verify rare filigree', remaining, [
      'Trove lists the base name only. Check the rarity before farming.'
    ])
  }
  if (remaining) task('Farm', '', remaining, blocked)
  return tasks
}

export function troveHoldingAvailability(h: TroveHolding, target: string) {
  const shared = /^Shared (?:Crafting )?Bank(?: ·|$)/.test(h.location)
  if (!target) return 'Owned'
  if (h.character?.toLowerCase() === target) return 'Owned'
  if (h.binding === 'character' && h.character) return 'bound'
  if (shared || (h.character && h.binding === 'transferable')) return 'Collect'
  return 'Check'
}
