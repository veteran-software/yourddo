import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import type { Location } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import gearPlannerReducer, { type GearPlannerState } from '../../../redux/slices/gearPlannerSlice'
import { createDefaultSetup } from '../initialState'
import { GearSlot } from '../types'
import { createUpgradeViews } from '../upgradeState'
import InfoModal from './InfoModal'
import PermalinkImportEffect from './PermalinkImportEffect'
import PlannerToolbar from './PlannerToolbar'
import SettingsModal from './SettingsModal'
import SetupTabs from './SetupTabs'

vi.mock('./EnhancementsSummary', () => ({
  default: () => <div data-testid='enchantments-summary' />
}))

vi.mock('./SetBonusesSummary', () => ({
  default: () => <div data-testid='set-bonuses-summary' />
}))

const permalinkMocks = vi.hoisted(() => ({
  readGpFromUrlMock: vi.fn(),
  tryDecodeGearPermalinkMock: vi.fn(),
  removeGpFromUrlMock: vi.fn(() => Promise.resolve())
}))

vi.mock('../permalink', () => ({
  readGpFromUrl: permalinkMocks.readGpFromUrlMock,
  tryDecodeGearPermalink: permalinkMocks.tryDecodeGearPermalinkMock,
  removeGpFromUrl: permalinkMocks.removeGpFromUrlMock
}))

