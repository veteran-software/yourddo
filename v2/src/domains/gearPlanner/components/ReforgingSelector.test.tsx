// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { GearPlannerItem } from '../gearPlanner.types.ts'
import type { GearPlannerReforgingData } from '../reforging.ts'
import ReforgingSelector from './ReforgingSelector.tsx'

const data: GearPlannerReforgingData = {
  recipesByItemName: new Map([
    [
      'Toggle Item',
      [
        {
          itemName: 'Toggle Item',
          stage: 'nearly-finished',
          kind: 'toggle',
          choices: []
        }
      ]
    ],
    [
      'Choice Item',
      [
        {
          itemName: 'Choice Item',
          stage: 'almost-there',
          kind: 'choice',
          choices: [{ id: 'label:Arcane +2', label: 'Arcane +2', effect: { name: 'Arcane', modifier: '2' } }]
        }
      ]
    ]
  ]),
  tierRecordsByItemName: new Map(),
  unsupportedStages: []
}

const item = (name: string): GearPlannerItem => ({
  id: name,
  slot: 'Trinket',
  sourceFile: 'trinket.json',
  minimumLevel: 10,
  source: { name }
})

const renderSelector = (name: string, onChange = vi.fn()) => {
  const view = render(
    <MantineProvider env='test'>
      <ReforgingSelector item={item(name)} data={data} selected={undefined} onChange={onChange} />
    </MantineProvider>
  )
  return { ...view, onChange }
}

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      media: '',
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

afterAll(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  cleanup()
})

describe('ReforgingSelector', () => {
  it('does not render unsupported stages and renders a toggle recipe as a switch', () => {
    const unsupported = renderSelector('Unsupported')
    expect(unsupported.queryByTestId('reforging-Unsupported')).toBeNull()
    const { onChange } = renderSelector('Toggle Item')
    const control = screen.getByLabelText('Nearly Finished applied')
    fireEvent.click(control)
    expect(onChange).toHaveBeenCalledWith('nearly-finished', { kind: 'active' })
  })

  it('renders a choice recipe with clearable None state', () => {
    renderSelector('Choice Item')
    const control = screen.getByRole('combobox')
    expect(control.getAttribute('placeholder')).toBe('None')
  })
})
