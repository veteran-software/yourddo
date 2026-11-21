export type Color = 1 | 2 | 3 | 4 | 5 | 6

export interface FeedbackType {
  black: number
  white: number
}

// map numeric codes to CSS color names (or hex)
export const COLOR_MAP: Record<Color, string> = {
  1: 'blue',
  2: 'green',
  3: 'orange',
  4: 'pink',
  5: 'red',
  6: 'yellow'
}
