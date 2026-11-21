import { describe, expect, it } from 'vitest'
import {
  buildCraftingPlan,
  buildMeltingRecipeLookup,
  buildShoppingListTotals,
  classifyEntry,
  CyclicRecipeDependencyError,
  getEntriesByCategory,
  getNearlyFinishedEntries,
  hasThreadOfFate,
  InvalidNearlyFinishedDatasetError,
  MissingIngredientRecipeError,
  parseNearlyFinishedDataset,
  UnsupportedNearlyFinishedSchemaError
} from './nearlyFinished.logic.ts'
import type {
  MeltingRecipe,
  NearlyFinishedDataset,
  NearlyFinishedRequirement,
  ReforgingEntry
} from './nearlyFinished.types.ts'

const requirement = (name: string, quantity: number): NearlyFinishedRequirement => ({ name, quantity })

const entry = (
  item: string,
  cost: NearlyFinishedRequirement[],
  values: Partial<ReforgingEntry> = {}
): ReforgingEntry => ({
  item,
  stage: 'Nearly Finished',
  cost,
  effectsAdded: [],
  ...values
})

const recipes: MeltingRecipe[] = [
  {
    name: 'Metallic Ingot',
    quantity: 1,
    requirements: [requirement('Iron Defender Rivet', 2)]
  },
  {
    name: 'Durable Alloy',
    quantity: 1,
    requirements: [requirement('Metallic Ingot', 3), requirement('Iron Defender Claw', 1)]
  }
]

const dataset: NearlyFinishedDataset = {
  meltingStation: recipes,
  reforgingStation: [
    entry('Zircon Item', [requirement('Durable Alloy', 2)], {
      choices: [{ name: 'Strength +8' }, { name: 'Dexterity +8' }]
    }),
    entry('Legendary Amber Item', [requirement('Metallic Ingot', 1)], {
      choices: [{ name: 'Quality Strength +3' }]
    }),
    entry('Raid Item', [requirement('Metallic Ingot', 1), requirement('Thread of Fate', 100)], {
      effectsAdded: [{ name: 'Almost There' }],
      augments: [{ purple: null }]
    }),
    entry('Ignored Stage', [requirement('Metallic Ingot', 1)], { stage: 'Almost There' }),
    entry('Amber Item', [requirement('Metallic Ingot', 1)])
  ]
}

describe('Nearly Finished dataset contract and classification', () => {
  it('validates the required top-level structure without mutating the payload', () => {
    const value = structuredClone(dataset)
    const snapshot = structuredClone(value)

    expect(parseNearlyFinishedDataset(value)).toEqual(dataset)
    expect(value).toEqual(snapshot)
  })

  it('accepts a melting recipe with no raw requirements', () => {
    expect(
      parseNearlyFinishedDataset({
        meltingStation: [{ name: 'Empty Component', quantity: 1, requirements: [] }],
        reforgingStation: [entry('Empty Raw Item', [requirement('Empty Component', 1)])]
      })
    ).toBeTruthy()
  })

  it('rejects unsupported schema versions and structurally invalid payloads', () => {
    expect(() => parseNearlyFinishedDataset({ ...dataset, schemaVersion: 3 })).toThrow(
      UnsupportedNearlyFinishedSchemaError
    )
    expect(() => parseNearlyFinishedDataset({ meltingStation: [], reforgingStation: [{}] })).toThrow(
      InvalidNearlyFinishedDatasetError
    )
  })

  it('filters the exact stage and sorts items by name', () => {
    expect(getNearlyFinishedEntries(dataset).map(({ item }) => item)).toEqual([
      'Amber Item',
      'Legendary Amber Item',
      'Raid Item',
      'Zircon Item'
    ])
  })

  it('classifies Heroic, Legendary, and Thread of Fate raid entries exactly once', () => {
    const findEntry = (item: string) => {
      const found = dataset.reforgingStation.find((candidate) => candidate.item === item)
      if (!found) throw new Error(`Missing test entry: ${item}`)
      return found
    }
    const heroic = findEntry('Amber Item')
    const legendary = findEntry('Legendary Amber Item')
    const raid = findEntry('Raid Item')

    expect(classifyEntry(heroic)).toBe('Heroic')
    expect(classifyEntry(legendary)).toBe('Legendary')
    expect(hasThreadOfFate(raid)).toBe(true)
    expect(classifyEntry(raid)).toBe('Raid')
    expect(getEntriesByCategory(dataset, 'Heroic').map(({ item }) => item)).toEqual(['Amber Item', 'Zircon Item'])
    expect(getEntriesByCategory(dataset, 'Legendary').map(({ item }) => item)).toEqual(['Legendary Amber Item'])
    expect(getEntriesByCategory(dataset, 'Raid').map(({ item }) => item)).toEqual(['Raid Item'])
  })

  it('gives Thread of Fate precedence over Legendary naming', () => {
    expect(classifyEntry(entry('The Legendary Raid Item', [requirement('Thread of Fate', 1)]))).toBe('Raid')
  })

  it('rejects duplicate melting recipes and duplicate item-stage entries', () => {
    expect(() => buildMeltingRecipeLookup([...recipes, recipes[0]])).toThrow(InvalidNearlyFinishedDatasetError)
    expect(() =>
      parseNearlyFinishedDataset({
        meltingStation: recipes,
        reforgingStation: [dataset.reforgingStation[0], structuredClone(dataset.reforgingStation[0])]
      })
    ).toThrow(InvalidNearlyFinishedDatasetError)
  })
})

