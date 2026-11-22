export const alchemicalStages = ['material', 'tier1', 'tier2', 'tier3'] as const
export type AlchemicalStage = (typeof alchemicalStages)[number]
export type AlchemicalFamily = 'original' | 'legendary'
export type AlchemicalSelection = Partial<Record<AlchemicalStage, number>>
interface Identified {
  id: number
}
interface Named extends Identified {
  name: string
}
interface Source {
  name: string
  method: string
  availability: string
}
interface Ingredient extends Named {
  sources?: Source[]
}
interface RawBase extends Ingredient {
  iconLayers?: { order: number; iconId: number }[]
  family: AlchemicalFamily
  type: string
  ingredientType: string
  description: string
  minimumLevel?: number
  baseLevel?: number
  effectIds: number[]
  recipeIds?: number[]
  baseStats: { equipSlots: string[]; material: string; Combat_WeaponType?: string; acceptsSentience?: boolean }
}
interface Keeper {
  ingredientType: string
  itemType?: string
  requiredMutationIds: number[]
}
interface RawRecipe extends Named {
  stage: 'materialBinding' | 'elementalBinding' | 'baseItem' | 'component' | 'ingredientExchange'
  description: string
  device: string
  tier?: number
  element?: string
  augmentation?: string
  material?: string
  minimumLevel?: number
  keeper?: Keeper
  ingredients: { ingredientId: number; quantity: number }[]
  addEffectIds?: number[]
  removeMutationIds?: number[]
  knownDiscrepancies?: { stated: number | string; resolved: number | string; unit: string }[]
  outputItemId?: number
  quantity?: number
  rewardTableId?: number
}
interface RawEffect extends Identified {
  displayName: string
  description?: string
  slotTypes?: string[]
  enchantments: {
    name?: string
    displayName?: string
    bonusType?: string
    value?: unknown
    unit?: string
    operation?: string
  }[]
  casterLevelModifiers?: { spellFlags: string[]; displayedMaxSpellLevel: number; value: number }[]
}
interface RewardTable extends Identified {
  tables: Record<string, { ingredientId: number; quantity: string; percentile: number }[]>
}
interface FamilyResources {
  recipes: RawRecipe[]
  effects: RawEffect[]
}
export interface AlchemicalResources {
  bases: RawBase[]
  ingredients: Ingredient[]
  components: RawRecipe[]
  rewardTables: RewardTable[]
  devices: Record<string, { name: string }>
  original: FamilyResources
  legendary: FamilyResources
}

export interface AlchemicalCost extends Named {
  quantity: number
  sources: string[]
}
export interface AlchemicalEffect extends Named {
  description: string
  stats: { stat: string; bonusType: string; value: number; formattedValue: string }[]
  augmentTypes: string[]
}
export interface AlchemicalRecipe extends Named {
  stage: AlchemicalStage
  family: AlchemicalFamily
  description: string
  material?: string
  element?: string
  augmentation?: string
  minimumLevel?: number
  device: string
  costs: AlchemicalCost[]
  discrepancies: string[]
  effects: AlchemicalEffect[]
  keeper: Keeper
  addEffectIds: number[]
  removeMutationIds: number[]
}
export interface AlchemicalBase extends Named {
  iconLayerIds?: number[]
  family: AlchemicalFamily
  type: string
  ingredientType: string
  weaponType?: string
  acceptsSentience?: boolean
  material: string
  description: string
  minimumLevel: number
  equipSlots: string[]
  sources: string[]
  costs: AlchemicalCost[]
  effects: AlchemicalEffect[]
  effectIds: number[]
}
export interface AlchemicalComponent extends Named {
  device: string
  quantity: number
  outputItemId: number
  costs: AlchemicalCost[]
}
export interface AlchemicalExchange extends Named {
  device: string
  costs: AlchemicalCost[]
  rewards: { table: string; name: string; quantity: string; percentile: number }[]
}
export interface AlchemicalData {
  bases: AlchemicalBase[]
  recipes: AlchemicalRecipe[]
  components: AlchemicalComponent[]
  exchanges: AlchemicalExchange[]
}

