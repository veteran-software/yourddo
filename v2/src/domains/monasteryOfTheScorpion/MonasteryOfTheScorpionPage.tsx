import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Select,
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
import { applyPresses, initBoard, randomPresses, solveBoard, toggleCell } from './lightsOut/lightsOutSolver.ts'
import type { Board, Config, Presses } from './lightsOut/types.ts'

const ROWS = 4
const COLUMNS = 5

type EditAction = 'toggle' | 'remove'
type SolverStatus = 'idle' | 'random' | 'solution' | 'complete' | 'no-solution'

const createMask = (): boolean[][] => Array.from({ length: ROWS }, () => Array(COLUMNS).fill(true) as boolean[])

const countPresses = (presses: number[][]): number => presses.flat().filter((press) => press === 1).length

const MonasteryOfTheScorpionPage = () => {
  const [mask, setMask] = useState(createMask)
  const [board, setBoard] = useState<Board>(() => initBoard({ rows: ROWS, cols: COLUMNS, mask }))
  const [solution, setSolution] = useState<Presses>(null)
  const [markedSolution, setMarkedSolution] = useState<Presses>(null)
  const [editMode, setEditMode] = useState(true)
  const [editAction, setEditAction] = useState<EditAction>('toggle')
  const [showSolution, setShowSolution] = useState(false)
  const [solverStatus, setSolverStatus] = useState<SolverStatus>('idle')

  const config: Config = { rows: ROWS, cols: COLUMNS, mask }
  const recommendedPresses = solution && showSolution ? countPresses(solution) : 0

  const clearSolution = () => {
    setSolution(null)
    setMarkedSolution(null)
    setShowSolution(false)
    setSolverStatus('idle')
  }

  const resetForMask = (nextMask: boolean[][]) => {
    setMask(nextMask)
    setBoard(initBoard({ rows: ROWS, cols: COLUMNS, mask: nextMask }))
    clearSolution()
  }

  const handleSolve = () => {
    const { presses, marked } = solveBoard(board, config)

    setEditMode(false)
    setSolution(presses)
    setMarkedSolution(marked)
    setShowSolution(presses !== null)
    setSolverStatus(presses === null ? 'no-solution' : countPresses(presses) === 0 ? 'complete' : 'solution')
  }

  const handleRandom = () => {
    const presses = randomPresses(config)

    setBoard(applyPresses(initBoard(config), config, presses))
    setSolution(presses)
    setMarkedSolution(presses.map((row) => row.map(() => 0)))
    setEditMode(false)
    setShowSolution(false)
    setSolverStatus('random')
  }

  const handleClear = () => {
    resetForMask(createMask())
  }

  const handleEditCell = (row: number, column: number) => {
    if (!mask[row][column]) return

    if (editAction === 'toggle') {
      const nextBoard = board.map((boardRow) => boardRow.slice())
      nextBoard[row][column] = nextBoard[row][column] ? 0 : 1
      setBoard(nextBoard)
      clearSolution()
      return
    }

    const nextMask = mask.map((maskRow) => maskRow.slice())
    nextMask[row][column] = false
    resetForMask(nextMask)
  }

  const handlePlayCell = (row: number, column: number) => {
    if (solution && showSolution && solution[row][column] === 1 && markedSolution?.[row][column] === 0) {
      const nextMarked = markedSolution.map((markedRow) => markedRow.slice())
      nextMarked[row][column] = 1
      setMarkedSolution(nextMarked)

      const remaining = solution.some((solutionRow, solutionRowIndex) =>
        solutionRow.some((press, columnIndex) => press === 1 && nextMarked[solutionRowIndex][columnIndex] === 0)
      )
      if (!remaining) setSolverStatus('complete')
    }

    setBoard((currentBoard) => toggleCell(currentBoard, config, row, column))
  }

  const handleCellClick = (row: number, column: number) => {
    if (editMode) {
      handleEditCell(row, column)
    } else {
      handlePlayCell(row, column)
    }
  }

  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={2}>
            <Title order={1}>Monastery of the Scorpion</Title>
            <Text c='dimmed'>The Reaver&apos;s Reach</Text>
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
          In Edit mode, match the tiles and burned-out positions in game. Switch to Play to test moves, then solve to
          mark the recommended presses. Removed positions still affect present neighbors in Play mode.
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

          {editMode && (
            <Select
              label='Tile action'
              value={editAction}
              onChange={(value) => {
                if (value === 'toggle' || value === 'remove') setEditAction(value)
              }}
              data={[
                { value: 'toggle', label: 'Toggle On/Off' },
                { value: 'remove', label: 'Remove (Burn Out)' }
              ]}
              allowDeselect={false}
              maw={240}
            />
          )}

          <Box role='group' aria-label='Monastery 4 by 5 puzzle board'>
            <SimpleGrid cols={COLUMNS} spacing={0} w='100%' maw={320} mx='auto'>
              {Array.from({ length: ROWS }).flatMap((_, row) =>
                Array.from({ length: COLUMNS }).map((__, column) => {
                  const removed = !mask[row][column]
                  const on = board[row][column] === 1
                  const recommended = solution && showSolution ? solution[row][column] === 1 : false
                  const completed = markedSolution ? markedSolution[row][column] === 1 : false
                  const state = on ? 'on' : 'off'
                  const presence = removed ? 'removed' : 'present'
                  const recommendation = recommended
                    ? completed
                      ? 'recommended solution press completed'
                      : 'recommended solution press not completed'
                    : 'not a recommended solution press'
                  const label = `Row ${String(row + 1)}, column ${String(column + 1)}, ${state}, ${presence}, ${recommendation}`
                  const backgroundImage = removed ? emptyTileImage : on ? activeTileImage : inactiveTileImage

                  return (
                    <UnstyledButton
                      key={`${String(row)}-${String(column)}`}
                      type='button'
                      aria-label={label}
                      aria-pressed={on}
                      disabled={editMode && removed}
                      onClick={() => {
                        handleCellClick(row, column)
                      }}
                      w='100%'
                      opacity={removed ? 0.4 : 1}
                      style={{
                        aspectRatio: '1 / 1',
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        border: recommended
                          ? completed
                            ? '2px solid var(--mantine-color-yellow-6)'
                            : '4px solid var(--mantine-color-green-6)'
                          : '1px solid var(--mantine-color-default-border)',
                        position: 'relative'
                      }}
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
          This board and burned-out tile arrangement has no solution. Check the board in game and edit it again.
        </Alert>
      )}
    </ToolLayout>
  )
}

export default MonasteryOfTheScorpionPage
