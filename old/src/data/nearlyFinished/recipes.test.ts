import { describe, expect, it } from 'vitest'
import recipes from './recipes.json'

describe('nearly finished recipes', () => {
  it('uses Spell DC names for the Eclipse Itself focus choices', () => {
    const recipe = recipes.reforgingStation.find(
      (entry) => entry.item === 'The Eclipse Itself' && entry.stage === 'Finishing Touch'
    )

    expect(recipe?.choices?.map((choice) => choice.name)).toEqual([
      'Spell DC: Abjuration +2',
      'Spell DC: Conjuration +2',
      'Spell DC: Enchantment +2',
      'Spell DC: Evocation +2',
      'Spell DC: Illusion +2',
      'Spell DC: Necromancy +2',
      'Spell DC: Transmutation +2'
    ])
  })
})
