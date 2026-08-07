// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SidebarNavigation from './SidebarNavigation'

interface RenderSidebarOptions {
  pathname?: string
  includeRouteChangeControl?: boolean
}

const RouteChangeControl = () => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      onClick={() => {
        void navigate('/essence-crafting')
      }}
    >
      Go to Essence Crafting
    </button>
  )
}

const renderSidebar = ({ pathname = '/', includeRouteChangeControl = false }: RenderSidebarOptions = {}) => {
  const onNavigate = vi.fn()

  render(
    <MantineProvider env='test'>
      <MemoryRouter initialEntries={[pathname]}>
        {includeRouteChangeControl && <RouteChangeControl />}
        <SidebarNavigation onNavigate={onNavigate} />
      </MemoryRouter>
    </MantineProvider>
  )

  return onNavigate
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SidebarNavigation', () => {
  it('keeps Home as a standalone link', () => {
    renderSidebar()

    const home = screen.getByRole('link', { name: 'Home' })
    expect(home.getAttribute('href')).toBe('/')
    expect(home.getAttribute('aria-current')).toBe('page')
  })

  it('renders groups as accessible, collapsed menu controls when no child route is active', () => {
    renderSidebar()

    for (const label of ['Tools', 'Crafting', 'Puzzle Solvers']) {
      const group = screen.getByRole('button', { name: label })
      expect(group.getAttribute('aria-expanded')).toBe('false')
    }

    expect(screen.queryByRole('link', { name: 'Essence Crafting' })).toBeNull()
  })

  it('starts the group containing the current route expanded and keeps its child active', () => {
    renderSidebar({ pathname: '/essence-crafting' })

    expect(screen.getByRole('button', { name: 'Crafting' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Essence Crafting' }).getAttribute('aria-current')).toBe('page')
  })

  it('expands and collapses an individual menu without navigating', async () => {
    const user = userEvent.setup()
    const onNavigate = renderSidebar()
    const crafting = screen.getByRole('button', { name: 'Crafting' })

    await user.click(crafting)
    expect(crafting.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Essence Crafting', hidden: true })).toBeTruthy()

    await user.click(crafting)
    expect(crafting.getAttribute('aria-expanded')).toBe('false')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('allows multiple menus to remain expanded', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Tools' }))
    await user.click(screen.getByRole('button', { name: 'Crafting' }))

    expect(screen.getByRole('button', { name: 'Tools' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'Crafting' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('alphabetizes submenu items without changing the group order', () => {
    renderSidebar({ pathname: '/essence-crafting' })

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Tools',
      'Crafting',
      'Puzzle Solvers'
    ])
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Home',
      'Cauldron of Cadence',
      'Dinosaur Bone Crafting',
      'Essence Crafting',
      'Heroic Green Steel',
      'Incredible Potential',
      'Legendary Green Steel',
      'Nearly Complete',
      'Nearly Finished',
      'Viktranium Experiment'
    ])
  })

  it('calls onNavigate when a submenu link is selected', async () => {
    const user = userEvent.setup()
    const onNavigate = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Tools' }))
    await user.click(screen.getByRole('link', { name: 'Saga Tracker', hidden: true }))

    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('calls onNavigate when Home is selected', async () => {
    const user = userEvent.setup()
    const onNavigate = renderSidebar({ pathname: '/saga-tracker' })

    await user.click(screen.getByRole('link', { name: 'Home' }))

    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('opens the destination group when the pathname changes', async () => {
    const user = userEvent.setup()
    renderSidebar({ pathname: '/saga-tracker', includeRouteChangeControl: true })

    expect(screen.getByRole('button', { name: 'Tools' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'Crafting' }).getAttribute('aria-expanded')).toBe('false')

    await user.click(screen.getByRole('button', { name: 'Go to Essence Crafting' }))

    expect(screen.getByRole('button', { name: 'Tools' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'Crafting' }).getAttribute('aria-expanded')).toBe('true')
  })
})
