import type { Board, Config } from './types.ts'

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

export const buildNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
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
