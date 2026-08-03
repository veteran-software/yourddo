import { describe, expect, it } from 'vitest'
import { getRecipeCategories, getRecipeCategory, getRecipes, getRecipeTier, nearlyCompleteRecipes } from './recipes.ts'

describe('Nearly Complete recipes', () => {
  it('preserves the complete Heroic and Legendary recipe sets', () => {
    expect(nearlyCompleteRecipes).toHaveLength(68)

    for (const tier of ['Heroic', 'Legendary'] as const) {
      expect(getRecipeCategories(tier)).toEqual([
        'Ability Score',
        'Healing Amplification',
        'Insightful Ability Score',
        'Quality Ability Score',
        'Skill',
        'Spell Focus'
      ])
      expect(getRecipes(tier, 'Spell Focus')).toHaveLength(7)
      expect(getRecipes(tier, 'Healing Amplification')).toHaveLength(3)
      expect(getRecipes(tier, 'Skill')).toHaveLength(6)

      const abilityScores = getRecipes(tier, 'Ability Score').map(({ name }) => name)
      expect(abilityScores).toEqual(abilityScores.toSorted((a, b) => a.localeCompare(b)))
    }
  })

  it('derives the tier and category from recipe requirements and removed effects', () => {
    const heroic = nearlyCompleteRecipes.find((recipe) => recipe.name === 'Abjuration Focus +4')
    const legendary = nearlyCompleteRecipes.find((recipe) => recipe.name === 'Abjuration Focus +13')

    expect(heroic && getRecipeTier(heroic)).toBe('Heroic')
    expect(legendary && getRecipeTier(legendary)).toBe('Legendary')
    expect(heroic && getRecipeCategory(heroic)).toBe('Spell Focus')
  })

  it('preserves resulting effects and forge requirements', () => {
    const recipe = nearlyCompleteRecipes.find((entry) => entry.name === 'Strength Skills +6')

    expect(recipe?.craftedIn).toBe('Duergar Completion Forge')
    expect(recipe?.effectsAdded).toEqual([
      { name: 'Skill: Jump', modifier: '6', bonus: 'Exceptional' },
      { name: 'Skill: Swim', modifier: '6', bonus: 'Exceptional' }
    ])
    expect(recipe?.requirements[1]).toMatchObject({ name: 'Abyssal Gem', quantity: 25 })
  })
})
