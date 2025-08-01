export type Ability = 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma'

export type Skill =
  | 'Balance'
  | 'Bluff'
  | 'Jump'
  | 'Spellcraft'
  | 'Tumble'
  | 'Use Magic Device'
  | 'Concentration'
  | 'Diplomacy'
  | 'Disable Device'
  | 'Haggle'
  | 'Heal'
  | 'Hide'
  | 'Intimidate'
  | 'Listen'
  | 'Move Silently'
  | 'Open Lock'
  | 'Perform'
  | 'Repair'
  | 'Search'
  | 'Spot'
  | 'Swim'

export type AbilityLong = 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma'
export type AbilityShort = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export type Alignment =
  | 'Chaotic Evil'
  | 'Chaotic Good'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Lawful Good'
  | 'Lawful Neutral'
  | 'Neutral Evil'
  | 'Neutral Good'
  | 'True Neutral'

export type Bonus =
  | 'Action Boost'
  | 'Alchemical'
  | 'Armor'
  | 'Artifact'
  | 'Circumstance'
  | 'Combat Style'
  | 'Competence'
  | 'Determination'
  | 'Divine'
  | 'Enhancement'
  | 'Epic'
  | 'Equipment'
  | 'Exceptional'
  | 'Feat'
  | 'Festive'
  | 'Fortune'
  | 'Guild'
  | 'Implement'
  | 'Inherent'
  | 'Insight'
  | 'Legendary'
  | 'Luck'
  | 'Morale'
  | 'Music'
  | 'Mythic'
  | 'Natural Armor'
  | 'On-damage : 3 sec'
  | 'On-hit'
  | 'On-hit : 5% Chance'
  | 'On-vorpal'
  | 'Orb'
  | 'per 10 sec'
  | 'per minute'
  | 'Primal'
  | 'Profane'
  | 'Psionic'
  | 'Quality'
  | 'Rage'
  | 'Reaper'
  | 'Resistance'
  | 'Sacred'
  | 'Shield'
  | 'Size'
  | 'Special'
  | '--Craftable'
  | 'Stacking'
  | 'Vitality'

export type Condition =
  | 'Ability Damage'
  | 'Ability Drained'
  | 'Ashscarred'
  | 'Bleeding Wound'
  | 'Blinded'
  | 'Blown Away'
  | 'Bluffed'
  | 'Brittleskin'
  | 'Burden of Guilt'
  | 'Burdened'
  | 'Checked'
  | 'Confused'
  | 'Cowering'
  | 'Crippled'
  | 'Cursed Wound'
  | 'Dazed'
  | 'Dazzled'
  | 'Dead'
  | 'Deafened'
  | 'Deconstructed'
  | 'Disoriented'
  | 'Energy Drained'
  | 'Engulfed - Slow'
  | 'Entangled'
  | 'Exhausted'
  | 'Fascinated'
  | 'Fatigued'
  | 'Flat-footed'
  | 'Focused Heat'
  | 'Frightened'
  | 'Grappling'
  | 'Grip of Strahd'
  | 'Hamstring'
  | 'Harried'
  | 'Held'
  | 'Helpless'
  | 'Impeded'
  | 'Incorporeal'
  | 'Insanity'
  | 'Invisible'
  | 'Lethargy'
  | 'Mummy Rot'
  | "Mummy's Curse"
  | 'Nauseated'
  | 'Over-level Item Encumbrance'
  | 'Overconfident'
  | 'Overloaded'
  | 'Paralyzed'
  | 'Petrified'
  | 'Poison'
  | 'Poison Weakness'
  | 'Prone'
  | 'Psionic Shockwave Stun'
  | 'Shaken'
  | 'Sickened'
  | 'Silenced'
  | 'Sleep'
  | 'Slow'
  | 'Stabilized'
  | 'Staggered'
  | 'Stunned'
  | 'Taint of Shadow'
  | 'They Carry My Vengeance'
  | 'Turned'
  | 'Unconscious'
  | 'Vulnerable'
  | 'Web Line Trip'
  | 'Wrack (spell)'
  | "Wraith's Lingering Touch"

export type DamageType =
  | 'Adamantine'
  | AlignmentDamage
  | 'Bane'
  | PhysicalDamage
  | 'Byeshk'
  | 'Cold Iron'
  | 'Crystal'
  | 'Epic'
  | 'Force'
  | 'Mithral'
  | 'Silver'
  | ElementalDamage
  | OtherDamage
  | 'All Spells'

export type EnvironmentalEffect =
  | 'Aqua Sphere'
  | 'Deep Water'
  | 'Dimensional Anchor'
  | 'Environmental Death Effect'
  | 'Heavy Gravity'
  | 'Light Gravity'
  | 'Underdark Environmental Effects'
  | 'Wild Surge'

