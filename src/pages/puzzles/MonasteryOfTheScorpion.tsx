import React, { useLayoutEffect, useState } from 'react'
import { Button, ButtonGroup, Card, Col, Form, Row, ToggleButton } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import activeTileImg from '../../assets/tile_active.png'
import emptyTileImg from '../../assets/tile_empty.png'
import inactiveTileImg from '../../assets/tile_inactive.png'
import useLightsOutSolver from './lightsOut/hooks/useLightsOutSolver.ts'
import type { Board, Config, Presses } from './lightsOut/types/types.ts'

const ROWS = 4
const COLS = 5
type EditAction = 'toggle' | 'remove'

const MonasteryOfTheScorpion = () => {
  const { initBoard, toggleCell, randomPresses, applyPresses, solveBoard } = useLightsOutSolver()

  // maskState: true = tile present, false = hole
  const [mask, setMask] = useState<boolean[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(true) as boolean[])
  )

  // holes always forced to 0
  const [board, setBoard] = useState<Board>(() => initBoard({ rows: ROWS, cols: COLS, mask }))
  const [solution, setSolution] = useState<Presses>(null)
  const [markedSolution, setMarkedSolution] = useState<Presses>(null)

  const [editMode, setEditMode] = useState<boolean>(true)
  const [editAction, setEditAction] = useState<EditAction>('toggle')
  const [showSolution, setShowSolution] = useState<boolean>(false)

  // reset the board whenever mask changes (holes => forced off)
  useLayoutEffect(() => {
    setBoard(initBoard({ rows: ROWS, cols: COLS, mask }))
    setSolution(null)
    setMarkedSolution(null)
    setShowSolution(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mask])

  const handleSolve = () => {
    setEditMode(false)

    const config: Config = { rows: ROWS, cols: COLS, mask }
    const { presses, marked } = solveBoard(board, config)

    setSolution(presses)
    setMarkedSolution(marked)
    setShowSolution(presses !== null)
  }

  const handleReset = () => {
    setMask(Array.from({ length: ROWS }, () => Array(COLS).fill(true) as boolean[]))
  }

  const handleRandom = () => {
    const config: Config = { rows: ROWS, cols: COLS, mask }
    const presses = randomPresses(config)
    const newBoard = applyPresses(initBoard(config), config, presses)

    setBoard(newBoard)
    setSolution(presses)
    setMarkedSolution(presses.map((r) => r.map(() => 0)))
    setEditMode(false)
    setShowSolution(false)
  }

  const handleCellClick = (r: number, c: number) => {
    if (editMode) {
      if (editAction === 'toggle') {
        if (!mask[r][c]) {
          return
        }

        const b2: number[][] = board.map((row) => row.slice())

        b2[r][c] = b2[r][c] ? 0 : 1
        setBoard(b2)
      } else {
        if (!mask[r][c]) {
          return
        }

        const m2: boolean[][] = mask.map((row) => row.slice())

        m2[r][c] = false
        setMask(m2)
      }

      setSolution(null)
      setMarkedSolution(null)
      setShowSolution(false)
    } else {
      // play mode
      if (solution && showSolution && solution[r][c] === 1 && markedSolution?.[r][c] === 0) {
        const m2 = markedSolution.map((row) => row.slice())

        m2[r][c] = 1
        setMarkedSolution(m2)
      }

      const config: Config = { rows: ROWS, cols: COLS, mask }

      setBoard((prev) => toggleCell(prev, config, r, c))
    }
  }

  const toggleMarked = (isMarked: boolean) => (isMarked ? 'border' : 'border border-4 border-success')

  return (
    <Card>
      <Card.Header className='text-center p-1'>
        <Card.Title>
          <h4 className='mb-0'>Monastery of the Scorpion</h4>
          <small>The Reaver's Reach</small>
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
        <Row className='mb-3 justify-content-center gx-2 w-50 mx-auto'>
          <ButtonGroup>
            <Button variant='info' onClick={handleRandom}>
              Random
            </Button>
            <Button variant='primary' onClick={handleSolve} disabled={editMode}>
              Solve
            </Button>
            <Button variant='secondary' onClick={handleReset}>
              Clear
            </Button>
            <ToggleButton
              id='edit-mode-toggle'
              className='z-0'
              value={''}
              type='checkbox'
              variant={editMode ? 'warning' : 'success'}
              checked={editMode}
              onChange={() => {
                setEditMode((e) => !e)
              }}
            >
              {editMode ? 'Play' : 'Edit'}
            </ToggleButton>
          </ButtonGroup>
        </Row>

        {editMode && (
          <Row className='mb-3 justify-content-center'>
            <Col xs='auto'>
              <Form.Label className='mb-0 align-middle'>Tile Action:</Form.Label>
            </Col>

            <Col xs='auto'>
              <Form.Select
                value={editAction}
                onChange={(e) => {
                  setEditAction(e.target.value as EditAction)
                }}
              >
                <option value='toggle'>Toggle On/Off</option>
                <option value='remove'>Remove (Burn Out)</option>
              </Form.Select>
            </Col>
          </Row>
        )}

        <Row style={{ gridTemplateColumns: `repeat(${COLS},64px)` }} className='g-0 d-grid justify-content-center mb-3'>
          {Array.from({ length: ROWS }).flatMap((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              const isHole = !mask[row][col]
              const on = board[row][col] === 1
              const press = solution && showSolution ? solution[row][col] === 1 : false
              const marked = markedSolution ? markedSolution[row][col] === 1 : false

              const bgUrl = isHole ? emptyTileImg : on ? activeTileImg : inactiveTileImg

              const baseClasses = 'd-flex align-items-center justify-content-center bg-body'
              const borderClasses = press ? toggleMarked(marked) : 'border'

              const style: React.CSSProperties = {
                width: '64px',
                height: '64px',
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: editMode ? 'pointer' : 'default',
                opacity: isHole ? 0.4 : 1
              }

              return (
                <div
                  key={`${String(row)}-${String(col)}`}
                  role='button'
                  tabIndex={0}
                  className={`${baseClasses} ${borderClasses}`}
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

export default MonasteryOfTheScorpion
