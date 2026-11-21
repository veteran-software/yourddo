import { describe, expect, it } from 'vitest'
import type { ClassifiedDinosaurBoneItem, DinosaurBoneAugment, DinosaurBoneItem } from './dinosaurBone.types'
import {
  adjustEffectForArtifact,
  buildDinosaurBoneIndexes,
  calculateCumulativeIngredients,
  calculateFinishedItem,
  classifyItems,
  filterRecords,
  getAvailableSlots,
  getColorAugmentMinimumLevelIncrease,
  getCompatibleAugments,
  getSelectedAugments,
  isAbilityScoreEffect,
  isArtifactItem
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
const yellow: DinosaurBoneAugment = {
  name: 'Yellow One',
  augmentType: 'Yellow',
  minimumLevel: 20,
  requirements: []
}
const orange: DinosaurBoneAugment = {
  name: 'Orange One',
  augmentType: 'Orange',
  minimumLevel: 28,
  requirements: []
}
const colorless: DinosaurBoneAugment = {
  name: 'Colorless One',
  augmentType: 'Colorless',
  minimumLevel: 8,
  requirements: []
}
const claw: DinosaurBoneAugment = {
  name: 'Claw One',
  augmentType: 'Isle of Dread: Claw (Weapon)',
  effectsAdded: [{ name: 'Strength', modifier: 2 }],
  requirements: [{ name: 'Tooth', quantity: 100 }]
}
const indexes = buildDinosaurBoneIndexes([item], [claw], [red, yellow, orange, colorless])

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

  it('increases only numeric ability score upgrades on artifacts without mutating the source effect', () => {
    const artifact = { ...item, artifactType: 'Minor' }
    const strength = { name: 'Strength +14', modifier: 14, bonus: 'Enhancement' }

    expect(isArtifactItem(artifact)).toBe(true)
    expect(isAbilityScoreEffect(strength)).toBe(true)
    expect(adjustEffectForArtifact(strength, artifact)).toEqual({
      name: 'Strength +15',
      modifier: 15,
      bonus: 'Enhancement'
    })
    expect(adjustEffectForArtifact({ name: 'Accuracy +21', modifier: 21 }, artifact)).toEqual({
      name: 'Accuracy +21',
      modifier: 21
    })
    expect(adjustEffectForArtifact(strength, item)).toBe(strength)
    expect(strength).toEqual({ name: 'Strength +14', modifier: 14, bonus: 'Enhancement' })
  })

  it('calculates minimum level increases from selected color augments only', () => {
    const levelFifteenItem = { ...item, minLevel: 15 }
    expect(
      getColorAugmentMinimumLevelIncrease(levelFifteenItem, [
        { slot: slot('Red'), augment: { ...red, minimumLevel: 20 } },
        { slot: slot('Isle of Dread: Claw Slot (Weapon)'), augment: { ...claw, minimumLevel: 30 } }
      ])
    ).toEqual({ itemLevel: 15, minimumLevel: 20 })
    expect(
      getColorAugmentMinimumLevelIncrease(levelFifteenItem, [
        { slot: slot('Red'), augment: { ...red, minimumLevel: 8 } }
      ])
    ).toBeUndefined()
  })

  it('indexes and resolves explicit color and Dinosaur Bone compatibility without duplicate options', () => {
    const redOptions = getCompatibleAugments('Red', indexes)
    expect(redOptions).toEqual([red, colorless])
    expect(getCompatibleAugments('Orange Slot', indexes)).toEqual([orange, red, yellow, colorless])
    expect(getCompatibleAugments('Isle of Dread: Claw Slot (Weapon)', indexes)).toEqual([claw])
    expect(new Set(redOptions.map(({ name }) => name)).size).toBe(redOptions.length)
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
