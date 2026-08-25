import type {
  LgsBaseItem,
  LgsBonusEffect,
  LgsData,
  LgsEffect,
  LgsIngredientPlan,
  LgsPlan,
  LgsRequirement,
  LgsTierAugment
} from './legendaryGreenSteel.types.ts'

type LgsTierField = 'tier1Name' | 'tier2Name' | 'tier3Name'
export type LgsPlanField = keyof LgsPlan

export const emptyLgsPlan = (): LgsPlan => ({
  baseItemName: null,
  tier1Name: null,
  tier2Name: null,
  tier3Name: null,
  bonusEffectName: null,
  activeAugmentName: null
})

export const getTierItemType = (ingredientType: string): LgsTierAugment['itemType'] =>
  ingredientType === 'Legendary Green Steel Weapon' ? 'Weapon' : 'Equipment'

export const groupLgsBaseItems = (items: readonly LgsBaseItem[]) =>
  [
    { label: 'Weapons', ingredientType: 'Legendary Green Steel Weapon' },
    { label: 'Accessories', ingredientType: 'Legendary Green Steel Accessory' }
  ].map(({ label, ingredientType }) => ({
    label,
    items: items
      .filter((item) => item.ingredientType === ingredientType)
      .sort((left, right) => left.name.localeCompare(right.name))
  }))

export const formatLgsEffect = ({ name, modifier, bonus }: LgsEffect): string => {
  const modifierText =
    modifier === undefined || name.endsWith(String(modifier))
      ? ''
      : ` ${String(modifier).startsWith('+') || String(modifier).startsWith('-') ? String(modifier) : `+${String(modifier)}`}`
  return `${name}${modifierText}${bonus ? ` (${bonus})` : ''}`
}

const selected = <T extends { name: string }>(records: readonly T[], name: string | null): T | undefined =>
  records.find((record) => record.name === name)

const matchingFoci = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length &&
  left.every(
    (focus) => left.filter((value) => value === focus).length === right.filter((value) => value === focus).length
  )

const lowerTiersMatchBonus = (
  bonus: LgsBonusEffect,
  tier1: LgsTierAugment | undefined,
  tier2: LgsTierAugment | undefined
): boolean => {
  if (tier1 && tier2) return matchingFoci([tier1.primaryFocus, tier2.primaryFocus], bonus.lowerFoci)
  const tier = tier1 ?? tier2
  return tier ? bonus.lowerFoci.includes(tier.primaryFocus) : true
}

const tier3MatchesBonus = (tier: LgsTierAugment | undefined, bonus: LgsBonusEffect): boolean => {
  if (!tier) return true
  if (tier.itemType === 'Equipment') return bonus.tier3Foci.includes(tier.primaryFocus)
  return tier.secondaryFocus !== undefined && matchingFoci([tier.primaryFocus, tier.secondaryFocus], bonus.tier3Foci)
}

export const isTierCompatibleWithBonus = (tier: LgsTierAugment, bonus: LgsBonusEffect | undefined): boolean => {
  if (!bonus) return true
  return tier.tier < 3 ? bonus.lowerFoci.includes(tier.primaryFocus) : tier3MatchesBonus(tier, bonus)
}

const selectedTiers = (data: LgsData, plan: LgsPlan) => ({
  tier1: selected(data.tier1, plan.tier1Name),
  tier2: selected(data.tier2, plan.tier2Name),
  tier3: selected(data.tier3, plan.tier3Name)
})

const compatibleWithBonus = (bonus: LgsBonusEffect, tiers: ReturnType<typeof selectedTiers>): boolean =>
  lowerTiersMatchBonus(bonus, tiers.tier1, tiers.tier2) && tier3MatchesBonus(tiers.tier3, bonus)

export const getCompatibleBonusEffects = (data: LgsData, plan: LgsPlan): readonly LgsBonusEffect[] => {
  const tiers = selectedTiers(data, plan)
  return data.bonusEffects
    .filter((bonus) => compatibleWithBonus(bonus, tiers))
    .sort((left, right) => left.name.localeCompare(right.name))
}

