import type {
  ClassifiedDinosaurBoneItem,
  DinosaurBoneAugment,
  DinosaurBoneEffect,
  DinosaurBoneItem,
  DinosaurBoneRequirement,
  ItemFamily,
  SelectedAugments
} from './dinosaurBone.types'

const familyLabels: Record<ItemFamily, string> = {
  'crafted-weapons': 'Crafted Weapons',
  'attuned-weapons': 'Attuned Weapons',
  'armor-accessories': 'Armor & Accessories',
  'named-items': 'Named Items'
}

export const getFamilyLabel = (family: ItemFamily): string => familyLabels[family]

export const itemFamilies: ItemFamily[] = ['crafted-weapons', 'attuned-weapons', 'armor-accessories', 'named-items']

const hasLocation = (item: DinosaurBoneItem, text: string): boolean =>
  item.dropLocations?.some((location) => JSON.stringify(location).toLowerCase().includes(text.toLowerCase())) ?? false

export const classifyItem = (item: DinosaurBoneItem): ClassifiedDinosaurBoneItem => {
  if (hasLocation(item, 'Dinosaur Bone Crafting')) return { ...item, family: 'crafted-weapons' }
  if (item.name.startsWith('Attuned Bone ')) return { ...item, family: 'attuned-weapons' }
  if (
    item.name.startsWith('Dinosaur Bone') ||
    item.name === 'Dinosaur Plate Armor' ||
    item.name === 'Dinosaur Scale Plate'
  ) {
    return { ...item, family: 'armor-accessories' }
  }
  return { ...item, family: 'named-items' }
}

export const classifyItems = (items: DinosaurBoneItem[]): ClassifiedDinosaurBoneItem[] => items.map(classifyItem)

export const getItemsForFamily = (
  items: ClassifiedDinosaurBoneItem[],
  family: ItemFamily
): ClassifiedDinosaurBoneItem[] => items.filter((item) => item.family === family)

export const getEffectNames = (item: DinosaurBoneItem): string[] =>
  [...(item.effectsAdded ?? []), ...(item.enchantments ?? [])]
    .map(({ name }) => name)
    .filter((name): name is string => Boolean(name))

export const getAugmentEffectNames = (augment: DinosaurBoneAugment): string[] =>
  (augment.effectsAdded ?? []).map(({ name }) => name).filter((name): name is string => Boolean(name))

export const getFilterOptions = <T>(items: T[], getValues: (item: T) => string[]): string[] =>
  [...new Set(items.flatMap(getValues))].sort((a, b) => a.localeCompare(b))

export const filterItems = <T>(
  items: T[],
  filters: string[],
  mode: 'OR' | 'AND',
  getValues: (item: T) => string[]
): T[] => {
  if (filters.length === 0) return items
  return items.filter((item) => {
    const values = getValues(item)
    return mode === 'OR'
      ? filters.some((filter) => values.includes(filter))
      : filters.every((filter) => values.includes(filter))
  })
}

const normaliseSlot = (slot: string): string => slot.replace(/ Slot(?= |$)/, '')

export const isColorSlot = (slot: string): boolean =>
  ['Red', 'Blue', 'Yellow', 'Purple', 'Orange', 'Green', 'Colorless'].includes(normaliseSlot(slot))

const supportedSpecialSlots = new Set([
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

export const getAvailableSlots = (item: DinosaurBoneItem): string[] => {
  const slots = item.augments.map(({ augmentType }) => augmentType)
  return [...slots.filter((slot) => !isColorSlot(slot)), ...slots.filter(isColorSlot)]
}

export const getCompatibleAugments = (
  slot: string,
  dinosaurAugments: DinosaurBoneAugment[],
  colorAugments: DinosaurBoneAugment[]
): DinosaurBoneAugment[] => {
  const family = normaliseSlot(slot)
  const isColor = isColorSlot(slot)
  const source = isColor ? colorAugments : dinosaurAugments
  const compatible = source.filter((augment) => augment.augmentType === family)
  if (!isColor && !supportedSpecialSlots.has(family)) {
    throw new Error(`Unknown Dinosaur Bone slot contract: ${slot}`)
  }
  return compatible.toSorted((a, b) => a.name.localeCompare(b.name))
}

export const getSelectedAugments = (
  slots: string[],
  selected: SelectedAugments,
  byName: Map<string, DinosaurBoneAugment>
): Record<string, DinosaurBoneAugment> =>
  Object.fromEntries(
    slots.flatMap((slot) => {
      const name = selected[slot]
      const augment = name ? byName.get(name) : undefined
      return augment ? [[slot, augment]] : []
    })
  )

export const retainSelectedAugments = (
  item: DinosaurBoneItem | undefined,
  selected: SelectedAugments,
  optionsBySlot: Map<string, DinosaurBoneAugment[]>
): SelectedAugments => {
  if (!item) return {}
  return Object.fromEntries(
    getAvailableSlots(item).map((slot) => {
      const name = selected[slot]
      const valid = name && optionsBySlot.get(slot)?.some((augment) => augment.name === name)
      return [slot, valid ? name : null]
    })
  )
}

export const getFinishedEffects = (
  item: DinosaurBoneItem | undefined,
  selectedAugments: Record<string, DinosaurBoneAugment>
): { base: DinosaurBoneEffect[]; selected: { slot: string; augment: DinosaurBoneAugment }[] } => ({
  base: [...(item?.effectsAdded ?? []), ...(item?.enchantments ?? [])],
  selected: Object.entries(selectedAugments).map(([slot, augment]) => ({ slot, augment }))
})

const addRequirements = (requirements: DinosaurBoneRequirement[], totals: Record<string, number>) => {
  for (const requirement of requirements) {
    if (!Number.isFinite(requirement.quantity) || requirement.quantity <= 0) {
      throw new Error(`Invalid Dinosaur Bone requirement quantity for ${requirement.name}`)
    }
    totals[requirement.name] = (totals[requirement.name] ?? 0) + requirement.quantity
    if (requirement.requirements) addRequirements(requirement.requirements, totals)
  }
}

export const getCumulativeIngredients = (
  item: DinosaurBoneItem | undefined,
  selectedAugments: Record<string, DinosaurBoneAugment>
): { name: string; quantity: number }[] => {
  const totals: Record<string, number> = {}
  if (item) addRequirements(item.requirements, totals)
  Object.values(selectedAugments).forEach((augment) => {
    addRequirements(augment.requirements ?? [], totals)
  })
  return Object.entries(totals)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const formatEffect = ({ name, modifier, bonus, notes }: DinosaurBoneEffect): string =>
  `${name}${modifier !== undefined ? ` (+${String(modifier)}${bonus ? ` ${bonus}` : ''})` : ''}${notes ? ` — ${notes}` : ''}`

export const validateUniqueNames = (records: { name: string }[], label: string) => {
  const names = new Set<string>()
  records.forEach(({ name }) => {
    if (names.has(name)) throw new Error(`Duplicate ${label}: ${name}`)
    names.add(name)
  })
}
