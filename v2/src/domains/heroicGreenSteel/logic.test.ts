import { describe, expect, it } from 'vitest'
import type {
  HgsBaseItem,
  HgsEffect,
  HgsIngredient,
  HgsRecipe,
  HgsSelection,
  HgsSpell,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import {
  applyHgsSelection,
  classifyBaseItems,
  createHgsValidCombinations,
  CyclicHeroicGreenSteelRecipeError,
  emptyHgsSelection,
  expandIngredientRequirements,
  filterFocusedByShardType,
  formatMechanic,
  formatProc,
  getAvailableHgsOptionIds,
  InvalidHeroicGreenSteelReferenceError,
  isHgsSelectionCompatible,
  resolveEffects,
  resolveSpell,
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

const weapon = base(100, 'weapon')
const equipment = base(101, 'equipment')
const secondWeapon = base(102, 'weapon')
const baseItemById = new Map([
  [weapon.id, weapon],
  [equipment.id, equipment],
  [secondWeapon.id, secondWeapon]
])
const tier1Options = [
  option(1, { focus: 'Earth' }),
  option(2, { focus: 'Earth', gem: 'Opposition' }),
  option(3, { focus: 'Air' }),
  option(4, { type: 'equipment', focus: 'Earth' })
]
const tier2Options = [
  option(11, { requiresFocus: 'Earth', aspect: 'Mineral' }),
  option(12, { requiresFocus: 'Earth', aspect: 'Mineral', gem: 'Opposition' }),
  option(13, { requiresFocus: 'Air', aspect: 'Lightning' }),
  option(14, { requiresFocus: 'Air', aspect: 'Mineral' }),
  option(15, { type: 'equipment', requiresFocus: 'Earth', aspect: 'Mineral' })
]
const tier3BasicOptions = [option(21), option(22, { type: 'equipment' })]
const tier3FocusedOptions = [
  option(31, { requiresAspect: 'Mineral', shardType: 'single' }),
  option(32, { requiresAspect: 'Lightning', shardType: 'compound' }),
  option(33, { type: 'equipment', requiresAspect: 'Mineral', shardType: 'single' })
]
const combinations = createHgsValidCombinations(tier1Options, tier2Options, tier3BasicOptions, tier3FocusedOptions)
const selection = (overrides: Partial<HgsSelection> = {}): HgsSelection => ({
  ...emptyHgsSelection,
  selectedBaseItemId: weapon.id,
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

  it('builds complete combinations only from structured compatibility fields', () => {
    expect(combinations).toContainEqual({
      type: 'weapon',
      tier1Id: 1,
      tier2Id: 11,
      tier3Mode: 'focused',
      tier3Id: 31
    })
    expect(combinations).not.toContainEqual(expect.objectContaining({ tier1Id: 1, tier2Id: 13 }))
    expect(combinations).not.toContainEqual(expect.objectContaining({ tier2Id: 11, tier3Id: 32 }))
    expect(filterFocusedByShardType(tier3FocusedOptions, 'single').map(({ id }) => id)).toEqual([31, 33])
  })

  it('supports the traditional Tier 1, Tier 2, Tier 3 sequence', () => {
    let current = applyHgsSelection(selection(), 'selectedTier1Id', 1, combinations, baseItemById)
    current = applyHgsSelection(current, 'selectedTier2Id', 11, combinations, baseItemById)
    current = applyHgsSelection(current, 'selectedTier3Mode', 'focused', combinations, baseItemById)
    current = applyHgsSelection(current, 'selectedTier3Id', 31, combinations, baseItemById)

    expect(current).toMatchObject({ selectedTier1Id: 1, selectedTier2Id: 11, selectedTier3Id: 31 })
    expect(isHgsSelectionCompatible(combinations, current, baseItemById)).toBe(true)
  })

  it('starts at Tier 2 and derives compatible Tier 1 and Tier 3 options', () => {
    const current = applyHgsSelection(selection(), 'selectedTier2Id', 11, combinations, baseItemById)
    const available = getAvailableHgsOptionIds(combinations, current, baseItemById)

    expect(current.selectedTier2Id).toBe(11)
    expect([...available.tier1]).toEqual([1, 2])
    expect(available.tier3).toEqual(new Set([21, 31]))
  })

  it('starts at Tier 3 and derives compatible earlier tiers', () => {
    const current = selection({ selectedTier3Mode: 'focused', selectedTier3Id: 31 })
    const available = getAvailableHgsOptionIds(combinations, current, baseItemById)

    expect(current.selectedTier3Id).toBe(31)
    expect(available.tier1).toEqual(new Set([1, 2, 3]))
    expect(available.tier2).toEqual(new Set([11, 12, 14]))
  })

  it('retains Tier 3 then Tier 2 and filters Tier 1', () => {
    let current = selection({ selectedTier3Mode: 'focused', selectedTier3Id: 31 })
    current = applyHgsSelection(current, 'selectedTier2Id', 11, combinations, baseItemById)

    expect(current).toMatchObject({ selectedTier2Id: 11, selectedTier3Id: 31 })
    expect(getAvailableHgsOptionIds(combinations, current, baseItemById).tier1).toEqual(new Set([1, 2]))
  })

  it('retains Tier 2 then Tier 1 and filters Tier 3', () => {
    let current = selection({ selectedTier2Id: 11 })
    current = applyHgsSelection(current, 'selectedTier1Id', 1, combinations, baseItemById)

    expect(current).toMatchObject({ selectedTier1Id: 1, selectedTier2Id: 11 })
    expect(getAvailableHgsOptionIds(combinations, current, baseItemById).tier3).toEqual(new Set([21, 31]))
  })

  it('preserves later selections when an earlier change remains compatible', () => {
    const complete = selection({
      selectedTier1Id: 1,
      selectedTier2Id: 11,
      selectedTier3Mode: 'focused',
      selectedTier3Id: 31
    })
    const current = applyHgsSelection(complete, 'selectedTier1Id', 2, combinations, baseItemById)

    expect(current).toMatchObject({ selectedTier1Id: 2, selectedTier2Id: 11, selectedTier3Id: 31 })
  })

  it('clears only selections invalidated by a new constraint', () => {
    const complete = selection({
      selectedTier1Id: 1,
      selectedTier2Id: 11,
      selectedTier3Mode: 'focused',
      selectedTier3Id: 31
    })
    const current = applyHgsSelection(complete, 'selectedTier1Id', 3, combinations, baseItemById)

    expect(current).toMatchObject({ selectedTier1Id: 3, selectedTier2Id: null, selectedTier3Id: 31 })
    expect(isHgsSelectionCompatible(combinations, current, baseItemById)).toBe(true)
  })

  it('preserves altar selections across compatible base changes', () => {
    const complete = selection({
      selectedTier1Id: 1,
      selectedTier2Id: 11,
      selectedTier3Mode: 'focused',
      selectedTier3Id: 31
    })

    expect(
      applyHgsSelection(complete, 'selectedBaseItemId', secondWeapon.id, combinations, baseItemById)
    ).toMatchObject({ selectedTier1Id: 1, selectedTier2Id: 11, selectedTier3Id: 31 })
    expect(applyHgsSelection(complete, 'selectedBaseItemId', equipment.id, combinations, baseItemById)).toMatchObject({
      selectedTier1Id: null,
      selectedTier2Id: null,
      selectedTier3Id: null
    })
  })

  it('does not self-filter the altar being changed', () => {
    const current = selection({
      selectedTier1Id: 1,
      selectedTier2Id: 11,
      selectedTier3Mode: 'focused',
      selectedTier3Id: 31
    })

    expect(getAvailableHgsOptionIds(combinations, current, baseItemById).tier2).toEqual(new Set([11, 12]))
  })

  it('treats empty selections as no constraints', () => {
    const available = getAvailableHgsOptionIds(combinations, emptyHgsSelection, baseItemById)

    expect(available.tier1).toEqual(new Set([1, 2, 3, 4]))
    expect(available.tier2).toEqual(new Set([11, 12, 13, 14, 15]))
    expect(available.tier3).toEqual(new Set([21, 31, 32, 22, 33]))
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
    expect(
      formatMechanic({ name: 'Electric Spell Critical Chance', unit: 'percent', value: 14, bonusType: 'Equipment' })
    ).toBe('Electric Spell Critical Chance +14% (Equipment)')
    expect(formatMechanic({ name: 'Acid Resistance', unit: 'percent', value: 10 })).toBe('Acid Resistance +10%')
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
