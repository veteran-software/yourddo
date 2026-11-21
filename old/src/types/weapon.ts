import type {
  AbilityShort,
  AlignmentDamage,
  Binding,
  Bludgeoning,
  Cost,
  ElementalDamage,
  OtherDamage,
  PhysicalDamage,
  Piercing,
  Race,
  Ranged,
  Slashing,
  Thrown,
  WeaponClass,
  WeaponHandedness,
  WeaponProficiency
} from './core.ts'

export interface Damage {
  dice: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
  numberOfDice: number
  diceMultiplier?: number
  diceModifier?: number
  type: (PhysicalDamage | ElementalDamage | AlignmentDamage | OtherDamage)[]
  bonus: number
}

export interface CriticalHit {
  range: {
    minimum: number
    maximum: number
  }
  multiplier: number
}

export interface Weapon {
  name: string
  proficiency: WeaponProficiency
  damage: Damage
  criticalProfile?: CriticalHit
  type: Bludgeoning | Piercing | Slashing | Ranged | Thrown
  class: WeaponClass
  race?: Race
  minimumLevel?: number
  requiredTrait?: unknown
  useMagicDevice?: number
  handedness: WeaponHandedness
  attackMod: AbilityShort
  damageMod: AbilityShort
  bind: Binding
  durability: number
  hardness: number
  cost: Cost
  weight: number
  enhancements: string[]
  description: string
  material: string
}
