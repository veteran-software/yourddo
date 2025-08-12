import { useEffect, useState } from 'react'
import { Button, Card, Form, Tab, Tabs } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'

interface PuzzleData {
  label: string
  route: string
}

const PUZZLES: PuzzleData[] = [
  { label: 'Red', route: 'EEEESSNWN(DD)SESSW' },
  { label: 'Green', route: 'EEENNNNNNN(DD)WSWSEW' },
  { label: 'Blue', route: '(DD)NWWWWNNNSSNWWEE' }
]

const getMovement = (step: string) => {
  if (step === 'N') return 'North'
  if (step === 'S') return 'South'
  if (step === 'E') return 'East'
  if (step === 'W') return 'West'
  return step
}

const parseSteps = (route: string): string[] => route.match(/\(DD\)|[NESW]/g) ?? []

const TheShadowCrypt = () => {
  const [checked, setChecked] = useState<Record<string, boolean[]>>({})

  useEffect(() => {
    const init: Record<string, boolean[]> = {}
    PUZZLES.forEach(({ label, route }) => {
      init[label] = parseSteps(route).map(() => false)
    })
    setChecked(init)
  }, [])

  const toggle = (label: string, idx: number) => {
    setChecked((prev) => {
      const arr = [...prev[label]]
      arr[idx] = !arr[idx]
      return { ...prev, [label]: arr }
    })
  }

  const reset = (label: string) => {
    setChecked((prev) => {
      const arr = prev[label].map(() => false)
      return { ...prev, [label]: arr }
    })
  }

  return (
    <Card>
      <Card.Header className='text-center p-1'>
        <Card.Title>
          <h4 className='mb-0'>The Shadow Crypt</h4>
          <small>The Necropolis, Part II</small>
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
        <Tabs defaultActiveKey='intro' id='puzzle-tabs' className='mb-3'>
          <Tab eventKey='intro' title='How to Play'>
            <div className='p-3'>
              <h5>The Shadow Crypt : Path Finder</h5>
              <p>
                1. Head to the first room to the east of the starting point.
                <br />
                2. Note the color of the room. It will be either Red, Green, or Blue and select the corresponding tab.
                <br />
                3. Each tab shows a the list of which way to navigate from each room.
                <br />
                4. "(DD)" means "Dimension Door" : teleport back to the starting point, then continue.{' '}
                <strong>Do NOT try and run backwards to get to the beginning; you will get lost.</strong>
                <br />
                5. Follow the directions step by step to finish the quest.
              </p>
            </div>
          </Tab>

          {PUZZLES.map(({ label, route }) => {
            const steps: string[] = parseSteps(route)
            const flags: boolean[] = checked[label] ?? []

            return (
              <Tab eventKey={label.toLowerCase()} title={label} key={label}>
                <div className='p-3'>
                  <h5>{label} Path</h5>
                  <Form>
                    {steps.map((step: string, idx: number) => (
                      <Form.Check
                        key={`${step}-${String(idx)}`}
                        type='checkbox'
                        id={`${label}-${String(idx)}`}
                        label={step === '(DD)' ? '↻ Dimension Door → back to start' : `Move ${getMovement(step)}`}
                        checked={flags[idx] ?? false}
                        onChange={() => {
                          toggle(label, idx)
                        }}
                        className='mb-2'
                      />
                    ))}
                  </Form>

                  <div className='mt-2'>
                    <Button
                      variant='outline-secondary'
                      size='sm'
                      onClick={() => {
                        reset(label)
                      }}
                    >
                      Reset Checklist
                    </Button>
                  </div>
                </div>
              </Tab>
            )
          })}
        </Tabs>
      </Card.Body>
    </Card>
  )
}

export default TheShadowCrypt
