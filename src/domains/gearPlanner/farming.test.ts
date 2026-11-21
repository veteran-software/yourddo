import { expect, it } from 'vitest'
import { createGearPlannerSetup } from './setups'
import { farmingList } from './farming'
import { parseTroveCsv } from './trove'
import type { GearPlannerSlot } from './gearPlanner.types'

function ringSetup() {
  const setup = createGearPlannerSetup('test', 'Ring setup')
  for (const slot of ['First Finger', 'Second Finger'] as GearPlannerSlot[]) {
    setup.equipment[slot] = {
      id: slot,
      slot,
      sourceFile: 'ring.json',
      minimumLevel: 1,
      source: {
        name: 'Ruby Ring',
        dropLocations: [{ questWildernessChain: 'The Vault', whichChestPerson: 'End chest' }, { vendorName: 'Trader' }]
      }
    }
  }
  return setup
}
it('allocates copies to the target first, then transferable stock, and farms a shortfall despite a bound alt copy', async () => {
  const prefix = 'Name,Character,Location,Quantity,Binding\n'
  const inventory = await parseTroveCsv(prefix + 'Ruby Ring,Alt,Bank,5,BtC\nRuby Ring,Hero,Inventory,1,BtA')
  const tasks = farmingList(ringSetup(), inventory, 'Hero')
  expect(tasks.map((t) => [t.status, t.quantity, t.group])).toEqual([
    ['Owned', 1, 'Hero (Inventory)'],
    ['Farm', 1, 'The Vault']
  ])
  expect(tasks[1].notes).toEqual(['Alt (Bank) · Character-bound'])
  expect(tasks[1].sources.map((s) => s.title)).toEqual(['The Vault', 'Trader'])
  const bank = await parseTroveCsv(prefix + 'Ruby Ring,-,SharedBank,3,BtA')
  expect(farmingList(ringSetup(), bank, 'Hero')).toMatchObject([
    { status: 'Collect', quantity: 2, group: 'Shared Bank' }
  ])
})
it('keeps old imports usable without inventing extra copies', () => {
  const tasks = farmingList(ringSetup(), new Map([['ruby ring', ['Hero (Bank)']]]), 'Hero')
  expect(tasks.map((t) => [t.status, t.quantity])).toEqual([
    ['Owned', 1],
    ['Check', 1]
  ])
  expect(farmingList(ringSetup(), new Map(), '')).toMatchObject([{ status: 'Farm', quantity: 2 }])
})
