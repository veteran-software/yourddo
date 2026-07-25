import { describe, expect, it } from 'vitest'
import { nearlyCompleteRecipes } from '../../pages/gearPlanner/nearlyComplete'

const runtimeModules = import.meta.glob('../loot/runtime/*.json', { eager: true })

describe('Nearly Complete recipes', () => {
  it('contains the complete Heroic and Legendary recipe sets', () => {
    expect(nearlyCompleteRecipes).toHaveLength(68)

    const groups = new Map<string, number>()
    for (const recipe of nearlyCompleteRecipes) {
      const tier = recipe.requirements?.[0]?.name.startsWith('Legendary ') ? 'Legendary' : 'Heroic'
      const placeholder = recipe.effectsRemoved[0].name
      const key = `${tier}|${placeholder}`
      groups.set(key, (groups.get(key) ?? 0) + 1)
      expect(recipe.craftedIn).toBe('Duergar Completion Forge')
      expect(recipe.requirements?.[1]).toMatchObject({ name: 'Abyssal Gem', quantity: 25 })
      expect(recipe.effectsAdded.length).toBeGreaterThan(0)
    }

    for (const tier of ['Heroic', 'Legendary']) {
      expect(groups.get(`${tier}|Nearly Complete: Spell Focus`)).toBe(7)
      expect(groups.get(`${tier}|Nearly Complete: Healing Amplification`)).toBe(3)
      for (const category of ['Skill', 'Ability Score', 'Insightful Ability Score', 'Quality Ability Score']) {
        expect(groups.get(`${tier}|Nearly Complete: ${category}`)).toBe(6)
      }
    }
  })

  it('stores canonical planner effects, including expanded skill groups', () => {
    expect(nearlyCompleteRecipes.find((recipe) => recipe.name === 'Abjuration Focus +4')?.effectsAdded).toEqual([
      { name: 'Spell DC: Abjuration', modifier: '4', bonus: 'Equipment' }
    ])
    expect(
      nearlyCompleteRecipes.find((recipe) => recipe.name === 'Repair Healing Amplification +24')?.effectsAdded
    ).toEqual([{ name: 'Repair Amplification', modifier: '24', bonus: 'Enhancement' }])
    expect(nearlyCompleteRecipes.find((recipe) => recipe.name === 'Strength Skills +6')?.effectsAdded).toEqual([
      { name: 'Skill: Jump', modifier: '6', bonus: 'Exceptional' },
      { name: 'Skill: Swim', modifier: '6', bonus: 'Exceptional' }
    ])
  })

  it('provides choices for every current Nearly Complete runtime item', () => {
    let eligibleItems = 0

    for (const module of Object.values(runtimeModules)) {
      const items = (module as { default?: { minLevel: string | number; enchantments?: { name: string }[] }[] }).default
      if (!Array.isArray(items)) continue

      for (const item of items) {
        const placeholder = item.enchantments?.find((effect) => effect.name.startsWith('Nearly Complete:'))?.name
        if (!placeholder) continue

        eligibleItems += 1
        const tier = Number(item.minLevel) >= 30 ? 'Legendary' : 'Heroic'
        const requirementName = `${tier} Item with ${placeholder}`
        expect(
          nearlyCompleteRecipes.some(
            (recipe) =>
              recipe.effectsRemoved.some((effect) => effect.name === placeholder) &&
              recipe.requirements?.some((requirement) => requirement.name === requirementName)
          )
        ).toBe(true)
      }
    }

    expect(eligibleItems).toBe(138)
  })
})
