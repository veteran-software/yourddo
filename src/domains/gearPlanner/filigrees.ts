import type { GearPlannerFiligree, GearPlannerItem } from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedFiligrees } from './planner.ts'

const legacySentientWeaponTypes = new Set([
  'Bastard Sword',
  'Battle Axe',
  'Club',
  'Dagger',
  'Dart',
  'Dwarven War Axe',
  'Falchion',
  'Great Axe',
  'Great Club',
  'Great Crossbow',
  'Great Sword',
  'Hand Axe',
  'Handwraps',
  'Heavy Crossbow',
  'Heavy Mace',
  'Heavy Pick',
  'Kama',
  'Khopesh',
  'Kukri',
  'Light Crossbow',
  'Light Hammer',
  'Light Mace',
  'Light Pick',
  'Long Bow',
  'Long Sword',
  'Maul',
  'Morningstar',
  'Quarterstaff',
  'Rapier',
  'Repeating Heavy Crossbow',
  'Repeating Light Crossbow',
  'Scimitar',
  'Short Bow',
  'Short Sword',
  'Shuriken',
  'Sickle',
  'Throwing Axe',
  'Throwing Dagger',
  'Throwing Hammer',
  'Warhammer',
  'Shield'
])

export const isGearPlannerMinorArtifact = (item: GearPlannerItem): boolean =>
  (item.source.artifactType?.trim().length ?? 0) > 0

export const isGearPlannerSentientWeapon = (item: GearPlannerItem): boolean =>
  item.alchemical?.base.acceptsSentience !== false && legacySentientWeaponTypes.has(item.source.type ?? '')

export const getGearPlannerMaxFiligreeSlots = (item: GearPlannerItem): number => {
  if (isGearPlannerMinorArtifact(item)) {
    if (item.minimumLevel >= 33) return 5
    if (item.minimumLevel >= 30) return 4
    if (item.minimumLevel >= 29) return 3
    return item.minimumLevel >= 20 ? 1 : 0
  }
  return isGearPlannerSentientWeapon(item) && item.minimumLevel >= 20 ? 10 : 0
}

export const supportsGearPlannerFiligrees = (item: GearPlannerItem): boolean => getGearPlannerMaxFiligreeSlots(item) > 0

export const normalizeGearPlannerFiligreeName = (name: string): string =>
  name
    .replace(/ \(Rare\)$/i, '')
    .trim()
    .toLocaleLowerCase()

// Known identities for releases that predate the type field.
const knownTypes = new Map([
  ['prowess: strength', 71],
  ["city's beacon/enlightened step: strength", 193],
  ['spines of the manticore/the wreath of flame: ranged power', 193]
])

export function sentientFiligreeType(filigree: GearPlannerFiligree) {
  const raw = filigree.source.SentientFiligreeType ?? filigree.source.sentientFiligreeType
  if ((typeof raw === 'number' || (typeof raw === 'string' && /^\d+$/.test(raw))) && Number.isSafeInteger(Number(raw)))
    return Number(raw)
  return knownTypes.get(normalizeGearPlannerFiligreeName(filigree.name).replaceAll('’', "'"))
}

export function sameFiligreeType(a: GearPlannerFiligree, b: GearPlannerFiligree) {
  const left = sentientFiligreeType(a),
    right = sentientFiligreeType(b)
  return left !== undefined && right !== undefined
    ? left === right
    : normalizeGearPlannerFiligreeName(a.name) === normalizeGearPlannerFiligreeName(b.name)
}

export const filigreeSetNames = (filigree: GearPlannerFiligree) =>
  (filigree.grouping ?? '')
    .split('/')
    .map((name) => name.trim())
    .filter(Boolean)

const equippedItems = (equipment: GearPlannerEquipment): readonly GearPlannerItem[] =>
  Object.values(equipment).filter((item): item is GearPlannerItem => item !== null)

export interface GearPlannerSelectedFiligree {
  item: GearPlannerItem
  slotIndex: number
  filigree: GearPlannerFiligree
}

export const collectSelectedGearPlannerFiligrees = (
  equipment: GearPlannerEquipment,
  slottedFiligrees: GearPlannerSlottedFiligrees
): readonly GearPlannerSelectedFiligree[] =>
  equippedItems(equipment).flatMap((item) =>
    Object.entries(slottedFiligrees[item.id] ?? {}).flatMap(([slotIndex, filigree]) => {
      const index = Number(slotIndex)
      return filigree && Number.isInteger(index) && index >= 0 && index < getGearPlannerMaxFiligreeSlots(item)
        ? [{ item, slotIndex: index, filigree }]
        : []
    })
  )
