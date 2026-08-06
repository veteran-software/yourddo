import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import {
  calculatePlanMaterials,
  calculatePlannedItemMaterials,
  resolveEnhancementRecipe,
  resolveMinimumLevelShardRecipe
} from './materialCalculations.ts'
import type { PlannedItem } from './plannerState.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const data = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const emptyItem = (): PlannedItem => ({
  prefixEnhancementId: null,
  suffixEnhancementId: null,
  extraEnhancementId: null,
  hasCannithMark: false,
  minimumLevelOverride: null,
  augmentSlots: []
})

describe('Essence Crafting material calculations', () => {
  it('resolves the explicit bound and unbound enhancement recipe variants', () => {
    const fixture = data()

    expect(resolveEnhancementRecipe(fixture, 'enhancement-alpha-prefix', 'bound')).toMatchObject({
      status: 'resolved',
      recipe: { id: 'recipe-enhancement-bound', binding: 'bound' }
    })
    expect(resolveEnhancementRecipe(fixture, 'enhancement-alpha-prefix', 'unbound')).toMatchObject({
      status: 'resolved',
      recipe: { id: 'recipe-enhancement-unbound', binding: 'unbound' }
    })
  })

  it('resolves the published minimum-level recipe, including the maximum supported level', () => {
    const fixture = data()

    expect(resolveMinimumLevelShardRecipe(fixture, 1, 'bound')).toMatchObject({
      status: 'resolved',
      recipe: { id: 'recipe-minimum-level-bound-01', itemLevel: 1 }
    })
    expect(resolveMinimumLevelShardRecipe(fixture, fixture.rules.supportedItemLevels.maximum, 'unbound')).toMatchObject(
      {
        status: 'resolved',
        recipe: { id: 'recipe-minimum-level-unbound-02', itemLevel: 2 }
      }
    )
  })

  it('uses an item-level override and emits the minimum-level step before a prefix-only selection', () => {
    const result = calculatePlannedItemMaterials(
      data(),
      { ...emptyItem(), prefixEnhancementId: 'enhancement-alpha-prefix', minimumLevelOverride: 2 },
      1,
      'bound'
    )

    expect(result.effectiveItemLevel).toBe(2)
    expect(result.steps.map((step) => step.source)).toEqual(['minimum-level-shard', 'prefix'])
    expect(result.materials).toEqual([
      { ingredientId: 'ingredient-essence', displayName: 'Magic Item Essence', quantity: 30 }
    ])
  })

  it('includes a suffix-only selection', () => {
    const result = calculatePlannedItemMaterials(
      data(),
      { ...emptyItem(), suffixEnhancementId: 'enhancement-level-two-suffix' },
      2,
      'unbound'
    )

    expect(result.steps.map((step) => step.source)).toEqual(['minimum-level-shard', 'suffix'])
    expect(result.materials[0]?.quantity).toBe(160)
  })

  it('excludes Extra without Mark and includes Extra plus one Mark when it is enabled', () => {
    const withoutMark = calculatePlannedItemMaterials(
      data(),
      { ...emptyItem(), extraEnhancementId: 'enhancement-ring-extra' },
      1,
      'bound'
    )
    const withMark = calculatePlannedItemMaterials(
      data(),
      { ...emptyItem(), extraEnhancementId: 'enhancement-ring-extra', hasCannithMark: true },
      1,
      'bound'
    )

    expect(withoutMark.steps.map((step) => step.source)).toEqual(['minimum-level-shard'])
    expect(withMark.steps.map((step) => step.source)).toEqual(['minimum-level-shard', 'extra', 'mark-of-house-cannith'])
    expect(withMark.materials).toEqual([
      { ingredientId: 'ingredient-essence', displayName: 'Magic Item Essence', quantity: 20 },
      { ingredientId: 'ingredient-mark', displayName: 'Mark of House Cannith', quantity: 1 }
    ])
  })

  it('charges a split-prefix enhancement once, not once per component effect', () => {
    const result = calculatePlannedItemMaterials(
      data(),
      { ...emptyItem(), prefixEnhancementId: 'enhancement-split-prefix' },
      1,
      'bound'
    )

    expect(result.steps.map((step) => step.source)).toEqual(['minimum-level-shard', 'prefix'])
    expect(result.materials[0]?.quantity).toBe(20)
  })

  it('aggregates active items by ingredient ID, charging one Mark per marked item and ignoring inactive records', () => {
    const result = calculatePlanMaterials(
      data(),
      {
        masterMinimumLevel: 1,
        activeSlotIds: ['main-hand', 'ring-1', 'ring-2'],
        collapsedSlotIds: [],
        itemsBySlotId: {
          'main-hand': { ...emptyItem(), prefixEnhancementId: 'enhancement-alpha-prefix' },
          'ring-1': { ...emptyItem(), extraEnhancementId: 'enhancement-ring-extra', hasCannithMark: true },
          'ring-2': { ...emptyItem(), extraEnhancementId: 'enhancement-ring-extra', hasCannithMark: true },
          armor: { ...emptyItem(), suffixEnhancementId: 'enhancement-display-fixed' }
        }
      },
      'bound'
    )

    expect(result.items.map((item) => item.equipmentSlotId)).toEqual(['main-hand', 'ring-1', 'ring-2'])
    expect(result.materials).toEqual([
      { ingredientId: 'ingredient-essence', displayName: 'Magic Item Essence', quantity: 60 },
      { ingredientId: 'ingredient-mark', displayName: 'Mark of House Cannith', quantity: 2 }
    ])
  })

  it('keeps ingredients with the same display name separate and orders ties by ID', () => {
    const payload = createEssenceCraftingTestPayload()
    payload.ingredients.push({ id: 'ingredient-essence-alternate', displayName: 'Magic Item Essence' })
    payload.recipes.push({
      id: 'recipe-alternate-bound',
      kind: 'enhancement-shard',
      sourceRecipeId: 'alternate-bound',
      binding: 'bound',
      craftingLevel: 100,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence-alternate', quantity: 7 }]
    })
    payload.recipes.push({
      id: 'recipe-alternate-unbound',
      kind: 'enhancement-shard',
      sourceRecipeId: 'alternate-unbound',
      binding: 'unbound',
      craftingLevel: 100,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence-alternate', quantity: 8 }]
    })
    payload.enhancements.push({
      id: 'enhancement-alternate-suffix',
      displayName: 'Alternate Suffix',
      minimumItemLevel: 1,
      placements: [{ position: 'suffix', itemCategoryIds: ['weapon'] }],
      effects: [{ id: 'effect-alternate-suffix', displayName: 'Alternate Suffix Effect' }],
      recipes: { boundRecipeId: 'recipe-alternate-bound', unboundRecipeId: 'recipe-alternate-unbound' }
    })

    const result = calculatePlannedItemMaterials(
      validateEssenceCraftingDataset(payload),
      {
        ...emptyItem(),
        prefixEnhancementId: 'enhancement-alpha-prefix',
        suffixEnhancementId: 'enhancement-alternate-suffix'
      },
      1,
      'bound'
    )

    expect(result.materials).toEqual([
      { ingredientId: 'ingredient-essence', displayName: 'Magic Item Essence', quantity: 20 },
      { ingredientId: 'ingredient-essence-alternate', displayName: 'Magic Item Essence', quantity: 7 }
    ])
  })

  it('returns an unavailable result when the requested enhancement variant is absent', () => {
    const fixture = data()
    const enhancement = fixture.indexes.enhancementById.get('enhancement-alpha-prefix')
    if (!enhancement) throw new Error('Expected test enhancement')
    const missingVariantData = {
      ...fixture,
      indexes: {
        ...fixture.indexes,
        enhancementById: new Map(fixture.indexes.enhancementById).set('enhancement-alpha-prefix', {
          ...enhancement,
          recipes: { ...enhancement.recipes, unboundRecipeId: 'missing-unbound-recipe' }
        })
      }
    }

    expect(resolveEnhancementRecipe(missingVariantData, 'enhancement-alpha-prefix', 'unbound')).toEqual({
      status: 'recipe-variant-unavailable',
      enhancementId: 'enhancement-alpha-prefix',
      binding: 'unbound',
      recipeId: 'missing-unbound-recipe'
    })
    expect(
      calculatePlannedItemMaterials(
        missingVariantData,
        { ...emptyItem(), prefixEnhancementId: 'enhancement-alpha-prefix' },
        1,
        'unbound'
      ).steps[1]
    ).toMatchObject({ status: 'unavailable', source: 'prefix', reason: { status: 'recipe-variant-unavailable' } })
  })

  it('returns no materials for an empty plan with a stable empty order', () => {
    expect(
      calculatePlanMaterials(
        data(),
        { masterMinimumLevel: 1, activeSlotIds: [], collapsedSlotIds: [], itemsBySlotId: {} },
        'bound'
      )
    ).toEqual({ items: [], materials: [] })
  })
})
