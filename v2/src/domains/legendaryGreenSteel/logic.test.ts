import { describe, expect, it } from 'vitest'
import type { LgsData, LgsPlan, LgsTierAugment } from './legendaryGreenSteel.types.ts'
import {
  applyLgsSelection,
  emptyLgsPlan,
  expandLgsRequirements,
  formatLgsEffect,
  getCompatibleBonusEffects,
  getCompatibleTier1,
  getCompatibleTier2,
  getCompatibleTier3,
  groupLgsBaseItems,
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

const tier1Fire = tier('Tier 1 Weapon Fire', 1, 'Weapon', 'Fire')
const tier1Air = tier('Tier 1 Weapon Air', 1, 'Weapon', 'Air')
const tier1Water = tier('Tier 1 Weapon Water', 1, 'Weapon', 'Water')
const tier1EquipmentFire = tier('Tier 1 Equipment Fire', 1, 'Equipment', 'Fire')
const tier2Fire = tier('Tier 2 Weapon Fire', 2, 'Weapon', 'Fire')
const tier2Negative = tier('Tier 2 Weapon Negative Energy', 2, 'Weapon', 'Negative Energy')
const tier2Air = tier('Tier 2 Weapon Air', 2, 'Weapon', 'Air')
const tier2Water = tier('Tier 2 Weapon Water', 2, 'Weapon', 'Water')
const tier2EquipmentNegative = tier('Tier 2 Equipment Negative Energy', 2, 'Equipment', 'Negative Energy')
const waterAir = tier('Tier 3 Weapon Augment (Water Air Ethereal Dominion)', 3, 'Weapon', 'Water', 'Air')
const airWater = tier('Tier 3 Weapon Augment (Air Water Ethereal Dominion)', 3, 'Weapon', 'Air', 'Water')
const fireNegative = tier('Tier 3 Weapon Fire Negative', 3, 'Weapon', 'Fire', 'Negative Energy')
const airAir = tier('Tier 3 Weapon Air Air', 3, 'Weapon', 'Air', 'Air')
const equipmentFire = tier('Tier 3 Equipment Fire', 3, 'Equipment', 'Fire')

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
      name: 'Second Weapon Base',
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
  tier1: [tier1Fire, tier1Air, tier1Water, tier1EquipmentFire],
  tier2: [tier2Fire, tier2Negative, tier2Air, tier2Water, tier2EquipmentNegative],
  tier3: [waterAir, airWater, fireNegative, airAir, equipmentFire],
  activeAugments: [
    {
      name: 'Active Augment',
      displayName: 'Active Augment',
      augmentType: 'Active',
      minimumLevel: 26,
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [requirement],
      source: {}
    }
  ],
  bonusEffects: [
    {
      name: 'Legendary Ash',
      description: 'Ash',
      lowerFoci: ['Fire', 'Negative Energy'],
      tier3Foci: ['Fire', 'Negative Energy'],
      source: {}
    },
    {
      name: 'Air Water Bonus',
      description: 'Air and water',
      lowerFoci: ['Air', 'Water'],
      tier3Foci: ['Air', 'Water'],
      source: {}
    },
    {
      name: 'Air Air Bonus',
      description: 'Air twice',
      lowerFoci: ['Air', 'Air'],
      tier3Foci: ['Air', 'Air'],
      source: {}
    }
  ],
  craftingComponents: [],
  specialRecipes: []
}

const plan = (changes: Partial<LgsPlan> = {}): LgsPlan => ({
  ...emptyLgsPlan(),
  baseItemName: 'Weapon Base',
  ...changes
})
const names = (values: readonly { name: string }[]) => values.map(({ name }) => name)

