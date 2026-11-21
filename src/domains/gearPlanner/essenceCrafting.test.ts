import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from '../essenceCrafting/data.ts'
import type { EssenceAffixPosition, EssenceEnhancement } from '../essenceCrafting/essenceCrafting.types.ts'
import { createEssenceCraftingTestPayload } from '../essenceCrafting/test-fixture.ts'
import { aggregateEffectSummary, collectEquippedEffects, conflictEligibleEffectSources } from './effects.ts'
import {
  createGearPlannerEssenceCraftingConfiguration,
  getEssenceCraftedGearPlannerItems,
  getGearPlannerEssenceCraftingLevel,
  getGearPlannerEssenceEnhancementChoices,
  hasGearPlannerEssenceExtraSlot,
  isGearPlannerEssenceAffixValid,
  resolveEssenceCraftedGearPlannerItem,
  resolveGearPlannerEssenceAffixes
} from './essenceCrafting.ts'
import { type GearPlannerCurse, type GearPlannerItem, gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerEquipment,
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItem,
  equipGearPlannerItemInSelection,
  filterGearPlannerCandidates,
  prepareGearPlannerCandidates,
  setGearPlannerEssenceCraftingConfiguration
} from './planner.ts'
import {
  addGearPlannerSetup,
  clearGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  selectGearPlannerSetup,
  setGearPlannerSetupEssenceCraftingConfiguration
} from './setups.ts'

const data = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const fullRangeData = () => {
  const parsed = data()
  return { ...parsed, rules: { ...parsed.rules, supportedItemLevels: { minimum: 1, maximum: 36 } } }
}

const crafted = (slot: GearPlannerItem['slot'], minimumLevel = 1) => {
  const item = getEssenceCraftedGearPlannerItems(slot, minimumLevel)[0]
  if (!item) throw new Error(`Expected Essence Crafted ${slot}`)
  return item
}

const craftedForCategory = (slot: GearPlannerItem['slot'], itemCategoryId: string) => {
  const item = getEssenceCraftedGearPlannerItems(slot, 1).find(
    (candidate) => candidate.essenceCrafting?.itemCategoryId === itemCategoryId
  )
  if (!item) throw new Error(`Expected Essence Crafted ${itemCategoryId}`)
  return item
}

const masterworks = (name: 'Curse of Minor Masterworks' | 'Curse of Major Masterworks'): GearPlannerCurse => ({
  id: name,
  name,
  type: 'Common',
  enchantments: [],
  source: {}
})

const placementData = () => {
  const current = fullRangeData()
  const categories = ['head', 'gloves', 'ring', 'armor', 'weapon', 'shield', 'orb', 'rune-arm']
  const enhancements = categories.map((itemCategoryId): EssenceEnhancement => ({
    ...current.enhancements[0],
    id: `${itemCategoryId}-prefix`,
    displayName: `${itemCategoryId} prefix`,
    placements: [{ position: 'prefix', itemCategoryIds: [itemCategoryId] }],
    effects: [{ id: `${itemCategoryId}-effect`, displayName: `${itemCategoryId} effect` }]
  }))
  const enhancementsByCategory = new Map<string, readonly EssenceEnhancement[]>()
  enhancements.forEach((enhancement, index) => {
    enhancementsByCategory.set(categories[index], [enhancement])
  })
  return {
    ...current,
    indexes: {
      ...current.indexes,
      enhancementById: new Map(enhancements.map((enhancement) => [enhancement.id, enhancement])),
      enhancementsByPlacement: new Map<EssenceAffixPosition, ReadonlyMap<string, readonly EssenceEnhancement[]>>([
        ['prefix', enhancementsByCategory]
      ])
    }
  }
}

