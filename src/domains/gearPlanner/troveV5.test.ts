import { describe, expect, it } from 'vitest'
import { importTroveV5 } from './troveV5'

const snapshot = (name: string, data: unknown) => new File([JSON.stringify(data)], name)
const bank = (name: string) => ({
  Tabs: {
    '0': { Name: 'Tab name', Pages: { '1': { Items: [{ Name: name, Quantity: 2, CharacterName: 'Last Viewer' }] } } }
  }
})

describe('Trove v5 inventory', () => {
  it('combines character and shared snapshots by item name, including equipped singles', async () => {
    const files = [
      snapshot('hero-1-inventory.json', {
        Name: 'Character',
        Inventory: [
          { Name: ' Helm ', Effects: [{ Name: 'Insight' }], Container: 'Equipped', EquipsTo: ['Head'] },
          { Name: 'Helm', Container: 'Equipped', EquipsTo: ['Head'] },
          { Name: 'Spent', Quantity: 0 }
        ]
      }),
      snapshot('hero-2-inventory.json', {
        Inventory: [{ Name: 'Helm', Quantity: 1, CharacterName: 'Alt', Tab: 3, Row: 2, Column: 4 }]
      }),
      snapshot('hero-1-bank.json', { Name: 'Bank Alt', PersonalBank: bank('Sword'), ReincarnationBank: bank('Ring') }),
      snapshot('account.json', { SharedBank: bank('Helm'), CraftingBank: bank('Ingot') }),
      snapshot('preferences.json', { Name: 'Ignored' })
    ]
    const { inventory, fileCount } = await importTroveV5(files)
    expect(fileCount).toBe(4)
    expect(Object.fromEntries(inventory)).toEqual({
      helm: [
        'Character (Equipped · Head)',
        'Alt (Inventory · Tab 3 · Row 2, column 4)',
        'Shared Bank · Tab name · Page 1'
      ],
      sword: ['Bank Alt (Bank · Tab name · Page 1)'],
      ring: ['Bank Alt (Reincarnation Cache · Tab name · Page 1)'],
      ingot: ['Shared Crafting Bank · Tab name · Page 1']
    })
  })
  it('rejects a damaged batch before replacing ownership, and reports folders without snapshots', async () => {
    const valid = snapshot('hero-1-inventory.json', { Inventory: [{ Name: 'Ring' }] })
    await expect(importTroveV5([valid, new File(['{'], 'account.json')])).rejects.toThrow('account.json')
    await expect(
      importTroveV5([valid, snapshot('hero-1-bank.json', { PersonalBank: { Tabs: { '0': {} } } })])
    ).rejects.toThrow('hero-1-bank.json')
    await expect(importTroveV5([snapshot('unrelated.json', {})])).rejects.toThrow('No Trove v5 snapshots')
  })
})
