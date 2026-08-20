import type {
  HgsBaseItem,
  HgsEffect,
  HgsIngredientPlan,
  HgsItemType,
  HgsMechanic,
  HgsProc,
  HgsRecipe,
  HgsRecipeData,
  HgsSelection,
  HgsShardType,
  HgsSpell,
  HgsTier3Mode,
  HgsTierOption
} from './heroicGreenSteel.types.ts'

export class InvalidHeroicGreenSteelReferenceError extends Error {
  constructor(message: string) {
    super(`Invalid Heroic Green Steel reference: ${message}`)
    this.name = 'InvalidHeroicGreenSteelReferenceError'
  }
}

export class CyclicHeroicGreenSteelRecipeError extends Error {
  constructor(recipeId: number) {
    super(`Heroic Green Steel recipe cycle detected at recipe ${recipeId.toString()}`)
    this.name = 'CyclicHeroicGreenSteelRecipeError'
  }
}

export const emptyHgsSelection: HgsSelection = {
  selectedBaseItemId: null,
  selectedTier1Id: null,
  selectedTier2Id: null,
  selectedTier3Mode: null,
  selectedTier3Id: null
}

export const selectBaseItem = (selection: HgsSelection, id: number | null): HgsSelection => ({
  ...selection,
  selectedBaseItemId: id,
  selectedTier1Id: null,
  selectedTier2Id: null,
  selectedTier3Mode: null,
  selectedTier3Id: null
})

export const selectTier1 = (selection: HgsSelection, id: number | null): HgsSelection => ({
  ...selection,
  selectedTier1Id: id,
  selectedTier2Id: null,
  selectedTier3Mode: null,
  selectedTier3Id: null
})

export const selectTier2 = (selection: HgsSelection, id: number | null): HgsSelection => ({
  ...selection,
  selectedTier2Id: id,
  selectedTier3Mode: null,
  selectedTier3Id: null
})

export const selectTier3Mode = (
  selection: HgsSelection,
  mode: HgsTier3Mode,
  validOptionIds: ReadonlySet<number>
): HgsSelection => ({
  ...selection,
  selectedTier3Mode: mode,
  selectedTier3Id:
    selection.selectedTier3Id !== null && validOptionIds.has(selection.selectedTier3Id)
      ? selection.selectedTier3Id
      : null
})

export const classifyBaseItems = (items: readonly HgsBaseItem[], type: HgsItemType): HgsBaseItem[] =>
  items.filter((item) => item.type === type)

export const getCompatibleTier1 = (options: readonly HgsTierOption[], baseItem: HgsBaseItem): HgsTierOption[] =>
  options.filter((option) => option.type === baseItem.type)

export const getCompatibleTier2 = (options: readonly HgsTierOption[], tier1: HgsTierOption): HgsTierOption[] =>
  options.filter((option) => option.type === tier1.type && option.requiresFocus === tier1.focus)

export const getCompatibleTier3Basic = (options: readonly HgsTierOption[], tier2: HgsTierOption): HgsTierOption[] =>
  options.filter((option) => option.type === tier2.type)

export const getCompatibleTier3Focused = (options: readonly HgsTierOption[], tier2: HgsTierOption): HgsTierOption[] =>
  options.filter((option) => option.type === tier2.type && option.requiresAspect === tier2.aspect)

export const filterFocusedByShardType = (options: readonly HgsTierOption[], shardType: HgsShardType): HgsTierOption[] =>
  options.filter((option) => option.shardType === shardType)

export const resolveEffects = (effectIds: readonly number[], effectById: ReadonlyMap<number, HgsEffect>): HgsEffect[] =>
  effectIds.map((id) => {
    const effect = effectById.get(id)
    if (!effect) throw new InvalidHeroicGreenSteelReferenceError(`missing effect ${id.toString()}`)
    return effect
  })

export const resolveSpell = (
  spellId: number | undefined,
  spellById: ReadonlyMap<number, HgsSpell>
): HgsSpell | undefined => {
  if (spellId === undefined) return undefined
  const spell = spellById.get(spellId)
  if (!spell) throw new InvalidHeroicGreenSteelReferenceError(`missing spell ${spellId.toString()}`)
  return spell
}

export const stripDdoMarkup = (value: string): string =>
  value
    .replace(/<\/?rgb(?:=[^>]+)?>/gi, '')
    .replace(/\\n/g, '\n')
    .trim()

const formatDice = ({ count, sides }: { count: number; sides: number }) => `${count.toString()}d${sides.toString()}`

