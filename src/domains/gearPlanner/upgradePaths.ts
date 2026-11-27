import { formatAmount } from './effectAmounts'
import { compareFocus, focusChanges, type FocusChange } from './focusStats'
import {
  applyRecommendedAugments,
  collectRecommendationEffects,
  createAugmentRecommender,
  type RecommendedAugment
} from './augmentRecommendations'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { characterAllowsItem, ownerSlots, type GearOwner } from './character'
import { isCompatibleGearPlannerAugment } from './augments'
import { bonusLabel } from './statObjectives'
import { farmingList } from './farming'
import {
  gearPlannerPetSlots,
  gearPlannerSlots,
  type GearPlannerData,
  type GearPlannerSlot,
  type GearPlannerItem
} from './gearPlanner.types'
import { loadoutSnapshot, comparisonRows } from './loadoutComparison'
import { equipGearPlannerItemInSelection, setGearPlannerSlottedAugment } from './planner'
import { getEffectiveGearPlannerAugmentSlots } from './reforging'
import type { GearPlannerSetup } from './setups'
import type { TroveInventory } from './trove'

export interface PathRequest {
  kind: 'Stat' | 'Set tier' | 'Focus stats'
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
  changesItemType: boolean
  focus: FocusChange[]
  bonusChanges: string[]
  totals?: string
  delta: string
  losses: string[]
  availability: string
  location: string
  augments: readonly RecommendedAugment[]
}

const typeSensitiveSlots = new Set<GearPlannerSlot>([
  gearPlannerSlots.mainHand,
  gearPlannerSlots.offHand,
  gearPlannerSlots.armor,
  ...gearPlannerPetSlots
])

