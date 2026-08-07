import { describe, expect, it } from 'vitest'
import {
  advanceRouteProgress,
  backRouteProgress,
  getCurrentRouteStep,
  getDirectionLabel,
  getRouteStepCount,
  getRouteStepLabel,
  resetRouteProgress,
  type RouteStep,
  setCompletedStepCount,
  SHADOW_CRYPT_ROUTES
} from './data.ts'

const move = (direction: 'north' | 'south' | 'east' | 'west') => ({ type: 'move', direction }) as const
const dimensionDoor = () => ({ type: 'dimension-door' }) as const

describe('The Shadow Crypt route data', () => {
  it.each([
    [
      'Red 12-Gear',
      SHADOW_CRYPT_ROUTES.red.twelveGear,
      'EEEESSNWN(DD)SESSW',
      [
        move('east'),
        move('east'),
        move('east'),
        move('east'),
        move('south'),
        move('south'),
        move('north'),
        move('west'),
        move('north'),
        dimensionDoor(),
        move('south'),
        move('east'),
        move('south'),
        move('south'),
        move('west')
      ]
    ],
    [
      'Green 12-Gear',
      SHADOW_CRYPT_ROUTES.green.twelveGear,
      'EEENNNNNNN(DD)WSWSEW',
      [
        move('east'),
        move('east'),
        move('east'),
        move('north'),
        move('north'),
        move('north'),
        move('north'),
        move('north'),
        move('north'),
        move('north'),
        dimensionDoor(),
        move('west'),
        move('south'),
        move('west'),
        move('south'),
        move('east'),
        move('west')
      ]
    ],
    [
      'Blue 12-Gear',
      SHADOW_CRYPT_ROUTES.blue.twelveGear,
      '(DD)NWWWWNNNSSNWWEE',
      [
        dimensionDoor(),
        move('north'),
        move('west'),
        move('west'),
        move('west'),
        move('west'),
        move('north'),
        move('north'),
        move('north'),
        move('south'),
        move('south'),
        move('north'),
        move('west'),
        move('west'),
        move('east'),
        move('east')
      ]
    ],
    [
      'Red Duo Group A',
      SHADOW_CRYPT_ROUTES.red.eightGearDuo.groupA,
      'NNSEW',
      [move('north'), move('north'), move('south'), move('east'), move('west')]
    ],
    [
      'Red Duo Group B',
      SHADOW_CRYPT_ROUTES.red.eightGearDuo.groupB,
      'WWEWW',
      [move('west'), move('west'), move('east'), move('west'), move('west')]
    ],
    [
      'Green Duo Group A',
      SHADOW_CRYPT_ROUTES.green.eightGearDuo.groupA,
      'WWNEW',
      [move('west'), move('west'), move('north'), move('east'), move('west')]
    ],
    [
      'Green Duo Group B',
      SHADOW_CRYPT_ROUTES.green.eightGearDuo.groupB,
      'WENEW',
      [move('west'), move('east'), move('north'), move('east'), move('west')]
    ],
    [
      'Blue Duo Group A',
      SHADOW_CRYPT_ROUTES.blue.eightGearDuo.groupA,
      'SNSEE',
      [move('south'), move('north'), move('south'), move('east'), move('east')]
    ],
    [
      'Blue Duo Group B',
      SHADOW_CRYPT_ROUTES.blue.eightGearDuo.groupB,
      'WSEEE',
      [move('west'), move('south'), move('east'), move('east'), move('east')]
    ]
  ] as const satisfies readonly [
    string,
    { legacySequence: string; steps: readonly RouteStep[] },
    string,
    readonly RouteStep[]
  ][])('preserves the exact %s sequence', (_, route, legacySequence, steps) => {
    expect(route.legacySequence).toBe(legacySequence)
    expect(route.steps).toEqual(steps)
  })

  it('preserves Dimension Door at its exact legacy positions', () => {
    const dimensionDoorPositions = (steps: readonly RouteStep[]) =>
      steps.flatMap((step, index) => (step.type === 'dimension-door' ? [index] : []))

    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.red.twelveGear.steps)).toEqual([9])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.green.twelveGear.steps)).toEqual([10])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.blue.twelveGear.steps)).toEqual([0])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.red.eightGearDuo.groupA.steps)).toEqual([])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.red.eightGearDuo.groupB.steps)).toEqual([])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.green.eightGearDuo.groupA.steps)).toEqual([])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.green.eightGearDuo.groupB.steps)).toEqual([])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.blue.eightGearDuo.groupA.steps)).toEqual([])
    expect(dimensionDoorPositions(SHADOW_CRYPT_ROUTES.blue.eightGearDuo.groupB.steps)).toEqual([])
  })

  it('converts directions and special steps into display text', () => {
    expect(getDirectionLabel('north')).toBe('North')
    expect(getDirectionLabel('south')).toBe('South')
    expect(getDirectionLabel('east')).toBe('East')
    expect(getDirectionLabel('west')).toBe('West')
    expect(getRouteStepLabel(move('east'))).toBe('Move East')
    expect(getRouteStepLabel(dimensionDoor())).toBe('Dimension Door')
  })

  it('clamps, advances, backs up, resets, and resolves the current step from completed-step progress', () => {
    const route = SHADOW_CRYPT_ROUTES.red.eightGearDuo.groupA

    expect(getRouteStepCount(route)).toBe(5)
    expect(setCompletedStepCount(route, -3)).toBe(0)
    expect(setCompletedStepCount(route, 99)).toBe(5)
    expect(advanceRouteProgress(route, 0)).toBe(1)
    expect(advanceRouteProgress(route, 5)).toBe(5)
    expect(backRouteProgress(route, 3)).toBe(2)
    expect(backRouteProgress(route, 0)).toBe(0)
    expect(resetRouteProgress()).toBe(0)
    expect(getCurrentRouteStep(route, 0)).toEqual(move('north'))
    expect(getCurrentRouteStep(route, 4)).toEqual(move('west'))
    expect(getCurrentRouteStep(route, 5)).toBeUndefined()
    expect(getCurrentRouteStep(route, 99)).toBeUndefined()
  })
})
