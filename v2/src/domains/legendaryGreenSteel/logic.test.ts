import { describe, expect, it } from 'vitest'
import type { LgsData, LgsTierAugment } from './legendaryGreenSteel.types.ts'
import {
  compatibleTierOptions,
  emptyLgsPlan,
  expandLgsRequirements,
  formatLgsEffect,
  groupLgsBaseItems,
  isTierCompatibleWithBonus,
  reconcileLgsPlan
} from './logic.ts'

const requirement = { name: 'Raw', quantity: 1 }
const tier = (
  name: string,
  tierNumber: 1 | 2 | 3,
  itemType: 'Weapon' | 'Equipment',
  primaryFocus: string,
  secondaryFocus?: string
): LgsTierAugment => ({
  name,
  title: name,
  augmentType: 'Tier',
  minimumLevel: 26,
  craftedIn: 'Altar',
  quantity: 1,
  requirements: [requirement],
  effectsAdded: [{ name: 'Effect' }],
  tier: tierNumber,
  itemType,
  primaryFocus,
  ...(secondaryFocus ? { secondaryFocus } : {}),
  essence: 'Ethereal',
  gem: 'Dominion',
  source: {}
})
const weaponTier1 = tier('Tier 1 Weapon Air', 1, 'Weapon', 'Air')
const weaponTier2 = tier('Tier 2 Weapon Water', 2, 'Weapon', 'Water')
const weaponTier3 = tier('Tier 3 Weapon Water Air', 3, 'Weapon', 'Water', 'Air')
const reversedWeaponTier3 = tier('Tier 3 Weapon Air Water', 3, 'Weapon', 'Air', 'Water')
const equipmentTier1 = tier('Tier 1 Equipment Air', 1, 'Equipment', 'Air')
const data: LgsData = {
  schemaVersion: 1,
  baseItems: [
    {
      name: 'Weapon Base',
      ingredientType: 'Legendary Green Steel Weapon',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [requirement],
      source: {}
    },
    {
      name: 'Accessory Base',
      ingredientType: 'Legendary Green Steel Accessory',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [requirement],
      source: {}
    }
  ],
  tier1: [weaponTier1, equipmentTier1],
  tier2: [weaponTier2],
  tier3: [weaponTier3, reversedWeaponTier3],
  activeAugments: [],
  bonusEffects: [
    {
      name: 'Air and Water',
      description: 'Bonus',
      lowerFoci: ['Air', 'Water'],
      tier3Foci: ['Water', 'Air'],
      source: {}
    }
  ],
  craftingComponents: [],
  specialRecipes: []
}

describe('Legendary Green Steel logic', () => {
  it('groups base compatibility by generated ingredient type', () => {
    expect(groupLgsBaseItems(data.baseItems).map(({ label, items }) => [label, items.map(({ name }) => name)])).toEqual(
      [
        ['Weapons', ['Weapon Base']],
        ['Accessories', ['Accessory Base']]
      ]
    )
    expect(compatibleTierOptions(data.tier1, 'Legendary Green Steel Weapon', undefined)).toEqual([weaponTier1])
    expect(compatibleTierOptions(data.tier1, 'Legendary Green Steel Accessory', undefined)).toEqual([equipmentTier1])
  })

  it('matches lower foci and tier 3 dual foci without changing dual-focus identity', () => {
    const bonus = data.bonusEffects[0]
    expect(isTierCompatibleWithBonus(weaponTier1, bonus)).toBe(true)
    expect(isTierCompatibleWithBonus(weaponTier3, bonus)).toBe(true)
    expect(isTierCompatibleWithBonus(reversedWeaponTier3, bonus)).toBe(true)
    expect(weaponTier3.secondaryFocus).toBe('Air')
    expect(reversedWeaponTier3.secondaryFocus).toBe('Water')
  })

  it('clears only selections made incompatible by base or bonus changes', () => {
    const initial = {
      ...emptyLgsPlan(),
      baseItemName: 'Weapon Base',
      tier1Name: weaponTier1.name,
      tier3Name: weaponTier3.name,
      bonusEffectName: 'Air and Water'
    }
    expect(reconcileLgsPlan(data, initial)).toMatchObject({ tier1Name: weaponTier1.name, tier3Name: weaponTier3.name })
    expect(reconcileLgsPlan(data, { ...initial, baseItemName: 'Accessory Base' })).toMatchObject({
      tier1Name: null,
      tier3Name: null,
      bonusEffectName: 'Air and Water'
    })
  })

  it('formats all effects without duplicate modifiers or empty bonus text', () => {
    expect(formatLgsEffect({ name: 'Electric Spell Power', modifier: 139, bonus: 'Equipment' })).toBe(
      'Electric Spell Power +139 (Equipment)'
    )
    expect(formatLgsEffect({ name: 'Electric Resistance +50', bonus: 'Equipment' })).toBe(
      'Electric Resistance +50 (Equipment)'
    )
    expect(formatLgsEffect({ name: 'Good-aligned Weapon' })).toBe('Good-aligned Weapon')
  })

  it('expands crafted components recursively and keeps exact raw material names distinct', () => {
    const plan = expandLgsRequirements(
      [
        {
          requirements: [
            { name: 'Component A', quantity: 2 },
            { name: 'Codex Rune', quantity: 1 }
          ]
        }
      ],
      [
        {
          name: 'Component A',
          requirements: [
            { name: 'Component B', quantity: 3 },
            { name: 'Codex Runes', quantity: 4 }
          ]
        },
        { name: 'Component B', requirements: [{ name: 'Legendary Cloudy Flawless Gem of Dominion', quantity: 5 }] }
      ]
    )
    expect(plan.craftedMaterials).toEqual([
      { name: 'Component A', quantity: 2 },
      { name: 'Component B', quantity: 6 }
    ])
    expect(plan.rawMaterials).toEqual([
      { name: 'Codex Rune', quantity: 1 },
      { name: 'Codex Runes', quantity: 8 },
      { name: 'Legendary Cloudy Flawless Gem of Dominion', quantity: 30 }
    ])
  })
})
