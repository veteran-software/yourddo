import type { ReforgingEntry } from '../nearlyFinished/nearlyFinished.types.ts'
import type {
  GearPlannerAugmentSlot,
  GearPlannerEffect,
  GearPlannerItem,
  GearPlannerSourceDataset,
  GearPlannerSourceItem
} from './gearPlanner.types.ts'

export const gearPlannerReforgingStages = ['nearly-finished', 'almost-there', 'finishing-touch'] as const

export type GearPlannerReforgingStage = (typeof gearPlannerReforgingStages)[number]
export type GearPlannerReforgingUpgradeTier = GearPlannerReforgingStage | 'complete'

export const gearPlannerReforgingStageLabel: Readonly<Record<GearPlannerReforgingStage, string>> = {
  'nearly-finished': 'Nearly Finished',
  'almost-there': 'Almost There',
  'finishing-touch': 'Finishing Touch'
}

const stageByLabel: Readonly<Record<string, GearPlannerReforgingStage>> = Object.fromEntries(
  gearPlannerReforgingStages.map((stage) => [gearPlannerReforgingStageLabel[stage], stage])
)

const tierByStage: Readonly<Record<GearPlannerReforgingStage, GearPlannerReforgingUpgradeTier>> = {
  'nearly-finished': 'nearly-finished',
  'almost-there': 'almost-there',
  'finishing-touch': 'complete'
}

export type GearPlannerReforgingStageState = { kind: 'active' } | { kind: 'choice'; choiceId: string }
export type GearPlannerItemReforgingState = Readonly<
  Partial<Record<GearPlannerReforgingStage, GearPlannerReforgingStageState>>
>
export type GearPlannerReforgingState = Readonly<Record<string, GearPlannerItemReforgingState>>

export interface GearPlannerReforgingChoice {
  id: string
  label: string
  effect: GearPlannerEffect
}

export interface GearPlannerReforgingRecipe {
  itemName: string
  stage: GearPlannerReforgingStage
  kind: 'toggle' | 'choice'
  choices: readonly GearPlannerReforgingChoice[]
  usesNearlyFinishedFallback?: true
}

export interface GearPlannerReforgingTierRecord {
  tier: GearPlannerReforgingUpgradeTier
  sourceFile: string
  source: GearPlannerSourceItem
}

export interface GearPlannerReforgingData {
  recipesByItemName: ReadonlyMap<string, readonly GearPlannerReforgingRecipe[]>
  tierRecordsByItemName: ReadonlyMap<string, readonly GearPlannerReforgingTierRecord[]>
  unsupportedStages: readonly string[]
}

export interface GearPlannerEffectiveReforgingTier {
  stage: GearPlannerReforgingStage
  tier: GearPlannerReforgingUpgradeTier
  record: GearPlannerReforgingTierRecord
}

export interface GearPlannerEffectiveReforgingEffects {
  enchantments: readonly GearPlannerEffect[]
  tier: GearPlannerEffectiveReforgingTier | null
  choices: readonly { stage: GearPlannerReforgingStage; choice: GearPlannerReforgingChoice }[]
}

export const emptyGearPlannerReforgingData: GearPlannerReforgingData = {
  recipesByItemName: new Map(),
  tierRecordsByItemName: new Map(),
  unsupportedStages: []
}

const stageFromLabel = (value: string): GearPlannerReforgingStage | undefined => stageByLabel[value]

const normalizeChoiceLabel = (label: string): string => label.trim()

