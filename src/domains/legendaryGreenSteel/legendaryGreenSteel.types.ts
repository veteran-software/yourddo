export interface LgsRequirement {
  id: number
  name: string
  quantity: number
}

export interface LgsRecipe {
  id: number
  name: string
  craftedIn: string
  requirements: readonly LgsRequirement[]
}

interface SlottedItem extends LgsRecipe {
  slotTypes: readonly string[]
}

export interface LgsBaseItem extends SlottedItem {
  type: 'weapon' | 'equipment'
  effects: readonly string[]
  details: readonly string[]
  discrepancies: readonly string[]
}

export interface LgsTierAugment extends SlottedItem {
  focuses: readonly string[]
  essence: string
  gem: string
  effects: readonly string[]
  details: readonly string[]
  discrepancies: readonly string[]
}

export interface LgsActiveAugment extends SlottedItem {
  displayName: string
  discrepancies: readonly string[]
  description: string
  spellDetails: string
}

export interface WeaponFocusRule {
  tier1And2: readonly [string, string]
  tier3: readonly [string, string]
}

export interface LgsBonusEffect {
  requiredFocuses?: WeaponFocusRule
  name: string
  group: 'Weapon bonuses' | 'Equipment sets'
  discrepancies: readonly string[]
  paragraphs: readonly string[]
  notes: readonly string[]
}

export interface LgsData {
  baseItems: readonly LgsBaseItem[]
  tier1: readonly LgsTierAugment[]
  tier2: readonly LgsTierAugment[]
  tier3: readonly LgsTierAugment[]
  activeAugments: readonly LgsActiveAugment[]
  bonusEffects: readonly LgsBonusEffect[]
  explicitNoEffect: readonly WeaponFocusRule[]
  craftingComponents: readonly LgsRecipe[]
  immortalsHeart: SlottedItem
}

export interface LgsPlan {
  baseItemName: string | null
  tier1Name: string | null
  tier2Name: string | null
  tier3Name: string | null
  bonusEffectName: string | null
  activeAugmentName: string | null
  useImmortalsHeart?: true
}

export interface LgsIngredientPlan {
  rawMaterials: readonly LgsRequirement[]
  craftedMaterials: readonly LgsRequirement[]
}
