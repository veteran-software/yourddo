// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DinosaurBoneData } from './dinosaurBone.types'
import DinosaurBonePage from './DinosaurBonePage.tsx'

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

const data: DinosaurBoneData = {
  items: [
    {
      name: 'Dinosaur Bone Test Sword',
      type: 'Long Sword',
      family: 'crafted-weapons',
      augments: [{ augmentType: 'Red' }, { augmentType: 'Isle of Dread: Claw Slot (Weapon)' }],
      requirements: [{ name: 'Bone', quantity: 25 }],
      effectsAdded: [{ name: '+15 Enhancement Bonus' }]
    }
  ],
  dinosaurAugments: [
    {
      name: 'Claw One',
      augmentType: 'Isle of Dread: Claw (Weapon)',
      effectsAdded: [{ name: 'Strength', modifier: 2 }],
      requirements: [{ name: 'Tooth', quantity: 100 }]
    }
  ],
  colorAugments: [{ name: 'Red One', augmentType: 'Red', effectsAdded: [{ name: 'Fire' }] }]
}

const loadMock = vi.hoisted(() => vi.fn())
vi.mock('./data.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data.ts')>()
  return { ...actual, loadDinosaurBoneData: loadMock }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('DinosaurBonePage', () => {
  it('loads the data and presents the refreshed selection workflow', async () => {
    loadMock.mockResolvedValue(data)
    const user = userEvent.setup()
    render(
      <MantineProvider env='test'>
        <DinosaurBonePage />
      </MantineProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Dinosaur Bone Crafting' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item family' })).toBeTruthy()
    const itemSelect = screen.getByRole('combobox', { name: 'Item' })
    await user.click(itemSelect)
    await user.click(await screen.findByRole('option', { name: 'Dinosaur Bone Test Sword' }))

    expect(screen.getByRole('heading', { name: 'Augment slots' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Open inspector' }))
    expect(await screen.findByText('Finished item')).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Ingredients' }))
    expect(screen.getByRole('heading', { name: 'Ingredients' })).toBeTruthy()
  })

  it('shows a retryable loading failure', async () => {
    loadMock.mockRejectedValue(new Error('request failed'))
    render(
      <MantineProvider env='test'>
        <DinosaurBonePage />
      </MantineProvider>
    )

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeTruthy()
  })
})
