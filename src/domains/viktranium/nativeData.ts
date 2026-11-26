import { loadDatasetFile } from '../../shared/data/loadDataset'
import { baseItemArt } from '../../shared/items/itemArt'
import { catalogItemType, catalogSocket, effectIndex, resolveEffects, spellIndex } from '../gearPlanner/itemCatalog'
import { assembleViktraniumData, categoryFor, displayNameFor, familyFor, supportedSlotTypes } from './data'
import type { GearPlannerEffect } from '../gearPlanner/gearPlanner.types'
import type { ViktraniumItem } from './viktranium.types'
import { buildViktraniumRecipes, type NativeViktraniumIngredient, type NativeViktraniumRecipe } from './nativeRecipes'

interface RecordWithEffects extends Record<string, unknown> {
  id: number
  name: string
  minimumLevel: number
  description?: string
  sources?: { name: string; kind: string; availability?: string }[]
}
interface BaseItem extends RecordWithEffects {
  itemType: string
  augmentSlots: { name: string; types: string[] }[]
  baseStats: { binding?: Record<string, string>; material?: string }
}
interface Augment extends RecordWithEffects {
  slotTypes: string[]
}

export async function loadNativeViktranium() {
  const manifest = await loadDatasetFile<{
    system: string
    resources: Record<string, string>
    devices: Record<string, { id: number; name: string }>
  }>('viktranium/manifest.json')
  if (manifest.system !== 'viktranium') throw new Error('Invalid Viktranium manifest')
  const read = <T>(key: string) => loadDatasetFile<T>('viktranium/' + manifest.resources[key])
  const [bases, gems, effects, spells, recipes, materials] = await Promise.all([
    read<BaseItem[]>('baseItems'),
    read<Augment[]>('augments'),
    read<unknown>('effects'),
    read<unknown>('spells'),
    read<NativeViktraniumRecipe[]>('recipes'),
    read<NativeViktraniumIngredient[]>('ingredients')
  ])
  const { ingredients, byOutputId } = buildViktraniumRecipes(manifest.devices, recipes, materials)
  const baseEffects = effectIndex(effects)
  const augmentEffects = effectIndex(effects, 'augment')
  const spellNames = spellIndex(spells)
  const slotTypes = new Map<string, string>()
  const displayEffects = (rows: GearPlannerEffect[]) =>
    rows.map(({ name, modifier, bonus, notes }) => ({
      name,
      modifier,
      bonus: typeof bonus === 'string' ? bonus : undefined,
      notes
    }))
  const identity = (record: RecordWithEffects) => {
    if (!Number.isSafeInteger(record.id) || !record.name || !Number.isSafeInteger(record.minimumLevel))
      throw new Error('Missing Viktranium item identity or minimum level')
    return {
      name: record.name,
      minimumLevel: record.minimumLevel,
      description: record.description,
      art: baseItemArt('viktranium', record),
      recipes: byOutputId.get(record.id) ?? []
    }
  }
  const items = bases.map((item): ViktraniumItem => {
    const common = identity(item)
    const type = catalogItemType(item.itemType)
    return {
      ...common,
      id: 'item-' + String(item.id),
      pageTitle: item.name,
      displayName: displayNameFor(item.name),
      type,
      category: categoryFor(type, item.name),
      family: familyFor(item.minimumLevel, common.recipes, item.name),
      binding: item.baseStats.binding,
      material: item.baseStats.material,
      enchantments: displayEffects(resolveEffects(item, item.name, baseEffects, spellNames)),
      dropLocations: [
        ...new Set(
          item.sources
            ?.filter((source) => source.kind !== 'crafting_device')
            .map((source) =>
              source.availability === 'unverified' ? source.name + ' (unverified location)' : source.name
            )
        )
      ].map((source) => ({ source, sourceType: 'drop' })),
      slots: item.augmentSlots.map((slot, i) => {
        const { name, augmentType } = catalogSocket(slot)
        if (!supportedSlotTypes.has(augmentType)) throw new Error('Unknown Viktranium socket on ' + item.name)
        if (slot.types.length === 1) slotTypes.set(slot.types[0], augmentType)
        return { id: 'slot-' + String(i + 1), label: name, augmentType, order: i }
      })
    }
  })
  const augments = gems.map((gem) => {
    const augmentType = slotTypes.get(gem.slotTypes[0])
    if (!augmentType || gem.slotTypes.length !== 1) throw new Error('Unknown Viktranium socket for ' + gem.name)
    return {
      ...identity(gem),
      id: 'augment-' + String(gem.id),
      augmentType,
      effects: displayEffects(resolveEffects(gem, gem.name, augmentEffects, spellNames)),
      foundIn: [...new Set(gem.sources?.map((source) => source.name))]
    }
  })
  return assembleViktraniumData(items, augments, ingredients)
}
