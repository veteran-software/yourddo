import { describe, expect, it, vi } from 'vitest'
import { getRingPositions } from './helpers.ts'
import {
  applyPresses,
  initBoard,
  makeCircular4x4Config,
  makeRectConfig,
  randomPresses,
  solveBoard,
  toggleCell
} from './lightsOutSolver.ts'
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

const circularConfig = makeCircular4x4Config()

describe('Lights Out solver', () => {
  it('creates rectangular configurations with every tile present and plus topology', () => {
    expect(makeRectConfig(3, 4)).toEqual({
      rows: 3,
      cols: 4,
      mask: Array.from({ length: 3 }, () => [true, true, true, true]),
      wrap: false
    })
  })

  it('creates the exact circular 4 by 4 configuration and legacy ring order', () => {
    expect(circularConfig).toEqual({
      rows: 4,
      cols: 4,
      mask: [
        [false, true, true, false],
        [true, false, false, true],
        [true, false, false, true],
        [false, true, true, false]
      ],
      wrap: true
    })
    expect(getRingPositions(circularConfig)).toEqual([
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 2],
      [3, 1],
      [2, 0],
      [1, 0]
    ])
  })

  it('toggles the previous, current, and next positions for a middle ring tile', () => {
    expect(toggleCell(initBoard(circularConfig), circularConfig, 2, 3)).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 0, 1],
      [0, 0, 1, 0]
    ])
  })

  it('wraps the first ring position to the final ring position', () => {
    expect(toggleCell(initBoard(circularConfig), circularConfig, 0, 1)).toEqual([
      [0, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ])
  })

  it('wraps the final ring position to the first ring position', () => {
    expect(toggleCell(initBoard(circularConfig), circularConfig, 1, 0)).toEqual([
      [0, 1, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ])
  })

  it('applies multiple presses with circular ring behavior', () => {
    const presses = initBoard(circularConfig)
    presses[0][1] = 1
    presses[2][3] = 1

    expect(applyPresses(initBoard(circularConfig), circularConfig, presses)).toEqual([
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [0, 0, 0, 1],
      [0, 0, 1, 0]
    ])
  })

  it('generates random presses for circular ring positions only', () => {
    const random = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 0
      return array
    })

    expect(randomPresses(circularConfig)).toEqual(
      circularConfig.mask.map((row) => row.map((present) => (present ? 1 : 0)))
    )
    expect(random).toHaveBeenCalledTimes(8)
    random.mockRestore()
  })

  it('solves a representative circular board to every ring tile on', () => {
    const board = toggleCell(initBoard(circularConfig), circularConfig, 2, 3)
    const { presses } = solveBoard(board, circularConfig)

    expect(presses).not.toBeNull()
    expect(applyPresses(board, circularConfig, presses ?? [])).toEqual(
      circularConfig.mask.map((row) => row.map((present) => (present ? 1 : 0)))
    )
  })

  it('solves all 256 circular ring states', () => {
    const ring = getRingPositions(circularConfig)
    const expected = circularConfig.mask.map((row) => row.map((present) => (present ? 1 : 0)))

    for (let state = 0; state < 2 ** ring.length; state++) {
      const board = initBoard(circularConfig)
      ring.forEach(([row, column], index) => {
        board[row][column] = (state >> index) & 1
      })

      const { presses } = solveBoard(board, circularConfig)
      expect(presses).not.toBeNull()
      expect(applyPresses(board, circularConfig, presses ?? [])).toEqual(expected)
    }
  })

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
