// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { pinsKey, recentsKey, readShelf } from '../domains/home/shelves'
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

vi.mock('../domains/gearPlanner/GearPlannerPage.tsx', () => ({
  default: () => <h1>Gear Planner domain</h1>
}))

vi.mock('../domains/alchemical/AlchemicalPage.tsx', () => ({
  default: () => <h1>Alchemical Crafting domain</h1>
}))

vi.mock('../domains/slaveLords/SlaveLordsPage.tsx', () => ({
  default: () => <h1>Slave Lords Crafting domain</h1>
}))

vi.mock('../domains/incrediblePotential/IncrediblePotentialPage.tsx', () => ({
  default: () => <h1>Incredible Potential domain</h1>
}))

vi.mock('../domains/heroicGreenSteel/HeroicGreenSteelPage.tsx', () => ({
  default: () => <h1>Heroic Green Steel domain</h1>
}))

vi.mock('../domains/legendaryGreenSteel/LegendaryGreenSteelPage.tsx', () => ({
  default: () => <h1>Legendary Green Steel domain</h1>
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

vi.mock('../domains/shadowCrypt/ShadowCryptPage.tsx', () => ({
  default: () => <h1>Shadow Crypt domain</h1>
}))

vi.mock('../domains/mastermind/MastermindPage.tsx', () => ({
  default: () => <h1>Mastermind domain</h1>
}))

vi.mock('../domains/monasteryOfTheScorpion/MonasteryOfTheScorpionPage.tsx', () => ({
  default: () => <h1>Monastery domain</h1>
}))

vi.mock('../domains/shroud/ShroudPage.tsx', () => ({
  default: () => <h1>Shroud domain</h1>
}))

vi.mock('../domains/totalChaos/TotalChaosPage.tsx', () => ({
  default: () => <h1>Total Chaos domain</h1>
}))

vi.mock('../domains/viktranium/ViktraniumPage.tsx', () => ({
  default: () => <h1>Viktranium domain</h1>
}))

// jsdom fixes the viewport at 1024px. Move the lg breakpoint to exercise the desktop layout.
const renderRoute = (path: string, desktop = false) =>
  render(
    <MantineProvider env='test' defaultColorScheme='auto' theme={desktop ? { breakpoints: { lg: '60em' } } : undefined}>
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

it('displays the CDN game version beside the community links', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    return Promise.resolve(
      url.endsWith('/latest.json')
        ? Response.json({ gameVersion: '82.1.0', dataVersion: 123, baseUrl: '/releases/82.1.0/123' })
        : new Response(null, { status: 503 })
    )
  })
  try {
    renderRoute('/', true)
    const badge = await screen.findByText('U82.1.0')
    const github = screen.getByRole('link', { name: 'YourDDO on GitHub' })
    expect(github.parentElement).toContain(badge)
    expect(github.parentElement).toContain(screen.getByRole('link', { name: 'YourDDO Discord community' }))
  } finally {
    fetch.mockRestore()
  }
})

it('opens and closes the embedded coffee widget from the sidebar', async () => {
  renderRoute('/', true)
  const title = 'Buy Me a Beer support form'
  expect(screen.queryByTitle(title)).toBeNull()
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Buy Me a Beer' }))
  expect(screen.getByTitle(title).getAttribute('src')).toContain('/widget/page/yourddo?')
  await user.click(screen.getByRole('button', { name: 'Close support widget' }))
  expect(screen.queryByTitle(title)).toBeNull()
})

describe('AppRouter', () => {
  it.each([
    ['/gear-planner', 'Gear Planner', 'Gear Planner'],
    ['/legendary-green-steel', 'Legendary Green Steel', 'Legendary Green Steel'],
    ['/green-steel', 'Heroic Green Steel', 'Heroic Green Steel'],
    ['/essence-crafting', 'Essence Crafting', 'Essence Crafting'],
    ['/saga-tracker', 'Saga Tracker', 'Saga Tracker'],
    ['/viktranium-experiment', 'Viktranium Experiment', 'Viktranium'],
    ['/dinosaur-bone', 'Dinosaur Bone Crafting', 'Dinosaur Bone'],
    ['/alchemical', 'Alchemical Crafting', 'Alchemical Crafting'],
    ['/slave-lords', 'Slave Lords Crafting', 'Slave Lords Crafting'],
    ['/incredible-potential', 'Incredible Potential', 'Incredible Potential'],
    ['/cauldron-of-cadence', 'Cauldron of Cadence', 'Cauldron of Cadence'],
    ['/nearly-complete', 'Nearly Complete', 'Nearly Complete'],
    ['/nearly-finished', 'Nearly Finished', 'Nearly Finished'],
    ['/reavers-fate', "The Reaver's Fate", 'Mastermind'],
    ['/monastery-of-the-scorpion', 'Monastery of the Scorpion', 'Monastery'],
    ['/total-chaos', 'Total Chaos', 'Total Chaos'],
    ['/the-shroud', 'The Shroud', 'Shroud'],
    ['/the-shadow-crypt', 'The Shadow Crypt', 'Shadow Crypt']
  ])('renders %s with active navigation on direct visits and remounts', (path, label, domain) => {
    const checkRoute = () => {
      expect(screen.getByRole('heading', { name: `${domain} domain` })).toBeTruthy()
      expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull()
      const link = screen.getByRole('link', { name: label })
      expect(link.getAttribute('href')).toBe(path)
      expect(link.getAttribute('aria-current')).toBe('page')
    }

    const firstRender = renderRoute(path)
    checkRoute()
    firstRender.unmount()
    renderRoute(path)
    checkRoute()
  })

  it.each(['/nearly-complete', '/reavers-fate', '/monastery-of-the-scorpion', '/total-chaos'])(
    'keeps the sidebar scrollable on %s',
    (path) => {
      renderRoute(path)
      const viewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
      expect(viewport?.style.overflowY).toBe('scroll')
      expect(screen.getAllByRole('main')).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Puzzle Solvers' })).toBeTruthy()
    }
  )

  it.each([
    ['Crafting', 'Essence Crafting', 'Essence Crafting', 'click'],
    ['Tools', 'Saga Tracker', 'Saga Tracker', 'click'],
    ['Crafting', 'Viktranium Experiment', 'Viktranium', 'click'],
    ['Crafting', 'Dinosaur Bone Crafting', 'Dinosaur Bone', 'click'],
    ['Crafting', 'Incredible Potential', 'Incredible Potential', 'keyboard'],
    ['Crafting', 'Nearly Finished', 'Nearly Finished', 'click'],
    ['Crafting', 'Cauldron of Cadence', 'Cauldron of Cadence', 'keyboard'],
    ['Puzzle Solvers', "The Reaver's Fate", 'Mastermind', 'keyboard'],
    ['Puzzle Solvers', 'Monastery of the Scorpion', 'Monastery', 'keyboard'],
    ['Puzzle Solvers', 'Total Chaos', 'Total Chaos', 'keyboard']
  ])('closes mobile navigation after selecting %s > %s', async (group, label, domain, input) => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: group }))
    const link = await screen.findByRole('link', { name: label })
    if (input === 'keyboard') {
      link.focus()
      await user.keyboard('{Enter}')
    } else {
      await user.click(link)
    }
    expect(await screen.findByRole('heading', { name: `${domain} domain` })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('preserves the legacy Mastermind route alias', async () => {
    renderRoute('/the-key-to-the-mythal')

    expect(await screen.findByRole('heading', { name: 'Mastermind domain' })).toBeTruthy()
    expect(screen.getByRole('link', { name: "The Reaver's Fate", hidden: true }).getAttribute('aria-current')).toBe(
      'page'
    )
  })

  it('preserves the legacy Toxic Treatment route alias', async () => {
    localStorage.setItem(recentsKey, JSON.stringify(['/the-shroud', '/toxic-treatment||Toxic Treatment quest']))
    renderRoute('/toxic-treatment')

    expect(await screen.findByRole('heading', { name: 'Monastery domain' })).toBeTruthy()
    expect(readShelf(recentsKey)).toEqual(['/toxic-treatment||Toxic Treatment quest', '/the-shroud'])
    expect(screen.getByRole('link', { name: 'Monastery of the Scorpion' }).getAttribute('aria-current')).toBe('page')
  })

  it('removes one pin from the shelf and updates the directory star', async () => {
    localStorage.setItem(pinsKey, JSON.stringify(['gear-planner', 'the-shroud']))
    renderRoute('/')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Unpin Gear Planner from shelf' }))
    expect(readShelf(pinsKey)).toEqual(['the-shroud'])
    expect(screen.getByRole('button', { name: 'Pin Gear Planner' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Unpin The Shroud from shelf' })).toBeTruthy()
  })

  it('renders the not-found page for an unknown route', () => {
    renderRoute('/unknown-tool')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Return home' }).getAttribute('href')).toBe('/')
  })

  it('toggles the desktop sidebar', async () => {
    const user = userEvent.setup()
    renderRoute('/', true)

    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }))
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeTruthy()
  })

  it.each([
    { layout: 'mobile', desktop: false, toggle: 'Open navigation' },
    { layout: 'desktop', desktop: true, toggle: 'Collapse navigation' }
  ])(
    'exposes $layout navigation and theme controls to the keyboard with Mantine focus styles',
    async ({ desktop, toggle }) => {
      const user = userEvent.setup()
      renderRoute('/nearly-complete', desktop)

      const navigation = screen.getByRole('button', { name: toggle })
      const system = screen.getByRole<HTMLInputElement>('radio', { name: 'System' })

      await user.tab()
      expect(document.activeElement).toBe(navigation)
      expect(navigation.className).toContain('mantine-focus-auto')

      await user.tab()
      expect(document.activeElement).toBe(screen.getByRole('link', { name: 'YourDDO home' }))
      await user.tab()
      expect(document.activeElement).toBe(system)
      expect(system.checked).toBe(true)

      for (const name of ['Light', 'Dark', 'System']) {
        await user.keyboard('{ArrowRight}')
        const option = screen.getByRole<HTMLInputElement>('radio', { name })
        expect(option.checked).toBe(true)
        expect(document.activeElement).toBe(option)
      }
    }
  )

  it('keeps the Cauldron route available in light, dark, and system themes', async () => {
    const user = userEvent.setup()
    renderRoute('/cauldron-of-cadence')

    for (const name of ['Light', 'Dark', 'System']) {
      const option = screen.getByRole<HTMLInputElement>('radio', { name })
      await user.click(option)
      expect(option.checked).toBe(true)
      expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe(
        name === 'Dark' ? 'dark' : 'light'
      )
      expect(screen.getByRole('heading', { name: 'Cauldron of Cadence domain' })).toBeTruthy()
    }
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