describe('Gear Planner Essence Crafted candidates', () => {
  it('creates legacy categories for normal slots and none for Quiver', () => {
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.head, 10).map(({ source }) => source.name)).toEqual([
      'Essence Crafted Helmet'
    ])
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.firstFinger, 10)[0]?.source.name).toBe(
      'Essence Crafted Ring'
    )
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.secondFinger, 10)[0]?.source.name).toBe(
      'Essence Crafted Ring'
    )
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.armor, 10)[0]?.source.name).toBe('Essence Crafted Armor')
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.mainHand, 10).map(({ source }) => source.name)).toEqual([
      'Essence Crafted Weapon (Melee)',
      'Essence Crafted Weapon (Ranged)'
    ])
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.offHand, 10).map(({ source }) => source.name)).toEqual([
      'Essence Crafted Weapon (Melee)',
      'Essence Crafted Weapon (Ranged)',
      'Essence Crafted Shield',
      'Essence Crafted Rune Arm',
      'Essence Crafted Orb'
    ])
    expect(getEssenceCraftedGearPlannerItems(gearPlannerSlots.quiver, 10)).toEqual([])
  })

  it('uses stable slot-and-kind identities and reconstructs only known synthetic items', () => {
    const first = crafted(gearPlannerSlots.firstFinger)
    const repeated = crafted(gearPlannerSlots.firstFinger)
    const second = crafted(gearPlannerSlots.secondFinger)
    const main = crafted(gearPlannerSlots.mainHand)
    const off = crafted(gearPlannerSlots.offHand)

    expect(first.id).toBe(repeated.id)
    expect(first.id).not.toBe(second.id)
    expect(main.id).not.toBe(off.id)
    expect(resolveEssenceCraftedGearPlannerItem(first.id, gearPlannerSlots.firstFinger)?.id).toBe(first.id)
    expect(resolveEssenceCraftedGearPlannerItem(first.id, gearPlannerSlots.secondFinger)).toBeUndefined()
  })

  it('sorts synthetic candidates ahead of normal loot without changing normal ordering', () => {
    const synthetic = crafted(gearPlannerSlots.head, 10)
    const normal: GearPlannerItem = {
      id: 'normal',
      slot: gearPlannerSlots.head,
      sourceFile: 'helmet.json',
      minimumLevel: 36,
      source: { name: 'Normal Helm', minLevel: 36, type: 'Helmet' }
    }
    const filtered = filterGearPlannerCandidates(prepareGearPlannerCandidates([normal, synthetic]), {
      search: '',
      minimumLevel: 1,
      maximumLevel: 36,
      type: null,
      setName: null
    })
    expect(filtered.map(({ item }) => item.id)).toEqual([synthetic.id, normal.id])
  })
})

