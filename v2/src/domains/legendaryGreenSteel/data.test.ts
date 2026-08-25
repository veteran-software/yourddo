import { describe, expect, it, vi } from 'vitest'
import { lgsDatasetDomain, loadLgsData, parseLgsData } from './data.ts'
import { groupLgsBaseItems } from './logic.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDataset: vi.fn() }))

const requirement = { name: 'Raw Material', quantity: 1 }
const base = (name: string, ingredientType: string) => ({
  name,
  ingredientType,
  image: 'image',
  craftedIn: 'Altar',
  quantity: 1,
  requirements: [requirement]
})
const tier = (
  name: string,
  tierNumber: number,
  itemType: string,
  effectsAdded: { name: string; modifier?: number | string; bonus?: string }[] = [{ name: 'Effect' }]
) => ({
  name,
  title: name,
  augmentType: `Tier ${String(tierNumber)}`,
  minimumLevel: 26,
  craftedIn: 'Altar',
  quantity: 1,
  requirements: [requirement],
  effectsAdded,
  tier: tierNumber,
  itemType,
  primaryFocus: 'Air',
  essence: 'Ethereal',
  gem: 'Dominion'
})
const fill = <T>(first: T, count: number): T[] => [first, ...Array.from({ length: count - 1 }, () => first)]

const payload = () => ({
  schemaVersion: 1,
  baseItems: [
    ...fill(base('Legendary Green Steel Sword', 'Legendary Green Steel Weapon'), 40),
    ...fill(base('Legendary Green Steel Belt', 'Legendary Green Steel Accessory'), 8)
  ],
  tier1: fill(
    tier('Tier 1 Weapon Augment (Air Ethereal Dominion)', 1, 'Weapon', [
      { name: 'Electric Spell Power', modifier: 139, bonus: 'Equipment' },
      { name: 'Good-aligned Weapon' }
    ]),
    72
  ),
  tier2: fill(
    tier('Tier 2 Equipment Augment (Air Ethereal Dominion)', 2, 'Equipment', [
      { name: 'Electric Spell Critical Damage', modifier: '10%', bonus: 'Insight' }
    ]),
    72
  ),
  tier3: fill(
    {
      ...tier('Tier 3 Weapon Augment (Water Air Ethereal Dominion)', 3, 'Weapon', [{ name: 'Good-aligned Weapon' }]),
      primaryFocus: 'Water',
      secondaryFocus: 'Air'
    },
    252
  ),
  activeAugments: [
    {
      name: 'Legendary Green Steel Augment: Animal Growth',
      displayName: 'Animal Growth',
      image: 'image',
      minimumLevel: 26,
      augmentType: 'Active',
      description: 'Animal spell.',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [requirement]
    },
    {
      name: 'Legendary Green Steel Augment: Cometfall',
      displayName: 'Cometfall',
      type: 'Damage',
      image: 'image',
      minimumLevel: 26,
      augmentType: 'Active',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [requirement]
    },
    ...fill(
      {
        name: 'Legendary Green Steel Augment: Other',
        displayName: 'Other',
        minimumLevel: 26,
        augmentType: 'Active',
        description: 'Other spell.',
        craftedIn: 'Altar',
        quantity: 1,
        requirements: [requirement]
      },
      37
    )
  ],
  bonusEffects: fill(
    { name: 'Bonus', description: 'Description', lowerFoci: ['Air', 'Water'], tier3Foci: ['Water', 'Air'] },
    21
  ),
  craftingComponents: fill(
    { name: 'Intermediate', craftedIn: 'Altar', quantity: 1, requirements: [requirement], type: 'Crafted' },
    33
  ),
  specialRecipes: [{ name: "Immortal's Heart", quantity: 1, requirements: [{ name: 'Codex Runes', quantity: 2500 }] }]
})

describe('Legendary Green Steel data', () => {
  it('guards production payload schema and collection counts', () => {
    const data = parseLgsData(payload())
    expect(data.schemaVersion).toBe(1)
    expect(data.baseItems).toHaveLength(48)
    expect(data.tier1).toHaveLength(72)
    expect(data.tier2).toHaveLength(72)
    expect(data.tier3).toHaveLength(252)
    expect(data.activeAugments).toHaveLength(39)
    expect(data.bonusEffects).toHaveLength(21)
    expect(data.craftingComponents).toHaveLength(33)
    expect(data.specialRecipes).toHaveLength(1)
    expect(groupLgsBaseItems(data.baseItems).map(({ label, items }) => [label, items.length])).toEqual([
      ['Weapons', 40],
      ['Accessories', 8]
    ])
  })

  it('accepts optional production fields without coercion', () => {
    const data = parseLgsData(payload())
    expect(data.tier1[0].effectsAdded[0]).toMatchObject({ modifier: 139, bonus: 'Equipment' })
    expect(data.tier1[0].effectsAdded[1]).toEqual({ name: 'Good-aligned Weapon' })
    expect(data.tier2[0].effectsAdded[0]).toMatchObject({ modifier: '10%', bonus: 'Insight' })
    expect(data.tier3[0]).toMatchObject({
      primaryFocus: 'Water',
      secondaryFocus: 'Air',
      essence: 'Ethereal',
      gem: 'Dominion'
    })
    expect(data.tier3[0].image).toBeUndefined()
    expect(data.activeAugments[0]).toMatchObject({
      name: 'Legendary Green Steel Augment: Animal Growth',
      description: 'Animal spell.'
    })
    expect(data.activeAugments[0].type).toBeUndefined()
    expect(data.activeAugments[1]).toMatchObject({ name: 'Legendary Green Steel Augment: Cometfall', type: 'Damage' })
    expect(data.activeAugments[1].description).toBeUndefined()
    expect(data.specialRecipes).toMatchObject([
      { name: "Immortal's Heart", quantity: 1, requirements: [{ name: 'Codex Runes', quantity: 2500 }] }
    ])
  })

  it('reports validation paths without including payload data', () => {
    const invalidPayload = payload()
    const invalidAugment = invalidPayload.activeAugments[1] as Record<string, unknown>
    invalidAugment.description = 42

    expect(() => parseLgsData(invalidPayload)).toThrow(
      'activeAugments[1].description: expected string, received number'
    )
  })

  it('loads the generated dataset by its production domain', async () => {
    const { loadDataset } = await import('../../shared/data/loadDataset.ts')
    vi.mocked(loadDataset).mockResolvedValueOnce(payload())
    await expect(loadLgsData()).resolves.toMatchObject({ schemaVersion: 1 })
    expect(loadDataset).toHaveBeenCalledWith(lgsDatasetDomain)
  })
})
