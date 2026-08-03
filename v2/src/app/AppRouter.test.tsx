// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
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

afterEach(cleanup)

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

    const burgers = Array.from(document.querySelectorAll('button')).filter((button) =>
      button.querySelector('[data-reduce-motion]')
    )
    const [mobileBurger, desktopBurger] = burgers

    expect(burgers).toHaveLength(2)
    expect(desktopBurger.querySelector('[data-opened]')).toBeTruthy()

    await user.click(desktopBurger)
    expect(desktopBurger.querySelector('[data-opened]')).toBeNull()

    await user.click(mobileBurger)
    expect(mobileBurger.querySelector('[data-opened]')).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Nearly Complete' })
    await user.click(link)

    expect(mobileBurger.querySelector('[data-opened]')).toBeNull()
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('keeps the route available in light, dark, and system themes', async () => {
    const user = userEvent.setup()
    renderRoute('/nearly-complete')

    const chooseTheme = async (current: string, next: string) => {
      await user.click(screen.getByRole('button', { name: current }))
      await user.click(screen.getByRole('menuitem', { name: next }))
      expect(screen.getByRole('button', { name: next })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Nearly Complete domain' })).toBeTruthy()
    }

    await chooseTheme('System', 'Light')
    await chooseTheme('Light', 'Dark')
    await chooseTheme('Dark', 'System')
  })
})
