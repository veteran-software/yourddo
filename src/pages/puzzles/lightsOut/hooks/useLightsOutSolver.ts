import type { Board, Config, Presses } from '../types/types.ts'
import {
  applyPlusToggle,
  applyWrapToggle,
  backSubstitute,
  buildAugmentedMatrix,
  buildNeighborLists,
  buildRHS,
  forwardEliminate,
  getRingPositions,
  initBoard,
  makeCircular4x4Config,
  makeRectConfig,
  makeShapeConfig
} from './utils/helpers.ts'

// Top‐level helper that does the core solve() work
const solveInternal = (
  config: Config,
  indexOf: number[][],
  neighborLists: number[][],
  board: Board
): number[][] | null => {
  // build and reduce the augmented matrix
  const b = buildRHS(board, indexOf)
  const M = buildAugmentedMatrix(neighborLists, b)
  const pivots = forwardEliminate(M)

  // no‐solution check
  for (let r0 = pivots.length; r0 < M.length; r0++) {
    if (!M[r0].slice(0, M.length).some(Boolean) && M[r0][M.length]) {
      return null
    }
  }

  // back-substitute & build output presses
  const x = backSubstitute(M, pivots)
  const out = initBoard(config)
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const idx = indexOf[r][c]
      if (idx >= 0 && x[idx]) out[r][c] = 1
    }
  }
  return out
}

const useLightsOutSolver = () => {
  const getSolver = (config: Config) => {
    const indexOf: number[][] = Array.from({ length: config.rows }, () => Array(config.cols).fill(-1) as number[])
    let counter = 0
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (config.mask[r][c]) {
          indexOf[r][c] = counter++
        }
      }
    }

    const neighborLists = buildNeighborLists(config, indexOf)

    return {
      solve(board: Board): Presses {
        return solveInternal(config, indexOf, neighborLists, board)
      }
    }
  }

  const toggleCell = (board: Board, config: Config, r: number, c: number): Board => {
    const copy = board.map((row) => row.slice())
    if (config.wrap) {
      const ring = getRingPositions(config)
      applyWrapToggle(copy, config.mask, r, c, ring)
    } else {
      applyPlusToggle(copy, config, r, c)
    }
    return copy
  }

  const randomPresses = (config: Config, chance = 0.5): number[][] => {
    const presses = initBoard(config)
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        // eslint-disable-next-line sonarjs/pseudo-random
        if (config.mask[r][c] && Math.random() < chance) {
          presses[r][c] = 1
        }
      }
    }
    return presses
  }

  const applyPresses = (board: Board, config: Config, presses: number[][]): Board => {
    let result = board
    for (let r = 0; r < presses.length; r++) {
      for (let c = 0; c < presses[r].length; c++) {
        if (presses[r][c] === 1) {
          result = toggleCell(result, config, r, c)
        }
      }
    }
    return result
  }

  const solveBoard = (board: Board, config: Config): { presses: Presses; marked: Presses } => {
    const solver = getSolver(config)
    const presses = solver.solve(board)
    const marked = presses?.map((row) => row.map(() => 0)) ?? null
    return { presses, marked }
  }

  return {
    initBoard,
    makeRectConfig,
    makeCircular4x4Config,
    makeShapeConfig,
    getSolver,
    toggleCell,
    randomPresses,
    applyPresses,
    solveBoard
  }
}

export default useLightsOutSolver
