import { augmentFilterEffects } from './augmentRules'
import { scopedEffectLabel } from '../../shared/augments/scopedEffectLabel'
import { warningMessage } from './craftingPlanPresentation.ts'
import {
  type EssenceEffectDisplayData,
  formatResolvedEffectModifier,
  resolveEnhancementEffects,
  resolveEssenceEffects
} from './enhancementEffects.ts'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssenceMaterialStep, EssencePlanMaterials } from './materialCalculations.ts'
import { calculatePlanMaterials } from './materialCalculations.ts'
import { hydrateEssencePlan } from './plannerTransitions'
import type { EssencePlanState, PlannedItem } from './plannerState.ts'

export const ESSENCE_PLAN_EXPORT_SCHEMA_VERSION = 1
export const ESSENCE_PLAN_BACKUP_FILENAME = 'yourddo-essence-crafting-plan.json'

/**
 * A versioned, display-name-free backup of planner selections. Recipe data and
 * ingredient totals deliberately remain in the published dataset, where they
 * can be recalculated on restore.
 */
export interface EssencePlanBackup {
  schemaVersion: typeof ESSENCE_PLAN_EXPORT_SCHEMA_VERSION
  recipeBinding: EssenceBinding
  plan: {
    masterMinimumLevel: number
    activeSlotIds: EssencePlanState['activeSlotIds']
    collapsedSlotIds: EssencePlanState['collapsedSlotIds']
    itemsBySlotId: Partial<Record<EquipmentSlotId, EssencePlanBackupItem>>
  }
}

export interface EssencePlanBackupItem extends Omit<PlannedItem, 'augmentSlots'> {
  augmentSlots: (Omit<PlannedItem['augmentSlots'][number], 'selectedEffectNames'> & {
    /** Effect IDs replace the UI's display-name filter values in backups. */
    selectedEffectIds: string[]
  })[]
}

const equipmentSlotLabels = new Map<EquipmentSlotId, string>(EQUIPMENT_SLOTS.map(({ id, label }) => [id, label]))

const bindingLabel = (binding: EssenceBinding): string => (binding === 'bound' ? 'Bound' : 'Unbound')

const effectIdsForNames = (data: EssenceCraftingData, effectNames: readonly string[]): string[] => {
  const selectedNames = new Set(effectNames)
  return data.augments
    .flatMap(augmentFilterEffects)
    .filter((effect) => selectedNames.has(effect.displayName))
    .map((effect) => effect.id)
}

const cloneItemForBackup = (data: EssenceCraftingData, item: PlannedItem): EssencePlanBackupItem => ({
  ...(item.twoHanded && { twoHanded: true }),
  prefixEnhancementId: item.prefixEnhancementId,
  suffixEnhancementId: item.suffixEnhancementId,
  extraEnhancementId: item.extraEnhancementId,
  hasCannithMark: item.hasCannithMark,
  minimumLevelOverride: item.minimumLevelOverride,
  augmentSlots: item.augmentSlots.map((augmentSlot) => ({
    id: augmentSlot.id,
    augmentSlotTypeId: augmentSlot.augmentSlotTypeId,
    augmentId: augmentSlot.augmentId,
    selectedEffectIds: effectIdsForNames(data, augmentSlot.selectedEffectNames),
    filterMode: augmentSlot.filterMode
  }))
})

