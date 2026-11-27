import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset'
import {
  adaptItemCategory,
  catalogIconIndex,
  catalogSocket,
  effectIndex,
  resolveEffects,
  spellIndex
} from '../gearPlanner/itemCatalog'
import type { GearPlannerAugmentSlot, GearPlannerEffect, GearPlannerSourceItem } from '../gearPlanner/gearPlanner.types'

export const thunderStages = ['tier1', 'tier2', 'tier3', 'flawlessArmor'] as const
export type ThunderStage = (typeof thunderStages)[number]
export const thunderStageLabels: Record<ThunderStage, string> = {
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
  flawlessArmor: 'Flawless Armor'
}
export const thunderDomain = 'thunder-forged'
export type ThunderSelection = Partial<Record<ThunderStage, number>>

interface Ingredient {
  id: number
  name: string
  quantity: number
}

interface Mutation {
  id: number
  effects: readonly GearPlannerEffect[]
  socket?: GearPlannerAugmentSlot
  minimumLevel?: number
}

interface ThunderRecipe {
  id: number
  name: string
  description: string
  stage: ThunderStage
  requires: readonly number[]
  removes: readonly number[]
  adds: readonly Mutation[]
  costs: readonly Ingredient[]
  spell: readonly GearPlannerEffect[]
  binds: boolean
  notes: readonly string[]
}

export interface ThunderBase {
  id: number
  source: GearPlannerSourceItem
  fileName: string
  kind: 'weapon' | 'armor'
  minimumLevel: number
  mutations: readonly Mutation[]
  sockets: ReadonlyMap<number, GearPlannerAugmentSlot>
  costs: readonly Ingredient[]
  recipes: readonly ThunderRecipe[]
}

export interface ThunderData {
  bases: ReadonlyMap<number, ThunderBase>
  device: string
}

type RecordRow = Record<string, unknown>
function invalid(detail: string): never {
  throw new Error('Invalid Thunder-Forged data: ' + detail)
}
function record(value: unknown, label: string): RecordRow {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as RecordRow
  return invalid(label)
}
function records(value: unknown, label: string) {
  if (!Array.isArray(value)) return invalid(label)
  return value.map((entry: unknown) => record(entry, label))
}
function text(value: unknown, label: string) {
  return typeof value === 'string' && value.trim() ? value : invalid(label)
}
function positive(value: unknown, label: string) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : invalid(label)
}
function ids(value: unknown, label: string) {
  if (!Array.isArray(value)) return invalid(label)
  return value.map((entry: unknown) => positive(entry, label))
}