describe('Gear planner extracted UI parts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PlannerToolbar wires toolbar actions', async () => {
    const user = userEvent.setup()
    const callbacks = {
      onOpenInfo: vi.fn(),
      onBrowseSetBonuses: vi.fn(),
      onSearchEnchantments: vi.fn(),
      onSaveToFile: vi.fn(),
      onForumExport: vi.fn(),
      onDiscordExport: vi.fn(),
      onImport: vi.fn(),
      onPermalink: vi.fn(),
      onSettings: vi.fn(),
      onAddSetup: vi.fn(),
      onClearTab: vi.fn()
    }

    render(<PlannerToolbar {...callbacks} />)

    await user.click(screen.getByRole('button', { name: /about the gear planner/i }))
    await user.click(screen.getByRole('button', { name: /browse set bonuses/i }))
    await user.click(screen.getByRole('button', { name: /search enchantments\/sets/i }))
    await user.click(screen.getByRole('button', { name: /import/i }))
    await user.click(screen.getByRole('button', { name: /permalink/i }))
    await user.click(screen.getByRole('button', { name: /settings/i }))
    await user.click(screen.getByRole('button', { name: /add setup/i }))
    await user.click(screen.getByRole('button', { name: /clear tab/i }))

    await user.click(screen.getByRole('button', { name: /export/i }))
    await user.click(screen.getByRole('button', { name: /save to file/i }))
    await user.click(screen.getByRole('button', { name: /forum export/i }))
    await user.click(screen.getByRole('button', { name: /discord export/i }))

    expect(callbacks.onOpenInfo).toHaveBeenCalledTimes(1)
    expect(callbacks.onBrowseSetBonuses).toHaveBeenCalledTimes(1)
    expect(callbacks.onSearchEnchantments).toHaveBeenCalledTimes(1)
    expect(callbacks.onImport).toHaveBeenCalledTimes(1)
    expect(callbacks.onPermalink).toHaveBeenCalledTimes(1)
    expect(callbacks.onSettings).toHaveBeenCalledTimes(1)
    expect(callbacks.onAddSetup).toHaveBeenCalledTimes(1)
    expect(callbacks.onClearTab).toHaveBeenCalledTimes(1)
    expect(callbacks.onSaveToFile).toHaveBeenCalledTimes(1)
    expect(callbacks.onForumExport).toHaveBeenCalledTimes(1)
    expect(callbacks.onDiscordExport).toHaveBeenCalledTimes(1)
  })

  it('SetupTabs renders the active tab and supports deletion', async () => {
    const user = userEvent.setup()
    const setups = [createDefaultSetup('setup-1', 'Setup 1'), createDefaultSetup('setup-2', 'Setup 2')]
    const renderSlot = vi.fn((slot: GearSlot) => <div key={slot} data-testid={`slot-${slot}`} />)
    const onSelectSetup = vi.fn()
    const onDeleteSetup = vi.fn()

    render(
      <SetupTabs
        setups={setups}
        activeSetupId='setup-1'
        activeSetup={{ ...setups[0], ...createUpgradeViews(setups[0].itemUpgrades) }}
        characterEquipped={[]}
        allItems={[]}
        allAugments={[]}
        allCurses={[]}
        allFiligrees={[]}
        essenceEnchantments={[]}
        renderSlot={renderSlot}
        getEntityState={() =>
          ({
            equipped: [],
            conflicts: {},
            slottedAugments: {},
            slottedFiligrees: {},
            slottedGemSetBonuses: {},
            slottedLostPurpose: {},
            slottedCurses: {},
            slottedEssenceEnchantments: {},
            slottedNearlyFinished: {},
            slottedAlmostThere: {},
            slottedFinishingTouch: {},
            slottedRitualTable: {},
            slottedTraceOfMadness: {},
            slottedFountainOfNecroticMight: {},
            slottedStormreaverUpgrade: {},
            slottedZhentarimAttuned: {}
          }) as never
        }
        openSetBonusBrowser={vi.fn()}
        onSelectSetup={onSelectSetup}
        onDeleteSetup={onDeleteSetup}
        onBonusClick={vi.fn()}
      />
    )

    expect(screen.getAllByText('Equipped Items')[0]).toBeInTheDocument()
    expect(screen.getAllByTestId(`slot-${GearSlot.Eyes}`)[0]).toBeInTheDocument()
    expect(screen.getAllByTestId('set-bonuses-summary')[0]).toBeInTheDocument()
    expect(screen.getAllByTestId('enchantments-summary')[0]).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Setup 2' }))
    expect(onSelectSetup).toHaveBeenCalledWith('setup-2')

    const secondTab = screen.getByRole('tab', { name: 'Setup 2' })
    await user.click(within(secondTab).getByRole('button'))
    expect(onDeleteSetup).toHaveBeenCalledWith('setup-2')
  })

  it('SettingsModal updates the active setup fields', async () => {
    const user = userEvent.setup()
    const store = configureStore({
      reducer: {
        gearPlanner: gearPlannerReducer,
        app: () => ({ troveData: {} })
      },
      preloadedState: {
        gearPlanner: {
          characterSetups: [createDefaultSetup('setup-1', 'Setup 1')],
          activeSetupId: 'setup-1'
        } satisfies GearPlannerState,
        app: { troveData: {} }
      }
    })

    const activeSetup = store.getState().gearPlanner.characterSetups[0]
    const dispatch = vi.fn()
    const updateClassProficiencies = vi.fn()

    render(
      <Provider store={store}>
        <SettingsModal
          show
          onHide={vi.fn()}
          activeSetup={activeSetup}
          dispatch={dispatch}
          updateClassProficiencies={updateClassProficiencies}
        />
      </Provider>
    )

    await user.clear(screen.getByLabelText('Setup Name'))
    await user.type(screen.getByLabelText('Setup Name'), 'New Setup')
    expect(dispatch).toHaveBeenCalled()

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Fighter')
    expect(updateClassProficiencies).toHaveBeenCalled()
    expect(screen.getAllByRole('button', { name: 'Close' })[1]).toBeInTheDocument()
  })

  it('InfoModal tracks dismissal state', async () => {
    const user = userEvent.setup()
    const onDontShowAgainChange = vi.fn()
    const onClose = vi.fn()

    render(<InfoModal show dontShowAgain={false} onDontShowAgainChange={onDontShowAgainChange} onClose={onClose} />)

    await user.click(screen.getByLabelText("Don't show again"))
    await user.click(screen.getByRole('button', { name: 'Got it' }))

    expect(onDontShowAgainChange).toHaveBeenCalledWith(true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('PermalinkImportEffect imports a decoded permalink and clears the URL', async () => {
    const onImportSetup = vi.fn()
    const location = { pathname: '/gear', search: '?gp=encoded', hash: '' } as unknown as Location
    const importedSetup = createDefaultSetup('imported-1', 'Imported Setup')

    permalinkMocks.readGpFromUrlMock.mockReturnValue({ gp: 'encoded', source: 'search' })
    permalinkMocks.tryDecodeGearPermalinkMock.mockReturnValue({ ok: true, data: importedSetup })

    render(
      <PermalinkImportEffect
        loading={false}
        location={location}
        navigate={vi.fn()}
        allItems={[]}
        allAugments={[]}
        allCurses={[]}
        onImportSetup={onImportSetup}
      />
    )

    await waitFor(() => {
      expect(onImportSetup).toHaveBeenCalledWith({
        ...importedSetup,
        name: 'Imported Setup (Imported)'
      })
    })
    expect(permalinkMocks.removeGpFromUrlMock).toHaveBeenCalled()
  })
})