/** Creates a stable, JSON-safe snapshot without mutating the live plan. */
export const createEssencePlanBackup = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  recipeBinding: EssenceBinding
): EssencePlanBackup => {
  const activeSlotIds = [...plan.activeSlotIds]
  const activeSlotIdSet = new Set(activeSlotIds)
  const itemsBySlotId: EssencePlanBackup['plan']['itemsBySlotId'] = {}

  for (const equipmentSlotId of activeSlotIds) {
    const item = plan.itemsBySlotId[equipmentSlotId]
    if (item) itemsBySlotId[equipmentSlotId] = cloneItemForBackup(data, item)
  }

  return {
    schemaVersion: ESSENCE_PLAN_EXPORT_SCHEMA_VERSION,
    recipeBinding,
    plan: {
      masterMinimumLevel: plan.masterMinimumLevel,
      activeSlotIds,
      collapsedSlotIds: plan.collapsedSlotIds.filter((equipmentSlotId) => activeSlotIdSet.has(equipmentSlotId)),
      itemsBySlotId
    }
  }
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function matchesBackup(expected: unknown, input: unknown): boolean {
  if (Array.isArray(expected))
    return (
      Array.isArray(input) &&
      expected.length === input.length &&
      expected.every((entry: unknown, index: number) => matchesBackup(entry, input[index]))
    )
  if (record(expected))
    return (
      record(input) &&
      Object.keys(expected).length === Object.keys(input).length &&
      Object.entries(expected).every(([key, value]) => matchesBackup(value, input[key]))
    )
  return expected === input
}

export function readEssencePlanBackup(data: EssenceCraftingData, text: string) {
  const backup: unknown = JSON.parse(text)
  const invalid = () => new Error('This file is not a valid Essence Crafting backup.')
  if (
    !record(backup) ||
    backup.schemaVersion !== ESSENCE_PLAN_EXPORT_SCHEMA_VERSION ||
    (backup.recipeBinding !== 'bound' && backup.recipeBinding !== 'unbound') ||
    !record(backup.plan)
  )
    throw invalid()
  const { plan } = backup
  if (
    !Number.isInteger(plan.masterMinimumLevel) ||
    !Array.isArray(plan.activeSlotIds) ||
    !Array.isArray(plan.collapsedSlotIds) ||
    !record(plan.itemsBySlotId)
  )
    throw invalid()
  const effects = new Map(
    data.augments.flatMap((augment) =>
      augmentFilterEffects(augment).map((effect) => [effect.id, effect.displayName] as const)
    )
  )
  const itemsBySlotId = Object.fromEntries(
    plan.activeSlotIds.map((id: unknown) => {
      if (typeof id !== 'string' || !EQUIPMENT_SLOTS.some((slot) => slot.id === id) || !record(plan.itemsBySlotId))
        throw invalid()
      const item = plan.itemsBySlotId[id]
      if (!record(item) || !Array.isArray(item.augmentSlots) || typeof item.hasCannithMark !== 'boolean')
        throw invalid()
      const augmentSlots = item.augmentSlots.map((slot: unknown) => {
        if (!record(slot) || !Array.isArray(slot.selectedEffectIds)) throw invalid()
        return {
          ...slot,
          selectedEffectNames: slot.selectedEffectIds.map((effectId: unknown) => {
            const name = typeof effectId === 'string' && effects.get(effectId)
            if (!name) throw invalid()
            return name
          })
        }
      })
      return [id, { ...item, augmentSlots }]
    })
  )
  const restored = hydrateEssencePlan(data, { ...plan, itemsBySlotId })
  const normalized = createEssencePlanBackup(data, restored, backup.recipeBinding)
  // Verify every exported field survived hydration, including augment selections.
  if (!matchesBackup(normalized.plan, plan)) throw invalid()
  return { plan: restored, binding: normalized.recipeBinding }
}

/** Formats the machine-readable backup consistently for download. */
export const formatEssencePlanJsonBackup = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  recipeBinding: EssenceBinding
): string => `${JSON.stringify(createEssencePlanBackup(data, plan, recipeBinding), null, 2)}\n`

const formatEffect = ({ effect, modifier, bonusType }: EssenceEffectDisplayData): string => {
  const formattedModifier = formatResolvedEffectModifier(modifier)
  return `${effect.displayName}${formattedModifier ? ': ' + formattedModifier : ''}${
    bonusType ? ' (' + bonusType.displayName + ')' : ''
  }`
}

const escapeBbCode = (value: string): string => value.replaceAll('[', '&#91;').replaceAll(']', '&#93;')

const formatMaterials = (materials: readonly { displayName: string; quantity: number }[]): string =>
  materials.map(({ displayName, quantity }) => `${String(quantity)} × ${displayName}`).join(', ')

const itemStepsBySource = (
  steps: readonly EssenceMaterialStep[]
): ReadonlyMap<EssenceMaterialStep['source'], EssenceMaterialStep> => new Map(steps.map((step) => [step.source, step]))

interface ExportContext {
  data: EssenceCraftingData
  plan: EssencePlanState
  binding: EssenceBinding
  planMaterials: EssencePlanMaterials
}

const createExportContext = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  binding: EssenceBinding,
  planMaterials?: EssencePlanMaterials
): ExportContext => ({
  data,
  plan,
  binding,
  planMaterials: planMaterials ?? calculatePlanMaterials(data, plan, binding)
})

const selectedAugments = (data: EssenceCraftingData, item: PlannedItem) =>
  item.augmentSlots.flatMap((augmentSlot) => {
    const augment = augmentSlot.augmentId ? data.indexes.augmentById.get(augmentSlot.augmentId) : undefined
    const slotType = data.rules.augmentSlotTypes.find(({ id }) => id === augmentSlot.augmentSlotTypeId)
    return augment
      ? [
          {
            slotTypeDisplayName: slotType?.displayName ?? 'Augment slot',
            displayName: augment.displayName,
            scoped: augment.scoped,
            effects: augment.effects
          }
        ]
      : []
  })

