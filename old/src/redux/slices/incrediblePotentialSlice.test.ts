import { describe, expect, it } from 'vitest'
import reducer from './incrediblePotentialSlice'

describe('incrediblePotentialSlice', () => {
  it('should have ringFilters and upgradeFilters pre-populated with all items', () => {
    const initialState = reducer(undefined, { type: '@@INIT' })

    // Check if filter lists are not empty
    expect(initialState.ringFilters.length).toBeGreaterThan(0)
    expect(initialState.upgradeFilters.length).toBeGreaterThan(0)

    // Check if they are sorted
    const sortedFilters = [...initialState.ringFilters].sort((a, b) => a.localeCompare(b))
    expect(initialState.ringFilters).toEqual(sortedFilters)
  })

  it('should not slice the filters to 2', () => {
    const initialState = reducer(undefined, { type: '@@INIT' })

    // In previous implementation, ringFilters and upgradeFilters were limited to slice(0, 2) per item
    // By checking if we have more than a few filters, we can be confident they are not sliced too much
    // (Actual counts depend on data, but should be > 2)
    expect(initialState.ringFilters.length).toBeGreaterThan(10)
    expect(initialState.upgradeFilters.length).toBeGreaterThan(5)
  })
})
