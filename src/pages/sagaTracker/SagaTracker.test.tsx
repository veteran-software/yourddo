import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SagaTracker from './SagaTracker'
import questsData from './quests.json'
import sagas from './sagas.json'
import { getQuestDoneAt, getSagaItems, getTurnedInAt, setQuestDoneAt, setSagaItems, setTurnedInAt } from './storage/sagaStore'

vi.mock('./storage/sagaStore', () => ({
  requestPersistentStorage: vi.fn().mockResolvedValue(undefined),
  getSagaItems: vi.fn().mockResolvedValue(undefined),
  getQuestDoneAt: vi.fn().mockResolvedValue({}),
  getTurnedInAt: vi.fn().mockResolvedValue({}),
  setSagaItems: vi.fn().mockResolvedValue(undefined),
  setQuestDoneAt: vi.fn().mockResolvedValue(undefined),
  setTurnedInAt: vi.fn().mockResolvedValue(undefined)
}))

describe('Saga Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null)
    vi.mocked(getSagaItems).mockResolvedValue(undefined)
    vi.mocked(getQuestDoneAt).mockResolvedValue({})
    vi.mocked(getTurnedInAt).mockResolvedValue({})
  })

  it('shows a single contact', async () => {
    render(<SagaTracker />)

    expect(await screen.findByText('Contact: Mattias Deckland')).toBeInTheDocument()
  })

  it('does not overwrite stored progress before IndexedDB loading finishes', async () => {
    vi.mocked(getSagaItems).mockReturnValue(new Promise<undefined>(() => undefined))
    render(<SagaTracker />)
    expect(await screen.findByText('Contact: Mattias Deckland')).toBeInTheDocument()

    expect(setSagaItems).not.toHaveBeenCalled()
    expect(setQuestDoneAt).not.toHaveBeenCalled()
    expect(setTurnedInAt).not.toHaveBeenCalled()
  })

  it('has quests to derive a level range for every saga', () => {
    for (const saga of sagas) {
      expect(questsData.some((quest) => quest.sagas.includes(saga.id))).toBe(true)
    }
  })

  it.each([
    { tab: 'Heroic (1-20)', saga: 'Saltmarsh (H)', range: '3' },
    { tab: 'Heroic (1-20)', saga: 'Fables of the Feywild (H)', range: '5-6' },
    { tab: 'Heroic (1-20)', saga: 'Isle of Dread (H)', range: '7-8' },
    { tab: 'Heroic (1-20)', saga: 'Vecna Unleashed (H)', range: '18' },
    { tab: 'Legendary (31+)', saga: 'Isle of Dread (L)', range: '33-34' },
    { tab: 'Legendary (31+)', saga: 'Chill of Ravenloft (L)', range: '34-36' }
  ])('derives the level range from quests for $saga', async ({ tab, saga, range }) => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    await user.click(screen.getByRole('tab', { name: tab }))
    const row = screen.getByText(saga).closest('.saga-data-row')
    if (!(row instanceof HTMLElement)) throw new Error(`Missing saga row: ${saga}`)

    expect(within(row).getByTitle('Level range').textContent).toBe(range)
  })

  it('keeps the full saga level range while searching for one quest', async () => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    await user.type(screen.getByRole('textbox', { name: 'Search quests' }), 'Irestone')
    const row = screen.getByText('The Pirates of the Thunder Sea (H)').closest('.saga-data-row')
    if (!(row instanceof HTMLElement)) throw new Error('Missing Pirates saga row')

    expect(within(row).getByTitle('Level range')).toHaveTextContent('4-7')
  })

  it('shows the quest level inside the clickable label while preserving search highlighting', async () => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    await user.type(screen.getByRole('textbox', { name: 'Search quests' }), 'Irestone')

    const checkbox = screen.getByRole('checkbox', {
      name: 'Mark quest Irestone Inlet (H) as done for The Pirates of the Thunder Sea (H)'
    })
    const level = screen.getByText('Lv 4')
    expect(level.closest('label')).toHaveAttribute('for', checkbox.id)
    expect(screen.getByTitle('Irestone Inlet (H)')).toContainElement(screen.getByText('Irestone', { selector: 'mark' }))

    await user.click(level)
    expect(checkbox).toBeChecked()
  })

  it('keeps keyboard focus while toggling quests and moving through an expanded list', async () => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    const row = screen.getByText('The Pirates of the Thunder Sea (H)').closest('.saga-data-row')
    if (!(row instanceof HTMLElement)) throw new Error('Missing Pirates saga row')
    const expand = within(row).getByRole('button', { name: 'Show quests' })

    expand.focus()
    await user.keyboard('{Enter}')
    await user.tab()
    expect(within(row).getByRole('button', { name: 'New Run' })).toHaveFocus()
    const quests = screen.getAllByRole('checkbox', { name: /^Mark quest / })
    for (const quest of quests) {
      await user.tab()
      expect(quest).toHaveFocus()
      await user.keyboard('[Space]')
      expect(quest).toBeChecked()
      expect(quest).toHaveFocus()
    }
    expect(screen.getByRole('checkbox', { name: 'Mark The Pirates of the Thunder Sea (H) as completed' })).toBeChecked()

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Mark Fables of the Feywild (H) as completed' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(quests.at(-1)).toHaveFocus()
    await user.keyboard('[Space]')
    expect(quests.at(-1)).not.toBeChecked()
    expect(quests.at(-1)).toHaveFocus()
    for (let i = quests.length - 2; i >= 0; i--) {
      await user.tab({ shift: true })
      expect(quests[i]).toHaveFocus()
    }
    await user.tab({ shift: true })
    expect(within(row).getByRole('button', { name: 'New Run' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(expand).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('checkbox', { name: /^Mark quest / })).not.toBeInTheDocument()
    expect(expand).toHaveFocus()
    await user.tab()
    expect(within(row).getByRole('button', { name: 'New Run' })).toHaveFocus()
  })

  it('preserves focus and shared completion while navigating filtered sagas', async () => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    await user.click(screen.getByRole('tab', { name: 'Epic (21-30)' }))
    const search = screen.getByRole('textbox', { name: 'Search quests' })
    await user.type(search, 'Beyond the Rift')
    const eberron = screen.getByRole('checkbox', {
      name: 'Mark quest Beyond the Rift (E) as done for The End of Eberron (E)'
    })
    const planeswalker = screen.getByRole('checkbox', {
      name: "Mark quest Beyond the Rift (E) as done for The Planeswalker's Path (E)"
    })
    expect(search).toHaveFocus()

    eberron.focus()
    await user.keyboard('[Space]')
    expect(eberron).toBeChecked()
    expect(planeswalker).toBeChecked()
    expect(eberron).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('checkbox', { name: "Mark The Planeswalker's Path (E) as completed" })).toHaveFocus()
    await user.tab({ shift: true })
    expect(eberron).toHaveFocus()
    await user.keyboard('[Space]')
    expect(eberron).not.toBeChecked()
    expect(planeswalker).not.toBeChecked()
    expect(eberron).toHaveFocus()

    await user.clear(search)
    await user.type(search, 'no such quest')
    expect(screen.queryByRole('checkbox', { name: /^Mark quest / })).not.toBeInTheDocument()
    expect(search).toHaveFocus()
    await user.tab()
    expect(screen.getByTitle('Search and expand sagas with matching quests')).toHaveFocus()
  })

  it.each(['localStorage', 'IndexedDB'])('shows both contacts while restoring progress from %s', async (source) => {
    const user = userEvent.setup()
    const progress = [{ id: 'the-end-of-eberron-epic', completed: false, turnedIn: true }]
    if (source === 'IndexedDB') {
      vi.mocked(getSagaItems).mockResolvedValue(progress)
    } else {
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) =>
        key === 'yourddo:saga-tracker:v2' ? JSON.stringify(progress) : null
      )
    }

    render(<SagaTracker />)
    await user.click(screen.getByRole('tab', { name: 'Epic (21-30)' }))

    expect(screen.getByText('Contacts: Gatekeeper Grazla, Gatekeeper Gizla')).toBeInTheDocument()
    expect(screen.getByText('Contacts: Eclesta Xillian, Istine Madrovelle')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Mark The End of Eberron (E) as turned in' })).toBeChecked()
  })

  it.each(['localStorage', 'IndexedDB'])('restores the old saga ID and turn-in cutoff from %s', async (source) => {
    const user = userEvent.setup()
    const legacyId = 'the-planewalkers-path-epic'
    const cutoff = Date.now() - 10_000
    const progress = [{ id: legacyId, completed: false, turnedIn: true }]
    const questDoneAt = {
      '04e8506f-1746-4b34-ae2b-90da57b7b5a5': cutoff - 1,
      '06243f1e-8661-448d-83c8-d777714e086a': cutoff + 1
    }
    if (source === 'IndexedDB') {
      vi.mocked(getSagaItems).mockResolvedValue(progress)
      vi.mocked(getQuestDoneAt).mockResolvedValue(questDoneAt)
      vi.mocked(getTurnedInAt).mockResolvedValue({ [legacyId]: cutoff })
    } else {
      const stored: Record<string, string> = {
        'yourddo:saga-tracker:v2': JSON.stringify(progress),
        'yourddo:saga-tracker:quests:v1': JSON.stringify(
          Object.entries(questDoneAt).map(([id, lastDoneAt]) => ({ id, lastDoneAt }))
        ),
        'yourddo:saga-tracker:turnedInAt:v1': JSON.stringify([{ id: legacyId, turnedInAt: cutoff }])
      }
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => stored[key] ?? null)
    }

    render(<SagaTracker />)
    await user.click(screen.getByRole('tab', { name: 'Epic (21-30)' }))
    const saga = "The Planeswalker's Path (E)"
    const row = screen.getByText(saga).closest('.saga-data-row')
    if (!(row instanceof HTMLElement)) throw new Error('Missing Planeswalker saga row')
    expect(within(row).getByRole('checkbox', { name: `Mark ${saga} as turned in` })).toBeChecked()
    await user.click(within(row).getByRole('button', { name: 'Show quests' }))

    expect(screen.getByRole('checkbox', { name: `Mark quest Beyond the Rift (E) as done for ${saga}` })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: `Mark quest Through a Mirror Darkly (E) as done for ${saga}` })).toBeChecked()
  })

  it.each([
    {
      saga: 'The Pirates of the Thunder Sea (H)',
      quests: [
        'Irestone Inlet (H)',
        'Ghost of a Chance (H)',
        'Prove your Worth (H)',
        'The Legend of Two-Toed Tobias (H)',
        "The Troglodytes' Get (H)",
        'Bargain of Blood (H)',
        'Old Grey Garl (H)',
        'Storm the Beaches (H)',
        'The Black Loch (H)',
        'The Tide Turns (H)'
      ]
    },
    {
      saga: 'Terror of Demogorgon (H)',
      quests: [
        'A Blood Pact (H)',
        'A Long Way to Mushrooms (H)',
        'Back to the Abyss (H)',
        'Demon in the Rough (H)',
        'Flocked Together (H)',
        'For Want of a Heart (H)',
        'Hideous to Behold (H)',
        "If It Wasn't For Bad Luck (H)",
        'Stealing from Sorcere (H)',
        'The Fetid Wedding (H)',
        'The Price of an Egg (H)',
        'Tower of Vengeance (H)'
      ]
    }
  ])('orders quests by level then name for $saga', async ({ saga, quests }) => {
    const user = userEvent.setup()
    render(<SagaTracker />)
    const row = screen.getByText(saga).closest('.saga-data-row')
    if (!(row instanceof HTMLElement)) throw new Error(`Missing saga row: ${saga}`)

    await user.click(within(row).getByRole('button', { name: 'Show quests' }))

    expect(
      screen.getAllByRole('checkbox', { name: /^Mark quest / }).map((checkbox) => checkbox.getAttribute('aria-label'))
    ).toEqual(quests.map((name) => `Mark quest ${name} as done for ${saga}`))
  })
})
