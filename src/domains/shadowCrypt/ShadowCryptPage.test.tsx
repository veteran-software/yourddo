// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import ShadowCryptPage from './ShadowCryptPage.tsx'

const renderPage = () =>
  render(
    <MantineProvider env='test' defaultColorScheme='auto'>
      <ShadowCryptPage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('radio', { name: label }))
}

const getRoutePanel = (heading: string): HTMLElement => {
  const panel = screen.getByRole('heading', { name: heading }).closest('section')
  if (!panel) throw new Error(`Could not find the ${heading} route panel.`)
  return panel
}

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn()
  })

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

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('ShadowCryptPage', () => {
  it('starts with prominent accessible setup controls and waits for a room color', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'The Shadow Crypt' })).toBeTruthy()
    expect(screen.getByText('The Necropolis, Part II')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Known issues / bug reports' })).toBeTruthy()
    expect(screen.getByLabelText('1. Starting-room color')).toBeTruthy()
    expect(screen.getByLabelText('2. Route type')).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Red' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Green' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: '12-Gear' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: '8-Gear Duo' })).toBeTruthy()
    expect(screen.getByText('Choose the starting-room color to show the next route instruction.')).toBeTruthy()
  })

  it.each([
    ['Red', 'Move East', 'Step 1 of 15'],
    ['Green', 'Move East', 'Step 1 of 17'],
    ['Blue', 'Dimension Door', 'Step 1 of 16']
  ])('displays the correct 12-Gear route for %s', async (color, currentInstruction, stepCount) => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, color)

    expect(screen.getByRole('heading', { name: `${color} 12-Gear` })).toBeTruthy()
    expect(screen.getByRole('heading', { name: currentInstruction })).toBeTruthy()
    expect(screen.getByText(stepCount)).toBeTruthy()
  })

  it('switches to the independently actionable 8-Gear Duo routes', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    await selectOption(user, '8-Gear Duo')

    expect(screen.getByRole('heading', { name: 'Red 8-Gear Duo' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Group A' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Group B' })).toBeTruthy()
    expect(within(getRoutePanel('Group A')).getByRole('heading', { name: 'Move North' })).toBeTruthy()
    expect(within(getRoutePanel('Group B')).getByRole('heading', { name: 'Move West' })).toBeTruthy()
  })

  it('keeps route and current-instruction headings in a logical hierarchy', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    expect(screen.getByRole('heading', { name: 'The Shadow Crypt' }).tagName).toBe('H1')
    expect(screen.getByRole('heading', { name: 'Red 12-Gear' }).tagName).toBe('H2')
    expect(within(getRoutePanel('Red 12-Gear')).getByRole('heading', { name: 'Move East' }).tagName).toBe('H3')

    await selectOption(user, '8-Gear Duo')
    expect(screen.getByRole('heading', { name: 'Red 8-Gear Duo' }).tagName).toBe('H2')
    expect(screen.getByRole('heading', { name: 'Group A' }).tagName).toBe('H3')
    expect(within(getRoutePanel('Group A')).getByRole('heading', { name: 'Move North' }).tagName).toBe('H4')
  })

  it('advances, backs up, and resets the selected 12-Gear route', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    const route = getRoutePanel('Red 12-Gear')

    await user.click(within(route).getByRole('button', { name: 'Red 12-Gear: Complete step' }))
    expect(within(route).getByText('Step 2 of 15')).toBeTruthy()
    expect(within(route).getByRole('status').textContent).toContain('step 2 of 15')

    await user.click(within(route).getByRole('button', { name: 'Red 12-Gear: Back one step' }))
    expect(within(route).getByText('Step 1 of 15')).toBeTruthy()

    await user.click(within(route).getByRole('button', { name: 'Red 12-Gear: Complete step' }))
    await user.click(within(route).getByRole('button', { name: 'Red 12-Gear: Complete step' }))
    expect(within(route).getByText('Step 3 of 15')).toBeTruthy()

    await user.click(within(route).getByRole('button', { name: 'Reset Red 12-Gear route' }))
    expect(within(route).getByText('Step 1 of 15')).toBeTruthy()
  })

  it('reports route completion after the final step', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    await selectOption(user, '8-Gear Duo')
    const groupA = getRoutePanel('Group A')

    for (let step = 0; step < 5; step++) {
      await user.click(within(groupA).getByRole('button', { name: 'Group A: Complete step' }))
    }

    expect(within(groupA).getByText('Group A route complete')).toBeTruthy()
    expect(within(groupA).getByText('5 of 5 complete')).toBeTruthy()
  })

  it('makes Dimension Door explicit when it is the current route step', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Blue')
    const route = getRoutePanel('Blue 12-Gear')

    expect(within(route).getByRole('heading', { name: 'Dimension Door' })).toBeTruthy()
    expect(
      within(route).getByText(
        'Use Dimension Door to return to the starting room, then continue with the next route step. Do not run backward.'
      )
    ).toBeTruthy()
    expect(within(route).queryByRole('heading', { name: 'DD' })).toBeNull()
  })

  it('keeps Group A and Group B progress independent', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    await selectOption(user, '8-Gear Duo')
    const groupA = getRoutePanel('Group A')
    const groupB = getRoutePanel('Group B')

    await user.click(within(groupA).getByRole('button', { name: 'Group A: Complete step' }))
    expect(within(groupA).getByText('Step 2 of 5')).toBeTruthy()
    expect(within(groupB).getByText('Step 1 of 5')).toBeTruthy()

    await user.click(within(groupB).getByRole('button', { name: 'Group B: Complete step' }))
    expect(within(groupA).getByText('Step 2 of 5')).toBeTruthy()
    expect(within(groupB).getByText('Step 2 of 5')).toBeTruthy()
  })

  it('preserves independent progress when switching route types and colors', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Red')
    const redTwelveGear = getRoutePanel('Red 12-Gear')
    await user.click(within(redTwelveGear).getByRole('button', { name: 'Red 12-Gear: Complete step' }))

    await selectOption(user, '8-Gear Duo')
    const redGroupA = getRoutePanel('Group A')
    await user.click(within(redGroupA).getByRole('button', { name: 'Group A: Complete step' }))
    expect(within(redGroupA).getByText('Step 2 of 5')).toBeTruthy()

    await selectOption(user, 'Green')
    expect(screen.getByRole('heading', { name: 'Green 8-Gear Duo' })).toBeTruthy()
    expect(within(getRoutePanel('Group A')).getByText('Step 1 of 5')).toBeTruthy()

    await selectOption(user, 'Red')
    expect(within(getRoutePanel('Group A')).getByText('Step 2 of 5')).toBeTruthy()

    await selectOption(user, '12-Gear')
    expect(within(getRoutePanel('Red 12-Gear')).getByText('Step 2 of 15')).toBeTruthy()
  })

  it('keeps the gameplay guidance in a secondary expandable help section', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'How to use this pathfinder' }))

    expect(screen.getByText(/first room east of the starting point/i)).toBeTruthy()
    expect(screen.getByText(/Group A goes east to identify the color/i)).toBeTruthy()
    expect(screen.getByText(/Group B waits at the starting point/i)).toBeTruthy()
    expect(screen.getByText(/Do not try to run backward/i)).toBeTruthy()
  })

  it('supports keyboard selection and route advancement with visible Mantine focus handling', async () => {
    const user = userEvent.setup()
    renderPage()

    const red = screen.getByRole<HTMLInputElement>('radio', { name: 'Red' })
    red.focus()
    expect(document.activeElement).toBe(red)
    await user.keyboard(' ')
    expect(red.checked).toBe(true)

    const completeStep = screen.getByRole('button', { name: 'Red 12-Gear: Complete step' })
    completeStep.focus()
    expect(document.activeElement).toBe(completeStep)
    expect(completeStep.className).toContain('mantine-focus-auto')
    await user.keyboard('{Enter}')

    expect(within(getRoutePanel('Red 12-Gear')).getByText('Step 2 of 15')).toBeTruthy()
  })

  it.each([
    [320, 640],
    [375, 667],
    [430, 932],
    [768, 1024],
    [1440, 900]
  ])('keeps Duo controls and current instructions available at %i by %i', async (width, height) => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    await selectOption(user, 'Red')
    await selectOption(user, '8-Gear Duo')

    const groupA = getRoutePanel('Group A')
    const groupB = getRoutePanel('Group B')
    expect(within(groupA).getByRole('heading', { name: 'Move North' })).toBeTruthy()
    expect(within(groupB).getByRole('heading', { name: 'Move West' })).toBeTruthy()
    expect(within(groupA).getByRole('button', { name: 'Group A: Complete step' })).toBeTruthy()
    expect(within(groupB).getByRole('button', { name: 'Group B: Complete step' })).toBeTruthy()
    expect(within(groupA).getByRole('list', { name: 'Group A route overview' })).toBeTruthy()
    expect(within(groupB).getByRole('list', { name: 'Group B route overview' })).toBeTruthy()
  })
})
