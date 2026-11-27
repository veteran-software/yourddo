import { loadDatasetFile } from '../../shared/data/loadDataset'
import type { NearlyCompleteDataset } from '../nearlyComplete/data'
import type { NearlyCompleteRecipe } from '../nearlyComplete/recipes'
import type { NearlyFinishedDataset, ReforgingEntry } from '../nearlyFinished/nearlyFinished.types'
import type { CraftChoice, CraftingMaterial } from './crafting'
import type { GearPlannerAugmentSlot, GearPlannerEffect } from './gearPlanner.types'
import { effectIndex, resolveEffects, spellIndex } from './itemCatalog'

interface Named {
  id: number
  name: string
}
interface EffectRef {
  effectId: number
  variant?: string
}
interface SpellRef {
  spellId: number
  variant?: string
}
interface Base extends Named {
  minimumLevel: number
  itemType: string
  weaponType?: string
  effects: EffectRef[]
  spell?: SpellRef
}
interface Recipe extends Named {
  hostDiscrepancies?: Record<number, { stated: number; resolved: number; unit: string }[]>

  category: string
  stage?: string
  device: string
  quantity?: number
  outputItemId?: number
  ingredients: { ingredientId?: number; itemId?: number; quantity: number }[]
  addEffectIds?: number[]
  removeMutationIds?: number[]
  effectVariants?: Record<number, string>
  hostEffectVariants?: Record<number, Record<number, string>>
  keeper?: { itemId?: number; itemIds?: number[]; ingredientType?: string; requiredMutationIds?: number[] }
  resultSpell?: SpellRef
  resultChargePool?: { charges: number; rechargesPerDay: number }
  augmentSlotTypes?: string[]
}
interface EffectRecord {
  id: number
  displayName?: string
  hidden?: boolean
  equipmentSetId?: number
  variants?: { variant: string; displayName?: string; hidden?: boolean }[]
}
export interface NativeEffectGroup {
  id: number
  effects: GearPlannerEffect[]
  setName?: string
}
export interface NativeMutation {
  name: string
  materials?: readonly CraftingMaterial[]
  added: NativeEffectGroup[]
  removeIds: number[]
  slot?: GearPlannerAugmentSlot
}
export interface NativeStage {
  keeperId: number
  base: NativeEffectGroup[]
  options: NativeMutation[]
}

function byId<T extends { id: number }>(records: T[]) {
  const map = new Map(records.map((record) => [record.id, record]))
  return (id: number) => {
    const record = map.get(id)
    if (!record) throw new Error('Missing crafting record ' + String(id))
    return record
  }
}

async function readUpgradeSystem(directory: string) {
  const manifest = await loadDatasetFile<{
    system: string
    resources: Record<string, string>
    devices: Record<string, { name: string }>
  }>(directory + '/manifest.json')
  if (manifest.system !== directory) throw new Error('Unexpected upgrade system ' + manifest.system)
  const read = <T>(key: string) => loadDatasetFile<T>(directory + '/' + manifest.resources[key])
  const [bases, recipes, ingredients, rawEffects, spells, sets] = await Promise.all([
    read<Base[]>('baseItems'),
    read<Recipe[]>('recipes'),
    read<Named[]>('ingredients'),
    read<EffectRecord[]>('effects'),
    read<unknown>('spells'),
    manifest.resources.equipmentSets ? read<Named[]>('equipmentSets') : []
  ])
  const findBase = byId(bases),
    findIngredient = byId(ingredients),
    findEffect = byId(rawEffects),
    findSet = byId(sets)
  const index = effectIndex(rawEffects),
    spellMap = spellIndex(spells)
  function group(ref: EffectRef): NativeEffectGroup {
    const effect = findEffect(ref.effectId)
    const effects = resolveEffects({ effects: [ref] }, directory, index, spellMap)
    const setName = effect.equipmentSetId && sets.length ? findSet(effect.equipmentSetId).name : undefined
    return { id: ref.effectId, effects, ...(setName && { setName }) }
  }
  function additions(recipe: Recipe, hostId?: number) {
    return (recipe.addEffectIds ?? []).map((effectId) =>
      group({
        effectId,
        variant:
          (hostId === undefined ? undefined : recipe.hostEffectVariants?.[hostId]?.[effectId]) ??
          recipe.effectVariants?.[effectId]
      })
    )
  }
  const craftedIds = new Set(
    recipes.filter((recipe) => recipe.category === 'component').map((recipe) => recipe.outputItemId)
  )
  function cost(recipe: Recipe) {
    return recipe.ingredients.map(({ ingredientId, itemId, quantity }) => {
      if (ingredientId !== undefined)
        return {
          id: ingredientId,
          name: findIngredient(ingredientId).name,
          quantity,
          ...(!craftedIds.has(ingredientId) && { raw: true as const })
        }
      if (itemId !== undefined) return { name: findBase(itemId).name, quantity }
      throw new Error('Missing ingredient ID for ' + recipe.name)
    })
  }
  function effectName(ref: EffectRef) {
    const effect = findEffect(ref.effectId)
    const variant = effect.variants?.find((entry) => entry.variant === ref.variant)
    if (effect.hidden || variant?.hidden) return ''
    return variant?.displayName ?? effect.displayName ?? ''
  }
  return { manifest, bases, recipes, findBase, findIngredient, effectName, group, additions, cost, spellMap, index }
}

