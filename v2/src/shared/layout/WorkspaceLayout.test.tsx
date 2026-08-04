// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WorkspaceLayout, { type WorkspaceTool } from './WorkspaceLayout'

let desktopViewport = false

const matchMedia = vi.fn((query: string) => ({
  matches: desktopViewport && query.includes('75em'),
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn()
}))

const tools: readonly WorkspaceTool[] = [
  { id: 'finished', label: 'Finished Item', icon: <span>F</span>, content: <p>Finished content</p> },
  { id: 'ingredients', label: 'Ingredients', icon: <span>I</span>, content: <p>Ingredients content</p> },
  { id: 'shopping', label: 'Shopping List', icon: <span>S</span>, content: <p>Shopping content</p> }
]

const renderLayout = (
  props: { children?: ReactNode; tools?: readonly WorkspaceTool[]; defaultActiveToolId?: string } = {}
) =>
  render(
    <MantineProvider env='test'>
      <WorkspaceLayout {...props}>{props.children ?? <button type='button'>Main action</button>}</WorkspaceLayout>
    </MantineProvider>
  )

const rail = () => screen.getByRole('navigation', { name: 'Workspace tools' })

beforeEach(() => {
  vi.stubGlobal('matchMedia', matchMedia)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        return undefined
      }
      unobserve() {
        return undefined
      }
      disconnect() {
        return undefined
      }
    }
  )
})

afterEach(() => {
  cleanup()
  desktopViewport = false
  vi.unstubAllGlobals()
})

