import { useMemo, useState } from 'react'
import type { Color, FeedbackType } from '../types/types.ts'

/**
 * Generates and returns all possible combinations of codes, where each code is an array of four `Color` values.
 * The method iterates through all possible values of `Color` (1 to 6) to construct all combinations.
 *
 * @return {Color[][]} A two-dimensional array containing all possible combinations of codes, where each inner array represents a code made up of four `Color` values.
 */
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

/**
 * Calculates feedback for a guess compared to a secret combination, indicating the number of exact matches (black pegs)
 * and the number of correct colors in wrong positions (white pegs).
 *
 * @param {Color[]} secret - The array representing the secret combination of colors.
 * @param {Color[]} guess - The array representing the guessed combination of colors.
 * @return {FeedbackType} An object containing the count of black pegs and white pegs.
 */
export const getFeedback = (secret: Color[], guess: Color[]): FeedbackType => {
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

  for (const c in guessCounts) {
    const color = Number(c) as Color
    if (secretCounts[color]) {
      white += Math.min(guessCounts[color], secretCounts[color])
    }
  }

  return { black, white }
}

/**
 * Determines the next guess for the code-breaking game by evaluating all possible codes
 * against the set of remaining possible solutions. Uses a scoring strategy to minimize the
 * size of the largest feedback bucket in the worst case, ensuring an optimized guessing strategy.
 *
 * @param {Color[][]} possible - Array of remaining possible secret codes based on previous guesses and feedback.
 * @param {Color[][]} allCodes - Array of all potential codes that can be used as guesses.
 * @returns {Color[]} - The chosen code to use as the next guess.
 */
