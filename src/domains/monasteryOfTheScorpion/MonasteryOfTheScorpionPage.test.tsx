// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import MonasteryOfTheScorpionPage from './MonasteryOfTheScorpionPage.tsx'

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <MonasteryOfTheScorpionPage />
    </MantineProvider>
  )

const tile = (row: number, column: number) =>
  screen.getByRole('button', { name: new RegExp(`^Row ${String(row)}, column ${String(column)},`) })

const chooseAction = async (name: 'Toggle On/Off' | 'Remove (Burn Out)') => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: 'Tile action' }))
  await user.click(screen.getByRole('option', { name }))
}

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn()
  })

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
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('MonasteryOfTheScorpionPage', () => {
  it('starts with the legacy 4 by 5 mask in edit mode', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Monastery of the Scorpion' })).toBeTruthy()
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(20)
    expect(screen.getAllByRole('button', { name: /off, present, not a recommended solution press/ })).toHaveLength(20)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(true)
    expect(screen.getByRole('combobox', { name: 'Tile action' })).toBeTruthy()
  })

  it('toggles one tile while editing and invalidates an existing solution', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(1, 1))
    expect(tile(1, 1).getAttribute('aria-label')).toContain('on, present')
    expect(tile(1, 2).getAttribute('aria-label')).toContain('off, present')

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))
    expect(screen.getByText('Solution generated')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    await user.click(tile(1, 1))
    expect(screen.queryByText('Solution generated')).toBeNull()
    expect(screen.queryAllByRole('button', { name: /recommended solution press not completed/ })).toHaveLength(0)
  })

  it('renders the inactive, active, and removed tile artwork', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(tile(1, 1).style.backgroundImage).toContain('tile_inactive')
    await user.click(tile(1, 1))
    expect(tile(1, 1).style.backgroundImage).toContain('tile_active')

    await chooseAction('Remove (Burn Out)')
    await user.click(tile(1, 1))
    expect(tile(1, 1).style.backgroundImage).toContain('tile_empty')
  })

  it('burns out a tile, resets the complete board, and disables that tile only in edit mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(1, 1))
    await chooseAction('Remove (Burn Out)')
    await user.click(tile(2, 2))

    expect(tile(1, 1).getAttribute('aria-label')).toContain('off, present')
    expect(tile(2, 2).getAttribute('aria-label')).toContain('off, removed')
    expect((tile(2, 2) as HTMLButtonElement).disabled).toBe(true)

    tile(2, 1).focus()
    await user.tab()
    expect(document.activeElement).toBe(tile(2, 3))

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    expect((tile(2, 2) as HTMLButtonElement).disabled).toBe(false)
  })

  it('preserves removed-cell neighbor toggles in play mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseAction('Remove (Burn Out)')
    await user.click(tile(2, 2))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(tile(2, 2))

    expect(tile(1, 2).getAttribute('aria-label')).toContain('on, present')
    expect(tile(2, 1).getAttribute('aria-label')).toContain('on, present')
    expect(tile(2, 3).getAttribute('aria-label')).toContain('on, present')
    expect(tile(3, 2).getAttribute('aria-label')).toContain('on, present')
    expect(tile(2, 2).getAttribute('aria-label')).toContain('off, removed')
  })

  it('switches modes with explicit labels and shows edit controls only in edit mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Tile action' })).toBeNull()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Tile action' })).toBeTruthy()
  })

  it('generates a random board with the legacy cryptographic press selection', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 0
      return array
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Random' }))

    expect(screen.getByText('Random puzzle generated')).toBeTruthy()
    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(tile(1, 1).getAttribute('aria-label')).toContain('on, present')
    expect(tile(1, 2).getAttribute('aria-label')).toContain('off, present')
    expect(screen.queryAllByRole('button', { name: /recommended solution press not completed/ })).toHaveLength(0)
  })

  it('solves the board, marks recommended presses, and reports their completion', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('status').textContent).toContain('Solution generated')
    const recommended = screen.getAllByRole('button', { name: /recommended solution press not completed/ })
    expect(recommended).toHaveLength(10)
    expect(recommended[0].textContent).toBe('!')
    expect(recommended[0].style.border).toContain('4px solid')

    await user.click(recommended[0])
    expect(recommended[0].textContent).toBe('✓')
    expect(recommended[0].style.border).toContain('2px solid')

    for (const recommendedTile of recommended.slice(1)) await user.click(recommendedTile)

    expect(screen.getByText('Recommended presses completed')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /recommended solution press completed/ })).toHaveLength(10)
  })

  it('explains when the edited board has no solution', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseAction('Remove (Burn Out)')
    for (let row = 1; row <= 4; row++) {
      for (let column = 1; column <= 5; column++) {
        if (row !== 1 || column > 2) await user.click(tile(row, column))
      }
    }

    await chooseAction('Toggle On/Off')
    await user.click(tile(1, 2))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('alert').textContent).toContain('No solution exists')
    expect(screen.queryAllByRole('button', { name: /recommended solution press not completed/ })).toHaveLength(0)
  })

  it('clears the board and mask while preserving the current mode and edit action', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseAction('Remove (Burn Out)')
    await user.click(tile(2, 2))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /off, present, not a recommended solution press/ })).toHaveLength(20)

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tile action' }).value).toBe('Remove (Burn Out)')
  })

  it('uses native keyboard activation and keeps Mantine focus styling', async () => {
    const user = userEvent.setup()
    renderPage()
    const firstTile = tile(1, 1)

    firstTile.focus()
    expect(document.activeElement).toBe(firstTile)
    expect(firstTile.className).toContain('mantine-focus-auto')
    await user.keyboard('{Enter}')
    expect(tile(1, 1).getAttribute('aria-label')).toContain('on, present')
    await user.keyboard(' ')
    expect(tile(1, 1).getAttribute('aria-label')).toContain('off, present')
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', (scheme) => {
    renderPage(scheme)

    expect(screen.getByRole('heading', { name: 'Monastery of the Scorpion' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(20)
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

    const board = screen.getByRole('group', { name: 'Monastery 4 by 5 puzzle board' })
    const grid = board.querySelector<HTMLElement>('.mantine-SimpleGrid-root')
    const firstTile = tile(1, 1)
    expect(grid?.style.width).toBe('100%')
    expect(grid?.style.maxWidth).toBeTruthy()
    expect(firstTile.style.aspectRatio).toBe('1 / 1')
    expect(firstTile.style.width).toBe('100%')
    expect(document.body.style.overflowX).not.toBe('scroll')
  })
})