describe('Nearly Finished recipe calculations', () => {
  it('expands a single-level melting recipe into raw and crafted totals', () => {
    const plan = buildCraftingPlan(entry('Simple Item', [requirement('Metallic Ingot', 2)]), recipes)

    expect(plan.rawMaterials).toEqual([{ name: 'Iron Defender Rivet', quantity: 4 }])
    expect(plan.craftedMaterials).toEqual([
      {
        name: 'Metallic Ingot',
        quantity: 2,
        requirements: [requirement('Iron Defender Rivet', 2)]
      }
    ])
  })

  it('multiplies nested quantities, aggregates duplicates, and orders dependencies first', () => {
    const selected = entry('Nested Item', [
      requirement('Durable Alloy', 2),
      requirement('Metallic Ingot', 1),
      requirement('Iron Defender Claw', 3)
    ])
    const snapshot = structuredClone(selected)
    const plan = buildCraftingPlan(selected, recipes)

    expect(plan.rawMaterials).toEqual([
      { name: 'Iron Defender Claw', quantity: 5 },
      { name: 'Iron Defender Rivet', quantity: 14 }
    ])
    expect(plan.craftedMaterials.map(({ name, quantity }) => ({ name, quantity }))).toEqual([
      { name: 'Metallic Ingot', quantity: 7 },
      { name: 'Durable Alloy', quantity: 2 }
    ])
    expect(plan.finalStep).toEqual({ item: 'Nested Item', quantity: 1, requirements: selected.cost })
    expect(selected).toEqual(snapshot)
  })

  it('treats inspected base ingredients as raw and rejects an unknown missing crafted recipe', () => {
    expect(buildCraftingPlan(entry('Raw Item', [requirement('Thread of Fate', 10)]), recipes).rawMaterials).toEqual([
      { name: 'Thread of Fate', quantity: 10 }
    ])
    const buildBrokenPlan = () => buildCraftingPlan(entry('Broken Item', [requirement('Unknown Compound', 1)]), recipes)

    expect(buildBrokenPlan).toThrow(MissingIngredientRecipeError)
    expect(buildBrokenPlan).toThrow('Unknown Compound required by Broken Item')
  })

  it('detects a dependency cycle with a useful path', () => {
    const cyclicRecipes: MeltingRecipe[] = [
      { name: 'Alloy A', quantity: 1, requirements: [requirement('Alloy B', 1)] },
      { name: 'Alloy B', quantity: 1, requirements: [requirement('Alloy A', 1)] }
    ]

    expect(() => buildCraftingPlan(entry('Cyclic Item', [requirement('Alloy A', 1)]), cyclicRecipes)).toThrow(
      CyclicRecipeDependencyError
    )
    expect(() => buildCraftingPlan(entry('Cyclic Item', [requirement('Alloy A', 1)]), cyclicRecipes)).toThrow(
      'for Cyclic Item: Alloy A -> Alloy B -> Alloy A'
    )
  })

  it('builds shopping totals that agree with the ordered plan', () => {
    const plan = buildCraftingPlan(entry('Shopping Item', [requirement('Durable Alloy', 2)]), recipes)

    expect(buildShoppingListTotals(plan)).toEqual({
      rawMaterials: plan.rawMaterials,
      craftedMaterials: plan.craftedMaterials.map(({ name, quantity }) => ({ name, quantity }))
    })
  })

  it('runs parity invariants across every Nearly Finished entry', () => {
    const parsed = parseNearlyFinishedDataset(structuredClone(dataset))

    for (const selected of getNearlyFinishedEntries(parsed)) {
      const plan = buildCraftingPlan(selected, parsed.meltingStation)
      const categoryMatches = (['Heroic', 'Legendary', 'Raid'] as const).filter(
        (category) => classifyEntry(selected) === category
      )

      expect(categoryMatches).toHaveLength(1)
      expect([...plan.rawMaterials, ...plan.craftedMaterials].every(({ quantity }) => quantity > 0)).toBe(true)
      expect(buildShoppingListTotals(plan).rawMaterials).toEqual(plan.rawMaterials)
      expect(plan.finalStep.requirements).toEqual(selected.cost)
    }
  })
})
