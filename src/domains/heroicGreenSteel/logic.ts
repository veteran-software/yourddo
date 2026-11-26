import { isVisibleEffect } from '../../shared/data/visibleEffect'
import type {
  HgsAvailableOptionIds,
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
  HgsTierOption,
  HgsValidCombination
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
  selectedSpellId: null,
  selectedTier1Id: null,
  selectedTier2Id: null,
  selectedTier3Mode: null,
  selectedTier3Id: null
}

export const classifyBaseItems = (items: readonly HgsBaseItem[], type: HgsItemType): HgsBaseItem[] =>
  items.filter((item) => item.type === type)

function createCombination(
  tier1: HgsTierOption,
  tier2: HgsTierOption,
  tier3Mode: HgsValidCombination['tier3Mode'],
  tier3: HgsTierOption
): HgsValidCombination {
  return {
    type: tier1.type,
    tier1Id: tier1.id,
    tier2Id: tier2.id,
    spellId: tier2.spellId ?? null,
    tier3Mode,
    tier3Id: tier3.id
  }
}

function appendTier3Combinations(
  combinations: HgsValidCombination[],
  tier1: HgsTierOption,
  tier2: HgsTierOption,
  tier3BasicOptions: readonly HgsTierOption[],
  tier3FocusedOptions: readonly HgsTierOption[]
) {
  for (const tier3 of tier3BasicOptions) {
    if (tier3.type === tier2.type) combinations.push(createCombination(tier1, tier2, 'basic', tier3))
  }
  for (const tier3 of tier3FocusedOptions) {
    if (tier3.type === tier2.type && tier3.requiresAspect === tier2.aspect)
      combinations.push(createCombination(tier1, tier2, 'focused', tier3))
  }
}

export const createHgsValidCombinations = (
  tier1Options: readonly HgsTierOption[],
  tier2Options: readonly HgsTierOption[],
  tier3BasicOptions: readonly HgsTierOption[],
  tier3FocusedOptions: readonly HgsTierOption[]
): HgsValidCombination[] => {
  const combinations: HgsValidCombination[] = []

  for (const tier1 of tier1Options) {
    for (const tier2 of tier2Options) {
      if (tier1.type !== tier2.type || tier1.focus !== tier2.requiresFocus) continue

      appendTier3Combinations(combinations, tier1, tier2, tier3BasicOptions, tier3FocusedOptions)
    }
  }

  return combinations
}

type HgsOmittedConstraint = 'spell' | 'tier1' | 'tier2' | 'tier3'

const matchesHgsSelection = (
  combination: HgsValidCombination,
  selection: HgsSelection,
  baseItemById: ReadonlyMap<number, HgsBaseItem>,
  omitted?: HgsOmittedConstraint
) => {
  const baseItem = selection.selectedBaseItemId === null ? undefined : baseItemById.get(selection.selectedBaseItemId)

  return (
    (!baseItem || combination.type === baseItem.type) &&
    (omitted === 'spell' || selection.selectedSpellId === null || combination.spellId === selection.selectedSpellId) &&
    (omitted === 'tier1' || selection.selectedTier1Id === null || combination.tier1Id === selection.selectedTier1Id) &&
    (omitted === 'tier2' || selection.selectedTier2Id === null || combination.tier2Id === selection.selectedTier2Id) &&
    (selection.selectedTier3Mode === null || combination.tier3Mode === selection.selectedTier3Mode) &&
    (omitted === 'tier3' || selection.selectedTier3Id === null || combination.tier3Id === selection.selectedTier3Id)
  )
}

export const isHgsSelectionCompatible = (
  combinations: readonly HgsValidCombination[],
  selection: HgsSelection,
  baseItemById: ReadonlyMap<number, HgsBaseItem>
): boolean => combinations.some((combination) => matchesHgsSelection(combination, selection, baseItemById))

export const getAvailableHgsOptionIds = (
  combinations: readonly HgsValidCombination[],
  selection: HgsSelection,
  baseItemById: ReadonlyMap<number, HgsBaseItem>
): HgsAvailableOptionIds => {
  const available: HgsAvailableOptionIds = { spell: new Set(), tier1: new Set(), tier2: new Set(), tier3: new Set() }

  for (const combination of combinations) {
    if (combination.spellId !== null && matchesHgsSelection(combination, selection, baseItemById, 'spell')) {
      available.spell.add(combination.spellId)
    }
    if (matchesHgsSelection(combination, selection, baseItemById, 'tier1')) available.tier1.add(combination.tier1Id)
    if (matchesHgsSelection(combination, selection, baseItemById, 'tier2')) available.tier2.add(combination.tier2Id)
    if (matchesHgsSelection(combination, selection, baseItemById, 'tier3')) available.tier3.add(combination.tier3Id)
  }

  return available
}

