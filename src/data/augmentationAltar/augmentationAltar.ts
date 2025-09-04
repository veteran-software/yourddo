import type { Bonus } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'

const LEGENDARY_REQUIREMENTS: CraftingIngredient[] = [
  {
    name: 'Hydra Scales',
    quantity: 20,
    requirements: []
  },
  {
    name: 'Sealed in Mist Weapon',
    quantity: 1,
    requirements: []
  }
]

const STAT_BOOST_REQUIREMENTS: CraftingIngredient[] = [
  {
    name: 'Hydra Scale',
    quantity: 20,
    requirements: []
  },
  {
    name: 'Sealed in Gloom Accessory',
    quantity: 1,
    requirements: []
  }
]

const createLegendaryEffect = (effectName: string): CraftingIngredient => ({
  name: effectName,
  description: `Adds ${effectName} to this item, and removes any previous effects added by this altar`,
  quantity: 1,
  effectsAdded: [{ name: effectName }],
  requirements: LEGENDARY_REQUIREMENTS
})

const createStatBoost = (stat: string, modifier: number, bonus: Bonus): CraftingIngredient => ({
  name: `${modifier > 0 ? '+' : ''}${String(modifier)} ${bonus} ${stat}`,
  description: `Adds ${modifier > 0 ? '+' : ''}${String(
    modifier
  )} ${bonus} Bonus to ${stat} to this item, and removes any previous effects added by this altar`,
  quantity: 1,
  effectsAdded: [
    {
      name: `${stat} ${modifier > 0 ? '+' : ''}${String(modifier)}`,
      modifier,
      bonus
    }
  ],
  requirements: STAT_BOOST_REQUIREMENTS
})

const STATS: string[] = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
const LEGENDARY_EFFECTS: string[] = ['Dust', 'Ash', 'Vacuum', 'Ooze', 'Salt', 'Affirmation']

export const augmentationAltar: CraftingIngredient[] = [
  ...LEGENDARY_EFFECTS.map((effect) => createLegendaryEffect(`Legendary ${effect}`)),
  ...STATS.map((stat) => createStatBoost(stat, 15, 'Enhancement')),
  ...STATS.map((stat) => createStatBoost(stat, 7, 'Insight')),
  ...STATS.map((stat) => createStatBoost(stat, 3, 'Quality'))
]
