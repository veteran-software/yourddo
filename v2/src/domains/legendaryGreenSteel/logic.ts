import type {
  LgsBaseItem,
  LgsData,
  LgsIngredientPlan,
  LgsPlan,
  LgsRecipe,
  LgsRequirement,
  LgsTierAugment,
  WeaponFocusRule
} from './legendaryGreenSteel.types.ts'

export const emptyLgsPlan = (): LgsPlan => ({
  baseItemName: null,
  tier1Name: null,
  tier2Name: null,
  tier3Name: null,
  bonusEffectName: null,
  activeAugmentName: null
})

export const groupLgsBaseItems = (items: readonly LgsBaseItem[]) =>
  (['weapon', 'equipment'] as const).map((type) => ({
    label: type === 'weapon' ? 'Weapons' : 'Accessories',
    items: items.filter((item) => item.type === type).sort((a, b) => a.name.localeCompare(b.name))
  }))

export const fitsSlot = (base: LgsBaseItem | undefined, item: { slotTypes: readonly string[] }) =>
  !!base && item.slotTypes.some((type) => base.slotTypes.includes(type))

type Tier = 'tier1' | 'tier2' | 'tier3'
type SelectedTiers = Record<Tier, LgsTierAugment | undefined>

function selectedTiers(data: LgsData, plan: LgsPlan): SelectedTiers {
  return {
    tier1: data.tier1.find((t) => t.name === plan.tier1Name),
    tier2: data.tier2.find((t) => t.name === plan.tier2Name),
    tier3: data.tier3.find((t) => t.name === plan.tier3Name)
  }
}

function allowsPair([a, b]: readonly [string, string], first?: string, second?: string) {
  return (
    ((!first || first === a) && (!second || second === b)) || ((!first || first === b) && (!second || second === a))
  )
}
function matchesRule(rule: WeaponFocusRule, { tier1, tier2, tier3 }: SelectedTiers) {
  return (
    allowsPair(rule.tier1And2, tier1?.focuses[0], tier2?.focuses[0]) &&
    allowsPair(rule.tier3, tier3?.focuses[0], tier3?.focuses[1])
  )
}

export function getLgsOptions(data: LgsData, plan: LgsPlan, base: LgsBaseItem | undefined) {
  const tiers = selectedTiers(data, plan)
  const weapon = base?.type === 'weapon'
  const target = weapon ? data.bonusEffects.find((b) => b.name === plan.bonusEffectName)?.requiredFocuses : undefined
  // Older builds could select any bonus for reference. Keep their tiers editable.
  const filter = target && matchesRule(target, tiers) ? target : undefined
  const choices = (key: Tier) =>
    data[key].filter((t) => fitsSlot(base, t) && (!filter || matchesRule(filter, { ...tiers, [key]: t })))
  const bonuses = data.bonusEffects.filter((b) => {
    if (!base || b.name === plan.bonusEffectName) return true
    if (b.group === 'Equipment sets') return !weapon
    return weapon && (!b.requiredFocuses || matchesRule(b.requiredFocuses, tiers))
  })
  return { tier1: choices('tier1'), tier2: choices('tier2'), tier3: choices('tier3'), bonuses }
}

export function weaponBonusResult(data: LgsData, plan: LgsPlan): string | undefined {
  if (!data.baseItems.some((b) => b.name === plan.baseItemName && b.type === 'weapon')) return
  const tiers = selectedTiers(data, plan)
  const configured = data.bonusEffects.filter((b) => b.requiredFocuses)
  if (!configured.length) return
  if (!tiers.tier1 || !tiers.tier2 || !tiers.tier3) {
    const target = configured.find((b) => b.name === plan.bonusEffectName)
    if (target?.requiredFocuses && !matchesRule(target.requiredFocuses, tiers))
      return 'The selected tiers do not match the selected weapon bonus.'
    return
  }
  if (data.explicitNoEffect.some((rule) => matchesRule(rule, tiers)))
    return 'The release lists no weapon bonus for this combination.'
  const matched = configured.find((b) => b.requiredFocuses && matchesRule(b.requiredFocuses, tiers))
  return matched ? `Weapon bonus: ${matched.name}.` : 'No published weapon bonus matches this combination.'
}

export const reconcileLgsPlan = (data: LgsData, plan: LgsPlan): LgsPlan => {
  const base = data.baseItems.find((item) => item.name === plan.baseItemName)
  const tierName = (key: 'tier1' | 'tier2' | 'tier3', name: string | null) =>
    data[key].find((tier) => tier.name === name && fitsSlot(base, tier))?.name ?? null
  const active = data.activeAugments.find((item) => item.name === plan.activeAugmentName)
  return {
    baseItemName: base?.name ?? null,
    tier1Name: tierName('tier1', plan.tier1Name),
    tier2Name: tierName('tier2', plan.tier2Name),
    tier3Name: tierName('tier3', plan.tier3Name),
    bonusEffectName: data.bonusEffects.find((bonus) => bonus.name === plan.bonusEffectName)?.name ?? null,
    activeAugmentName: active && (!base || fitsSlot(base, active)) ? active.name : null,
    ...(plan.useImmortalsHeart && fitsSlot(base, data.immortalsHeart) ? { useImmortalsHeart: true } : {})
  }
}

export const expandLgsRequirements = (
  recipes: readonly LgsRecipe[],
  components: readonly LgsRecipe[]
): LgsIngredientPlan => {
  const componentById = new Map(components.map((component) => [component.id, component]))
  const raw = new Map<number, LgsRequirement>()
  const crafted = new Map<number, LgsRequirement>()
  const visit = (requirement: LgsRequirement, multiplier: number, ancestry: ReadonlySet<number>) => {
    const quantity = requirement.quantity * multiplier
    const component = componentById.get(requirement.id)
    const totals = component ? crafted : raw
    totals.set(requirement.id, { ...requirement, quantity: (totals.get(requirement.id)?.quantity ?? 0) + quantity })
    if (!component) return
    if (ancestry.has(component.id)) throw new Error(`Circular LGS crafting component: ${component.name}`)
    const next = new Set(ancestry).add(component.id)
    for (const child of component.requirements) visit(child, quantity, next)
  }
  for (const recipe of recipes) for (const requirement of recipe.requirements) visit(requirement, 1, new Set())
  const sorted = (totals: Map<number, LgsRequirement>) =>
    [...totals.values()].sort((a, b) => a.name.localeCompare(b.name))
  return { rawMaterials: sorted(raw), craftedMaterials: sorted(crafted) }
}
