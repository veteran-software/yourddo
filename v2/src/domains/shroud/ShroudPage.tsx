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
import {
  applyPresses,
  initBoard,
  makeCircular4x4Config,
  makeRectConfig,
  randomPresses,
  solveBoard,
  toggleCell
} from '../../shared/lightsOut/lightsOutSolver.ts'
import type { Board, Config, Presses } from '../../shared/lightsOut/types.ts'

const CONFIGURATIONS = {
  '3x3': makeRectConfig(3, 3),
  '4x4': makeRectConfig(4, 4),
  '5x5': makeRectConfig(5, 5),
  '6x6': makeRectConfig(6, 6),
  'Circular (4x4)': makeCircular4x4Config()
} as const satisfies Record<string, Config>

type ConfigName = keyof typeof CONFIGURATIONS
type SolverStatus = 'idle' | 'random' | 'solution' | 'complete' | 'no-solution'

const countPresses = (presses: number[][]): number => presses.flat().filter((press) => press === 1).length

const ShroudPage = () => {
  const [configName, setConfigName] = useState<ConfigName>('3x3')
  const config = CONFIGURATIONS[configName]
  const [board, setBoard] = useState<Board>(() => initBoard(CONFIGURATIONS['3x3']))
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

  const handleConfigChange = (nextConfigName: ConfigName) => {
    const nextConfig = CONFIGURATIONS[nextConfigName]

    setConfigName(nextConfigName)
    setBoard(initBoard(nextConfig))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(true)
    setShowSolution(false)
    setSolverStatus('idle')
  }

  const handleRandom = () => {
    const presses = randomPresses(config)

    setBoard(applyPresses(initBoard(config), config, presses))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(false)
    setShowSolution(false)
    setSolverStatus('random')
  }

  const handleSolve = () => {
    const { presses, marked } = solveBoard(board, config)

    setEditMode(false)
    setSolution(presses)
    setMarkedSolution(marked)
    setShowSolution(presses !== null)
    setSolverStatus(presses === null ? 'no-solution' : countPresses(presses) === 0 ? 'complete' : 'solution')
  }

  const handleClear = () => {
    setBoard(initBoard(config))
    clearSolution()
    setEditMode(true)
  }

  const handleEditCell = (row: number, column: number) => {
    setBoard((currentBoard) => {
      const nextBoard = currentBoard.map((boardRow) => boardRow.slice())
      nextBoard[row][column] = nextBoard[row][column] ? 0 : 1
      return nextBoard
    })
    clearSolution()
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
    if (!config.mask[row][column]) return

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
            <Title order={1}>The Shroud / The Codex and the Shroud</Title>
            <Text c='dimmed'>The Vale of Twilight</Text>
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
          In Edit mode, match the tiles shown in game. Switch to Play to test moves, then solve to mark recommended
          presses. Circular (4x4) connects its present tiles as a ring.
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

          <Select
            label='Board configuration'
            value={configName}
            onChange={(value) => {
              if (value && value in CONFIGURATIONS) handleConfigChange(value as ConfigName)
            }}
            data={Object.keys(CONFIGURATIONS)}
            allowDeselect={false}
            maw={240}
          />

          <Box role='group' aria-label={`The Shroud ${configName} puzzle board`}>
            <SimpleGrid cols={config.cols} spacing={0} w='100%' maw={384} mx='auto' p={4}>
              {Array.from({ length: config.rows }).flatMap((_, row) =>
                Array.from({ length: config.cols }).map((__, column) => {
                  const masked = !config.mask[row][column]
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
                        aria-label={`Row ${String(row + 1)}, column ${String(column + 1)}, masked empty position`}
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
          This board has no solution. Check the tiles in game and edit it again.
        </Alert>
      )}
    </ToolLayout>
  )
}

export default ShroudPage
