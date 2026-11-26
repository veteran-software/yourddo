import { baseItemArt } from '../../shared/items/itemArt'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import { effectIndex, resolveEffects, scopedAugmentReader, spellIndex } from '../gearPlanner/itemCatalog'
import type { GearPlannerEffect } from '../gearPlanner/gearPlanner.types'
import type {
  DinosaurBoneAugment,
  DinosaurBoneEffect,
  DinosaurBoneItem,
  DinosaurBoneRequirement,
  DinosaurBoneSetBonus
} from './dinosaurBone.types'

interface Manifest {
  system: string
  devices?: Record<string, { name: string }>
  resources: Record<string, string>
}

interface Named {
  id: number
  name: string
}
interface Source {
  name: string
  availability?: string
}
interface NativeItem extends Named, Record<string, unknown> {
  itemType: string
  description?: string
  baseStats: {
    binding?: { scope: string; on: string }
    material?: string
    weightLb?: number
    hardness?: number
    maxDurability?: number
    raceRestrictions?: { relation: string; values: string[] }[]
    classRestrictions?: { relation: string; values: string[] }[]
  }
  minimumLevel?: number
  sources?: Source[]
  isMinorArtifact?: boolean
  augmentSlots?: { name: string; types: string[] }[]
  equipmentSets?: Named[]
  slotTypes?: string[]
  hostSetOverride?: { primarySetId: number }
}
interface Recipe extends Named {
  device: string
  category: string
  outputItemId: number
  ingredients: { ingredientId: number; quantity: number }[]
}
interface NativeSet extends Named {
  thresholds: { pieces: number; effect: { effectId: number; variant?: string }; description: string }[]
}

function lookup<T>(index: ReadonlyMap<number, T>, id: number, kind: string): T {
  const record = index.get(id)
  if (!record) throw new Error(`Missing Dinosaur Bone ${kind} ${String(id)}`)
  return record
}

function resourceReader(domain: string, manifest: Manifest) {
  return <T>(key: string) => {
    const path = manifest.resources[key]
    if (!path) throw new Error('Missing ' + domain + ' resource ' + key)
    return loadDatasetFile<T>(domain + '/' + path)
  }
}

const toDinosaurEffect = ({ name, modifier, bonus, notes }: GearPlannerEffect): DinosaurBoneEffect => ({
  name,
  modifier,
  bonus: bonus === undefined ? undefined : String(bonus),
  notes
})

function effectLibrary(effects: unknown, spells: unknown, sets: NativeSet[], source: 'equipment' | 'augment') {
  const index = effectIndex(effects, source)
  const spellList = spellIndex(spells)
  const effectsFor = (record: Record<string, unknown>, name: string, fallback?: string) =>
    resolveEffects(record, name, index, spellList, fallback).map(toDinosaurEffect)
  const bonuses = new Map(
    sets.map((set) => [
      set.id,
      set.thresholds.map((tier) => ({
        name: set.name,
        numPiecesEquipped: tier.pieces,
        enhancements: effectsFor({ effects: [tier.effect] }, set.name, tier.description)
      }))
    ])
  )
  return {
    effects: (item: NativeItem) => effectsFor(item, item.name),
    setBonus: (id: number): DinosaurBoneSetBonus[] => lookup(bonuses, id, 'set')
  }
}

const foundIn = (sources?: Source[]) => [
  ...new Set((sources ?? []).map((s) => (s.availability === 'unverified' ? s.name + ' (unverified)' : s.name)))
]

function augmentSlotCode(item: NativeItem) {
  if (item.slotTypes?.length !== 1) throw new Error('Invalid augment slot type for ' + item.name)
  return item.slotTypes[0]
}

// These labels are also the slot IDs stored by the planner.
const slotLabels: Readonly<Record<string, string>> = {
  Dread_Prefix: 'Isle of Dread: Scale Slot (Accessory)',
  Dread_Suffix: 'Isle of Dread: Fang Slot (Accessory)',
  Dread_Extra: 'Isle of Dread: Claw Slot (Accessory)',
  Dread_Extra2: 'Isle of Dread: Horn Slot (Accessory)',
  Dread_Weapon_Prefix: 'Isle of Dread: Scale Slot (Weapon)',
  Dread_Weapon_Suffix: 'Isle of Dread: Fang Slot (Weapon)',
  Dread_Weapon_Extra: 'Isle of Dread: Claw Slot (Weapon)',
  Dread_Weapon_Extra2: 'Isle of Dread: Horn Slot (Weapon)',
  Dread_Armor_Prefix: 'Isle of Dread: Scale Slot (Armor)',
  Dread_Armor_Suffix: 'Isle of Dread: Fang Slot (Armor)',
  Dread_Setbonus: 'Isle of Dread: Set Bonus Slot'
}

function slotType(code: string) {
  const label = slotLabels[code]
  if (!label) throw new Error('Unknown Dinosaur Bone socket type ' + code)
  return label
}

function asAugment(
  item: NativeItem,
  augmentType: string,
  library: ReturnType<typeof effectLibrary>
): DinosaurBoneAugment {
  return {
    name: item.name,
    minimumLevel: item.minimumLevel,
    augmentType,
    description: item.description,
    effectsAdded: library.effects(item),
    requirements: [],
    foundIn: foundIn(item.sources),
    setBonus: item.hostSetOverride ? library.setBonus(item.hostSetOverride.primarySetId) : undefined
  }
}

