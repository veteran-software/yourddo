import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GearSlot } from '../types'
import { useGearPlannerUI } from './useGearPlannerUI'

describe('useGearPlannerUI', () => {
  it('owns the search and conflict toggles by default', () => {
    const { result } = renderHook(() => useGearPlannerUI())

    expect(result.current.internalItemNameSearch).toBe('')
    expect(result.current.showConflicts).toBe(false)
    expect(result.current.showOwnedOnly).toBe(false)
    expect(result.current.setBonusFilter).toBeNull()
  })

  it('resets search when a browser is opened', () => {
    const { result } = renderHook(() => useGearPlannerUI())

    act(() => {
      result.current.setInternalItemNameSearch('heroism')
      result.current.openSlotBrowser(GearSlot.Head)
    })

    expect(result.current.browsingSlot).toBe(GearSlot.Head)
    expect(result.current.internalItemNameSearch).toBe('')
    expect(result.current.itemsToShow).toBe(50)
  })
})
