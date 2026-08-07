import type { Board, Config } from './types.ts'

export const makeRectConfig = (rows: number, cols: number): Config => ({
  rows,
  cols,
  mask: Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[]),
  wrap: false
})

export const makeCircular4x4Config = (): Config => ({
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

const findPivot = (matrix: boolean[][], column: number, startRow: number): number => {
  for (let row = startRow; row < matrix.length; row++) {
    if (matrix[row][column]) return row
  }

  return -1
}

const swapRows = (matrix: boolean[][], first: number, second: number): void => {
  ;[matrix[first], matrix[second]] = [matrix[second], matrix[first]]
}

const eliminateColumn = (matrix: boolean[][], pivotRow: number, column: number): void => {
  const size = matrix.length

  for (let row = 0; row < size; row++) {
    if (row !== pivotRow && matrix[row][column]) {
      for (let cell = column; cell < size + 1; cell++) {
        matrix[row][cell] = matrix[row][cell] !== matrix[pivotRow][cell]
      }
    }
  }
}

export const forwardEliminate = (matrix: boolean[][]): number[] => {
  const size = matrix.length
  const pivots: number[] = []
  let row = 0

  for (let column = 0; column < size && row < size; column++) {
    const selected = findPivot(matrix, column, row)
    if (selected < 0) continue

    swapRows(matrix, row, selected)
    pivots.push(column)
    eliminateColumn(matrix, row, column)
    row++
  }

  return pivots
}

export const backSubstitute = (matrix: boolean[][], pivots: number[]): boolean[] => {
  const size = matrix.length
  const solution = Array(size).fill(false) as boolean[]

  for (let pivot = pivots.length - 1; pivot >= 0; pivot--) {
    const column = pivots[pivot]
    let sum = false

    for (let cell = column + 1; cell < size; cell++) {
      if (matrix[pivot][cell] && solution[cell]) sum = !sum
    }

    solution[column] = matrix[pivot][size] !== sum
  }

  return solution
}

export const initBoard = (config: Config): Board =>
  Array.from({ length: config.rows }, () => Array(config.cols).fill(0) as number[])

export const applyPlusToggle = (board: Board, config: Config, row: number, column: number): void => {
  const offsets: readonly [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]

  for (const [rowOffset, columnOffset] of offsets) {
    const nextRow = row + rowOffset
    const nextColumn = column + columnOffset

    if (
      nextRow >= 0 &&
      nextRow < config.rows &&
      nextColumn >= 0 &&
      nextColumn < config.cols &&
      config.mask[nextRow][nextColumn]
    ) {
      board[nextRow][nextColumn] ^= 1
    }
  }
}

export const getRingPositions = (config: Config): [number, number][] => {
  const ring: [number, number][] = []

  for (let column = 0; column < config.cols; column++) {
    if (config.mask[0][column]) ring.push([0, column])
  }

  for (let row = 1; row < config.rows; row++) {
    if (config.mask[row][config.cols - 1]) ring.push([row, config.cols - 1])
  }

  for (let column = config.cols - 2; column >= 0; column--) {
    if (config.mask[config.rows - 1][column]) ring.push([config.rows - 1, column])
  }

  for (let row = config.rows - 2; row >= 1; row--) {
    if (config.mask[row][0]) ring.push([row, 0])
  }

  return ring
}

export const applyWrapToggle = (
  board: Board,
  mask: boolean[][],
  row: number,
  column: number,
  ring: [number, number][]
): void => {
  const index = ring.findIndex(([ringRow, ringColumn]) => ringRow === row && ringColumn === column)
  if (index < 0) return

  const ringLength = ring.length
  for (const ringIndex of [index, (index - 1 + ringLength) % ringLength, (index + 1) % ringLength]) {
    const [nextRow, nextColumn] = ring[ringIndex]
    if (mask[nextRow][nextColumn]) board[nextRow][nextColumn] ^= 1
  }
}

const buildWrapNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
  const ring = getRingPositions(config)
  const lists: number[][] = Array.from({ length: ring.length }, () => [])

  ring.forEach(([row, column], ringIndex) => {
    const current = indexOf[row][column]
    const [previousRow, previousColumn] = ring[(ringIndex - 1 + ring.length) % ring.length]
    const [nextRow, nextColumn] = ring[(ringIndex + 1) % ring.length]
    lists[current] = [current, indexOf[previousRow][previousColumn], indexOf[nextRow][nextColumn]]
  })

  return lists
}

export const buildNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
  if (config.wrap) return buildWrapNeighborLists(config, indexOf)

  const offsets: readonly [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]
  const presentCells = indexOf.flat().filter((index) => index >= 0).length
  const lists: number[][] = Array.from({ length: presentCells }, () => [])

  for (let row = 0; row < config.rows; row++) {
    for (let column = 0; column < config.cols; column++) {
      const current = indexOf[row][column]
      if (current < 0) continue

      for (const [rowOffset, columnOffset] of offsets) {
        const nextRow = row + rowOffset
        const nextColumn = column + columnOffset

        if (
          nextRow >= 0 &&
          nextRow < config.rows &&
          nextColumn >= 0 &&
          nextColumn < config.cols &&
          config.mask[nextRow][nextColumn]
        ) {
          lists[current].push(indexOf[nextRow][nextColumn])
        }
      }
    }
  }

  return lists
}

export const buildRhs = (board: Board, indexOf: number[][]): boolean[] => {
  const rhs: boolean[] = []

  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[0].length; column++) {
      const index = indexOf[row][column]
      if (index >= 0) rhs[index] = board[row][column] === 0
    }
  }

  return rhs
}

export const buildAugmentedMatrix = (neighbors: number[][], rhs: boolean[]): boolean[][] => {
  const size = neighbors.length
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size + 1).fill(false) as boolean[])

  neighbors.forEach((neighborIndexes, index) => {
    neighborIndexes.forEach((neighbor) => (matrix[index][neighbor] = true))
    matrix[index][size] = rhs[index]
  })

  return matrix
}
