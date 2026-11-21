import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDataset, loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  InvalidIncrediblePotentialDataError,
  loadIncrediblePotentialData,
  parseIngredients,
  parseRecipes,
  parseRings
} from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({
  loadDataset: vi.fn(),
  loadManualPayload: vi.fn()
}))

const ring = {
  pageTitle: "Amara's Band",
  name: "Amara's Band",
  type: 'Ring',
  minLevel: '18',
  enchantments: [{ name: 'Wisdom', modifier: '6', bonus: 'Enhancement' }, { name: 'Incredible Potential' }],
  setBonus: [{ name: 'Exorcist of the Silver Flame' }]
}

const normalizedRing = {
  pageTitle: ring.pageTitle,
  name: ring.name,
  type: ring.type,
  minLevel: ring.minLevel,
  enchantments: ring.enchantments,
  setName: ring.setBonus[0].name
}

const recipe = {
  recipeId: 1,
  name: 'Material Fire Dominion Ring Upgrade',
  device: 'Altar of Subjugation',
  ingredients: ['Material Fire Dominion Shard of Great Power', 'Shavarath Trophy of War'],
  removed: 'Incredible Potential',
  added: [{ name: 'Flaming Burst' }]
}

beforeEach(() => {
  vi.mocked(loadDataset).mockReset()
  vi.mocked(loadManualPayload).mockReset()
})

describe('Incredible Potential data', () => {
  it("loads each published contract and uses the ring's embedded set bonus", async () => {
    const ringSource = [structuredClone(ring)]
    const recipeSource = [structuredClone(recipe)]
    const ingredientSource = [{ name: 'Medium Devil Scales' }]
    const sourceSnapshot = structuredClone({ ringSource, recipeSource, ingredientSource })

    vi.mocked(loadDataset).mockResolvedValue(ringSource)
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === 'altarOfSubjugation.recipes' ? recipeSource : ingredientSource)
    )

    await expect(loadIncrediblePotentialData()).resolves.toEqual({
      rings: [normalizedRing],
      recipes: [recipe],
      ingredients: [{ name: 'Medium Devil Scales', foundIn: [] }]
    })
    expect(loadDataset).toHaveBeenCalledWith('incredible-potential')
    expect(loadDataset).toHaveBeenCalledTimes(1)
    expect(loadManualPayload).toHaveBeenCalledWith('altarOfSubjugation.recipes')
    expect(loadManualPayload).toHaveBeenCalledWith('ingredients')
    expect({ ringSource, recipeSource, ingredientSource }).toEqual(sourceSnapshot)
  })

  it('requires exactly one named set bonus for every ring', () => {
    expect(() => parseRings([{ ...ring, setBonus: [] }])).toThrow('Expected one set bonus')
    expect(() => parseRings([{ ...ring, setBonus: [{ name: 'First set' }, { name: 'Second set' }] }])).toThrow(
      'found 2'
    )
    expect(() => parseRings([{ ...ring, setBonus: [{ name: '   ' }] }])).toThrow('Invalid set bonus')
  })

  it('reports a missing ring dataset from the shared loader', async () => {
    vi.mocked(loadDataset).mockRejectedValue(new Error('Unknown dataset domain: incredible-potential'))
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === 'altarOfSubjugation.recipes' ? [recipe] : [{ name: 'Medium Devil Scales' }])
    )

    await expect(loadIncrediblePotentialData()).rejects.toThrow('Unknown dataset domain: incredible-potential')
  })

  it.each([
    ['recipe payload', 'altarOfSubjugation.recipes'],
    ['ingredient payload', 'ingredients']
  ])('reports a missing %s from the shared loader', async (_, missingPayload) => {
    vi.mocked(loadDataset).mockResolvedValue([ring])
    vi.mocked(loadManualPayload).mockImplementation((name) => {
      if (name === missingPayload) return Promise.reject(new Error(`Unknown manual payload: ${name}`))
      return Promise.resolve(name === 'altarOfSubjugation.recipes' ? [recipe] : [{ name: 'Medium Devil Scales' }])
    })

    await expect(loadIncrediblePotentialData()).rejects.toThrow(`Unknown manual payload: ${missingPayload}`)
  })

  it('rejects malformed and unexpectedly duplicated source records', () => {
    expect(() => parseRings([{ ...ring, minLevel: 18 }])).toThrow(InvalidIncrediblePotentialDataError)
    expect(() => parseRings([{ ...ring, setBonus: undefined }])).toThrow(InvalidIncrediblePotentialDataError)
    expect(() => parseRings([ring, ring])).toThrow('Duplicate ring name')
    expect(() => parseRings([{ ...ring, enchantments: ring.enchantments.slice(0, 1) }])).toThrow(
      'Expected one Incredible Potential placeholder'
    )
    expect(() => parseRecipes([{ ...recipe, ingredients: [{ name: 'Shard' }] }])).toThrow(
      InvalidIncrediblePotentialDataError
    )
    expect(() => parseRecipes([recipe, { ...recipe, name: 'Another upgrade' }])).toThrow(
      'Duplicate ring upgrade recipe ID'
    )
    expect(() => parseRecipes([recipe, { ...recipe, recipeId: 2 }])).toThrow('Duplicate ring upgrade recipe name')
    expect(() => parseRecipes([{ ...recipe, added: [] }])).toThrow('has no added effect')
    expect(() => parseIngredients([{ name: 'Scales', foundIn: [42] }])).toThrow(InvalidIncrediblePotentialDataError)
    expect(() => parseIngredients([{ name: 'Scales' }, { name: 'Scales' }])).toThrow('Duplicate ingredient name')
  })
})
