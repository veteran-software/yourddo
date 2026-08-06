import type {
  EssenceCraftingData,
  EssenceEffect,
  EssenceModifier,
  EssenceModifierUnit
} from './essenceCrafting.types.ts'

export type EssenceEffectModifierRepresentation = 'number' | 'percentage' | 'dice' | 'text'

export interface EssenceDisplayName {
  id: string
  displayName: string
}

export type EssenceEffectDisplayNote =
  { kind: 'modifier-not-defined' } | { kind: 'no-matching-item-level-modifier'; itemLevel: number }

export type EssenceEffectModifierDisplay =
  | {
      status: 'resolved'
      value: number | string
      representation: EssenceEffectModifierRepresentation
      diceSuffix?: string
    }
  | { status: 'not-defined' }
  | { status: 'no-match-for-item-level'; itemLevel: number }

export interface EssenceEffectDisplayData {
  effect: EssenceDisplayName
  modifier: EssenceEffectModifierDisplay
  bonusType?: EssenceDisplayName
  notes: readonly EssenceEffectDisplayNote[]
}

export type EssenceEnhancementEffectResolution =
  | {
      status: 'resolved'
      enhancement: EssenceDisplayName
      effects: readonly EssenceEffectDisplayData[]
    }
  | {
      status: 'enhancement-not-found'
      enhancementId: string
      effects: readonly []
    }

const getModifierValueAtItemLevel = (modifier: EssenceModifier, itemLevel: number): number | string | undefined => {
  if (modifier.kind === 'fixed') return modifier.value
  return modifier.bands.find(
    ({ minimumItemLevel, maximumItemLevel }) => itemLevel >= minimumItemLevel && itemLevel <= maximumItemLevel
  )?.value
}

const isFractionalNumericValue = (value: number): boolean => value !== 0 && Math.abs(value) < 1

const toPercentageValue = (value: number): number => Number((value * 100).toFixed(10))

const getRepresentation = (unit: EssenceModifierUnit, value: number | string): EssenceEffectModifierRepresentation => {
  if (unit === 'text') return 'text'
  if (unit === 'dice') return 'dice'
  if (unit === 'percent' || (typeof value === 'number' && isFractionalNumericValue(value))) return 'percentage'
  return 'number'
}

const resolveEffectModifier = (effect: EssenceEffect, itemLevel: number): EssenceEffectModifierDisplay => {
  if (!effect.modifier) return { status: 'not-defined' }

  const value = getModifierValueAtItemLevel(effect.modifier, itemLevel)
  if (value === undefined) return { status: 'no-match-for-item-level', itemLevel }

  const representation = getRepresentation(effect.modifier.unit, value)
  return {
    status: 'resolved',
    value:
      representation === 'percentage' && typeof value === 'number' && isFractionalNumericValue(value)
        ? toPercentageValue(value)
        : value,
    representation,
    ...(representation === 'dice' ? { diceSuffix: effect.modifier.die } : {})
  }
}

const getModifierNotes = (modifier: EssenceEffectModifierDisplay): readonly EssenceEffectDisplayNote[] => {
  if (modifier.status === 'not-defined') return [{ kind: 'modifier-not-defined' }]
  if (modifier.status === 'no-match-for-item-level')
    return [{ kind: 'no-matching-item-level-modifier', itemLevel: modifier.itemLevel }]
  return []
}

const getBonusTypeDisplayName = (
  data: EssenceCraftingData,
  bonusTypeId: string | undefined
): EssenceDisplayName | undefined => {
  if (!bonusTypeId) return undefined
  const bonusType = data.bonusTypes.find(({ id }) => id === bonusTypeId)
  return bonusType && { id: bonusType.id, displayName: bonusType.displayName }
}

const getEffectDisplayData = (
  data: EssenceCraftingData,
  effect: EssenceEffect,
  itemLevel: number
): EssenceEffectDisplayData => {
  const modifier = resolveEffectModifier(effect, itemLevel)
  return {
    effect: { id: effect.id, displayName: effect.displayName },
    modifier,
    ...(effect.bonusTypeId ? { bonusType: getBonusTypeDisplayName(data, effect.bonusTypeId) } : {}),
    notes: getModifierNotes(modifier)
  }
}

/**
 * Resolves an enhancement into display-ready data without applying placement,
 * availability, planner, or recipe rules. Split prefixes remain one result
 * whose component effects retain their generated-data order.
 */
export const resolveEnhancementEffects = (
  data: EssenceCraftingData,
  enhancementId: string,
  effectiveItemMinimumLevel: number
): EssenceEnhancementEffectResolution => {
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  if (!enhancement) return { status: 'enhancement-not-found', enhancementId, effects: [] }

  return {
    status: 'resolved',
    enhancement: { id: enhancement.id, displayName: enhancement.displayName },
    effects: enhancement.effects.map((effect) => getEffectDisplayData(data, effect, effectiveItemMinimumLevel))
  }
}

/** Formats only a resolved modifier for compact text exports or labels. */
export const formatResolvedEffectModifier = (modifier: EssenceEffectModifierDisplay): string | undefined => {
  if (modifier.status !== 'resolved') return undefined
  if (typeof modifier.value === 'string') return modifier.value

  const prefix = modifier.value > 0 ? '+' : ''
  const suffix =
    modifier.representation === 'percentage'
      ? '%'
      : modifier.representation === 'dice'
        ? (modifier.diceSuffix ?? '')
        : ''
  return `${prefix}${modifier.value.toString()}${suffix}`
}