export const applyHgsSelection = <K extends keyof HgsSelection>(
  selection: HgsSelection,
  field: K,
  value: HgsSelection[K],
  combinations: readonly HgsValidCombination[],
  baseItemById: ReadonlyMap<number, HgsBaseItem>
): HgsSelection => {
  const next: HgsSelection = { ...selection, [field]: value }
  if (field === 'selectedTier2Id' && value !== null) {
    next.selectedSpellId = combinations.find((combination) => combination.tier2Id === value)?.spellId ?? null
  }
  const pinned: HgsSelection = {
    ...emptyHgsSelection,
    selectedTier3Mode: next.selectedTier3Mode,
    ...(field === 'selectedBaseItemId' ? { selectedBaseItemId: next.selectedBaseItemId } : {}),
    ...(field === 'selectedSpellId' || field === 'selectedTier2Id' ? { selectedSpellId: next.selectedSpellId } : {}),
    ...(field === 'selectedTier1Id' ? { selectedTier1Id: next.selectedTier1Id } : {}),
    ...(field === 'selectedTier2Id' ? { selectedTier2Id: next.selectedTier2Id } : {}),
    ...(field === 'selectedTier3Id' ? { selectedTier3Id: next.selectedTier3Id } : {})
  }

  const candidates: (keyof Pick<
    HgsSelection,
    'selectedBaseItemId' | 'selectedSpellId' | 'selectedTier1Id' | 'selectedTier2Id' | 'selectedTier3Id'
  >)[] = ['selectedBaseItemId', 'selectedSpellId', 'selectedTier1Id', 'selectedTier2Id', 'selectedTier3Id']

  for (const candidate of candidates) {
    if (candidate === field || next[candidate] === null) continue
    const candidateSelection = { ...pinned, [candidate]: next[candidate] }
    if (!isHgsSelectionCompatible(combinations, candidateSelection, baseItemById)) next[candidate] = null
  }

  return next
}

export const filterFocusedByShardType = (options: readonly HgsTierOption[], shardType: HgsShardType): HgsTierOption[] =>
  options.filter((option) => option.shardType === shardType)

export const resolveEffects = (effectIds: readonly number[], effectById: ReadonlyMap<number, HgsEffect>): HgsEffect[] =>
  effectIds
    .map((id) => {
      const effect = effectById.get(id)
      if (!effect) throw new InvalidHeroicGreenSteelReferenceError(`missing effect ${id.toString()}`)
      return effect
    })
    .filter(isVisibleEffect)

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
    .replaceAll(String.raw`\n`, '\n')
    .trim()

const formatDice = ({ count, sides }: { count: number; sides: number }) => `${count.toString()}d${sides.toString()}`

const withBonusType = (effect: string, bonusType: string | undefined): string =>
  bonusType ? `${effect} (${bonusType})` : effect

function mechanicValue(mechanic: HgsMechanic) {
  const name = mechanic.name ?? mechanic.type ?? 'Published effect'
  if (mechanic.dice) return `${name}: ${formatDice(mechanic.dice)}`
  if (typeof mechanic.value === 'number') {
    let unit = ''
    if (mechanic.unit === 'percent') unit = '%'
    else if (mechanic.unit) unit = ' ' + mechanic.unit
    return `${name} ${mechanic.value >= 0 ? '+' : ''}${mechanic.value.toString()}${unit}`
  }
  if (mechanic.rawModifier !== undefined) return `${name}: ${String(mechanic.rawModifier)}`
  return name
}

function regenerationAmount(value: HgsMechanic['value']) {
  if (typeof value === 'number') return value.toString()
  return value ? formatDice(value.dice) : 'Published amount'
}

function mechanicDescription(mechanic: HgsMechanic) {
  switch (mechanic.type) {
    case 'damage':
      if (mechanic.dice) return `${formatDice(mechanic.dice)} ${mechanic.damageType ?? ''} damage`.trim()
      break
    case 'immunity':
      return `Immunity: ${mechanic.traits?.join(', ') ?? 'published traits'}`
    case 'damageReductionBypass':
      return `Damage reduction bypass: ${mechanic.materials?.join(', ') ?? 'published materials'}`
    case 'criticalThreatRange':
      return `Critical threat range multiplier ×${String(mechanic.multiplier)}`
    case 'speedModifier':
      return `${mechanic.target ?? 'speed'} ${String((mechanic.rawModifier ?? 0) * 100)}%`
    case 'negativeLevels': {
      if (!mechanic.amount) break
      const duration = mechanic.durationType ? ` (${mechanic.durationType})` : ''
      return `${formatDice(mechanic.amount.dice)} negative levels${duration}`
    }
    case 'summon':
      return `Summon ${mechanic.name ?? 'published creature'}`
    case 'status': {
      const save = mechanic.save ? ` (${mechanic.save.type} DC ${mechanic.save.dc.toString()})` : ''
      return `${mechanic.name ?? 'Status'}${save}`
    }
    case 'regeneration': {
      const interval = mechanic.intervalSeconds ? ` every ${mechanic.intervalSeconds.toString()} seconds` : ''
      return `${regenerationAmount(mechanic.value)} regeneration${interval}`
    }
  }
  return mechanicValue(mechanic)
}

