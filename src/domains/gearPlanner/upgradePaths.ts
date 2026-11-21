import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { characterAllowsItem, ownerSlots, type GearOwner } from './character'
import { isCompatibleGearPlannerAugment } from './augments'
import { bonusLabel } from './statObjectives'
import { farmingList } from './farming'
import type { GearPlannerData, GearPlannerSlot } from './gearPlanner.types'
import { loadoutSnapshot, comparisonRows } from './loadoutComparison'
import { equipGearPlannerItemInSelection, setGearPlannerSlottedAugment } from './planner'
import { getEffectiveGearPlannerAugmentSlots } from './reforging'
import type { GearPlannerSetup } from './setups'
import type { TroveInventory } from './trove'

export interface PathRequest {
  kind: 'Stat' | 'Set tier'
  objective: string
  bonusType?: string
  locked: string[]
  protectedTiers: string[]
  character: string
}

export interface UpgradePath {
  name: string
  slot: GearPlannerSlot
  change: string
  setup: GearPlannerSetup
  gain: number
  bonusChanges: string[]
  totals?: string
  delta: string
  losses: string[]
  availability: string
  location: string
}

export function* searchUpgradePaths(
  setup: GearPlannerSetup,
  owner: GearOwner,
  data: GearPlannerData,
  essence: EssenceCraftingData,
  request: PathRequest,
  inventory: TroveInventory
) {
  const before = loadoutSnapshot(setup, owner, data, essence, request.kind === 'Stat' ? request.objective : undefined)
  const paths: UpgradePath[] = []
  const objectiveName = request.objective.toLowerCase()
  const stat = (entries: typeof before.Stats) =>
    entries.get(request.objective) ?? [...entries].find(([name]) => name.toLowerCase() === objectiveName)?.[1]
  const current = stat(before.Stats)
  const currentTyped = request.bonusType ? before.objectiveBonuses.get(request.bonusType) : undefined
  function evaluate(next: GearPlannerSetup, slot: GearPlannerSlot, name: string, change: string) {
    if (
      next === setup ||
      ownerSlots[owner].some((key) => request.locked.includes(key) && setup.equipment[key] !== next.equipment[key])
    )
      return
    const after = loadoutSnapshot(next, owner, data, essence, request.kind === 'Stat' ? request.objective : undefined)
    if (request.protectedTiers.some((tier) => !after.Sets.has(tier))) return
    let totals: string | undefined
    let gain = 1,
      delta = 'Tier activated'
    if (request.kind === 'Set tier') {
      if (!after.Sets.has(request.objective) || before.Sets.has(request.objective)) return
    } else {
      const value = stat(after.Stats)
      if (value?.amount == null || (current && (current.amount == null || current.unit !== value.unit))) return
      gain = value.amount - (current?.amount ?? 0)
      if (gain <= 0) return
      if (request.bonusType) {
        const typed = after.objectiveBonuses.get(request.bonusType)
        if (
          typed?.amount == null ||
          (currentTyped && (currentTyped.amount == null || typed.unit !== currentTyped.unit)) ||
          typed.amount <= (currentTyped?.amount ?? 0)
        )
          return
      }
      totals = (current?.text ?? '0' + (value.unit ?? '')) + ' → ' + value.text
      delta = '+' + gain.toLocaleString('en-US', { maximumFractionDigits: 6 }) + (value.unit ?? '')
    }
    const losses = [...comparisonRows(before.Sets, after.Sets), ...comparisonRows(before.Stats, after.Stats)]
      .filter((row) => row.direction === 'loss')
      .map((row) => row.label + ' ' + row.delta)
    for (const key of ownerSlots[owner]) {
      const displaced = setup.equipment[key]
      if (key !== slot && displaced && !next.equipment[key]) losses.unshift('Unequips ' + displaced.source.name)
    }
    const needs = farmingList(next, inventory, request.character).filter(
      (task) => task.name.toLowerCase() === name.toLowerCase()
    )
    const task =
      needs.find((t) => t.status === 'Farm') ??
      needs.find((t) => t.status === 'Check') ??
      needs.find((t) => t.status === 'Collect') ??
      needs[0]
    paths.push({
      name,
      slot,
      change,
      setup: next,
      gain,
      delta,
      totals,
      bonusChanges: comparisonRows(before.objectiveBonuses, after.objectiveBonuses)
        .filter((row) => row.changed)
        .map((row) => bonusLabel(row.label) + ' ' + row.before + ' → ' + row.after),
      losses,
      availability: inventory.size ? (task?.status ?? 'Check') : 'Unknown',
      location: task ? [task.group, ...task.notes].join(' · ') : ''
    })
  }
  for (const slot of ownerSlots[owner]) {
    if (request.locked.includes(slot)) continue
    const host = setup.equipment[slot]
    for (const item of data.itemsBySlot[slot]) {
      if (
        item.id === host?.id ||
        item.minimumLevel < setup.minimumLevel ||
        item.minimumLevel > setup.maximumLevel ||
        !characterAllowsItem(setup.character, item)
      )
        continue
      const selection = equipGearPlannerItemInSelection(setup, slot, item)
      if (selection !== setup)
        evaluate(
          { ...setup, ...selection },
          slot,
          item.source.name,
          host ? 'Replace ' + host.source.name : 'Equip in empty slot'
        )
      yield
    }
    if (!host) continue
    const sockets = getEffectiveGearPlannerAugmentSlots(host, setup.reforging[host.id], data.reforging)
    const level = Math.min(setup.maximumLevel, setup.essenceCrafting[host.id]?.minimumLevel ?? host.minimumLevel)
    for (const [index, socket] of sockets.entries()) {
      if (setup.slottedAugments[host.id]?.[index]) continue
      for (const augment of data.augments) {
        if (augment.minLevel > level || !isCompatibleGearPlannerAugment(socket, augment)) continue
        const selection = setGearPlannerSlottedAugment(setup, host.id, index, augment, sockets)
        evaluate(
          { ...setup, ...selection },
          slot,
          augment.name,
          host.source.name + ' · ' + socket.augmentType + ' socket ' + String(index + 1)
        )
        yield
      }
    }
  }
  return paths.sort((a, b) => b.gain - a.gain || a.losses.length - b.losses.length || a.name.localeCompare(b.name))
}