export const selectNextGuess = (possible: Color[][], allCodes: Color[][]): Color[] => {
  // 1) compute the “score” = size of the largest feedback bucket
  const scoreMap = new Map<Color[], number>()
  let minWorst = Infinity

  for (const candidate of allCodes) {
    // partition counts
    const buckets = new Map<string, number>()
    for (const secret of possible) {
      const fb = getFeedback(secret, candidate)
      const key = `${String(fb.black)}_${String(fb.white)}`
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
    const worst = Math.max(...buckets.values())
    scoreMap.set(candidate, worst)
    if (worst < minWorst) minWorst = worst
  }

  // 2) collect all candidates that achieve minWorst
  const bests = allCodes.filter((c) => scoreMap.get(c) === minWorst)

  // 3) prefer one in `possible`
  const inPossible = bests.find((c) => possible.some((p) => p.every((v, i) => v === c[i])))

  return inPossible ?? bests[0]
}

/**
 * Custom React hook that implements a Mastermind solver.
 * This hook provides the logic to iteratively guess and refine possible solutions
 * to a Mastermind game based on feedback provided after each guess.
 *
 * @param {Color[]} [initialGuess=[1, 1, 2, 2]] - The initial guess of the solver. Defaults to `[1, 1, 2, 2]`.
 * @param {number} [maxAttempts=10] - The maximum number of guesses or attempts allowed for the solver. Defaults to `10`.
 * @returns {SolverHook} An object containing solver state, the current guess, and functions to interact with the solver:
 * - `currentGuess`: The current code guess by the solver.
 * - `possibleCount`: The number of possible solutions remaining.
 * - `guesses`: A list of previous guesses along with their corresponding feedback.
 * - `finished`: A boolean indicating if the solver is finished due to solving the code or exceeding attempts.
 * - `reset`: A function to reset the solver to its initial state.
 * - `submitFeedback`: A function to submit feedback on the last guess and determine the next guess.
 */
const useMastermindSolver = (initialGuess: Color[] = [1, 1, 2, 2], maxAttempts = 10): SolverHook => {
  const allCodes = useMemo(() => generateAllCodes(), [])

  const [possible, setPossible] = useState<Color[][]>(allCodes)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState<Color[]>(initialGuess)
  const [finished, setFinished] = useState(false)

  /**
   * Resets the state of the application to its initial values.
   *
   * This function performs the following operations:
   * - Resets the pool of possible codes to the full set of available codes.
   * - Clears all previous guesses by setting the guesses array to empty.
   * - Reinitializes the current guess to the initial default guess.
   * - Sets the game status as not finished by marking it as false.
   */
  const reset = () => {
    setPossible(allCodes)
    setGuesses([])
    setCurrentGuess(initialGuess)
    setFinished(false)
  }

  /**
   * Submits the feedback for the current guess in a code-guessing game and processes the game state accordingly.
   *
   * @function
   * @param {Object} feedback - The feedback object containing the results of the current guess.
   * @param {number} feedback.black - The number of pegs in the guess that are correct in both color and position.
   * @param {number} feedback.white - The number of pegs in the guess that are correct in color but not position.
   * @returns {Object} An object representing the result of the feedback submission. May include an error message.
   *
   * @throws {Error} If the sum of black and white exceeds the allowed count of 4.
   * @throws {Error} If the provided feedback is inconsistent with the remaining possible codes.
   *
   * @description
   * 1. Validates the sum of black and white feedback pegs. If the sum exceeds 4, returns an error.
   * 2. Filters the possible solutions based on the feedback provided, ensuring it aligns with the current guess.
   * 3. If no valid possibilities remain after filtering, returns an inconsistency error.
   * 4. Updates the list of recorded guesses with the current guess and feedback.
   * 5. Checks if the game is finished due to a win (all 4 black pegs) or exhausting the maximum attempts, and if so, marks the game as finished.
   * 6. Updates the set of possible solutions. If only one remains, selects it as the next guess and ends the game.
   * 7. If multiple possibilities remain, calculates the next guess using a minimax strategy and updates the current guess.
   */
  const submitFeedback = ({ black, white }: FeedbackType): { error?: string } => {
    if (black + white > 4) {
      return { error: 'Sum of black+white cannot exceed 4.' }
    }

    /**
     * A filtered two-dimensional array of Color, representing all possible
     * guesses that yield the same feedback as the current guess.
     *
     * The variable filters through a list of possible codes and applies the feedback
     * logic to determine which codes would provide identical feedback (in terms of the
     * number of black and white pegs) when compared with the current guess.
     *
     * @type {Color[][]}
     */
    const nextPossible: Color[][] = possible.filter((code) => {
      const trial: FeedbackType = getFeedback(code, currentGuess)
      return trial.black === black && trial.white === white
    })


    if (nextPossible.length === 0) {
      return { error: 'Inconsistent feedback – no codes remain.' }
    }

    /**
     * Represents the updated list of guesses in a guessing game.
     *
     * The `newGuesses` variable is an array containing all previous guesses
     * along with the current guess and its feedback. Each guess object in the
     * array includes:
     * - `code`: The current guess input by the user or system.
     * - `feedback`: An object representing feedback on the guess, where:
     *   - `black`: Number of correct guesses in the correct position.
     *   - `white`: Number of correct guesses in the wrong position.
     *
     * This variable is typically used to track the progress of guesses and
     * feedback provided to the player.
     *
     * @type {Guess[]} An array of guess objects containing the code and feedback.
     */
    const newGuesses: Guess[] = [...guesses, { code: currentGuess, feedback: { black, white } }]
    setGuesses(newGuesses)

    // Check for win or exhaustion
    if (black === 4 || newGuesses.length >= maxAttempts) {
      setFinished(true)
      return {}
    }

    // Narrow possibilities
    setPossible(nextPossible)
    if (nextPossible.length === 1) {
      setCurrentGuess(nextPossible[0])
      setFinished(true)
      return {}
    }

    // Pick next via minimax
    const next: Color[] = selectNextGuess(nextPossible, allCodes)
    setCurrentGuess(next)
    return {}
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

interface Guess {
  code: Color[]
  feedback: FeedbackType
}

export interface SolverHook {
  currentGuess: Color[]
  possibleCount: number
  guesses: Guess[]
  finished: boolean
  reset: () => void
  submitFeedback: (fb: FeedbackType) => { error?: string }
}

export default useMastermindSolver
