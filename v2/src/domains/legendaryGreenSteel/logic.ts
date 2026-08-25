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

export const isTierCompatibleWithBonus = (tier: LgsTierAugment, bonus: LgsBonusEffect | undefined): boolean => {
  if (!bonus) return true
  if (tier.tier < 3) return bonus.lowerFoci.includes(tier.primaryFocus)
  if (!tier.secondaryFocus) return bonus.tier3Foci.includes(tier.primaryFocus)
  return [tier.primaryFocus, tier.secondaryFocus].sort().join('|') === [...bonus.tier3Foci].sort().join('|')
}

export const compatibleTierOptions = (
  tiers: readonly LgsTierAugment[],
  baseIngredientType: string | undefined,
  bonus: LgsBonusEffect | undefined
): readonly LgsTierAugment[] =>
  !baseIngredientType
    ? []
    : tiers
        .filter(
          (tier) => tier.itemType === getTierItemType(baseIngredientType) && isTierCompatibleWithBonus(tier, bonus)
        )
        .sort((left, right) => left.name.localeCompare(right.name))

export const reconcileLgsPlan = (data: LgsData, plan: LgsPlan): LgsPlan => {
  const base = data.baseItems.find(({ name }) => name === plan.baseItemName)
  const bonus = data.bonusEffects.find(({ name }) => name === plan.bonusEffectName)
  const reconcileTier = (name: string | null, options: readonly LgsTierAugment[]) =>
    name && options.some((option) => option.name === name) ? name : null
  const tier1Name = reconcileTier(plan.tier1Name, compatibleTierOptions(data.tier1, base?.ingredientType, bonus))
  const tier2Name = reconcileTier(plan.tier2Name, compatibleTierOptions(data.tier2, base?.ingredientType, bonus))
  const tier3Name = reconcileTier(plan.tier3Name, compatibleTierOptions(data.tier3, base?.ingredientType, bonus))
  return { ...plan, tier1Name, tier2Name, tier3Name }
}

export const expandLgsRequirements = (
  selected: readonly { requirements: readonly LgsRequirement[] }[],
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
  for (const recipe of selected) for (const requirement of recipe.requirements) visit(requirement, 1, new Set())
  const values = (map: ReadonlyMap<string, number>) =>
    [...map].map(([name, quantity]) => ({ name, quantity })).sort((left, right) => left.name.localeCompare(right.name))
  return { rawMaterials: values(raw), craftedMaterials: values(crafted) }
}
