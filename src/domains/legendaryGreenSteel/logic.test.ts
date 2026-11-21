import type { LgsPlan } from './legendaryGreenSteel.types.ts'
import { describe, expect, it } from 'vitest'
import { parseLgsResources } from './data.ts'
import { devices, files } from './lgsTestData.ts'
import {
  emptyLgsPlan,
  expandLgsRequirements,
  fitsSlot,
  getLgsOptions,
  weaponBonusResult,
  groupLgsBaseItems,
  reconcileLgsPlan
} from './logic.ts'

const data = parseLgsResources(files, devices)
describe('LGS plans', () => {
  it('matches published slots and preserves tiers when a bonus is chosen for reference', () => {
    const [weapon, accessory] = data.baseItems
    expect(groupLgsBaseItems(data.baseItems).map((g) => g.items[0].name)).toEqual([weapon.name, accessory.name])
    const weaponTier = data.tier1.find((tier) => tier.name === 'Tier 1 Weapon')
    if (!weaponTier) throw new Error('Missing weapon fixture')
    expect(fitsSlot(accessory, weaponTier)).toBe(false)
    expect(fitsSlot(weapon, weaponTier)).toBe(true)
    const plan = {
      ...emptyLgsPlan(),
      baseItemName: weapon.name,
      tier1Name: weaponTier.name,
      tier3Name: data.tier3[0].name,
      activeAugmentName: data.activeAugments[0].name,
      bonusEffectName: data.bonusEffects[0].name
    }
    expect(reconcileLgsPlan(data, plan)).toEqual(plan)
    expect(reconcileLgsPlan(data, { ...plan, baseItemName: accessory.name })).toMatchObject({
      tier1Name: null,
      tier3Name: null,
      activeAugmentName: plan.activeAugmentName
    })
  })
  it('filters both ways, distinguishes repeated focuses and reports explicit no-effect results', () => {
    const catalog = parseLgsResources(
      { ...files, tier2: [...files.tier2, { ...files.tier2[0], id: 232, name: 'Fire', focus: 'Fire' }] },
      devices,
      {
        orderWithinPairs: 'any',
        explicitNoEffect: [{ tier1And2: ['Fire', 'Air'], tier3: ['Fire', 'Air'] }]
      }
    )
    const plan = {
      ...emptyLgsPlan(),
      baseItemName: 'Weapon Base',
      tier1Name: 'Tier 1 Weapon',
      tier3Name: 'Tier 3 Weapon Air Fire'
    }
    const options = (p: LgsPlan) => getLgsOptions(catalog, p, catalog.baseItems[0])
    expect(options(plan).bonuses.map((b) => b.name)).toEqual(['Air Fire Bonus'])
    expect(options({ ...plan, bonusEffectName: 'Air Fire Bonus' }).tier2.map((t) => t.name)).toEqual(['Tier 2 Weapon'])
    const matched = { ...plan, tier2Name: 'Tier 2 Weapon' }
    expect(weaponBonusResult(catalog, matched)).toContain('Air Fire Bonus')
    const excluded = { ...plan, tier2Name: 'Fire' }
    expect(options(excluded).bonuses).toHaveLength(0)
    expect(weaponBonusResult(catalog, excluded)).toContain('lists no weapon bonus')
    expect(weaponBonusResult({ ...catalog, explicitNoEffect: [] }, excluded)).toContain(
      'No published weapon bonus matches'
    )
    expect(weaponBonusResult(catalog, { ...matched, baseItemName: 'Accessory Base' })).toBeUndefined()
  })
  it('clears cleansing when switching to a base without a taint slot', () => {
    const plan = { ...emptyLgsPlan(), useImmortalsHeart: true as const }
    expect(reconcileLgsPlan(data, { ...plan, baseItemName: 'Accessory Base' }).useImmortalsHeart).toBe(true)
    expect(reconcileLgsPlan(data, { ...plan, baseItemName: 'Weapon Base' }).useImmortalsHeart).toBeUndefined()
  })
  it('aggregates recursive requirements by ingredient ID across selected stages', () => {
    const plan = expandLgsRequirements([data.tier1[0], data.tier1[1], data.tier3[0]], data.craftingComponents)
    expect(plan.rawMaterials).toEqual([
      { id: 23, name: 'Component Raw', quantity: 6 },
      { id: 25, name: 'Tier 3 Raw', quantity: 9 }
    ])
    expect(plan.craftedMaterials).toEqual([
      { id: 32, name: 'Tier 3 Component', quantity: 3 },
      { id: 31, name: 'Weapon Component', quantity: 3 }
    ])
  })
})