export function buildThunderData(
  raw: { bases: unknown; effects: unknown; ingredients: unknown; recipes: unknown; spells: unknown; icons: unknown },
  device: string
): ThunderData {
  const spellMap = spellIndex(raw.spells)
  const index = effectIndex(raw.effects)
  const mutations = new Map(
    records(raw.effects, 'effects').map((effect): [number, Mutation] => {
      const id = positive(effect.id, 'effect ID')
      const name = typeof effect.displayName === 'string' ? effect.displayName : ''
      const requirement = /^Required Level: (\d+)$/.exec(name)
      const socket = effect.slotTypes ? catalogSocket({ ...effect, name, types: effect.slotTypes }) : undefined
      const damageDice =
        name === 'Increased Weapon Damage'
          ? records(effect.enchantments, name).find((stat) => stat.name === 'BaseWeaponDamageDiceModifier')?.value
          : undefined
      const effects =
        typeof damageDice === 'number'
          ? [{ name: 'Weapon Damage Dice', modifier: `+${String(damageDice)}[W]`, bonus: 'Unique' }]
          : (index.get(String(id)) ?? []).filter((row) => !/^Thunder-Forged \(Tier \d\)$/.test(row.name))
      return [id, { id, effects, socket, minimumLevel: requirement ? Number(requirement[1]) : undefined }]
    })
  )
  const ingredients = new Map(
    records(raw.ingredients, 'ingredients').map((entry) => [
      positive(entry.id, 'ingredient ID'),
      text(entry.name, 'ingredient name')
    ])
  )
  const costs = (recipe: RecordRow) =>
    records(recipe.ingredients, 'recipe ingredients').map((entry) => {
      const id = positive(entry.ingredientId, 'recipe ingredient ID')
      const name = ingredients.get(id) ?? invalid('unknown ingredient ' + String(id))
      return { id, name, quantity: positive(entry.quantity, name + ' quantity') }
    })
  const mutation = (id: number) => mutations.get(id) ?? invalid('unknown effect ' + String(id))
  const upgrades = new Map<number, ThunderRecipe[]>()
  const forgeCosts = new Map<number, Ingredient[]>()
  for (const recipe of records(raw.recipes, 'recipes')) {
    if (recipe.device !== 'magmaForge') continue
    if (recipe.stage === 'baseItem') {
      forgeCosts.set(positive(recipe.outputItemId, 'base recipe output'), costs(recipe))
      continue
    }
    const stage = thunderStages.find((candidate) => candidate === recipe.stage)
    if (!stage || recipe.category !== 'upgrade') invalid('unrecognized recipe stage')
    const name = text(recipe.name, 'recipe name')
    const keeper = record(recipe.keeper, name + ' keeper')
    const spell =
      recipe.resultSpell === undefined ? [] : resolveEffects({ spell: recipe.resultSpell }, name, index, spellMap)
    const option: ThunderRecipe = {
      id: positive(recipe.id, name + ' ID'),
      name,
      stage,
      description: text(recipe.description, name + ' description'),
      requires: ids(keeper.requiredMutationIds, name + ' required mutations'),
      removes: ids(recipe.removeMutationIds, name + ' removed mutations'),
      adds: ids(recipe.addEffectIds, name + ' added effects').map(mutation),
      costs: costs(recipe),
      spell,
      binds: recipe.bindKeeper === true,
      notes: records(recipe.knownDiscrepancies ?? [], name + ' discrepancies').map((entry) =>
        text(entry.resolved, name + ' resolved effect')
      )
    }
    for (const id of ids(keeper.itemIds, name + ' keeper IDs')) {
      const entries = upgrades.get(id) ?? []
      entries.push(option)
      upgrades.set(id, entries)
    }
  }
  const bases = new Map<number, ThunderBase>()
  const baseRows = records(raw.bases, 'base items').map((item): RecordRow => ({
    ...item,
    // Both clothing pieces use the generic Cloth type in the forge feed.
    itemType: item.itemType === 'Cloth' ? (String(item.name).endsWith(' Robe') ? 'Robe' : 'Outfit') : item.itemType
  }))
  const sources = new Map(
    adaptItemCategory(baseRows, raw.effects, catalogIconIndex(raw.icons), spellMap).flatMap((dataset) =>
      dataset.records.map((source) => [source.catalogId, { source, fileName: dataset.fileName }] as const)
    )
  )
  for (const item of baseRows) {
    const id = positive(item.id, 'base ID')
    const { source, fileName } = sources.get(id) ?? invalid('base item ' + String(id))
    const baseMutations = records(item.effects, source.name + ' effects').map(({ effectId }) =>
      mutation(positive(effectId, 'base effect ID'))
    )
    const sockets = new Map(
      records(item.augmentSlots ?? [], source.name + ' sockets').map((slot) => [
        positive(slot.effectId, 'base socket ID'),
        catalogSocket(slot)
      ])
    )
    bases.set(id, {
      id,
      source,
      fileName,
      kind: item.type === 'Armor' ? 'armor' : 'weapon',
      minimumLevel: positive(item.minimumLevel, source.name + ' level'),
      mutations: baseMutations,
      sockets,
      costs: forgeCosts.get(id) ?? invalid(source.name + ' forge recipe'),
      recipes: upgrades.get(id) ?? []
    })
  }
  if (!bases.size) invalid('no base items')
  return { bases, device }
}

