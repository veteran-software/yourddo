import { describe, expect, it } from 'vitest'
import {
  filterCompatibleAugmentsByAllEffects,
  filterCompatibleAugmentsByAnyEffect,
  filterCompatibleAugmentsByEffects,
  getAugmentSlotMinimumItemLevel,
  getAvailableAugmentEffectNames,
  getAvailableAugmentSlotTypes,
  getCompatibleAugments,
  isAugmentSlotTypeAvailable,
  isSelectedAugmentStillValid
} from './augmentRules.ts'
import { validateEssenceCraftingDataset } from './data.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const createAugmentRuleFixture = () => {
  const payload = createEssenceCraftingTestPayload()
  const effect = (id: string, displayName: string) => ({
    id,
    displayName,
    bonusTypeId: 'bonus-enhancement',
    modifier: { kind: 'fixed', unit: 'number', value: 1 }
  })

  payload.augmentTypes.push(
    { id: 'blue', displayName: 'Blue' },
    { id: 'yellow', displayName: 'Yellow' },
    { id: 'green', displayName: 'Green' },
    { id: 'purple', displayName: 'Purple' },
    { id: 'orange', displayName: 'Orange' }
  )
  payload.augments.push(
    {
      id: 'augment-colorless-utility',
      displayName: 'Colorless Utility',
      augmentTypeId: 'colorless',
      minimumItemLevel: 1,
      effects: [effect('effect-utility', 'Utility')]
    },
    {
      id: 'augment-red-warrior',
      displayName: 'Ruby of Warrior',
      augmentTypeId: 'red',
      minimumItemLevel: 2,
      effects: [effect('effect-strength', 'Strength'), effect('effect-vitality', 'Vitality')]
    },
    {
      id: 'augment-blue-guardian',
      displayName: 'Sapphire of Guardian',
      augmentTypeId: 'blue',
      minimumItemLevel: 1,
      effects: [effect('effect-fortitude', 'Fortitude')]
    },
    {
      id: 'augment-yellow-accuracy',
      displayName: 'Topaz of Accuracy',
      augmentTypeId: 'yellow',
      minimumItemLevel: 1,
      effects: [effect('effect-accuracy', 'Accuracy')]
    },
    {
      id: 'augment-green-guardian',
      displayName: 'Emerald of Guardian',
      augmentTypeId: 'green',
      minimumItemLevel: 1,
      effects: [effect('effect-green-fortitude', 'Fortitude'), effect('effect-green-accuracy', 'Accuracy')]
    },
    {
      id: 'augment-purple-warrior',
      displayName: 'Violet of Warrior',
      augmentTypeId: 'purple',
      minimumItemLevel: 2,
      effects: [effect('effect-purple-strength', 'Strength'), effect('effect-purple-fortitude', 'Fortitude')]
    },
    {
      id: 'augment-orange-warrior',
      displayName: 'Amber of Warrior',
      augmentTypeId: 'orange',
      minimumItemLevel: 2,
      effects: [effect('effect-orange-strength', 'Strength'), effect('effect-orange-accuracy', 'Accuracy')]
    },
    {
      id: 'augment-red-tie-a',
      displayName: 'Tie',
      augmentTypeId: 'red',
      minimumItemLevel: 1,
      effects: [effect('effect-tie-a', 'Tie A')]
    },
    {
      id: 'augment-red-tie-b',
      displayName: 'Tie',
      augmentTypeId: 'red',
      minimumItemLevel: 1,
      effects: [effect('effect-tie-b', 'Tie B')]
    }
  )
  payload.rules.augmentSlotTypes = [
    { id: 'colorless', displayName: 'Colorless', acceptsAugmentTypeIds: ['colorless'] },
    { id: 'red', displayName: 'Red', acceptsAugmentTypeIds: ['red', 'colorless'] },
    { id: 'blue', displayName: 'Blue', acceptsAugmentTypeIds: ['blue', 'colorless'] },
    { id: 'yellow', displayName: 'Yellow', acceptsAugmentTypeIds: ['yellow', 'colorless'] },
    { id: 'green', displayName: 'Green', acceptsAugmentTypeIds: ['green', 'blue', 'yellow', 'colorless'] },
    { id: 'purple', displayName: 'Purple', acceptsAugmentTypeIds: ['purple', 'red', 'blue', 'colorless'] },
    { id: 'orange', displayName: 'Orange', acceptsAugmentTypeIds: ['orange', 'red', 'yellow', 'colorless'] }
  ]
  payload.rules.augmentSlotPlacements = [
    { itemCategoryId: 'weapon', augmentSlotTypeIds: ['colorless', 'red', 'purple', 'orange'] },
    { itemCategoryId: 'armor', augmentSlotTypeIds: ['colorless', 'blue'] },
    { itemCategoryId: 'ring', augmentSlotTypeIds: ['colorless', 'yellow', 'green'] }
  ]

  return validateEssenceCraftingDataset(payload)
}

