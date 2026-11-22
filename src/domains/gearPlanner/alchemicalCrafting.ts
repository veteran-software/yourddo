import { alchemicalPlanPath } from '../alchemical/sharing'
import {
  alchemicalStages,
  resolveAlchemicalPlan,
  type AlchemicalBase,
  type AlchemicalData,
  type AlchemicalEffect,
  type AlchemicalStage
} from '../alchemical/data'
import type { CraftGroup, EquippedCraft } from './crafting'
import type { GearPlannerEffect, GearPlannerItem, GearPlannerSourceItem } from './gearPlanner.types'
import { gearPlannerItemSources } from './sourceMapping'

export const alchemicalItemKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
const fileByType = new Map(
  Object.keys(gearPlannerItemSources).map((file) => [file.replace('.json', '').toLowerCase(), file])
)
function baseSourceFile(base: AlchemicalBase) {
  if (base.type !== 'Shield') return fileByType.get(alchemicalItemKey(base.weaponType ?? ''))
  const type = base.name
    .replace(/^(?:Legendary )?Alchemical /, '')
    .replace('Light Shield', 'Small Shield')
    .replace('Heavy Shield', 'Large Shield')
  return fileByType.get(alchemicalItemKey(type))
}

const stageLabels = { material: 'Material binding', tier1: 'Tier 1', tier2: 'Tier 2', tier3: 'Tier 3' }
const system = (stage: AlchemicalStage) => 'alchemical-' + stage
export const alchemicalStageOrder = (systemName: string) =>
  alchemicalStages.findIndex((stage) => system(stage) === systemName)

function selectionFor(item: GearPlannerItem) {
  const result: Partial<Record<AlchemicalStage, number>> = {}
  for (const stage of alchemicalStages) {
    const craft = item.crafts?.find((c) => c.system === system(stage))
    if (craft) result[stage] = Number(craft.id)
  }
  return result
}

export function alchemicalRecipeHref(item: GearPlannerItem) {
  if (!item.alchemical) return undefined
  const ids = Object.values(selectionFor(item))
  return alchemicalPlanPath(item.alchemical.base.id, ids)
}

export function alchemicalCraftGroups(item: GearPlannerItem, data: AlchemicalData): CraftGroup[] {
  if (!item.alchemical) return []
  const plan = resolveAlchemicalPlan(data, item.alchemical.base, selectionFor(item))
  return alchemicalStages
    .filter((stage) => plan.choices[stage].length)
    .map((stage) => ({
      system: system(stage),
      label: 'Alchemical · ' + stageLabels[stage],
      choices: plan.choices[stage].map((recipe) => ({ id: String(recipe.id), label: recipe.name }))
    }))
}

// The equipment index expands an enhancement bonus into the stats of the host.
function gearEffects(effect: AlchemicalEffect, base: AlchemicalBase): GearPlannerEffect[] {
  if (effect.augmentTypes.length) return []
  const stats = effect.stats.flatMap((stat) => {
    if (stat.stat === 'Orb Bonus') {
      return [
        'Fortitude Save',
        'Reflex Save',
        'Will Save',
        'Acid Resistance',
        'Cold Resistance',
        'Electric Resistance',
        'Fire Resistance',
        'Sonic Resistance'
      ].map((name) => ({ name, bonus: stat.bonusType, modifier: stat.value, notes: effect.description }))
    }
    if (stat.stat === 'Enhancement Bonus') {
      const names =
        base.type === 'Shield'
          ? ['Armor Class', 'Attack Rolls (Shield)', 'Damage Rolls (Shield)']
          : ['Attack Rolls', 'Damage Rolls']
      return names.map((name) => ({ name, bonus: 'Enhancement', modifier: stat.value }))
    }
    return [
      {
        name: stat.stat,
        bonus: stat.bonusType,
        modifier: stat.formattedValue === String(stat.value) ? stat.value : stat.formattedValue
      }
    ]
  })
  return stats.length ? stats : [{ name: effect.name, notes: effect.description }]
}

