// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSagaTrackerData } from './data.ts'
import SagaTrackerPage from './SagaTrackerPage.tsx'
import { loadProgress, saveProgress } from './storage.ts'

vi.mock('./data.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data.ts')>()
  return { ...actual, loadSagaTrackerData: vi.fn() }
})

vi.mock('./storage.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./storage.ts')>()
  return {
    ...actual,
    loadProgress: vi.fn(),
    saveProgress: vi.fn(),
    readActiveTab: vi.fn(() => 'heroic'),
    writeActiveTab: vi.fn()
  }
})

const data = {
  sagas: [
    { id: 'heroic', name: 'Heroic Adventure', levelRange: '3-5', npc: 'Hero NPC' },
    { id: 'epic', name: 'Epic Adventure', levelRange: '20-22', npc: 'Epic NPC' },
    { id: 'legendary', name: 'Legendary Adventure', levelRange: '31', npc: 'Legend NPC' }
  ],
  quests: [
    { id: 'alpha', name: 'Alpha [Quest]', sagas: ['heroic', 'epic'] },
    { id: 'beta', name: 'Beta Quest', sagas: ['heroic'] }
  ]
}

const emptyProgress = {
  sagaStatus: Object.fromEntries(data.sagas.map(({ id }) => [id, { completed: false, turnedIn: false }])),
  questDoneAt: {},
  turnedInAt: {}
}

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <SagaTrackerPage />
    </MantineProvider>
  )

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  )
  vi.mocked(loadSagaTrackerData).mockReset()
  vi.mocked(loadProgress).mockReset()
  vi.mocked(saveProgress).mockReset()
  vi.mocked(loadSagaTrackerData).mockResolvedValue(data)
  vi.mocked(loadProgress).mockResolvedValue({ progress: emptyProgress, storageAvailable: true })
  vi.mocked(saveProgress).mockResolvedValue(true)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SagaTrackerPage', () => {
  it('uses TrackerLayout for title, description, initialization, summary, and category tabs', async () => {
    let resolveData!: (value: typeof data) => void
    vi.mocked(loadSagaTrackerData).mockReturnValueOnce(new Promise((resolve) => (resolveData = resolve)))
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Saga Tracker' })).toBeTruthy()
    expect(screen.getByText('Track your DDO saga completion.')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Loading Saga Tracker')
    resolveData(data)
    expect(await screen.findByText('0 / 3 completed')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Heroic' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Epic' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Legendary' })).toBeTruthy()
    expect(screen.getByText('Heroic Adventure')).toBeTruthy()
  })

  it('shows a friendly CDN error and retries without reloading the page', async () => {
    vi.mocked(loadSagaTrackerData).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(data)
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('Saga Tracker is unavailable')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Heroic Adventure')).toBeTruthy()
    expect(loadSagaTrackerData).toHaveBeenCalledTimes(2)
  })

  it('expands quests and derives incomplete, indeterminate, and complete checkbox states', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Heroic Adventure')
    const sagaCheckbox = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Mark Heroic Adventure as completed'
    })
    await user.click(screen.getByRole('button', { name: 'Show Quests' }))
    expect(screen.getByRole('button', { name: 'Hide Quests' }).getAttribute('aria-expanded')).toBe('true')
    await user.click(screen.getByRole('checkbox', { name: 'Mark quest Alpha [Quest] as completed' }))
    expect(sagaCheckbox.indeterminate).toBe(true)
    await user.click(screen.getByRole('checkbox', { name: 'Mark quest Beta Quest as completed' }))
    expect(sagaCheckbox.checked).toBe(true)
    await user.click(sagaCheckbox)
    expect(sagaCheckbox.checked).toBe(false)
  })

  it('handles turn-in, new run, reset confirmation, and preserves a usable page', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Heroic Adventure')
    const turnedIn = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Mark Heroic Adventure as turned in' })
    await user.click(turnedIn)
    expect(turnedIn.checked).toBe(true)
    await user.click(screen.getByRole('button', { name: 'New Run' }))
    expect(turnedIn.checked).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Reset Progress' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Reset Progress' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reset Progress' }))
    expect(await screen.findByText('Saga Tracker progress was reset.')).toBeTruthy()
  })

  it('searches after three characters, expands matching quests, highlights safely, and clears', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Heroic Adventure')
    const search = screen.getByRole('textbox', { name: 'Search sagas and quests' })
    fireEvent.change(search, { target: { value: '[qu' } })
    expect(screen.getByText('Heroic Adventure')).toBeTruthy()
    expect(screen.getByText('[Qu', { selector: 'mark' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hide Quests' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.queryByText('[Qu', { selector: 'mark' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Show Quests' })).toBeTruthy()
  })

  it('imports a valid backup and rejects malformed data without applying it', async () => {
    renderPage()
    await screen.findByText('Heroic Adventure')
    const input = screen.getByLabelText('Import Saga Tracker backup')
    const validFile = {
      text: () =>
        Promise.resolve(
          JSON.stringify({
            version: 2,
            items: [{ id: 'heroic', completed: false, turnedIn: true }],
            questDoneAt: { alpha: 20, beta: 20 },
            turnedInAt: { heroic: 10 }
          })
        )
    }
    fireEvent.change(input, { target: { files: [validFile] } })
    expect(await screen.findByText('Saga Tracker backup imported successfully.')).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Mark Heroic Adventure as completed' }).checked).toBe(
      true
    )
    const malformedFile = { text: () => Promise.resolve('{broken') }
    fireEvent.change(input, { target: { files: [malformedFile] } })
    expect((await screen.findByRole('alert')).textContent).toContain('JSON')
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Mark Heroic Adventure as completed' }).checked).toBe(
      true
    )
  })

  it('exports a formatted version 2 backup', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn(() => 'blob:backup')
    const revokeObjectURL = vi.fn()
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL }
    })
    renderPage()
    await screen.findByText('Heroic Adventure')
    await user.click(screen.getByRole('button', { name: 'Export' }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Saga Tracker backup exported successfully.')).toBeTruthy()
    await waitFor(() => {
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup')
    })
  })
})
