import { getCompatibleAugmentTypes, isColorAugmentSlot } from '../../shared/augments/compatibility.ts'
import type {
  CumulativeIngredient,
  FinishedViktraniumItem,
  IngredientCalculation,
  SelectedAugments,
  ViktraniumAugment,
  ViktraniumData,
  ViktraniumEffect,
  ViktraniumFamily,
  ViktraniumItem,
  ViktraniumRecipe,
  ViktraniumRequirement,
  ViktraniumSlot
} from './viktranium.types.ts'

export const itemFamilies: readonly ViktraniumFamily[] = [
  'heroic-crafted-weapons',
  'heroic-quest-loot',
  'legendary-crafted-weapons',
  'legendary-quest-loot',
  'wicked-crafted-weapons'
]

const familyLabels: Readonly<Record<ViktraniumFamily, string>> = {
  'heroic-crafted-weapons': 'Heroic Crafted Weapons',
  'heroic-quest-loot': 'Heroic Quest Loot',
  'legendary-crafted-weapons': 'Legendary Crafted Weapons',
  'legendary-quest-loot': 'Legendary Quest Loot',
  'wicked-crafted-weapons': 'Wicked Crafted Weapons'
}

export const getFamilyLabel = (family: ViktraniumFamily): string => familyLabels[family]

export const formatEffect = ({ name, modifier, bonus, notes }: ViktraniumEffect): string =>
  `${name}${modifier !== undefined ? ` (${String(modifier)}${bonus ? ` ${bonus}` : ''})` : ''}${notes ? ` — ${notes}` : ''}`

export const getItemEffectNames = (item: ViktraniumItem): string[] => item.enchantments.map(({ name }) => name)
export const getAugmentEffectNames = (augment: ViktraniumAugment): string[] => augment.effects.map(({ name }) => name)

export const getFilterOptions = <T>(records: readonly T[], values: (record: T) => readonly string[]): string[] =>
  [...new Set(records.flatMap((record) => [...values(record)]))].sort((a, b) => a.localeCompare(b))

export const filterRecords = <T>(
  records: readonly T[],
  filters: readonly string[],
  mode: 'OR' | 'AND',
  values: (record: T) => readonly string[]
): readonly T[] => {
  if (filters.length === 0) return records
  return records.filter((record) => {
    const recordValues = values(record)
    return mode === 'OR'
      ? filters.some((filter) => recordValues.includes(filter))
      : filters.every((filter) => recordValues.includes(filter))
  })
}

export const getCompatibleTypes = (slot: ViktraniumSlot): readonly string[] =>
  slot.compatibleAugmentTypes ?? getCompatibleAugmentTypes(slot.augmentType)

export const getCompatibleAugments = (slot: ViktraniumSlot, data: ViktraniumData): readonly ViktraniumAugment[] =>
  getCompatibleTypes(slot).flatMap((type) => data.indexes.augmentsByType.get(type) ?? [])

export const getSelectedAugments = (
  item: ViktraniumItem | undefined,
  selected: SelectedAugments,
  data: ViktraniumData
): Readonly<Record<string, ViktraniumAugment>> => {
  if (!item) return {}
  return Object.fromEntries(
    item.slots.flatMap((slot) => {
      const id = selected[slot.id] ?? slot.filledAugmentId
      if (!id) return []
      const augment = data.indexes.augmentById.get(id)
      return augment && getCompatibleTypes(slot).includes(augment.augmentType) ? [[slot.id, augment] as const] : []
    })
  )
}

const effectKey = ({ name, modifier, bonus, notes }: ViktraniumEffect): string =>
  JSON.stringify([name, modifier ?? null, bonus ?? null, notes ?? null])

