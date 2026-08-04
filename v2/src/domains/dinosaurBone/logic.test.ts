import { describe, expect, it } from 'vitest'
import type { ClassifiedDinosaurBoneItem, DinosaurBoneAugment, DinosaurBoneItem } from './dinosaurBone.types'
import {
  buildDinosaurBoneIndexes,
  calculateCumulativeIngredients,
  calculateFinishedItem,
  classifyItems,
  filterRecords,
  getAvailableSlots,
  getCompatibleAugments,
  getSelectedAugments
} from './logic.ts'

const slot = (augmentType: string) => ({ id: augmentType, augmentType, label: augmentType.replace(' Slot', '') })
const item: ClassifiedDinosaurBoneItem = {
  name: 'Dinosaur Bone Test Sword',
  type: 'Long Sword',
  family: 'crafted-weapons',
  augments: [slot('Red'), slot('Isle of Dread: Claw Slot (Weapon)')],
  requirements: [{ name: 'Bone', quantity: 25 }],
  effectsAdded: [{ name: '+15 Enhancement Bonus' }, { name: '+15 Enhancement Bonus' }]
}
const red: DinosaurBoneAugment = {
  name: 'Red One',
  augmentType: 'Red',
  effectsAdded: [{ name: 'Fire' }],
  requirements: []
}
const claw: DinosaurBoneAugment = {
  name: 'Claw One',
  augmentType: 'Isle of Dread: Claw (Weapon)',
  effectsAdded: [{ name: 'Strength', modifier: 2 }],
  requirements: [{ name: 'Tooth', quantity: 100 }]
}
const indexes = buildDinosaurBoneIndexes([item], [claw], [red])

describe('Dinosaur Bone logic', () => {
  it('classifies each approved family deterministically', () => {
    const base = (name: string): DinosaurBoneItem => ({ name, type: 'Item', augments: [], requirements: [] })
    const values = classifyItems(
      [
        base('Crafted'),
        base('Attuned Bone Longsword'),
        base('Dinosaur Bone Belt'),
        base('Dinosaur Plate Armor'),
        base('Legendary Named Item')
      ],
      new Set(['Crafted'])
    )
    expect(values.map(({ family }) => family)).toEqual([
      'crafted-weapons',
      'attuned-weapons',
      'armor-accessories',
      'armor-accessories',
      'named-items'
    ])
  })

  it('filters with OR, AND, and empty-filter semantics', () => {
    const values = [
      { name: 'one', effects: ['Fire'] },
      { name: 'two', effects: ['Fire', 'Cold'] },
      { name: 'three', effects: ['Cold'] }
    ]
    const getEffects = (value: (typeof values)[number]) => value.effects
    expect(filterRecords(values, [], 'AND', getEffects)).toBe(values)
    expect(filterRecords(values, ['Fire', 'Cold'], 'OR', getEffects).map(({ name }) => name)).toEqual([
      'one',
      'two',
      'three'
    ])
    expect(filterRecords(values, ['Fire', 'Cold'], 'AND', getEffects).map(({ name }) => name)).toEqual(['two'])
  })

  it('indexes and resolves explicit color and Dinosaur Bone compatibility without duplicate options', () => {
    expect(getCompatibleAugments('Red', indexes)).toEqual([red])
    expect(getCompatibleAugments('Isle of Dread: Claw Slot (Weapon)', indexes)).toEqual([claw])
    expect(new Set(getCompatibleAugments('Red', indexes).map(({ name }) => name)).size).toBe(1)
  })

  it('rejects an unknown slot contract', () => {
    expect(() => getCompatibleAugments('Unknown Slot', indexes)).toThrow('Unknown Dinosaur Bone slot contract')
  })

  it('puts Dinosaur Bone slots before color slots while preserving order within groups', () => {
    expect(getAvailableSlots(item).map(({ augmentType }) => augmentType)).toEqual([
      'Isle of Dread: Claw Slot (Weapon)',
      'Red'
    ])
  })

  it('resolves selected augments only when they are compatible', () => {
    expect(
      getSelectedAugments(item, { Red: 'Red One', 'Isle of Dread: Claw Slot (Weapon)': 'Red One' }, indexes)
    ).toEqual({ Red: red })
  })

  it('calculates a deterministic finished item and reports empty and invalid slots', () => {
    const result = calculateFinishedItem(
      item,
      { Red: 'Missing', 'Isle of Dread: Claw Slot (Weapon)': 'Claw One' },
      indexes
    )
    expect(result.originalEffects).toEqual([{ name: '+15 Enhancement Bonus' }])
    expect(result.slots[0].augment).toBe(claw)
    expect(result.emptySlots.map(({ augmentType }) => augmentType)).toEqual(['Red'])
    expect(result.warnings).toEqual(['Red: selected augment “Missing” is missing.'])
  })

  it('aggregates base, augment, and nested quantities without source mutation', () => {
    const nestedItem: ClassifiedDinosaurBoneItem = {
      ...item,
      requirements: [
        { name: 'Bone', quantity: 25 },
        { name: 'Bundle', quantity: 2, requirements: [{ name: 'Bone', quantity: 3 }] }
      ]
    }
    const before = structuredClone(nestedItem)
    expect(calculateCumulativeIngredients(nestedItem, { Claw: claw })).toEqual([
      { name: 'Bone', quantity: 31 },
      { name: 'Bundle', quantity: 2 },
      { name: 'Tooth', quantity: 100 }
    ])
    expect(nestedItem).toEqual(before)
  })

  it('rejects invalid calculated quantities', () => {
    expect(() => calculateCumulativeIngredients({ ...item, requirements: [{ name: 'Bad', quantity: 0 }] }, {})).toThrow(
      'Invalid Dinosaur Bone requirement quantity for Bad'
    )
  })
})
