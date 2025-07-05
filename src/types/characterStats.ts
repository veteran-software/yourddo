import type { Ability, Alignment, Enhancement, Race, Skill, Spell } from './core.ts'

export interface HealingAmplification {
  positive: number
  negative: number
  repair: number
}

export interface HitPoints {
  base: number
  constitutionBonus: number
  featBonus: number
  enchantedBonus: number
}

export interface SpellPoints {
  base: number
  abilityBonus: number
  featBonus: number
  enchantedBonus: number
  fatePointBonus: number
  percentageBoost: number
}

export interface ArmorClass {
  base: number
  dexterityBonus: number
  armorBonus: number
  miscBonus: number
  featBonus: number
}

export interface BlockingArmorBonus {
  base: number
}

export interface FortitudeSavingThrow {
  base: number
  constitutionMod: number
  featBonus: number
  enchantedBonus: number
}

export interface ReflexSavingThrow {
  base: number
  dexterityMod: number
  featBonus: number
  enchantedBonus: number
}

export interface WillSavingThrow {
  base: number
  wisdomMod: number
  featBonus: number
  enchantedBonus: number
}

export interface AttackBonuses {
  doublestrike: number
  doubleshot: number
  meleeAttackSpeedBonus: number
  rangedAttackSpeedBonus: number
  bypassDeflection: number
}

export interface MeleeAndRangedPower {
  meleePower: number
  rangedPower: number
}

export interface SpellDamageTypes {
  acid: number
  chaos: number
  cold: number
  evil: number
  electric: number
  fire: number
  force: number
  lawful: number
  light: number
  negative: number
  poison: number
  positive: number
  repair: number
  sonic: number
  universal: number
}

export interface SpellDamage {
  spellPower: SpellDamageTypes
  critChance: SpellDamageTypes
  critMultiplier: SpellDamageTypes
}

export interface AvoidanceDefenses {
  incorporeality: number
  concealment: number
  dodge: number
  bonusToMaxDodge: number
  chanceToNegateItemWear: number
}

export interface SavingThrowsVs {
  spells: number
  traps: number
  fear: number
  enchantment: number
  curses: number
  illusions: number
  sleep: number
  diseases: number
  exhaustion: number
  nausea: number
  paralysis: number
  poison: number
}

export interface ElementalDefenses {
  acidResistance: number
  coldResistance: number
  electricResistance: number
  fireResistance: number
  lightResistance: number
  negativeResistance: number
  poisonResistance: number
  sonicResistance: number

  acidAbsorption: number
  chaosAbsorption: number
  coldAbsorption: number
  electricAbsorption: number
  evilAbsorption: number
  fireAbsorption: number
  forceAbsorption: number
  goodAbsorption: number
  lawfulAbsorption: number
  lightAbsorption: number
  negativeAbsorption: number
  poisonAbsorption: number
  sonicAbsorption: number

  trapDamageAbsorption: number
  magicResistRatingCapBonus: number
}

export interface Movement {
  movementSpeedMultiplier: number
}

export interface SpellCasting {
  spellCostReduction: number
  spellThreatMultiplier: number
  spellPenetrationBonuses: number
  evocationSchoolBonuses: number
  illusionSchoolBonuses: number
  conjurationSchoolBonuses: number
  abjurationSchoolBonuses: number
  necromancySchoolBonuses: number
  enchantmentSchoolBonuses: number
  transmutationSchoolBonuses: number
  eldritchBlastDice: number
  pactDice: number
  wildSurgeChance: number
  wildSurgeLuckBonus: number
}

export interface GeneralCombat {
  unconsciousnessRange: number
  maxHitPointScalar: number
  helplessDamageBonus: number
  criticalHitConfirmationBonus: number
  criticalHitDamageBonus: number
  fortificationBypass: number
  dodgeBypass: number
  deflectionBypass: number
  sneakAttackToHitBonus: number
  sneakAttackDamageBonus: number
  sneakAttackDice: number
  assassinateBonuses: number
  stunBonuses: number
  sunderBonuses: number
  tripBonuses: number
  critMultBonusOn19or20: number
  bonusImbueDice: number
}

export interface MeleeCombat {
  oneHandedAttackSpeedBonus: number
  twoHandedAttackSpeedBonus: number
  twoWeaponAttackSpeedBonus: number
  quarterstaffAttackSpeedBonus: number
  secondaryShieldBashChance: number
  offhandHitChance: number
  strikethroughChance: number
  meleeThreatMultiplier: number
  meleeAttackBonus: number
  meleeDamageBonus: number
}

export interface RangedCombat {
  bowAttackSpeedBonus: number
  thrownAttackSpeedBonus: number
  nonRepeatingCrossbowAttackSpeed: number
  repeatingCrossbowAttackSpeed: number
  rangedThreatMultiplier: number
  rangedAttackBonus: number
  rangedDamageBonus: number
}

export interface Strength {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface Dexterity {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface Constitution {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface Intelligence {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface Wisdom {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface Charisma {
  base: number
  tome: number
  itemsAndEffects: number
}

export interface DamageReduction {
  type: string[]
}

export interface Resistances {
  acid: number
  cold: number
  electric: number
  fire: number
  sonic: number
  physicalResistanceRating: number
  magicalResistanceRating: number
}

export interface Ki {
  base: number
}

export interface CharacterClass {
  name: string
  icon?: string
  level: number
}

export interface CharacterSkill {
  name: Skill
  keyAbility: Ability
  totalMod: {
    base: number
    tome: number
    ability: number
    featsAndEnhancements: number
    effects: number
  }
  rank: number
  abilityMod: number
  miscMod: number
}

export interface CharacterFeat {
  name?: string
}

export interface Character {
  name: string
  class: [CharacterClass, CharacterClass?, CharacterClass?]
  epicLevels: number
  race: Race
  alignment: Alignment
  gender: 'Male' | 'Female'
  abilities: {
    strength: Strength
    dexterity: Dexterity
    constitution: Constitution
    intelligence: Intelligence
    wisdom: Wisdom
    charisma: Charisma
  }
  hitPoints: HitPoints
  spellPoints: SpellPoints
  ki: Ki
  armorClass: ArmorClass
  blockingArmorBonus: BlockingArmorBonus
  savingThrows: {
    fortitude: FortitudeSavingThrow
    reflex: ReflexSavingThrow
    will: WillSavingThrow
  }
  baseAttackBonus: number
  spellResistance: number
  fortification: number
  tomesOfLearning: string[]
  spellDamage: SpellDamage
  attackBonuses: AttackBonuses
  meleeAndRangedPower: MeleeAndRangedPower
  avoidanceDefenses: AvoidanceDefenses
  savingThrowsVs: SavingThrowsVs
  elementalDefenses: ElementalDefenses
  movement: Movement
  spellCasting: SpellCasting
  generalCombat: GeneralCombat
  // Skills Tab
  skills: CharacterSkill[]
  feats: CharacterFeat[]
  spells: Spell[]
  enhancements: {
    active: Enhancement[]
    passive: Enhancement[]
  }
  destiny: unknown
  craftingLevels: {
    cannith: number
  }
}