// Legacy Nearly Finished dropdowns infer the bonus from the first known token.
export const parseNearlyFinishedChoice = (label: string): GearPlannerEffect => {
  const trimmed = label.trim()
  const lastSpace = trimmed.lastIndexOf(' ')
  if (lastSpace === -1) return { name: trimmed, bonus: 'Enhancement' }

  const content = trimmed.slice(0, lastSpace).trim()
  const modifier = trimmed
    .slice(lastSpace + 1)
    .trim()
    .replace(/^\+/, '')
  if (!content || Number.isNaN(Number(modifier))) return { name: trimmed, bonus: 'Enhancement' }

  const tokens = content.split(/\s+/)
  const knownBonusTokens = new Set([
    'alchemy',
    'competence',
    'enhancement',
    'exceptional',
    'insight',
    'insightful',
    'morale',
    'profane',
    'quality',
    'resistance',
    'racial',
    'responsiveness',
    'vitality',
    'artifact',
    'artifact-level',
    'blessed',
    'dodge',
    'luck',
    'festive',
    'guild',
    'sacred',
    'devotion',
    'parrying',
    'exalted'
  ])
  const firstToken = tokens[0]?.toLowerCase()
  return firstToken && knownBonusTokens.has(firstToken) && tokens.length > 1
    ? { name: tokens.slice(1).join(' '), bonus: tokens[0], modifier }
    : { name: content, bonus: 'Enhancement', modifier }
}

const parseLaterStageChoice = (label: string): GearPlannerEffect => ({
  name: label,
  bonus: 'Enhancement',
  modifier: label.split('+').pop()?.trim() ?? ''
})

const choiceEffect = (stage: GearPlannerReforgingStage, label: string): GearPlannerEffect =>
  stage === 'nearly-finished' ? parseNearlyFinishedChoice(label) : parseLaterStageChoice(label)

const toChoices = (
  stage: GearPlannerReforgingStage,
  labels: readonly string[]
): readonly GearPlannerReforgingChoice[] => {
  const labelCounts = new Map<string, number>()
  labels.forEach((label) => labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1))
  return labels.map((label, index) => ({
    id: (labelCounts.get(label) ?? 0) === 1 ? `label:${label}` : `index:${String(index)}`,
    label,
    effect: choiceEffect(stage, label)
  }))
}

const nearlyFinishedFallbackChoices = (upgradeable: string | undefined): readonly string[] => {
  if (!upgradeable) return []
  const labels: string[] = []
  const template = /\{\{Ability\|([^|{}]+)\|([^|{}]+)(?:\|([^|{}]+))?}}/gi
  let match: RegExpExecArray | null
  while ((match = template.exec(upgradeable)) !== null) {
    const modifier = match[2].trim()
    labels.push(
      [
        match[3]?.trim(),
        match[1].trim(),
        modifier.startsWith('+') || modifier.startsWith('-') ? modifier : `+${modifier}`
      ]
        .filter(Boolean)
        .join(' ')
    )
  }
  return labels
}

const choiceLabels = (entry: ReforgingEntry, source: GearPlannerSourceItem): readonly string[] => {
  if (entry.choices?.length) return entry.choices.map(({ name }) => normalizeChoiceLabel(name))
  return entry.stage === 'Nearly Finished' ? nearlyFinishedFallbackChoices(source.upgradeable) : []
}

const toRecipe = (entry: ReforgingEntry, source: GearPlannerSourceItem): GearPlannerReforgingRecipe | undefined => {
  const stage = stageFromLabel(entry.stage)
  if (!stage) return undefined
  if (stage === 'nearly-finished' && !entry.choices?.length) {
    const choices = toChoices(stage, nearlyFinishedFallbackChoices(source.upgradeable))
    return {
      itemName: entry.item,
      stage,
      kind: choices.length > 0 ? 'choice' : 'toggle',
      choices,
      usesNearlyFinishedFallback: true
    }
  }
  const choices = toChoices(stage, choiceLabels(entry, source))
  return { itemName: entry.item, stage, kind: choices.length > 0 ? 'choice' : 'toggle', choices }
}

export const getGearPlannerReforgingUpgradeTier = (
  itemName: string,
  pageTitle: string | undefined
): GearPlannerReforgingUpgradeTier | undefined => {
  if (!pageTitle) return undefined
  if (pageTitle === `${itemName} (Nearly Finished Upgraded)`) return 'nearly-finished'
  if (pageTitle === `${itemName} (Almost There Upgraded)`) return 'almost-there'
  if (pageTitle.startsWith(`${itemName} (Complete`)) return 'complete'
  return undefined
}