export const formatMechanic = (mechanic: HgsMechanic): string =>
  withBonusType(mechanicDescription(mechanic), mechanic.bonusType)

const triggerLabels: Record<string, string> = {
  onHit: 'On hit',
  onBeingHit: 'When hit',
  onVorpal: 'On vorpal'
}

export const formatProcTrigger = (proc: Pick<HgsProc, 'trigger' | 'procChance'>): string => {
  const chance = proc.procChance === undefined ? '' : ` (${String(proc.procChance * 100)}% chance)`
  return `${triggerLabels[proc.trigger] ?? proc.trigger}${chance}`
}

export const formatProc = (proc: HgsProc): string => {
  return `${formatProcTrigger(proc)}: ${proc.outcomes.map(formatMechanic).join('; ')}`
}

const genusLabels: Record<string, string> = {
  Elemental_Air: 'Air Elemental',
  Elemental_Earth: 'Earth Elemental',
  Elemental_Fire: 'Fire Elemental',
  Elemental_Water: 'Water Elemental',
  Humanoid_Goblinoid: 'Goblinoid Humanoid',
  LivingConstruct: 'Living Construct'
}

const pluralGenusLabels: Record<string, string> = {
  Construct: 'Constructs',
  Elemental_Air: 'Air Elementals',
  Elemental_Earth: 'Earth Elementals',
  Elemental_Fire: 'Fire Elementals',
  Elemental_Water: 'Water Elementals',
  Humanoid_Goblinoid: 'Goblinoid Humanoids',
  LivingConstruct: 'Living Constructs',
  Outsider: 'Outsiders',
  Plant: 'Plants'
}

export const formatGenus = (genus: string, plural = true): string => {
  if (plural && pluralGenusLabels[genus]) return pluralGenusLabels[genus]
  if (genusLabels[genus]) return genusLabels[genus]
  return genus.replaceAll('_', ' ')
}

export const expandIngredientRequirements = (
  rootRecipeIds: readonly number[],
  data: Pick<HgsRecipeData, 'ingredientById' | 'recipeById'>
): HgsIngredientPlan => {
  const terminal = new Map<number, number>()
  const crafted = new Map<string, HgsIngredientPlan['crafted'][number]>()

  const expandRecipe = (recipeId: number, multiplier: number, ancestors: ReadonlySet<number>) => {
    if (ancestors.has(recipeId)) throw new CyclicHeroicGreenSteelRecipeError(recipeId)
    const recipe = data.recipeById.get(recipeId)
    if (!recipe) throw new InvalidHeroicGreenSteelReferenceError(`missing recipe ${recipeId.toString()}`)
    const nextAncestors = new Set(ancestors).add(recipeId)

    for (const relation of recipe.ingredients) {
      const ingredient = data.ingredientById.get(relation.ingredientId)
      if (!ingredient) {
        throw new InvalidHeroicGreenSteelReferenceError(`missing ingredient ${relation.ingredientId.toString()}`)
      }
      const quantity = multiplier * relation.quantity
      if (relation.producerRecipeId === undefined) {
        terminal.set(relation.ingredientId, (terminal.get(relation.ingredientId) ?? 0) + quantity)
      } else {
        const key = relation.ingredientId.toString() + '/' + relation.producerRecipeId.toString()
        crafted.set(key, {
          ingredient,
          producerRecipeId: relation.producerRecipeId,
          quantity: (crafted.get(key)?.quantity ?? 0) + quantity
        })
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

  return {
    terminal: totals(terminal),
    crafted: [...crafted.values()].sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))
  }
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

export const heroicRecipeParts = (data: HgsRecipeData) => (id: number) =>
  data.recipeById.get(id)?.ingredients.map((part) => ({
    name: data.ingredientById.get(part.ingredientId)?.name ?? 'Missing ingredient',
    quantity: part.quantity,
    recipeKey: part.producerRecipeId
  }))