describe('Legendary Green Steel compatibility', () => {
  it('uses base item type as the sole tier type anchor', () => {
    expect(groupLgsBaseItems(data.baseItems).map(({ label, items }) => [label, items.length])).toEqual([
      ['Weapons', 2],
      ['Accessories', 1]
    ])
    expect(names(getCompatibleTier1(data, plan()))).toEqual(names([tier1Air, tier1Fire, tier1Water]))
    expect(names(getCompatibleTier1(data, plan({ baseItemName: 'Accessory Base' })))).toEqual([tier1EquipmentFire.name])
    expect(getCompatibleTier1(data, emptyLgsPlan())).toEqual([])
  })

  it('derives compatible bonuses from every partial build without constraining no-bonus tiers', () => {
    expect(names(getCompatibleBonusEffects(data, plan()))).toEqual([
      'Air Air Bonus',
      'Air Water Bonus',
      'Legendary Ash'
    ])
    expect(names(getCompatibleBonusEffects(data, plan({ tier1Name: tier1Fire.name })))).toEqual(['Legendary Ash'])
    expect(
      names(getCompatibleBonusEffects(data, plan({ tier1Name: tier1Fire.name, tier2Name: tier2Negative.name })))
    ).toEqual(['Legendary Ash'])
    expect(names(getCompatibleBonusEffects(data, plan({ tier3Name: waterAir.name })))).toEqual(['Air Water Bonus'])
    expect(
      names(
        getCompatibleBonusEffects(
          data,
          plan({ tier1Name: tier1Air.name, tier2Name: tier2Water.name, tier3Name: waterAir.name })
        )
      )
    ).toEqual(['Air Water Bonus'])
    expect(names(getCompatibleTier2(data, plan({ tier1Name: tier1Fire.name })))).toEqual(
      names([tier2Air, tier2Fire, tier2Negative, tier2Water])
    )
    expect(names(getCompatibleTier3(data, plan({ tier1Name: tier1Fire.name, tier2Name: tier2Air.name })))).toEqual(
      names([airAir, airWater, waterAir, fireNegative])
    )
  })

  it('works from tier 3 first, then constrains lower tiers only after bonus selection', () => {
    let current = applyLgsSelection(data, plan(), 'tier3Name', waterAir.name)
    expect(names(getCompatibleTier1(data, current))).toEqual(names([tier1Air, tier1Fire, tier1Water]))
    expect(names(getCompatibleTier2(data, current))).toEqual(names([tier2Air, tier2Fire, tier2Negative, tier2Water]))
    expect(names(getCompatibleBonusEffects(data, current))).toEqual(['Air Water Bonus'])

    current = applyLgsSelection(data, current, 'bonusEffectName', 'Air Water Bonus')
    expect(names(getCompatibleTier1(data, current))).toEqual([tier1Air.name, tier1Water.name])
    expect(names(getCompatibleTier2(data, current))).toEqual([tier2Air.name, tier2Water.name])

    current = applyLgsSelection(data, current, 'tier1Name', tier1Air.name)
    expect(names(getCompatibleTier2(data, current))).toEqual([tier2Water.name])
  })

  it('constrains either lower tier symmetrically after bonus selection', () => {
    const bonusFirst = applyLgsSelection(data, plan(), 'bonusEffectName', 'Legendary Ash')
    expect(names(getCompatibleTier1(data, bonusFirst))).toEqual([tier1Fire.name])
    expect(names(getCompatibleTier2(data, bonusFirst))).toEqual([tier2Fire.name, tier2Negative.name])
    expect(names(getCompatibleTier3(data, bonusFirst))).toEqual([fireNegative.name])

    const fromTier1 = applyLgsSelection(data, { ...bonusFirst, tier1Name: tier1Fire.name }, 'tier1Name', tier1Fire.name)
    expect(names(getCompatibleTier2(data, fromTier1))).toEqual([tier2Negative.name])
    const fromTier2 = applyLgsSelection(
      data,
      { ...bonusFirst, tier2Name: tier2Negative.name },
      'tier2Name',
      tier2Negative.name
    )
    expect(names(getCompatibleTier1(data, fromTier2))).toEqual([tier1Fire.name])
  })

  it('matches duplicate lower and tier 3 focus pairs without Set behavior', () => {
    const selectedBonus = applyLgsSelection(data, plan(), 'bonusEffectName', 'Air Air Bonus')
    let current = applyLgsSelection(data, selectedBonus, 'tier1Name', tier1Air.name)
    expect(names(getCompatibleTier2(data, current))).toEqual([tier2Air.name])
    current = applyLgsSelection(data, current, 'tier2Name', tier2Air.name)
    expect(current).toMatchObject({
      tier1Name: tier1Air.name,
      tier2Name: tier2Air.name,
      bonusEffectName: 'Air Air Bonus'
    })
    expect(names(getCompatibleTier3(data, current))).toEqual([airAir.name])
  })

  it('matches weapon tier 3 foci unordered while preserving record focus identity', () => {
    expect(names(getCompatibleBonusEffects(data, plan({ tier3Name: waterAir.name })))).toEqual(['Air Water Bonus'])
    expect(names(getCompatibleBonusEffects(data, plan({ tier3Name: airWater.name })))).toEqual(['Air Water Bonus'])
    expect(waterAir).toMatchObject({ primaryFocus: 'Water', secondaryFocus: 'Air' })
    expect(airWater).toMatchObject({ primaryFocus: 'Air', secondaryFocus: 'Water' })
  })

  it('preserves legal no-bonus builds and ingredient selection', () => {
    const noBonus = reconcileLgsPlan(
      data,
      plan({ tier1Name: tier1Fire.name, tier2Name: tier2Air.name, tier3Name: waterAir.name })
    )
    expect(noBonus).toMatchObject({
      tier1Name: tier1Fire.name,
      tier2Name: tier2Air.name,
      tier3Name: waterAir.name,
      bonusEffectName: null
    })
    expect(expandLgsRequirements([tier1Fire, tier2Air, waterAir], [])).toEqual({
      rawMaterials: [{ name: 'Raw', quantity: 3 }],
      craftedMaterials: []
    })
  })

  it('keeps newest explicit selection and clears only conflicting older selections', () => {
    const oldTiers = plan({ tier1Name: tier1Fire.name, tier2Name: tier2Air.name, activeAugmentName: 'Active Augment' })
    const bonusWins = applyLgsSelection(data, oldTiers, 'bonusEffectName', 'Legendary Ash')
    expect(bonusWins).toMatchObject({
      tier1Name: tier1Fire.name,
      tier2Name: null,
      bonusEffectName: 'Legendary Ash',
      activeAugmentName: 'Active Augment'
    })

    const tierWins = applyLgsSelection(
      data,
      plan({
        tier1Name: tier1Fire.name,
        tier2Name: tier2Negative.name,
        bonusEffectName: 'Legendary Ash',
        activeAugmentName: 'Active Augment'
      }),
      'tier1Name',
      tier1Air.name
    )
    expect(tierWins).toMatchObject({
      tier1Name: tier1Air.name,
      tier2Name: tier2Negative.name,
      bonusEffectName: null,
      activeAugmentName: 'Active Augment'
    })
  })

  it('preserves tiers for weapon-to-weapon base changes and clears only incompatible type changes', () => {
    const weaponPlan = plan({
      tier1Name: tier1Fire.name,
      tier2Name: tier2Negative.name,
      tier3Name: fireNegative.name,
      activeAugmentName: 'Active Augment'
    })
    expect(applyLgsSelection(data, weaponPlan, 'baseItemName', 'Second Weapon Base')).toMatchObject({
      baseItemName: 'Second Weapon Base',
      tier1Name: tier1Fire.name,
      tier2Name: tier2Negative.name,
      tier3Name: fireNegative.name
    })
    expect(applyLgsSelection(data, weaponPlan, 'baseItemName', 'Accessory Base')).toMatchObject({
      baseItemName: 'Accessory Base',
      tier1Name: null,
      tier2Name: null,
      tier3Name: null,
      activeAugmentName: 'Active Augment'
    })
  })

  it('keeps established equipment tier 3 single-focus bonus behavior', () => {
    const equipmentPlan = plan({ baseItemName: 'Accessory Base', tier3Name: equipmentFire.name })
    expect(names(getCompatibleBonusEffects(data, equipmentPlan))).toEqual(['Legendary Ash'])
    expect(names(getCompatibleTier3(data, { ...equipmentPlan, bonusEffectName: 'Legendary Ash' }))).toEqual([
      equipmentFire.name
    ])
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
})
