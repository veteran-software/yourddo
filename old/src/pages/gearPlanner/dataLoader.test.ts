import { describe, expect, it } from 'vitest'
import { generateItemId } from './dataLoader'
import { GearSlot } from './types'

describe('dataLoader ID Generation', () => {
  it('Bug #5: generateItemId should be stable and include slot, name, minLevel, and fileName', () => {
    const item = { name: 'Legendary Ring of Prowess', minLevel: 29 }
    const slot: string = GearSlot.FirstFinger
    const fileName = 'ring.json'

    const id: string = generateItemId(item, slot, fileName)

    expect(id).toBe('First Finger|Legendary Ring of Prowess|29|ring.json')
  })

  it('Bug #5: generateItemId should handle numeric and string minLevel consistently', () => {
    const item1 = { name: 'Test', minLevel: 29 }
    const item2 = { name: 'Test', minLevel: '29' }
    const slot = GearSlot.Head
    const fileName = 'helmet.json'

    expect(generateItemId(item1, slot, fileName)).toBe(generateItemId(item2, slot, fileName))
  })

  it('Bug #5: generateItemId should handle missing minLevel by defaulting to 1', () => {
    const item = { name: 'Low Level Item', minLevel: '' }
    const slot = GearSlot.Trinket
    const fileName = 'trinket.json'

    const id = generateItemId(item, slot, fileName)
    expect(id).toContain('|1|')
  })
})
