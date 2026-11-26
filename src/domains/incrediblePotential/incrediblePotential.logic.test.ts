import { describe, expect, it } from 'vitest'
import type { AltarRecipe, IncrediblePotentialRing, RecipeIngredient, RingUpgrade } from './data.ts'
import {
  buildCraftingPlan,
  CyclicAltarRecipeError,
  filterItems,
  formatEffect,
  getFilterOptions,
  getRingFilterValues,
  getRingUpgrades,
  getUpgradeFilterValues,
  MissingAltarRecipeError,
  MissingUpgradeIngredientError,
  validateIncrediblePotentialData
} from './incrediblePotential.logic.ts'

const material = (name: string, quantity = 1): RecipeIngredient => ({ name, quantity })
const crafted = ({ recipeId, name }: AltarRecipe, quantity = 1): RecipeIngredient => ({ name, quantity, recipeId })
const makeRecipe = (recipeId: number, name: string, ingredients: RecipeIngredient[]) => ({
  recipeId,
  name,
  stage: 'component' as const,
  ingredients
})

const focus = makeRecipe(1, 'Focus of Fire', [
  material('Medium Devil Scales'),
  material('Medium Glowing Arrowhead'),
  material('Medium Gnawed Bone'),
  material('Medium Twisted Shrapnel'),
  material('Shavarath Medium Energy Cell')
])
const gem = makeRecipe(2, 'Gem of Dominion', [
  material('Medium Devil Scales'),
  material('Medium Gnawed Bone'),
  material('Medium Length of Infernal Chain'),
  material('Medium Twisted Shrapnel'),
  material('Shavarath Medium Energy Cell')
])
const essence = makeRecipe(3, 'Material Essence', [
  material('Medium Devil Scales'),
  material('Medium Glowing Arrowhead'),
  material('Medium Sulfurous Stone'),
  material('Medium Twisted Shrapnel'),
  material('Shavarath Medium Energy Cell')
])
const shard: AltarRecipe = {
  ...makeRecipe(4, 'Material Fire Dominion Shard of Great Power', [
    crafted(focus),
    crafted(gem),
    crafted(essence),
    material('Shard of Great Power'),
    material('Shavarath Medium Energy Cell')
  ]),
  stage: 'shardImbuement'
}

const upgrade: RingUpgrade = {
  ...makeRecipe(5, 'Material Fire Dominion Ring Upgrade', [crafted(shard), material('Shavarath Trophy of War', 9)]),
  stage: 'ringUpgrade',
  ringIds: [100, 200],
  added: [{ name: 'Flaming Burst' }]
}
const recipes = [focus, gem, essence, shard, upgrade]