let nearlyCompleteRequest: Promise<Awaited<ReturnType<typeof buildNearlyComplete>>> | undefined
export function loadNativeNearlyComplete() {
  nearlyCompleteRequest ??= buildNearlyComplete().finally(() => {
    nearlyCompleteRequest = undefined
  })
  return nearlyCompleteRequest
}
async function buildNearlyComplete(): Promise<{ items: NearlyCompleteDataset; recipes: NearlyCompleteRecipe[] }> {
  const data = await readUpgradeSystem('nearly-complete')
  const items: NearlyCompleteDataset = data.bases.map((item) => ({
    catalogId: item.id,
    name: item.name,
    pageTitle: item.name,
    type: item.weaponType ?? item.itemType,
    minLevel: String(item.minimumLevel),
    enchantments: item.effects.map((ref) => ({ name: data.effectName(ref) })).filter(({ name }) => name)
  }))
  const recipes = data.recipes
    .filter((recipe) => recipe.category === 'upgrade')
    .map((recipe) => {
      const keeper = recipe.keeper
      if (!keeper?.itemIds?.length) throw new Error('Missing keeper items for ' + recipe.name)
      const effectsRemoved = (recipe.removeMutationIds ?? [])
        .map((effectId) => ({ name: data.effectName({ effectId }) }))
        .filter(({ name }) => name)
      const tier = keeper.ingredientType === 'NearlyCompletedLegendary' ? 'Legendary' : 'Heroic'
      const requirements = [{ name: tier + ' Item with ' + effectsRemoved[0].name, quantity: 1 }, ...data.cost(recipe)]
      const effectsFor = (hostId?: number) => {
        const effects = data.additions(recipe, hostId).flatMap((group) => group.effects)
        const differences = hostId && recipe.hostDiscrepancies?.[hostId]
        if (!differences || !effects.length) return effects
        const notes = differences.map(
          ({ stated, resolved, unit }) =>
            'The recipe lists ' + String(stated) + ' ' + unit + '. This item receives ' + String(resolved) + '.'
        )
        return [
          { ...effects[0], discrepancyNotes: [...(effects[0].discrepancyNotes ?? []), ...notes] },
          ...effects.slice(1)
        ]
      }
      const hostEffects = new Map(
        Object.keys(recipe.hostEffectVariants ?? {}).map((key) => [Number(key), effectsFor(Number(key))])
      )
      return {
        name: recipe.name.replace('Amplfication', 'Amplification'),
        quantity: recipe.quantity ?? 1,
        craftedIn: data.manifest.devices[recipe.device].name,
        requirements: requirements.map((entry) => ({ ...entry, requirements: [] })),
        effectsAdded: effectsFor(),
        effectsRemoved,
        keeperIds: keeper.itemIds,
        hostEffects
      } satisfies NearlyCompleteRecipe
    })
  return { items, recipes }
}

