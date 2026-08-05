import { Input } from '@mantine/core'
import { describe, expect, it } from 'vitest'
import { validateViktraniumDataset } from './data.ts'
import {
  calculateFinishedItem,
  calculateIngredients,
  filterRecords,
  getAugmentEffectNames,
  getCompatibleAugments,
  getItemEffectNames,
  getSelectedAugments
} from './logic.ts'
import { createViktraniumTestPayload } from './test-fixture.ts'
import Error = Input.Error

const setup = () => validateViktraniumDataset(createViktraniumTestPayload())
const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Missing test fixture value')
  return value
}

describe('Viktranium logic', () => {
  it('implements real OR and AND filtering', () => {
    const data = setup()
    const items = [data.items[0], data.items[1]]
    expect(filterRecords(items, ['Vampirism', 'Speed'], 'OR', getItemEffectNames)).toHaveLength(2)
    expect(filterRecords(items, ['Vampirism', 'Speed'], 'AND', getItemEffectNames)).toHaveLength(0)
    expect(filterRecords(items, [], 'AND', getItemEffectNames)).toBe(items)
  })

  it('supports color, Sun, Moon, and exact Lamordia compatibility', () => {
    const data = setup()
    const heroic = required(data.indexes.itemById.get('item-heroic-crafted'))
    expect(getCompatibleAugments(heroic.slots[1], data).map(({ id }) => id)).toEqual([
      'augment-red',
      'augment-colorless'
    ])
    expect(getCompatibleAugments(heroic.slots[0], data).map(({ id }) => id)).toEqual(['augment-sun'])
    const wicked = required(data.indexes.itemById.get('item-wicked'))
    expect(getCompatibleAugments(wicked.slots[0], data).map(({ id }) => id)).toEqual(['augment-lamordia'])
  })

  it('uses stable augment IDs, preserves duplicate names, and rejects incompatibility', () => {
    const data = setup()
    const item = required(data.indexes.itemById.get('item-heroic-crafted'))
    const selected = getSelectedAugments(item, { 'slot-red': 'augment-colorless', 'slot-sun': 'augment-red' }, data)
    expect(selected['slot-red'].id).toBe('augment-colorless')
    expect(selected['slot-sun']).toBeUndefined()
    expect(getAugmentEffectNames(required(data.indexes.augmentById.get('augment-red')))).toEqual(['Fire Damage'])
  })

  it('builds a deterministic finished item and raises level for a color augment', () => {
    const data = setup()
    const item = required(data.indexes.itemById.get('item-heroic-crafted'))
    const finished = calculateFinishedItem(item, { 'slot-red': 'augment-red' }, data)
    expect(finished.minimumLevel).toBe(12)
    expect(finished.emptySlots.map(({ id }) => id)).toEqual(['slot-sun'])
    expect(finished.baseEffects).toHaveLength(1)
  })

  it('aggregates and multiplies nested requirements without mutation', () => {
    const data = setup()
    const item = required(data.indexes.itemById.get('item-heroic-crafted'))
    const before = JSON.stringify(data.items)
    const result = calculateIngredients(item, {}, data)
    expect(result.ingredients.map(({ name, quantity }) => [name, quantity])).toEqual([
      ['Bleak A', 2],
      ['Bleak B', 6]
    ])
    expect(JSON.stringify(data.items)).toBe(before)
  })
})
