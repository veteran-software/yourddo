import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton
} from '@mantine/core'
import { useState } from 'react'
import activeTileImage from '../../../../src/assets/tile_active.png'
import emptyTileImage from '../../../../src/assets/tile_empty.png'
import inactiveTileImage from '../../../../src/assets/tile_inactive.png'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import {
  applyPresses,
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

const countPresses = (presses: number[][]): number => presses.flat().filter((press) => press === 1).length

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
    setSolverStatus(presses === null ? 'no-solution' : countPresses(presses) === 0 ? 'complete' : 'solution')
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
      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={2}>
            <Title order={1}>Total Chaos</Title>
            <Text c='dimmed'>Keep on the Borderlands</Text>
          </Stack>
          <Anchor
            href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Puzzle%20Solvers%22'
            target='_blank'
            rel='noreferrer'
            size='sm'
          >
            Known issues / bug reports
          </Anchor>
        </Group>
        <Text>
          In Edit mode, match the active tiles in game. Switch to Play to test moves, then solve to mark the recommended
          presses. Empty positions are fixed and cannot be pressed.
        </Text>
      </Stack>

      <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
        <Stack gap='md'>
          <Group justify='space-between' align='center' wrap='wrap'>
            <Badge color={editMode ? 'yellow' : 'green'} variant='light' size='lg'>
              Mode: {editMode ? 'Edit' : 'Play'}
            </Badge>

            <Group gap='sm' wrap='wrap'>
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
                color={editMode ? 'green' : 'yellow'}
                variant='outline'
                onClick={() => {
                  setEditMode((currentMode) => !currentMode)
                }}
              >
                {editMode ? 'Switch to Play' : 'Switch to Edit'}
              </Button>
            </Group>
          </Group>

          <Box role='group' aria-label='Total Chaos 3 by 5 puzzle board'>
            <SimpleGrid cols={COLUMNS} spacing={0} w='100%' maw={328} mx='auto' p={4}>
              {Array.from({ length: ROWS }).flatMap((_, row) =>
                Array.from({ length: COLUMNS }).map((__, column) => {
                  const masked = !MASK[row][column]
                  const on = board[row][column] === 1
                  const recommended = solution && showSolution ? solution[row][column] === 1 : false
                  const completed = markedSolution ? markedSolution[row][column] === 1 : false
                  const backgroundImage = masked ? emptyTileImage : on ? activeTileImage : inactiveTileImage
                  const tileStyle = {
                    aspectRatio: '1 / 1',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    border: recommended
                      ? completed
                        ? '2px solid var(--mantine-color-yellow-6)'
                        : '4px solid var(--mantine-color-green-6)'
                      : '1px solid var(--mantine-color-default-border)',
                    position: 'relative' as const
                  }

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
                  const recommendation = recommended
                    ? completed
                      ? 'recommended solution press completed'
                      : 'recommended solution press not completed'
                    : 'not a recommended solution press'

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
                      {recommended && (
                        <Box
                          component='span'
                          aria-hidden='true'
                          pos='absolute'
                          top={4}
                          right={4}
                          w={20}
                          h={20}
                          bg={completed ? 'yellow.6' : 'green.6'}
                          c='black'
                          fw={700}
                          fz='sm'
                          style={{ borderRadius: '50%', display: 'grid', placeItems: 'center' }}
                        >
                          {completed ? '✓' : '!'}
                        </Box>
                      )}
                    </UnstyledButton>
                  )
                })
              )}
            </SimpleGrid>
          </Box>
        </Stack>
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