export type SavingThrow = 'Fortitude' | 'Reflex' | 'Will'

export type EnergyType = 'Negative Energy' | 'Positive Energy'

export type PhysicalDamage = 'Bludgeoning' | 'Piercing' | 'Slashing'

export type ElementalDamage = 'Acid' | 'Cold' | 'Electric' | 'Fire' | 'Sonic' | EnergyType

export type AlignmentDamage = 'Evil' | 'Good' | 'Law' | 'Chaotic'

export type OtherDamage =
  | 'Force'
  | 'Light'
  | 'Magic'
  | 'Negative'
  | 'Poison'
  | 'Positive'
  | 'Repair'
  | 'Rust'
  | 'Untyped'

export type WeaponProficiency = 'Simple' | 'Martial' | 'Exotic'

export type WeaponClass = 'Bludgeoning' | 'Piercing' | 'Slashing' | 'Ranged' | 'Thrown'

export type Bludgeoning =
  | 'Club'
  | 'Greatclub'
  | 'Handwraps'
  | 'Heavy Mace'
  | 'Light Hammer'
  | 'Light Mace'
  | 'Maul'
  | 'Morningstar'
  | 'Quarterstaff'
  | 'Unarmed'
  | 'Warhammer'

export type Piercing = 'Dagger' | 'Heavy Pick' | 'Light Pick' | 'Rapier' | 'Shortsword'

export type Slashing =
  | 'Bastard Sword'
  | 'Battleaxe'
  | 'Dwarven Axe'
  | 'Falchion'
  | 'Greataxe'
  | 'Greatsword'
  | 'Handaxe'
  | 'Kama'
  | 'Khopesh'
  | 'Kukri'
  | 'Longsword'
  | 'Scimitar'
  | 'Sickle'

export type Ranged =
  | 'Great Crossbow'
  | 'Heavy Crossbow'
  | 'Light Crossbow'
  | 'Longbow'
  | 'Repeating Heavy Crossbow'
  | 'Repeating Light Crossbow'
  | 'Shortbow'

export type Thrown = 'Dart' | 'Shuriken' | 'Throwing Axe' | 'Throwing Dagger' | 'Throwing Hammer'

export type Race =
  | 'Dragonborn'
  | 'Drow'
  | 'Dwarf'
  | 'Elf'
  | 'Gnome'
  | 'Half-Elf'
  | 'Half-Orc'
  | 'Halfling'
  | 'Human'
  | 'Tiefling'
  | 'Warforged'
  | 'Wood Elf'
  | 'Aasimar'
  | 'Eladrin'
  | 'Shifter'
  | 'Tabaxi'
  | 'Bladeforged'
  | 'Chaosmancer'
  | 'Deep Gnome'
  | 'Morninglord'
  | 'Purple Dragon Knight'
  | 'Razorclaw'
  | 'Scoundrel'
  | 'Scourge'
  | 'Shadar-kai'
  | 'Trailblazer'

export type WeaponHandedness = 'Light' | 'One-handed' | 'Two-handed' | 'Ranged' | 'Thrown'

export type BindingType = 'Bound' | 'Unbound'

export type BindingLocation = 'Character' | 'Account'

export type BindingWhen = 'Acquisition' | 'Equip'

// INTERFACES
export interface Binding {
  type: BindingType
  to?: BindingLocation
  from?: BindingWhen
}

export interface Cost {
  copper?: number
  silver?: number
  gold?: number
  platinum?: number
}

export interface Enhancement {
  ability?: AbilityLong
  basePriceModifier?: BasePriceModifier
  bonus?: Bonus
  damage?: DamageType[]
  description?: string
  minLevelIncrease?: {
    noMinimumLevel?: number
    minimumLevel?: number
  }
  modifier?: number | string
  name: string
  type?: 'Prefix' | 'Suffix' | '--Crafting'
  notes?: string
  charges?: number
  rechargePerDay?: number
}

export interface BasePriceModifier {
  randomLoot?: number
  cannithCrafting?: number
}

export interface Ring {
  name: string
  slot: ('First Finger' | 'Second Finger')[]
  ingredientType?: string
  minimumLevel: number
  binding?: Binding
  exclusive: boolean
  cost: Cost
  weight: number
  material: string
  hardness: number
  durability: number
  enchantments: Enhancement[]
  notes?: string
}

export interface Spell {
  name: string
  description?: string
  casterLevel?: number
  charges?: number
  rechargePerDay?: number
  target?: string[]
  duration?: string
  school?: string
}
