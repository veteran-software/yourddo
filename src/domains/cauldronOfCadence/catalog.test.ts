import { expect, it, vi } from 'vitest'
import { buildCauldronCatalog, InvalidCauldronRecipesError, loadCauldronRecipes } from './catalog'

const manifest = {
  system: 'cauldron-of-cadence',
  devices: { cauldron: { name: 'Cauldron of Cadence' } },
  recipeRequirements: { excludeGlameredItems: true },
  resources: {
    recipes: '',
    augments: '',
    weapons: '',
    ingredients: '',
    equipmentSets: '',
    heroicEffects: '',
    legendaryEffects: ''
  }
}
const fixture: Parameters<typeof buildCauldronCatalog>[1] = {
  recipes: [
    {
      id: 1,
      category: 'setAugment',
      device: 'cauldron',
      outputItemId: 2,
      quantity: 1,
      description: 'Set augment',
      ingredients: [
        { ingredientId: 3, quantity: 1, excludeGift: true },
        { ingredientId: 4, quantity: 50 }
      ]
    }
  ],
  ingredients: [
    { id: 3, name: 'Helm', kind: 'equipment' },
    { id: 4, name: 'Thread of Fate', kind: 'material' }
  ],
  augments: [
    {
      id: 2,
      recipeId: 1,
      name: 'Test Augment',
      tier: 'legendary',
      setId: 5,
      slotTypes: ['Colorless'],
      minimumLevel: 30,
      boundOnAcquire: true,
      boundToAccount: true
    }
  ],
  equipmentSets: [{ id: 5, name: 'Test Set', thresholds: [{ pieces: 3, effectId: 6 }] }],
  legendaryEffects: [
    {
      id: 6,
      displayName: 'Test Set',
      enchantments: [
        { name: 'bypass', displayName: 'Fortification Bypass', value: 0.3, unit: 'coefficient', bonusType: 'Artifact' },
        { name: 'power', displayName: 'Melee Power', value: 0.15, unit: 'coefficient', bonusType: 'Artifact' }
      ],
      knownDiscrepancies: [{ stat: 'bypass', stated: 15, mechanical: 30, unit: 'percent' }]
    }
  ],
  heroicEffects: [],
  weapons: []
}
it('joins the named item by kind and uses actual values independently of discrepancy text', () => {
  const [augment] = buildCauldronCatalog(manifest, fixture).augments
  expect(augment.requiredItem).toBe('Helm')
  expect(augment.restrictions).toContain('gift or glamered')
  expect(augment.setBonus[0]).toMatchObject({
    enhancements: [{ modifier: '30%' }, { modifier: 15 }],
    discrepancies: ['Fortification Bypass: stated 15%, actual 30%.']
  })
  expect(() => buildCauldronCatalog(manifest, { ...fixture, equipmentSets: [] })).toThrow(InvalidCauldronRecipesError)
})
it('shows the discrepancy once when a weapon proc and its damage outcome report the same target', () => {
  const knownDiscrepancies = [{ stat: 'Effect_IncludedGenus', stated: 'Incorporeal', mechanical: 'Fey' }]
  const [weapon] = buildCauldronCatalog(manifest, {
    ...fixture,
    recipes: [{ ...fixture.recipes[0], category: 'weapon' }],
    weapons: [
      {
        id: 2,
        recipeId: 1,
        name: 'Sword',
        tier: 'legendary',
        baseLevel: 29,
        description: '',
        effectIds: [6],
        damageOutcomes: [{ effectId: 6, knownDiscrepancies }]
      }
    ],
    legendaryEffects: [{ id: 6, displayName: 'Feybane', enchantments: [], procs: [{ knownDiscrepancies }] }]
  }).weapons
  expect(weapon.discrepancies).toEqual(['Feybane · Target creature genus: stated Incorporeal, actual Fey.'])
})

it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
  'resolves every Cauldron recipe from the published release',
  async () => {
    const nativeFetch = globalThis.fetch
    vi.stubGlobal('fetch', (input: string, init?: RequestInit) =>
      nativeFetch(input.replace('/data-cdn/', 'https://cdn.yourddo.com/'), init)
    )
    try {
      const catalog = await loadCauldronRecipes()
      expect(catalog.augments.length).toBeGreaterThanOrEqual(21)
      for (const tier of ['heroic', 'legendary'])
        expect(catalog.weapons.filter((w) => w.tier === tier).length).toBeGreaterThanOrEqual(42)
      expect(
        catalog.augments.flatMap((a) => a.setBonus).find((s) => s.name === 'Truthful Blow')?.enhancements
      ).toContainEqual({ name: 'Fortification Bypass', modifier: '30%', bonus: 'Artifact' })
    } finally {
      vi.unstubAllGlobals()
    }
  }
)
