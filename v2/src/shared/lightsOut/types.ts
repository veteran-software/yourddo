export interface Config {
  rows: number
  cols: number
  mask: boolean[][]
}

export type Board = number[][]
export type Presses = number[][] | null