describe('Incredible Potential logic', () => {
  it('builds the factual full-craft totals and ordered step breakdown', () => {
    const source = structuredClone(recipes)
    const plan = buildCraftingPlan(upgrade, source, [{ name: 'Medium Devil Scales', foundIn: ['Tower of Despair'] }])

    expect(plan.rawMaterials).toEqual([
      { name: 'Medium Devil Scales', quantity: 3, foundIn: ['Tower of Despair'] },
      { name: 'Medium Glowing Arrowhead', quantity: 2, foundIn: [] },
      { name: 'Medium Gnawed Bone', quantity: 2, foundIn: [] },
      { name: 'Medium Length of Infernal Chain', quantity: 1, foundIn: [] },
      { name: 'Medium Sulfurous Stone', quantity: 1, foundIn: [] },
      { name: 'Medium Twisted Shrapnel', quantity: 3, foundIn: [] },
      { name: 'Shard of Great Power', quantity: 1, foundIn: [] },
      { name: 'Shavarath Medium Energy Cell', quantity: 4, foundIn: [] },
      { name: 'Shavarath Trophy of War', quantity: 9, foundIn: [] }
    ])
    expect(plan.craftedMaterials.map(({ name, quantity }) => ({ name, quantity }))).toEqual([
      { name: 'Focus of Fire', quantity: 1 },
      { name: 'Gem of Dominion', quantity: 1 },
      { name: 'Material Essence', quantity: 1 },
      { name: 'Material Fire Dominion Shard of Great Power', quantity: 1 }
    ])
    expect(plan.steps.map(({ name }) => name)).toEqual([
      'Focus of Fire',
      'Gem of Dominion',
      'Material Essence',
      'Material Fire Dominion Shard of Great Power',
      'Material Fire Dominion Ring Upgrade'
    ])
    expect(source).toEqual(recipes)
  })

  it('retains requirements when ingredient acquisition metadata is missing', () => {
    const plan = buildCraftingPlan(upgrade, recipes, [])

    expect(plan.rawMaterials.find(({ name }) => name === 'Shard of Great Power')).toEqual({
      name: 'Shard of Great Power',
      quantity: 1,
      foundIn: []
    })
  })

  it('aggregates shared nested requirements and multiplies a repeated crafted requirement', () => {
    const doubledShard = { ...shard, ingredients: [...shard.ingredients, crafted(focus)] }
    const plan = buildCraftingPlan(upgrade, [focus, gem, essence, doubledShard, upgrade], [])

    expect(plan.craftedMaterials.find(({ name }) => name === 'Focus of Fire')?.quantity).toBe(2)
    expect(plan.rawMaterials.find(({ name }) => name === 'Medium Devil Scales')?.quantity).toBe(4)
    expect(plan.rawMaterials.find(({ name }) => name === 'Shavarath Medium Energy Cell')?.quantity).toBe(5)
  })

  it('aggregates every repeated upgrade requirement', () => {
    const repeatedShardUpgrade = {
      ...upgrade,
      ingredients: [crafted(shard, 2), material('Shavarath Trophy of War', 9)]
    }
    const plan = buildCraftingPlan(repeatedShardUpgrade, [...recipes, repeatedShardUpgrade], [])

    expect(plan.craftedMaterials.find(({ name }) => name === shard.name)?.quantity).toBe(2)
    expect(plan.craftedMaterials.find(({ name }) => name === focus.name)?.quantity).toBe(2)
    expect(plan.rawMaterials.find(({ name }) => name === 'Medium Devil Scales')?.quantity).toBe(6)
    expect(plan.rawMaterials.find(({ name }) => name === 'Shavarath Medium Energy Cell')?.quantity).toBe(8)
    expect(plan.rawMaterials.find(({ name }) => name === 'Shavarath Trophy of War')?.quantity).toBe(9)
  })

  it('detects cycles and follows IDs even when names match', () => {
    const cyclicFocus = { ...focus, ingredients: [crafted(shard)] }
    expect(() => buildCraftingPlan(upgrade, [cyclicFocus, gem, essence, shard, upgrade], [])).toThrow(
      CyclicAltarRecipeError
    )

    expect(buildCraftingPlan(upgrade, [...recipes, makeRecipe(10, focus.name, [])], [])).toEqual(
      buildCraftingPlan(upgrade, recipes, [])
    )
  })

  it('identifies the parent recipe when a required crafted dependency is missing', () => {
    expect(() => buildCraftingPlan(upgrade, [focus, gem, essence, upgrade], [])).toThrow(
      new MissingAltarRecipeError(upgrade.name, shard.name)
    )

    expect(() => buildCraftingPlan(upgrade, [gem, essence, shard, upgrade], [])).toThrow(
      new MissingAltarRecipeError(shard.name, focus.name)
    )
  })

  it('rejects a ring upgrade without an Imbued Shard of Great Power', () => {
    const upgradeWithoutShard = { ...upgrade, ingredients: [material('Shavarath Trophy of War', 9)] }

    expect(() => buildCraftingPlan(upgradeWithoutShard, recipes, [])).toThrow(MissingUpgradeIngredientError)
  })

  it('produces the same deterministic result regardless of source recipe ordering', () => {
    const forward = buildCraftingPlan(upgrade, recipes, [])
    const reversed = buildCraftingPlan(upgrade, recipes.toReversed(), [])

    expect(reversed).toEqual(forward)
  })

  it('validates every selectable upgrade without mutating the loaded dataset', () => {
    const dataset = {
      rings: [
        {
          id: 100,
          name: "Amara's Band",
          type: 'Ring',
          minLevel: 18,
          setName: 'Exorcist of the Silver Flame',
          enchantments: [{ name: 'Wisdom' }, { name: 'Incredible Potential' }]
        }
      ],
      recipes,
      ingredients: [{ name: 'Medium Devil Scales', foundIn: ['Tower of Despair'] }]
    }
    const source = structuredClone(dataset)

    expect(() => {
      validateIncrediblePotentialData(source)
    }).not.toThrow()
    expect(source).toEqual(dataset)
  })

  it('supports empty, OR, and AND filters with one mode for either record type', () => {
    const rings = [
      { name: 'A', values: ['Strength', 'Set A'] },
      { name: 'B', values: ['Strength', 'Dexterity', 'Set B'] }
    ]

    expect(filterItems(rings, [], 'AND', ({ values }) => values)).toBe(rings)
    expect(filterItems(rings, ['Dexterity', 'Set A'], 'OR', ({ values }) => values).map(({ name }) => name)).toEqual([
      'A',
      'B'
    ])
    expect(
      filterItems(rings, ['Strength', 'Dexterity'], 'AND', ({ values }) => values).map(({ name }) => name)
    ).toEqual(['B'])
  })

  it('derives filter values and formats authoritative CDN effects', () => {
    const ring = {
      enchantments: [{ name: 'Wisdom' }, { name: 'Incredible Potential' }],
      setName: 'Exorcist of the Silver Flame'
    } as IncrediblePotentialRing

    expect(getRingFilterValues(ring)).toEqual(['Wisdom', 'Incredible Potential', 'Exorcist of the Silver Flame'])
    expect(getUpgradeFilterValues(upgrade)).toEqual(['Flaming Burst'])
    expect(formatEffect({ name: 'Wisdom', modifier: '6', bonus: 'Enhancement' })).toBe('Wisdom (+6 Enhancement)')
    expect(formatEffect({ name: 'Fire Absorption', modifier: 0.2 })).toBe('Fire Absorption (20%)')
    expect(formatEffect({ name: 'Flaming Burst' })).toBe('Flaming Burst')
  })

  it('preserves source upgrade ordering and derives sorted filter options from real records', () => {
    const secondUpgrade: RingUpgrade = {
      ...upgrade,
      recipeId: 6,
      name: 'Material Fire Escalation Ring Upgrade',
      added: [{ name: 'Dexterity', modifier: 2, bonus: 'Insight' }]
    }
    const upgrades = getRingUpgrades([focus, secondUpgrade, gem, upgrade])

    expect(upgrades.map(({ name }) => name)).toEqual([secondUpgrade.name, upgrade.name])
    expect(getFilterOptions(upgrades, getUpgradeFilterValues)).toEqual(['Dexterity', 'Flaming Burst'])
    expect(
      getFilterOptions(upgrades, getUpgradeFilterValues).every((option) =>
        upgrades.some((candidate) => getUpgradeFilterValues(candidate).includes(option))
      )
    ).toBe(true)

    const rings = [
      {
        enchantments: [{ name: 'Wisdom' }, { name: 'Incredible Potential' }],
        setName: 'Exorcist of the Silver Flame'
      },
      {
        enchantments: [{ name: 'Dexterity' }, { name: 'Incredible Potential' }],
        setName: 'Assassin'
      }
    ] as IncrediblePotentialRing[]
    const ringOptions = getFilterOptions(rings, getRingFilterValues)

    expect(ringOptions).toEqual([
      'Assassin',
      'Dexterity',
      'Exorcist of the Silver Flame',
      'Incredible Potential',
      'Wisdom'
    ])
    expect(
      ringOptions.every((option) => rings.some((candidate) => getRingFilterValues(candidate).includes(option)))
    ).toBe(true)
  })
})
