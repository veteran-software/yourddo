import {
  getCompatibleAugmentTypes,
  isColorAugmentSlot,
  normaliseAugmentSlotType
} from '../../shared/augments/compatibility.ts'
import type {
  ClassifiedDinosaurBoneItem,
  CumulativeIngredient,
  DinosaurBoneAugment,
  DinosaurBoneEffect,
  DinosaurBoneIndexes,
  DinosaurBoneItem,
  DinosaurBoneRequirement,
  FinishedDinosaurBoneItem,
  ItemFamily,
  SelectedAugments
} from './dinosaurBone.types'

const familyLabels: Readonly<Record<ItemFamily, string>> = {
  'crafted-weapons': 'Crafted Weapons',
  'attuned-weapons': 'Attuned Weapons',
  'armor-accessories': 'Armor & Accessories',
  'named-items': 'Named Items'
}

export const itemFamilies: readonly ItemFamily[] = [
  'crafted-weapons',
  'attuned-weapons',
  'armor-accessories',
  'named-items'
]

export const getFamilyLabel = (family: ItemFamily): string => familyLabels[family]

export const classifyItem = (
  item: DinosaurBoneItem,
  craftedItemNames: ReadonlySet<string>
): ClassifiedDinosaurBoneItem => {
  if (craftedItemNames.has(item.name)) return { ...item, family: 'crafted-weapons' }
  if (item.name.startsWith('Attuned Bone ')) return { ...item, family: 'attuned-weapons' }
  if (
    item.name.startsWith('Dinosaur Bone ') ||
    item.name === 'Dinosaur Plate Armor' ||
    item.name === 'Dinosaur Scale Plate'
  ) {
    return { ...item, family: 'armor-accessories' }
  }
  return { ...item, family: 'named-items' }
}

export const classifyItems = (
  items: readonly DinosaurBoneItem[],
  craftedItemNames: ReadonlySet<string>
): ClassifiedDinosaurBoneItem[] => items.map((item) => classifyItem(item, craftedItemNames))

export const buildDinosaurBoneIndexes = (
  items: readonly ClassifiedDinosaurBoneItem[],
  dinosaurAugments: readonly DinosaurBoneAugment[],
  colorAugments: readonly DinosaurBoneAugment[]
): DinosaurBoneIndexes => {
  const itemsByFamily = new Map<ItemFamily, ClassifiedDinosaurBoneItem[]>(itemFamilies.map((family) => [family, []]))
  for (const item of items) itemsByFamily.get(item.family)?.push(item)

  const allAugments = [...dinosaurAugments, ...colorAugments]
  const augmentsByType = new Map<string, DinosaurBoneAugment[]>()
  for (const augment of allAugments) {
    const values = augmentsByType.get(augment.augmentType) ?? []
    values.push(augment)
    augmentsByType.set(augment.augmentType, values)
  }
  for (const values of augmentsByType.values()) values.sort((a, b) => a.name.localeCompare(b.name))

  return {
    itemByName: new Map(items.map((item) => [item.name, item])),
    itemsByFamily,
    augmentByName: new Map(allAugments.map((augment) => [augment.name, augment])),
    augmentsByType
  }
}

export const getItemsForFamily = (
  indexes: DinosaurBoneIndexes,
  family: ItemFamily
): readonly ClassifiedDinosaurBoneItem[] => indexes.itemsByFamily.get(family) ?? []

export const getEffectNames = (item: DinosaurBoneItem): string[] =>
  [...(item.effectsAdded ?? []), ...(item.enchantments ?? [])].map(({ name }) => name)

export const getAugmentEffectNames = (augment: DinosaurBoneAugment): string[] =>
  (augment.effectsAdded ?? []).map(({ name }) => name)

export const getFilterOptions = <T>(items: readonly T[], getValues: (item: T) => readonly string[]): string[] =>
  [...new Set(items.flatMap((item) => [...getValues(item)]))].sort((a, b) => a.localeCompare(b))

export const filterRecords = <T>(
  items: readonly T[],
  filters: readonly string[],
  mode: 'OR' | 'AND',
  getValues: (item: T) => readonly string[]
): readonly T[] => {
  if (filters.length === 0) return items
  return items.filter((item) => {
    const values = getValues(item)
    return mode === 'OR'
      ? filters.some((filter) => values.includes(filter))
      : filters.every((filter) => values.includes(filter))
  })
}

export const normaliseSlotType = normaliseAugmentSlotType

export const isColorSlot = isColorAugmentSlot

export const supportedSpecialSlotTypes = new Set([
  'Isle of Dread: Claw (Weapon)',
  'Isle of Dread: Fang (Weapon)',
  'Isle of Dread: Horn (Weapon)',
  'Isle of Dread: Scale (Weapon)',
  'Isle of Dread: Claw (Accessory)',
  'Isle of Dread: Fang (Accessory)',
  'Isle of Dread: Horn (Accessory)',
  'Isle of Dread: Scale (Accessory)',
  'Isle of Dread: Fang (Armor)',
  'Isle of Dread: Scale (Armor)',
  'Isle of Dread: Set Bonus'
])

export const getAvailableSlots = (item: DinosaurBoneItem) => [
  ...item.augments.filter(({ augmentType }) => !isColorSlot(augmentType)),
  ...item.augments.filter(({ augmentType }) => isColorSlot(augmentType))
]

