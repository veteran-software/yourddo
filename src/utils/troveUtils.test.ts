import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStoredTroveData } from './troveUtils'

describe('getStoredTroveData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null if localStorage is empty', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    expect(getStoredTroveData()).toBeNull()
  })

  it('returns parsed data if localStorage contains valid JSON', () => {
    const validData = JSON.stringify({
      item1: {
        binding: 'Bind on Pickup',
        byCharacter: [
          {
            character: 'Char1',
            locations: { Inventory: 1, Bank: 0, SharedBank: 0, SharedCrafting: 0, 'Reincarnation Cache': 0 }
          }
        ]
      }
    })
    vi.mocked(localStorage.getItem).mockReturnValue(validData)
    const result = getStoredTroveData()
    expect(result).not.toBeNull()
    expect(result!.item1.binding).toBe('Bind on Pickup')
  })

  it('handles legacy data shape', () => {
    const legacyData = JSON.stringify({
      item1: {
        binding: 'Bind on Pickup',
        byCharacter: {
          Char1: { Inventory: 1, Bank: 0, SharedBank: 0, SharedCrafting: 0, 'Reincarnation Cache': 0 }
        }
      }
    })
    vi.mocked(localStorage.getItem).mockReturnValue(legacyData)
    const result = getStoredTroveData()
    expect(result).not.toBeNull()
    expect(Array.isArray(result!.item1.byCharacter)).toBe(true)
    expect(result!.item1.byCharacter[0].character).toBe('Char1')
  })

  it('returns null if localStorage contains malformed JSON', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('malformed json')
    expect(getStoredTroveData()).toBeNull()
  })
})
