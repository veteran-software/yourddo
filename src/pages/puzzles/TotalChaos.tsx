import React from 'react'
import { Button, Card, Col, Row, ToggleButton } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import activeTileImg from '../../assets/tile_active.png'
import emptyTileImg from '../../assets/tile_empty.png'
import inactiveTileImg from '../../assets/tile_inactive.png'
import useLightsOutSolver from './lightsOut/hooks/useLightsOutSolver.ts'
import usePuzzleState from './lightsOut/hooks/usePuzzleState.ts'
import type { Config } from './lightsOut/types/types.ts'

const TotalChaos = () => {
  const { initBoard, toggleCell, randomPresses, applyPresses, solveBoard } = useLightsOutSolver()

  // single fixed “W” shape: 3×5, columns 2 & 4 only have the bottom cell
  const config: Config = {
    rows: 3,
    cols: 5,
    mask: [
      [true, false, true, false, true],
      [true, false, true, false, true],
      [true, true, true, true, true]
    ]
  }

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


  return (
    <Card>
      <Card.Header className='text-center p-1'>
        <Card.Title>
          <h4 className='mb-0'>Total Chaos</h4>
          <small>Keep on the Borderlands</small>
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
              // green border for un‐clicked solution tiles, yellow for clicked ones
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

export default TotalChaos
