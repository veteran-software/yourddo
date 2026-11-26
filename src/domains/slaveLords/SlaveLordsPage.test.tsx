// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SlaveLordsBase, SlaveLordsCost, SlaveLordsData, SlaveLordsOption } from './data'
import { loadSlaveLordsData, SlaveLordsReleaseUnavailable } from './loadSlaveLordsData'
import SlaveLordsPage from './SlaveLordsPage'

vi.mock('./loadSlaveLordsData', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./loadSlaveLordsData')>()),
  loadSlaveLordsData: vi.fn()
}))

const cost: SlaveLordsCost = { id: 1, name: 'Staff Splinter', quantity: 4, sources: ['Slave Pits'] }
const strength = { stat: 'Strength', bonusType: 'Enhancement', value: 5, formattedValue: '+5' }
const prefix: SlaveLordsOption = {
  id: 20,
  category: 'prefix',
  name: "Slaver's Strength",
  description: '',
  effects: [strength],
  slotBonuses: [],
  costs: [cost],
  discrepancies: [],
  augmentTypes: []
}
const set: SlaveLordsOption = {
  ...prefix,
  id: 21,
  category: 'set',
  name: 'Might',
  effects: [],
  setId: 30,
  costs: [{ ...cost, quantity: 2 }]
}
const base: SlaveLordsBase = {
  id: 10,
  name: 'Chains',
  tier: 'heroic',
  kind: 'craftingBlank',
  minimumLevel: 8,
  description: '',
  equipSlots: ['Neck', 'Waist'],
  options: [prefix, set]
}
const data: SlaveLordsData = {
  bases: [
    base,
    { ...base, id: 11, name: 'Spinneret', kind: 'setEquipment', options: [set] },
    { ...base, id: 12, name: 'Legendary Chains', tier: 'legendary', minimumLevel: 28, options: [] }
  ],
  sets: [
    {
      id: 30,
      name: 'Might',
      tier: 'heroic',
      thresholds: [{ pieces: 3, effects: [{ ...strength, stat: 'Melee Power' }] }]
    }
  ]
}
function renderPage() {
  return render(
    <MantineProvider env='test'>
      <SlaveLordsPage />
    </MantineProvider>
  )
}
beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
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
afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})
beforeEach(() => {
  vi.mocked(loadSlaveLordsData).mockReset().mockResolvedValue(data)
})
afterEach(cleanup)

describe('Slave Lords Crafting', () => {
  it('combines materials, previews set thresholds, and clears incompatible upgrades when the base or tier changes', async () => {
    const user = userEvent.setup()
    const select = async (label: string, option: string) => {
      await user.click(await screen.findByRole('combobox', { name: label }))
      await user.click(await screen.findByRole('option', { name: option }))
    }
    renderPage()
    await select('Prefix', prefix.name)
    await select('Equipment set', set.name)
    expect(screen.getByText('3-piece bonus')).toBeTruthy()
    expect(screen.getByText('Melee Power')).toBeTruthy()
    const checklist = within(screen.getByRole('region', { name: 'Ingredient checklist' }))
    expect(checklist.getByText('×6')).toBeTruthy()
    expect(checklist.queryByText('Slave Pits')).toBeNull()
    await select('Item', 'Spinneret')
    expect(screen.queryByRole('combobox', { name: 'Prefix' })).toBeNull()
    expect(checklist.queryByText(cost.name)).toBeNull()
    await user.click(screen.getByText('Legendary', { selector: 'label *' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item' }).value).toBe('Legendary Chains')
  })
  it('offers to check for a new release when recipes have not been published', async () => {
    vi.mocked(loadSlaveLordsData).mockRejectedValueOnce(new SlaveLordsReleaseUnavailable())
    renderPage()
    expect(await screen.findByRole('button', { name: 'Reload page' })).toBeTruthy()
  })
  it('retries a failed release and opens the workbench', async () => {
    vi.mocked(loadSlaveLordsData).mockRejectedValueOnce(new Error('Manifest unavailable'))
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('combobox', { name: 'Item' })).toBeTruthy()
    expect(loadSlaveLordsData).toHaveBeenCalledTimes(2)
  })
})
