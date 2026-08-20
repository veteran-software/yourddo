import { describe, expect, it } from 'vitest'
import type {
  HgsBaseItem,
  HgsEffect,
  HgsIngredient,
  HgsRecipe,
  HgsSpell,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import {
  classifyBaseItems,
  CyclicHeroicGreenSteelRecipeError,
  emptyHgsSelection,
  expandIngredientRequirements,
  filterFocusedByShardType,
  formatMechanic,
  formatProc,
  getCompatibleTier1,
  getCompatibleTier2,
  getCompatibleTier3Basic,
  getCompatibleTier3Focused,
  InvalidHeroicGreenSteelReferenceError,
  resolveEffects,
  resolveSpell,
  selectBaseItem,
  selectTier1,
  selectTier2,
  selectTier3Mode,
  stripDdoMarkup
} from './logic.ts'

const base = (id: number, type: 'weapon' | 'equipment'): HgsBaseItem => ({
  id,
  name: `${type} ${id.toString()}`,
  description: '',
  recipeId: id + 100,
  type,
  ...(type === 'weapon' ? { weaponType: 'Sword' } : {})
})

const option = (id: number, overrides: Partial<HgsTierOption> = {}): HgsTierOption => ({
  id,
  name: `Option ${id.toString()}`,
  type: 'weapon',
  essence: 'Material',
  focus: 'Earth',
  gem: 'Dominion',
  effectIds: [1],
  recipeId: id + 1000,
  ...overrides
})

describe('Heroic Green Steel logic', () => {
  it('classifies the published 45-item shape by structured type', () => {
    const items = [
      ...Array.from({ length: 37 }, (_, id) => base(id, 'weapon')),
      ...Array.from({ length: 8 }, (_, id) => base(id + 37, 'equipment'))
    ]
    expect(items).toHaveLength(45)
    expect(classifyBaseItems(items, 'weapon')).toHaveLength(37)
    expect(classifyBaseItems(items, 'equipment')).toHaveLength(8)
  })

  it('uses only structured compatibility fields for every tier', () => {
    const tier1 = [option(1), option(2, { type: 'equipment' })]
    expect(getCompatibleTier1(tier1, base(1, 'weapon')).map(({ id }) => id)).toEqual([1])

    const selectedTier1 = option(3, { focus: 'Earth' })
    const tier2 = Array.from({ length: 36 }, (_, id) => option(id, { requiresFocus: 'Earth', aspect: 'Mineral' }))
    tier2.push(option(100, { requiresFocus: 'Air', aspect: 'Lightning' }))
    expect(getCompatibleTier2(tier2, selectedTier1)).toHaveLength(36)

    const selectedTier2 = option(4, { aspect: 'Mineral' })
    const basic = Array.from({ length: 36 }, (_, id) => option(id))
    basic.push(option(101, { type: 'equipment' }))
    expect(getCompatibleTier3Basic(basic, selectedTier2)).toHaveLength(36)

    const focused = [
      ...Array.from({ length: 6 }, (_, id) =>
        option(id, { requiresAspect: 'Mineral', shardType: id < 2 ? 'single' : 'compound' })
      ),
      option(200, { requiresAspect: 'Radiance', shardType: 'compound' })
    ]
    const compatible = getCompatibleTier3Focused(focused, selectedTier2)
    expect(compatible).toHaveLength(6)
    expect(filterFocusedByShardType(compatible, 'single')).toHaveLength(2)
    expect(filterFocusedByShardType(compatible, 'compound')).toHaveLength(4)
  })

  it('resets every downstream selection explicitly', () => {
    const complete = {
      selectedBaseItemId: 1,
      selectedTier1Id: 2,
      selectedTier2Id: 3,
      selectedTier3Mode: 'basic' as const,
      selectedTier3Id: 4
    }
    expect(selectBaseItem(complete, 9)).toEqual({ ...emptyHgsSelection, selectedBaseItemId: 9 })
    expect(selectTier1(complete, 8)).toMatchObject({
      selectedTier1Id: 8,
      selectedTier2Id: null,
      selectedTier3Mode: null,
      selectedTier3Id: null
    })
    expect(selectTier2(complete, 7)).toMatchObject({
      selectedTier2Id: 7,
      selectedTier3Mode: null,
      selectedTier3Id: null
    })
    expect(selectTier3Mode(complete, 'focused', new Set([4])).selectedTier3Id).toBe(4)
    expect(selectTier3Mode(complete, 'focused', new Set([5])).selectedTier3Id).toBeNull()
  })

  it('resolves effects and optional spells and rejects missing references', () => {
    const effect: HgsEffect = { id: 1, displayName: 'Keen', description: '', enchantments: [], procs: [] }
    const spell: HgsSpell = {
      id: 2,
      name: 'Earthgrab',
      description: '',
      casterLevel: 16,
      charges: 2,
      rechargePerDay: 2
    }
    expect(resolveEffects([1], new Map([[1, effect]]))).toEqual([effect])
    expect(resolveSpell(2, new Map([[2, spell]]))).toBe(spell)
    expect(resolveSpell(undefined, new Map())).toBeUndefined()
    expect(() => resolveEffects([3], new Map())).toThrow(InvalidHeroicGreenSteelReferenceError)
    expect(() => resolveSpell(3, new Map())).toThrow(InvalidHeroicGreenSteelReferenceError)
  })

  it('formats typed mechanics, procs, and DDO markup without interpreting descriptions', () => {
    expect(formatMechanic({ type: 'damage', damageType: 'Fire', dice: { count: 1, sides: 6 } })).toBe('1d6 Fire damage')
    expect(
      formatMechanic({ name: 'Fortification', type: 'criticalHitResistance', unit: 'percent', value: 100 })
    ).toContain('100%')
    expect(formatProc({ trigger: 'onHit', procChance: 0.04, outcomes: [{ type: 'status', name: 'Earthgrab' }] })).toBe(
      'On hit (4% chance): Earthgrab'
    )
    expect(stripDdoMarkup('<rgb=#fff>Protection +5</rgb>\\nSmoke Screen')).toBe('Protection +5\nSmoke Screen')
  })

  it('recursively multiplies quantities and aggregates duplicate terminal materials', () => {
    const ingredients: HgsIngredient[] = [
      { id: 10, name: 'Crafted shard', description: '' },
      { id: 20, name: 'Raw stone', description: '' }
    ]
    const recipes: HgsRecipe[] = [
      {
        id: 1,
        name: 'Root',
        device: 'base',
        ingredients: [
          { ingredientId: 10, quantity: 2, producerRecipeId: 2 },
          { ingredientId: 20, quantity: 1 }
        ]
      },
      { id: 2, name: 'Shard', device: 'base', ingredients: [{ ingredientId: 20, quantity: 3 }] }
    ]
    const result = expandIngredientRequirements([1], {
      ingredientById: new Map(ingredients.map((value) => [value.id, value])),
      recipeById: new Map(recipes.map((value) => [value.id, value]))
    })
    expect(result.terminal).toEqual([{ ingredient: ingredients[1], quantity: 7 }])
    expect(result.crafted).toEqual([{ ingredient: ingredients[0], quantity: 2 }])
  })

  it('protects recipe expansion from cycles and missing references', () => {
    const ingredient: HgsIngredient = { id: 10, name: 'Shard', description: '' }
    const cyclic: HgsRecipe[] = [
      { id: 1, name: 'One', device: 'base', ingredients: [{ ingredientId: 10, quantity: 1, producerRecipeId: 2 }] },
      { id: 2, name: 'Two', device: 'base', ingredients: [{ ingredientId: 10, quantity: 1, producerRecipeId: 1 }] }
    ]
    expect(() =>
      expandIngredientRequirements([1], {
        ingredientById: new Map([[10, ingredient]]),
        recipeById: new Map(cyclic.map((value) => [value.id, value]))
      })
    ).toThrow(CyclicHeroicGreenSteelRecipeError)
    expect(() => expandIngredientRequirements([99], { ingredientById: new Map(), recipeById: new Map() })).toThrow(
      InvalidHeroicGreenSteelReferenceError
    )
    expect(() =>
      expandIngredientRequirements([1], {
        ingredientById: new Map(),
        recipeById: new Map([
          [1, { id: 1, name: 'Missing', device: 'base', ingredients: [{ ingredientId: 99, quantity: 1 }] }]
        ])
      })
    ).toThrow('missing ingredient 99')
  })
})
