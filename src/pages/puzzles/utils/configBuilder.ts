// Configuration helpers
import type { Config } from '../types/types.ts'

export const makeRectConfig = (rows: number, cols: number): Config => ({
  rows,
  cols,
  mask: Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[]),
  wrap: false
})

export const makeCircular4x4Config = (): Config => {
  const rows = 4
  const cols = 4
  const mask = Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[])
  // remove corners
  mask[0][0] = mask[0][3] = mask[3][0] = mask[3][3] = false
  // remove center 2x2
  mask[1][1] = mask[1][2] = mask[2][1] = mask[2][2] = false
  return { rows, cols, mask, wrap: true } // <-- wrap turned on
}
