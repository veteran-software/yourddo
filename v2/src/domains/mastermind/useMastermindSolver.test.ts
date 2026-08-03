// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useMastermindSolver, {
  type Color,
  generateAllCodes,
  getFeedback,
  selectNextGuess
} from './useMastermindSolver.ts'

describe('Mastermind solver', () => {
  it('generates every four-position code using six colors', () => {
    const codes = generateAllCodes()

    expect(codes).toHaveLength(1296)
    expect(new Set(codes.map((code) => code.join('-')))).toHaveLength(1296)
    expect(codes[0]).toEqual([1, 1, 1, 1])
    expect(codes.at(-1)).toEqual([6, 6, 6, 6])
  })

  it.each([
    { secret: [1, 2, 3, 4], guess: [1, 2, 3, 4], feedback: { black: 4, white: 0 } },
    { secret: [1, 2, 3, 4], guess: [5, 5, 6, 6], feedback: { black: 0, white: 0 } },
    { secret: [1, 2, 3, 4], guess: [4, 3, 2, 1], feedback: { black: 0, white: 4 } },
    { secret: [1, 1, 2, 3], guess: [1, 2, 1, 1], feedback: { black: 1, white: 2 } }
  ])('scores black, white, and repeated colors for $secret against $guess', ({ secret, guess, feedback }) => {
    expect(getFeedback(secret as Color[], guess as Color[])).toEqual(feedback)
  })

  it('prefers a remaining possibility when minimax candidates tie', () => {
    const possible: Color[][] = [
      [1, 1, 1, 1],
      [2, 2, 2, 2]
    ]

    expect(possible).toContainEqual(selectNextGuess(possible, generateAllCodes()))
  })

  it('starts with the legacy guess and all possibilities', () => {
    const { result } = renderHook(() => useMastermindSolver())

    expect(result.current.currentGuess).toEqual([1, 1, 2, 2])
    expect(result.current.possibleCount).toBe(1296)
    expect(result.current.guesses).toEqual([])
    expect(result.current.finished).toBe(false)
  })

  it('records valid feedback, narrows possibilities, and advances the guess', () => {
    const { result } = renderHook(() => useMastermindSolver())

    act(() => {
      expect(result.current.submitFeedback({ black: 0, white: 0 })).toBeUndefined()
    })

    expect(result.current.possibleCount).toBe(256)
    expect(result.current.guesses).toEqual([{ code: [1, 1, 2, 2], feedback: { black: 0, white: 0 } }])
    expect(result.current.currentGuess).not.toEqual([1, 1, 2, 2])
  })

  it('rejects excessive and inconsistent feedback without changing state', () => {
    const { result } = renderHook(() => useMastermindSolver())

    act(() => {
      expect(result.current.submitFeedback({ black: 4, white: 1 })).toEqual({
        error: 'Sum of black+white cannot exceed 4.'
      })
      expect(result.current.submitFeedback({ black: 3, white: 1 })).toEqual({
        error: 'Inconsistent feedback – no codes remain.'
      })
    })

    expect(result.current.possibleCount).toBe(1296)
    expect(result.current.guesses).toEqual([])
    expect(result.current.finished).toBe(false)
  })

  it('finishes when feedback confirms the current guess', () => {
    const { result } = renderHook(() => useMastermindSolver())

    act(() => {
      result.current.submitFeedback({ black: 4, white: 0 })
    })

    expect(result.current.finished).toBe(true)
    expect(result.current.currentGuess).toEqual([1, 1, 2, 2])
    expect(result.current.guesses).toHaveLength(1)
  })

  it('finishes with the sole remaining solution', () => {
    const { result } = renderHook(() => useMastermindSolver())

    act(() => {
      result.current.submitFeedback({ black: 0, white: 4 })
    })

    expect(result.current.finished).toBe(true)
    expect(result.current.possibleCount).toBe(1)
    expect(result.current.currentGuess).toEqual([2, 2, 1, 1])
  })

  it('finishes when the configured maximum attempt count is reached', () => {
    const { result } = renderHook(() => useMastermindSolver([1, 1, 2, 2], 1))

    act(() => {
      result.current.submitFeedback({ black: 0, white: 0 })
    })

    expect(result.current.finished).toBe(true)
    expect(result.current.guesses).toHaveLength(1)
  })

  it('resets the complete solver state', () => {
    const { result } = renderHook(() => useMastermindSolver())

    act(() => {
      result.current.submitFeedback({ black: 0, white: 0 })
    })
    act(() => {
      result.current.reset()
    })

    expect(result.current.currentGuess).toEqual([1, 1, 2, 2])
    expect(result.current.possibleCount).toBe(1296)
    expect(result.current.guesses).toEqual([])
    expect(result.current.finished).toBe(false)
  })
})
