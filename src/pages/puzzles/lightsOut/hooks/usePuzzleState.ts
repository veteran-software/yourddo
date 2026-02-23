import { useCallback, useLayoutEffect, useState } from 'react'
import type { Board, Config, Presses } from '../types/types'

const usePuzzleState = (
  config: Config,
  initBoard: (cfg: Config) => Board,
  toggleCell: (board: Board, config: Config, r: number, c: number) => Board
) => {
  const [board, setBoard] = useState<Board>(() => initBoard(config))
  const [solution, setSolution] = useState<Presses>(null)
  const [markedSolution, setMarkedSolution] = useState<Presses>(null)
  const [editMode, setEditMode] = useState<boolean>(true)
  const [showSolution, setShowSolution] = useState<boolean>(false)

  const { mask } = config

  useLayoutEffect(() => {
    setBoard(initBoard(config))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(true)
    setShowSolution(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initBoard])

  const handleCellClick = useCallback(
    (r: number, c: number): void => {
      if (!mask[r][c]) return

      if (editMode) {
        // edit mode: flip only this tile
        const copy = board.map((row) => row.slice())
        copy[r][c] = copy[r][c] ? 0 : 1
        setBoard(copy)
        setSolution(null)
        setMarkedSolution(null)
        setShowSolution(false)
      } else {
        if (solution && showSolution && solution[r][c] === 1 && markedSolution?.[r][c] === 0) {
          const m2: number[][] = markedSolution.map((row: number[]) => row.slice())
          m2[r][c] = 1
          setMarkedSolution(m2)
        }
        setBoard((prev) => toggleCell(prev, config, r, c))
      }
    },
    [mask, editMode, board, solution, showSolution, markedSolution, toggleCell, config]
  )

  const toggleMarked = useCallback(
    (isMarked: boolean): string => (isMarked ? 'border' : 'border border-4 border-success'),
    []
  )

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
    setShowSolution,
    handleCellClick,
    toggleMarked
  }
}

export default usePuzzleState
