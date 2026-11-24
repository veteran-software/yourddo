// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AlchemicalBase, AlchemicalCost, AlchemicalData, AlchemicalRecipe } from './data'
import { AlchemicalReleaseUnavailable, loadAlchemicalData } from './loadAlchemicalData'
import { copyText } from '../../shared/serialization/browser'
import AlchemicalPage from './AlchemicalPage'

vi.mock('../../shared/serialization/browser', async (original) => ({
  ...(await original<typeof import('../../shared/serialization/browser')>()),
  copyText: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('./loadAlchemicalData', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./loadAlchemicalData')>()),
  loadAlchemicalData: vi.fn()
}))

const splinter: AlchemicalCost = { id: 1, name: 'Metal Ingot', quantity: 2, sources: ['Master Artificer'] }
const red: AlchemicalBase = {
  id: 11,
  name: 'Alchemical Scimitar',
  family: 'original',
  type: 'Weapon',
  ingredientType: 'weapon',
  material: 'Steel',
  effects: [],
  effectIds: [50],
  minimumLevel: 12,
  equipSlots: ['Weapon1'],
  sources: ['Master Artificer'],
  costs: [],
  description: ''
}
const blue: AlchemicalBase = { ...red, id: 12, name: 'Legendary Alchemical Orb', family: 'legendary', minimumLevel: 29 }
const silver: AlchemicalRecipe = {
  id: 20,
  name: 'Reforge Silver',
  stage: 'material',
  family: 'original',
  keeper: { ingredientType: 'weapon', requiredMutationIds: [50] },
  addEffectIds: [51],
  removeMutationIds: [50],
  description: '',
  effects: [],
  device: 'Binding Station',
  costs: [splinter],
  discrepancies: []
}
const fire: AlchemicalRecipe = {
  ...silver,
  id: 21,
  name: 'Bind Fire',
  stage: 'tier1',
  keeper: { ingredientType: 'weapon', requiredMutationIds: [51] },
  addEffectIds: [61],
  removeMutationIds: [51],
  effects: [{ id: 61, name: 'Flaming', description: 'Deals fire damage.', stats: [], augmentTypes: [] }]
}
const data: AlchemicalData = {
  bases: [red, blue],
  recipes: [silver, fire],
  components: [
    { id: 70, name: 'Bind an elemental', device: 'Forging Station', outputItemId: 90, quantity: 1, costs: [splinter] }
  ],
  exchanges: [
    {
      id: 80,
      name: 'Khyber Dragonshard of Air',
      device: 'Melting Station',
      costs: [splinter],
      rewards: [{ table: 'Treasure_Array', name: 'Air Spirit', quantity: '2d4', percentile: 25 }]
    }
  ]
}
function renderPage(path = '/alchemical') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MantineProvider env='test'>
        <AlchemicalPage />
      </MantineProvider>
    </MemoryRouter>
  )
}
beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
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
  vi.mocked(loadAlchemicalData).mockReset().mockResolvedValue(data)
})
afterEach(cleanup)

