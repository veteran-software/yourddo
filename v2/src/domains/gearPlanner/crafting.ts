import rules from './craftingRules.json'
import type { GearPlannerEffect, GearPlannerItem } from './gearPlanner.types.ts'

export interface CraftChoice {
  id: string
  label: string
  effects?: readonly GearPlannerEffect[]
  setName?: string
}

export interface EquippedCraft extends CraftChoice {
  system: string
  replacesEnchantments?: boolean
}

export interface CraftGroup {
  system: string
  label: string
  choices: CraftChoice[]
  replacesEnchantments?: boolean
}

export interface GearCraftingData {
  nearlyComplete: readonly {
    name: string
    requirements: readonly { name: string }[]
    effectsAdded: readonly GearPlannerEffect[]
    effectsRemoved: readonly { name: string }[]
  }[]
  upgrades: readonly {
    system: string
    label: string
    marker: string
    items: ReadonlyMap<string, readonly GearPlannerEffect[]>
  }[]
}

export const emptyGearCraftingData: GearCraftingData = { nearlyComplete: [], upgrades: [] }
const setChoice = (name: string): CraftChoice => ({ id: name, label: name, setName: name })
export const craftItemKey = (title: string) => title.trim().replace(/\s+/g, ' ').toLowerCase()

export function gearCraftGroups(item: GearPlannerItem, data: GearCraftingData): CraftGroup[] {
  const groups: CraftGroup[] = []
  const source = item.source
  const markers = new Set(source.enchantments?.map(({ name }) => name))
  for (const { system, label, marker, items } of data.upgrades) {
    if (!markers.has(marker)) continue
    const effects =
      items.get(craftItemKey(source.name)) ?? items.get(craftItemKey((source.pageTitle ?? '').split('(')[0]))
    if (effects)
      groups.push({ system, label, replacesEnchantments: true, choices: [{ id: 'applied', label, effects }] })
  }
  const placeholder = source.enchantments?.find(({ name }) => name.startsWith('Nearly Complete:'))?.name
  if (placeholder) {
    const requirement = `${item.minimumLevel >= 30 ? 'Legendary' : 'Heroic'} Item with ${placeholder}`
    const choices = data.nearlyComplete
      .filter(
        (r) =>
          r.effectsRemoved.some((e) => e.name === placeholder) && r.requirements.some((e) => e.name === requirement)
      )
      .map((r) => ({ id: r.name, label: r.name, effects: r.effectsAdded }))
    if (choices.length) groups.push({ system: 'nearly-complete', label: 'Nearly Complete', choices })
  }
  if (markers.has('Trace of Madness')) {
    groups.push({
      system: 'trace-of-madness',
      label: 'Trace of Madness',
      choices: rules.trace.map((r) => ({ id: r.name, label: r.name, effects: r.effects }))
    })
  }
  const ritual = rules.ritual.filter((r) => markers.has(r.marker))
  if (ritual.length)
    groups.push({
      system: 'ritual-table',
      label: 'Ritual Table',
      choices: ritual.map((r) => ({ id: r.name, label: r.name, effects: r.effects }))
    })
  if (markers.has('Lost Purpose')) {
    const legendary = source.name.startsWith('Legendary ') || item.minimumLevel >= 20
    groups.push({
      system: 'lost-purpose',
      label: 'Lost Purpose',
      choices: rules.lost.filter((name) => name.startsWith('Legendary ') === legendary).map(setChoice)
    })
  }
  if (source.name.includes('Gem of Many Facets')) {
    const gemGroups: Record<string, { label: string; setBonuses: string[] }[]> = rules.gems
    const known = gemGroups[source.pageTitle ?? ''] ?? gemGroups[source.name]
    // The Legendary Gem's CDN item lists four desert sets with the Epic prefix.
    const legendary = source.name === 'Legendary Gem of Many Facets'
    const available = source.setBonus?.map(({ name }) =>
      legendary ? name.replace(/^The Epic Desert's /, "The Legendary Desert's ") : name
    )
    const pools = known ?? [1, 2].map((n) => ({ label: 'Random set ' + String(n), setBonuses: available ?? [] }))
    pools.forEach((pool, i) => {
      const names = available ? available.filter((name) => pool.setBonuses.includes(name)) : pool.setBonuses
      if (names.length)
        groups.push({
          system: 'gem-set-' + String(i + 1),
          label: pool.label,
          choices: [...new Set(names)].sort().map(setChoice)
        })
    })
  }

  const type = source.type ?? ''
  const mythic = rules.mythic.find(
    (r) => r.slots.includes(item.slot) && (!r.types.length || r.types.some((t) => type.includes(t)))
  )
  if (mythic)
    groups.push({
      system: 'mythic',
      label: 'Mythic Boost',
      choices: mythic.magnitudes.map((amount) => ({
        id: String(amount),
        label: '+' + String(amount),
        effects: mythic.bonuses.map((name) => ({ name, modifier: amount, bonus: 'Mythic' }))
      }))
    })
  const reaper = rules.reaper.filter((r) => r.allowedSlots.includes(item.slot))
  if (reaper.length)
    groups.push({
      system: 'reaper-forge',
      label: 'Reaper Forge',
      choices: reaper.map((r) => ({
        id: r.id,
        label: r.name,
        effects: r.grants.map((g) => ({
          name: g.stat,
          modifier: 'unit' in g && g.unit === 'percent' ? String(g.modifier) + '%' : g.modifier,
          bonus: 'Reaper'
        }))
      }))
    })
  return groups
}

export function applyGearCraft(item: GearPlannerItem, group: CraftGroup, choiceId: string | null): GearPlannerItem {
  const current = item.crafts ?? []
  const remaining = current.filter((c) => c.system !== group.system)
  if (choiceId === null) return remaining.length === current.length ? item : { ...item, crafts: remaining }
  const choice = group.choices.find((c) => c.id === choiceId)
  if (
    !choice ||
    current.some((c) => c.system === group.system && c.id === choiceId) ||
    (group.system.startsWith('gem-set-') && remaining.some((c) => c.setName === choice.setName))
  )
    return item
  return {
    ...item,
    crafts: [...remaining, { ...choice, system: group.system, replacesEnchantments: group.replacesEnchantments }]
  }
}
