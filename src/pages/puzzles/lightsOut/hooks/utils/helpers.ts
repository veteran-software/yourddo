import type { Board, Config } from '../../types/types.ts'

export const makeRectConfig = (rows: number, cols: number): Config => ({
  rows,
  cols,
  mask: Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[]),
  wrap: false
})

export const makeCircular4x4Config = (): Config => {
  const rows = 4
  const cols = 4
  const mask: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[])

  mask[0][0] = mask[0][3] = mask[3][0] = mask[3][3] = false
  mask[1][1] = mask[1][2] = mask[2][1] = mask[2][2] = false

  return { rows, cols, mask, wrap: true }
}

export const makeShapeConfig = (shape: string[], wrap = false): Config => {
  const rows: number = shape.length
  const cols: number = Math.max(...shape.map((r: string) => r.length))
  const mask: boolean[][] = shape.map((row: string) => {
    const chars: string[] = row.padEnd(cols, ' ').split('')
    return chars.map((ch: string) => ch === 'X')
  })

  return { rows, cols, mask, wrap }
}

/** LINEAR‐ALGEBRA HELPERS **/
// find the first row ≥ startRow with a true in column `col`
const findPivot = (A: boolean[][], col: number, startRow: number): number => {
  for (let r = startRow; r < A.length; r++) {
    if (A[r][col]) return r
  }
  return -1
}

// swap two rows of A in place
const swapRows = (A: boolean[][], r1: number, r2: number): void => {
  ;[A[r1], A[r2]] = [A[r2], A[r1]]
}

// eliminate all other rows’ entries in column `col`, using `pivotRow`
const eliminateColumn = (A: boolean[][], pivotRow: number, col: number): void => {
  const N = A.length
  for (let r = 0; r < N; r++) {
    if (r !== pivotRow && A[r][col]) {
      for (let c = col; c < N + 1; c++) {
        A[r][c] = A[r][c] !== A[pivotRow][c]
      }
    }
  }
}

export const forwardEliminate = (A: boolean[][]): number[] => {
  const N = A.length
  const pivots: number[] = []
  let row = 0

  for (let col = 0; col < N && row < N; col++) {
    const sel = findPivot(A, col, row)
    if (sel < 0) continue

    swapRows(A, row, sel)
    pivots.push(col)
    eliminateColumn(A, row, col)
    row++
  }

  return pivots
}

export const backSubstitute = (A: boolean[][], pivots: number[]): boolean[] => {
  const N = A.length
  const x = Array(N).fill(false) as boolean[]

  for (let p = pivots.length - 1; p >= 0; p--) {
    const col: number = pivots[p]
    let sum = false

    for (let c = col + 1; c < N; c++) {
      if (A[p][c] && x[c]) sum = !sum
    }

    x[col] = A[p][N] !== sum
  }

  return x
}

/** BOARD INITIALIZER **/
export const initBoard = (config: Config): Board => {
  return Array.from({ length: config.rows }, () => Array(config.cols).fill(0) as number[])
}

/** toggleCell HELPERS **/
export const getRingPositions = (config: Config): [number, number][] => {
  const { rows, cols, mask } = config

  const ring: [number, number][] = []
  for (let c = 0; c < cols; c++) if (mask[0][c]) ring.push([0, c])
  for (let r = 1; r < rows; r++) if (mask[r][cols - 1]) ring.push([r, cols - 1])
  for (let c = cols - 2; c >= 0; c--) if (mask[rows - 1][c]) ring.push([rows - 1, c])
  for (let r = rows - 2; r >= 1; r--) if (mask[r][0]) ring.push([r, 0])

  return ring
}

export const applyWrapToggle = (board: Board, mask: boolean[][], r: number, c: number, ring: [number, number][]) => {
  const idx: number = ring.findIndex(([rr, cc]) => rr === r && cc === c)
  if (idx < 0) return
  const L = ring.length
  for (const j of [idx, (idx - 1 + L) % L, (idx + 1) % L]) {
    const [nr, nc] = ring[j]
    if (mask[nr][nc]) board[nr][nc] ^= 1
  }
}

export const applyPlusToggle = (board: Board, config: Config, r: number, c: number) => {
  const { rows, cols, mask } = config
  const DIRS: [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]
  for (const [dr, dc] of DIRS) {
    const nr = r + dr,
      nc = c + dc
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && mask[nr][nc]) {
      board[nr][nc] ^= 1
    }
  }
}

/** SOLVER HELPERS **/

/** Build neighbor lists for wrap-around boards **/
const buildWrapNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
  const ring: [number, number][] = getRingPositions(config)
  const L = ring.length
  // we know N === ring.length in wrap mode
  const lists: number[][] = Array.from({ length: L }, () => [])

  ring.forEach(([r, c], i) => {
    const cur = indexOf[r][c]
    const [pr, pc] = ring[(i - 1 + L) % L]
    const [nr, nc] = ring[(i + 1) % L]
    lists[cur] = [cur, indexOf[pr][pc], indexOf[nr][nc]]
  })

  return lists
}

/** Build neighbor lists for standard plus-shape boards **/
const buildPlusNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
  const { rows, cols, mask } = config
  const DIRS: readonly [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]

  // count valid cells to size the array
  const N = indexOf.flat().filter((idx) => idx >= 0).length
  const lists: number[][] = Array.from({ length: N }, () => [])

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cur = indexOf[r][c]
      if (cur < 0) continue

      DIRS.forEach(([dr, dc]) => {
        const nr = r + dr,
          nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && mask[nr][nc]) {
          lists[cur].push(indexOf[nr][nc])
        }
      })
    }
  }

  return lists
}

export const buildNeighborLists = (config: Config, indexOf: number[][]): number[][] => {
  return config.wrap ? buildWrapNeighborLists(config, indexOf) : buildPlusNeighborLists(config, indexOf)
}

export const buildRHS = (board: Board, indexOf: number[][]): boolean[] => {
  const b: boolean[] = []
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const idx = indexOf[r][c]
      if (idx >= 0) b[idx] = board[r][c] === 0
    }
  }
  return b
}

export const buildAugmentedMatrix = (neighbors: number[][], b: boolean[]): boolean[][] => {
  const N = neighbors.length
  const M: boolean[][] = Array.from({ length: N }, () => Array(N + 1).fill(false) as boolean[])

  neighbors.forEach((nbrs: number[], idx: number) => {
    nbrs.forEach((j: number) => (M[idx][j] = true))
    M[idx][N] = b[idx]
  })

  return M
}
