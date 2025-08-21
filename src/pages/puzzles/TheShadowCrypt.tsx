import { useEffect, useState } from 'react'
import { Button, Card, Container, Form, Nav, Tab, Tabs } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'

interface SubPath {
  label: string
  route: string
}

interface PathOption {
  label: string
  routes: string | SubPath[]
}

interface PuzzleData {
  label: string
  options: PathOption[]
}

const PUZZLES: PuzzleData[] = [
  {
    label: 'Red',
    options: [
      { label: '12-Gear', routes: 'EEEESSNWN(DD)SESSW' },
      {
        label: '8-Gear Duo',
        routes: [
          { label: 'Duo A', route: 'NNSEW' },
          { label: 'Duo B', route: 'WWEWW' }
        ]
      }
    ]
  },
  {
    label: 'Green',
    options: [
      { label: '12-Gear', routes: 'EEENNNNNNN(DD)WSWSEW' },
      {
        label: '8-Gear Duo',
        routes: [
          { label: 'Duo A', route: 'WWNEW' },
          { label: 'Duo B', route: 'WENEW' }
        ]
      }
    ]
  },
  {
    label: 'Blue',
    options: [
      { label: '12-Gear', routes: '(DD)NWWWWNNNSSNWWEE' },
      {
        label: '8-Gear Duo',
        routes: [
          { label: 'Duo A', route: 'SNSEE' },
          { label: 'Duo B', route: 'WSEEE' }
        ]
      }
    ]
  }
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
  const [activeSubpath, setActiveSubpath] = useState<Record<string, string>>({})
  const [horizontal, setHorizontal] = useState(false)

  useEffect(() => {
    const init: Record<string, boolean[]> = {}
    const iterateItems = (sub: SubPath, opt: PathOption, label: string) => {
      init[`${label}:${opt.label}:${sub.label}`] = parseSteps(sub.route).map(() => false)
    }

    const iterateOptions = (opt: PathOption, label: string) => {
      const items = Array.isArray(opt.routes) ? opt.routes : [{ label: '', route: opt.routes }]
      items.forEach((sub) => {
        iterateItems(sub, opt, label)
      })
    }

    PUZZLES.forEach(({ label, options }) => {
      options.forEach((opt) => {
        iterateOptions(opt, label)
      })
    })
    setChecked(init)
  }, [])

  const toggle = (key: string, idx: number) => {
    setChecked((prev) => {
      const arr = [...prev[key]]
      arr[idx] = !arr[idx]
      return { ...prev, [key]: arr }
    })
  }

  const reset = (key: string) => {
    setChecked((prev) => ({
      ...prev,
      [key]: prev[key].map(() => false)
    }))
  }

  const getSteps = (steps: string[], key: string, flags: boolean[]) => {
    if (horizontal) {
      // HORIZONTAL MODE
      return (
        <div className='d-flex align-items-center flex-wrap flex-md-nowrap mb-2' style={{ rowGap: '1rem' }}>
          {steps.map((step, idx) => {
            const itemKey = `${key}-${String(idx)}`
            return (
              <div key={itemKey} className='d-flex align-items-center flex-nowrap me-2 mb-2'>
                <div className='d-flex flex-column align-items-center px-1'>
                  <Form.Check
                    type='checkbox'
                    id={`tsc-H-${itemKey}`}
                    checked={flags[idx]}
                    onChange={() => {
                      toggle(key, idx)
                    }}
                  />
                  <span>{step === '(DD)' ? '↻' : step}</span>
                </div>
                {idx < steps.length - 1 && <span className='ms-1'>→</span>}
              </div>
            )
          })}
        </div>
      )
    }

    // VERTICAL MODE
    return (
      <div className='d-flex flex-column mb-2' style={{ rowGap: '0.5rem' }}>
        {steps.map((step, idx) => {
          const itemKey = `${key}-${String(idx)}`
          return (
            <div key={itemKey} className='d-flex align-items-center'>
              <Form.Check
                type='checkbox'
                id={`tsc-V-${itemKey}`}
                checked={flags[idx]}
                onChange={() => {
                  toggle(key, idx)
                }}
                className='me-2'
              />
              <span className='me-2'>{step === '(DD)' ? '↻ Dimension Door' : `Move ${getMovement(step)}`}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const getSubPaths = (subs: SubPath[], opt: PathOption, label: string) => {
    if (horizontal) {
      // HORIZONTAL MODE
      return subs.map((sub) => {
        const key = `${label}:${opt.label}:${sub.label}`
        const steps = parseSteps(sub.route)
        const flags = checked[key] ?? []

        return (
          <div key={`${label}::${opt.label}::${sub.label || 'single'}`}>
            {sub.label && <h6>{sub.label}</h6>}
            <div className='d-flex align-items-center mb-2'>
              <Form className='mb-2'>{getSteps(steps, key, flags)}</Form>
            </div>
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={() => {
                reset(key)
              }}
            >
              Reset {sub.label || opt.label}
            </Button>
          </div>
        )
      })
    }

    // VERTICAL MODE
    return subs.map((sub) => {
      const key = `${label}:${opt.label}:${sub.label}`
      const steps = parseSteps(sub.route)
      const flags = checked[key] ?? []

      return (
        <div key={`${label}::${opt.label}::${sub.label || 'single'}`} className='flex-fill'>
          {sub.label && <h6>{sub.label}</h6>}
          <Form className='mb-2'>{getSteps(steps, key, flags)}</Form>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={() => {
              reset(key)
            }}
          >
            Reset {sub.label || opt.label}
          </Button>
        </div>
      )
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
        <div className='d-flex justify-content-end mb-2'>
          <Button
            size='sm'
            variant={horizontal ? 'info' : 'outline-info'}
            onClick={() => {
              setHorizontal((h) => !h)
            }}
          >
            {horizontal ? 'Vertical' : 'Horizontal'}
          </Button>
        </div>

        <Tabs defaultActiveKey='intro' id='puzzle-tabs' className='mb-3'>
          <Tab eventKey='intro' title='Instructions'>
            <div className='p-3'>
              <h5>The Shadow Crypt : Path Finder</h5>
              <ol>
                <li>Head to the first room to the east of the starting point.</li>
                <li>
                  Note the color of the room. It will be either Red, Green, or Blue and select the corresponding tab.
                </li>
                <li>Each tab shows the list of which way to navigate from each room.</li>
                <li>
                  “(DD)” means “Dimension Door”: teleport back to the starting point, then continue.{' '}
                  <strong>Do NOT try and run backwards to get to the beginning; you will get lost.</strong>
                </li>
                <li>Follow the directions step by step to finish the quest.</li>
              </ol>

              <h5>8-Gear Duo Paths</h5>
              <h6>Group A</h6>
              <ol>
                <li>Move to the east room from the start like a normal run.</li>
                <li>Follows the path starting with the first checkbox as normal.</li>
              </ol>
              <h6>Group B</h6>
              <ol>
                <li>Stay at the starting point until Group A determines the color of the east room.</li>
                <li>
                  Follow the path from the starting room.{' '}
                  <strong>
                    Do not go to the east from the start unless that is the first direction on the path list.
                  </strong>
                </li>
              </ol>
            </div>
          </Tab>

          {PUZZLES.map(({ label, options }) => {
            const activeOpt = activeSubpath[label] ?? options[0].label

            return (
              <Tab eventKey={label} title={label} key={label}>
                <div className='p-3'>
                  <Nav
                    variant='pills'
                    activeKey={activeOpt}
                    onSelect={(optLabel) => {
                      if (typeof optLabel !== 'string') {
                        return
                      }

                      setActiveSubpath((prev) => ({
                        ...prev,
                        [label]: optLabel
                      }))
                    }}
                    className='mb-3'
                  >
                    {options.map((opt: PathOption) => (
                      <Nav.Item key={`${label}::${opt.label}`}>
                        <Nav.Link eventKey={opt.label}>{opt.label}</Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>

                  {options
                    .filter((opt: PathOption) => opt.label === activeOpt)
                    .map((opt: PathOption) => {
                      const subs: SubPath[] = Array.isArray(opt.routes)
                        ? opt.routes
                        : [{ label: '', route: opt.routes }]
                      const isDuo: boolean = subs.length > 1
                      const orientationStyle: string = horizontal ? 'mb-4' : 'd-flex gap-4 flex-wrap'

                      return (
                        <Container key={`${label}::${opt.label}`} className={isDuo ? orientationStyle : 'mb-4'}>
                          {getSubPaths(subs, opt, label)}
                        </Container>
                      )
                    })}
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
