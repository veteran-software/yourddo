import { describe, expect, it } from 'vitest'
import { normalizeGearPlannerFiligrees, gearPlannerFiligreeId } from './normalize'
import { candidateSetDetails } from './finding'
import type { GearPlannerItem } from './gearPlanner.types'
import { getTroveOwners, ownsTroveItem, parseTroveCsv } from './trove'

describe('Finding gear', () => {
  it('keeps same-name, same-level variants tied to their own set memberships', () => {
    const item: GearPlannerItem = {
      id: 'sphere',
      sourceFile: 'test',
      slot: 'Armor',
      minimumLevel: 29,
      source: { name: 'Sphere of Souls', minLevel: 29 }
    }
    expect(candidateSetDetails(item).sets).toEqual([])
    for (const name of ['Summer', 'Winter']) {
      expect(candidateSetDetails({ ...item, source: { ...item.source, setBonus: [{ name }] } }).sets).toEqual([name])
    }
  })

  it('connects dual-set records to the published bonus names while preserving saved IDs', () => {
    const source = {
      name: 'Dual filigree',
      grouping: 'Abiding Path/Elemental Avatar',
      setBonus: [{ name: 'Abiding Path' }, { name: 'Elemental Avatar' }]
    }
    const defs = new Map(
      ['The Abiding Path', 'Elemental Avatar'].map((name) => [name, { name, thresholds: [], source: {} }])
    )
    const [filigree] = normalizeGearPlannerFiligrees([source], defs)
    expect(filigree.grouping).toBe('The Abiding Path/Elemental Avatar')
    expect(filigree.id).toBe(gearPlannerFiligreeId(source))
  })

  it('matches quoted inventory names, positive quantities and rare filigrees', async () => {
    const inventory = await parseTroveCsv(
      '\uFEFFName,Quantity,Character,Location\r\n"Blade, ""Shining""",2,A,Bank\r\nNight: Wisdom,1,-,SharedBank\r\nGone,0,A,Bank'
    )
    expect([...inventory.keys()]).toEqual(['blade, "shining"', 'night: wisdom'])
    expect(getTroveOwners(inventory, 'Blade, "Shining"')).toEqual(['A (Bank)'])
    expect(getTroveOwners(inventory, 'Night: Wisdom (Rare)', true)).toEqual(['Shared Bank'])
    expect(ownsTroveItem(inventory, 'Night: Wisdom (Rare)', true)).toBe(true)
    expect(ownsTroveItem(inventory, 'Night: Wisdom (Rare)')).toBe(false)
    await expect(parseTroveCsv('Name,Quantity\nSomething,1')).rejects.toThrow('Dungeon Helper')
    await expect(parseTroveCsv('Name,Quantity,Character,Location\n"Broken,1,Char,Bank')).rejects.toThrow('invalid row')
  })
})
