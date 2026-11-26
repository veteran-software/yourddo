import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadNativeNearlyComplete } from '../gearPlanner/nativeUpgradeData'
import {
  getNearlyCompleteItemProperty,
  getNearlyCompleteItems,
  loadNearlyCompleteItems,
  type NearlyCompleteItem
} from './data.ts'

vi.mock('../gearPlanner/nativeUpgradeData', () => ({ loadNativeNearlyComplete: vi.fn() }))

const item = (name: string, minLevel: string, property: string | null, type = 'Necklace'): NearlyCompleteItem => ({
  pageTitle: name,
  name,
  type,
  minLevel,
  enchantments: property ? [{ name: `Nearly Complete: ${property}` }] : [{ name: 'Strength', modifier: '4' }]
})

beforeEach(() => {
  vi.mocked(loadNativeNearlyComplete).mockReset()
})

describe('Nearly Complete data', () => {
  it('loads items from the Nearly Complete CDN package', async () => {
    const items = [item('Astral Spore Pendant', '11', 'Quality Ability Score')]
    vi.mocked(loadNativeNearlyComplete).mockResolvedValue({ items, recipes: [] })

    await expect(loadNearlyCompleteItems()).resolves.toEqual(items)
    expect(loadNativeNearlyComplete).toHaveBeenCalledOnce()
  })

  it('extracts the Nearly Complete property and ignores ineligible items', () => {
    expect(getNearlyCompleteItemProperty(item('Eligible', '11', 'Spell Focus'))).toBe('Spell Focus')
    expect(getNearlyCompleteItemProperty(item('Ineligible', '11', null))).toBeNull()
  })

  it('filters by property and level-derived tier, then sorts by name', () => {
    const items = [
      item('Zircon Pendant', '11', 'Ability Score'),
      item('Legendary Pendant', '35', 'Ability Score'),
      item('Amber Pendant', '11', 'Ability Score'),
      item('Skill Pendant', '11', 'Skill'),
      item('Unfinished Outfit', '11', null)
    ]

    expect(getNearlyCompleteItems(items, 'Heroic', 'Ability Score').map(({ name }) => name)).toEqual([
      'Amber Pendant',
      'Zircon Pendant'
    ])
    expect(getNearlyCompleteItems(items, 'Legendary', 'Ability Score').map(({ name }) => name)).toEqual([
      'Legendary Pendant'
    ])
  })
})
