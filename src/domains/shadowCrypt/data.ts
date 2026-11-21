export type Direction = 'north' | 'south' | 'east' | 'west'

export type RouteStep = { readonly type: 'move'; readonly direction: Direction } | { readonly type: 'dimension-door' }

export type StartingRoomColor = 'red' | 'green' | 'blue'

export interface RouteDefinition {
  readonly legacySequence: string
  readonly steps: readonly RouteStep[]
}

export interface ShadowCryptColorRoutes {
  readonly twelveGear: RouteDefinition
  readonly eightGearDuo: {
    readonly groupA: RouteDefinition
    readonly groupB: RouteDefinition
  }
}

const move = (direction: Direction): RouteStep => ({ type: 'move', direction })
const dimensionDoor = (): RouteStep => ({ type: 'dimension-door' })

export const SHADOW_CRYPT_ROUTES: Record<StartingRoomColor, ShadowCryptColorRoutes> = {
  red: {
    twelveGear: {
      legacySequence: 'EEEESSNWN(DD)SESSW',
      steps: [
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
    },
    eightGearDuo: {
      groupA: {
        legacySequence: 'NNSEW',
        steps: [move('north'), move('north'), move('south'), move('east'), move('west')]
      },
      groupB: {
        legacySequence: 'WWEWW',
        steps: [move('west'), move('west'), move('east'), move('west'), move('west')]
      }
    }
  },
  green: {
    twelveGear: {
      legacySequence: 'EEENNNNNNN(DD)WSWSEW',
      steps: [
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
    },
    eightGearDuo: {
      groupA: {
        legacySequence: 'WWNEW',
        steps: [move('west'), move('west'), move('north'), move('east'), move('west')]
      },
      groupB: {
        legacySequence: 'WENEW',
        steps: [move('west'), move('east'), move('north'), move('east'), move('west')]
      }
    }
  },
  blue: {
    twelveGear: {
      legacySequence: '(DD)NWWWWNNNSSNWWEE',
      steps: [
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
    },
    eightGearDuo: {
      groupA: {
        legacySequence: 'SNSEE',
        steps: [move('south'), move('north'), move('south'), move('east'), move('east')]
      },
      groupB: {
        legacySequence: 'WSEEE',
        steps: [move('west'), move('south'), move('east'), move('east'), move('east')]
      }
    }
  }
}

export const getDirectionLabel = (direction: Direction): string =>
  ({ north: 'North', south: 'South', east: 'East', west: 'West' })[direction]

export const getRouteStepLabel = (step: RouteStep): string =>
  step.type === 'dimension-door' ? 'Dimension Door' : `Move ${getDirectionLabel(step.direction)}`

export const getRouteStepCount = (route: RouteDefinition): number => route.steps.length

export const setCompletedStepCount = (route: RouteDefinition, completedSteps: number): number =>
  Math.min(Math.max(completedSteps, 0), getRouteStepCount(route))

export const advanceRouteProgress = (route: RouteDefinition, completedSteps: number): number =>
  setCompletedStepCount(route, completedSteps + 1)

export const backRouteProgress = (route: RouteDefinition, completedSteps: number): number =>
  setCompletedStepCount(route, completedSteps - 1)

export const resetRouteProgress = (): number => 0

export const getCurrentRouteStep = (route: RouteDefinition, completedSteps: number): RouteStep | undefined =>
  route.steps[setCompletedStepCount(route, completedSteps)]