export const getCompatibleAugments = (
  slotType: string,
  indexes: DinosaurBoneIndexes
): readonly DinosaurBoneAugment[] => {
  const type = normaliseSlotType(slotType)
  if (!isColorSlot(type) && !supportedSpecialSlotTypes.has(type)) {
    throw new Error(`Unknown Dinosaur Bone slot contract: ${slotType}`)
  }
  return getCompatibleAugmentTypes(type).flatMap((augmentType) => indexes.augmentsByType.get(augmentType) ?? [])
}

export const getSelectedAugments = (
  item: DinosaurBoneItem | undefined,
  selected: SelectedAugments,
  indexes: DinosaurBoneIndexes
): Readonly<Record<string, DinosaurBoneAugment>> => {
  if (!item) return {}
  return Object.fromEntries(
    getAvailableSlots(item).flatMap((slot) => {
      const name = selected[slot.id]
      const augment = name ? indexes.augmentByName.get(name) : undefined
      return augment && getCompatibleAugments(slot.augmentType, indexes).includes(augment)
        ? [[slot.id, augment] as const]
        : []
    })
  )
}

const effectKey = ({ name, modifier, bonus, notes }: DinosaurBoneEffect) =>
  JSON.stringify([name, modifier ?? null, bonus ?? null, notes ?? null])

const uniqueEffects = (effects: readonly DinosaurBoneEffect[]): DinosaurBoneEffect[] => {
  const seen = new Set<string>()
  return effects.filter((effect) => {
    const key = effectKey(effect)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const calculateFinishedItem = (
  item: ClassifiedDinosaurBoneItem | undefined,
  selected: SelectedAugments,
  indexes: DinosaurBoneIndexes
): FinishedDinosaurBoneItem => {
  if (!item) return { originalEffects: [], slots: [], emptySlots: [], setBonuses: [], warnings: [] }

  const slots = getAvailableSlots(item).map((slot) => {
    const selectedName = selected[slot.id]
    const augment = selectedName ? indexes.augmentByName.get(selectedName) : undefined
    const compatible = augment ? getCompatibleAugments(slot.augmentType, indexes).includes(augment) : true
    return { slot, ...(augment && compatible ? { augment } : {}) }
  })
  const warnings = getAvailableSlots(item).flatMap((slot) => {
    const selectedName = selected[slot.id]
    if (!selectedName) return []
    const augment = indexes.augmentByName.get(selectedName)
    if (!augment) return [`${slot.label}: selected augment “${selectedName}” is missing.`]
    return getCompatibleAugments(slot.augmentType, indexes).includes(augment)
      ? []
      : [`${slot.label}: “${selectedName}” is not compatible.`]
  })
  const selectedBonuses = slots.flatMap(({ augment }) => augment?.setBonus ?? [])

  return {
    item,
    originalEffects: uniqueEffects([...(item.effectsAdded ?? []), ...(item.enchantments ?? [])]),
    slots,
    emptySlots: slots.filter(({ augment }) => !augment).map(({ slot }) => slot),
    setBonuses: [...(item.setBonus ?? []), ...selectedBonuses],
    warnings
  }
}

interface IngredientAccumulator {
  quantity: number
  ingredientType?: string
  foundIn: Set<string>
}

const addRequirements = (
  requirements: readonly DinosaurBoneRequirement[],
  totals: Map<string, IngredientAccumulator>,
  multiplier = 1
) => {
  for (const requirement of requirements) {
    const quantity = requirement.quantity * multiplier
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid Dinosaur Bone requirement quantity for ${requirement.name}`)
    }
    const current = totals.get(requirement.name) ?? { quantity: 0, foundIn: new Set<string>() }
    current.quantity += quantity
    current.ingredientType ??= requirement.ingredientType
    requirement.foundIn?.forEach((location) => current.foundIn.add(location))
    totals.set(requirement.name, current)
    if (requirement.requirements) addRequirements(requirement.requirements, totals, quantity)
  }
}

export const calculateCumulativeIngredients = (
  item: ClassifiedDinosaurBoneItem | undefined,
  selectedAugments: Readonly<Record<string, DinosaurBoneAugment>>
): CumulativeIngredient[] => {
  if (!item) return []
  const totals = new Map<string, IngredientAccumulator>()
  addRequirements(item.requirements, totals)
  Object.values(selectedAugments).forEach((augment) => {
    addRequirements(augment.requirements, totals)
  })
  return [...totals.entries()]
    .map(([name, value]) => ({
      name,
      quantity: value.quantity,
      ...(value.ingredientType ? { ingredientType: value.ingredientType } : {}),
      ...(value.foundIn.size > 0 ? { foundIn: [...value.foundIn].sort() } : {})
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const formatEffect = ({ name, modifier, bonus, notes }: DinosaurBoneEffect): string =>
  `${name}${modifier !== undefined ? ` (${String(modifier)}${bonus ? ` ${bonus}` : ''})` : ''}${notes ? ` — ${notes}` : ''}`

export const validateUniqueNames = (records: readonly { name: string }[], label: string) => {
  const names = new Set<string>()
  records.forEach(({ name }) => {
    if (names.has(name)) throw new Error(`Duplicate ${label}: ${name}`)
    names.add(name)
  })
}
