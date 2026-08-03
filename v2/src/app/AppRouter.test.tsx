// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import AppRouter from './AppRouter'

vi.mock('../domains/nearlyComplete/NearlyCompletePage.tsx', () => ({
  default: () => <h1>Nearly Complete domain</h1>
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
  it('renders the Nearly Complete domain at its public route', () => {
    renderRoute('/nearly-complete')

    expect(screen.getByRole('heading', { name: 'Nearly Complete domain' })).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Nearly Complete' })
    expect(link.getAttribute('href')).toBe('/nearly-complete')
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(screen.getAllByRole('main')).toHaveLength(1)

    const sidebarViewport = screen.getByRole('navigation').querySelector<HTMLElement>('[data-scrollarea-viewport]')
    expect(sidebarViewport?.style.overflowY).toBe('scroll')
    expect(screen.getByRole('link', { name: 'Total Chaos' })).toBeTruthy()
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

    const link = screen.getByRole('link', { name: 'Nearly Complete' })
    link.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy()
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

  it('keeps the route available in light, dark, and system themes', async () => {
    const user = userEvent.setup()
    renderRoute('/nearly-complete')

    const chooseTheme = async (current: string, next: string) => {
      await user.click(screen.getByRole('button', { name: `Theme: ${current}` }))
      await user.click(screen.getByRole('menuitem', { name: next }))
      expect(screen.getByRole('button', { name: `Theme: ${next}` })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Nearly Complete domain' })).toBeTruthy()
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
