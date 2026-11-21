import { useMemo, useState } from 'react'

export type Color = 1 | 2 | 3 | 4 | 5 | 6

export interface Feedback {
  black: number
  white: number
}

export interface Guess {
  code: Color[]
  feedback: Feedback
}

export interface MastermindSolver {
  currentGuess: Color[]
  possibleCount: number
  guesses: Guess[]
  finished: boolean
  reset: () => void
  submitFeedback: (feedback: Feedback) => { error?: string } | undefined
}

export const generateAllCodes = (): Color[][] => {
  const codes: Color[][] = []

  for (let a = 1 as Color; a <= 6; a = (a + 1) as Color) {
    for (let b = 1 as Color; b <= 6; b = (b + 1) as Color) {
      for (let c = 1 as Color; c <= 6; c = (c + 1) as Color) {
        for (let d = 1 as Color; d <= 6; d = (d + 1) as Color) {
          codes.push([a, b, c, d])
        }
      }
    }
  }

  return codes
}

export const getFeedback = (secret: Color[], guess: Color[]): Feedback => {
  let black = 0
  let white = 0
  const secretCounts: Record<Color, number> = {} as Record<Color, number>
  const guessCounts: Record<Color, number> = {} as Record<Color, number>

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      black++
    } else {
      secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1
      guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1
    }
  }

  for (const value in guessCounts) {
    const color = Number(value) as Color
    if (secretCounts[color]) white += Math.min(guessCounts[color], secretCounts[color])
  }

  return { black, white }
}

export const selectNextGuess = (possible: Color[][], allCodes: Color[][]): Color[] => {
  const scoreMap = new Map<Color[], number>()
  let minWorst = Infinity

  for (const candidate of allCodes) {
    const buckets = new Map<string, number>()
    for (const secret of possible) {
      const feedback = getFeedback(secret, candidate)
      const key = `${String(feedback.black)}_${String(feedback.white)}`
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    const worst = Math.max(...buckets.values())
    scoreMap.set(candidate, worst)
    if (worst < minWorst) minWorst = worst
  }

  const best = allCodes.filter((candidate) => scoreMap.get(candidate) === minWorst)
  const possibleBest = best.find((candidate) =>
    possible.some((code) => code.every((value, index) => value === candidate[index]))
  )

  return possibleBest ?? best[0]
}

const useMastermindSolver = (initialGuess: Color[] = [1, 1, 2, 2], maxAttempts = 10): MastermindSolver => {
  const allCodes = useMemo(() => generateAllCodes(), [])
  const [possible, setPossible] = useState(allCodes)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState(initialGuess)
  const [finished, setFinished] = useState(false)

  const reset = () => {
    setPossible(allCodes)
    setGuesses([])
    setCurrentGuess(initialGuess)
    setFinished(false)
  }

  const submitFeedback = ({ black, white }: Feedback): { error?: string } | undefined => {
    if (black + white > 4) return { error: 'Sum of black+white cannot exceed 4.' }

    const nextPossible = possible.filter((code) => {
      const trial = getFeedback(code, currentGuess)
      return trial.black === black && trial.white === white
    })

    if (nextPossible.length === 0) return { error: 'Inconsistent feedback – no codes remain.' }

    const nextGuesses = [...guesses, { code: currentGuess, feedback: { black, white } }]
    setGuesses(nextGuesses)

    if (black === 4 || nextGuesses.length >= maxAttempts) {
      setFinished(true)
      return undefined
    }

    setPossible(nextPossible)
    if (nextPossible.length === 1) {
      setCurrentGuess(nextPossible[0])
      setFinished(true)
      return undefined
    }

    setCurrentGuess(selectNextGuess(nextPossible, allCodes))
    return undefined
  }

  return {
    currentGuess,
    possibleCount: possible.length,
    guesses,
    finished,
    reset,
    submitFeedback
  }
}

export default useMastermindSolver