function addedSlot(recipe: Recipe): GearPlannerAugmentSlot | undefined {
  const color = recipe.augmentSlotTypes?.at(-1)
  return color ? { name: color + ' Augment Slot', augmentType: color, slotTypes: recipe.augmentSlotTypes } : undefined
}
const stageLabels: Record<string, string> = {
  nearlyFinished: 'Nearly Finished',
  almostThere: 'Almost There',
  finishingTouch: 'Finishing Touch'
}
export async function loadNativeNearlyFinished(): Promise<NearlyFinishedDataset> {
  const data = await readUpgradeSystem('nearly-finished')
  const meltingStation = data.recipes
    .filter((r) => r.category === 'component')
    .map((r) => {
      if (r.outputItemId === undefined) throw new Error('Missing component output for ' + r.name)
      return { name: data.findIngredient(r.outputItemId).name, quantity: r.quantity ?? 1, requirements: data.cost(r) }
    })
  const reforgingStation: ReforgingEntry[] = []
  for (const stageRecipes of Map.groupBy(
    data.recipes.filter((r) => r.category === 'upgrade'),
    (r) => String(r.keeper?.itemId) + '/' + String(r.stage)
  ).values()) {
    const first = stageRecipes[0]
    if (first.keeper?.itemId === undefined || !first.stage || !stageLabels[first.stage])
      throw new Error('Invalid upgrade stage for ' + first.name)
    const item = data.findBase(first.keeper.itemId)
    const options = stageRecipes.map((recipe): NativeMutation => {
      const added = data.additions(recipe)
      const labels = (recipe.addEffectIds ?? [])
        .map((effectId) => data.effectName({ effectId, variant: recipe.effectVariants?.[effectId] }))
        .filter((name) => name && !Object.values(stageLabels).includes(name))
      // Multi-effect raid choices retain the published power-then-lore label used by saved loadouts.
      const name =
        labels.toSorted((a, b) => Number(a.includes(' Lore')) - Number(b.includes(' Lore'))).join(' & ') || recipe.name
      return {
        name,
        materials: data.cost(recipe),
        added,
        removeIds: recipe.removeMutationIds ?? [],
        slot: addedSlot(recipe)
      }
    })
    const slot = options[0].slot?.augmentType.toLowerCase()
    const entry: ReforgingEntry = {
      item: item.name,
      stage: stageLabels[first.stage],
      cost: data.cost(first),
      effectsAdded:
        options.length === 1 ? options[0].added.flatMap(({ effects }) => effects.map((e) => ({ name: e.name }))) : [],
      ...(options.length > 1 && { choices: options.map(({ name }) => ({ name })) }),
      ...(slot && { augments: [{ [slot]: null }] }),
      native: { keeperId: item.id, base: item.effects.map(data.group), options }
    }
    reforgingStation.push(entry)
  }
  return { meltingStation, reforgingStation }
}

export async function loadNativeNamedUpgrades(directory: string, marker: string) {
  const data = await readUpgradeSystem(directory)
  const nativeChoices = new Map<number, CraftChoice>()
  for (const recipe of data.recipes) {
    if (recipe.category !== 'upgrade' || recipe.keeper?.itemId === undefined) continue
    if (!recipe.keeper.requiredMutationIds?.some((effectId) => data.effectName({ effectId }) === marker)) continue
    const item = data.findBase(recipe.keeper.itemId)
    const retained = item.effects.filter((ref) => !recipe.removeMutationIds?.includes(ref.effectId))
    const effects = [...retained.map(data.group), ...data.additions(recipe)].flatMap((group) => group.effects)
    const spell = recipe.resultSpell ?? item.spell
    if (spell) effects.push(...resolveEffects({ spell }, item.name, data.index, data.spellMap))
    const slot = addedSlot(recipe)
    nativeChoices.set(item.id, {
      id: 'applied',
      label: recipe.name,
      effects,
      materials: data.cost(recipe),
      ...(slot && { augmentSlot: slot })
    })
  }
  return { items: new Map<string, GearPlannerEffect[]>(), nativeChoices }
}
