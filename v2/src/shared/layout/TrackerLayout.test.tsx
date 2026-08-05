// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TrackerLayout from './TrackerLayout'

interface LayoutProps {
  description?: ReactNode
  summary?: ReactNode
  controls?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

const renderLayout = ({ children = <div>Main content</div>, ...props }: LayoutProps = {}) =>
  render(
    <MantineProvider env='test'>
      <TrackerLayout title='Tracker title' {...props}>
        {children}
      </TrackerLayout>
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
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('TrackerLayout', () => {
  it('renders the title as the primary page heading', () => {
    renderLayout()

    expect(screen.getByRole('heading', { level: 1, name: 'Tracker title' })).toBeTruthy()
  })

  it('renders children inside the main content region', () => {
    renderLayout()

    const main = screen.getByRole('main')
    expect(main.textContent).toContain('Main content')
  })

  it('renders optional description content', () => {
    renderLayout({ description: <span>Description content</span> })

    expect(screen.getByText('Description content')).toBeTruthy()
  })

  it('renders optional summary content', () => {
    renderLayout({ summary: <div>Summary content</div> })

    expect(screen.getByText('Summary content')).toBeTruthy()
  })

  it('renders optional controls content', () => {
    renderLayout({ controls: <label>Controls content</label> })

    expect(screen.getByText('Controls content')).toBeTruthy()
  })

  it('renders optional actions content', () => {
    renderLayout({ actions: <button type='button'>Actions content</button> })

    expect(screen.getByRole('button', { name: 'Actions content' })).toBeTruthy()
  })

  it('renders every optional section together', () => {
    renderLayout({
      description: <span>Description content</span>,
      summary: <div>Summary content</div>,
      controls: <div>Controls content</div>,
      actions: <button type='button'>Actions content</button>
    })

    expect(screen.getByText('Description content')).toBeTruthy()
    expect(screen.getByText('Summary content')).toBeTruthy()
    expect(screen.getByText('Controls content')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Actions content' })).toBeTruthy()
  })

  it('does not render empty containers for omitted optional sections', () => {
    const { container } = renderLayout()
    const header = container.querySelector('header')

    expect(header).not.toBeNull()
    expect(header?.querySelectorAll('div:empty')).toHaveLength(0)
  })

  it('renders supplied prop content exactly once', () => {
    renderLayout({
      description: <span>Description content</span>,
      summary: <div>Summary content</div>,
      controls: <div>Controls content</div>,
      actions: <button type='button'>Actions content</button>,
      children: <div>Main content</div>
    })

    for (const content of [
      'Description content',
      'Summary content',
      'Controls content',
      'Actions content',
      'Main content'
    ]) {
      expect(screen.getAllByText(content)).toHaveLength(1)
    }
  })
})
