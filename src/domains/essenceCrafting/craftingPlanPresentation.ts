import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssenceMaterialStep, EssenceUnavailableMaterialStep } from './materialCalculations.ts'

export const sourceLabels = {
  'minimum-level-shard': 'Minimum Level shard',
  prefix: 'Prefix shard',
  suffix: 'Suffix shard',
  extra: 'Extra shard',
  'mark-of-house-cannith': 'Mark of House Cannith'
} as const

export const stepLabel = (step: EssenceMaterialStep): string =>
  step.selection && 'displayName' in step.selection
    ? `${sourceLabels[step.source]}: ${step.selection.displayName}`
    : sourceLabels[step.source]

export const warningMessage = (data: EssenceCraftingData, step: EssenceUnavailableMaterialStep): string => {
  if (step.reason.status === 'recipe-variant-unavailable') {
    const displayName = data.indexes.enhancementById.get(step.reason.enhancementId)?.displayName
    return `${displayName ?? stepLabel(step)} has no ${step.reason.binding} recipe variant.`
  }
  if (step.reason.status === 'enhancement-not-found') {
    return `The selected enhancement ${step.reason.enhancementId} is no longer available.`
  }
  return `The ${step.reason.binding} Minimum Level recipe for item level ${String(step.reason.itemLevel)} is unavailable.`
}

export const unavailableStepsForPlan = (
  steps: readonly EssenceMaterialStep[]
): readonly EssenceUnavailableMaterialStep[] =>
  steps.filter((step): step is EssenceUnavailableMaterialStep => step.status === 'unavailable')
