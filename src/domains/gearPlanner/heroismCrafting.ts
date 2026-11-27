import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset'
import type { CraftGroup, CraftingMaterial, EquippedCraft } from './crafting'
import type {
  GearPlannerAugmentSlot,
  GearPlannerEffect,
  GearPlannerItem,
  GearPlannerSetBonus,
  GearPlannerSourceDataset
} from './gearPlanner.types'
import { adaptItemSetDefinitions, catalogSocket, craftingMutationEffectIndex, resolveEffects } from './itemCatalog'

const domain = 'attuned-to-heroism'
const stages = ['heroismTier1', 'heroismTier2', 'heroismTier3', 'heroismTier4']
const stageSystem = (stage: string) => domain + '-' + stage
export const heroismStageOrder = (name: string) => stages.findIndex((stage) => stageSystem(stage) === name)

interface EffectRef {
  effectId: number
  variant?: string
}

interface NativeBase {
  id: number
  effects: EffectRef[]
  augmentSlots?: { effectId: number; name: string; types: string[] }[]
  equipmentSets?: { id: number; name: string }[]
}

interface NativeRecipe {
  id: number
  stage: string
  description: string
  keeper?: { itemId: number; requiredMutationIds: number[] }
  addEffectIds?: number[]
  removeMutationIds?: number[]
  effectVariants?: Record<number, string>
  setIds?: number[]
  ingredients?: { ingredientId: number; quantity: number }[]
}

interface Mutation {
  id: number
  label?: string
  effects: readonly GearPlannerEffect[]
  socket?: GearPlannerAugmentSlot
}

interface Recipe {
  id: string
  label: string
  stage: string
  requires: readonly number[]
  removes: readonly number[]
  materials?: readonly CraftingMaterial[]
  adds: readonly Mutation[]
  sets: readonly GearPlannerSetBonus[]
}

interface HeroismBase {
  mutations: readonly Mutation[]
  stages: ReadonlyMap<string, Recipe[]>
}

function readHeroismData(
  bases: NativeBase[],
  recipes: NativeRecipe[],
  rawEffects: unknown,
  rawSets: unknown,
  ingredients?: { id: number; name: string }[]
) {
  const materialNames = ingredients && new Map(ingredients.map(({ id, name }) => [id, name]))
  const index = craftingMutationEffectIndex(rawEffects)
  const definitions = new Map(adaptItemSetDefinitions(rawSets, index))
  const metadata = new Map(
    (rawEffects as { id: number; displayName?: string; slotTypes?: string[] }[]).map((effect) => [effect.id, effect])
  )
  const spells = new Map<string, GearPlannerEffect>()
  function mutation(ref: EffectRef): Mutation {
    const effect = metadata.get(ref.effectId)
    const effects = resolveEffects({ effects: [ref] }, domain, index, spells)
    const label = effect?.displayName ?? effects[0]?.name
    if (/^Attuned (?:to|by) Heroism\b/.test(label ?? '')) return { id: ref.effectId, effects: [] }
    const socket = effect?.slotTypes && catalogSocket({ name: effect.displayName, types: effect.slotTypes })
    return { id: ref.effectId, label, effects, socket }
  }
  const items = new Map<number, HeroismBase>()
  const recipesByItem = Map.groupBy(recipes, (recipe) => recipe.keeper?.itemId)
  for (const base of bases) {
    const upgrades = recipesByItem.get(base.id)
    if (!upgrades) continue
    const mutations = [
      ...base.effects.map(mutation),
      ...(base.augmentSlots ?? []).map((slot) => ({ id: slot.effectId, effects: [], socket: catalogSocket(slot) }))
    ]
    const staged = upgrades.map((recipe): Recipe => {
      const adds = (recipe.addEffectIds ?? []).map((effectId) =>
        mutation({ effectId, variant: recipe.effectVariants?.[effectId] })
      )
      const materials =
        materialNames &&
        recipe.ingredients?.map(({ ingredientId: id, quantity }) => {
          const name = materialNames.get(id)
          if (!name) throw new Error('Missing Attuned to Heroism ingredient ' + String(id))
          return { id, name, quantity }
        })
      return {
        id: String(recipe.id),
        materials,
        label: adds.find(({ socket }) => socket)?.label ?? adds.find(({ label }) => label)?.label ?? recipe.description,
        stage: recipe.stage,
        requires: recipe.keeper?.requiredMutationIds ?? [],
        removes: recipe.removeMutationIds ?? [],
        adds,
        sets: (recipe.setIds ?? []).map((id) => {
          const set = definitions.get(id)
          if (!set) throw new Error('Missing Attuned to Heroism set ' + String(id))
          return { id, name: set.name }
        })
      }
    })
    items.set(base.id, { mutations, stages: Map.groupBy(staged, (recipe) => recipe.stage) })
  }
  const upgradeSetIds = new Set(recipes.flatMap((recipe) => recipe.setIds ?? []))
  const memberships = new Map(bases.flatMap(({ id, equipmentSets }) => (equipmentSets ? [[id, equipmentSets]] : [])))
  return { items, definitions, upgradeSetIds, memberships }
}

