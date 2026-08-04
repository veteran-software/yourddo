// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { ClassifiedDinosaurBoneItem, DinosaurBoneAugment, DinosaurBoneData } from './dinosaurBone.types'
import DinosaurBonePage from './DinosaurBonePage.tsx'
import { buildDinosaurBoneIndexes } from './logic.ts'

let desktopViewport = false

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
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

const slots = [
  {
    id: 'Red',
    augmentType: 'Red',
    label: 'Red'
  },
  {
    id: 'Isle of Dread: Claw Slot (Weapon)',
    augmentType: 'Isle of Dread: Claw Slot (Weapon)',
    label: 'Isle of Dread: Claw (Weapon)'
  }
]
const items: ClassifiedDinosaurBoneItem[] = [
  {
    name: 'Dinosaur Bone Test Sword',
    type: 'Long Sword',
    family: 'crafted-weapons',
    icon: 'testSwordIcon',
    augments: slots,
    requirements: [{ name: 'Bone', quantity: 25 }],
    effectsAdded: [{ name: '+15 Enhancement Bonus' }]
  },
  {
    name: 'Dinosaur Bone Test Axe',
    type: 'Battle Axe',
    family: 'crafted-weapons',
    augments: [],
    requirements: [{ name: 'Bone', quantity: 25 }]
  },
  {
    name: 'Dinosaur Bone Test Artifact',
    type: 'Belt',
    family: 'crafted-weapons',
    artifactType: 'Minor',
    augments: slots,
    requirements: [{ name: 'Bone', quantity: 25 }]
  }
]
const dinosaurAugments: DinosaurBoneAugment[] = [
  {
    name: 'Claw One',
    augmentType: 'Isle of Dread: Claw (Weapon)',
    effectsAdded: [{ name: 'Strength', modifier: 2 }],
    requirements: [{ name: 'Tooth', quantity: 100 }]
  }
]
const colorAugments: DinosaurBoneAugment[] = [
  { name: 'Red One', augmentType: 'Red', minimumLevel: 20, effectsAdded: [{ name: 'Fire' }], requirements: [] },
  { name: 'Colorless One', augmentType: 'Colorless', minimumLevel: 8, requirements: [] }
]
const data: DinosaurBoneData = {
  items,
  dinosaurAugments,
  colorAugments,
  indexes: buildDinosaurBoneIndexes(items, dinosaurAugments, colorAugments)
}

const loadMock = vi.hoisted(() => vi.fn())
vi.mock('./data.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data.ts')>()
  return { ...actual, loadDinosaurBoneData: loadMock }
})

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <DinosaurBonePage />
    </MantineProvider>
  )

const inputValue = (element: HTMLElement) => {
  if (!(element instanceof HTMLInputElement)) throw new TypeError('Expected an input element')
  return element.value
}

const chooseItem = async (user: ReturnType<typeof userEvent.setup>, name = 'Dinosaur Bone Test Sword') => {
  await user.click(screen.getByRole('combobox', { name: 'Item' }))
  await user.click(await screen.findByRole('option', { name }))
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  desktopViewport = false
})

