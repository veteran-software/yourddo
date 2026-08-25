import { describe, expect, it } from 'vitest'
import {
  aggregateEffectSummary,
  collectEquippedEffects,
  normalizeBonusType,
  parseEffectModifier,
  resolveEffectConflicts
} from './effects.ts'
import { type GearPlannerAugment, type GearPlannerItem, gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerEquipment,
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItem,
  equipGearPlannerItemInSelection,
  type GearPlannerCharacterSlot,
  setGearPlannerSlottedAugment
} from './planner.ts'

const item = (
  id: string,
  slot: GearPlannerCharacterSlot,
  name: string,
  enchantments: GearPlannerItem['source']['enchantments'],
  augments?: GearPlannerItem['source']['augments']
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 1,
  source: { name, enchantments, augments }
})

const equipped = (...items: readonly GearPlannerItem[]) =>
  items.reduce(
    (equipment, plannerItem) =>
      equipGearPlannerItem(equipment, plannerItem.slot as GearPlannerCharacterSlot, plannerItem),
    createEmptyGearPlannerEquipment()
  )

const augment = (
  name: string,
  augmentType: string,
  effectsAdded: GearPlannerAugment['effectsAdded']
): GearPlannerAugment => ({
  name,
  augmentType,
  minLevel: 1,
  effectsAdded,
  source: { name, augmentType, minLevel: 1, effectsAdded }
})

describe('Gear Planner equipped effect sources', () => {
  it('collects base effects with item and slot provenance and removes cleared items', () => {
    const head = item('head', gearPlannerSlots.head, 'Test Helm', [
      { name: 'Strength', modifier: '+10', bonus: 'Enhancement' },
      { name: 'Nearly Finished' }
    ])
    const ring = item('ring', gearPlannerSlots.firstFinger, 'Test Ring', [{ name: 'Resistance', modifier: '5' }])
    const selection = equipped(head, ring)

    expect(collectEquippedEffects(selection)).toMatchObject([
      { itemId: 'head', itemName: 'Test Helm', slot: 'Head', category: 'equipped-item', effect: { name: 'Strength' } },
      { itemId: 'ring', itemName: 'Test Ring', slot: 'First Finger', effect: { name: 'Resistance' } }
    ])
    expect(collectEquippedEffects(selection)).toHaveLength(2)
    expect(collectEquippedEffects(equipGearPlannerItem(selection, gearPlannerSlots.head, null))).toHaveLength(1)
  })
})

describe('legacy effect normalization and parsing', () => {
  it('normalizes named, absent, empty, and numeric bonus values', () => {
    expect(normalizeBonusType('Enhancement')).toBe('enhancement')
    expect(normalizeBonusType(undefined)).toBe('no type')
    expect(normalizeBonusType('')).toBe('no type')
    expect(normalizeBonusType(123)).toBe('no type')
    expect(normalizeBonusType('123')).toBe('no type')
  })

  it('preserves legacy modifier comparison parsing', () => {
    expect(parseEffectModifier(12)).toBe(12)
    expect(parseEffectModifier('12')).toBe(12)
    expect(parseEffectModifier('+14%')).toBe(14)
    expect(parseEffectModifier('2[W]')).toBe(2)
    expect(parseEffectModifier('4d10')).toBe(4)
    expect(parseEffectModifier(undefined)).toBe(0)
    expect(parseEffectModifier('Active')).toBe(0)
  })
})

