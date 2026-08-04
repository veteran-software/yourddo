import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDataset, loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  InvalidIncrediblePotentialDataError,
  joinRingSets,
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
  enchantments: [{ name: 'Wisdom', modifier: '6', bonus: 'Enhancement' }, { name: 'Incredible Potential' }]
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
  it('loads each published contract and joins a ring to its exact item set', async () => {
    vi.mocked(loadDataset).mockImplementation((domain) =>
      Promise.resolve(
        domain === 'incredible-potential'
          ? [ring]
          : { 'Exorcist of the Silver Flame': [{ name: "Amara's Band", minLevel: 18 }] }
      )
    )
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === 'altarOfSubjugation.recipes' ? [recipe] : [{ name: 'Medium Devil Scales' }])
    )

    await expect(loadIncrediblePotentialData()).resolves.toEqual({
      rings: [{ ...ring, setName: 'Exorcist of the Silver Flame' }],
      recipes: [recipe],
      ingredients: [{ name: 'Medium Devil Scales', foundIn: [] }]
    })
    expect(loadDataset).toHaveBeenCalledWith('incredible-potential')
    expect(loadDataset).toHaveBeenCalledWith('item-sets')
    expect(loadManualPayload).toHaveBeenCalledWith('altarOfSubjugation.recipes')
    expect(loadManualPayload).toHaveBeenCalledWith('ingredients')
  })

  it('requires exactly one item-set match for every ring', () => {
    expect(() => joinRingSets([ring], {})).toThrow('Expected one item-set match')
    expect(() =>
      joinRingSets([ring], {
        'First set': [{ name: ring.name, minLevel: 18 }],
        'Second set': [{ name: ring.name, minLevel: 18 }]
      })
    ).toThrow('found 2')
  })

  it.each([
    ['ring dataset', 'incredible-potential'],
    ['item-set dataset', 'item-sets']
  ])('reports a missing %s from the shared loader', async (_, missingDomain) => {
    vi.mocked(loadDataset).mockImplementation((domain) => {
      if (domain === missingDomain) return Promise.reject(new Error(`Unknown dataset domain: ${domain}`))
      return Promise.resolve(
        domain === 'incredible-potential'
          ? [ring]
          : { 'Exorcist of the Silver Flame': [{ name: ring.name, minLevel: 18 }] }
      )
    })
    vi.mocked(loadManualPayload).mockImplementation((name) =>
      Promise.resolve(name === 'altarOfSubjugation.recipes' ? [recipe] : [{ name: 'Medium Devil Scales' }])
    )

    await expect(loadIncrediblePotentialData()).rejects.toThrow(`Unknown dataset domain: ${missingDomain}`)
  })

  it.each([
    ['recipe payload', 'altarOfSubjugation.recipes'],
    ['ingredient payload', 'ingredients']
  ])('reports a missing %s from the shared loader', async (_, missingPayload) => {
    vi.mocked(loadDataset).mockImplementation((domain) =>
      Promise.resolve(
        domain === 'incredible-potential'
          ? [ring]
          : { 'Exorcist of the Silver Flame': [{ name: ring.name, minLevel: 18 }] }
      )
    )
    vi.mocked(loadManualPayload).mockImplementation((name) => {
      if (name === missingPayload) return Promise.reject(new Error(`Unknown manual payload: ${name}`))
      return Promise.resolve(name === 'altarOfSubjugation.recipes' ? [recipe] : [{ name: 'Medium Devil Scales' }])
    })

    await expect(loadIncrediblePotentialData()).rejects.toThrow(`Unknown manual payload: ${missingPayload}`)
  })

  it('rejects malformed and unexpectedly duplicated source records', () => {
    expect(() => parseRings([{ ...ring, minLevel: 18 }])).toThrow(InvalidIncrediblePotentialDataError)
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
