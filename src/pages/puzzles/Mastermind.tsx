import React, { useState } from 'react'
import { Alert, Button, Card, Col, Form, InputGroup, Row, Stack } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import Board from './mastermind/components/Board.tsx'
import Peg from './mastermind/components/Peg.tsx'
import useMastermindSolver from './mastermind/hooks/useMastermindSolver.ts'
import type { Color, FeedbackType } from './mastermind/types/types.ts'

const MAX_ATTEMPTS = 10
const INITIAL_GUESS: Color[] = [1, 1, 2, 2]

const Mastermind: React.FC = () => {
  const { currentGuess, possibleCount, guesses, finished, reset, submitFeedback } = useMastermindSolver(
    INITIAL_GUESS,
    MAX_ATTEMPTS
  )

  const [blackInput, setBlackInput] = useState(0)
  const [whiteInput, setWhiteInput] = useState(0)
  const [error, setError] = useState<string>()

  const handleSubmit = () => {
    const result = submitFeedback({ black: blackInput, white: whiteInput })
    if (result?.error) {
      setError(result.error)
    } else {
      setError(undefined)
      setBlackInput(0)
      setWhiteInput(0)
    }
  }

  // last feedback entry
  const lastFeedback: FeedbackType | undefined = guesses.length > 0 ? guesses[guesses.length - 1].feedback : undefined

  const solved = lastFeedback?.black === 4 || possibleCount === 1

  return (
    <Card>
      <Card.Header className='text-center p-1'>
        <Card.Title>
          <h4 className='mb-0'>Mastermind Solver</h4>
          <small>The Reaver's Fate | The Key to the Mythal</small>
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
        <Row xs={1} md={2} lg={3} className='g-2' style={{ marginBottom: 16 }}>
          <Col xs={12} md={6} lg={4}>
            {finished && (
              <Card>
                <Card.Body className='text-center p-1'>
                  <h5 className='mb-0'>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {solved ? (
                      <Alert variant='success'>
                        🎉 Puzzle solved!
                        <br />
                        Go grab your loot!
                      </Alert>
                    ) : null}
                  </h5>
                </Card.Body>
                {possibleCount === 1 || solved ? (
                  <>
                    <Card.Header className='text-center p-1'>
                      <h5 className='mb-0'>Solution</h5>
                    </Card.Header>
                    <Card.Body>
                      <Stack direction='horizontal' gap={2} className='justify-content-center'>
                        {currentGuess.map((c: Color, idx: number) => (
                          <Peg key={`${String(c)}-${String(idx)}`} color={c} />
                        ))}
                      </Stack>
                    </Card.Body>
                  </>
                ) : (
                  <Card.Body>
                    <h2>Failed to solve within {MAX_ATTEMPTS} attempts.</h2>
                  </Card.Body>
                )}
              </Card>
            )}
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Card>
              <Card.Header className='text-center p-1'>
                <h5 className='mb-0'>
                  Attempt {guesses.length + 1} of {MAX_ATTEMPTS}
                </h5>
              </Card.Header>

              {!solved && (
                <>
                  <Card.Body className='text-center p-1'>
                    <small className='mb-0'>Remaining possibilities: {possibleCount}</small>
                  </Card.Body>

                  <Card.Header className='text-center p-1'>
                    <h6 className='mb-0'>Next Guess:</h6>
                  </Card.Header>

                  <Card.Body>
                    <Stack direction='horizontal' gap={2} className='justify-content-center'>
                      Next Guess:
                      {currentGuess.map((c: Color, idx: number) => (
                        <Peg key={`${String(c)}-${String(idx)}`} color={c} />
                      ))}
                    </Stack>
                  </Card.Body>
                </>
              )}

              <Card.Header className='text-center p-1'>
                <h6 className='mb-0'>Feedback</h6>
              </Card.Header>

              <Card.Body>
                <InputGroup>
                  <InputGroup.Text id='black-feedback'>Black:</InputGroup.Text>
                  <Form.Control
                    type='number'
                    min={0}
                    max={4}
                    value={blackInput}
                    onChange={(e) => {
                      setBlackInput(Number(e.target.value))
                    }}
                    disabled={solved}
                  />
                  <InputGroup.Text id='white-feedback'>White:</InputGroup.Text>
                  <Form.Control
                    type='number'
                    min={0}
                    max={4}
                    value={whiteInput}
                    onChange={(e) => {
                      setWhiteInput(Number(e.target.value))
                    }}
                    disabled={solved}
                  />
                </InputGroup>
              </Card.Body>

              <Card.Footer>
                {!finished ? (
                  <Button className='w-100' variant='outline-light' onClick={handleSubmit}>
                    Submit Feedback
                  </Button>
                ) : (
                  <Button className='w-100' variant='outline-light' onClick={reset}>
                    Start Over
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Card>
              <Card.Header className='text-center p-1'>
                <h5 className='mb-0'>Previous Guesses & Feedback</h5>
              </Card.Header>
              <Card.Body>
                <Board guesses={guesses} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default Mastermind
