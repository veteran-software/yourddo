// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import { createViktraniumTestData, createViktraniumTestRecords } from './test-fixture.ts'
import ViktraniumPage from './ViktraniumPage.tsx'

let desktopViewport = false
const loadMock = vi.hoisted(() => vi.fn())
const decodeImage = vi.fn<() => Promise<undefined>>().mockResolvedValue(undefined)

vi.mock('../../shared/data/loadDataset', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/data/loadDataset')>()),
  loadDatasetFile: vi.fn()
}))

vi.mock('./data.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data.ts')>()
  return { ...actual, loadViktraniumData: loadMock }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  HTMLImageElement.prototype.decode = decodeImage
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: desktopViewport && query.includes('75em'),
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

const data = () => createViktraniumTestData()
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing test fixture value')
  return value
}
const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <ViktraniumPage />
    </MantineProvider>
  )

const chooseHeroicItem = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('combobox', { name: 'Item' }))
  await user.click(await screen.findByRole('option', { name: /Sceptre \(Cruel Baton\)/ }))
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  desktopViewport = false
})

describe('ViktraniumPage', () => {
  it('reveals the catalog icon on the crafting page after every layer decodes', async () => {
    const fixture = createViktraniumTestRecords()
    fixture.items[0].art = { domain: 'viktranium', layers: [11, 22] }
    loadMock.mockResolvedValue(createViktraniumTestData(fixture))
    vi.mocked(loadDatasetFile).mockResolvedValueOnce([
      { id: 11, pngBase64: 'aWNvbg==' },
      { id: 22, pngBase64: 'bGF5ZXI=' }
    ])
    const finalLayer = Promise.withResolvers<undefined>()
    decodeImage.mockImplementation(function (this: HTMLImageElement) {
      return this.src.endsWith('bGF5ZXI=') ? finalLayer.promise : Promise.resolve(undefined)
    })
    const user = userEvent.setup()
    renderPage()

    await chooseHeroicItem(user)
    await screen.findByAltText('Cruel Baton icon')
    expect(screen.queryByRole('img', { name: 'Cruel Baton icon' })).toBeNull()
    finalLayer.resolve(undefined)
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Cruel Baton icon' }).getAttribute('src')).toBe(
        'data:image/png;base64,aWNvbg=='
      )
    })
  })

  it('loads the workflow, uses approved presentation aliases, and renders every explicit slot', async () => {
    loadMock.mockResolvedValue(data())
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Viktranium Experiment Crafting' })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item family' }).value).toBe('Heroic Crafted Weapons')
    await chooseHeroicItem(user)
    expect(screen.getByRole('heading', { name: 'Cruel Baton' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sun Empty' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Red Empty' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Sun augment' })).toBeTruthy()
  })

  it('keeps stable augment choices and configuration while switching workspace tools', async () => {
    loadMock.mockResolvedValue(data())
    desktopViewport = true
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Viktranium Experiment Crafting' })
    await chooseHeroicItem(user)

    await user.click(screen.getByRole('button', { name: 'Red Empty' }))
    await user.click(await screen.findByRole('combobox', { name: 'Red augment' }))
    await user.click(screen.getByRole('switch', { name: 'Show all levels' }))
    await user.click(screen.getByRole('button', { name: 'Red' }))
    await user.click(await screen.findByRole('button', { name: /Duplicate Name/ }))
    expect(screen.getByRole('button', { name: 'Red Configured' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Finished Item' }))
    expect(within(screen.getByTestId('workspace-tool-panel')).getByText('Fire Damage')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Ingredients' }))
    expect(screen.getByRole('button', { name: 'Red Configured' })).toBeTruthy()
    expect(loadMock).toHaveBeenCalledOnce()
  })

  it('displays published effect groups in the scoped picker and finished item', async () => {
    const catalog = data()
    const sun = required(catalog.indexes.augmentById.get('augment-sun'))
    const name = 'Eldritch Blast: Dice'
    sun.scoped = {
      presentation: [{ name: 'Blast Dice', rows: [{ name, modifier: 3, bonus: 'Artifact' }] }],
      searchLabels: [name]
    }
    loadMock.mockResolvedValue({ ...catalog, enchantmentNames: [name] })
    desktopViewport = true
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Viktranium Experiment Crafting' })
    await chooseHeroicItem(user)
    await user.click(screen.getByRole('combobox', { name: 'Sun augment' }))
    await user.click(screen.getByRole('switch', { name: 'Show all levels' }))
    const option = screen.getByRole('button', { name: /Solar Test/ })
    expect(within(option).getByText('Blast Dice')).toBeTruthy()
    expect(within(option).getByText('Eldritch Blast: Dice +3 (Artifact)')).toBeTruthy()
    await user.click(option)
    await user.click(screen.getByRole('button', { name: 'Finished Item' }))
    const finished = within(screen.getByTestId('workspace-tool-panel'))
    expect(finished.getByText('Blast Dice')).toBeTruthy()
    expect(finished.getByText('Eldritch Blast: Dice +3 (Artifact)')).toBeTruthy()
    expect(finished.queryByText('Solar Effect')).toBeNull()
  })

  it('retains a selected item when discovery filters exclude it, then clears augments on family change', async () => {
    const payload = createViktraniumTestRecords()
    const second = required(payload.items.at(1))
    second.family = 'heroic-crafted-weapons'
    second.recipes = [
      {
        id: 'recipe-second-heroic',
        status: 'complete',
        deviceId: '1',
        device: 'Heroic Viktranium Experiment Crafting',
        requirements: []
      }
    ]
    loadMock.mockResolvedValue(createViktraniumTestData(payload))
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Viktranium Experiment Crafting' })
    await chooseHeroicItem(user)

    await user.click(screen.getByRole('combobox', { name: 'Item effect filters' }))
    await user.click(await screen.findByRole('option', { name: 'Speed' }))
    expect(screen.getByRole('heading', { name: 'Cruel Baton' })).toBeTruthy()
    expect(screen.getByText(/selected item is retained/)).toBeTruthy()

    await user.click(screen.getByRole('combobox', { name: 'Item family' }))
    await user.click(await screen.findByRole('option', { name: 'Legendary Quest Loot' }))
    expect(screen.getByText('Choose one item to begin configuring its published slots.')).toBeTruthy()
  })

  it('retries a failed load without remounting the page', async () => {
    loadMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(data())
    const user = userEvent.setup()
    renderPage()
    expect((await screen.findByRole('alert')).textContent).toContain('Viktranium data is unavailable')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('combobox', { name: 'Item family' })).toBeTruthy()
    await waitFor(() => {
      expect(loadMock).toHaveBeenCalledTimes(2)
    })
  })
})
