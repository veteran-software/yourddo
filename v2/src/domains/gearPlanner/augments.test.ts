import { describe, expect, it } from 'vitest'
import {
  collectSelectedAugmentSetMemberships,
  gearPlannerAugmentIdentity,
  getCompatibleGearPlannerAugments,
  isCompatibleGearPlannerAugment
} from './augments.ts'
import {
  type GearPlannerAugment,
  type GearPlannerAugmentSlot,
  type GearPlannerItem,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import { createEmptyGearPlannerEquipment } from './planner.ts'

const slot = (augmentType: string): GearPlannerAugmentSlot => ({ augmentType })

const augment = (name: string, augmentType: string): GearPlannerAugment => ({
  name,
  augmentType,
  minLevel: 1,
  effectsAdded: [],
  source: { name, augmentType, minLevel: 1, effectsAdded: [] }
})

describe('Gear Planner augment compatibility', () => {
  it.each([
    ['Red Slot', ['Red', 'Colorless'], ['Blue']],
    ['Blue', ['Blue', 'Colorless'], ['Red']],
    ['Yellow Slot', ['Yellow', 'Colorless'], ['Blue']],
    ['Purple', ['Purple', 'Red', 'Blue', 'Colorless'], ['Yellow']],
    ['Orange Slot', ['Orange', 'Red', 'Yellow', 'Colorless'], ['Blue']],
    ['Green', ['Green', 'Blue', 'Yellow', 'Colorless'], ['Red']]
  ])('applies legacy compatibility for %s', (augmentSlot, accepted, rejected) => {
    for (const type of accepted)
      expect(isCompatibleGearPlannerAugment(slot(augmentSlot), augment(type, type))).toBe(true)
    for (const type of rejected)
      expect(isCompatibleGearPlannerAugment(slot(augmentSlot), augment(type, type))).toBe(false)
  })

  it('uses normalized exact matches for special and unknown slots', () => {
    expect(isCompatibleGearPlannerAugment(slot('Sun Slot'), augment('Sun Augment', 'Sun'))).toBe(true)
    expect(isCompatibleGearPlannerAugment(slot('Sun Slot'), augment('Moon Augment', 'Moon'))).toBe(false)
    expect(
      isCompatibleGearPlannerAugment(
        slot('Lamordia: Dolorous Slot (Armor)'),
        augment('Dolorous Invigorator', 'Lamordia: Dolorous (Armor)')
      )
    ).toBe(true)
    expect(
      isCompatibleGearPlannerAugment(
        slot('Lamordia: Dolorous Slot (Armor)'),
        augment('Dolorous Acid', 'Lamordia: Dolorous (Weapon)')
      )
    ).toBe(false)

    const special = slot('Isle of Dread: Claw Slot (Weapon)')
    expect(isCompatibleGearPlannerAugment(special, augment('Brightclaw', 'Isle of Dread: Claw (Weapon)'))).toBe(true)
    expect(isCompatibleGearPlannerAugment(special, augment('Wrong claw', 'Isle of Dread: Claw (Accessory)'))).toBe(
      false
    )

    const unknown = slot('Mystery Slot')
    expect(isCompatibleGearPlannerAugment(unknown, augment('Mystery', 'Mystery'))).toBe(true)
    expect(isCompatibleGearPlannerAugment(unknown, augment('Colorless', 'Colorless'))).toBe(false)
  })

  it('keeps blank production augment types valid but unavailable to normal slots', () => {
    const greenSteel = augment('Green Steel Augment (Equipment, Tier 1, air dominion ethereal)', '')
    const red = augment('Ruby', 'Red')

    expect(isCompatibleGearPlannerAugment(slot('Red'), greenSteel)).toBe(false)
    expect(getCompatibleGearPlannerAugments(slot('Red Slot'), [greenSteel, red])).toEqual([red])
  })

  it('uses source-backed stable identities for same-name source records', () => {
    const first = augment('Green Steel Augment', '')
    const second = { ...first, source: { ...first.source, foundIn: ['different recipe'] } }

    expect(gearPlannerAugmentIdentity(first)).not.toBe(gearPlannerAugmentIdentity(second))
  })
})

describe('selected augment metadata', () => {
  it('preserves selected augment set memberships for later set counting', () => {
    const selected = {
      ...augment('Set Augment: Arcane Barrier', 'Colorless'),
      setBonus: [{ name: 'Arcane Barrier' }]
    }
    const item: GearPlannerItem = {
      id: 'head',
      slot: gearPlannerSlots.head,
      sourceFile: 'test.json',
      minimumLevel: 30,
      source: { name: 'Set Helm', augments: [slot('Colorless')] }
    }
    const equipment = { ...createEmptyGearPlannerEquipment(), Head: item }

    expect(collectSelectedAugmentSetMemberships(equipment, { head: { 0: selected } })).toMatchObject([
      { item, slotIndex: 0, augment: selected, setBonus: { name: 'Arcane Barrier' } }
    ])
  })
})
