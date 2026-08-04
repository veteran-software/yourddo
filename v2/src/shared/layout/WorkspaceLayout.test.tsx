// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WorkspaceLayout from './WorkspaceLayout'

let desktopViewport = false

const matchMedia = vi.fn((query: string) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  return {
    matches: desktopViewport && query.includes('75em'),
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }
})

type WorkspaceLayoutTestProps = Omit<ComponentProps<typeof WorkspaceLayout>, 'children'> & {
  children?: ComponentProps<typeof WorkspaceLayout>['children']
}

const renderLayout = (props: WorkspaceLayoutTestProps = {}) =>
  render(
    <MantineProvider env='test'>
      <WorkspaceLayout {...props}>{props.children ?? <button type='button'>Main action</button>}</WorkspaceLayout>
    </MantineProvider>
  )

beforeEach(() => {
  vi.stubGlobal('matchMedia', matchMedia)
})

afterEach(() => {
  cleanup()
  desktopViewport = false
  vi.unstubAllGlobals()
})

describe('WorkspaceLayout', () => {
  it('renders main content', () => {
    renderLayout()

    expect(screen.getByRole('button', { name: 'Main action' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Workspace' })).toBeTruthy()
  })

  it('renders without an inspector', () => {
    renderLayout({ children: <p>Only the workspace</p> })

    expect(screen.getByText('Only the workspace')).toBeTruthy()
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps the desktop inspector closed by default', () => {
    desktopViewport = true
    renderLayout({ inspector: <button type='button'>Inspector action</button>, inspectorTitle: 'Summary' })

    expect(screen.getByRole('button', { name: 'Open inspector' })).toBeTruthy()
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens the desktop inspector from its toggle', async () => {
    const user = userEvent.setup()
    desktopViewport = true
    renderLayout({ inspector: <button type='button'>Inspector action</button>, inspectorTitle: 'Summary' })

    await user.click(screen.getByRole('button', { name: 'Open inspector' }))

    expect(await screen.findByRole('complementary', { name: 'Summary' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Inspector action' })).toBeTruthy()
    expect(screen.getByRole('dialog', { name: 'Summary' })).toBeTruthy()
  })

  it('opens a controlled mobile Drawer with an accessible title', async () => {
    renderLayout({
      inspector: <button type='button'>Inspector action</button>,
      inspectorTitle: 'Summary',
      mobileInspectorOpened: true
    })

    expect(await screen.findByRole('dialog', { name: 'Summary' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Inspector action' })).toHaveLength(1)
    expect(screen.getByRole('complementary', { name: 'Summary' })).toBeTruthy()
  })

  it('calls the mobile close handler', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderLayout({
      inspector: <p>Inspector content</p>,
      inspectorTitle: 'Summary',
      mobileInspectorOpened: true,
      onMobileInspectorClose: onClose
    })

    const dialog = screen.getByRole('dialog', { name: 'Summary' })
    await user.click(within(dialog).getByRole('button', { name: 'Close inspector' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not duplicate or leave hidden inspector controls tabbable on mobile', async () => {
    renderLayout({
      inspector: <button type='button'>Inspector action</button>,
      inspectorTitle: 'Summary',
      mobileInspectorOpened: false
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Inspector action' })).toBeNull()
    })
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('uses safe independent overflow styles for the workspace and desktop inspector', async () => {
    desktopViewport = true
    renderLayout({ inspector: <p>Long inspector content</p>, inspectorTitle: 'Summary' })

    const main = screen.getByRole('region', { name: 'Workspace' })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open inspector' }))
    const aside = await screen.findByRole('complementary', { name: 'Summary' })
    expect(main.style.overflow).toBe('auto')
    expect(aside.style.overflow).toBe('auto')
    expect(main.style.minWidth).toBe('0px')
    expect(aside.style.minHeight).toBe('0px')
  })

  it.each([
    [375, 667, false],
    [768, 1024, false],
    [1366, 768, true],
    [1920, 1080, true]
  ])('keeps the layout single-width and responsive at %ix%i', async (width, height, isDesktop) => {
    Object.defineProperties(window, {
      innerWidth: { configurable: true, value: width },
      innerHeight: { configurable: true, value: height }
    })
    desktopViewport = isDesktop

    renderLayout({ inspector: <p>Inspector content</p>, inspectorTitle: 'Summary' })

    expect(screen.getByTestId('workspace-layout').style.overflow).toBe('hidden')
    expect(screen.getByTestId('workspace-main').style.minWidth).toBe('0px')
    if (isDesktop) {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Open inspector' }))
      expect(await screen.findByRole('complementary', { name: 'Summary' })).toBeTruthy()
    } else {
      expect(screen.queryByRole('complementary')).toBeNull()
      expect(screen.queryByRole('dialog')).toBeNull()
    }
  })

  it('has exactly one main landmark', () => {
    render(
      <MantineProvider env='test'>
        <main>
          <WorkspaceLayout>Workspace</WorkspaceLayout>
        </main>
      </MantineProvider>
    )

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('remains compatible with Mantine theme changes', () => {
    const { rerender } = render(
      <MantineProvider env='test' defaultColorScheme='light'>
        <WorkspaceLayout inspector={<p>Inspector</p>} inspectorTitle='Summary'>
          Workspace
        </WorkspaceLayout>
      </MantineProvider>
    )

    rerender(
      <MantineProvider env='test' defaultColorScheme='dark'>
        <WorkspaceLayout inspector={<p>Inspector</p>} inspectorTitle='Summary'>
          Workspace
        </WorkspaceLayout>
      </MantineProvider>
    )

    expect(screen.getByText('Workspace')).toBeTruthy()
  })
})
