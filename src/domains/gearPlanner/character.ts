import type { GearPlannerData, GearPlannerItem } from './gearPlanner.types'
import { gearPlannerCharacterSlots, gearPlannerSlots } from './gearPlanner.types'

const WEAPON_TYPES: Record<string, string[]> = {
  Exotic: [
    'Bastard Sword',
    'Dwarven War Axe',
    'Handwraps',
    'Kama',
    'Khopesh',
    'Repeating Heavy Crossbow',
    'Repeating Light Crossbow'
  ],
  Martial: [
    'Battle Axe',
    'Falchion',
    'Great Axe',
    'Great Club',
    'Great Crossbow',
    'Great Sword',
    'Hand Axe',
    'Heavy Pick',
    'Kukri',
    'Light Hammer',
    'Light Pick',
    'Long Bow',
    'Long Sword',
    'Maul',
    'Rapier',
    'Scimitar',
    'Short Bow',
    'Short Sword',
    'Warhammer'
  ],
  Simple: [
    'Club',
    'Dagger',
    'Heavy Crossbow',
    'Heavy Mace',
    'Light Crossbow',
    'Light Mace',
    'Morningstar',
    'Quarterstaff',
    'Sickle'
  ],
  Throwing: ['Dart', 'Shuriken', 'Throwing Axe', 'Throwing Dagger', 'Throwing Hammer']
}

const SHIELD_TYPES = ['Buckler', 'Large Shield', 'Orb', 'Rune Arm', 'Shield', 'Small Shield', 'Tower Shield']

const ARMOR_TYPES = ['Cloth Armor', 'Docent', 'Heavy Armor', 'Light Armor', 'Medium Armor']

interface ClassProficiencies {
  weapons: string[]
  armor: string[]
  shields: string[]
}

const CLASS_PROFICIENCIES: Record<string, ClassProficiencies> = {
  Alchemist: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor'],
    shields: []
  },
  Artificer: {
    weapons: [
      ...WEAPON_TYPES.Simple,
      'Light Hammer',
      'Warhammer',
      'Great Crossbow',
      'Repeating Light Crossbow',
      'Repeating Heavy Crossbow'
    ],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Rune Arm', 'Small Shield']
  },
  Barbarian: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Bard: {
    weapons: [...WEAPON_TYPES.Simple, 'Long Sword', 'Rapier', 'Short Sword', 'Short Bow'],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Cleric: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Druid: {
    weapons: ['Club', 'Dagger', 'Dart', 'Quarterstaff', 'Sickle', 'Unarmed', 'Scimitar'],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  'Favored Soul': {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Fighter: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield', 'Tower Shield']
  },
  Monk: {
    weapons: [...WEAPON_TYPES.Simple, 'Unarmed', 'Hand Axe', 'Handwraps', 'Kama', 'Shuriken'],
    armor: ['Cloth Armor'],
    shields: []
  },
  Paladin: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Ranger: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Rogue: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: []
  },
  Sorcerer: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor'],
    shields: []
  },
  Warlock: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: []
  },
  Wizard: {
    weapons: ['Club', 'Unarmed', 'Dagger', 'Quarterstaff', 'Heavy Crossbow', 'Light Crossbow', 'Throwing Dagger'],
    armor: ['Cloth Armor'],
    shields: []
  }
}

export const classNames = Object.keys(CLASS_PROFICIENCIES)
const weaponTypes = Object.values(WEAPON_TYPES).flat()
export function catalogWeaponTypes(data: GearPlannerData): string[] {
  const types = data.itemsBySlot['Main Hand'].flatMap(({ source }) => (source.type ? [source.type] : []))
  return [...new Set(types)].sort((left, right) => left.localeCompare(right))
}

export function normalizeSavedWeaponFilters(values: readonly unknown[], available: readonly string[]) {
  const normalized = [
    ...new Set(
      values.map((value) => {
        if (value === 'Longsword') return 'Long Sword'
        if (value === 'Handaxe') return 'Hand Axe'
        return value
      })
    )
  ]
  const current = normalized.filter(
    (value) => value !== 'Scepter' && (value !== 'Unarmed' || available.includes('Unarmed'))
  )
  // Preserve an unavailable-only selection: an empty array means all weapons.
  const hasKnownReplacement = current.some(
    (value) => typeof value === 'string' && (weaponTypes.includes(value) || available.includes(value))
  )
  return hasKnownReplacement ? current : normalized
}

export function savedWeaponFilterOptions(available: readonly string[]) {
  return [...available, ...weaponTypes, 'Scepter', 'Unarmed']
}
export interface CharacterSettings {
  classes: string[]
  weapons: string[]
  armor: string[]
  shields: string[]
  focusStats?: string[]
  disabledProficiencies?: ProficiencyKey[]
  allowMetalWithDruid: boolean
}

export const maxFocusStats = 10

export const defaultCharacter = (): CharacterSettings => ({
  classes: [],
  weapons: [],
  armor: [],
  shields: [],
  allowMetalWithDruid: false
})
export const proficiencyOptions = { weapons: weaponTypes, armor: ARMOR_TYPES, shields: SHIELD_TYPES }
export type ProficiencyKey = keyof typeof proficiencyOptions
const twoHandedMelee = new Set([
  'Falchion',
  'Great Axe',
  'Great Club',
  'Great Sword',
  'Handwraps',
  'Maul',
  'Quarterstaff'
])

