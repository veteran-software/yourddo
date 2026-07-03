import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import type { GearAugment } from '../types'
import { GearSlot } from '../types'
import AugmentSlotItem from './AugmentSlotItem'

describe('AugmentSlotItem', () => {
  it('keeps over-level augments hidden until Show all is enabled', async () => {
    const user = userEvent.setup()
    const store = configureStore({
      reducer: {
        app: () => ({ troveData: null })
      }
    })

    const Harness = () => {
      const [slotted, setSlotted] = useState<GearAugment | null>(null)

      return (
        <Provider store={store}>
          <AugmentSlotItem
            applicable={{
              groups: {
                Yellow: [
                  { name: 'Legal Yellow', augmentType: 'Yellow', minLevel: 20, effectsAdded: [] },
                  { name: 'Over Yellow', augmentType: 'Yellow', minLevel: 40, effectsAdded: [] }
                ]
              },
              sortedGroupNames: ['Yellow']
            }}
            augSlot={{ augmentType: 'Yellow' }}
            entityState={
              {
                equipped: [],
                conflicts: {},
                slottedAugments: {},
                slottedNearlyFinished: {},
                slottedAlmostThere: {},
                slottedFinishingTouch: {},
                slottedRitualTable: {},
                slottedLostPurpose: {},
                slottedTraceOfMadness: {},
                slottedFountainOfNecroticMight: {},
                slottedStormreaverUpgrade: {},
                slottedZhentarimAttuned: {}
              } as never
            }
            idx={0}
            openSetBonusBrowser={vi.fn()}
            selectedItem={{ id: 'item-1', minimumLevel: 30, name: 'Test Item' } as never}
            setSlottedAugment={(_: string, __: number, aug: GearAugment | null) => {
              setSlotted(aug)
            }}
            slot={GearSlot.Head}
            slotted={slotted}
          />
        </Provider>
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /empty slot/i }))

    expect(screen.getByText(/Legal Yellow/)).toBeInTheDocument()
    expect(screen.queryByText('Over Yellow')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/show all/i))

    expect(screen.getByText(/Over Yellow/)).toBeInTheDocument()
    expect(screen.getByText('Over ML')).toBeInTheDocument()

    await user.click(screen.getByText(/Over Yellow/))

    const selectedButton = screen.getAllByRole('button', { name: /Over Yellow/ }).find((el) => el.tagName === 'BUTTON')
    expect(selectedButton).toBeInTheDocument()
    expect(selectedButton?.closest('.mx-n2')).toHaveStyle({ backgroundColor: 'rgba(220, 53, 69, 0.14)' })
  })
})
