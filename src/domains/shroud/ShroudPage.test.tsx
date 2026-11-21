// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import ShroudPage from './ShroudPage.tsx'

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <ShroudPage />
    </MantineProvider>
  )

const tile = (row: number, column: number) =>
  screen.getByRole('button', { name: new RegExp(`^Row ${String(row)}, column ${String(column)},`) })

const maskedPosition = (row: number, column: number) =>
  screen.getByRole('img', { name: `Row ${String(row)}, column ${String(column)}, masked empty position` })

const chooseConfiguration = async (name: string) => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: 'Board configuration' }))
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

describe('ShroudPage', () => {
  it('starts with the 3 by 3 configuration in edit mode', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'The Shroud / The Codex and the Shroud' })).toBeTruthy()
    expect(screen.getByText('The Vale of Twilight')).toBeTruthy()
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Board configuration' }).value).toBe('3x3')
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(9)
    expect(screen.getAllByRole('button', { name: /off, not a recommended solution press/ })).toHaveLength(9)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(true)
  })

  it.each([
    ['3x3', 9, 0],
    ['4x4', 16, 0],
    ['5x5', 25, 0],
    ['6x6', 36, 0],
    ['Circular (4x4)', 8, 8]
  ])('supports the %s board configuration', async (name, activeTiles, maskedTiles) => {
    renderPage()

    await chooseConfiguration(name)

    expect(screen.getByRole('group', { name: `The Shroud ${name} puzzle board` })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(activeTiles)
    expect(screen.queryAllByRole('img', { name: /masked empty position/ })).toHaveLength(maskedTiles)
  })

  it('resets board and solver state when the configuration changes', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(1, 1))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))
    expect(screen.getByText('Solution generated')).toBeTruthy()

    await chooseConfiguration('4x4')

    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getAllByRole('button', { name: /off, not a recommended solution press/ })).toHaveLength(16)
  })

  it('changes only the selected tile in edit mode and clears a stale solution', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(tile(2, 2))
    expect(tile(2, 2).getAttribute('aria-label')).toContain(', on,')
    expect(tile(1, 2).getAttribute('aria-label')).toContain(', off,')
    expect(tile(2, 1).getAttribute('aria-label')).toContain(', off,')

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))
    expect(screen.getByText('Solution generated')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Switch to Edit' }))
    await user.click(tile(2, 2))
    expect(screen.queryByText('Solution generated')).toBeNull()
    expect(screen.queryAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(0)
  })

  it('uses plus-neighbor toggling for rectangular boards in play mode', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(tile(2, 2))

    for (const [row, column] of [
      [1, 2],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 2]
    ]) {
      expect(tile(row, column).getAttribute('aria-label')).toContain(', on,')
    }
  })

  it('uses ring toggling for the circular board', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseConfiguration('Circular (4x4)')
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(tile(3, 4))

    for (const [row, column] of [
      [2, 4],
      [3, 4],
      [4, 3]
    ]) {
      expect(tile(row, column).getAttribute('aria-label')).toContain(', on,')
    }
    expect(tile(2, 1).getAttribute('aria-label')).toContain(', off,')
  })

  it('shows recommendations after solve and marks them completed when pressed', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Solve' }).disabled).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('status').textContent).toContain('recommended')
    const recommended = screen.getAllByRole('button', { name: /recommended solution press not completed/ })
    expect(recommended.length).toBeGreaterThan(0)
    expect(recommended[0].textContent).toBe('!')

    await user.click(recommended[0])
    expect(recommended[0].getAttribute('aria-label')).toContain('recommended solution press completed')
    expect(recommended[0].textContent).toBe('✓')
  })

  it('reports an already solved board as complete when solve requires zero presses', async () => {
    const user = userEvent.setup()
    renderPage()

    for (let row = 1; row <= 3; row++) {
      for (let column = 1; column <= 3; column++) await user.click(tile(row, column))
    }
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('status').textContent).toContain('Recommended presses completed')
  })

  it('generates a random board without showing a generated press pattern as a solution', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Random' }))

    expect(screen.getByText('Mode: Play')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Random puzzle generated')
    expect(screen.queryAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(0)
  })

  it('clears the current board while preserving its selected configuration', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseConfiguration('6x6')
    await user.click(tile(1, 1))
    await user.click(screen.getByRole('button', { name: 'Random' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Board configuration' }).value).toBe('6x6')
    expect(screen.getByText('Mode: Edit')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getAllByRole('button', { name: /off, not a recommended solution press/ })).toHaveLength(36)
  })

  it('shows an accessible no-solution alert for an unsolvable 4 by 4 board', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseConfiguration('4x4')
    await user.click(tile(1, 1))
    await user.click(screen.getByRole('button', { name: 'Switch to Play' }))
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('alert').textContent).toContain('No solution exists')
    expect(screen.queryAllByRole('button', { name: /, recommended solution press/ })).toHaveLength(0)
  })

  it('keeps masked circular positions noninteractive and labels them as empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseConfiguration('Circular (4x4)')
    expect(maskedPosition(1, 1)).toBeTruthy()
    expect(maskedPosition(2, 2)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Row 1, column 1,/ })).toBeNull()

    await user.click(maskedPosition(1, 1))
    expect(tile(1, 2).getAttribute('aria-label')).toContain(', off,')
  })

  it('uses native button keyboard activation for active tiles', async () => {
    const user = userEvent.setup()
    renderPage()
    const firstTile = tile(1, 1)

    expect(firstTile.tagName).toBe('BUTTON')
    firstTile.focus()
    expect(document.activeElement).toBe(firstTile)
    await user.keyboard('{Enter}')
    expect(firstTile.getAttribute('aria-label')).toContain(', on,')
    await user.keyboard(' ')
    expect(firstTile.getAttribute('aria-label')).toContain(', off,')
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', (scheme) => {
    renderPage(scheme)

    expect(screen.getByRole('heading', { name: 'The Shroud / The Codex and the Shroud' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Row / })).toHaveLength(9)
  })

  it.each([
    [375, 667],
    [768, 1024],
    [1366, 768]
  ])('uses a responsive square grid for the 6 by 6 board at %i by %i', async (width, height) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    await chooseConfiguration('6x6')

    const board = screen.getByRole('group', { name: 'The Shroud 6x6 puzzle board' })
    const grid = board.querySelector<HTMLElement>('.mantine-SimpleGrid-root')
    expect(grid?.style.width).toBe('100%')
    expect(grid?.style.maxWidth).toBeTruthy()
    expect(tile(1, 1).style.aspectRatio).toBe('1 / 1')
    expect(tile(1, 1).style.width).toBe('100%')
    expect(document.body.style.overflowX).not.toBe('scroll')
  })
})