const compatibleTierOptions = (
  data: LgsData,
  plan: LgsPlan,
  field: LgsTierField,
  options: readonly LgsTierAugment[]
): readonly LgsTierAugment[] => {
  const base = selected(data.baseItems, plan.baseItemName)
  if (!base) return []
  const bonus = selected(data.bonusEffects, plan.bonusEffectName)
  const tiers = selectedTiers(data, plan)
  return options
    .filter((tier) => tier.itemType === getTierItemType(base.ingredientType))
    .filter((tier) => {
      if (!bonus || !isTierCompatibleWithBonus(tier, bonus)) return !bonus
      if (field === 'tier1Name') return lowerTiersMatchBonus(bonus, tier, tiers.tier2)
      if (field === 'tier2Name') return lowerTiersMatchBonus(bonus, tiers.tier1, tier)
      return true
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export const getCompatibleTier1 = (data: LgsData, plan: LgsPlan): readonly LgsTierAugment[] =>
  compatibleTierOptions(data, plan, 'tier1Name', data.tier1)

export const getCompatibleTier2 = (data: LgsData, plan: LgsPlan): readonly LgsTierAugment[] =>
  compatibleTierOptions(data, plan, 'tier2Name', data.tier2)

export const getCompatibleTier3 = (data: LgsData, plan: LgsPlan): readonly LgsTierAugment[] =>
  compatibleTierOptions(data, plan, 'tier3Name', data.tier3)

const validTierName = (
  base: LgsBaseItem | undefined,
  name: string | null,
  tiers: readonly LgsTierAugment[]
): string | null => {
  const tier = selected(tiers, name)
  return tier && base && tier.itemType === getTierItemType(base.ingredientType) ? tier.name : null
}

const reconcileBonusTiers = (data: LgsData, plan: LgsPlan, changedField?: LgsPlanField): LgsPlan => {
  const bonus = selected(data.bonusEffects, plan.bonusEffectName)
  if (!bonus) return plan
  const tiers = selectedTiers(data, plan)

  if (changedField === 'tier1Name' && tiers.tier1 && !isTierCompatibleWithBonus(tiers.tier1, bonus)) {
    return { ...plan, bonusEffectName: null }
  }
  if (changedField === 'tier2Name' && tiers.tier2 && !isTierCompatibleWithBonus(tiers.tier2, bonus)) {
    return { ...plan, bonusEffectName: null }
  }
  if (changedField === 'tier3Name' && tiers.tier3 && !isTierCompatibleWithBonus(tiers.tier3, bonus)) {
    return { ...plan, bonusEffectName: null }
  }

  let next = plan
  if (
    changedField === 'tier1Name' &&
    tiers.tier1 &&
    tiers.tier2 &&
    !lowerTiersMatchBonus(bonus, tiers.tier1, tiers.tier2)
  ) {
    next = { ...next, tier2Name: null }
  } else if (
    changedField === 'tier2Name' &&
    tiers.tier1 &&
    tiers.tier2 &&
    !lowerTiersMatchBonus(bonus, tiers.tier1, tiers.tier2)
  ) {
    next = { ...next, tier1Name: null }
  } else if (changedField !== 'tier1Name' && changedField !== 'tier2Name') {
    if (tiers.tier1 && !isTierCompatibleWithBonus(tiers.tier1, bonus)) next = { ...next, tier1Name: null }
    if (tiers.tier2 && !isTierCompatibleWithBonus(tiers.tier2, bonus)) next = { ...next, tier2Name: null }
    const remaining = selectedTiers(data, next)
    if (remaining.tier1 && remaining.tier2 && !lowerTiersMatchBonus(bonus, remaining.tier1, remaining.tier2)) {
      next = { ...next, tier2Name: null }
    }
  }
  const tier3 = selected(data.tier3, next.tier3Name)
  return tier3 && !isTierCompatibleWithBonus(tier3, bonus) ? { ...next, tier3Name: null } : next
}

export const reconcileLgsSelections = (data: LgsData, plan: LgsPlan, changedField?: LgsPlanField): LgsPlan => {
  const base = selected(data.baseItems, plan.baseItemName)
  const next: LgsPlan = {
    ...plan,
    baseItemName: base?.name ?? null,
    tier1Name: validTierName(base, plan.tier1Name, data.tier1),
    tier2Name: validTierName(base, plan.tier2Name, data.tier2),
    tier3Name: validTierName(base, plan.tier3Name, data.tier3),
    bonusEffectName: selected(data.bonusEffects, plan.bonusEffectName)?.name ?? null,
    activeAugmentName: selected(data.activeAugments, plan.activeAugmentName)?.name ?? null
  }
  return reconcileBonusTiers(data, next, changedField)
}

export const applyLgsSelection = <Field extends LgsPlanField>(
  data: LgsData,
  plan: LgsPlan,
  field: Field,
  value: LgsPlan[Field]
): LgsPlan => reconcileLgsSelections(data, { ...plan, [field]: value }, field)

export const reconcileLgsPlan = (data: LgsData, plan: LgsPlan): LgsPlan => reconcileLgsSelections(data, plan)

export const expandLgsRequirements = (
  recipes: readonly { requirements: readonly LgsRequirement[] }[],
  components: readonly { name: string; requirements: readonly LgsRequirement[] }[]
): LgsIngredientPlan => {
  const componentByName = new Map(components.map((component) => [component.name, component]))
  const raw = new Map<string, number>()
  const crafted = new Map<string, number>()
  const visit = (requirement: LgsRequirement, multiplier: number, ancestry: ReadonlySet<string>) => {
    const quantity = requirement.quantity * multiplier
    const component = componentByName.get(requirement.name)
    if (!component) {
      raw.set(requirement.name, (raw.get(requirement.name) ?? 0) + quantity)
      return
    }
    if (ancestry.has(component.name)) throw new Error(`Circular LGS crafting component: ${component.name}`)
    crafted.set(component.name, (crafted.get(component.name) ?? 0) + quantity)
    const nextAncestry = new Set(ancestry).add(component.name)
    for (const child of component.requirements) visit(child, quantity, nextAncestry)
  }
  for (const recipe of recipes) for (const requirement of recipe.requirements) visit(requirement, 1, new Set())
  const values = (map: ReadonlyMap<string, number>) =>
    [...map].map(([name, quantity]) => ({ name, quantity })).sort((left, right) => left.name.localeCompare(right.name))
  return { rawMaterials: values(raw), craftedMaterials: values(crafted) }
}
