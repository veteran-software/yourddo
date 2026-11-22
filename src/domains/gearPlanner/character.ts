import type { GearPlannerItem } from './gearPlanner.types'
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
    weapons: [...WEAPON_TYPES.Simple, 'Hand Axe', 'Handwraps', 'Kama', 'Shuriken'],
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
    weapons: ['Club', 'Scepter', 'Dagger', 'Quarterstaff', 'Heavy Crossbow', 'Light Crossbow', 'Throwing Dagger'],
    armor: ['Cloth Armor'],
    shields: []
  }
}

export const classNames = Object.keys(CLASS_PROFICIENCIES)
const weaponTypes = [
  ...new Set([...Object.values(WEAPON_TYPES).flat(), ...Object.values(CLASS_PROFICIENCIES).flatMap((p) => p.weapons)])
].sort((left, right) => left.localeCompare(right))
export interface CharacterSettings {
  classes: string[]
  weapons: string[]
  armor: string[]
  shields: string[]
  allowMetalWithDruid: boolean
}

export const defaultCharacter = (): CharacterSettings => ({
  classes: [],
  weapons: [],
  armor: [],
  shields: [],
  allowMetalWithDruid: false
})
export const proficiencyOptions = { weapons: weaponTypes, armor: ARMOR_TYPES, shields: SHIELD_TYPES }
export function changeClasses(current: CharacterSettings, classes: string[]): CharacterSettings {
  const next = { ...current, classes }
  for (const key of ['weapons', 'armor', 'shields'] as const) {
    const previous = new Set(current.classes.flatMap((c) => CLASS_PROFICIENCIES[c][key]))
    const granted = classes.flatMap((c) => CLASS_PROFICIENCIES[c][key])
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
  if (item.essenceCrafting || slotOwner(item.slot) !== 'Character') return true
  const type = item.source.type ?? ''
  const shield = SHIELD_TYPES.includes(type)
  const key = proficiencyGroup(item.slot, shield)
  return (
    !key || !settings[key].length || settings[key].includes(type === 'Robe' || type === 'Outfit' ? 'Cloth Armor' : type)
  )
}
