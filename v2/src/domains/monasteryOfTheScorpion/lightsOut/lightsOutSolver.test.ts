import { describe, expect, it } from 'vitest'
import { applyPresses, initBoard, solveBoard, toggleCell } from './lightsOutSolver.ts'
import type { Config } from './types.ts'

const fullConfig: Config = {
  rows: 4,
  cols: 5,
  mask: Array.from({ length: 4 }, () => Array(5).fill(true) as boolean[])
}

describe('Monastery Lights Out solver', () => {
  it('initializes the legacy 4 by 5 board with every tile off', () => {
    expect(initBoard(fullConfig)).toEqual(Array.from({ length: 4 }, () => [0, 0, 0, 0, 0]))
  })

  it('applies the same plus toggle used by the legacy board', () => {
    expect(toggleCell(initBoard(fullConfig), fullConfig, 1, 2)).toEqual([
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ])
  })

  it('returns the exact legacy solution for the initial Monastery board', () => {
    expect(solveBoard(initBoard(fullConfig), fullConfig).presses).toEqual([
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0]
    ])
  })

  it('preserves the legacy removed-origin behavior', () => {
    const config: Config = {
      rows: 3,
      cols: 3,
      mask: [
        [true, true, true],
        [true, false, true],
        [true, true, true]
      ]
    }

    expect(toggleCell(initBoard(config), config, 1, 1)).toEqual([
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ])
  })

  it('solves representative boards to all present tiles on', () => {
    const startingBoard = toggleCell(
      Array.from({ length: 4 }, () => [1, 1, 1, 1, 1]),
      fullConfig,
      1,
      2
    )
    const { presses } = solveBoard(startingBoard, fullConfig)

    expect(presses).not.toBeNull()
    expect(applyPresses(startingBoard, fullConfig, presses ?? [])).toEqual(
      Array.from({ length: 4 }, () => [1, 1, 1, 1, 1])
    )
  })

  it('returns no solution for an inconsistent masked board', () => {
    const config: Config = {
      rows: 1,
      cols: 2,
      mask: [[true, true]]
    }

    expect(solveBoard([[0, 1]], config)).toEqual({ presses: null, marked: null })
  })
})