describe('Gear Planner Essence Crafting behavior', () => {
  it('uses normalized current-v2 categories for placement and level eligibility', () => {
    const current = data()
    const weapon = crafted(gearPlannerSlots.mainHand)
    const head = crafted(gearPlannerSlots.head)
    const ring = crafted(gearPlannerSlots.firstFinger)
    const configuration = createGearPlannerEssenceCraftingConfiguration(current, 1)

    expect(
      getGearPlannerEssenceEnhancementChoices(current, weapon, configuration, null, 'prefix').map(({ id }) => id)
    ).toContain('enhancement-split-prefix')
    expect(getGearPlannerEssenceEnhancementChoices(current, head, configuration, null, 'prefix')).toEqual([])
    expect(
      getGearPlannerEssenceEnhancementChoices(current, ring, configuration, null, 'suffix').map(({ id }) => id)
    ).toContain('enhancement-split-prefix')
    expect(
      isGearPlannerEssenceAffixValid(current, weapon, configuration, null, 'suffix', 'enhancement-level-two-suffix')
    ).toBe(false)
    expect(
      isGearPlannerEssenceAffixValid(
        current,
        weapon,
        { ...configuration, minimumLevel: 2 },
        null,
        'suffix',
        'enhancement-level-two-suffix'
      )
    ).toBe(true)
  })

  it('maps each supported synthetic category to only its matching Essence placement', () => {
    const current = placementData()
    const configuration = createGearPlannerEssenceCraftingConfiguration(current, 1)
    const cases = [
      [craftedForCategory(gearPlannerSlots.head, 'head'), 'head-prefix'],
      [craftedForCategory(gearPlannerSlots.hands, 'gloves'), 'gloves-prefix'],
      [craftedForCategory(gearPlannerSlots.firstFinger, 'ring'), 'ring-prefix'],
      [craftedForCategory(gearPlannerSlots.armor, 'armor'), 'armor-prefix'],
      [craftedForCategory(gearPlannerSlots.mainHand, 'weapon'), 'weapon-prefix'],
      [craftedForCategory(gearPlannerSlots.offHand, 'shield'), 'shield-prefix'],
      [craftedForCategory(gearPlannerSlots.offHand, 'orb'), 'orb-prefix'],
      [craftedForCategory(gearPlannerSlots.offHand, 'rune-arm'), 'rune-arm-prefix']
    ] as const

    for (const [item, expectedId] of cases) {
      expect(
        getGearPlannerEssenceEnhancementChoices(current, item, configuration, null, 'prefix').map(({ id }) => id)
      ).toEqual([expectedId])
    }
  })

  it('keeps actual item level separate from Masterworks effective level and Extra permission', () => {
    const current = fullRangeData()
    const configuration = createGearPlannerEssenceCraftingConfiguration(current, 10)
    const minor = masterworks('Curse of Minor Masterworks')
    const major = masterworks('Curse of Major Masterworks')
    const ring = crafted(gearPlannerSlots.firstFinger)

    expect(getGearPlannerEssenceCraftingLevel(current, configuration, null)).toBe(10)
    expect(getGearPlannerEssenceCraftingLevel(current, configuration, minor)).toBe(11)
    expect(getGearPlannerEssenceCraftingLevel(current, configuration, major)).toBe(12)
    expect(getGearPlannerEssenceCraftingLevel(current, { ...configuration, minimumLevel: 36 }, major)).toBe(36)
    expect(hasGearPlannerEssenceExtraSlot({ ...configuration, minimumLevel: 9 })).toBe(false)
    expect(hasGearPlannerEssenceExtraSlot(configuration)).toBe(true)
    expect(
      getGearPlannerEssenceEnhancementChoices(current, ring, { ...configuration, minimumLevel: 9 }, minor, 'extra')
    ).toEqual([])
    expect(
      getGearPlannerEssenceEnhancementChoices(current, ring, configuration, null, 'extra').map(({ id }) => id)
    ).toContain('enhancement-ring-extra')
  })

  it('resolves all current evaluator effects while stale lowered selections grant none', () => {
    const current = data()
    const weapon = crafted(gearPlannerSlots.mainHand)
    const active = {
      ...createGearPlannerEssenceCraftingConfiguration(current, 2),
      prefixId: 'enhancement-split-prefix',
      suffixId: 'enhancement-level-two-suffix'
    }
    const lowered = { ...active, minimumLevel: 1 }

    expect(
      resolveGearPlannerEssenceAffixes(current, weapon, active, null).flatMap(({ effects }) => effects)
    ).toMatchObject([
      { name: 'Light Spell Power', modifier: '+2', bonus: 'Enhancement' },
      { name: 'Spellcasting Implement', modifier: '+5%' },
      { name: 'Level Two Suffix Effect' }
    ])
    expect(
      resolveGearPlannerEssenceAffixes(current, weapon, lowered, null).map(({ enhancement }) => enhancement.id)
    ).toEqual(['enhancement-split-prefix'])

    const state = {
      ...createEmptyGearPlannerSelectionState(),
      equipment: equipGearPlannerItem(createEmptyGearPlannerEquipment(), gearPlannerSlots.mainHand, weapon),
      essenceCrafting: { [weapon.id]: active }
    }
    const loweredState = setGearPlannerEssenceCraftingConfiguration(
      state,
      weapon.id,
      { kind: 'minimum-level', minimumLevel: 1 },
      current
    )
    expect(loweredState.essenceCrafting[weapon.id]?.suffixId).toBe('enhancement-level-two-suffix')
  })

  it('re-evaluates selected effects from Masterworks and restores baseline when curse clears', () => {
    const current = data()
    const weapon = crafted(gearPlannerSlots.mainHand)
    const configuration = {
      ...createGearPlannerEssenceCraftingConfiguration(current, 1),
      prefixId: 'enhancement-split-prefix'
    }
    const resolvedModifier = (curse: GearPlannerCurse | null) =>
      resolveGearPlannerEssenceAffixes(current, weapon, configuration, curse)
        .flatMap(({ effects }) => effects)
        .find(({ name }) => name === 'Light Spell Power')?.modifier

    expect(resolvedModifier(null)).toBe('+1')
    expect(resolvedModifier(masterworks('Curse of Minor Masterworks'))).toBe('+2')
    expect(resolvedModifier(null)).toBe('+1')
  })

  it('adds selected Essence effects to summary provenance but not normal conflict sources', () => {
    const current = data()
    const weapon = crafted(gearPlannerSlots.mainHand)
    const configuration = {
      ...createGearPlannerEssenceCraftingConfiguration(current, 2),
      prefixId: 'enhancement-split-prefix'
    }
    const equipment = equipGearPlannerItem(createEmptyGearPlannerEquipment(), gearPlannerSlots.mainHand, weapon)
    const sources = collectEquippedEffects(equipment, {}, {}, {}, current, { [weapon.id]: configuration })

    expect(sources.filter(({ category }) => category === 'essence')).toMatchObject([
      {
        itemId: weapon.id,
        itemName: 'Essence Crafted Weapon (Melee)',
        slot: 'Main Hand',
        essenceEnhancementId: 'enhancement-split-prefix',
        essenceAffixPosition: 'prefix',
        effect: { name: 'Light Spell Power', modifier: '+2' }
      },
      { effect: { name: 'Spellcasting Implement', modifier: '+5%' } }
    ])
    expect(conflictEligibleEffectSources(sources)).toEqual([])
    expect(aggregateEffectSummary(sources).map(({ name }) => name)).toEqual([
      'Light Spell Power',
      'Spellcasting Implement'
    ])
  })

  it('cleans host configuration on replacement without touching another synthetic host', () => {
    const current = data()
    const head = crafted(gearPlannerSlots.head)
    const ring = crafted(gearPlannerSlots.firstFinger)
    const replacement: GearPlannerItem = {
      id: 'normal-head',
      slot: gearPlannerSlots.head,
      sourceFile: 'helmet.json',
      minimumLevel: 1,
      source: { name: 'Normal Helm', minLevel: 1, type: 'Helmet' }
    }
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.firstFinger, ring)
    state = {
      ...state,
      essenceCrafting: {
        [head.id]: createGearPlannerEssenceCraftingConfiguration(current, 1),
        [ring.id]: createGearPlannerEssenceCraftingConfiguration(current, 1)
      }
    }
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, replacement)

    expect(state.essenceCrafting[head.id]).toBeUndefined()
    expect(state.essenceCrafting[ring.id]).toBeDefined()
  })

  it('keeps Essence state setup-owned, including material, and clears only active setup state', () => {
    const current = data()
    const weapon = crafted(gearPlannerSlots.mainHand)
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.mainHand, weapon, current)
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      weapon.id,
      { kind: 'minimum-level', minimumLevel: 2 },
      current
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      weapon.id,
      { kind: 'material', material: 'Mithral' },
      current
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      weapon.id,
      { kind: 'affix', position: 'prefix', enhancementId: 'enhancement-split-prefix' },
      current
    )
    state = addGearPlannerSetup(state, 'second', 'Second')
    state = equipGearPlannerSetupItem(state, gearPlannerSlots.mainHand, weapon, current)
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      weapon.id,
      { kind: 'material', material: 'Adamantine' },
      current
    )

    expect(state.setups[0].essenceCrafting[weapon.id]).toMatchObject({ minimumLevel: 2, material: 'Mithral' })
    expect(state.setups[1].essenceCrafting[weapon.id]).toMatchObject({ minimumLevel: 1, material: 'Adamantine' })
    expect(weapon.source.material).toBe('')

    state = selectGearPlannerSetup(state, 'default')
    state = clearGearPlannerSetup(state, 'default')
    expect(state.setups[0].essenceCrafting).toEqual({})
    expect(state.setups[1].essenceCrafting[weapon.id]).toMatchObject({ minimumLevel: 1, material: 'Adamantine' })
  })
})
