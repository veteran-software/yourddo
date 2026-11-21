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
    { id: 'heroic', name: 'Heroic Adventure', levelRange: '3-5', npcs: ['Hero NPC', 'Second NPC'] },
    { id: 'epic', name: 'Epic Adventure', levelRange: '20-22', npcs: ['Epic NPC'] },
    { id: 'legendary', name: 'Legendary Adventure', levelRange: '31', npcs: ['Legend NPC'] }
  ],
  quests: [
    { id: 'alpha', name: 'Alpha [Quest]', level: 3, sagas: ['heroic', 'epic'] },
    { id: 'beta', name: 'Beta Quest', level: 3, sagas: ['heroic'] }
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
    expect(screen.getByText('Contacts: Hero NPC, Second NPC')).toBeTruthy()
    const sagaCheckbox = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Mark Heroic Adventure as completed'
    })
    const completionColor = () =>
      sagaCheckbox.closest<HTMLElement>('.mantine-Checkbox-root')?.style.getPropertyValue('--checkbox-color')
    expect(completionColor()).toBe('var(--mantine-color-red-6)')
    await user.click(screen.getByRole('button', { name: 'Show Quests' }))
    expect(screen.getByRole('button', { name: 'Hide Quests' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByText('Lv 3')).toHaveLength(2)
    await user.click(screen.getByRole('checkbox', { name: 'Mark quest Alpha [Quest] as completed' }))
    expect(sagaCheckbox.indeterminate).toBe(true)
    expect(completionColor()).toBe('var(--mantine-color-yellow-6)')
    await user.click(screen.getByRole('checkbox', { name: 'Mark quest Beta Quest as completed' }))
    expect(sagaCheckbox.checked).toBe(true)
    expect(completionColor()).toBe('var(--mantine-color-green-8)')
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

  it('keeps focus while using Space, Tab, and Shift+Tab through an expanded quest list', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Heroic Adventure')
    const expand = screen.getByRole('button', { name: 'Show Quests' })
    const newRun = screen.getByRole('button', { name: 'New Run' })
    expand.focus()
    await user.keyboard('{Enter}')
    await user.tab()
    expect(document.activeElement).toBe(newRun)
    const quests = screen.getAllByRole<HTMLInputElement>('checkbox', { name: /^Mark quest / })
    for (const quest of quests) {
      await user.tab()
      expect(document.activeElement).toBe(quest)
      await user.keyboard('[Space]')
      expect(quest.checked).toBe(true)
      expect(document.activeElement).toBe(quest)
    }
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Mark Heroic Adventure as completed' }).checked).toBe(
      true
    )
    await user.tab()
    expect(document.activeElement).not.toBe(quests.at(-1))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(quests.at(-1))
    await user.keyboard('[Space]')
    expect(quests.at(-1)?.checked).toBe(false)
    expect(document.activeElement).toBe(quests.at(-1))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(quests[0])
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(newRun)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(expand)
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('checkbox', { name: /^Mark quest / })).toBeNull()
    expect(document.activeElement).toBe(expand)
    await user.tab()
    expect(document.activeElement).toBe(newRun)
  })

  it('preserves keyboard focus and shared completion across filtered saga lists', async () => {
    vi.mocked(loadSagaTrackerData).mockResolvedValue({
      sagas: [...data.sagas, { id: 'other', name: 'Other Adventure', levelRange: '3', npcs: ['Other NPC'] }],
      quests: data.quests.map((quest) =>
        quest.id === 'alpha' ? { ...quest, sagas: [...quest.sagas, 'other'] } : quest
      )
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Heroic Adventure')
    const search = screen.getByRole('textbox', { name: 'Search sagas and quests' })
    await user.type(search, 'Alpha')
    expect(document.activeElement).toBe(search)
    const [first, shared] = screen.getAllByRole<HTMLInputElement>('checkbox', {
      name: 'Mark quest Alpha [Quest] as completed'
    })
    first.focus()
    await user.keyboard('[Space]')
    expect(first.checked).toBe(true)
    expect(shared.checked).toBe(true)
    expect(document.activeElement).toBe(first)
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Mark Other Adventure as completed' }))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(first)
    await user.keyboard('[Space]')
    expect(first.checked).toBe(false)
    expect(shared.checked).toBe(false)
    expect(document.activeElement).toBe(first)
    await user.clear(search)
    await user.type(search, 'no such quest')
    expect(screen.queryByRole('checkbox', { name: /^Mark quest / })).toBeNull()
    expect(document.activeElement).toBe(search)
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Clear search' }))
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
