import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  type CauldronEffect,
  type CauldronRecipe,
  findRecipeByItem,
  findRecipeBySetBonus,
  findSelectedRecipe,
  formatEffect,
  getEffectOptions,
  getItemOptions,
  getRequiredItemName,
  InvalidCauldronRecipesError,
  loadCauldronRecipes
} from './recipes.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({
  loadManualPayload: vi.fn()
}))

interface Combination {
  item: string
  set: string
  effects: CauldronEffect[]
}

const currentCombinations: Combination[] = [
  {
    item: 'Vestments of Ravenloft',
    set: 'Perfect Silence',
    effects: [{ name: 'Sneak Attack Dice', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: 'Mantle of Escher',
    set: 'Arcane Barrier',
    effects: [{ name: 'Magical Resistance Rating Cap', modifier: 30 }]
  },
  {
    item: 'Platemail of Strahd',
    set: 'Paragon Guard',
    effects: [{ name: 'Armor Class', modifier: '15%', bonus: 'Artifact' }]
  },
  {
    item: 'Coat of Van Richten',
    set: 'Dusk Raider',
    effects: [
      { name: 'Melee Power', modifier: 15, bonus: 'Artifact' },
      { name: 'Ranged Power', modifier: 15, bonus: 'Artifact' }
    ]
  },
  {
    item: 'Staggershockers',
    set: 'Piercing Mind',
    effects: [{ name: 'Intelligence', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: "Attunement's Gaze",
    set: 'Touch of Power',
    effects: [{ name: 'Spell Power: Universal', modifier: 25, bonus: 'Artifact' }]
  },
  {
    item: 'Tattered Scrolls of the Broken One',
    set: 'Alluring Elocution',
    effects: [{ name: 'Charisma', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: "Citadel's Gaze",
    set: 'Arcane Guardian',
    effects: [{ name: 'Magical Resistance', modifier: 30, bonus: 'Artifact' }]
  },
  {
    item: 'Crystalline Gauntlets',
    set: 'Visions of the Beyond',
    effects: [{ name: 'Wisdom', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: "The Family's Blessing",
    set: 'Cruel Cut',
    effects: [{ name: 'Damage vs Helpless', modifier: '15%', bonus: 'Artifact' }]
  },
  {
    item: 'Helm of the Final Watcher',
    set: 'Truthful Blow',
    effects: [{ name: 'Fortification Bypass Chance', modifier: '15%', bonus: 'Artifact' }]
  },
  {
    item: "Dumathoin's Bracers",
    set: 'Tough Shields',
    effects: [{ name: 'Physical Resistance', modifier: 30, bonus: 'Artifact' }]
  },
  { item: 'Cloak of the Mountain', set: 'Esoterica', effects: [{ name: 'Spell DCs', modifier: 3, bonus: 'Artifact' }] },
  {
    item: 'Guided Sight',
    set: 'Quickblade',
    effects: [
      { name: 'Doublestrike Chance', modifier: '15%', bonus: 'Artifact' },
      { name: 'Doubleshot Chance', modifier: '15%', bonus: 'Artifact' }
    ]
  },
  {
    item: 'Mail of the Mroranon',
    set: 'Brutal Blows',
    effects: [{ name: 'Strength', modifier: 3, bonus: 'Artifact' }]
  },
  { item: 'Strange Tidings', set: 'Cunning Impact', effects: [{ name: 'Dexterity', modifier: 3, bonus: 'Artifact' }] },
  {
    item: 'Quori-Infused Core',
    set: 'Wild Fortitude',
    effects: [{ name: 'Constitution', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: 'The Stablestone',
    set: 'Legendary Bulwark',
    effects: [{ name: 'Maximum Hit Points', modifier: '10%', bonus: 'Legendary' }]
  },
  {
    item: "Kelas' Volatile Mixture",
    set: 'Imbued Infusion',
    effects: [{ name: 'Imbue Dice', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: 'Page Regalia: Exiled Tactica',
    set: 'Bold Tactician',
    effects: [{ name: 'Tactical DCs', modifier: 3, bonus: 'Artifact' }]
  },
  {
    item: 'Page Regalia: Unsanctioned Arcana',
    set: 'Subtle Blade',
    effects: [{ name: 'Assassinate DC', modifier: 3, bonus: 'Artifact' }]
  }
]

const createRecipe = ({ item, set, effects }: Combination): CauldronRecipe => ({
  augmentType: 'Colorless',
  baseValue: { platinum: 500 },
  binding: { type: 'Bound', to: 'Account', from: 'Acquisition' },
  craftedIn: 'Cauldron of Cadence',
  description: `Slotting this Augment in any Augment Slot will override its Set Bonus to the ${set} set.`,
  image: 'cauldronOfCadenceAugment',
  minimumLevel: 30,
  name: `Set Augment: ${set}`,
  quantity: 1,
  requirements: [
    { name: 'Thread of Fate', quantity: 50 },
    { name: 'Empty Soul Vessel', quantity: 1 },
    { name: item, quantity: 1 }
  ],
  setBonus: [{ name: set, numPiecesEquipped: 3, enhancements: effects }],
  weight: 0.01
})

const recipes = currentCombinations.map(createRecipe)

beforeEach(() => {
  vi.mocked(loadManualPayload).mockReset()
})

describe('Cauldron of Cadence recipes', () => {
  it('loads and validates the actual manifest payload', async () => {
    vi.mocked(loadManualPayload).mockResolvedValue(recipes)

    await expect(loadCauldronRecipes()).resolves.toEqual(recipes)
    expect(loadManualPayload).toHaveBeenCalledWith('cauldronOfCadence.recipes')
  })

  it('accepts an empty payload and rejects data outside the upstream contract', async () => {
    vi.mocked(loadManualPayload)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ name: 'Incomplete recipe' }])

    await expect(loadCauldronRecipes()).resolves.toEqual([])
    await expect(loadCauldronRecipes()).rejects.toBeInstanceOf(InvalidCauldronRecipesError)
  })

  it('preserves item sorting and first-enhancement effect sorting', () => {
    expect(getItemOptions(recipes, null).map(({ value }) => value)).toEqual(
      currentCombinations.map(({ item }) => item).toSorted((a, b) => a.localeCompare(b))
    )
    expect(getEffectOptions(recipes, null).map(({ value }) => value)).toEqual(
      currentCombinations.toSorted((a, b) => a.effects[0].name.localeCompare(b.effects[0].name)).map(({ set }) => set)
    )
  })

  it('preserves every current item, effect, and set association', () => {
    for (const combination of currentCombinations) {
      const byItem = findRecipeByItem(recipes, combination.item)
      const bySet = findRecipeBySetBonus(recipes, combination.set)

      expect(byItem).toBe(bySet)
      if (!byItem) throw new Error(`Missing recipe for ${combination.item}`)
      expect(getRequiredItemName(byItem)).toBe(combination.item)
      expect(byItem.setBonus[0]?.enhancements.map(formatEffect)).toEqual(combination.effects.map(formatEffect))
      expect(findSelectedRecipe(recipes, combination.item, combination.set)).toBe(byItem)
    }
  })

  it('keeps only the matching item and effect available after item selection', () => {
    for (const combination of currentCombinations) {
      const enabledItems = getItemOptions(recipes, combination.item).filter(({ disabled }) => !disabled)
      const enabledEffects = getEffectOptions(recipes, combination.item).filter(({ disabled }) => !disabled)

      expect(enabledItems.map(({ value }) => value)).toEqual([combination.item])
      expect(enabledEffects.map(({ value }) => value)).toEqual([combination.set])
    }
  })

  it('preserves the minimum-level, material, and three-piece restrictions', () => {
    for (const recipe of recipes) {
      expect(recipe.minimumLevel).toBe(30)
      expect(recipe.requirements.slice(0, 2)).toEqual([
        { name: 'Thread of Fate', quantity: 50 },
        { name: 'Empty Soul Vessel', quantity: 1 }
      ])
      expect(recipe.setBonus).toHaveLength(1)
      expect(recipe.setBonus[0]?.numPiecesEquipped).toBe(3)
    }
  })

  it('does not resolve an invalid item and effect combination', () => {
    expect(findSelectedRecipe(recipes, 'Vestments of Ravenloft', 'Arcane Barrier')).toBeUndefined()
  })
})