export function* searchUpgradePaths(
  setup: GearPlannerSetup,
  owner: GearOwner,
  data: GearPlannerData,
  essence: EssenceCraftingData,
  request: PathRequest,
  inventory: TroveInventory
) {
  const snapshot = (next: GearPlannerSetup) =>
    loadoutSnapshot(next, owner, data, essence, request.kind === 'Stat' ? request.objective : undefined, false)
  const before = snapshot(setup)
  const paths: UpgradePath[] = []
  const objectiveName = request.objective.toLowerCase()
  const stat = (entries: typeof before.Stats) =>
    entries.get(request.objective) ?? [...entries].find(([name]) => name.toLowerCase() === objectiveName)?.[1]
  const current = stat(before.Stats)
  const currentTyped = request.bonusType ? before.objectiveBonuses.get(request.bonusType) : undefined
  const goals = request.kind === 'Stat' ? [request.objective] : (setup.character.focusStats ?? [])
  const recommend = createAugmentRecommender(
    setup,
    data.reforging,
    data.augments,
    request.kind === 'Set tier' ? [] : goals,
    collectRecommendationEffects(setup, essence, data.reforging),
    request.bonusType
  )
  function sameValues(left: typeof before.Stats, right: typeof before.Stats) {
    if (left.size !== right.size) return false
    for (const [name, value] of left) {
      const other = right.get(name)
      if (
        value.text !== other?.text ||
        value.amount !== other.amount ||
        value.unit !== other.unit ||
        value.rounding !== other.rounding
      )
        return false
    }
    return true
  }
  function objectiveGain(after: typeof before) {
    if (request.kind === 'Set tier') {
      if (!after.Sets.has(request.objective) || before.Sets.has(request.objective)) return undefined
      return { gain: 1, delta: 'Tier activated', totals: undefined }
    }
    const value = stat(after.Stats)
    if (value?.amount == null || (current && (current.amount == null || current.unit !== value.unit))) return
    const gain = value.amount - (current?.amount ?? 0)
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
    const totals = (current?.text ?? '0' + (value.unit ?? '')) + ' → ' + value.text
    const delta = formatAmount(gain, value.unit, true, value.rounding ?? current?.rounding)
    return { gain, delta, totals }
  }
  function evaluate(
    next: GearPlannerSetup,
    slot: GearPlannerSlot,
    name: string,
    change: string,
    augments: readonly RecommendedAugment[] = [],
    plain?: typeof before
  ) {
    if (
      next === setup ||
      ownerSlots[owner].some((key) => request.locked.includes(key) && setup.equipment[key] !== next.equipment[key])
    )
      return
    const after = snapshot(next)
    if (
      plain &&
      augments.every(({ augment }) => !augment.setBonus?.length && !augment.clearSecondarySet) &&
      sameValues(after.Stats, plain.Stats) &&
      sameValues(after.Sets, plain.Sets) &&
      sameValues(after.objectiveBonuses, plain.objectiveBonuses)
    )
      return after
    if (request.protectedTiers.some((tier) => !after.Sets.has(tier))) return after
    const focus = focusChanges(setup.character.focusStats ?? [], before.Stats, after.Stats)
    const count = focus.filter((entry) => entry.delta > 0).length
    const improvement =
      request.kind === 'Focus stats'
        ? count
          ? { gain: 0, delta: String(count) + (count === 1 ? ' focus gain' : ' focus gains'), totals: undefined }
          : undefined
        : objectiveGain(after)
    if (!improvement) return after
    const losses = [...comparisonRows(before.Sets, after.Sets), ...comparisonRows(before.Stats, after.Stats)]
      .filter((row) => row.direction === 'loss')
      .map((row) => row.label + ' ' + row.delta)
    for (const key of ownerSlots[owner]) {
      const displaced = setup.equipment[key]
      if (key !== slot && displaced && !next.equipment[key]) losses.unshift('Unequips ' + displaced.source.name)
    }
    const needs = inventory.size
      ? farmingList(
          next,
          inventory,
          request.character,
          new Set([name, ...augments.map(({ augment }) => augment.name)].map((value) => value.toLowerCase()))
        )
      : []
    const task =
      needs.find((t) => t.status === 'Farm') ??
      needs.find((t) => t.status === 'Check') ??
      needs.find((t) => t.status === 'Collect') ??
      needs[0]
    const equippedType = setup.equipment[slot]?.source.type
    const proposedType = next.equipment[slot]?.source.type
    paths.push({
      name,
      slot,
      change,
      setup: next,
      ...improvement,
      changesItemType:
        typeSensitiveSlots.has(slot) && Boolean(equippedType && proposedType && equippedType !== proposedType),
      focus,
      bonusChanges: comparisonRows(before.objectiveBonuses, after.objectiveBonuses)
        .filter((row) => row.changed)
        .map((row) => bonusLabel(row.label) + ' ' + row.before + ' → ' + row.after),
      losses,
      availability: inventory.size ? (task?.status ?? 'Check') : 'Unknown',
      location: task ? [task.group, ...task.notes].filter(Boolean).join(' · ') : '',
      augments
    })
    return after
  }
  function* equipmentChanges(slot: GearPlannerSlot, host: GearPlannerItem | null) {
    for (const item of data.itemsBySlot[slot]) {
      if (
        item.id === host?.id ||
        item.minimumLevel < setup.minimumLevel ||
        item.minimumLevel > setup.maximumLevel ||
        !characterAllowsItem(setup.character, item)
      )
        continue
      const selection = equipGearPlannerItemInSelection(setup, slot, item)
      if (selection !== setup) {
        const next = { ...setup, ...selection }
        const change = host ? 'Replace ' + host.source.name : 'Equip in empty slot'
        const plain = evaluate(next, slot, item.source.name, change)
        if (plain) {
          const augments = recommend(item)
          if (augments.some(({ augment }) => !plain.augmentIsCovered?.(item, augment))) {
            const augmented = applyRecommendedAugments(next, item, data.reforging, augments)
            if (augmented !== next)
              evaluate(augmented, slot, item.source.name, change + ' with augments', augments, plain)
          }
        }
      }
      yield
    }
  }
  function* socketChanges(slot: GearPlannerSlot, host: GearPlannerItem) {
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
  for (const slot of ownerSlots[owner]) {
    if (request.locked.includes(slot)) continue
    const host = setup.equipment[slot]
    yield* equipmentChanges(slot, host)
    if (!host) continue
    yield* socketChanges(slot, host)
  }
  return paths.sort(
    (a, b) =>
      Number(a.changesItemType) - Number(b.changesItemType) ||
      b.gain - a.gain ||
      compareFocus(a.focus, b.focus) ||
      a.losses.length - b.losses.length ||
      a.name.localeCompare(b.name)
  )
}
