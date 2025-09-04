import { useLayoutEffect, useState } from 'react'
import type { Board, Config, Presses } from '../types/types'

const usePuzzleState = (config: Config, initBoard: (cfg: Config) => Board) => {
  const [board, setBoard] = useState<Board>(() => initBoard(config))
  const [solution, setSolution] = useState<Presses>(null)
  const [markedSolution, setMarkedSolution] = useState<Presses>(null)
  const [editMode, setEditMode] = useState<boolean>(true)
  const [showSolution, setShowSolution] = useState<boolean>(false)

  useLayoutEffect(() => {
    setBoard(initBoard(config))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(true)
    setShowSolution(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initBoard])

  return {
    board,
    setBoard,
    solution,
    setSolution,
    markedSolution,
    setMarkedSolution,
    editMode,
    setEditMode,
    showSolution,
    setShowSolution
  }
}

export default usePuzzleState
