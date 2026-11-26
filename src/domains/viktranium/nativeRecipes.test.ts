import { expect, it } from 'vitest'
import { buildViktraniumRecipes } from './nativeRecipes'

const devices = { heroic: { id: 10, name: 'Heroic Viktranium Experiment Crafting' } }
const recipe = {
  id: 11,
  device: 'heroic',
  quantity: 1,
  outputItemId: 12,
  ingredients: [{ ingredientId: 13, quantity: 10 }],
  knownDiscrepancies: [{ stated: 'Dreadful Flames', resolved: 'Dolorous Flames' }]
}
const part = {
  id: 13,
  name: 'Bleak Alternator',
  iconId: 21,
  sources: [
    { name: 'Chest', availability: 'unverified' },
    { name: 'Saga', availability: 'configured' }
  ]
}

it('joins recipes by output ID, with station, ingredient sources and known recipe discrepancies', () => {
  const { ingredients, byOutputId } = buildViktraniumRecipes(devices, [recipe], [part])
  expect(byOutputId.get(12)).toEqual([
    {
      id: 'recipe-11',
      device: devices.heroic.name,
      deviceId: '10',
      status: 'complete',
      notes: ['The recipe lists Dreadful Flames and produces Dolorous Flames.'],
      requirements: [{ ingredientId: 'ingredient-13', name: part.name, quantity: 10 }]
    }
  ])
  expect(ingredients[0]).toMatchObject({
    art: { domain: 'viktranium', layers: [21] },
    foundIn: ['Chest (unverified)', 'Saga']
  })
})
it('reports an unresolved ingredient and rejects incomplete or ambiguous costs', () => {
  expect(() => buildViktraniumRecipes(devices, [recipe], [])).toThrow('Missing Viktranium ingredient 13')
  expect(() => buildViktraniumRecipes(devices, [recipe, recipe], [part])).toThrow('Unexpected Viktranium recipe output')
  expect(() =>
    buildViktraniumRecipes(devices, [{ ...recipe, ingredients: [{ ingredientId: 13, quantity: 0 }] }], [part])
  ).toThrow('Invalid recipe quantity')
})
