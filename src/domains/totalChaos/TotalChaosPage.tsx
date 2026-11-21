import { Alert, Anchor, Badge, Box, Button, Paper, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconAtom } from '@tabler/icons-react'
import { useState } from 'react'
import { PressMarker } from '../../shared/lightsOut/PressMarker'
import { getTileAppearance } from '../../shared/lightsOut/tileAppearance'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import styles from '../../shared/layout/workspace.module.css'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import {
  applyPresses,
  countPresses,
  solutionStatus,
  initBoard,
  randomPresses,
  solveBoard,
  toggleCell
} from '../../shared/lightsOut/lightsOutSolver.ts'
import type { Board, Config, Presses } from '../../shared/lightsOut/types.ts'

const ROWS = 3
const COLUMNS = 5
const MASK = [
  [true, false, true, false, true],
  [true, false, true, false, true],
  [true, true, true, true, true]
]
const CONFIG: Config = { rows: ROWS, cols: COLUMNS, mask: MASK }

type SolverStatus = 'idle' | 'random' | 'solution' | 'complete' | 'no-solution'

const TotalChaosPage = () => {
  const [board, setBoard] = useState<Board>(() => initBoard(CONFIG))
  const [solution, setSolution] = useState<Presses>(null)
  const [markedSolution, setMarkedSolution] = useState<Presses>(null)
  const [editMode, setEditMode] = useState(true)
  const [showSolution, setShowSolution] = useState(false)
  const [solverStatus, setSolverStatus] = useState<SolverStatus>('idle')

  const recommendedPresses = solution && showSolution ? countPresses(solution) : 0

  const clearSolution = () => {
    setSolution(null)
    setMarkedSolution(null)
    setShowSolution(false)
    setSolverStatus('idle')
  }

  const handleRandom = () => {
    const presses = randomPresses(CONFIG)

    setBoard(applyPresses(initBoard(CONFIG), CONFIG, presses))
    setSolution(presses)
    setMarkedSolution(presses.map((row) => row.map(() => 0)))
    setEditMode(false)
    setShowSolution(false)
    setSolverStatus('random')
  }

  const handleSolve = () => {
    const { presses, marked } = solveBoard(board, CONFIG)

    setEditMode(false)
    setSolution(presses)
    setMarkedSolution(marked)
    setShowSolution(presses !== null)
    setSolverStatus(solutionStatus(presses))
  }

  const handleClear = () => {
    setBoard(initBoard(CONFIG))
    clearSolution()
    setEditMode(true)
  }

  const handleCellClick = (row: number, column: number) => {
    if (!MASK[row][column]) return

    if (editMode) {
      const nextBoard = board.map((boardRow) => boardRow.slice())
      nextBoard[row][column] = nextBoard[row][column] ? 0 : 1
      setBoard(nextBoard)
      clearSolution()
      return
    }

    if (solution && showSolution && solution[row][column] === 1 && markedSolution?.[row][column] === 0) {
      const nextMarked = markedSolution.map((markedRow) => markedRow.slice())
      nextMarked[row][column] = 1
      setMarkedSolution(nextMarked)

      const remaining = solution.some((solutionRow, solutionRowIndex) =>
        solutionRow.some((press, columnIndex) => press === 1 && nextMarked[solutionRowIndex][columnIndex] === 0)
      )
      if (!remaining) setSolverStatus('complete')
    }

    setBoard((currentBoard) => toggleCell(currentBoard, CONFIG, row, column))
  }

  return (
    <ToolLayout>
      <WorkspaceHeader
        title='Total Chaos'
        icon={IconAtom}
        description='Keep on the Borderlands'
        actions={
          <Anchor
            href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Puzzle%20Solvers%22'
            target='_blank'
            rel='noreferrer'
            size='sm'
          >
            Known issues / bug reports
          </Anchor>
        }
      />

      <Paper withBorder className={styles.puzzle}>
        <Stack className={styles.puzzleControls} gap='sm'>
          <Badge color={editMode ? 'yellow' : 'green'} variant='light' size='lg'>
            Mode: {editMode ? 'Edit' : 'Play'}
          </Badge>

          <Text size='sm'>
            In Edit mode, match the active tiles in game. Switch to Play to test moves, then solve to mark the
            recommended presses. Empty positions are fixed and cannot be pressed.
          </Text>
          <SimpleGrid cols={2} spacing='xs'>
            <Button variant='light' onClick={handleRandom}>
              Random
            </Button>
            <Button onClick={handleSolve} disabled={editMode}>
              Solve
            </Button>
            <Button variant='default' onClick={handleClear}>
              Clear
            </Button>
            <Button
              variant='default'
              onClick={() => {
                setEditMode((currentMode) => !currentMode)
              }}
            >
              {editMode ? 'Switch to Play' : 'Switch to Edit'}
            </Button>
          </SimpleGrid>
        </Stack>
        <Box className={styles.board} role='group' aria-label='Total Chaos 3 by 5 puzzle board'>
          <SimpleGrid
            cols={COLUMNS}
            spacing={0}
            w='100%'
            maw={`calc(${String(COLUMNS)} * var(--puzzle-tile-size) + 0.5rem)`}
            mx='auto'
            p={4}
          >
            {Array.from({ length: ROWS }).flatMap((_, row) =>
              Array.from({ length: COLUMNS }).map((__, column) => {
                const masked = !MASK[row][column]
                const on = board[row][column] === 1
                const recommended = solution && showSolution ? solution[row][column] === 1 : false
                const completed = markedSolution ? markedSolution[row][column] === 1 : false
                const { recommendation, tileStyle } = getTileAppearance(masked, on, recommended, completed)

                if (masked) {
                  return (
                    <Box
                      key={`${String(row)}-${String(column)}`}
                      role='img'
                      aria-label={`Row ${String(row + 1)}, column ${String(column + 1)}, masked position`}
                      w='100%'
                      style={tileStyle}
                    />
                  )
                }

                const state = on ? 'on' : 'off'

                return (
                  <UnstyledButton
                    key={`${String(row)}-${String(column)}`}
                    type='button'
                    aria-label={`Row ${String(row + 1)}, column ${String(column + 1)}, ${state}, ${recommendation}`}
                    aria-pressed={on}
                    onClick={() => {
                      handleCellClick(row, column)
                    }}
                    w='100%'
                    style={tileStyle}
                  >
                    {recommended && <PressMarker completed={completed} />}
                  </UnstyledButton>
                )
              })
            )}
          </SimpleGrid>
        </Box>
      </Paper>

      {solverStatus === 'random' && (
        <Alert color='blue' title='Random puzzle generated' role='status' aria-live='polite'>
          The board is ready in Play mode. Choose Solve when you want recommended presses.
        </Alert>
      )}
      {solverStatus === 'solution' && (
        <Alert color='blue' title='Solution generated' role='status' aria-live='polite'>
          {recommendedPresses} recommended {recommendedPresses === 1 ? 'press is' : 'presses are'} marked on the board.
        </Alert>
      )}
      {solverStatus === 'complete' && (
        <Alert color='green' title='Recommended presses completed' role='status' aria-live='polite'>
          All recommended solution presses have been completed.
        </Alert>
      )}
      {solverStatus === 'no-solution' && (
        <Alert color='red' title='No solution exists' role='alert'>
          This board has no solution. Check the active tiles in game and edit it again.
        </Alert>
      )}
    </ToolLayout>
  )
}

export default TotalChaosPage
