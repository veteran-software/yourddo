export interface ICannithShard {
  name: string
  enchantments?: Enchantment[]
  bound: Bound
  unbound: Bound
  prefixTitle?: null | string
  suffixTitle?: null | string
  prefix: null | string
  suffix: null | string
  extra: null | string
  group: string
  minLevelIncrease: MinLevelIncrease
  stat: Stat[]
}

export interface Bound {
  level: number
  essence: number
  purified: number | null
  collectible: Collectible[]
}

export interface Collectible {
  name: string
  qty: number
}

export interface Enchantment {
  name: string
  statModified: StatModified
  bonusType: BonusType
}

export type BonusType =
  | 'Enhancement'
  | 'Resistance'
  | 'Competence'
  | 'Profane'
  | 'Insight'
  | 'Equipment'
  | 'Natural Armor'
  | 'Deflection'
  | 'Vitality'
  | 'Clickie'

export type StatModified = string[] | string

export type MinLevelIncrease = number | null | string

export type Stat = number | string
