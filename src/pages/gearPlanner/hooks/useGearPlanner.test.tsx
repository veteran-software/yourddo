import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import gearPlannerReducer, { type GearPlannerState } from '../../../redux/slices/gearPlannerSlice'
import { createDefaultSetup } from '../initialState'
import useGearPlanner from './useGearPlanner'

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

vi.mock('./useGearPlannerUI', () => ({
  useGearPlannerUI: () => ({})
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
})
