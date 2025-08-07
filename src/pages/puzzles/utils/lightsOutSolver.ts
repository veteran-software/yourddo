import type { Board, Config, Presses } from '../types/types.ts'

interface Solver {
  solve: (board: Board) => Presses
}

/**
 * Perform in-place forward elimination on an N×(N+1) boolean matrix.
 * Returns the list of pivot column indices.
 */
const forwardEliminate = (A: boolean[][]): number[] => {
  const N = A.length
  const pivots: number[] = []
  let row = 0
  for (let col = 0; col < N && row < N; col++) {
    let sel = row
    while (sel < N && !A[sel][col]) sel++
    if (sel === N) {
      continue
    }

    // swap rows
    ;[A[row], A[sel]] = [A[sel], A[row]]
    pivots.push(col)

    // eliminate this column from all other rows
    for (let r = 0; r < N; r++) {
      if (r !== row && A[r][col]) {
        for (let c = col; c < N + 1; c++) {
          A[r][c] = A[r][c] !== A[row][c]
        }
      }
    }
    row++
  }

  return pivots
}

/**
 * Back-substitute RHS column of an N×(N+1) boolean matrix into an N-vector,
 * given its pivot columns (in elimination order).
 */
const backSubstitute = (A: boolean[][], pivots: number[]): boolean[] => {
  const N = A.length
  const x = Array(N).fill(false) as boolean[]
  // work backwards through the pivots
  for (let pivot: number = pivots.length - 1; pivot >= 0; pivot--) {
    const col: number = pivots[pivot]
    let sum = false

    // sum of known variables in this row
    for (let c = col + 1; c < N; c++) {
      if (A[pivot][c] && x[c]) sum = !sum
    }

    // RHS is at A[pivot][N]
    x[col] = A[pivot][N] !== sum
  }

  return x
}

export const getSolver = (config: Config): Solver => {
  const { rows, cols, mask, wrap } = config

  const indexOf: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1) as number[])
  let N = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mask[r][c]) {
        indexOf[r][c] = N++
      }
    }
  }

  const neighborLists: number[][] = Array.from({ length: N }, () => [])
  const DIRS = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ] as const

  if (wrap) {
    // collect the “ring” in clockwise order
    const ring: [number, number][] = []
    for (let c = 0; c < cols; c++) if (mask[0][c]) ring.push([0, c])
    for (let r = 1; r < rows; r++) if (mask[r][cols - 1]) ring.push([r, cols - 1])
    for (let c = cols - 2; c >= 0; c--) if (mask[rows - 1][c]) ring.push([rows - 1, c])
    for (let r = rows - 2; r >= 1; r--) if (mask[r][0]) ring.push([r, 0])

    // now wire up neighborLists by mapping coords → indexOf
    const L = ring.length
    for (let i = 0; i < L; i++) {
      const [r, c] = ring[i]
      const cur = indexOf[r][c]
      const [pr, pc] = ring[(i - 1 + L) % L]
      const [nr, nc] = ring[(i + 1) % L]
      const prev = indexOf[pr][pc]
      const next = indexOf[nr][nc]
      neighborLists[cur] = [cur, prev, next]
    }
  } else {
    // plus‐shape neighborhood
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = indexOf[r][c]
        if (i < 0) continue
        for (const [dr, dc] of DIRS) {
          const nr = r + dr,
            nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && mask[nr][nc]) {
            neighborLists[i].push(indexOf[nr][nc])
          }
        }
      }
    }
  }

  return {
    solve(board: Board): Presses {
      // a) build RHS b: true means “this cell is OFF and must be toggled to ON”
      const b = Array(N).fill(false)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = indexOf[r][c]
          if (idx >= 0 && board[r][c] === 0) b[idx] = true
        }
      }

      // b) fresh N×(N+1) augmented matrix
      const M: boolean[][] = Array.from({ length: N }, () => Array(N + 1).fill(false) as boolean[])
      for (let i = 0; i < N; i++) {
        for (const j of neighborLists[i]) {
          M[i][j] = true
        }

        M[i][N] = b[i]
      }

      // c) eliminate then back‐substitute
      const pivots = forwardEliminate(M)
      // no‐solution check
      for (let r0 = pivots.length; r0 < N; r0++) {
        if (!M[r0].slice(0, N).some(Boolean) && M[r0][N]) return null
      }
      const x = backSubstitute(M, pivots)

      const out: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0) as number[])
      for (let r2 = 0; r2 < rows; r2++) {
        for (let c2 = 0; c2 < cols; c2++) {
          const idx = indexOf[r2][c2]
          if (idx >= 0 && x[idx]) out[r2][c2] = 1
        }
      }
      return out
    }
  }
}