export const isGearPlannerReforgingUpgradeSource = (
  source: GearPlannerSourceItem,
  recipeItemNames: ReadonlySet<string>
): boolean =>
  recipeItemNames.has(source.name) && getGearPlannerReforgingUpgradeTier(source.name, source.pageTitle) !== undefined

export const createGearPlannerReforgingData = (
  entries: readonly ReforgingEntry[],
  sourceDatasets: readonly GearPlannerSourceDataset[]
): GearPlannerReforgingData => {
  const sourcesByName = new Map<string, GearPlannerSourceItem[]>()
  const tierRecordsByItemName = new Map<string, GearPlannerReforgingTierRecord[]>()
  for (const { fileName, records } of sourceDatasets) {
    for (const source of records) {
      const sources = sourcesByName.get(source.name) ?? []
      sources.push(source)
      sourcesByName.set(source.name, sources)
      const tier = getGearPlannerReforgingUpgradeTier(source.name, source.pageTitle)
      if (tier) {
        const tiers = tierRecordsByItemName.get(source.name) ?? []
        tiers.push({ tier, sourceFile: fileName, source })
        tierRecordsByItemName.set(source.name, tiers)
      }
    }
  }

  const recipesByItemName = new Map<string, GearPlannerReforgingRecipe[]>()
  const unsupportedStages = new Set<string>()
  for (const entry of entries) {
    const stage = stageFromLabel(entry.stage)
    if (!stage) {
      unsupportedStages.add(entry.stage)
      continue
    }
    const source = sourcesByName
      .get(entry.item)
      ?.find((candidate) => getGearPlannerReforgingUpgradeTier(candidate.name, candidate.pageTitle) === undefined)
    if (!source) continue
    const recipe = toRecipe(entry, source)
    if (!recipe) continue
    const recipes = recipesByItemName.get(entry.item) ?? []
    recipes.push(recipe)
    recipesByItemName.set(entry.item, recipes)
  }
  return { recipesByItemName, tierRecordsByItemName, unsupportedStages: [...unsupportedStages].toSorted() }
}

export const gearPlannerReforgingRecipesForItem = (
  item: GearPlannerItem,
  data: GearPlannerReforgingData
): readonly GearPlannerReforgingRecipe[] =>
  (data.recipesByItemName.get(item.source.name) ?? []).map((recipe) => {
    if (!recipe.usesNearlyFinishedFallback) return recipe
    const choices = toChoices(recipe.stage, nearlyFinishedFallbackChoices(item.source.upgradeable))
    return { ...recipe, kind: choices.length > 0 ? 'choice' : 'toggle', choices }
  })

export const gearPlannerReforgingRecipeForStage = (
  item: GearPlannerItem,
  stage: GearPlannerReforgingStage,
  data: GearPlannerReforgingData
): GearPlannerReforgingRecipe | undefined =>
  gearPlannerReforgingRecipesForItem(item, data).find((recipe) => recipe.stage === stage)

export const gearPlannerReforgingChoiceForState = (
  item: GearPlannerItem,
  stage: GearPlannerReforgingStage,
  state: GearPlannerReforgingStageState | undefined,
  data: GearPlannerReforgingData
): GearPlannerReforgingChoice | undefined => {
  if (state?.kind !== 'choice') return undefined
  return gearPlannerReforgingRecipeForStage(item, stage, data)?.choices.find((choice) => choice.id === state.choiceId)
}