export const formatMechanic = (mechanic: HgsMechanic): string => {
  const name = mechanic.name ?? mechanic.type ?? 'Published effect'
  const bonus = mechanic.bonusType ? `${mechanic.bonusType} ` : ''
  const unit = mechanic.unit === 'percent' ? '%' : mechanic.unit ? ` ${mechanic.unit}` : ''

  if (mechanic.type === 'damage' && mechanic.dice) {
    return `${formatDice(mechanic.dice)} ${mechanic.damageType ?? ''} damage`.trim()
  }
  if (mechanic.type === 'immunity') return `Immunity: ${mechanic.traits?.join(', ') ?? 'published traits'}`
  if (mechanic.type === 'damageReductionBypass') {
    return `Damage reduction bypass: ${mechanic.materials?.join(', ') ?? 'published materials'}`
  }
  if (mechanic.type === 'criticalThreatRange') return `Critical threat range multiplier ×${String(mechanic.multiplier)}`
  if (mechanic.type === 'speedModifier') {
    return `${bonus}${mechanic.target ?? 'speed'} ${String((mechanic.rawModifier ?? 0) * 100)}%`.trim()
  }
  if (mechanic.type === 'negativeLevels' && mechanic.amount) {
    return `${formatDice(mechanic.amount.dice)} negative levels${mechanic.durationType ? ` (${mechanic.durationType})` : ''}`
  }
  if (mechanic.type === 'summon') return `Summon ${mechanic.name ?? 'published creature'}`
  if (mechanic.type === 'status') {
    return `${mechanic.name ?? 'Status'}${mechanic.save ? ` (${mechanic.save.type} DC ${mechanic.save.dc.toString()})` : ''}`
  }
  if (mechanic.type === 'regeneration') {
    const value =
      typeof mechanic.value === 'number'
        ? mechanic.value.toString()
        : mechanic.value
          ? formatDice(mechanic.value.dice)
          : 'Published amount'
    return `${value} regeneration${mechanic.intervalSeconds ? ` every ${mechanic.intervalSeconds.toString()} seconds` : ''}`
  }
  if (mechanic.dice) return `${name}: ${formatDice(mechanic.dice)}`
  if (typeof mechanic.value === 'number')
    return `${bonus}${name} ${mechanic.value >= 0 ? '+' : ''}${mechanic.value.toString()}${unit}`
  if (mechanic.rawModifier !== undefined) return `${bonus}${name}: ${String(mechanic.rawModifier)}`
  return name
}

const triggerLabels: Record<string, string> = {
  onHit: 'On hit',
  onBeingHit: 'When hit',
  onVorpal: 'On vorpal'
}

export const formatProc = (proc: HgsProc): string => {
  const chance = proc.procChance === undefined ? '' : ` (${String(proc.procChance * 100)}% chance)`
  return `${triggerLabels[proc.trigger] ?? proc.trigger}${chance}: ${proc.outcomes.map(formatMechanic).join('; ')}`
}

export const expandIngredientRequirements = (
  rootRecipeIds: readonly number[],
  data: Pick<HgsRecipeData, 'ingredientById' | 'recipeById'>
): HgsIngredientPlan => {
  const terminal = new Map<number, number>()
  const crafted = new Map<number, number>()

  const expandRecipe = (recipeId: number, multiplier: number, ancestors: ReadonlySet<number>) => {
    if (ancestors.has(recipeId)) throw new CyclicHeroicGreenSteelRecipeError(recipeId)
    const recipe = data.recipeById.get(recipeId)
    if (!recipe) throw new InvalidHeroicGreenSteelReferenceError(`missing recipe ${recipeId.toString()}`)
    const nextAncestors = new Set(ancestors).add(recipeId)

    for (const relation of recipe.ingredients) {
      if (!data.ingredientById.has(relation.ingredientId)) {
        throw new InvalidHeroicGreenSteelReferenceError(`missing ingredient ${relation.ingredientId.toString()}`)
      }
      const quantity = multiplier * relation.quantity
      if (relation.producerRecipeId === undefined) {
        terminal.set(relation.ingredientId, (terminal.get(relation.ingredientId) ?? 0) + quantity)
      } else {
        crafted.set(relation.ingredientId, (crafted.get(relation.ingredientId) ?? 0) + quantity)
        expandRecipe(relation.producerRecipeId, quantity, nextAncestors)
      }
    }
  }

  rootRecipeIds.forEach((recipeId) => {
    expandRecipe(recipeId, 1, new Set())
  })

  const totals = (values: ReadonlyMap<number, number>) =>
    [...values.entries()]
      .map(([id, quantity]) => {
        const ingredient = data.ingredientById.get(id)
        if (!ingredient) throw new InvalidHeroicGreenSteelReferenceError(`missing ingredient ${id.toString()}`)
        return { ingredient, quantity }
      })
      .sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))

  return { terminal: totals(terminal), crafted: totals(crafted) }
}

export const selectedRecipes = (
  recipeIds: readonly number[],
  recipeById: ReadonlyMap<number, HgsRecipe>
): HgsRecipe[] =>
  recipeIds.map((id) => {
    const recipe = recipeById.get(id)
    if (!recipe) throw new InvalidHeroicGreenSteelReferenceError(`missing recipe ${id.toString()}`)
    return recipe
  })
