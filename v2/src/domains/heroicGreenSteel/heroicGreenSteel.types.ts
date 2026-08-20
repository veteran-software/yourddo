export type HgsItemType = 'weapon' | 'equipment'
export type HgsTier3Mode = 'basic' | 'focused'
export type HgsShardType = 'single' | 'compound'

export interface HgsDevice {
  id: number
  name: string
}

export interface HgsManifest {
  schemaVersion: 1
  system: 'heroic-green-steel'
  sourceVersion: string
  devices: Record<'base' | 'tier1' | 'tier2' | 'tier3', HgsDevice>
  resources: {
    baseItems: string
    effects: string
    spells: string
    ingredients: string
    tiers: { tier1: string; tier2: string; tier3Basic: string; tier3Focused: string }
    recipes: { base: string; tier1: string; tier2: string; tier3: string }
  }
}

export interface HgsBaseItem {
  id: number
  name: string
  description: string
  iconId?: number
  recipeId: number
  type: HgsItemType
  weaponType?: string
}

export interface HgsDice {
  count: number
  sides: number
}

export interface HgsDiceValue {
  dice: HgsDice
}

export interface HgsSave {
  dc: number
  type: string
}

export interface HgsMechanic {
  type?: string
  name?: string
  value?: number | HgsDiceValue
  amount?: HgsDiceValue
  bonusType?: string
  unit?: string
  traits?: string[]
  target?: string
  rawModifier?: number
  damageType?: string
  dice?: HgsDice
  intervalSeconds?: number
  multiplier?: number
  materials?: string[]
  save?: HgsSave
  durationType?: string
  entityId?: number
}

export interface HgsProc {
  trigger: string
  procChance?: number
  outcomes: HgsMechanic[]
}

export interface HgsEffect {
  id: number
  displayName: string
  description: string
  enchantments: HgsMechanic[]
  procs: HgsProc[]
}

export interface HgsSpell {
  id: number
  name: string
  description: string
  casterLevel: number
  charges: number
  rechargePerDay: number
}

export interface HgsIngredient {
  id: number
  name: string
  description: string
  iconId?: number
}

export interface HgsTierOption {
  id: number
  name: string
  type: HgsItemType
  essence: string
  focus: string
  gem: string
  aspect?: string
  requiresFocus?: string
  requiresAspect?: string
  shardType?: HgsShardType
  focuses?: string[]
  effectIds: number[]
  spellId?: number
  recipeId: number
}

export interface HgsRecipeIngredient {
  ingredientId: number
  quantity: number
  producerRecipeId?: number
}

export interface HgsRecipe {
  id: number
  name: string
  description?: string
  iconId?: number
  device: 'base' | 'tier1' | 'tier2' | 'tier3'
  ingredients: HgsRecipeIngredient[]
}

export interface HgsInitialData {
  manifest: HgsManifest
  baseItems: HgsBaseItem[]
  effects: HgsEffect[]
  tier1: HgsTierOption[]
  baseItemById: Map<number, HgsBaseItem>
  effectById: Map<number, HgsEffect>
  tier1ById: Map<number, HgsTierOption>
}

export interface HgsTier2Data {
  tier2: HgsTierOption[]
  spells: HgsSpell[]
  tier2ById: Map<number, HgsTierOption>
  spellById: Map<number, HgsSpell>
}

export interface HgsTier3Data {
  tier3Basic: HgsTierOption[]
  tier3Focused: HgsTierOption[]
  tier3BasicById: Map<number, HgsTierOption>
  tier3FocusedById: Map<number, HgsTierOption>
}

export interface HgsRecipeData {
  ingredients: HgsIngredient[]
  recipes: HgsRecipe[]
  ingredientById: Map<number, HgsIngredient>
  recipeById: Map<number, HgsRecipe>
}

export interface HgsSelection {
  selectedBaseItemId: number | null
  selectedTier1Id: number | null
  selectedTier2Id: number | null
  selectedTier3Mode: HgsTier3Mode | null
  selectedTier3Id: number | null
}

export interface HgsIngredientTotal {
  ingredient: HgsIngredient
  quantity: number
}

export interface HgsIngredientPlan {
  terminal: HgsIngredientTotal[]
  crafted: HgsIngredientTotal[]
}
