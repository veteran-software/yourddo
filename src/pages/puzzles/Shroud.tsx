import React, { useState } from 'react'
import { Button, Card, Col, Form, Row, ToggleButton } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import activeTileImg from '../../assets/tile_active.png'
import emptyTileImg from '../../assets/tile_empty.png'
import inactiveTileImg from '../../assets/tile_inactive.png'
import useLightsOutSolver from './lightsOut/hooks/useLightsOutSolver.ts'
import usePuzzleState from './lightsOut/hooks/usePuzzleState.ts'
import type { Config } from './lightsOut/types/types.ts'

const Shroud = () => {
  const { initBoard, makeRectConfig, makeCircular4x4Config, toggleCell, randomPresses, applyPresses, solveBoard } =
    useLightsOutSolver()

  const options = {
    '3x3': makeRectConfig(3, 3),
    '4x4': makeRectConfig(4, 4),
    '5x5': makeRectConfig(5, 5),
    '6x6': makeRectConfig(6, 6),
    'Circular (4x4)': makeCircular4x4Config()
  } as const

  const [configName, setConfigName] = useState<keyof typeof options>('3x3')
  const config: Config = options[configName]

  const {
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
  } = usePuzzleState(config, initBoard, toggleCell)

  const { rows: R, cols: C, mask } = config

  const handleSolve = (): void => {
    setEditMode(false)
    const { presses, marked } = solveBoard(board, config)

    setSolution(presses)
    setShowSolution(presses !== null)
    setMarkedSolution(marked)
  }

  const handleReset = (): void => {
    setBoard(initBoard(config))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(true)
    setShowSolution(false)
  }

  const handleRandom = (): void => {
    const presses = randomPresses(config)
    const newBoard = applyPresses(initBoard(config), config, presses)

    setBoard(newBoard)
    setSolution(presses)
    setMarkedSolution(presses.map((row) => row.map(() => 0)))
    setEditMode(false)
    setShowSolution(false)
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newName = e.target.value as keyof typeof options
    const newConfig = options[newName]

    // batch all updates together
    setConfigName(newName)
    setBoard(initBoard(newConfig))
    setSolution(null)
    setMarkedSolution(null)
    setEditMode(true)
    setShowSolution(false)
  }

  return (
    <Card>
      <Card.Header className='text-center p-1'>
        <Card.Title>
          <h4 className='mb-0'>The Shroud / The Codex and the Shroud</h4>
          <small>The Vale of Twilight</small>
        </Card.Title>
        <small>
          <a
            href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Puzzle%20Solvers%22'
            target='_blank'
            rel='noreferrer'
            title='Puzzle Solver Known Issues & Bug Reports'
          >
            Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
          </a>
        </small>
      </Card.Header>
      <Card.Body>
        <Row className='align-items-center mb-3 justify-content-center'>
          <Col xs='auto'>
            <Form.Label className='mb-0'>Board:</Form.Label>
          </Col>

          <Col xs='auto'>
            <Form.Select value={configName} onChange={handleConfigChange}>
              {Object.keys(options).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className='align-items-center mb-3 justify-content-center'>
          <Col xs='auto'>
            <Button variant='info' onClick={handleRandom}>
              Random
            </Button>
          </Col>

          <Col xs='auto'>
            <Button variant='primary' onClick={handleSolve} disabled={editMode}>
              Solve
            </Button>
          </Col>

          <Col xs='auto'>
            <Button variant='secondary' onClick={handleReset}>
              Clear
            </Button>
          </Col>

          <Col xs='auto'>
            <ToggleButton
              id='edit-mode-toggle'
              value={''}
              type='checkbox'
              variant={editMode ? 'warning' : 'success'}
              checked={editMode}
              onChange={() => {
                setEditMode((em) => !em)
              }}
            >
              {editMode ? 'Play' : 'Edit'}
            </ToggleButton>
          </Col>
        </Row>

        {/* mode banner */}
        <Row className='mb-2'>
          <Col>
            <div className={`p-1 text-center rounded-5 ${editMode ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
              {editMode ? 'Edit Mode' : 'Play Mode'}
            </div>
          </Col>
        </Row>

        <Row
          style={{ gridTemplateColumns: `repeat(${String(C)}, 64px)` }}
          className='g-0 d-grid justify-content-center'
        >
          {Array.from({ length: R }).flatMap((_, row) =>
            Array.from({ length: C }).map((_, col) => {
              const isHole = !mask[row][col]
              const on = board[row][col] === 1
              const press = solution && showSolution ? solution[row][col] === 1 : false
              const marked = markedSolution ? markedSolution[row][col] === 1 : false

              let bgUrl: string
              if (isHole) {
                bgUrl = emptyTileImg
              } else {
                bgUrl = on ? activeTileImg : inactiveTileImg
              }

              const baseClasses = 'd-flex align-items-center justify-content-center bg-body'
              // green border for un‐clicked solution tiles
              const borderClasses: string = press ? toggleMarked(marked) : 'border'

              const style: React.CSSProperties = {
                width: '64px',
                height: '64px',
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: editMode && !isHole ? 'pointer' : 'default'
              }

              return (
                <div
                  key={`${String(row)}-${String(col)}`}
                  role='button'
                  tabIndex={0}
                  className={`${borderClasses} ${baseClasses}`}
                  style={style}
                  onClick={() => {
                    handleCellClick(row, col)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCellClick(row, col)
                    }
                  }}
                />
              )
            })
          )}
        </Row>
      </Card.Body>
    </Card>
  )
}

export default Shroud