function augmentLines(data: EssenceCraftingData, augment: ReturnType<typeof selectedAugments>[number], level: number) {
  if (!augment.scoped) return resolveEssenceEffects(data, augment.effects, level).map(formatEffect)
  const { presentation, fallbackDescription } = augment.scoped
  if (!presentation.length) return fallbackDescription ? [fallbackDescription] : []
  return presentation.flatMap((group) => [group.name, ...group.rows.map(scopedEffectLabel)])
}

const resolvedEffectsForSelection = (
  data: EssenceCraftingData,
  enhancementId: string,
  effectiveItemLevel: number
): readonly EssenceEffectDisplayData[] => resolveEnhancementEffects(data, enhancementId, effectiveItemLevel).effects

const recipeDescription = (
  data: EssenceCraftingData,
  step: Extract<EssenceMaterialStep, { status: 'resolved' }>
): string | undefined => {
  if (!step.recipeId) return undefined
  const recipe = data.recipes.find(({ id }) => id === step.recipeId)
  return recipe ? `Recipe: ${bindingLabel(recipe.binding)}, crafting level ${String(recipe.craftingLevel)}` : undefined
}

const formatExportWarning = (data: EssenceCraftingData, step: EssenceMaterialStep): string => {
  if (step.status === 'resolved') return ''
  return step.reason.status === 'enhancement-not-found'
    ? 'A selected enhancement is no longer available.'
    : warningMessage(data, step)
}

const selectedEnhancements = (item: PlannedItem) =>
  [
    ['prefix', item.prefixEnhancementId],
    ['suffix', item.suffixEnhancementId],
    ['extra', item.extraEnhancementId]
  ] as const

const humanItemData = (context: ExportContext, equipmentSlotId: EquipmentSlotId) => {
  const item = context.plan.itemsBySlotId[equipmentSlotId]
  const materials = context.planMaterials.items.find((candidate) => candidate.equipmentSlotId === equipmentSlotId)
  if (!item || !materials) return undefined
  return { item, materials, stepsBySource: itemStepsBySource(materials.steps) }
}

const formatDiscordStep = (context: ExportContext, step: EssenceMaterialStep): string[] => {
  if (step.status === 'unavailable') return [`  - Warning: ${formatExportWarning(context.data, step)}`]
  const recipe = recipeDescription(context.data, step)
  return [
    ...(recipe ? [`  - ${recipe}`] : []),
    ...(step.materials.length ? [`  - Requires: ${formatMaterials(step.materials)}`] : [])
  ]
}

type ExportItem = NonNullable<ReturnType<typeof humanItemData>>

function discordEnhancementLines(context: ExportContext, { item, materials, stepsBySource }: ExportItem) {
  const { data } = context
  const lines: string[] = []
  for (const [source, enhancementId] of selectedEnhancements(item)) {
    if (!enhancementId) continue
    const enhancement = data.indexes.enhancementById.get(enhancementId)
    lines.push(`- ${source[0].toUpperCase()}${source.slice(1)}: ${enhancement?.displayName ?? 'Unknown enhancement'}`)
    for (const effect of resolvedEffectsForSelection(data, enhancementId, materials.effectiveItemLevel)) {
      lines.push(`  - Effect: ${formatEffect(effect)}`)
    }
    const step = stepsBySource.get(source)
    if (step) lines.push(...formatDiscordStep(context, step))
    else if (source === 'extra') lines.push('  - Not applied: requires Mark of House Cannith')
  }
  return lines
}

/**
 * Creates a Discord-ready view from the shared plan-material calculation. It
 * only formats resolved recipe data; it does not recreate recipe semantics.
 */
export const formatEssencePlanDiscordMarkdown = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  binding: EssenceBinding,
  planMaterials?: EssencePlanMaterials
): string => {
  const context = createExportContext(data, plan, binding, planMaterials)
  const lines = ['## Essence Crafting Plan', '', `**Recipe variant: ${bindingLabel(binding)}**`]

  for (const equipmentSlotId of plan.activeSlotIds) {
    const itemData = humanItemData(context, equipmentSlotId)
    if (!itemData) continue
    const { item, materials, stepsBySource } = itemData
    lines.push(
      '',
      `**${equipmentSlotLabels.get(equipmentSlotId) ?? 'Equipment slot'} — ML ${String(materials.effectiveItemLevel)}**`
    )

    const minimumLevelStep = stepsBySource.get('minimum-level-shard')
    if (minimumLevelStep) {
      lines.push('- ML shard', ...formatDiscordStep(context, minimumLevelStep))
    }

    lines.push(...discordEnhancementLines(context, itemData))

    const markStep = stepsBySource.get('mark-of-house-cannith')
    if (markStep) {
      lines.push('- Mark of House Cannith', ...formatDiscordStep(context, markStep))
    }

    for (const augment of selectedAugments(data, item)) {
      lines.push(`- Augment (${augment.slotTypeDisplayName}): ${augment.displayName}`)
      for (const text of augmentLines(data, augment, materials.effectiveItemLevel)) {
        lines.push(`  - Effect: ${text}`)
      }
    }
  }

  lines.push('', '## Ingredients')
  if (context.planMaterials.materials.length === 0) lines.push('- No ingredients required.')
  else
    lines.push(
      ...context.planMaterials.materials.map((material) => `- ${String(material.quantity)} × ${material.displayName}`)
    )
  lines.push('', '_Created with [YourDDO](https://yourddo.com)_')
  return lines.join('\n')
}