async function loadAugments() {
  const directory = 'items/augments'
  const manifest = await loadDatasetFile<Manifest>(directory + '/manifest.json')
  if (manifest.system !== 'items') throw new Error('Invalid item augment manifest')
  const read = resourceReader(directory, manifest)
  const [items, dinosaurItems, effects, spells, sets, names] = await Promise.all([
    read<NativeItem[]>('standard'),
    read<NativeItem[]>('dinosaur-bone'),
    read('effects'),
    read('spells'),
    read<NativeSet[]>('sets'),
    manifest.resources['enchantment-names'] ? read<string[]>('enchantment-names') : undefined
  ])
  if (!items.length || !dinosaurItems.length) throw new Error('Empty Dinosaur Bone augment catalog')
  const library = effectLibrary(effects, spells, sets, 'augment')
  const seen = new Set<string>()
  const readScoped = names && scopedAugmentReader(effects, names)
  const colorAugments = items
    .toSorted((a, b) => a.id - b.id)
    .map((item) => {
      const augment = asAugment(item, augmentSlotCode(item), library)
      if (readScoped) {
        const { presentation, searchLabels, fallbackDescription, effectsAdded } = readScoped(item)
        augment.scoped = { presentation, fallbackDescription }
        augment.searchLabels = searchLabels
        augment.effectsAdded = effectsAdded.map(toDinosaurEffect)
        augment.description = fallbackDescription
      }
      // The first ID retains the name used by existing selections.
      if (seen.has(augment.name)) augment.name += ' (ML ' + String(item.minimumLevel) + ', #' + String(item.id) + ')'
      seen.add(augment.name)
      return augment
    })
  const dinosaurAugments = dinosaurItems.map((item) => ({
    id: item.id,
    augment: asAugment(item, slotType(augmentSlotCode(item)).replace(' Slot', ''), library)
  }))
  return { colorAugments, dinosaurAugments, enchantmentNames: names }
}

export async function loadNativeDinosaurBone() {
  const directory = 'dinosaur-bone'
  const manifest = await loadDatasetFile<Manifest>(directory + '/manifest.json')
  if (manifest.system !== directory) throw new Error('Invalid Dinosaur Bone manifest')
  const read = resourceReader(directory, manifest)
  const [bases, effects, spells, sets, recipes, ingredients, augments] = await Promise.all([
    read<NativeItem[]>('baseItems'),
    read('effects'),
    read('spells'),
    read<NativeSet[]>('equipmentSets'),
    read<Recipe[]>('recipes'),
    read<(Named & { sources?: Source[] })[]>('ingredients'),
    loadAugments()
  ])
  if (!bases.length) throw new Error('Empty Dinosaur Bone base item catalog')
  const library = effectLibrary(effects, spells, sets, 'equipment')
  const recipesByOutput = new Map(recipes.map((recipe) => [recipe.outputItemId, recipe]))
  const ingredientIndex = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))
  const crafting = (id: number) => {
    const recipe = recipesByOutput.get(id)
    const requirements: DinosaurBoneRequirement[] = (recipe?.ingredients ?? []).map((part) => {
      const ingredient = lookup(ingredientIndex, part.ingredientId, 'ingredient')
      if (!Number.isSafeInteger(part.quantity) || part.quantity < 1)
        throw new Error('Invalid quantity for ' + ingredient.name)
      return { name: ingredient.name, quantity: part.quantity, foundIn: foundIn(ingredient.sources) }
    })
    return { requirements, craftedIn: recipe && manifest.devices?.[recipe.device]?.name }
  }
  const craftedItemIds = new Set(
    recipes.filter((r) => r.category === 'equipment' && r.device === 'crafting').map((r) => r.outputItemId)
  )
  const items: DinosaurBoneItem[] = bases.map((item) => {
    const stats = item.baseStats
    return {
      name: item.name,
      art: baseItemArt('dinosaur-bone', item),
      type: item.itemType.replaceAll(/([a-z])([A-Z])/g, '$1 $2'),
      description: item.description,
      minLevel: item.minimumLevel,
      material: stats.material,
      weight: stats.weightLb,
      hardness: stats.hardness,
      durability: stats.maxDurability,
      artifactType: item.isMinorArtifact ? 'Minor' : undefined,
      binding: stats.binding && { type: 'Bound', to: stats.binding.scope, from: stats.binding.on },
      restrictions: [...(stats.raceRestrictions ?? []), ...(stats.classRestrictions ?? [])].map(
        (r) => r.relation + ' ' + r.values.join(', ')
      ),
      enchantments: library.effects(item),
      setBonus: item.equipmentSets?.flatMap((set) => library.setBonus(set.id)),
      augments: (item.augmentSlots ?? []).map((slot) => {
        const type = slot.name.endsWith(' Augment Slot')
          ? slot.name.replace(' Augment Slot', '')
          : slotType(slot.types[0])
        return { id: type, augmentType: type, label: type.replace(' Slot', '') }
      }),
      ...crafting(item.id)
    }
  })
  const dinosaurAugments = augments.dinosaurAugments.map(({ id, augment }) => {
    const recipe = crafting(id)
    const locations = new Set(augment.foundIn)
    if (recipe.craftedIn) locations.add(recipe.craftedIn)
    return { ...augment, ...recipe, foundIn: [...locations] }
  })
  return {
    items,
    dinosaurAugments,
    colorAugments: augments.colorAugments,
    enchantmentNames: augments.enchantmentNames,
    craftedNames: new Set(bases.filter((x) => craftedItemIds.has(x.id)).map((x) => x.name))
  }
}
