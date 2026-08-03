// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import MastermindPage from './MastermindPage.tsx'
import useMastermindSolver, { type Color, type Guess } from './useMastermindSolver.ts'

vi.mock('./useMastermindSolver.ts', async (importOriginal) => {
  const solver = await importOriginal<typeof import('./useMastermindSolver.ts')>()

  return {
    ...solver,
    default: vi.fn(solver.default)
  }
})

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <MastermindPage />
    </MantineProvider>
  )

const enterFeedback = (black: number, white: number) => {
  fireEvent.change(screen.getByRole('textbox', { name: /Black feedback/ }), { target: { value: String(black) } })
  fireEvent.change(screen.getByRole('textbox', { name: /White feedback/ }), { target: { value: String(white) } })
}

let systemDark = false
const colorSchemeListeners = new Set<(event: MediaQueryListEvent) => void>()

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' && systemDark,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') colorSchemeListeners.add(listener)
      }),
      removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') colorSchemeListeners.delete(listener)
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  )

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  )
})

afterEach(() => {
  cleanup()
  vi.mocked(useMastermindSolver).mockClear()
  localStorage.clear()
  systemDark = false
  colorSchemeListeners.clear()
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('MastermindPage', () => {
  it('shows the initial guess, attempt, remaining possibilities, and accessible feedback controls', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Mastermind Solver' })).toBeTruthy()
    expect(screen.getByText('Attempt: 1 of 10')).toBeTruthy()
    expect(screen.getByText('Remaining possibilities: 1296')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Next guess: Blue 1, Blue 1, Green 2, Green 2' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: /Black feedback/ })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: /White feedback/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeTruthy()
    expect(screen.getByText('No feedback submitted yet.')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain(
      'Initial guess: Blue 1, Blue 1, Green 2, Green 2. Attempt 1 of 10. 1296 possibilities remain.'
    )
  })

  it('accepts valid feedback, advances the attempt, narrows possibilities, and records history', async () => {
    const user = userEvent.setup()
    renderPage()
    enterFeedback(1, 1)

    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    expect(screen.getByText('Attempt: 2 of 10')).toBeTruthy()
    expect(screen.getByText('Remaining possibilities: 208')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Attempt 1 guess: Blue 1, Blue 1, Green 2, Green 2' })).toBeTruthy()
    expect(screen.getByLabelText('1 black, 1 white')).toBeTruthy()
    expect(screen.queryByText('No feedback submitted yet.')).toBeNull()
    expect(screen.getByRole('status').textContent).toMatch(
      /New guess generated: .+ Attempt 2 of 10\. 208 possibilities remain\./
    )
  })

  it('shows invalid feedback without changing the attempt or history', async () => {
    const user = userEvent.setup()
    renderPage()
    enterFeedback(4, 1)

    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    expect(within(screen.getByRole('alert')).getByText(/Sum of black\+white cannot exceed 4/)).toBeTruthy()
    enterFeedback(3, 1)
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    expect(within(screen.getByRole('alert')).getByText('No valid solution remains')).toBeTruthy()
    expect(within(screen.getByRole('alert')).getByText(/Inconsistent feedback/)).toBeTruthy()
    expect(screen.getByText('Attempt: 1 of 10')).toBeTruthy()
    expect(screen.getByText('No feedback submitted yet.')).toBeTruthy()
  })

  it('prevents feedback values outside the permitted range', () => {
    renderPage()
    const black = screen.getByRole<HTMLInputElement>('textbox', { name: /Black feedback/ })

    expect(black.getAttribute('inputmode')).toBe('decimal')
    fireEvent.change(black, { target: { value: '5' } })
    expect(black.value).toBe('0')
    fireEvent.change(black, { target: { value: '-1' } })
    expect(black.value).toBe('0')
  })

  it('shows the confirmed current guess as the solution', async () => {
    const user = userEvent.setup()
    renderPage()
    enterFeedback(4, 0)

    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    expect(screen.getByText('Puzzle solved!')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('The solution is shown beside this message.')
    expect(screen.getByRole('img', { name: 'Solution: Blue 1, Blue 1, Green 2, Green 2' })).toBeTruthy()
    expect(screen.getByText('Attempts used: 1 of 10')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Submit feedback' })).toBeNull()
  })

  it('shows a sole remaining possibility as the solution', async () => {
    const user = userEvent.setup()
    renderPage()
    enterFeedback(0, 4)

    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    expect(screen.getByText('Puzzle solved!')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Solution: Green 2, Green 2, Blue 1, Blue 1' })).toBeTruthy()
    expect(screen.getByText('Remaining possibilities: 1')).toBeTruthy()
  })

  it('shows the maximum-attempt state supplied by the preserved solver contract', () => {
    const guesses: Guess[] = Array.from({ length: 10 }, (_, index) => ({
      code: [1, 1, 2, ((index % 4) + 1) as Color],
      feedback: { black: 0, white: 0 }
    }))
    vi.mocked(useMastermindSolver).mockImplementationOnce(() => ({
      currentGuess: [1, 1, 2, 2],
      possibleCount: 8,
      guesses,
      finished: true,
      reset: vi.fn(),
      submitFeedback: vi.fn()
    }))
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })

    renderPage()

    expect(screen.getByText('Maximum attempts reached')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain(
      'The solver did not identify a solution within 10 attempts. Reset the puzzle to try again.'
    )
    expect(screen.getByText('Attempts used: 10 of 10')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Last guess: Blue 1, Blue 1, Green 2, Green 2' })).toBeTruthy()
  })

  it('resets solver, feedback controls, validation, and history to the exact initial state', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))
    enterFeedback(3, 1)
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    await user.click(screen.getByRole('button', { name: 'Reset solver' }))

    expect(screen.getByText('Attempt: 1 of 10')).toBeTruthy()
    expect(screen.getByText('Remaining possibilities: 1296')).toBeTruthy()
    expect(screen.getByText('No feedback submitted yet.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: /Black feedback/ }).value).toBe('0')
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: /White feedback/ }).value).toBe('0')
  })

  it('submits feedback with the keyboard and preserves visible focus styles', async () => {
    const user = userEvent.setup()
    renderPage()
    const white = screen.getByRole('textbox', { name: /White feedback/ })
    white.focus()
    expect(document.activeElement).toBe(white)
    await user.keyboard('{Control>}a{/Control}4{Enter}')

    expect(screen.getByText('Puzzle solved!')).toBeTruthy()
    const reset = screen.getByRole('button', { name: 'Reset solver' })
    reset.focus()
    expect(document.activeElement).toBe(reset)
    expect(reset.className).toContain('mantine-focus-auto')
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', (scheme) => {
    renderPage(scheme)

    expect(screen.getByRole('heading', { name: 'Mastermind Solver' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeTruthy()
  })

  it('tracks live operating-system theme changes in system mode', async () => {
    renderPage('auto')

    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light')
    act(() => {
      systemDark = true
      for (const listener of colorSchemeListeners) {
        listener({ matches: true, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
      }
    })

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark')
    })
    expect(screen.getByRole('heading', { name: 'Mastermind Solver' })).toBeTruthy()
  })

  it.each([
    [375, 667],
    [768, 1024],
    [1366, 768],
    [1920, 1080]
  ])('keeps the full interaction available at a %i×%i viewport', (width, height) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    expect(screen.getByRole('img', { name: /Next guess/ })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: /Black feedback/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Previous guesses and feedback' })).toBeTruthy()
    expect(document.body.style.overflowX).not.toBe('scroll')
  })

  it('contains narrow-screen history overflow inside the Mantine table scroller', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }))

    const historyViewport = screen.getByRole('table').closest<HTMLElement>('[data-scrollarea-viewport]')
    expect(historyViewport).toBeTruthy()
    expect(historyViewport?.style.overflowX).toBe('scroll')
  })
})
