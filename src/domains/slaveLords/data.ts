export type SlaveLordsTier = 'heroic' | 'legendary'
export type SlaveLordsCategory = 'prefix' | 'suffix' | 'extra' | 'bonus' | 'set' | 'augment' | 'mythic'

interface Identified {
  id: number
}
interface Named extends Identified {
  name: string
}
interface RawBase extends Named {
  tier: SlaveLordsTier
  kind: string
  type: string
  ingredientType?: string
  description: string
  minimumLevel: number
  baseStats: { equipSlots: string[] }
  craftingSlots: Identified[]
}
interface Ingredient extends Named {
  sources?: { name: string; method: string; availability: string }[]
}
interface Option extends Named {
  category: SlaveLordsCategory
  applicationRecipeIds: number[]
  recipeId?: number
  effectIds?: number[]
  setId?: number
}
interface Recipe extends Identified {
  description: string
  ingredients: { ingredientId: number; quantity: number }[]
  keeper?: { itemId?: number; itemType?: string; ingredientType?: string; requiredMutationIds?: number[] }
  knownDiscrepancies?: { stated: number | string; resolved: number | string; unit: string }[]
}
interface Enchantment {
  name?: string
  displayName?: string
  bonusType?: string
  value?: number | boolean
  operation?: string
  unit?: string
}
interface Effect extends Identified {
  displayName: string
  description?: string
  enchantments: Enchantment[]
  slotTypes?: string[]
  slotBonuses?: { equipSlots: string[]; bonusType: string; stats: string[]; value: number }[]
}
interface RawSet extends Named {
  tier: SlaveLordsTier
  thresholds: { pieces: number; effectId: number }[]
}
interface TierResources {
  options: Option[]
  recipes: Recipe[]
  effects: Effect[]
}
export interface SlaveLordsResources {
  bases: RawBase[]
  ingredients: Ingredient[]
  sets: RawSet[]
  heroic: TierResources
  legendary: TierResources
}

export interface SlaveLordsStat {
  stat: string
  bonusType: string
  value: number
  calculationValue?: number
  formattedValue: string
}
export interface SlaveLordsCost extends Named {
  quantity: number
  sources: string[]
}
export interface SlaveLordsOption extends Named {
  category: SlaveLordsCategory
  description: string
  effects: SlaveLordsStat[]
  slotBonuses: { equipSlots: string[]; effects: SlaveLordsStat[] }[]
  costs: SlaveLordsCost[]
  discrepancies: string[]
  setId?: number
  augmentTypes: string[]
}
export interface SlaveLordsBase extends Named {
  tier: SlaveLordsTier
  kind: string
  minimumLevel: number
  description: string
  equipSlots: string[]
  options: SlaveLordsOption[]
}
export interface SlaveLordsSet extends Named {
  tier: SlaveLordsTier
  thresholds: { pieces: number; effects: SlaveLordsStat[] }[]
}
export interface SlaveLordsData {
  bases: SlaveLordsBase[]
  sets: SlaveLordsSet[]
}

function recordsById<T extends Identified>(records: T[], label: string) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('Missing Slave Lords ' + label)
  const index = new Map<number, T>()
  for (const record of records) {
    if (!Number.isSafeInteger(record?.id) || index.has(record.id)) throw new Error('Invalid Slave Lords ID in ' + label)
    index.set(record.id, record)
  }
  return (id: number) => {
    const record = index.get(id)
    if (!record) throw new Error('Unknown Slave Lords ' + label + ' ID ' + String(id))
    return record
  }
}

const statNames: Readonly<Record<string, string>> = {
  Combat_SneakAttackToHitBonus: 'Sneak Attack to Hit',
  Combat_SneakAttackDamageAdder: 'Sneak Attack Damage',
  Combat_CriticalConfirmationBonus: 'Critical Confirmation Rolls',
  Feat_ArmorPiercing: 'Fortification Bypass',
  Effect_SpellPenetrationBonus_Level9: 'Spell Penetration (Level 9)',
  'Action@Agent.DCBoostFromEffectsTrip': 'Tactical DC: Trip',
  'Action@Agent.DCBoostFromEffectsImprovedTrip': 'Tactical DC: Improved Trip',
  'Action@Agent.DCBoostFromEffectsSunder': 'Tactical DC: Sunder',
  'Action@Agent.DCBoostFromEffectsImprovedSunder': 'Tactical DC: Improved Sunder',
  'Action@Agent.DCBoostFromEffectsStunningBlow': 'Tactical DC: Stunning',
  'Save.Will::m_nMagicEffectBonus': 'Will Save vs. Spells',
  'Save.Reflex::m_nMagicEffectBonus': 'Reflex Save vs. Spells',
  'Save.Fortitude::m_nMagicEffectBonus': 'Fortitude Save vs. Spells'
}

function statName(name: string, property?: string) {
  if (property?.startsWith('Skill_')) return 'Skill: ' + name
  return name.replace(/^(.+) (Spell Power|Spell Critical Chance|Spell DC)$/u, '$2: $1')
}

