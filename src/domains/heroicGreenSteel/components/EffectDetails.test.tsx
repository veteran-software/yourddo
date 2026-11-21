// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { HgsEffect, HgsTierOption } from '../heroicGreenSteel.types.ts'
import { EffectDetails, OptionBadges } from './EffectDetails.tsx'

const focusedFire: HgsTierOption = {
  id: 1,
  name: 'Focused fire shard',
  type: 'weapon',
  essence: 'Material',
  focus: 'Fire',
  gem: 'Escalation',
  shardType: 'compound',
  focuses: ['Fire'],
  effectIds: [],
  recipeId: 2
}

const effect = (overrides: Partial<HgsEffect>): HgsEffect => ({
  id: 1,
  displayName: 'Test effect',
  description: '',
  enchantments: [],
  procs: [],
  ...overrides
})

const renderEffects = (effects: HgsEffect[]) =>
  render(
    <MantineProvider env='test'>
      <EffectDetails effects={effects} />
    </MantineProvider>
  )

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    }))
  )
})

afterAll(() => vi.unstubAllGlobals())

afterEach(cleanup)

describe('OptionBadges', () => {
  it('keeps the focused-shard FIRE label without Mantine’s decorative dot marker', () => {
    render(
      <MantineProvider env='test'>
        <OptionBadges option={focusedFire} />
      </MantineProvider>
    )

    const fireBadges = screen.getAllByText('Fire')
    expect(fireBadges).toHaveLength(2)
    const focusedFireBadge = fireBadges[1].closest('[data-variant]')
    expect(focusedFireBadge?.getAttribute('data-variant')).toBe('outline')
    expect(focusedFireBadge?.getAttribute('data-variant')).not.toBe('dot')
    expect(screen.getByText('compound shard')).toBeTruthy()
  })
})

describe('EffectDetails', () => {
  it('presents a Slicing-style proc with its trait and grouped target exclusions', async () => {
    const user = userEvent.setup()
    renderEffects([
      effect({
        displayName: 'Slicing',
        procs: [
          {
            trigger: 'onHit',
            outcomes: [
              {
                type: 'damage',
                damageType: 'Bane',
                dice: { count: 1, sides: 4 },
                traits: ['Bleed'],
                targetEligibility: {
                  excludedCreatureTraits: ['Incorporeal'],
                  excludedGenus: [
                    'Elemental_Water',
                    'Undead',
                    'Plant',
                    'Construct',
                    'Elemental_Earth',
                    'Elemental_Fire',
                    'Elemental_Air'
                  ]
                }
              }
            ]
          }
        ]
      })
    ])

    await user.click(screen.getByRole('button', { name: 'Slicing' }))
    expect(screen.getByText('On hit: 1d4 Bane damage')).toBeTruthy()
    expect(screen.getByText('Trait: Bleed')).toBeTruthy()
    expect(screen.getByText('Does not affect: Incorporeal, Undead, Plants, Constructs, or Elementals')).toBeTruthy()
  })

  it('keeps defensive trigger wording and simple effects compact', async () => {
    const user = userEvent.setup()
    renderEffects([
      effect({
        displayName: 'Simple',
        procs: [
          { trigger: 'onBeingHit', outcomes: [{ type: 'damage', damageType: 'Cold', dice: { count: 2, sides: 6 } }] }
        ]
      })
    ])

    await user.click(screen.getByRole('button', { name: 'Simple' }))
    expect(screen.getByText('When hit: 2d6 Cold damage')).toBeTruthy()
    expect(screen.queryByText(/^(Trait|Traits|Only affects|Does not affect|Additional unresolved)/)).toBeNull()
  })

  it('renders partial elemental exclusions, inclusions, unknown masks, and multiple outcome traits independently', async () => {
    const user = userEvent.setup()
    renderEffects([
      effect({
        displayName: 'Eligibility controls',
        procs: [
          {
            trigger: 'onHit',
            outcomes: [
              {
                type: 'status',
                name: 'Gust',
                traits: ['Air', 'Bleed'],
                targetEligibility: {
                  includedGenus: ['Outsider', 'Undead'],
                  excludedGenus: ['Elemental_Fire', 'Elemental_Air'],
                  unknownExcludedGenusMask: '0x0000002000000000'
                }
              },
              { type: 'status', name: 'Unaffected sibling' }
            ]
          }
        ],
        enchantments: [
          {
            name: 'Guard',
            targetEligibility: { excludedCreatureTraits: ['Incorporeal'] }
          }
        ]
      })
    ])

    await user.click(screen.getByRole('button', { name: 'Eligibility controls' }))
    expect(screen.getByText('Traits: Air, Bleed')).toBeTruthy()
    expect(screen.getByText('Only affects: Outsiders or Undead')).toBeTruthy()
    expect(screen.getByText('Does not affect: Fire Elementals or Air Elementals')).toBeTruthy()
    expect(screen.getByText('Additional unresolved target restrictions apply.')).toBeTruthy()
    expect(screen.getByText('Does not affect: Incorporeal')).toBeTruthy()
    expect(screen.queryByText('Elementals')).toBeNull()
    expect(screen.getByText('On hit: Unaffected sibling').parentElement?.textContent).toBe('On hit: Unaffected sibling')
  })

  it('omits empty traits and eligibility', async () => {
    const user = userEvent.setup()
    renderEffects([
      effect({
        procs: [
          {
            trigger: 'onHit',
            outcomes: [
              {
                type: 'damage',
                damageType: 'Fire',
                dice: { count: 1, sides: 6 },
                traits: [],
                targetEligibility: { excludedCreatureTraits: [], includedGenus: [], excludedGenus: [] }
              }
            ]
          }
        ]
      })
    ])

    await user.click(screen.getByRole('button', { name: 'Test effect' }))
    expect(screen.getByText('On hit: 1d6 Fire damage')).toBeTruthy()
    expect(screen.queryByText(/^(Trait|Traits|Only affects|Does not affect|Additional unresolved)/)).toBeNull()
  })
})
