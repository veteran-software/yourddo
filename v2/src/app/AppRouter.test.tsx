// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import AppRouter from './AppRouter'

vi.mock('../domains/cauldronOfCadence/CauldronOfCadencePage.tsx', () => ({
  default: () => <h1>Cauldron of Cadence domain</h1>
}))

vi.mock('../domains/dinosaurBone/DinosaurBonePage.tsx', () => ({
  default: () => <h1>Dinosaur Bone domain</h1>
}))

vi.mock('../domains/essenceCrafting/EssenceCraftingPage.tsx', () => ({
  default: () => <h1>Essence Crafting domain</h1>
}))

vi.mock('../domains/incrediblePotential/IncrediblePotentialPage.tsx', () => ({
  default: () => <h1>Incredible Potential domain</h1>
}))

vi.mock('../domains/nearlyComplete/NearlyCompletePage.tsx', () => ({
  default: () => <h1>Nearly Complete domain</h1>
}))

vi.mock('../domains/nearlyFinished/NearlyFinishedPage.tsx', () => ({
  default: () => <h1>Nearly Finished domain</h1>
}))

vi.mock('../domains/sagaTracker/SagaTrackerPage.tsx', () => ({
  default: () => <h1>Saga Tracker domain</h1>
}))

vi.mock('../domains/mastermind/MastermindPage.tsx', () => ({
  default: () => <h1>Mastermind domain</h1>
}))

vi.mock('../domains/monasteryOfTheScorpion/MonasteryOfTheScorpionPage.tsx', () => ({
  default: () => <h1>Monastery domain</h1>
}))

vi.mock('../domains/totalChaos/TotalChaosPage.tsx', () => ({
  default: () => <h1>Total Chaos domain</h1>
}))

vi.mock('../domains/viktranium/ViktraniumPage.tsx', () => ({
  default: () => <h1>Viktranium domain</h1>
}))