function effectsFor(effect: Effect): SlaveLordsStat[] {
  return effect.enchantments.flatMap((entry) => {
    const name = entry.displayName ?? statNames[entry.name ?? '']
    if (!name || !entry.bonusType || typeof entry.value !== 'number' || !Number.isFinite(entry.value)) return []
    // Power coefficients are hundredths of a point; percentages already use percentage points.
    // Published power and percent labels use the whole part of the scaled value.
    const scaled = entry.unit === 'coefficient' ? entry.value * 100 : entry.value
    const magnitude =
      entry.unit === 'coefficient' || entry.unit === 'percent' ? Math.trunc(Number(scaled.toFixed(5))) : scaled
    const value = magnitude * (entry.operation === 'Subtract' ? -1 : 1)
    return [
      {
        stat: statName(name, entry.name),
        bonusType: entry.bonusType,
        value,
        ...(magnitude !== scaled && { calculationValue: scaled * (entry.operation === 'Subtract' ? -1 : 1) }),
        formattedValue: String(value) + (entry.unit === 'percent' ? '%' : '')
      }
    ]
  })
}

function acceptsBase(base: RawBase, recipe: Recipe) {
  const keeper = recipe.keeper
  return (
    !!keeper &&
    (!keeper.itemId || keeper.itemId === base.id) &&
    (!keeper.itemType || keeper.itemType === base.type) &&
    (!keeper.ingredientType || keeper.ingredientType === base.ingredientType) &&
    (keeper.requiredMutationIds ?? []).every((id) => base.craftingSlots.some((slot) => slot.id === id))
  )
}

function buildOption(
  option: Option,
  application: Recipe,
  findRecipe: (id: number) => Recipe,
  findEffect: (id: number) => Effect,
  findIngredient: (id: number) => Ingredient
): SlaveLordsOption {
  const effects = (option.effectIds ?? []).map(findEffect)
  const recipe = option.recipeId === undefined ? application : findRecipe(option.recipeId)
  const slotBonuses = effects
    .flatMap((effect) => effect.slotBonuses ?? [])
    .map(({ equipSlots, stats, value, bonusType }) => ({
      equipSlots,
      effects: stats.map((name) => ({ stat: statName(name), bonusType, value, formattedValue: String(value) }))
    }))
  const mythicValue = slotBonuses[0]?.effects[0]?.value
  return {
    id: option.id,
    name: mythicValue === undefined ? option.name : option.name + ' +' + String(mythicValue),
    category: option.category,
    description:
      effects.map((effect) => effect.description ?? effect.displayName).join('\n') || application.description,
    effects: effects.flatMap(effectsFor),
    slotBonuses,
    costs: recipe.ingredients.map(({ ingredientId, quantity }) => {
      const ingredient = findIngredient(ingredientId)
      const sources = (ingredient.sources ?? []).map((source) => {
        const label = source.method === 'container_location_unknown' ? source.name + ' (location unknown)' : source.name
        return source.availability === 'unverified' && source.method !== 'container_location_unknown'
          ? label + ' (unverified)'
          : label
      })
      return { id: ingredientId, name: ingredient.name, quantity, sources: [...new Set(sources)] }
    }),
    discrepancies: (application.knownDiscrepancies ?? recipe.knownDiscrepancies ?? []).map(
      ({ stated, resolved, unit }) => {
        const suffix = unit === 'percent' ? '%' : ''
        return 'Stated ' + String(stated) + suffix + ', actual ' + String(resolved) + suffix + '.'
      }
    ),
    setId: option.setId,
    augmentTypes: effects.flatMap((effect) => effect.slotTypes ?? [])
  }
}

export function buildSlaveLordsData(raw: SlaveLordsResources): SlaveLordsData {
  const findIngredient = recordsById(raw.ingredients, 'ingredients')
  const findSet = recordsById(raw.sets, 'sets')
  recordsById(raw.bases, 'base items')
  const bases: SlaveLordsBase[] = []
  const sets: SlaveLordsSet[] = []
  for (const tier of ['heroic', 'legendary'] as const) {
    const { options, recipes, effects } = raw[tier]
    const findRecipe = recordsById(recipes, tier + ' recipes')
    const findEffect = recordsById(effects, tier + ' effects')
    recordsById(options, tier + ' options')
    const applications = options.map((option) => {
      if (option.setId !== undefined && findSet(option.setId).tier !== tier)
        throw new Error('Invalid Slave Lords set tier for ' + option.name)
      return { option, recipes: option.applicationRecipeIds.map(findRecipe) }
    })
    for (const base of raw.bases.filter((item) => item.tier === tier)) {
      const compatible = applications.flatMap(({ option, recipes: applicationsForOption }) => {
        const application = applicationsForOption.find((recipe) => acceptsBase(base, recipe))
        return application ? [buildOption(option, application, findRecipe, findEffect, findIngredient)] : []
      })
      bases.push({
        id: base.id,
        name: base.name,
        kind: base.kind,
        tier,
        minimumLevel: base.minimumLevel,
        description: base.description,
        equipSlots: base.baseStats.equipSlots,
        options: compatible.sort((a, b) => a.name.localeCompare(b.name))
      })
    }
    for (const set of raw.sets.filter((item) => item.tier === tier)) {
      sets.push({
        id: set.id,
        name: set.name,
        tier,
        thresholds: set.thresholds.map(({ pieces, effectId }) => ({
          pieces,
          effects: effectsFor(findEffect(effectId))
        }))
      })
    }
  }
  return { bases, sets }
}
