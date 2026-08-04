import { describe, expect, it } from 'vitest'
import type { DinosaurBoneAugment, DinosaurBoneItem } from './dinosaurBone.types'
import {
  filterItems,
  getAvailableSlots,
  getCompatibleAugments,
  getCumulativeIngredients,
  getFinishedEffects,
  retainSelectedAugments
} from './logic.ts'

const item: DinosaurBoneItem = {
  name: 'Dinosaur Bone Test Sword',
  type: 'Long Sword',
  augments: [{ augmentType: 'Red' }, { augmentType: 'Isle of Dread: Claw Slot (Weapon)' }],
  requirements: [{ name: 'Bone', quantity: 25 }],
  effectsAdded: [{ name: '+15 Enhancement Bonus' }]
}

const red: DinosaurBoneAugment = { name: 'Red One', augmentType: 'Red', effectsAdded: [{ name: 'Fire' }] }
const claw: DinosaurBoneAugment = {
  name: 'Claw One',
  augmentType: 'Isle of Dread: Claw (Weapon)',
  effectsAdded: [{ name: 'Strength', modifier: 2 }],
  requirements: [{ name: 'Tooth', quantity: 100 }]
}

describe('Dinosaur Bone logic', () => {
  it('filters with OR and AND semantics', () => {
    const values = [
      { name: 'one', effects: ['Fire'] },
      { name: 'two', effects: ['Fire', 'Cold'] },
      { name: 'three', effects: ['Cold'] }
    ]
    const getEffects = (value: (typeof values)[number]) => value.effects

    expect(filterItems(values, ['Fire', 'Cold'], 'OR', getEffects).map(({ name }) => name)).toEqual([
      'one',
      'two',
      'three'
    ])
    expect(filterItems(values, ['Fire', 'Cold'], 'AND', getEffects).map(({ name }) => name)).toEqual(['two'])
  })

  it('resolves explicit color and Dinosaur Bone slot families', () => {
    expect(getCompatibleAugments('Red', [claw], [red])).toEqual([red])
    expect(getCompatibleAugments('Isle of Dread: Claw Slot (Weapon)', [claw], [red])).toEqual([claw])
  })

  it('puts Isle of Dread slots first while preserving payload order within each group', () => {
    const payloadOrderedItem: DinosaurBoneItem = {
      ...item,
      augments: [
        { augmentType: 'Yellow' },
        { augmentType: 'Isle of Dread: Fang Slot (Weapon)' },
        { augmentType: 'Red' },
        { augmentType: 'Isle of Dread: Claw Slot (Weapon)' }
      ]
    }

    expect(getAvailableSlots(payloadOrderedItem)).toEqual([
      'Isle of Dread: Fang Slot (Weapon)',
      'Isle of Dread: Claw Slot (Weapon)',
      'Yellow',
      'Red'
    ])
  })

  it('retains only selections valid for the current item', () => {
    const options = new Map([
      ['Red', [red]],
      ['Isle of Dread: Claw Slot (Weapon)', [claw]]
    ])
    expect(
      retainSelectedAugments(item, { Red: 'Red One', 'Isle of Dread: Claw Slot (Weapon)': 'Missing' }, options)
    ).toEqual({ Red: 'Red One', 'Isle of Dread: Claw Slot (Weapon)': null })
  })

  it('aggregates base and selected augment requirements deterministically', () => {
    expect(getCumulativeIngredients(item, { Claw: claw, Red: red })).toEqual([
      { name: 'Bone', quantity: 25 },
      { name: 'Tooth', quantity: 100 }
    ])
  })

  it('separates base and selected effects without mutating records', () => {
    const result = getFinishedEffects(item, { Claw: claw })
    expect(result.base).toEqual([{ name: '+15 Enhancement Bonus' }])
    expect(result.selected[0]?.augment.name).toBe('Claw One')
    expect(item.effectsAdded).toEqual([{ name: '+15 Enhancement Bonus' }])
  })
})