function sockets(effects: readonly AlchemicalEffect[]) {
  return effects.flatMap((effect) => {
    const color = effect.augmentTypes.at(-1)
    return color ? [{ augmentType: color, name: effect.name }] : []
  })
}

export function syntheticAlchemicalItem(base: AlchemicalBase) {
  const fileName = baseSourceFile(base)
  if (!fileName) return
  const kind = fileName.slice(0, -5).replace(/([A-Z])/g, ' $1')
  const type = kind[0].toUpperCase() + kind.slice(1)
  const source: GearPlannerSourceItem = {
    name: base.name,
    pageTitle: base.name,
    minLevel: base.minimumLevel,
    type,
    material: base.material,
    description: base.description,
    dropLocations: base.sources.map((sourceType) => ({ sourceType }))
  }
  return { fileName, source }
}

function effectKey(effect: GearPlannerEffect) {
  return [effect.name, effect.bonus ?? '', String(effect.modifier ?? '')].join('|')
}
export function attachAlchemicalBase(item: GearPlannerItem, base: AlchemicalBase) {
  const enchantments = (item.source.enchantments ?? []).filter((e) => !e.name.endsWith('(Prototype)'))
  const existing = new Set(enchantments.map(effectKey))
  const all = [...enchantments]
  for (const effect of base.effects.flatMap((e) => gearEffects(e, base))) {
    const key = effectKey(effect)
    if (!existing.has(key)) {
      existing.add(key)
      all.push(effect)
    }
  }
  const source = {
    ...item.source,
    enchantments: all,
    augments: item.source.augments?.length ? item.source.augments : sockets(base.effects)
  }
  return { ...item, source, alchemical: { base, source }, minimumLevel: base.minimumLevel }
}

export function applyAlchemicalRecipe(
  item: GearPlannerItem,
  group: CraftGroup,
  choiceId: string | null,
  data: AlchemicalData
) {
  const host = item.alchemical
  const stage = alchemicalStages.find((s) => system(s) === group.system)
  if (!host || !stage) return item
  const selected = selectionFor(item)
  if (choiceId === null) {
    if (selected[stage] === undefined) return item
    selected[stage] = undefined
  } else {
    if (!group.choices.some((choice) => choice.id === choiceId) || selected[stage] === Number(choiceId)) return item
    selected[stage] = Number(choiceId)
  }
  const plan = resolveAlchemicalPlan(data, host.base, selected)
  const ownerByEffect = new Map(plan.selected.flatMap((r) => r.effects.map((e) => [e.id, r.id] as const)))
  const active = new Set(plan.effects.map((e) => e.id))
  const crafts: EquippedCraft[] = plan.selected.map((recipe) => ({
    system: system(recipe.stage),
    id: String(recipe.id),
    label: recipe.name,
    effects: recipe.effects
      .filter((e) => active.has(e.id) && ownerByEffect.get(e.id) === recipe.id)
      .flatMap((e) => gearEffects(e, host.base))
  }))
  const removed = new Set(plan.removedBaseEffects.flatMap((e) => gearEffects(e, host.base)).map(effectKey))
  const removedSockets = new Set(sockets(plan.removedBaseEffects).map((s) => s.augmentType))
  const source = {
    ...host.source,
    enchantments: host.source.enchantments?.filter((e) => !removed.has(effectKey(e))),
    material: plan.selected.find((r) => r.stage === 'material')?.material ?? host.source.material,
    augments: [
      ...(host.source.augments ?? []).filter((s) => !removedSockets.has(s.augmentType)),
      ...sockets(plan.effects)
    ]
  }
  return {
    ...item,
    minimumLevel: plan.minimumLevel,
    source,
    crafts: [...(item.crafts ?? []).filter((c) => alchemicalStageOrder(c.system) < 0), ...crafts]
  }
}
