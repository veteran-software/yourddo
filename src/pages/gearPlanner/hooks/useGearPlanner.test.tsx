import { configureStore } from '@reduxjs/toolkit'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import gearPlannerReducer, { type GearPlannerState } from '../../../redux/slices/gearPlannerSlice'
import { createDefaultSetup } from '../initialState'
import useGearPlanner from './useGearPlanner'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()

class MockIntersectionObserver {
  callback: (entries: { isIntersecting: boolean }[]) => void
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = vi.fn()

  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    this.callback = callback
    MockIntersectionObserver._lastInstance = this
  }

  private static _lastInstance: MockIntersectionObserver | null = null

  static get lastInstance(): MockIntersectionObserver | null {
    return MockIntersectionObserver._lastInstance
  }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock useGearPlannerData and other internal hooks to avoid fetching data
vi.mock('./useGearPlannerData', () => ({
  useGearPlannerData: () => ({
    loading: false,
    dataReady: true,
    allItems: [],
    allAugments: {},
    allCurses: {},
    allFiligrees: [],
    allItemsBySlot: {},
    itemToSetsMap: {},
    itemSetBonusIndex: {},
    filigreeSetBonusIndex: {}
  })
}))

let mockItemsToShow = 50
const mockSetItemsToShow = vi.fn((updater: ((prev: number) => number) | number) => {
  if (typeof updater === 'function') {
    mockItemsToShow = updater(mockItemsToShow)
  } else {
    mockItemsToShow = updater
  }
})

vi.mock('./useGearPlannerUI', () => ({
  useGearPlannerUI: vi.fn(() => ({
    itemsToShow: mockItemsToShow,
    setItemsToShow: mockSetItemsToShow,
    showConflicts: false,
    showOwnedOnly: false,
    setBonusFilter: null
  }))
}))

vi.mock('./useGearPlannerFiltering', () => ({
  useGearPlannerFiltering: () => ({})
}))

vi.mock('./useGearPlannerActions', () => ({
  useGearPlannerActions: () => ({})
}))

vi.mock('./renderGearPlanner', () => ({
  renderGearPlanner: () => ({})
}))

interface RootState {
  gearPlanner: GearPlannerState
  app: { troveData: Record<string, unknown> }
}

describe('useGearPlanner Hook', () => {
  const createTestStore = (initialGearState: GearPlannerState) => {
    return configureStore<RootState>({
      reducer: {
        gearPlanner: gearPlannerReducer,
        app: () => ({ troveData: {} })
      },
      preloadedState: {
        gearPlanner: initialGearState,
        app: { troveData: {} }
      }
    })
  }

  const wrapper = ({ children, store }: { children: ReactNode; store: ReturnType<typeof createTestStore> }) => (
    <Provider store={store}>{children}</Provider>
  )

  it('Bug #1: should fallback to a default setup and prevent crash if activeSetupId is invalid and setups is empty', () => {
    const store = createTestStore({
      characterSetups: [],
      activeSetupId: 'nonexistent'
    })

    const { result } = renderHook(
      () =>
        useGearPlanner({
          enchantmentSearch: '',
          itemNameSearch: '',
          setBonusFilter: null,
          showConflicts: false,
          showOwnedOnly: false
        }),
      {
        wrapper: ({ children }) => wrapper({ children, store })
      }
    )

    // Verify it didn't crash and returned a valid setup
    expect(result.current.activeSetup).toBeDefined()
    expect(result.current.activeSetup.id).toBe('default')

    // Verify properties that caused the crash are accessible
    expect(result.current.activeSetup.artificerPet).toBeDefined()
    expect(result.current.activeSetup.druidPet).toBeDefined()
  })

  it('Bug #1: should fallback to first setup if activeSetupId is invalid but setups is NOT empty', () => {
    const store = createTestStore({
      characterSetups: [{ ...createDefaultSetup('setup1', 'Setup 1'), id: 'setup1' }],
      activeSetupId: 'nonexistent'
    })

    const { result } = renderHook(
      () =>
        useGearPlanner({
          enchantmentSearch: '',
          itemNameSearch: '',
          setBonusFilter: null,
          showConflicts: false,
          showOwnedOnly: false
        }),
      {
        wrapper: ({ children }) => wrapper({ children, store })
      }
    )

    expect(result.current.activeSetup).toBeDefined()
    expect(result.current.activeSetup.id).toBe('setup1')
    expect(result.current.activeSetup.artificerPet).toBeDefined()
    expect(result.current.activeSetup.druidPet).toBeDefined()
  })

  it('Infinite Scroll: should increment itemsToShow when observer target becomes visible', () => {
    const store = createTestStore({
      characterSetups: [],
      activeSetupId: 'default'
    })

    const { result } = renderHook(
      () =>
        useGearPlanner({
          enchantmentSearch: '',
          itemNameSearch: '',
          setBonusFilter: null,
          showConflicts: false,
          showOwnedOnly: false
        }),
      {
        wrapper: ({ children }) => wrapper({ children, store })
      }
    )

    expect(result.current.itemsToShow).toBe(50)

    // Trigger the callback ref!
    act(() => {
      result.current.observerTarget(document.createElement('div'))
    })

    // Simulate intersection
    act(() => {
      MockIntersectionObserver.lastInstance?.callback([{ isIntersecting: true }])
    })

    expect(mockSetItemsToShow).toHaveBeenCalled()
    const updater = mockSetItemsToShow.mock.calls[0][0] as unknown as (prev: number) => number
    expect(typeof updater).toBe('function')
    expect(updater(50)).toBe(100)
  })
})