describe('legacy effect summary and conflicts', () => {
  it('keeps highest same-name typed bonus effective and marks lower source conflicting', () => {
    const sources = collectEquippedEffects(
      equipped(
        item('head', gearPlannerSlots.head, 'Ten Helm', [{ name: 'Strength', modifier: '+10', bonus: 'Enhancement' }]),
        item('ring', gearPlannerSlots.firstFinger, 'Twelve Ring', [
          { name: 'Strength', modifier: '+12', bonus: 'Enhancement' }
        ])
      )
    )
    const summary = aggregateEffectSummary(sources)[0]
    const conflicts = resolveEffectConflicts(sources)

    expect(summary.groups[0].effectiveValue).toBe(12)
    expect(summary.groups[0].entries.map(({ isEffective }) => isEffective)).toEqual([false, true])
    expect(conflicts.conflicts[0].entries.map(({ isEffective }) => isEffective)).toEqual([false, true])
  })

  it('keeps bonus types independent and uses legacy display aggregate total', () => {
    const summary = aggregateEffectSummary(
      collectEquippedEffects(
        equipped(
          item('head', gearPlannerSlots.head, 'Helm', [{ name: 'Strength', modifier: '+10', bonus: 'Enhancement' }]),
          item('ring', gearPlannerSlots.firstFinger, 'Ring', [{ name: 'Strength', modifier: '+5', bonus: 'Insight' }])
        )
      )
    )[0]

    expect(summary.total).toBe(15)
    expect(summary.groups.map(({ bonusType }) => bonusType)).toEqual(['enhancement', 'insight'])
  })

  it('keeps tied typed effects effective', () => {
    const sources = collectEquippedEffects(
      equipped(
        item('head', gearPlannerSlots.head, 'Helm', [{ name: 'Strength', modifier: '10', bonus: 'Enhancement' }]),
        item('ring', gearPlannerSlots.firstFinger, 'Ring', [{ name: 'Strength', modifier: '10', bonus: 'Enhancement' }])
      )
    )

    expect(resolveEffectConflicts(sources).conflicts[0].entries.every(({ isEffective }) => isEffective)).toBe(true)
  })

  it('keeps no-type entries out of conflicts while preserving their legacy summary maximum', () => {
    const sources = collectEquippedEffects(
      equipped(
        item('head', gearPlannerSlots.head, 'Helm', [{ name: 'Resistance', modifier: '3' }]),
        item('ring', gearPlannerSlots.firstFinger, 'Ring', [{ name: 'Resistance', modifier: '5', bonus: '' }])
      )
    )

    expect(aggregateEffectSummary(sources)[0].groups[0].effectiveValue).toBe(5)
    expect(resolveEffectConflicts(sources).conflicts).toEqual([])
  })

  it('keeps legacy base enhancement-bonus placeholders out of conflict resolution', () => {
    const sources = collectEquippedEffects(
      equipped(
        item('head', gearPlannerSlots.head, 'Helm', [
          { name: 'Enhancement Bonus', modifier: '3', bonus: 'Enhancement' }
        ]),
        item('ring', gearPlannerSlots.firstFinger, 'Ring', [
          { name: 'Enhancement Bonus', modifier: '5', bonus: 'Enhancement' }
        ])
      )
    )

    expect(aggregateEffectSummary(sources)[0].groups[0].effectiveValue).toBe(5)
    expect(resolveEffectConflicts(sources).conflicts).toEqual([])
  })

  it('sums Reaper and Mythic bonuses while treating both as non-conflicting', () => {
    const sources = collectEquippedEffects(
      equipped(
        item('head', gearPlannerSlots.head, 'Helm', [
          { name: 'Melee Power', modifier: '3', bonus: 'Reaper' },
          { name: 'Spell Power', modifier: '2', bonus: 'Mythic' }
        ]),
        item('ring', gearPlannerSlots.firstFinger, 'Ring', [
          { name: 'Melee Power', modifier: '4', bonus: 'Reaper' },
          { name: 'Spell Power', modifier: '5', bonus: 'Mythic' }
        ])
      )
    )
    const summary = aggregateEffectSummary(sources)

    expect(summary.find(({ name }) => name === 'Melee Power')?.groups[0].effectiveValue).toBe(7)
    expect(summary.find(({ name }) => name === 'Spell Power')?.groups[0].effectiveValue).toBe(7)
    expect(resolveEffectConflicts(sources).conflicts).toEqual([])
  })

  it('keeps percentage, dice, W notation, and name-only source display intact', () => {
    const summary = aggregateEffectSummary(
      collectEquippedEffects(
        equipped(
          item('head', gearPlannerSlots.head, 'Helm', [
            { name: 'Doublestrike', modifier: '+14%', bonus: 'Enhancement' },
            { name: 'Weapon Damage', modifier: '2[W]', bonus: 'Enhancement' },
            { name: 'Damage', modifier: '4d10', bonus: 'Enhancement' },
            { name: 'Ghostly' }
          ])
        )
      )
    )

    expect(summary.find(({ name }) => name === 'Doublestrike')?.groups[0].entries[0].effect.modifier).toBe('+14%')
    expect(summary.find(({ name }) => name === 'Weapon Damage')?.groups[0].entries[0].effect.modifier).toBe('2[W]')
    expect(summary.find(({ name }) => name === 'Damage')?.groups[0].entries[0].effect.modifier).toBe('4d10')
    expect(summary.find(({ name }) => name === 'Ghostly')?.groups[0].entries[0].effect.modifier).toBeUndefined()
  })
})

