import { gearPlannerCharacterSlots, type GearPlannerItem, type GearPlannerSlot } from './gearPlanner.types'
import {
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItemInSelection,
  type GearPlannerEquipment
} from './planner'
import { createGearPlannerSetup, nextSetupName, type GearPlannerSetupsState } from './setups'
import type { TroveEquippedItem } from './troveV5'

const nameKey = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
const slotKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const slots = new Map<string, GearPlannerSlot>([
  ...gearPlannerCharacterSlots.map((slot): [string, GearPlannerSlot] => [slotKey(slot), slot]),
  ['goggles', 'Eyes'],
  ['helmet', 'Head'],
  ['necklace', 'Neck'],
  ['back', 'Cloak'],
  ['bracers', 'Wrists'],
  ['belt', 'Waist'],
  ['boots', 'Feet'],
  ['gloves', 'Hands'],
  ['finger1', 'First Finger'],
  ['finger2', 'Second Finger'],
  ['ring1', 'First Finger'],
  ['ring2', 'Second Finger'],
  ['weapon1', 'Main Hand'],
  ['weapon2', 'Off Hand'],
  ['runearm', 'Off Hand'],
  ['shield', 'Off Hand'],
  ['orb', 'Off Hand']
])

function catalogIdentity(item: GearPlannerItem) {
  const { catalogId, suppressedPowerRecipeId, pageTitle, name } = item.source
  if (catalogId !== undefined) return 'item:' + String(catalogId)
  if (suppressedPowerRecipeId !== undefined) return 'suppressed-power:' + String(suppressedPowerRecipeId)
  return JSON.stringify([item.sourceFile, pageTitle ?? name, item.minimumLevel])
}

interface EquippedLoadout {
  character: string
  equipment: GearPlannerEquipment
}

export function resolveTroveLoadouts(equipped: readonly TroveEquippedItem[], catalog: readonly GearPlannerItem[]) {
  const equippedNames = new Set(equipped.map(({ name }) => nameKey(name)))
  const byName = Map.groupBy(
    catalog.filter(({ source }) => equippedNames.has(nameKey(source.name))),
    ({ source }) => nameKey(source.name)
  )
  const loadouts: EquippedLoadout[] = []
  const issues: string[] = []
  let inferred = 0
  for (const rows of Map.groupBy(equipped, ({ character }) => nameKey(character)).values()) {
    const { character } = rows[0]
    if (!character) {
      issues.push(...rows.map(({ name }) => name + ' · Character name unavailable'))
      continue
    }
    const report = (name: string, reason: string) => issues.push(character + ' · ' + name + ' · ' + reason)
    const matches = rows.flatMap(({ name, slots: reportedSlots, minimumLevel }) => {
      const named = byName.get(nameKey(name)) ?? []
      const hinted = new Set(reportedSlots.flatMap((slot) => slots.get(slotKey(slot)) ?? []))
      const allowed = named.filter(
        ({ slot }) =>
          gearPlannerCharacterSlots.some((characterSlot) => characterSlot === slot) &&
          (!hinted.size || hinted.has(slot))
      )
      const atLevel = minimumLevel === undefined ? [] : allowed.filter((item) => item.minimumLevel === minimumLevel)
      const candidates = atLevel.length ? atLevel : allowed
      if (new Set(candidates.map(catalogIdentity)).size !== 1) {
        report(
          name,
          candidates.length
            ? 'Multiple catalog matches'
            : named.length
              ? 'No compatible equipment slot'
              : 'Item not found in the catalog'
        )
        return []
      }
      const bySlot = new Map(candidates.map((item) => [item.slot, item]))
      const choices = gearPlannerCharacterSlots.flatMap((slot) => bySlot.get(slot) ?? [])
      return [{ name, choices }]
    })
    const slotOrder = (item: GearPlannerItem) => gearPlannerCharacterSlots.findIndex((slot) => slot === item.slot)
    matches.sort((a, b) => a.choices.length - b.choices.length || slotOrder(a.choices[0]) - slotOrder(b.choices[0]))
    let selection = createEmptyGearPlannerSelectionState()
    for (const { name, choices } of matches) {
      const available = choices.filter(({ slot }) => !selection.equipment[slot])
      let placed = false
      for (const item of available) {
        const next = equipGearPlannerItemInSelection(selection, item.slot, item)
        if (next === selection || (selection.equipment['Off Hand'] && !next.equipment['Off Hand'])) continue
        if (available.length > 1) inferred += 1
        selection = next
        placed = true
        break
      }
      if (!placed && !(choices.length === 1 && selection.equipment[choices[0].slot]?.id === choices[0].id)) {
        report(name, 'Could not place alongside the other equipped items')
      }
    }
    if (gearPlannerCharacterSlots.some((slot) => selection.equipment[slot])) {
      loadouts.push({ character, equipment: selection.equipment })
    }
  }
  return { loadouts, issues, inferred }
}

export function addTroveLoadouts(
  state: GearPlannerSetupsState,
  loadouts: readonly (EquippedLoadout & { id: string })[]
): GearPlannerSetupsState {
  const setups = [...state.setups]
  let activeSetupId: string | undefined
  for (const { character, equipment, id } of loadouts) {
    const prefix = 'trove-equipped:' + JSON.stringify(nameKey(character)) + ':'
    const existing = setups.find(
      (setup) =>
        setup.id.startsWith(prefix) &&
        gearPlannerCharacterSlots.every((slot) => setup.equipment[slot]?.id === equipment[slot]?.id)
    )
    if (existing) {
      activeSetupId ??= existing.id
      continue
    }
    const setup = createGearPlannerSetup(prefix + id, nextSetupName(setups, 'Equipped · ' + character))
    setups.push({ ...setup, equipment })
    activeSetupId ??= setup.id
  }
  if (!activeSetupId || (setups.length === state.setups.length && activeSetupId === state.activeSetupId)) return state
  return { setups, activeSetupId }
}