describe('Alchemical Crafting', () => {
  it('opens the linked binding progression, combines costs, and resets the workbench for a new system', async () => {
    const user = userEvent.setup()
    renderPage('/alchemical?base=11&recipes=20,21,999')
    expect((await screen.findByRole<HTMLInputElement>('combobox', { name: 'Tier 1' })).value).toBe('Bind Fire')
    await user.click(screen.getByRole('button', { name: 'Binding Effects' }))
    expect(screen.getByText('Flaming')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Ingredient Checklist' }))
    const checklist = within(screen.getByRole('complementary', { name: 'Ingredient Checklist' }))
    expect(checklist.getByText('×4')).toBeTruthy()
    await user.click(screen.getByText('Legendary', { selector: 'label *' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Weapon or shield' }).value).toBe(blue.name)
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 1' }).disabled).toBe(true)
    expect(checklist.queryByText(splinter.name)).toBeNull()
  })
  it('opens and closes only the focused binding’s ingredients with the keyboard', async () => {
    const user = userEvent.setup()
    renderPage('/alchemical?base=11&recipes=20,21')
    const toggle = await screen.findByRole('button', { name: 'Show recipe ingredients for Material binding' })
    const tierToggle = screen.getByRole('button', { name: 'Show recipe ingredients for Tier 1' })
    const ingredientList = () =>
      screen.queryByRole('list', { name: 'Recipe ingredients for Material binding', hidden: true })
    expect(ingredientList()).toBeNull()
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(tierToggle.getAttribute('aria-expanded')).toBe('false')
    expect(ingredientList()?.id).toBe(toggle.getAttribute('aria-controls'))
    expect(screen.getByText('Metal Ingot')).toBeTruthy()
    await user.keyboard(' ')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(ingredientList()).toBeNull()
    expect(screen.queryByText('Metal Ingot')).toBeNull()
  })
  it('unlocks the next tier only after a valid binding and clears dependent upgrades', async () => {
    const user = userEvent.setup()
    renderPage('/alchemical?base=11&recipes=21,20')
    const tier = await screen.findByRole<HTMLInputElement>('combobox', { name: 'Tier 1' })
    expect(tier.disabled).toBe(true)
    await user.click(screen.getByRole('combobox', { name: 'Material binding' }))
    await user.click(await screen.findByRole('option', { name: 'Reforge Silver' }))
    expect(tier.disabled).toBe(false)
    await user.click(tier)
    await user.click(await screen.findByRole('option', { name: 'Bind Fire' }))
    await user.click(screen.getByRole('button', { name: 'Binding Effects' }))
    expect(screen.getByText('Flaming')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Clear bindings' }))
    expect(tier.disabled).toBe(true)
    expect(screen.queryByText('Flaming')).toBeNull()
  })
  it('shares and restores a build from the last workspace tool', async () => {
    const user = userEvent.setup()
    renderPage('/alchemical?base=11&recipes=20,21')
    const rail = within(await screen.findByRole('navigation', { name: 'Workspace tools' }))
    expect(
      rail
        .getAllByRole('button')
        .filter((b) => b.hasAttribute('aria-pressed'))
        .at(-1)
        ?.getAttribute('aria-label')
    ).toBe('Sharing')
    await user.click(rail.getByRole('button', { name: 'Sharing' }))
    const panel = within(screen.getByRole('complementary', { name: 'Sharing' }))
    await user.click(panel.getByRole('button', { name: 'Copy Permalink' }))
    const link = new URL(vi.mocked(copyText).mock.lastCall?.[0] ?? '')
    expect(link.pathname).toBe('/alchemical')
    expect(link.search).toMatch(/^\?build=1\.[A-Za-z0-9]+$/)
    for (const [button, text] of [
      ['Copy Discord', '**Alchemical Scimitar · ML 12**'],
      ['Copy Forum', '[b]Alchemical Scimitar · ML 12[/b]']
    ]) {
      await user.click(panel.getByRole('button', { name: button }))
      expect(vi.mocked(copyText).mock.lastCall?.[0]).toContain(text)
      expect(vi.mocked(copyText).mock.lastCall?.[0]).toContain(link.href)
    }
    await user.click(panel.getByRole('button', { name: 'Copy JSON' }))
    const json = vi.mocked(copyText).mock.lastCall?.[0]
    if (!json) throw new Error('Expected a copied build')
    await user.click(screen.getByRole('button', { name: 'Clear bindings' }))
    const input = panel.getByRole('textbox', { name: 'Paste Alchemical JSON' })
    await user.click(input)
    await user.paste(json)
    await user.click(panel.getByRole('button', { name: 'Load Build' }))
    const tier = screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 1' })
    expect(tier.value).toBe('Bind Fire')
    await user.clear(input)
    await user.paste(json.replace('21', '999'))
    await user.click(panel.getByRole('button', { name: 'Load Build' }))
    expect(panel.getByRole('alert').textContent).toContain('incompatible binding')
    expect(tier.value).toBe('Bind Fire')
    cleanup()
    renderPage(link.pathname + link.search)
    expect((await screen.findByRole<HTMLInputElement>('combobox', { name: 'Tier 1' })).value).toBe('Bind Fire')
  })
  it('lets players look up a component or exchange separately from their item', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('tab', { name: 'Components' }))
    await user.click(screen.getByRole('combobox', { name: 'Component to craft' }))
    await user.click(await screen.findByRole('option', { name: 'Bind an elemental' }))
    expect(screen.getByText('Makes 1')).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Exchanges' }))
    await user.click(screen.getByRole('combobox', { name: 'Ingredient to exchange' }))
    await user.click(await screen.findByRole('option', { name: 'Khyber Dragonshard of Air' }))
    expect(screen.getByText('Air Spirit ×2d4')).toBeTruthy()
  })
  it('checks for a newer release when the catalog is absent', async () => {
    vi.mocked(loadAlchemicalData).mockRejectedValueOnce(new AlchemicalReleaseUnavailable())
    renderPage()
    expect(await screen.findByRole('button', { name: 'Reload page' })).toBeTruthy()
  })
  it('retries an unavailable release', async () => {
    vi.mocked(loadAlchemicalData).mockRejectedValueOnce(new Error('Unavailable'))
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('tab', { name: 'Workbench' })).toBeTruthy()
  })
})
