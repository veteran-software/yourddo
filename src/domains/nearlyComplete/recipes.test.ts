import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadNativeNearlyComplete } from '../gearPlanner/nativeUpgradeData'
import {
  getRecipeCategories,
  getRecipeCategory,
  getRecipes,
  getRecipeTier,
  loadNearlyCompleteRecipes,
  type NearlyCompleteRecipe
} from './recipes.ts'

vi.mock('../gearPlanner/nativeUpgradeData', () => ({ loadNativeNearlyComplete: vi.fn() }))

const recipe = (name: string, category: string, requirementName: string, effectName = name): NearlyCompleteRecipe => ({
  name,
  quantity: 1,
  craftedIn: 'Duergar Completion Forge',
  effectsAdded: [{ name: effectName, modifier: '6', bonus: 'Exceptional' }],
  effectsRemoved: [{ name: `Nearly Complete: ${category}` }],
  requirements: [
    { name: requirementName, quantity: 1, requirements: [] },
    { name: 'Abyssal Gem', quantity: 25, requirements: [] }
  ]
})

const recipes = [
  recipe('Strength +6', 'Ability Score', 'Heroic Item with Nearly Complete: Ability Score'),
  recipe('Charisma +6', 'Ability Score', 'Heroic Item with Nearly Complete: Ability Score'),
  recipe('Strength Skills +6', 'Skill', 'Heroic Item with Nearly Complete: Skill', 'Skill: Jump'),
  recipe('Abjuration Focus +13', 'Spell Focus', 'Legendary Item with Nearly Complete: Spell Focus')
]

beforeEach(() => {
  vi.mocked(loadNativeNearlyComplete).mockReset()
})

describe('Nearly Complete recipes', () => {
  it('loads recipes from the Nearly Complete CDN package', async () => {
    vi.mocked(loadNativeNearlyComplete).mockResolvedValue({ items: [], recipes })

    await expect(loadNearlyCompleteRecipes()).resolves.toEqual(recipes)
    expect(loadNativeNearlyComplete).toHaveBeenCalledOnce()
  })

  it('derives sorted categories and recipes from the loaded payload', () => {
    expect(getRecipeCategories(recipes, 'Heroic')).toEqual(['Ability Score', 'Skill'])
    expect(getRecipeCategories(recipes, 'Legendary')).toEqual(['Spell Focus'])
    expect(getRecipes(recipes, 'Heroic', 'Ability Score').map(({ name }) => name)).toEqual([
      'Charisma +6',
      'Strength +6'
    ])
  })

  it('derives the tier and category from recipe requirements and removed effects', () => {
    expect(getRecipeTier(recipes[0])).toBe('Heroic')
    expect(getRecipeTier(recipes[3])).toBe('Legendary')
    expect(getRecipeCategory(recipes[3])).toBe('Spell Focus')
  })

  it('preserves resulting effects and forge requirements', () => {
    const selected = recipes[2]

    expect(selected.craftedIn).toBe('Duergar Completion Forge')
    expect(selected.effectsAdded).toEqual([{ name: 'Skill: Jump', modifier: '6', bonus: 'Exceptional' }])
    expect(selected.requirements[1]).toMatchObject({ name: 'Abyssal Gem', quantity: 25 })
  })
})