describe('DinosaurBonePage', () => {
  it('loads data and presents the family, searchable item, summary, and slot workflow', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item family' })).toBeTruthy()
    await chooseItem(user)
    expect(screen.getByRole('heading', { name: 'Dinosaur Bone Test Sword' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Dinosaur Bone Test Sword icon' }).getAttribute('src')).toContain(
      '/testSwordIcon.png'
    )
    expect(screen.getByRole('heading', { name: 'Crafting slots' })).toBeTruthy()
    expect(screen.getAllByText('Empty')).toHaveLength(2)
  })

  it('groups derived colors and shows minimum levels in the searchable augment list', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await chooseItem(user)

    await user.click(screen.getByRole('button', { name: 'Red Empty' }))
    await user.click(await screen.findByRole('combobox', { name: 'Red augment' }))

    expect(await screen.findByText('Red Augments')).toBeTruthy()
    expect(screen.getByText('Colorless Augments')).toBeTruthy()
    expect(screen.getByLabelText('Minimum level 20')).toBeTruthy()
    expect(screen.getByLabelText('Minimum level 8')).toBeTruthy()
  })

  it('separates IoD and color effect filters and applies each only to its matching slots', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await chooseItem(user)

    expect(screen.getByText('Isle of Dread (IoD) augment filters')).toBeTruthy()
    expect(screen.getByText('Color augment filters')).toBeTruthy()

    await user.click(screen.getByRole('combobox', { name: 'IoD augment effect filters' }))
    expect(await screen.findByRole('option', { name: 'Strength' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Fire' })).toBeNull()
    await user.click(screen.getByRole('option', { name: 'Strength' }))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Red Empty' }))
    await user.click(await screen.findByRole('combobox', { name: 'Red augment' }))
    expect(await screen.findByRole('option', { name: /Red One/ })).toBeTruthy()
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Color augment effect filters' }))
    expect(await screen.findByRole('option', { name: 'Fire' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Strength' })).toBeNull()
    await user.click(screen.getByRole('option', { name: 'Fire' }))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Isle of Dread: Claw (Weapon) augment' }))
    expect(await screen.findByRole('option', { name: /Claw One/ })).toBeTruthy()
  })

  it('badges artifacts and shows their adjusted ability score upgrade with a contextual notice', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await chooseItem(user, 'Dinosaur Bone Test Artifact')

    expect(screen.getAllByText('Crafted Weapons')).toHaveLength(2)
    expect(screen.getByText('Minor Artifact')).toBeTruthy()

    await user.click(screen.getByRole('combobox', { name: 'Isle of Dread: Claw (Weapon) augment' }))
    await user.click(await screen.findByRole('option', { name: /Claw One/ }))

    expect(screen.getByText('Artifact ability score bonus')).toBeTruthy()
    expect(screen.getByText(/This Minor Artifact increases Strength by 1/)).toBeTruthy()
    expect(screen.getByText('Strength (3)')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Finished Item' }))
    const dialog = await screen.findByRole('dialog', { name: 'Finished Item' })
    expect(within(dialog).getByText('Artifact ability score bonus')).toBeTruthy()
    expect(within(dialog).getByText('Strength (3)')).toBeTruthy()
  })

  it('uses separate workspace tools and preserves configuration while switching them', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await chooseItem(user)
    await user.click(screen.getByRole('combobox', { name: 'Isle of Dread: Claw (Weapon) augment' }))
    await user.click(await screen.findByRole('option', { name: /Claw One/ }))

    const finishedButton = screen.getByRole('button', { name: 'Finished Item' })
    expect(finishedButton.querySelector('img')?.getAttribute('src')).toContain('/testSwordIcon.png')
    await user.click(finishedButton)
    let dialog = await screen.findByRole('dialog', { name: 'Finished Item' })
    expect(within(dialog).getByText(/Claw One/)).toBeTruthy()

    await user.click(within(dialog).getByRole('button', { name: 'Ingredients' }))
    dialog = await screen.findByRole('dialog', { name: 'Ingredients' })
    expect(within(dialog).getByText('Tooth')).toBeTruthy()
    expect(within(dialog).getByText('×100')).toBeTruthy()
    expect(inputValue(screen.getByRole('combobox', { name: 'Isle of Dread: Claw (Weapon) augment' }))).toBe('Claw One')
    expect(loadMock).toHaveBeenCalledOnce()
  })

  it('passes both tools to the desktop WorkspaceLayout rail and switches active content', async () => {
    desktopViewport = true
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })

    const rail = screen.getByTestId('workspace-tool-rail')
    const finishedButton = within(rail).getByRole('button', { name: 'Finished Item' })
    const ingredientsButton = within(rail).getByRole('button', { name: 'Ingredients' })
    expect(finishedButton).toBeTruthy()
    expect(ingredientsButton).toBeTruthy()
    expect(finishedButton.querySelector('svg')).not.toBeNull()
    expect(ingredientsButton.querySelector('svg')).not.toBeNull()

    await user.click(finishedButton)
    expect(screen.getByRole('complementary', { name: 'Finished Item' })).toBeTruthy()
    await user.click(ingredientsButton)
    expect(screen.getByRole('complementary', { name: 'Ingredients' })).toBeTruthy()
    expect(screen.queryByRole('complementary', { name: 'Finished Item' })).toBeNull()
  })

  it('clears stale augment and tool output when the item changes and resets exact domain state', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await chooseItem(user)
    await user.click(screen.getByRole('combobox', { name: 'Isle of Dread: Claw (Weapon) augment' }))
    await user.click(await screen.findByRole('option', { name: /Claw One/ }))
    await user.click(screen.getByRole('combobox', { name: 'Item' }))
    await user.click(await screen.findByRole('option', { name: 'Dinosaur Bone Test Axe' }))
    expect(screen.queryByText('Claw One')).toBeNull()
    expect(screen.getByText('This item has no configurable Dinosaur Bone slots.')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset build' }))
    expect(inputValue(screen.getByRole('combobox', { name: 'Item' }))).toBe('')
    expect(inputValue(screen.getByRole('combobox', { name: 'Item family' }))).toBe('Crafted Weapons')
    expect(
      screen.getByText('Choose an item to review its base properties and configure its crafting slots.')
    ).toBeTruthy()
  })

  it('shows tool empty states before an item is selected', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })
    await user.click(screen.getByRole('button', { name: 'Finished Item' }))
    expect(await screen.findByText('Select an item to review the finished build.')).toBeTruthy()
  })

  it('shows a retryable loading failure and retries without a page remount', async () => {
    loadMock.mockRejectedValueOnce(new Error('request failed')).mockResolvedValueOnce(data)
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('combobox', { name: 'Item' })).toBeTruthy()
    expect(loadMock).toHaveBeenCalledTimes(2)
  })
})