const renderRoute = (path: string) =>
  render(
    <MantineProvider env='test' defaultColorScheme='auto'>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </MantineProvider>
  )

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
  localStorage.clear()
  systemDark = false
  colorSchemeListeners.clear()
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('AppRouter', () => {
  it('renders Essence Crafting at its public route with active navigation and direct remount support', () => {
    const firstRender = renderRoute('/essence-crafting')

    expect(screen.getByRole('heading', { name: 'Essence Crafting domain' })).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Essence Crafting' })
    expect(link.getAttribute('href')).toBe('/essence-crafting')
    expect(link.getAttribute('aria-current')).toBe('page')

    firstRender.unmount()
    renderRoute('/essence-crafting')
    expect(screen.getByRole('heading', { name: 'Essence Crafting domain' })).toBeTruthy()
  })

  it('closes mobile navigation after selecting Essence Crafting', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    await user.click(screen.getByRole('link', { name: 'Essence Crafting', hidden: true }))

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Essence Crafting domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Essence Crafting' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders Saga Tracker at its preserved route with active navigation and direct remount support', () => {
    const firstRender = renderRoute('/saga-tracker')
    expect(screen.getByRole('heading', { name: 'Saga Tracker domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Saga Tracker' }).getAttribute('aria-current')).toBe('page')

    firstRender.unmount()
    renderRoute('/saga-tracker')
    expect(screen.getByRole('heading', { name: 'Saga Tracker domain' })).toBeTruthy()
  })

  it('closes mobile navigation after selecting Saga Tracker', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Tools' }))
    await user.click(screen.getByRole('link', { name: 'Saga Tracker', hidden: true }))
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Saga Tracker domain' })).toBeTruthy()
  })

  it('renders Viktranium at its preserved route and supports a direct remount', () => {
    const firstRender = renderRoute('/viktranium-experiment')
    expect(screen.getByRole('heading', { name: 'Viktranium domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Viktranium Experiment' }).getAttribute('aria-current')).toBe('page')

    firstRender.unmount()
    renderRoute('/viktranium-experiment')
    expect(screen.getByRole('heading', { name: 'Viktranium domain' })).toBeTruthy()
  })

  it('closes mobile navigation after selecting Viktranium', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    await user.click(screen.getByRole('link', { name: 'Viktranium Experiment', hidden: true }))
    expect(screen.getByRole('heading', { name: 'Viktranium domain' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
  })

  it('renders Dinosaur Bone at its preserved public route', () => {
    renderRoute('/dinosaur-bone')

    expect(screen.getByRole('heading', { name: 'Dinosaur Bone domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Dinosaur Bone Crafting' }).getAttribute('aria-current')).toBe('page')
  })

  it('loads Dinosaur Bone directly after a remount', () => {
    const firstRender = renderRoute('/dinosaur-bone')
    expect(screen.getByRole('heading', { name: 'Dinosaur Bone domain' })).toBeTruthy()

    firstRender.unmount()
    renderRoute('/dinosaur-bone')

    expect(screen.getByRole('heading', { name: 'Dinosaur Bone domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Dinosaur Bone Crafting' }).getAttribute('aria-current')).toBe('page')
  })

  it('closes mobile navigation after selecting Dinosaur Bone', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    await user.click(screen.getByRole('link', { name: 'Dinosaur Bone Crafting', hidden: true }))

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Dinosaur Bone domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Dinosaur Bone Crafting' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders Incredible Potential at its preserved public route', () => {
    renderRoute('/incredible-potential')

    expect(screen.getByRole('heading', { name: 'Incredible Potential domain' })).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Incredible Potential' })
    expect(link.getAttribute('href')).toBe('/incredible-potential')
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('loads Incredible Potential directly after a remount', () => {
    const firstRender = renderRoute('/incredible-potential')
    expect(screen.getByRole('heading', { name: 'Incredible Potential domain' })).toBeTruthy()

    firstRender.unmount()
    renderRoute('/incredible-potential')

    expect(screen.getByRole('heading', { name: 'Incredible Potential domain' })).toBeTruthy()
  })

  it('closes mobile navigation after selecting Incredible Potential', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    const link = screen.getByRole('link', { name: 'Incredible Potential', hidden: true })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Incredible Potential domain' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('renders the Cauldron of Cadence domain at its preserved public route', () => {
    renderRoute('/cauldron-of-cadence')

    expect(screen.getByRole('heading', { name: 'Cauldron of Cadence domain' })).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Cauldron of Cadence' })
    expect(link.getAttribute('href')).toBe('/cauldron-of-cadence')
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('loads the Cauldron route directly after a remount', () => {
    const firstRender = renderRoute('/cauldron-of-cadence')
    expect(screen.getByRole('heading', { name: 'Cauldron of Cadence domain' })).toBeTruthy()

    firstRender.unmount()
    renderRoute('/cauldron-of-cadence')

    expect(screen.getByRole('heading', { name: 'Cauldron of Cadence domain' })).toBeTruthy()
  })

  it('renders the Nearly Complete domain at its public route', () => {
    renderRoute('/nearly-complete')

    expect(screen.getByRole('heading', { name: 'Nearly Complete domain' })).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Nearly Complete' })
    expect(link.getAttribute('href')).toBe('/nearly-complete')
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(screen.getAllByRole('main')).toHaveLength(1)

    const sidebarViewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
    expect(sidebarViewport?.style.overflowY).toBe('scroll')
    expect(screen.getByRole('button', { name: 'Puzzle Solvers' })).toBeTruthy()
  })

  it('renders the Nearly Finished domain at its preserved public route', () => {
    renderRoute('/nearly-finished')

    expect(screen.getByRole('heading', { name: 'Nearly Finished domain' })).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Nearly Finished' })
    expect(link.getAttribute('href')).toBe('/nearly-finished')
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('closes mobile navigation after selecting Nearly Finished', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    await user.click(screen.getByRole('link', { name: 'Nearly Finished', hidden: true }))

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Nearly Finished domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Nearly Finished' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders Mastermind at its preserved public route and supports a direct remount', () => {
    const firstRender = renderRoute('/reavers-fate')

    expect(screen.getByRole('heading', { name: 'Mastermind domain' })).toBeTruthy()
    const link = screen.getByRole('link', { name: "The Reaver's Fate" })
    expect(link.getAttribute('href')).toBe('/reavers-fate')
    expect(link.getAttribute('aria-current')).toBe('page')
    const sidebarViewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
    expect(sidebarViewport?.style.overflowY).toBe('scroll')

    firstRender.unmount()
    renderRoute('/reavers-fate')

    expect(screen.getByRole('heading', { name: 'Mastermind domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: "The Reaver's Fate" }).getAttribute('aria-current')).toBe('page')
  })

  it('preserves the legacy Mastermind route alias', async () => {
    renderRoute('/the-key-to-the-mythal')

    expect(await screen.findByRole('heading', { name: 'Mastermind domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: "The Reaver's Fate", hidden: true }).getAttribute('aria-current')).toBe(
      'page'
    )
  })

  it('renders Monastery at its preserved public route and supports a direct remount', () => {
    const firstRender = renderRoute('/monastery-of-the-scorpion')

    expect(screen.getByRole('heading', { name: 'Monastery domain' })).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Monastery of the Scorpion' })
    expect(link.getAttribute('href')).toBe('/monastery-of-the-scorpion')
    expect(link.getAttribute('aria-current')).toBe('page')
    const sidebarViewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
    expect(sidebarViewport?.style.overflowY).toBe('scroll')

    firstRender.unmount()
    renderRoute('/monastery-of-the-scorpion')

    expect(screen.getByRole('heading', { name: 'Monastery domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Monastery of the Scorpion' }).getAttribute('aria-current')).toBe('page')
  })

  it('preserves the legacy Toxic Treatment route alias', async () => {
    renderRoute('/toxic-treatment')

    expect(await screen.findByRole('heading', { name: 'Monastery domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Monastery of the Scorpion' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders Total Chaos at its preserved public route and supports a direct remount', () => {
    const firstRender = renderRoute('/total-chaos')

    expect(screen.getByRole('heading', { name: 'Total Chaos domain' })).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Total Chaos' })
    expect(link.getAttribute('href')).toBe('/total-chaos')
    expect(link.getAttribute('aria-current')).toBe('page')
    const sidebarViewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
    expect(sidebarViewport?.style.overflowY).toBe('scroll')

    firstRender.unmount()
    renderRoute('/total-chaos')

    expect(screen.getByRole('heading', { name: 'Total Chaos domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Total Chaos' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders the not-found page for an unknown route', () => {
    renderRoute('/unknown-tool')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Return home' }).getAttribute('href')).toBe('/')
  })

  it('toggles the desktop sidebar and closes mobile navigation after selection', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }))
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Crafting' }))
    const link = screen.getByRole('link', { name: 'Cauldron of Cadence', hidden: true })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('closes mobile navigation after selecting the Mastermind route', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Puzzle Solvers' }))
    const link = screen.getByRole('link', { name: "The Reaver's Fate", hidden: true })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Mastermind domain' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('closes mobile navigation after selecting the Monastery route', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Puzzle Solvers' }))
    const link = screen.getByRole('link', { name: 'Monastery of the Scorpion', hidden: true })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Monastery domain' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('closes mobile navigation after selecting the Total Chaos route', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await user.click(screen.getByRole('button', { name: 'Puzzle Solvers' }))
    const link = screen.getByRole('link', { name: 'Total Chaos', hidden: true })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Total Chaos domain' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('exposes navigation and theme controls to the keyboard with Mantine focus styles', async () => {
    const user = userEvent.setup()
    renderRoute('/nearly-complete')

    const mobileNavigation = screen.getByRole('button', { name: 'Open navigation' })
    const desktopNavigation = screen.getByRole('button', { name: 'Collapse navigation' })
    const themeMenu = screen.getByRole('button', { name: 'Theme: System' })

    await user.tab()
    expect(document.activeElement).toBe(mobileNavigation)
    expect(mobileNavigation.className).toContain('mantine-focus-auto')

    await user.tab()
    expect(document.activeElement).toBe(desktopNavigation)

    await user.tab()
    expect(document.activeElement).toBe(themeMenu)
    expect(themeMenu.className).toContain('mantine-focus-auto')

    await user.keyboard('{Enter}')
    expect(await screen.findByRole('menuitem', { name: 'Light' })).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menuitem', { name: 'Light' })).toBeNull()
  })

  it('keeps the Cauldron route available in light, dark, and system themes', async () => {
    const user = userEvent.setup()
    renderRoute('/cauldron-of-cadence')

    const chooseTheme = async (current: string, next: string) => {
      await user.click(screen.getByRole('button', { name: `Theme: ${current}` }))
      await user.click(screen.getByRole('menuitem', { name: next }))
      expect(screen.getByRole('button', { name: `Theme: ${next}` })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Cauldron of Cadence domain' })).toBeTruthy()
    }

    await chooseTheme('System', 'Light')
    await chooseTheme('Light', 'Dark')
    await chooseTheme('Dark', 'System')
  })

  it('tracks system color-scheme changes while the application is open', async () => {
    renderRoute('/nearly-complete')

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
  })
})
