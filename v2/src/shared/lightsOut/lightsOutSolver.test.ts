import { describe, expect, it } from 'vitest'
import { applyPresses, initBoard, solveBoard, toggleCell } from './lightsOutSolver.ts'
import type { Config } from './types.ts'

const monasteryConfig: Config = {
  rows: 4,
  cols: 5,
  mask: Array.from({ length: 4 }, () => Array(5).fill(true) as boolean[])
}

const totalChaosConfig: Config = {
  rows: 3,
  cols: 5,
  mask: [
    [true, false, true, false, true],
    [true, false, true, false, true],
    [true, true, true, true, true]
  ]
}

describe('Lights Out solver', () => {
  it('initializes both board configurations with every tile off', () => {
    expect(initBoard(monasteryConfig)).toEqual(Array.from({ length: 4 }, () => [0, 0, 0, 0, 0]))
    expect(initBoard(totalChaosConfig)).toEqual(Array.from({ length: 3 }, () => [0, 0, 0, 0, 0]))
  })

  it('applies the plus toggle used by both boards', () => {
    expect(toggleCell(initBoard(monasteryConfig), monasteryConfig, 1, 2)).toEqual([
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ])

    expect(toggleCell(initBoard(totalChaosConfig), totalChaosConfig, 1, 2)).toEqual([
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ])
  })

  it('returns the exact initial-board solution for both configurations', () => {
    expect(solveBoard(initBoard(monasteryConfig), monasteryConfig).presses).toEqual([
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0]
    ])

    expect(solveBoard(initBoard(totalChaosConfig), totalChaosConfig).presses).toEqual([
      [1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0]
    ])
  })

  it('solves every valid state of the fixed 3 by 5 mask', () => {
    const activeCells = totalChaosConfig.mask.flatMap((row, rowIndex) =>
      row.flatMap((present, columnIndex) => (present ? [[rowIndex, columnIndex] as const] : []))
    )

    for (let state = 0; state < 2 ** activeCells.length; state++) {
      const board = initBoard(totalChaosConfig)
      activeCells.forEach(([row, column], index) => {
        board[row][column] = (state >> index) & 1
      })

      const { presses } = solveBoard(board, totalChaosConfig)
      expect(presses).not.toBeNull()
      expect(applyPresses(board, totalChaosConfig, presses ?? [])).toEqual(
        totalChaosConfig.mask.map((row) => row.map((present) => (present ? 1 : 0)))
      )
    }
  })

  it('preserves the removed-origin solver behavior required by editable masks', () => {
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

  it.each([
    ['4 by 5 full mask', monasteryConfig],
    ['3 by 5 fixed mask', totalChaosConfig]
  ])('solves a representative %s board to all present tiles on', (_, config) => {
    const startingBoard = toggleCell(
      config.mask.map((row) => row.map((present) => (present ? 1 : 0))),
      config,
      1,
      2
    )
    const { presses } = solveBoard(startingBoard, config)
    const expected = config.mask.map((row) => row.map((present) => (present ? 1 : 0)))

    expect(presses).not.toBeNull()
    expect(applyPresses(startingBoard, config, presses ?? [])).toEqual(expected)
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