export const isGearPlannerReforgingStageStateValid = (
  item: GearPlannerItem,
  stage: GearPlannerReforgingStage,
  state: GearPlannerReforgingStageState,
  data: GearPlannerReforgingData
): boolean => {
  const recipe = gearPlannerReforgingRecipeForStage(item, stage, data)
  if (!recipe) return false
  if (recipe.kind === 'toggle') return state.kind === 'active'
  return state.kind === 'choice' && recipe.choices.some((choice) => choice.id === state.choiceId)
}

const effectiveTierRecord = (
  item: GearPlannerItem,
  tier: GearPlannerReforgingUpgradeTier,
  data: GearPlannerReforgingData
): GearPlannerReforgingTierRecord | undefined => {
  const candidates = (data.tierRecordsByItemName.get(item.source.name) ?? []).filter(
    (candidate) => candidate.tier === tier
  )
  const sameFile = candidates.filter((candidate) => candidate.sourceFile === item.sourceFile)
  if (sameFile.length === 1) return sameFile[0]
  const sameLevel = (sameFile.length > 0 ? sameFile : candidates).filter(
    (candidate) => Number(candidate.source.minLevel) === item.minimumLevel
  )
  if (sameLevel.length === 1) return sameLevel[0]
  return candidates.length === 1 ? candidates[0] : undefined
}

export const getGearPlannerEffectiveReforgingTier = (
  item: GearPlannerItem,
  state: GearPlannerItemReforgingState | undefined,
  data: GearPlannerReforgingData
): GearPlannerEffectiveReforgingTier | null => {
  for (const stage of [...gearPlannerReforgingStages].reverse()) {
    const recipe = gearPlannerReforgingRecipeForStage(item, stage, data)
    const selected = state?.[stage]
    if (!recipe || recipe.kind !== 'toggle' || selected?.kind !== 'active') continue
    const tier = tierByStage[stage]
    const record = effectiveTierRecord(item, tier, data)
    if (record) return { stage, tier, record }
  }
  return null
}

export const getGearPlannerEffectiveReforgingEffects = (
  item: GearPlannerItem,
  state: GearPlannerItemReforgingState | undefined,
  data: GearPlannerReforgingData
): GearPlannerEffectiveReforgingEffects => {
  const tier = getGearPlannerEffectiveReforgingTier(item, state, data)
  const choices = gearPlannerReforgingStages.flatMap((stage) => {
    const choice = gearPlannerReforgingChoiceForState(item, stage, state?.[stage], data)
    return choice ? [{ stage, choice }] : []
  })
  return { enchantments: tier?.record.source.enchantments ?? item.source.enchantments ?? [], tier, choices }
}

const anyActiveStage = (
  item: GearPlannerItem,
  state: GearPlannerItemReforgingState | undefined,
  data: GearPlannerReforgingData
) =>
  gearPlannerReforgingStages.some((stage) => {
    const selected = state?.[stage]
    return selected !== undefined && isGearPlannerReforgingStageStateValid(item, stage, selected, data)
  })

export const getEffectiveGearPlannerAugmentSlots = (
  item: GearPlannerItem,
  state: GearPlannerItemReforgingState | undefined,
  data: GearPlannerReforgingData
): readonly GearPlannerAugmentSlot[] => {
  if (!anyActiveStage(item, state, data)) return item.source.augments ?? []
  const nearlyFinished = effectiveTierRecord(item, 'nearly-finished', data)
  return nearlyFinished && (nearlyFinished.source.augments?.length ?? 0) > 0
    ? (nearlyFinished.source.augments ?? [])
    : (item.source.augments ?? [])
}

export const getEffectiveGearPlannerAugmentSlotsByItem = (
  equipment: Readonly<Record<string, GearPlannerItem | null>>,
  reforging: GearPlannerReforgingState,
  data: GearPlannerReforgingData
): Readonly<Record<string, readonly GearPlannerAugmentSlot[]>> =>
  Object.fromEntries(
    Object.values(equipment)
      .filter((item): item is GearPlannerItem => item !== null)
      .map((item) => [item.id, getEffectiveGearPlannerAugmentSlots(item, reforging[item.id], data)])
  )
