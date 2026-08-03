import {
  applyPlusToggle,
  backSubstitute,
  buildAugmentedMatrix,
  buildNeighborLists,
  buildRhs,
  forwardEliminate,
  initBoard
} from './helpers.ts'
import type { Board, Config, Presses } from './types.ts'

const solveInternal = (config: Config, indexOf: number[][], neighborLists: number[][], board: Board): Presses => {
  const rhs = buildRhs(board, indexOf)
  const matrix = buildAugmentedMatrix(neighborLists, rhs)
  const pivots = forwardEliminate(matrix)

  for (let row = pivots.length; row < matrix.length; row++) {
    if (!matrix[row].slice(0, matrix.length).some(Boolean) && matrix[row][matrix.length]) {
      return null
    }
  }

  const solution = backSubstitute(matrix, pivots)
  const presses = initBoard(config)

  for (let row = 0; row < config.rows; row++) {
    for (let column = 0; column < config.cols; column++) {
      const index = indexOf[row][column]
      if (index >= 0 && solution[index]) presses[row][column] = 1
    }
  }

  return presses
}

const randomFraction = (): number => {
  const bytes = new Uint32Array(1)
  globalThis.crypto.getRandomValues(bytes)
  return bytes[0] / 2 ** 32
}

const solve = (board: Board, config: Config): Presses => {
  const indexOf: number[][] = Array.from({ length: config.rows }, () => Array.from({ length: config.cols }, () => -1))
  let nextIndex = 0

  for (let row = 0; row < config.rows; row++) {
    for (let column = 0; column < config.cols; column++) {
      if (config.mask[row][column]) indexOf[row][column] = nextIndex++
    }
  }

  const neighborLists = buildNeighborLists(config, indexOf)

  return solveInternal(config, indexOf, neighborLists, board)
}

export const toggleCell = (board: Board, config: Config, row: number, column: number): Board => {
  const copy = board.map((boardRow) => boardRow.slice())
  applyPlusToggle(copy, config, row, column)
  return copy
}

export const randomPresses = (config: Config, chance = 0.5): number[][] => {
  const presses = initBoard(config)

  for (let row = 0; row < config.rows; row++) {
    for (let column = 0; column < config.cols; column++) {
      if (config.mask[row][column] && randomFraction() < chance) presses[row][column] = 1
    }
  }

  return presses
}

export const applyPresses = (board: Board, config: Config, presses: number[][]): Board => {
  let result = board

  for (let row = 0; row < presses.length; row++) {
    for (let column = 0; column < presses[row].length; column++) {
      if (presses[row][column] === 1) result = toggleCell(result, config, row, column)
    }
  }

  return result
}

export const solveBoard = (board: Board, config: Config): { presses: Presses; marked: Presses } => {
  const presses = solve(board, config)
  const marked = presses?.map((row) => row.map(() => 0)) ?? null
  return { presses, marked }
}

export { initBoard }