function invalid(reason: string): never {
  throw new Error('Invalid Alchemical data: ' + reason)
}
function index<T extends Identified>(list: T[], label: string) {
  if (!Array.isArray(list)) invalid('missing ' + label)
  const map = new Map<number, T>()
  for (const record of list) {
    if (!Number.isSafeInteger(record?.id) || map.has(record.id)) invalid('invalid or duplicate ID in ' + label)
    map.set(record.id, record)
  }
  return (id: number) => map.get(id) ?? invalid('unknown ' + label + ' ID ' + String(id))
}
function positive(value: number | undefined, label: string): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : invalid('invalid ' + label)
}
function sourcesFor(record: Ingredient) {
  return [
    ...new Set(
      (record.sources ?? []).map((source) => {
        if (source.method === 'container_location_unknown') return source.name + ' (location unknown)'
        return source.name + (source.availability === 'unverified' ? ' (unverified)' : '')
      })
    )
  ]
}

const statNames: Readonly<Record<string, string>> = {
  BaseWeaponDamageDiceModifier: 'Weapon Damage Dice',
  Spell_SpellFailureChance: 'Arcane Spell Failure',
  Combat_MaxDexBonus: 'Maximum Dexterity Bonus',
  Combat_CriticalConfirmationBonus: 'Critical Confirmation Rolls',
  Effect_SpellPenetrationBonus_Level9: 'Spell Penetration (Level 9)',
  Combat_MiscACBonus: 'Armor Class',
  Spell_Resistance: 'Spell Resistance',
  Combat_Ranged_fExtraShotProcChance: 'Doubleshot',
  'Combat.Melee@Player::m_fDoubleStrikeProcChance': 'Doublestrike',
  'Action@Agent.DCBoostFromEffectsTrip': 'Tactical DC: Trip',
  'Action@Agent.DCBoostFromEffectsImprovedTrip': 'Tactical DC: Improved Trip',
  'Action@Agent.DCBoostFromEffectsSunder': 'Tactical DC: Sunder',
  'Action@Agent.DCBoostFromEffectsImprovedSunder': 'Tactical DC: Improved Sunder',
  'Action@Agent.DCBoostFromEffectsStunningBlow': 'Tactical DC: Stunning',
  'Action@Agent.DCBoostAssassinate': 'Assassinate DC',
  'Equipment@Player::OrbBonus': 'Orb Bonus',
  'Spell.Metamagic@Agent::m_nEnlargeCostBonus': 'Enlarge Spell Point Cost Reduction',
  'Spell.Metamagic@Agent::m_nExtendCostBonus': 'Extend Spell Point Cost Reduction',
  'Spell.Metamagic@Agent::m_nMaximizeCostBonus': 'Maximize Spell Point Cost Reduction',
  'Spell.Metamagic@Agent::m_nEmpowerCostBonus': 'Empower Spell Point Cost Reduction'
}
function effectFor(effect: RawEffect): AlchemicalEffect | undefined {
  // Keep hidden sockets and usable click effects. Suppress bookkeeping records (including minimum level handled by the recipe).
  if (
    /^(?:Plus \d+ (?:Minimum Level|.*(?:Wear|Cost) Modifier)|Bound (?:on Acquire|to Account)|Max Charges =|Recharge \d+\/day|Alchemical \()/i.test(
      effect.displayName
    )
  )
    return undefined
  const stats = effect.enchantments.flatMap((entry) => {
    const name = entry.name ?? ''
    const stat = entry.displayName ?? statNames[name]
    if (!stat || typeof entry.value !== 'number' || !Number.isFinite(entry.value) || !entry.bonusType) return []
    if (entry.operation === 'Set' && name !== 'Combat_MissileChanceToReturn') return []
    let value = entry.value
    let suffix = ''
    if (entry.unit === 'coefficient') value = Math.trunc(Number((100 * value).toFixed(5)))
    if (entry.unit === 'percent') {
      value = Math.trunc(value)
      suffix = '%'
    }
    if (entry.unit === 'multiplier' && entry.operation === 'Multiply') {
      value = Number(((1 - value) * 100).toFixed(5))
      suffix = '%'
    }
    if (name === 'Spell_SpellFailureChance' || name === 'Combat_MissileChanceToReturn') {
      value *= 100
      suffix = '%'
    }
    if (name === 'BaseWeaponDamageDiceModifier') suffix = '[W]'
    if (entry.operation === 'Subtract') value = -value
    return [
      {
        stat: stat.replace(/^(.+) (Spell Power|Spell Critical Chance|Spell DC)$/u, '$2: $1'),
        value,
        formattedValue: String(value) + suffix,
        bonusType: entry.bonusType
      }
    ]
  })
  if (effect.displayName.startsWith('Legendary Alchemical Crafting') && !stats.length) return undefined
  for (const mod of effect.casterLevelModifiers ?? []) {
    stats.push({
      stat:
        mod.spellFlags.join(', ') + ' Caster Level (Spell Level ' + String(mod.displayedMaxSpellLevel) + ' or lower)',
      value: mod.value,
      bonusType: 'Unique',
      formattedValue: String(mod.value)
    })
  }
  return {
    id: effect.id,
    name: effect.displayName,
    description: effect.description ?? '',
    stats,
    augmentTypes: effect.slotTypes ?? []
  }
}

// Expand parent components before the components they consume so shared inputs can be batched once.
function orderComponents(components: AlchemicalComponent[]) {
  const byOutput = new Map(components.map((c) => [c.outputItemId, c]))
  if (byOutput.size !== components.length) invalid('ambiguous component recipes')
  const visited = new Set<number>()
  const pending = new Set<number>()
  const ordered: AlchemicalComponent[] = []
  function visit(component: AlchemicalComponent) {
    if (visited.has(component.id)) return
    if (pending.has(component.id)) invalid('cycle in component recipe ' + component.name)
    pending.add(component.id)
    for (const cost of component.costs) {
      const input = byOutput.get(cost.id)
      if (input) visit(input)
    }
    pending.delete(component.id)
    visited.add(component.id)
    ordered.push(component)
  }
  components.forEach(visit)
  return ordered.reverse()
}

export function buildAlchemicalData(raw: AlchemicalResources): AlchemicalData {
  const ingredient = index(raw.ingredients, 'ingredient')
  const reward = index(raw.rewardTables, 'reward table')
  index(raw.components, 'component recipe')
  index(raw.bases, 'base')
  const costsFor = (recipe: RawRecipe) =>
    recipe.ingredients.map(({ ingredientId, quantity }) => {
      const item = ingredient(ingredientId)
      return {
        id: item.id,
        name: item.name,
        quantity: positive(quantity, recipe.name + ' ingredient quantity'),
        sources: sourcesFor(item)
      }
    })
  const station = (recipe: RawRecipe) => raw.devices[recipe.device]?.name ?? invalid('unknown station ' + recipe.device)
  const components: AlchemicalComponent[] = []
  const exchanges: AlchemicalExchange[] = []
  for (const recipe of raw.components) {
    const shared = { id: recipe.id, name: recipe.name, device: station(recipe), costs: costsFor(recipe) }
    if (recipe.stage === 'ingredientExchange') {
      const table = reward(positive(recipe.rewardTableId, 'exchange table ID'))
      const rewards = Object.entries(table.tables).flatMap(([key, rows]) =>
        rows.map((row) => ({
          table: key,
          name: ingredient(row.ingredientId).name,
          quantity: row.quantity,
          percentile: row.percentile
        }))
      )
      exchanges.push({ ...shared, rewards })
    } else if (recipe.stage === 'component') {
      const output = ingredient(positive(recipe.outputItemId, 'output ingredient ID'))
      components.push({
        ...shared,
        outputItemId: output.id,
        quantity: positive(recipe.quantity, 'component output quantity')
      })
    } else invalid('unexpected component stage ' + recipe.stage)
  }
  const bases: AlchemicalBase[] = []
  const recipes: AlchemicalRecipe[] = []
  for (const family of ['original', 'legendary'] as const) {
    const familyData = raw[family]
    const findRecipe = index(familyData.recipes, family + ' recipe')
    const findEffect = index(familyData.effects, family + ' effect')
    const visibleEffects = (ids: number[]) => ids.flatMap((id) => effectFor(findEffect(id)) ?? [])
    for (const b of raw.bases.filter((item) => item.family === family)) {
      const acquisition = (b.recipeIds ?? []).map(findRecipe)
      if (acquisition.length > 1 || acquisition.some((r) => r.stage !== 'baseItem' || r.outputItemId !== b.id))
        invalid('invalid acquisition recipes for ' + b.name)
      bases.push({
        id: b.id,
        name: b.name,
        family,
        ingredientType: b.ingredientType,
        type: b.type,
        description: b.description,
        minimumLevel: positive(b.minimumLevel ?? b.baseLevel, b.name + ' minimum level'),
        equipSlots: b.baseStats.equipSlots,
        weaponType: b.baseStats.Combat_WeaponType,
        iconLayerIds: b.iconLayers?.toSorted((a, c) => a.order - c.order).map((layer) => layer.iconId),
        acceptsSentience: b.baseStats.acceptsSentience,
        material: b.baseStats.material,
        sources: sourcesFor(b),
        costs: acquisition.flatMap(costsFor),
        effects: visibleEffects(b.effectIds),
        effectIds: b.effectIds
      })
    }
    for (const r of familyData.recipes) {
      if (r.stage === 'baseItem') continue
      const stage =
        r.stage === 'materialBinding'
          ? 'material'
          : r.stage === 'elementalBinding'
            ? alchemicalStages[r.tier ?? -1]
            : undefined
      if (!stage || (r.stage === 'elementalBinding' && stage === 'material') || !r.keeper || !r.addEffectIds)
        invalid('invalid upgrade stage or prerequisites for ' + r.name)
      const removeMutationIds = r.removeMutationIds ?? []
      r.keeper.requiredMutationIds.forEach(findEffect)
      removeMutationIds.forEach(findEffect)
      recipes.push({
        id: r.id,
        name: r.name,
        description: r.description,
        stage,
        family,
        material: r.material,
        element: r.element,
        augmentation: r.augmentation,
        minimumLevel: r.minimumLevel,
        device: station(r),
        costs: costsFor(r),
        effects: visibleEffects(r.addEffectIds),
        keeper: r.keeper,
        addEffectIds: r.addEffectIds,
        removeMutationIds,
        discrepancies: (r.knownDiscrepancies ?? []).map(
          (d) => 'Stated ' + String(d.stated) + ', actual ' + String(d.resolved) + ' ' + d.unit + '.'
        )
      })
    }
  }
  return { bases, recipes, components: orderComponents(components), exchanges }
}

function addCost(costs: Map<number, AlchemicalCost>, cost: AlchemicalCost, multiplier = 1) {
  const existing = costs.get(cost.id)
  const quantity = cost.quantity * multiplier
  if (existing) existing.quantity += quantity
  else costs.set(cost.id, { ...cost, quantity })
}
function materialList(costs: AlchemicalCost[], components: AlchemicalComponent[]) {
  const remaining = new Map<number, AlchemicalCost>()
  for (const cost of costs) addCost(remaining, cost)
  for (const c of components) {
    const needed = remaining.get(c.outputItemId)
    if (!needed) continue
    remaining.delete(c.outputItemId)
    const batches = Math.ceil(needed.quantity / c.quantity)
    for (const cost of c.costs) addCost(remaining, cost, batches)
  }
  return [...remaining.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function resolveAlchemicalPlan(data: AlchemicalData, base: AlchemicalBase, selection: AlchemicalSelection) {
  const active = new Set(base.effectIds)
  const added = new Map<number, AlchemicalEffect>()
  const selected: AlchemicalRecipe[] = []
  const choices: Record<AlchemicalStage, AlchemicalRecipe[]> = { material: [], tier1: [], tier2: [], tier3: [] }
  const total = new Map<number, AlchemicalCost>()
  for (const cost of base.costs) addCost(total, cost)
  let minimumLevel = base.minimumLevel
  for (const stage of alchemicalStages) {
    const available = data.recipes.filter(
      (r) =>
        r.family === base.family &&
        r.stage === stage &&
        r.keeper.ingredientType === base.ingredientType &&
        (!r.keeper.itemType || r.keeper.itemType === base.type) &&
        r.keeper.requiredMutationIds.every((id) => active.has(id))
    )
    // Original shields have a dedicated reforge for each material alongside the generic weapon recipe.
    const specificMaterials = new Set(available.filter((r) => r.keeper.itemType).map((r) => r.material))
    choices[stage] =
      stage === 'material'
        ? available.filter((r) => r.keeper.itemType !== undefined || !specificMaterials.has(r.material))
        : available
    const recipe = choices[stage].find((r) => r.id === selection[stage])
    if (!recipe) break
    selected.push(recipe)
    minimumLevel = recipe.minimumLevel ?? minimumLevel
    for (const id of recipe.removeMutationIds) {
      active.delete(id)
      added.delete(id)
    }
    for (const id of recipe.addEffectIds) active.add(id)
    for (const effect of recipe.effects) added.set(effect.id, effect)
    for (const cost of recipe.costs) addCost(total, cost)
  }
  const costs = [...total.values()].sort((a, b) => a.name.localeCompare(b.name))
  return {
    choices,
    selected,
    minimumLevel,
    effects: [...added.values()],
    removedBaseEffects: base.effects.filter((e) => !active.has(e.id)),
    costs,
    materials: materialList(costs, data.components)
  }
}