describe('WorkspaceLayout', () => {
  it('renders main content without tools', () => {
    renderLayout()

    expect(screen.getByRole('button', { name: 'Main action' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Workspace' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Workspace tools' })).toBeNull()
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders the desktop rail and closes the panel by default', () => {
    desktopViewport = true
    renderLayout({ tools })

    expect(within(rail()).getByRole('button', { name: 'Finished Item' })).toBeTruthy()
    expect(within(rail()).getByRole('button', { name: 'Ingredients' })).toBeTruthy()
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders accessible rail controls in dark mode', () => {
    desktopViewport = true
    render(
      <MantineProvider env='test' defaultColorScheme='dark'>
        <WorkspaceLayout tools={tools}>Workspace</WorkspaceLayout>
      </MantineProvider>
    )

    const button = within(rail()).getByRole('button', { name: 'Finished Item' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the valid default tool and ignores an invalid default', () => {
    desktopViewport = true
    const { unmount } = renderLayout({ tools, defaultActiveToolId: 'ingredients' })
    expect(screen.getByRole('complementary', { name: 'Ingredients' })).toBeTruthy()
    expect(screen.getByText('Ingredients content')).toBeTruthy()

    unmount()
    renderLayout({ tools, defaultActiveToolId: 'missing' })
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('opens, switches, and closes desktop tools', async () => {
    desktopViewport = true
    renderLayout({ tools })
    const user = userEvent.setup()
    const desktopButtons = within(rail()).getAllByRole('button')

    await user.click(desktopButtons[0])
    expect(screen.getByRole('complementary', { name: 'Finished Item' })).toBeTruthy()
    await user.click(desktopButtons[1])
    expect(screen.getByRole('complementary', { name: 'Ingredients' })).toBeTruthy()
    expect(screen.queryByText('Finished content')).toBeNull()
    expect(screen.getByText('Ingredients content')).toBeTruthy()
    await user.click(desktopButtons[1])
    expect(screen.queryByRole('complementary')).toBeNull()

    await user.click(desktopButtons[2])
    await user.click(screen.getByRole('button', { name: 'Close Shopping List' }))
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('animates the desktop tool panel width when toggled', async () => {
    desktopViewport = true
    renderLayout({ tools })
    const user = userEvent.setup()
    const panel = screen.getByTestId('workspace-tool-panel')
    const finishedButton = within(rail()).getByRole('button', { name: 'Finished Item' })

    expect(panel.style.width).toBe('0rem')
    expect(panel.style.visibility).toBe('hidden')
    await user.click(finishedButton)
    expect(panel.style.width).toBe('22rem')
    expect(panel.style.visibility).toBe('visible')
    expect(panel.style.transition).toContain('width 220ms ease')

    await user.click(finishedButton)
    expect(panel.style.width).toBe('0rem')
    expect(panel.style.visibility).toBe('hidden')
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('gives the panel the active tool name and mounts only active content', async () => {
    desktopViewport = true
    renderLayout({ tools })
    await userEvent.setup().click(within(rail()).getAllByRole('button')[0])

    const panel = screen.getByRole('complementary', { name: 'Finished Item' })
    expect(panel).toBeTruthy()
    expect(within(panel).getByText('Finished content')).toBeTruthy()
    expect(screen.queryByText('Ingredients content')).toBeNull()
    expect(screen.queryByText('Shopping content')).toBeNull()
    expect(screen.getByTestId('workspace-tool-panel-content')).toBeTruthy()
    expect(within(rail()).getByRole('button', { name: 'Finished Item' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps an expanded rail available without an active panel', async () => {
    desktopViewport = true
    renderLayout({ tools })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Expand workspace tool labels' }))

    expect(screen.queryByRole('complementary')).toBeNull()
    expect(within(rail()).getByText('Finished Item')).toBeTruthy()
    expect(within(rail()).getByText('Ingredients')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Collapse workspace tool labels' }).getAttribute('aria-expanded')).toBe(
      'true'
    )
  })

  it('contains expanded labels within the fixed-width rail', async () => {
    desktopViewport = true
    const longLabelTools: readonly WorkspaceTool[] = [
      ...tools,
      {
        id: 'breakdown',
        label: 'A crafting breakdown label that is wider than the rail',
        icon: <span>B</span>,
        content: <p>Breakdown content</p>
      }
    ]
    renderLayout({ tools: longLabelTools })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Expand workspace tool labels' }))

    const layout = screen.getByTestId('workspace-layout')
    const expandedRail = screen.getByTestId('workspace-tool-rail')
    const longLabelButton = within(expandedRail).getByRole('button', { name: longLabelTools[3].label })
    const buttonLabel = longLabelButton.querySelector<HTMLElement>('.mantine-Button-label')
    const labelText = buttonLabel?.firstElementChild as HTMLElement | undefined
    const iconSections = Array.from(expandedRail.querySelectorAll<HTMLElement>('.mantine-Button-section'))

    expect(layout.style.overflow).toBe('hidden')
    expect(expandedRail.style.width).toBe('11rem')
    expect(expandedRail.style.minWidth).toBe('11rem')
    expect(expandedRail.style.maxWidth).toBe('11rem')
    expect(expandedRail.style.overflow).toBe('hidden')
    expect(longLabelButton.style.minWidth).toBe('0px')
    expect(buttonLabel?.style.display).toBe('flex')
    expect(buttonLabel?.style.alignItems).toBe('center')
    expect(labelText?.style.textOverflow).toBe('ellipsis')
    expect(iconSections).toHaveLength(longLabelTools.length)
    expect(iconSections.every((section) => section.style.width === '1.5rem')).toBe(true)
  })

  it('expands and collapses rail labels without changing the active tool', async () => {
    desktopViewport = true
    renderLayout({ tools, defaultActiveToolId: 'ingredients' })
    const user = userEvent.setup()
    const toggle = () => screen.getByRole('button', { name: /workspace tool labels/ })

    expect(within(rail()).queryByText('Ingredients')).toBeNull()
    await user.click(toggle())
    expect(within(rail()).getByText('Ingredients')).toBeTruthy()
    expect(screen.getByRole('complementary', { name: 'Ingredients' })).toBeTruthy()
    await user.click(toggle())
    expect(within(rail()).queryByText('Ingredients')).toBeNull()
    expect(within(rail()).getAllByRole('button')[1].getAttribute('aria-label')).toBe('Ingredients')
  })

  it('preserves tool order and handles duplicate IDs deterministically', () => {
    desktopViewport = true
    const duplicateTools: readonly WorkspaceTool[] = [
      { id: 'same', label: 'First', icon: <span>1</span>, content: <p>First content</p> },
      { id: 'same', label: 'Second', icon: <span>2</span>, content: <p>Second content</p> }
    ]
    renderLayout({ tools: duplicateTools, defaultActiveToolId: 'same' })

    const buttons = within(rail()).getAllByRole('button')
    expect(buttons[0].getAttribute('aria-label')).toBe('First')
    expect(buttons[1].getAttribute('aria-label')).toBe('Second')
    expect(screen.getByText('First content')).toBeTruthy()
    expect(screen.queryByText('Second content')).toBeNull()
  })

  it('opens and switches the mobile Drawer without duplicating content', async () => {
    renderLayout({ tools })
    const user = userEvent.setup()
    const strip = screen.getByTestId('workspace-mobile-tools')
    const openingButton = within(strip).getByRole('button', { name: 'Finished Item' })
    expect(within(strip).getByText('Finished Item')).toBeTruthy()
    expect(within(strip).getByText('Ingredients')).toBeTruthy()

    await user.click(openingButton)
    expect(await screen.findByRole('dialog', { name: 'Finished Item' })).toBeTruthy()
    expect(screen.getAllByText('Finished content')).toHaveLength(1)

    const dialog = screen.getByRole('dialog', { name: 'Finished Item' })
    await user.click(within(dialog).getByRole('button', { name: 'Ingredients' }))
    expect(await screen.findByRole('dialog', { name: 'Ingredients' })).toBeTruthy()
    expect(screen.getAllByText('Ingredients content')).toHaveLength(1)
    expect(screen.queryByText('Finished content')).toBeNull()

    await user.click(within(dialog).getByRole('button', { name: 'Ingredients' }))
    expect(screen.getByRole('dialog', { name: 'Ingredients' })).toBeTruthy()
  })

  it('clears mobile state and returns focus to the opening trigger', async () => {
    renderLayout({ tools })
    const user = userEvent.setup()
    const openingButton = within(screen.getByTestId('workspace-mobile-tools')).getByRole('button', {
      name: 'Finished Item'
    })
    await user.click(openingButton)
    const dialog = await screen.findByRole('dialog', { name: 'Finished Item' })
    await user.click(within(dialog).getByRole('button', { name: 'Close workspace tool' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(openingButton)
  })

  it.each([
    [375, 667, false],
    [768, 1024, false],
    [1366, 768, true],
    [1920, 1080, true]
  ])('uses the expected responsive mode at %ix%i', (width, height, isDesktop) => {
    Object.defineProperties(window, {
      innerWidth: { configurable: true, value: width },
      innerHeight: { configurable: true, value: height }
    })
    desktopViewport = isDesktop
    renderLayout({ tools })

    if (isDesktop) {
      expect(screen.queryByTestId('workspace-tool-rail')).not.toBeNull()
      expect(screen.queryByTestId('workspace-mobile-tools')).toBeNull()
    } else {
      expect(screen.queryByTestId('workspace-tool-rail')).toBeNull()
      expect(screen.queryByTestId('workspace-mobile-tools')).not.toBeNull()
    }
  })

  it('handles removed active tools safely and retains one main landmark', () => {
    desktopViewport = true
    const { rerender } = render(
      <MantineProvider env='test'>
        <main>
          <WorkspaceLayout tools={tools} defaultActiveToolId='finished'>
            Workspace
          </WorkspaceLayout>
        </main>
      </MantineProvider>
    )
    expect(screen.getByRole('complementary', { name: 'Finished Item' })).toBeTruthy()
    rerender(
      <MantineProvider env='test'>
        <main>
          <WorkspaceLayout tools={tools.slice(1)} defaultActiveToolId='finished'>
            Workspace
          </WorkspaceLayout>
        </main>
      </MantineProvider>
    )
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('does not remount workspace content when tools switch or the theme changes', async () => {
    desktopViewport = true
    const onMount = vi.fn()
    const onUnmount = vi.fn()
    const MainProbe = () => {
      useEffect(() => {
        onMount()
        return onUnmount
      }, [])
      return <p>Main workspace</p>
    }
    const { rerender } = render(
      <MantineProvider env='test' defaultColorScheme='light'>
        <WorkspaceLayout tools={tools}>
          <MainProbe />
        </WorkspaceLayout>
      </MantineProvider>
    )
    const user = userEvent.setup()
    await user.click(within(rail()).getAllByRole('button')[0])
    await user.click(within(rail()).getAllByRole('button')[1])
    expect(onMount).toHaveBeenCalledOnce()
    expect(onUnmount).not.toHaveBeenCalled()
    rerender(
      <MantineProvider env='test' defaultColorScheme='dark'>
        <WorkspaceLayout tools={tools}>
          <MainProbe />
        </WorkspaceLayout>
      </MantineProvider>
    )
    expect(onMount).toHaveBeenCalledOnce()
    expect(onUnmount).not.toHaveBeenCalled()
    expect(screen.getByText('Main workspace')).toBeTruthy()
  })
})