export function weaponGroup(type: string) {
  if (WEAPON_TYPES.Throwing.includes(type)) return 'Throwing weapons'
  if (/bow$/i.test(type)) return 'Ranged weapons'
  return twoHandedMelee.has(type) ? 'Two-handed weapons' : 'One-handed weapons'
}

export function proficiencyGroups(weapons: string[]) {
  const group = (title: string, key: ProficiencyKey, types: string[]) => ({ title, key, types })
  const weapon = (title: string) =>
    group(
      title,
      'weapons',
      weapons.filter((type) => weaponGroup(type) === title)
    )
  return [
    weapon('One-handed weapons'),
    weapon('Two-handed weapons'),
    group('Off-hand items', 'shields', SHIELD_TYPES),
    weapon('Ranged weapons'),
    weapon('Throwing weapons'),
    group('Armor', 'armor', ARMOR_TYPES)
  ]
}

export function selectedProficiencies(settings: CharacterSettings, key: ProficiencyKey, available: string[]) {
  if (settings.disabledProficiencies?.includes(key)) return []
  return settings[key].length ? available.filter((type) => settings[key].includes(type)) : available
}

export function updateProficiencyGroup(
  settings: CharacterSettings,
  key: ProficiencyKey,
  available: string[],
  group: string[],
  selection: string[]
): CharacterSettings {
  const selected = selectedProficiencies(settings, key, available)
  const values = available.filter((type) => (group.includes(type) ? selection.includes(type) : selected.includes(type)))
  const { disabledProficiencies = [], ...rest } = settings
  const disabled = disabledProficiencies.filter((category) => category !== key)
  if (!values.length) disabled.push(key)
  return {
    ...rest,
    [key]: values.length === available.length ? [] : values,
    ...(disabled.length && { disabledProficiencies: disabled })
  }
}

export function changeClasses(
  current: CharacterSettings,
  classes: string[],
  availableWeapons: readonly string[] = weaponTypes
): CharacterSettings {
  const next = { ...current, classes }
  for (const key of ['weapons', 'armor', 'shields'] as const) {
    if (current.disabledProficiencies?.includes(key)) continue
    const previous = new Set(current.classes.flatMap((c) => CLASS_PROFICIENCIES[c][key]))
    if (
      key === 'weapons' &&
      current.weapons.length &&
      current.weapons.every((value) => !availableWeapons.includes(value))
    )
      continue
    const granted = classes
      .flatMap((c) => CLASS_PROFICIENCIES[c][key])
      .filter((value) => key !== 'weapons' || availableWeapons.includes(value))
    next[key] = [...new Set([...current[key].filter((value) => !previous.has(value)), ...granted])]
  }
  return next
}
export const ownerSlots = {
  Character: gearPlannerCharacterSlots,
  'Iron Defender': [gearPlannerSlots.ironDefenderArmor, gearPlannerSlots.ironDefenderWeapon],
  'Wolf Companion': [gearPlannerSlots.wolfCompanionArmor, gearPlannerSlots.wolfCompanionWeapon]
} as const

export type GearOwner = keyof typeof ownerSlots
export function slotOwner(slot: string): GearOwner {
  if (slot === gearPlannerSlots.ironDefenderArmor || slot === gearPlannerSlots.ironDefenderWeapon)
    return 'Iron Defender'
  if (slot === gearPlannerSlots.wolfCompanionArmor || slot === gearPlannerSlots.wolfCompanionWeapon)
    return 'Wolf Companion'
  return 'Character'
}
export function enabledOwners(classes: readonly string[]): GearOwner[] {
  const owners: GearOwner[] = ['Character']
  if (classes.includes('Artificer')) owners.push('Iron Defender')
  if (classes.includes('Druid')) owners.push('Wolf Companion')
  return owners
}
const metals = new Set([
  'steel',
  'iron',
  'gold',
  'silver',
  'mithral',
  'adamantine',
  'alchemical silver',
  'cold iron',
  'flametouched iron',
  'byeshk',
  'bronze',
  'copper',
  'dwarven iron',
  'magesteel',
  'planeforged steel',
  'spiritforged iron'
])
export const isMetalMaterial = (material?: string) => metals.has(material?.trim().toLowerCase() ?? '')

function proficiencyGroup(slot: GearPlannerItem['slot'], shield: boolean) {
  if (slot === 'Armor') return 'armor'
  if (slot === 'Main Hand') return 'weapons'
  if (slot === 'Off Hand') return shield ? 'shields' : 'weapons'
  return null
}

export function violatesDruidicOath(
  settings: CharacterSettings,
  item: GearPlannerItem,
  material = item.source.material
) {
  const type = item.source.type ?? ''
  const covered =
    item.slot === 'Armor' ||
    (item.slot === 'Off Hand' && SHIELD_TYPES.includes(type) && type !== 'Orb' && type !== 'Rune Arm')
  return covered && settings.classes.includes('Druid') && !settings.allowMetalWithDruid && isMetalMaterial(material)
}

export function characterAllowsItem(
  settings: CharacterSettings,
  item: GearPlannerItem,
  material = item.source.material
) {
  if (violatesDruidicOath(settings, item, material)) return false
  if (slotOwner(item.slot) !== 'Character') return true
  const type = item.source.type ?? ''
  const shield = SHIELD_TYPES.includes(type)
  const key = proficiencyGroup(item.slot, shield)
  if (key && settings.disabledProficiencies?.includes(key)) return false
  if (item.essenceCrafting) return true
  return (
    !key || !settings[key].length || settings[key].includes(type === 'Robe' || type === 'Outfit' ? 'Cloth Armor' : type)
  )
}