export type HeroismData = ReturnType<typeof readHeroismData>

export async function loadOptionalHeroismData() {
  const path = domain + '/manifest.json'
  if (!(await hasDatasetFile(path))) return undefined
  const manifest = await loadDatasetFile<{ system: string; resources: Record<string, string> }>(path)
  if (manifest.system !== domain) throw new Error('Unexpected upgrade system ' + manifest.system)
  const read = <T>(key: string) => loadDatasetFile<T>(domain + '/' + manifest.resources[key])
  return readHeroismData(
    ...(await Promise.all([
      read<NativeBase[]>('baseItems'),
      read<NativeRecipe[]>('recipes'),
      read('effects'),
      read('equipmentSets'),
      manifest.resources.ingredients ? read<{ id: number; name: string }[]>('ingredients') : undefined
    ]))
  )
}

function resolveHeroism(base: HeroismBase, selection: ReadonlyMap<string, string>) {
  const mutations = new Map(base.mutations.map((mutation) => [mutation.id, { mutation, recipeId: '' }]))
  const groups: CraftGroup[] = []
  const selected: Recipe[] = []
  for (const [tier, stage] of stages.entries()) {
    const choices = base.stages.get(stage)?.filter((recipe) => recipe.requires.every((id) => mutations.has(id)))
    if (!choices?.length) break
    const key = stageSystem(stage)
    groups.push({
      system: key,
      label: 'Attuned to Heroism · Tier ' + String(tier + 1),
      choices: choices.map(({ id, label }) => ({ id, label }))
    })
    const recipe = choices.find(({ id }) => id === selection.get(key))
    if (!recipe) break
    selected.push(recipe)
    for (const id of recipe.removes) mutations.delete(id)
    for (const mutation of recipe.adds) mutations.set(mutation.id, { mutation, recipeId: recipe.id })
  }
  const active = [...mutations.values()]
  const source = {
    enchantments: active.flatMap(({ mutation, recipeId }) => (recipeId ? [] : mutation.effects)),
    augments: active.flatMap(({ mutation }) => (mutation.socket ? [mutation.socket] : []))
  }
  const crafts: EquippedCraft[] = selected.map((recipe) => ({
    system: stageSystem(recipe.stage),
    id: recipe.id,
    label: recipe.label,
    materials: recipe.materials,
    effects: active.flatMap(({ mutation, recipeId }) => (recipeId === recipe.id ? mutation.effects : []))
  }))
  return { source, groups, crafts, sets: selected.flatMap((recipe) => recipe.sets) }
}

function selectionFor(item: GearPlannerItem) {
  return new Map(item.crafts?.map(({ system, id }) => [system, id]))
}

export function heroismCraftGroups(item: GearPlannerItem, data: HeroismData) {
  const base = data.items.get(item.source.catalogId ?? 0)
  return base ? resolveHeroism(base, selectionFor(item)).groups : []
}

export function applyHeroismRecipe(item: GearPlannerItem, group: CraftGroup, choice: string | null, data: HeroismData) {
  const base = data.items.get(item.source.catalogId ?? 0)
  const selection = selectionFor(item)
  if (!base || (selection.get(group.system) ?? null) === choice) return item
  if (choice === null) selection.delete(group.system)
  else if (group.choices.some(({ id }) => id === choice)) selection.set(group.system, choice)
  else return item
  const { source, crafts, sets } = resolveHeroism(base, selection)
  const baseSets = item.source.setBonus?.filter(({ id }) => id === undefined || !data.upgradeSetIds.has(id)) ?? []
  return {
    ...item,
    source: { ...item.source, ...source, setBonus: [...baseSets, ...sets] },
    crafts: [...(item.crafts ?? []).filter(({ system }) => heroismStageOrder(system) < 0), ...crafts]
  }
}

export function prepareHeroismBases(datasets: readonly GearPlannerSourceDataset[], data: HeroismData) {
  const bases = new Map([...data.items].map(([id, base]) => [id, resolveHeroism(base, new Map()).source]))
  return datasets.map((dataset) => ({
    ...dataset,
    records: dataset.records.map((record) => {
      const id = record.catalogId ?? 0
      const base = bases.get(id)
      const memberships = data.memberships.get(id)
      if (!base && !memberships) return record
      const existingSets = record.setBonus ?? []
      const addedSets =
        memberships?.filter((added) => !existingSets.some((set) => set.id === added.id || set.name === added.name)) ??
        []
      return { ...record, ...base, setBonus: [...existingSets, ...addedSets] }
    })
  }))
}