describe('Essence Crafting pure augment rules', () => {
  it('uses published category placement for addable colors and prevents duplicate logical colors', () => {
    const data = createAugmentRuleFixture()

    expect(getAvailableAugmentSlotTypes(data, 'main-hand').map(({ id }) => id)).toEqual([
      'colorless',
      'red',
      'purple',
      'orange'
    ])
    expect(getAvailableAugmentSlotTypes(data, 'armor').map(({ id }) => id)).toEqual(['colorless', 'blue'])
    expect(getAvailableAugmentSlotTypes(data, 'ring-1').map(({ id }) => id)).toEqual(['colorless', 'yellow', 'green'])
    expect(getAvailableAugmentSlotTypes(data, 'main-hand', ['red']).map(({ id }) => id)).not.toContain('red')
    expect(isAugmentSlotTypeAvailable(data, 'main-hand', 'red', ['red'])).toBe(false)
    expect(isAugmentSlotTypeAvailable(data, 'armor', 'red')).toBe(false)
    expect(getAvailableAugmentSlotTypes(data, 'missing-slot')).toEqual([])
  })

  it('uses Essence-specific color floors while respecting the generated supported-level lower bound', () => {
    const data = createAugmentRuleFixture()

    expect(getAugmentSlotMinimumItemLevel(data, 'colorless')).toBe(1)
    expect(getAugmentSlotMinimumItemLevel(data, 'red')).toBe(2)
    expect(getAugmentSlotMinimumItemLevel(data, 'blue')).toBe(2)
    expect(getAugmentSlotMinimumItemLevel(data, 'yellow')).toBe(3)
    expect(getAugmentSlotMinimumItemLevel(data, 'green')).toBe(5)
    expect(getAugmentSlotMinimumItemLevel(data, 'purple')).toBe(8)
    expect(getAugmentSlotMinimumItemLevel(data, 'orange')).toBe(8)
    expect(getAugmentSlotMinimumItemLevel(data, 'missing-color')).toBeUndefined()
  })

  it('reuses canonical color and composite compatibility to return stable compatible augment choices', () => {
    const data = createAugmentRuleFixture()

    expect(getCompatibleAugments(data, 'colorless').map(({ augmentTypeId }) => augmentTypeId)).toEqual(['colorless'])
    expect(new Set(getCompatibleAugments(data, 'red').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['red', 'colorless'])
    )
    expect(new Set(getCompatibleAugments(data, 'blue').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['blue', 'colorless'])
    )
    expect(new Set(getCompatibleAugments(data, 'yellow').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['yellow', 'colorless'])
    )
    expect(new Set(getCompatibleAugments(data, 'green').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['green', 'blue', 'yellow', 'colorless'])
    )
    expect(new Set(getCompatibleAugments(data, 'purple').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['purple', 'red', 'blue', 'colorless'])
    )
    expect(new Set(getCompatibleAugments(data, 'orange').map(({ augmentTypeId }) => augmentTypeId))).toEqual(
      new Set(['orange', 'red', 'yellow', 'colorless'])
    )
    expect(
      getCompatibleAugments(data, 'red')
        .filter(({ displayName }) => displayName === 'Tie')
        .map(({ id }) => id)
    ).toEqual(['augment-red-tie-a', 'augment-red-tie-b'])
    expect(getCompatibleAugments(data, 'missing-color')).toEqual([])
  })

  it('offers unique compatible effects and applies exact-name OR and AND filters', () => {
    const data = createAugmentRuleFixture()

    expect(getAvailableAugmentEffectNames(data, 'purple')).toEqual([
      'Charisma',
      'Fortitude',
      'Strength',
      'Tie A',
      'Tie B',
      'Utility',
      'Vitality'
    ])
    expect(filterCompatibleAugmentsByAnyEffect(data, 'purple', ['Strength', 'Fortitude']).map(({ id }) => id)).toEqual([
      'augment-red-warrior',
      'augment-blue-guardian',
      'augment-purple-warrior'
    ])
    expect(filterCompatibleAugmentsByAllEffects(data, 'purple', ['Strength', 'Fortitude']).map(({ id }) => id)).toEqual(
      ['augment-purple-warrior']
    )
    expect(filterCompatibleAugmentsByEffects(data, 'purple', ['Strength', 'Fortitude'], 'or')).toEqual(
      filterCompatibleAugmentsByAnyEffect(data, 'purple', ['Strength', 'Fortitude'])
    )
    expect(filterCompatibleAugmentsByEffects(data, 'purple', ['Strength', 'Fortitude'], 'and')).toEqual(
      filterCompatibleAugmentsByAllEffects(data, 'purple', ['Strength', 'Fortitude'])
    )
  })

  it('invalidates missing, incompatible, category-ineligible, slot-floor, and augment-level selections', () => {
    const data = createAugmentRuleFixture()

    expect(isSelectedAugmentStillValid(data, null, 'armor', 'blue', 1)).toBe(true)
    expect(isSelectedAugmentStillValid(data, 'augment-red-charisma', 'main-hand', 'red', 1)).toBe(false)
    expect(isSelectedAugmentStillValid(data, 'augment-red-charisma', 'main-hand', 'red', 2)).toBe(true)
    expect(isSelectedAugmentStillValid(data, 'augment-purple-warrior', 'main-hand', 'purple', 2)).toBe(false)
    expect(isSelectedAugmentStillValid(data, 'augment-purple-warrior', 'main-hand', 'purple', 8)).toBe(false)
    expect(isSelectedAugmentStillValid(data, 'augment-red-charisma', 'armor', 'blue', 2)).toBe(false)
    expect(isSelectedAugmentStillValid(data, 'augment-red-charisma', 'armor', 'red', 2)).toBe(false)
    expect(isSelectedAugmentStillValid(data, 'missing-augment', 'main-hand', 'red', 2)).toBe(false)
  })

  it('does not mutate decoded data or the caller-provided filter and added-color arrays', () => {
    const data = createAugmentRuleFixture()
    const filters = ['Strength', 'Fortitude']
    const addedColors = ['red']
    const dataBefore = JSON.stringify({
      augments: data.augments,
      augmentTypes: data.augmentTypes,
      rules: data.rules
    })

    getAvailableAugmentSlotTypes(data, 'main-hand', addedColors)
    getCompatibleAugments(data, 'purple')
    getAvailableAugmentEffectNames(data, 'purple')
    filterCompatibleAugmentsByEffects(data, 'purple', filters, 'and')
    isSelectedAugmentStillValid(data, 'augment-red-charisma', 'main-hand', 'red', 2)

    expect(filters).toEqual(['Strength', 'Fortitude'])
    expect(addedColors).toEqual(['red'])
    expect(JSON.stringify({ augments: data.augments, augmentTypes: data.augmentTypes, rules: data.rules })).toBe(
      dataBefore
    )
  })
})