const formatBbCodeStep = (context: ExportContext, step: EssenceMaterialStep): string[] => {
  if (step.status === 'unavailable') return [`[*]Warning: ${escapeBbCode(formatExportWarning(context.data, step))}`]
  const recipe = recipeDescription(context.data, step)
  return [
    ...(recipe ? [`[*]${escapeBbCode(recipe)}`] : []),
    ...(step.materials.length ? [`[*]Requires: ${escapeBbCode(formatMaterials(step.materials))}`] : [])
  ]
}

function bbCodeEnhancementLines(context: ExportContext, { item, materials, stepsBySource }: ExportItem) {
  const { data } = context
  const lines: string[] = []
  for (const [source, enhancementId] of selectedEnhancements(item)) {
    if (!enhancementId) continue
    const enhancement = data.indexes.enhancementById.get(enhancementId)
    const label = `${source[0].toUpperCase()}${source.slice(1)}`
    lines.push(`[*][b]${label}:[/b] ${escapeBbCode(enhancement?.displayName ?? 'Unknown enhancement')}`, '[list]')
    for (const effect of resolvedEffectsForSelection(data, enhancementId, materials.effectiveItemLevel)) {
      lines.push(`[*]Effect: ${escapeBbCode(formatEffect(effect))}`)
    }
    const step = stepsBySource.get(source)
    if (step) lines.push(...formatBbCodeStep(context, step))
    else if (source === 'extra') lines.push('[*]Not applied: requires Mark of House Cannith')
    lines.push('[/list]')
  }
  return lines
}

/** Formats the same calculated plan for broadly compatible forum BBCode. */
export const formatEssencePlanBbCode = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  binding: EssenceBinding,
  planMaterials?: EssencePlanMaterials
): string => {
  const context = createExportContext(data, plan, binding, planMaterials)
  const lines = ['[b]Essence Crafting Plan[/b]', '', `[b]Recipe variant:[/b] ${bindingLabel(binding)}`]

  for (const equipmentSlotId of plan.activeSlotIds) {
    const itemData = humanItemData(context, equipmentSlotId)
    if (!itemData) continue
    const { item, materials, stepsBySource } = itemData
    lines.push(
      '',
      `[u]${escapeBbCode(equipmentSlotLabels.get(equipmentSlotId) ?? 'Equipment slot')} — ML ${String(materials.effectiveItemLevel)}[/u]`,
      '[list]'
    )

    const minimumLevelStep = stepsBySource.get('minimum-level-shard')
    if (minimumLevelStep) {
      lines.push(`[*][b]ML shard[/b]`, '[list]', ...formatBbCodeStep(context, minimumLevelStep), '[/list]')
    }

    lines.push(...bbCodeEnhancementLines(context, itemData))

    const markStep = stepsBySource.get('mark-of-house-cannith')
    if (markStep) {
      lines.push('[*][b]Mark of House Cannith[/b]', '[list]', ...formatBbCodeStep(context, markStep), '[/list]')
    }

    for (const augment of selectedAugments(data, item)) {
      lines.push(
        `[*][b]Augment (${escapeBbCode(augment.slotTypeDisplayName)}):[/b] ${escapeBbCode(augment.displayName)}`,
        '[list]'
      )
      for (const text of augmentLines(data, augment, materials.effectiveItemLevel)) {
        lines.push(`[*]Effect: ${escapeBbCode(text)}`)
      }
      lines.push('[/list]')
    }
    lines.push('[/list]')
  }

  lines.push('', '[u]Ingredients[/u]', '[list]')
  if (context.planMaterials.materials.length === 0) lines.push('[*]No ingredients required.')
  else {
    lines.push(
      ...context.planMaterials.materials.map(
        (material) => `[*]${String(material.quantity)} × ${escapeBbCode(material.displayName)}`
      )
    )
  }
  lines.push('[/list]', '', '[i]Created with [url=https://yourddo.com]YourDDO[/url][/i]')
  return lines.join('\n')
}