export function resolveThunderPlan(base: ThunderBase, selection: ThunderSelection) {
  const active = new Map<number, { mutation: Mutation; stage?: ThunderStage }>(
    base.mutations.map((entry) => [entry.id, { mutation: entry }])
  )
  const sockets = new Map(base.sockets)
  const choices: Partial<Record<ThunderStage, ThunderRecipe[]>> = {}
  const selected: ThunderRecipe[] = []
  const stages: readonly ThunderStage[] = base.kind === 'armor' ? ['flawlessArmor'] : thunderStages.slice(0, 3)
  let minimumLevel = base.minimumLevel
  for (const stage of stages) {
    const options = base.recipes.filter(
      (recipe) => recipe.stage === stage && recipe.requires.every((id) => active.has(id))
    )
    choices[stage] = options.toSorted((a, b) => a.name.localeCompare(b.name))
    const recipe = options.find((entry) => entry.id === selection[stage])
    if (!recipe) break
    selected.push(recipe)
    for (const id of recipe.removes) {
      active.delete(id)
      sockets.delete(id)
    }
    for (const mutation of recipe.adds) {
      active.set(mutation.id, { mutation, stage })
      if (mutation.socket) sockets.set(mutation.id, mutation.socket)
      minimumLevel = Math.max(minimumLevel, mutation.minimumLevel ?? 0)
    }
  }
  const effectGroups = Map.groupBy(active.values(), ({ stage }) => stage)
  const effectsAt = (stage?: ThunderStage) =>
    (effectGroups.get(stage) ?? []).flatMap(({ mutation }) =>
      mutation.effects.filter((effect) => base.kind === 'armor' || effect.name !== 'Armor Check Penalty')
    )
  const baseEffects = effectsAt()
  const upgrades = selected.map((recipe) => ({
    recipe,
    effects: [...effectsAt(recipe.stage), ...recipe.spell]
  }))
  const costs = new Map<number, Ingredient>()
  for (const ingredient of [...base.costs, ...selected.flatMap((recipe) => recipe.costs)]) {
    const quantity = (costs.get(ingredient.id)?.quantity ?? 0) + ingredient.quantity
    costs.set(ingredient.id, { ...ingredient, quantity })
  }
  return {
    stages,
    choices,
    selected,
    baseEffects,
    upgrades,
    minimumLevel,
    sockets: [...sockets.values()],
    costs: [...costs.values()].sort((a, b) => a.name.localeCompare(b.name))
  }
}

export function thunderSelection(recipes: readonly { stage: ThunderStage; id: number }[]): ThunderSelection {
  return Object.fromEntries(recipes.map(({ stage, id }) => [stage, id]))
}

async function loadCatalog() {
  if (!(await hasDatasetFile(thunderDomain + '/manifest.json'))) return undefined
  const manifest = record(await loadDatasetFile<unknown>(thunderDomain + '/manifest.json'), 'manifest')
  if (manifest.system !== thunderDomain) invalid('manifest system')
  const resources = record(manifest.resources, 'manifest resources')
  const device = record(record(manifest.devices, 'manifest devices').magmaForge, 'Magma Forge device')
  const read = (key: string) => {
    const path = text(resources[key], 'resource ' + key)
    if (!/^[\w-]+\.json$/.test(path)) invalid('resource ' + key)
    return loadDatasetFile<unknown>(thunderDomain + '/' + path)
  }
  const [bases, effects, recipes, ingredients, spells, icons] = await Promise.all(
    ['baseItems', 'effects', 'recipes', 'ingredients', 'spells', 'icons'].map(read)
  )
  return buildThunderData({ bases, effects, recipes, ingredients, spells, icons }, text(device.name, 'device name'))
}

let pending: ReturnType<typeof loadCatalog> | undefined
export function loadOptionalThunderData() {
  pending ??= loadCatalog().catch((error: unknown) => {
    pending = undefined
    throw error
  })
  return pending
}
