// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import * as lightsOutSolver from '../../shared/lightsOut/lightsOutSolver.ts'
import TotalChaosPage from './TotalChaosPage.tsx'

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <TotalChaosPage />
    </MantineProvider>
  )

const tile = (row: number, column: number) =>
  screen.getByRole('button', { name: new RegExp(`^Row ${String(row)}, column ${String(column)},`) })

const maskedPosition = (row: number, column: number) =>
  screen.getByRole('img', { name: `Row ${String(row)}, column ${String(column)}, masked position` })

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
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
  vi.restoreAllMocks()
  localStorage.clear()
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('TotalChaosPage', () => {
  it('starts with the exact fixed 3 by 5 mask in edit mode', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Total Chaos' })).toBeTruthy()
    expect(screen.getByText('Keep on the Borderlands')).toBeTruthy()
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Total Chaos 3 by 5 puzzle board' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(11)
    expect(screen.getAllByRole('button', { name: /off, not a recommended solution press/ })).toHaveLength(11)
    expect(screen.getAllByRole('img', { name: /masked position/ })).toHaveLength(4)
    expect(maskedPosition(1, 2)).toBeTruthy()
    expect(maskedPosition(1, 4)).toBeTruthy()
    expect(maskedPosition(2, 2)).toBeTruthy()
    expect(maskedPosition(2, 4)).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(true)
  })

  it('toggles only the selected active tile while editing', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(1, 1))

    expect(tile(1, 1).getAttribute('aria-label')).toContain(', on,')
    expect(tile(2, 1).getAttribute('aria-label')).toContain(', off,')
    expect(tile(3, 1).getAttribute('aria-label')).toContain(', off,')
  })

  it('keeps masked positions inert and out of the tab order in both modes', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(maskedPosition(1, 2))
    expect(tile(1, 1).getAttribute('aria-label')).toContain(', off,')
    expect(tile(1, 3).getAttribute('aria-label')).toContain(', off,')

    tile(1, 1).focus()
    await user.tab()
    expect(document.activeElement).toBe(tile(1, 3))

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(maskedPosition(1, 2))
    expect(tile(1, 1).getAttribute('aria-label')).toContain(', off,')
    expect(tile(1, 3).getAttribute('aria-label')).toContain(', off,')
  })

  it('switches modes with explicit labels and enables Solve only in play mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(false)
    expect(screen.getByRole('button', { name: 'Switch to Edit' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(true)
  })

  it('applies the masked plus toggle in play mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(tile(2, 3))

    expect(tile(1, 3).getAttribute('aria-label')).toContain(', on,')
    expect(tile(2, 3).getAttribute('aria-label')).toContain(', on,')
    expect(tile(3, 3).getAttribute('aria-label')).toContain(', on,')
    expect(tile(3, 2).getAttribute('aria-label')).toContain(', off,')
    expect(tile(3, 4).getAttribute('aria-label')).toContain(', off,')
  })

  it('generates a random board with cryptographic selection for active cells only', async () => {
    const user = userEvent.setup()
    const random = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 0
      return array
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Random' }))

    expect(random).toHaveBeenCalledTimes(11)
    expect(screen.getByText('Random puzzle generated')).toBeTruthy()
    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(tile(1, 1).getAttribute('aria-label')).toContain(', off,')
    expect(tile(2, 1).getAttribute('aria-label')).toContain(', on,')
    expect(tile(3, 3).getAttribute('aria-label')).toContain(', off,')
    expect(screen.queryAllByRole('button', { name: /recommended solution press not completed/ })).toHaveLength(0)
    expect(screen.getAllByRole('img', { name: /masked position/ })).toHaveLength(4)
  })

  it('solves the initial board, marks the exact presses, and reports completion', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('status').textContent).toContain('5 recommended presses')
    const recommended = screen.getAllByRole('button', { name: /recommended solution press not completed/ })
    expect(recommended).toHaveLength(5)
    expect(recommended[0].textContent).toBe('!')
    expect(recommended[0].style.border).toContain('4px solid')

    await user.click(recommended[0])
    expect(recommended[0].getAttribute('aria-label')).toContain('recommended solution press completed')
    expect(recommended[0].textContent).toBe('✓')
    expect(recommended[0].style.border).toContain('2px solid')

    for (const recommendedTile of recommended.slice(1)) await user.click(recommendedTile)

    expect(screen.getByText('Recommended presses completed')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /recommended solution press completed/ })).toHaveLength(5)
  })

  it('invalidates a visible solution only when an active tile is edited', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))
    await user.click(tile(3, 3))
    expect(screen.getByText('Solution generated')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    expect(screen.getAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(5)
    await user.click(tile(3, 3))

    expect(screen.queryByText('Solution generated')).toBeNull()
    expect(screen.queryAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(0)
  })

  it('clears the board, solution, and status and returns exactly to edit mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(1, 1))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /off, not a recommended solution press/ })).toHaveLength(11)
    expect(screen.getAllByRole('img', { name: /masked position/ })).toHaveLength(4)
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(true)
  })

  it('explains a no-solution result', async () => {
    const user = userEvent.setup()
    vi.spyOn(lightsOutSolver, 'solveBoard').mockReturnValueOnce({ presses: null, marked: null })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('alert').textContent).toContain('No solution exists')
    expect(screen.queryAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(0)
  })

  it('uses native keyboard activation and preserves Mantine focus styling', async () => {
    const user = userEvent.setup()
    renderPage()
    const firstTile = tile(1, 1)

    expect(firstTile.tagName).toBe('BUTTON')
    firstTile.focus()
    expect(document.activeElement).toBe(firstTile)
    expect(firstTile.className).toContain('mantine-focus-auto')
    await user.keyboard('{Enter}')
    expect(tile(1, 1).getAttribute('aria-label')).toContain(', on,')
    await user.keyboard(' ')
    expect(tile(1, 1).getAttribute('aria-label')).toContain(', off,')
  })

  it('renders the inactive, active, and masked tile artwork', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(tile(1, 1).style.backgroundImage).toContain('tile_inactive')
    await user.click(tile(1, 1))
    expect(tile(1, 1).style.backgroundImage).toContain('tile_active')
    expect(maskedPosition(1, 2).style.backgroundImage).toContain('tile_empty')
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', (scheme) => {
    renderPage(scheme)

    expect(screen.getByRole('heading', { name: 'Total Chaos' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(11)
  })

  it.each([
    [375, 667],
    [768, 1024],
    [1366, 768],
    [1920, 1080]
  ])('keeps a square five-column board at a %i by %i viewport without page overflow', (width, height) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    const board = screen.getByRole('group', { name: 'Total Chaos 3 by 5 puzzle board' })
    const grid = board.querySelector<HTMLElement>('.mantine-SimpleGrid-root')
    const firstTile = tile(1, 1)
    expect(grid?.style.width).toBe('100%')
    expect(grid?.style.maxWidth).toBeTruthy()
    expect(grid?.style.padding).toBeTruthy()
    expect(firstTile.style.aspectRatio).toBe('1 / 1')
    expect(firstTile.style.width).toBe('100%')
    expect(document.body.style.overflowX).not.toBe('scroll')
  })

  it('keeps the responsive board dimensions stable when status content appears', async () => {
    const user = userEvent.setup()
    renderPage()
    const board = screen.getByRole('group', { name: 'Total Chaos 3 by 5 puzzle board' })
    const grid = board.querySelector<HTMLElement>('.mantine-SimpleGrid-root')
    const dimensions = grid?.getAttribute('style')

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('status')).toBeTruthy()
    expect(grid?.getAttribute('style')).toBe(dimensions)
  })
})
