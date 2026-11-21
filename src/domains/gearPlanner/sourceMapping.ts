import { type GearPlannerSlot, gearPlannerSlots, type GearPlannerSourceItem } from './gearPlanner.types.ts'

export const gearPlannerItemSources = {
  'belt.json': [gearPlannerSlots.waist],
  'boots.json': [gearPlannerSlots.feet],
  'bracers.json': [gearPlannerSlots.wrists],
  'cloak.json': [gearPlannerSlots.cloak],
  'docent.json': [gearPlannerSlots.armor, gearPlannerSlots.ironDefenderArmor, gearPlannerSlots.wolfCompanionArmor],
  'gloves.json': [gearPlannerSlots.hands],
  'goggles.json': [gearPlannerSlots.eyes],
  'heavyArmor.json': [gearPlannerSlots.armor],
  'helmet.json': [gearPlannerSlots.head],
  'lightArmor.json': [gearPlannerSlots.armor],
  'mediumArmor.json': [gearPlannerSlots.armor],
  'necklace.json': [gearPlannerSlots.neck],
  'outfit.json': [gearPlannerSlots.armor],
  'ring.json': [gearPlannerSlots.firstFinger, gearPlannerSlots.secondFinger],
  'robe.json': [gearPlannerSlots.armor],
  'trinket.json': [gearPlannerSlots.trinket],
  'bastardSword.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'battleAxe.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'club.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'dagger.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'dart.json': [gearPlannerSlots.mainHand],
  'dwarvenWarAxe.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'falchion.json': [gearPlannerSlots.mainHand],
  'greatAxe.json': [gearPlannerSlots.mainHand],
  'greatClub.json': [gearPlannerSlots.mainHand],
  'greatCrossbow.json': [gearPlannerSlots.mainHand],
  'greatSword.json': [gearPlannerSlots.mainHand],
  'handAxe.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'handwraps.json': [gearPlannerSlots.mainHand],
  'heavyCrossbow.json': [gearPlannerSlots.mainHand],
  'heavyMace.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'heavyPick.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'kama.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'khopesh.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'kukri.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'lightCrossbow.json': [gearPlannerSlots.mainHand],
  'lightHammer.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'lightMace.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'lightPick.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'longBow.json': [gearPlannerSlots.mainHand],
  'longSword.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'maul.json': [gearPlannerSlots.mainHand],
  'morningstar.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'quarterstaff.json': [gearPlannerSlots.mainHand],
  'quiver.json': [gearPlannerSlots.quiver],
  'rapier.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'repeatingHeavyCrossbow.json': [gearPlannerSlots.mainHand],
  'repeatingLightCrossbow.json': [gearPlannerSlots.mainHand],
  'scimitar.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'shortBow.json': [gearPlannerSlots.mainHand],
  'shortSword.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'shuriken.json': [gearPlannerSlots.mainHand],
  'sickle.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'throwingAxe.json': [gearPlannerSlots.mainHand],
  'throwingDagger.json': [gearPlannerSlots.mainHand],
  'throwingHammer.json': [gearPlannerSlots.mainHand],
  'warhammer.json': [gearPlannerSlots.mainHand, gearPlannerSlots.offHand],
  'buckler.json': [gearPlannerSlots.offHand],
  'largeShield.json': [gearPlannerSlots.offHand],
  'orb.json': [gearPlannerSlots.offHand],
  'runeArm.json': [gearPlannerSlots.offHand],
  'smallShield.json': [gearPlannerSlots.offHand],
  'towerShield.json': [gearPlannerSlots.offHand],
  'collar.json': [gearPlannerSlots.ironDefenderWeapon, gearPlannerSlots.wolfCompanionWeapon]
} as const satisfies Record<string, readonly GearPlannerSlot[]>

const petArmorCollars = new Set([
  'Allegience of the Wild Hunt',
  'Legendary Allegience of the Wild Hunt',
  'Kindred Spirit',
  'Legendary Kindred Spirit'
])

const armorTypes = new Set(['Cloth Armor', 'Docent', 'Heavy Armor', 'Light Armor', 'Medium Armor', 'Robe', 'Outfit'])
const quiverTypes = new Set(['quiver', '', 'bound', 'gear'])

export const sourceSlotsForItem = (fileName: string, item: GearPlannerSourceItem): readonly GearPlannerSlot[] => {
  if (fileName === 'collar.json' && petArmorCollars.has(item.name)) {
    return [gearPlannerSlots.ironDefenderArmor, gearPlannerSlots.wolfCompanionArmor]
  }

  return gearPlannerItemSources[fileName as keyof typeof gearPlannerItemSources] ?? []
}

export const isAcceptedSourceItem = (item: GearPlannerSourceItem, slot: GearPlannerSlot): boolean => {
  if (slot === gearPlannerSlots.armor) return armorTypes.has(item.type ?? '')
  if (slot === gearPlannerSlots.quiver) return quiverTypes.has((item.type ?? '').toLowerCase())
  return true
}