const uniqueEffects = (effects: readonly ViktraniumEffect[]): ViktraniumEffect[] => {
  const seen = new Set<string>()
  return effects.filter((effect) => {
    const key = effectKey(effect)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const recipeWarnings = (name: string, recipes: readonly ViktraniumRecipe[]): string[] =>
  recipes.flatMap((recipe) => (recipe.status === 'complete' ? [] : [`${name}: crafting recipe is ${recipe.status}.`]))

export const calculateFinishedItem = (
  item: ViktraniumItem | undefined,
  selected: SelectedAugments,
  data: ViktraniumData
): FinishedViktraniumItem => {
  if (!item) return { baseEffects: [], slots: [], emptySlots: [], warnings: [], incompleteRecipeWarnings: [] }
  const slots = item.slots.map((slot) => {
    const selectedId = selected[slot.id] ?? slot.filledAugmentId
    const augment = selectedId ? data.indexes.augmentById.get(selectedId) : undefined
    const compatible = augment ? getCompatibleTypes(slot).includes(augment.augmentType) : true
    return { slot, ...(augment && compatible ? { augment } : {}), existing: Boolean(slot.filledAugmentId) }
  })
  const warnings = item.slots.flatMap((slot) => {
    const selectedId = selected[slot.id] ?? slot.filledAugmentId
    if (!selectedId) return []
    const augment = data.indexes.augmentById.get(selectedId)
    if (!augment) return [`${slot.label}: selected augment ${selectedId} is missing.`]
    return getCompatibleTypes(slot).includes(augment.augmentType)
      ? []
      : [`${slot.label}: “${augment.name}” is not compatible.`]
  })
  const minimumLevel = Math.max(
    item.minimumLevel,
    ...slots.flatMap(({ slot, augment }) =>
      augment && isColorAugmentSlot(slot.augmentType) ? [augment.minimumLevel] : []
    )
  )
  return {
    item,
    minimumLevel,
    baseEffects: uniqueEffects(item.enchantments),
    slots,
    emptySlots: slots.filter(({ augment }) => !augment).map(({ slot }) => slot),
    warnings,
    incompleteRecipeWarnings: [
      ...recipeWarnings(item.name, item.recipes),
      ...slots.flatMap(({ augment }) => (augment ? recipeWarnings(augment.name, augment.recipes) : []))
    ]
  }
}

interface IngredientTotal {
  ingredient: CumulativeIngredient
}

const addRequirements = (
  requirements: readonly ViktraniumRequirement[],
  multiplier: number,
  data: ViktraniumData,
  totals: Map<string, IngredientTotal>,
  ancestors: ReadonlySet<string>
) => {
  for (const requirement of requirements) {
    const quantity = requirement.quantity * multiplier
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error(`Invalid quantity for ${requirement.name}`)
    if (ancestors.has(requirement.ingredientId)) throw new Error(`Cyclic requirement for ${requirement.name}`)
    const metadata = data.indexes.ingredientById.get(requirement.ingredientId)
    if (!metadata) throw new Error(`Missing ingredient ${requirement.ingredientId}`)
    const current = totals.get(requirement.ingredientId)
    if (current) current.ingredient.quantity += quantity
    else totals.set(requirement.ingredientId, { ingredient: { ...metadata, quantity } })
    if (requirement.requirements) {
      addRequirements(
        requirement.requirements,
        quantity,
        data,
        totals,
        new Set([...ancestors, requirement.ingredientId])
      )
    }
  }
}

const addRecipes = (
  owner: string,
  recipes: readonly ViktraniumRecipe[],
  data: ViktraniumData,
  totals: Map<string, IngredientTotal>,
  warnings: string[]
) => {
  for (const recipe of recipes) {
    if (recipe.status !== 'complete') {
      warnings.push(`${owner}: ingredient total is incomplete because its recipe is ${recipe.status}.`)
      continue
    }
    addRequirements(recipe.requirements, 1, data, totals, new Set())
  }
}

export const calculateIngredients = (
  item: ViktraniumItem | undefined,
  selectedAugments: Readonly<Record<string, ViktraniumAugment>>,
  data: ViktraniumData
): IngredientCalculation => {
  if (!item) return { ingredients: [], warnings: [] }
  const totals = new Map<string, IngredientTotal>()
  const warnings: string[] = []
  addRecipes(item.name, item.recipes, data, totals, warnings)
  for (const augment of Object.values(selectedAugments)) {
    addRecipes(augment.name, augment.recipes, data, totals, warnings)
  }
  return {
    ingredients: [...totals.values()]
      .map(({ ingredient }) => ingredient)
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
    warnings
  }
}

export const buildComplete = (finished: FinishedViktraniumItem): boolean =>
  Boolean(finished.item) &&
  finished.emptySlots.length === 0 &&
  finished.warnings.length === 0 &&
  finished.incompleteRecipeWarnings.length === 0
