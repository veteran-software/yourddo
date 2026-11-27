import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset'
import type { GearPlannerItem, GearPlannerSourceDataset, GearPlannerSourceItem } from './gearPlanner.types'
import {
  adaptItemCategory,
  catalogIconIndex,
  craftingMutationEffectIndex,
  resolveEffects,
  spellIndex
} from './itemCatalog'

const domain = 'suppressed-power'

interface Mutation {
  effectId: number
  variant?: string
}

interface Roll {
  baseStats?: Record<string, unknown>
  effects?: Mutation[]
}

interface NativeItem extends Record<string, unknown> {
  id: number
  name: string
  baseStats: Record<string, unknown>
  effects: Mutation[]
  rolls?: { options: Roll[] }[]
}

type UpgradeRecipe =
  | {
      id: number
      category: 'upgrade'
      name: string
      stage: string
      keeper: { itemId: number; requiredMutationIds: number[] }
      removeMutationIds: number[]
      addEffectIds: number[]
      resultBinding?: { scope: string; on: string }
      resultMinimumLevel?: number
    }
  | {
      category: 'tradeIn'
      stage: string
      outputItemId: number
      ingredients: { itemId?: number }[]
    }

type NativeRecipe = UpgradeRecipe | { category: 'component'; stage: string }

export async function loadOptionalSuppressedPower() {
  const path = domain + '/manifest.json'
  if (!(await hasDatasetFile(path))) return undefined
  const manifest = await loadDatasetFile<{ system: string; resources: Record<string, string> }>(path)
  if (manifest.system !== domain) throw new Error('Invalid Suppressed Power manifest')
  const read = <T>(key: string) => {
    const file = manifest.resources[key]
    if (typeof file !== 'string' || !/^[\w.-]+\.json$/.test(file))
      throw new Error('Invalid Suppressed Power resource: ' + key)
    return loadDatasetFile<T>(domain + '/' + file)
  }
  const [bases, recipes, effects, spells, icons] = await Promise.all([
    read<NativeItem[]>('baseItems'),
    read<NativeRecipe[]>('recipes'),
    read('effects'),
    read('spells'),
    read('icons')
  ])
  return { bases, recipes, effects, spells: spellIndex(spells), icons: catalogIconIndex(icons) }
}

function chooseMutations(base: NativeItem, required: readonly number[]) {
  const effectIds = new Set(base.effects.map(({ effectId }) => effectId))
  const extra = required.filter((id) => !effectIds.has(id))
  const roll = extra.length
    ? base.rolls
        ?.flatMap(({ options }) => options)
        .find(({ effects }) => extra.every((id) => effects?.some(({ effectId }) => effectId === id)))
    : undefined
  if (extra.length && !roll) throw new Error('Missing required Suppressed Power mutations for ' + base.name)
  return {
    effects: [...base.effects, ...(roll?.effects ?? [])],
    roll
  }
}

export function prepareSuppressedPower(
  datasets: readonly GearPlannerSourceDataset[],
  data: Awaited<ReturnType<typeof loadOptionalSuppressedPower>>
) {
  const destinations = new Map<number, GearPlannerSourceItem[]>()
  if (!data) return { datasets, destinations }
  const sources = new Map<number, { fileName: string; source: GearPlannerSourceItem }>()
  function index(group: readonly GearPlannerSourceDataset[]) {
    for (const { fileName, records } of group)
      for (const source of records)
        if (source.catalogId !== undefined) sources.set(source.catalogId, { fileName, source })
  }
  index(datasets)
  const missing = adaptItemCategory(
    data.bases.filter(({ id }) => !sources.has(id)),
    data.effects,
    data.icons,
    data.spells
  )
  index(missing)
  const bases = new Map(data.bases.map((base) => [base.id, base]))
  const mutations = craftingMutationEffectIndex(data.effects)
  const added = new Map<string, GearPlannerSourceItem[]>()
  const recipes = data.recipes.filter(
    (recipe): recipe is UpgradeRecipe => recipe.category !== 'component' && recipe.stage === 'unlockPower'
  )
  const upgradesByBase = Map.groupBy(
    recipes.filter((recipe) => recipe.category === 'upgrade'),
    (recipe) => recipe.keeper.itemId
  )
  for (const recipe of recipes) {
    if (recipe.category === 'tradeIn') {
      const input = recipe.ingredients.find(({ itemId }) => itemId !== undefined)?.itemId
      const target = sources.get(recipe.outputItemId)?.source
      if (input === undefined || !target) throw new Error('Missing Suppressed Power trade-in item')
      destinations.set(input, [...(destinations.get(input) ?? []), target])
      continue
    }
    const { itemId, requiredMutationIds } = recipe.keeper
    const base = bases.get(itemId)
    const entry = sources.get(itemId)
    if (!base || !entry) throw new Error('Missing Suppressed Power base item ' + String(itemId))
    const { effects, roll } = chooseMutations(base, requiredMutationIds)
    const active = new Map(
      effects.filter(({ effectId }) => !recipe.removeMutationIds.includes(effectId)).map((ref) => [ref.effectId, ref])
    )
    for (const effectId of recipe.addEffectIds) active.set(effectId, { effectId })
    const title = (upgradesByBase.get(itemId)?.length ?? 0) > 1 ? recipe.name.replace(/ Upgrade$/, '') : base.name
    const name = title + ' (Unsuppressed)'
    const binding = recipe.resultBinding
    const retainedRollStats = roll?.effects?.some(({ effectId }) => active.has(effectId)) ? roll.baseStats : undefined
    const replacement: GearPlannerSourceItem = {
      ...entry.source,
      catalogId: undefined,
      suppressedPowerRecipeId: recipe.id,
      name,
      pageTitle: name,
      minLevel: recipe.resultMinimumLevel ?? entry.source.minLevel,
      ...(recipe.resultMinimumLevel !== undefined && { absoluteMinLevel: recipe.resultMinimumLevel }),
      ...(binding && { binding: { to: binding.scope, type: binding.on } }),
      baseStats: { ...base.baseStats, ...retainedRollStats, ...(binding && { binding }) },
      damageOutcomes: undefined,
      enchantments: resolveEffects({ ...base, effects: [...active.values()] }, name, mutations, data.spells)
    }
    destinations.set(itemId, [...(destinations.get(itemId) ?? []), replacement])
    added.set(entry.fileName, [...(added.get(entry.fileName) ?? []), replacement])
  }
  return {
    datasets: [...datasets, ...missing, ...Array.from(added, ([fileName, records]) => ({ fileName, records }))],
    destinations
  }
}

export function suppressedPowerUpgradeItems(
  items: readonly GearPlannerItem[],
  destinations: ReadonlyMap<number, readonly GearPlannerSourceItem[]>
) {
  const targets = new Set([...destinations.values()].flat())
  const bySource = Map.groupBy(
    items.filter(({ source }) => targets.has(source)),
    ({ source }) => source
  )
  const upgrades = new Map<string, GearPlannerItem[]>()
  for (const item of items) {
    if (item.source.catalogId === undefined) continue
    const choices = destinations
      .get(item.source.catalogId)
      ?.flatMap((source) => (bySource.get(source) ?? []).filter(({ slot }) => slot === item.slot))
    if (choices?.length) upgrades.set(item.id, choices)
  }
  return upgrades
}