describe('Gear Planner augment effect sources', () => {
  it('adds selected augment effects with item, slot, augment, and slot-index provenance', () => {
    const ruby = augment('Ruby of Strength', 'Red', [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }])
    const head = item(
      'head',
      gearPlannerSlots.head,
      'Augment Helm',
      [{ name: 'Strength', modifier: '+10', bonus: 'Enhancement' }],
      [{ augmentType: 'Red', name: 'Ruby socket' }]
    )
    const sources = collectEquippedEffects(equipped(head), { head: { 0: ruby } })
    const augmentSource = sources.find(({ category }) => category === 'augment')

    expect(augmentSource).toMatchObject({
      id: 'head:augment:0:0',
      itemId: 'head',
      itemName: 'Augment Helm',
      slot: 'Head',
      category: 'augment',
      augmentName: 'Ruby of Strength',
      augmentSlotIndex: 0,
      augmentSlotName: 'Ruby socket'
    })
    expect(aggregateEffectSummary(sources).find(({ name }) => name === 'Strength')?.groups[0].effectiveValue).toBe(10)
    expect(resolveEffectConflicts(sources).bySourceId['head:augment:0:0']).toEqual({ isEffective: false })
  })

  it('lets stronger augment effects win without conflicting across bonus types', () => {
    const ruby = augment('Ruby of Strength', 'Red', [{ name: 'Strength', modifier: '+10%', bonus: 'Enhancement' }])
    const insight = augment('Insightful Ruby', 'Colorless', [{ name: 'Strength', modifier: '+5', bonus: 'Insight' }])
    const head = item(
      'head',
      gearPlannerSlots.head,
      'Augment Helm',
      [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }],
      [{ augmentType: 'Red' }, { augmentType: 'Colorless' }]
    )
    const sources = collectEquippedEffects(equipped(head), { head: { 0: ruby, 1: insight } })
    const summary = aggregateEffectSummary(sources).find(({ name }) => name === 'Strength')

    expect(summary?.groups.find(({ bonusType }) => bonusType === 'enhancement')?.effectiveDisplay).toBe('+10%')
    expect(summary?.groups.find(({ bonusType }) => bonusType === 'insight')?.effectiveValue).toBe(5)
    expect(resolveEffectConflicts(sources).bySourceId['head:augment:0:0']).toEqual({ isEffective: true })
    expect(resolveEffectConflicts(sources).conflicts).toHaveLength(1)
  })

  it('keeps name-only effects valid and removes augment effects on augment or item removal', () => {
    const ruby = augment('Ruby of Ghostly', 'Red', [{ name: 'Ghostly' }])
    const head = item('head', gearPlannerSlots.head, 'Augment Helm', [], [{ augmentType: 'Red' }])
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)
    state = setGearPlannerSlottedAugment(state, head.id, 0, ruby)

    expect(aggregateEffectSummary(collectEquippedEffects(state.equipment, state.slottedAugments))[0]).toMatchObject({
      name: 'Ghostly',
      isNumeric: false
    })
    state = setGearPlannerSlottedAugment(state, head.id, 0, null)
    expect(collectEquippedEffects(state.equipment, state.slottedAugments)).toEqual([])

    state = setGearPlannerSlottedAugment(state, head.id, 0, ruby)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, null)
    expect(collectEquippedEffects(state.equipment, state.slottedAugments)).toEqual([])
  })
})
