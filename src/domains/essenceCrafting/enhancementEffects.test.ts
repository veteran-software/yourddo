import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { formatResolvedEffectModifier, resolveEnhancementEffects, resolveEssenceEffects } from './enhancementEffects.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const data = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const resolved = (enhancementId: string, itemLevel: number) => {
  const result = resolveEnhancementEffects(data(), enhancementId, itemLevel)
  if (result.status !== 'resolved') throw new Error(`Expected ${enhancementId} to resolve`)
  return result
}

describe('Essence Crafting enhancement effect resolution', () => {
  it('resolves a single fixed positive effect with its bonus type and a compact formatter', () => {
    const result = resolved('enhancement-display-fixed', 1)

    expect(result).toEqual({
      status: 'resolved',
      enhancement: { id: 'enhancement-display-fixed', displayName: 'Display Fixed' },
      effects: [
        {
          effect: { id: 'effect-display-fixed', displayName: 'Fixed Effect' },
          modifier: { status: 'resolved', value: 3, representation: 'number' },
          bonusType: { id: 'bonus-enhancement', displayName: 'Enhancement' },
          notes: []
        }
      ]
    })
    expect(formatResolvedEffectModifier(result.effects[0].modifier)).toBe('+3')
  })

  it('resolves a single scaled effect at the minimum and maximum supported item levels', () => {
    const minimumLevel = resolved('enhancement-display-scaled', 1)
    const maximumLevel = resolved('enhancement-display-scaled', 2)

    expect(minimumLevel.effects[0].modifier).toMatchObject({ status: 'resolved', value: 1 })
    expect(maximumLevel.effects[0].modifier).toMatchObject({ status: 'resolved', value: 2 })
  })

  it('preserves negative values, turns fractional values into percentages, and keeps dice suffixes separate', () => {
    const result = resolved('enhancement-display-mixed', 1)

    expect(result.effects.map(({ modifier }) => modifier)).toEqual([
      { status: 'resolved', value: -2, representation: 'number' },
      { status: 'resolved', value: 12.5, representation: 'percentage' },
      { status: 'resolved', value: 3, representation: 'dice', diceSuffix: 'd6' },
      { status: 'resolved', value: 9, representation: 'number' }
    ])
    expect(result.effects.slice(0, 3).map(({ modifier }) => formatResolvedEffectModifier(modifier))).toEqual([
      '-2',
      '+12.5%',
      '+3d6'
    ])
  })

  it('keeps all split-prefix component effects beneath one selected enhancement heading', () => {
    const result = resolved('enhancement-split-prefix', 2)

    expect(result.enhancement).toEqual({ id: 'enhancement-split-prefix', displayName: 'Split Prefix Test' })
    expect(result.effects.map(({ effect }) => effect.id)).toEqual(['effect-light', 'effect-implement'])
    expect(result.effects.map(({ modifier }) => modifier)).toEqual([
      { status: 'resolved', value: 2, representation: 'number' },
      { status: 'resolved', value: 5, representation: 'percentage' }
    ])
  })

  it('returns a structured fallback instead of inventing a modifier for an uncovered item level', () => {
    const result = resolved('enhancement-display-mixed', 2)
    const missingModifierEffect = result.effects[3]

    expect(missingModifierEffect.modifier).toEqual({ status: 'no-match-for-item-level', itemLevel: 2 })
    expect(missingModifierEffect.notes).toEqual([{ kind: 'no-matching-item-level-modifier', itemLevel: 2 }])
    expect(formatResolvedEffectModifier(missingModifierEffect.modifier)).toBeUndefined()
  })

  it('returns an explicit not-found result for a missing enhancement ID', () => {
    expect(resolveEnhancementEffects(data(), 'missing-enhancement', 1)).toEqual({
      status: 'enhancement-not-found',
      enhancementId: 'missing-enhancement',
      effects: []
    })
  })

  it('uses the same resolution path for augment effects', () => {
    const fixture = data()
    const augment = fixture.indexes.augmentById.get('augment-red-charisma')
    if (!augment) throw new Error('Expected Charisma augment')

    expect(resolveEssenceEffects(fixture, augment.effects, 2)).toMatchObject([
      {
        effect: { id: 'effect-charisma', displayName: 'Charisma' },
        modifier: { status: 'resolved', value: 1, representation: 'number' },
        bonusType: { id: 'bonus-enhancement', displayName: 'Enhancement' }
      }
    ])
  })

  it('does not mutate decoded domain records while resolving effects', () => {
    const fixture = data()
    const before = JSON.stringify(fixture.enhancements)

    resolveEnhancementEffects(fixture, 'enhancement-display-mixed', 1)
    resolveEnhancementEffects(fixture, 'enhancement-split-prefix', 2)

    expect(JSON.stringify(fixture.enhancements)).toBe(before)
  })
})
