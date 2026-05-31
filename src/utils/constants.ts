import {
  GearSlot,
  type GearSlot as GearSlotType
} from '../pages/gearPlanner/types.ts'

export const BASIC_ELEMENTS: string[] = ['Air', 'Earth', 'Fire', 'Water', 'Positive Energy', 'Negative Energy']

export const FOCI: string[] = [
  ...BASIC_ELEMENTS,
  'Ash',
  'Dust',
  'Ice',
  'Lightning',
  'Magma',
  'Mineral',
  'Ooze',
  'Radiance',
  'Salt',
  'Smoke',
  'Steam',
  'Vacuum',
  'Balance of Land and Sky',
  'Existential Stalemate',
  'Tempered'
]

export const ESSENCES: string[] = ['Material', 'Ethereal']

export const GEMS: string[] = ['Dominion', 'Opposition', 'Escalation']

export const ICON_BASE = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/'

export const SLOT_MAP: Record<string, GearSlotType[]> = {
  'belt.json': [GearSlot.Waist],
  'boots.json': [GearSlot.Feet],
  'bracers.json': [GearSlot.Wrists],
  'cloak.json': [GearSlot.Cloak],
  'docent.json': [GearSlot.Armor, GearSlot.ArtificerPetArmor, GearSlot.DruidPetArmor],
  'gloves.json': [GearSlot.Hands],
  'goggles.json': [GearSlot.Eyes],
  'heavyArmor.json': [GearSlot.Armor],
  'helmet.json': [GearSlot.Head],
  'lightArmor.json': [GearSlot.Armor],
  'mediumArmor.json': [GearSlot.Armor],
  'necklace.json': [GearSlot.Neck],
  'outfit.json': [GearSlot.Armor],
  'ring.json': [GearSlot.FirstFinger, GearSlot.SecondFinger],
  'robe.json': [GearSlot.Armor],
  'trinket.json': [GearSlot.Trinket],
  // Weapons
  'bastardSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'battleAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'club.json': [GearSlot.MainHand, GearSlot.OffHand],
  'dagger.json': [GearSlot.MainHand, GearSlot.OffHand],
  'dart.json': [GearSlot.MainHand],
  'dwarvenWarAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'falchion.json': [GearSlot.MainHand],
  'greatAxe.json': [GearSlot.MainHand],
  'greatClub.json': [GearSlot.MainHand],
  'greatCrossbow.json': [GearSlot.MainHand],
  'greatSword.json': [GearSlot.MainHand],
  'handAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'handwraps.json': [GearSlot.MainHand],
  'heavyCrossbow.json': [GearSlot.MainHand],
  'heavyMace.json': [GearSlot.MainHand, GearSlot.OffHand],
  'heavyPick.json': [GearSlot.MainHand, GearSlot.OffHand],
  'kama.json': [GearSlot.MainHand, GearSlot.OffHand],
  'khopesh.json': [GearSlot.MainHand, GearSlot.OffHand],
  'kukri.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightCrossbow.json': [GearSlot.MainHand],
  'lightHammer.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightMace.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightPick.json': [GearSlot.MainHand, GearSlot.OffHand],
  'longBow.json': [GearSlot.MainHand],
  'longSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'maul.json': [GearSlot.MainHand],
  'morningstar.json': [GearSlot.MainHand, GearSlot.OffHand],
  'quarterstaff.json': [GearSlot.MainHand],
  'quiver.json': [GearSlot.Quiver],
  'rapier.json': [GearSlot.MainHand, GearSlot.OffHand],
  'repeatingHeavyCrossbow.json': [GearSlot.MainHand],
  'repeatingLightCrossbow.json': [GearSlot.MainHand],
  'scimitar.json': [GearSlot.MainHand, GearSlot.OffHand],
  'shortBow.json': [GearSlot.MainHand],
  'shortSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'shuriken.json': [GearSlot.MainHand],
  'sickle.json': [GearSlot.MainHand, GearSlot.OffHand],
  'throwingAxe.json': [GearSlot.MainHand],
  'throwingDagger.json': [GearSlot.MainHand],
  'throwingHammer.json': [GearSlot.MainHand],
  'warhammer.json': [GearSlot.MainHand, GearSlot.OffHand],
  'filigrees.json': [GearSlot.Filigree],
  // Shields & Rune Arms
  'buckler.json': [GearSlot.OffHand],
  'largeShield.json': [GearSlot.OffHand],
  'orb.json': [GearSlot.OffHand],
  'runeArm.json': [GearSlot.OffHand],
  'smallShield.json': [GearSlot.OffHand],
  'towerShield.json': [GearSlot.OffHand],
  // Pet Items
  'collar.json': [GearSlot.ArtificerPetWeapon, GearSlot.DruidPetWeapon]
}
