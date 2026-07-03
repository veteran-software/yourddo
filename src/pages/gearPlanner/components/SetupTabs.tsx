import { type ReactNode } from 'react'
import { Button, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { FaChevronDown, FaXmark } from 'react-icons/fa6'
import type { EssenceEnchantment } from '../dataLoader'
import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  type EntityGearState,
  GEAR_SLOTS,
  type GearAugment,
  type GearItem,
  type GearSetup,
  type GearSlot
} from '../types'
import type { UpgradeViews } from '../upgradeState'
import EnchantmentsSummary from './EnhancementsSummary'
import SetBonusesSummary from './SetBonusesSummary'

interface SetupTabsProps {
  setups: GearSetup[]
  activeSetupId: string
  activeSetup: GearSetup & UpgradeViews
  characterEquipped: GearItem[]
  allItems: GearItem[]
  allAugments: GearAugment[]
  allCurses: import('../types').Curse[]
  allFiligrees: GearItem[]
  essenceEnchantments: EssenceEnchantment[]
  renderSlot: (slot: GearSlot, setup: GearSetup) => React.ReactNode
  getEntityState: (owner: 'artificer_pet' | 'druid_pet') => EntityGearState
  openSetBonusBrowser: (setName: string | null, slot?: GearSlot | null) => void
  allItemCardsCollapsed: boolean
  onToggleCollapseAll: () => void
  onSelectSetup: (setupId: string) => void
  onDeleteSetup: (setupId: string) => void
  onBonusClick: (name: string, bonusType: string) => void
}

interface SummaryState {
  slottedAugments: EntityGearState['slottedAugments']
  slottedFiligrees: EntityGearState['slottedFiligrees']
  slottedGemSetBonuses: EntityGearState['slottedGemSetBonuses']
  slottedLostPurpose: EntityGearState['slottedLostPurpose']
  slottedCurses: EntityGearState['slottedCurses']
  slottedEssenceEnchantments: EntityGearState['slottedEssenceEnchantments']
  itemUpgrades: EntityGearState['itemUpgrades']
  slottedNearlyFinished: EntityGearState['slottedNearlyFinished']
  slottedAlmostThere: EntityGearState['slottedAlmostThere']
  slottedFinishingTouch: EntityGearState['slottedFinishingTouch']
  slottedRitualTable: EntityGearState['slottedRitualTable']
  slottedTraceOfMadness: EntityGearState['slottedTraceOfMadness']
  slottedFountainOfNecroticMight: EntityGearState['slottedFountainOfNecroticMight']
  slottedStormreaverUpgrade: EntityGearState['slottedStormreaverUpgrade']
  slottedZhentarimAttuned: EntityGearState['slottedZhentarimAttuned']
}

const SetupSummaryBlocks = ({
  equippedItems,
  summarySetup,
  allItems,
  allAugments,
  allCurses,
  allFiligrees,
  essenceEnchantments,
  openSetBonusBrowser,
  onBonusClick
}: {
  equippedItems: GearItem[]
  summarySetup: SummaryState
  allItems: GearItem[]
  allAugments: GearAugment[]
  allCurses: import('../types').Curse[]
  allFiligrees: GearItem[]
  essenceEnchantments: EssenceEnchantment[]
  openSetBonusBrowser: (setName: string | null, slot?: GearSlot | null) => void
  onBonusClick: (name: string, bonusType: string) => void
}) => (
  <>
    <SetBonusesSummary
      equippedItems={equippedItems}
      slottedAugments={summarySetup.slottedAugments}
      slottedFiligrees={summarySetup.slottedFiligrees}
      slottedGemSetBonuses={summarySetup.slottedGemSetBonuses}
      slottedLostPurpose={summarySetup.slottedLostPurpose}
      onSetClick={openSetBonusBrowser}
    />

    <EnchantmentsSummary
      equippedItems={equippedItems}
      slottedAugments={summarySetup.slottedAugments}
      slottedCurses={summarySetup.slottedCurses}
      slottedFiligrees={summarySetup.slottedFiligrees}
      slottedGemSetBonuses={summarySetup.slottedGemSetBonuses}
      slottedEssenceEnchantments={summarySetup.slottedEssenceEnchantments}
      itemUpgrades={summarySetup.itemUpgrades}
      essenceEnchantments={essenceEnchantments}
      slottedNearlyFinished={summarySetup.slottedNearlyFinished}
      slottedAlmostThere={summarySetup.slottedAlmostThere}
      slottedFinishingTouch={summarySetup.slottedFinishingTouch}
      slottedRitualTable={summarySetup.slottedRitualTable}
      slottedLostPurpose={summarySetup.slottedLostPurpose}
      slottedTraceOfMadness={summarySetup.slottedTraceOfMadness}
      slottedFountainOfNecroticMight={summarySetup.slottedFountainOfNecroticMight}
      slottedStormreaverUpgrade={summarySetup.slottedStormreaverUpgrade}
      slottedZhentarimAttuned={summarySetup.slottedZhentarimAttuned}
      allItems={allItems}
      allAugments={allAugments}
      allCurses={allCurses}
      allFiligrees={allFiligrees}
      onBonusClick={onBonusClick}
    />
  </>
)

interface GearSectionProps {
  title: ReactNode
  slots: GearSlot[]
  setup: GearSetup
  summaryState: SummaryState
  equippedItems: GearItem[]
  renderSlot: (slot: GearSlot, setup: GearSetup) => React.ReactNode
  openSetBonusBrowser: (setName: string | null, slot?: GearSlot | null) => void
  onBonusClick: (name: string, bonusType: string) => void
  essenceEnchantments: EssenceEnchantment[]
  allItems: GearItem[]
  allAugments: GearAugment[]
  allCurses: import('../types').Curse[]
  allFiligrees: GearItem[]
  containerClassName: string
  headerClassName: string
  titleClassName: string
  note?: ReactNode
  allItemCardsCollapsed?: boolean
  onToggleCollapseAll?: () => void
}

const GearSection = ({
  title,
  slots,
  setup,
  summaryState,
  equippedItems,
  renderSlot,
  openSetBonusBrowser,
  onBonusClick,
  essenceEnchantments,
  allItems,
  allAugments,
  allCurses,
  allFiligrees,
  containerClassName,
  headerClassName,
  titleClassName,
  note,
  allItemCardsCollapsed,
  onToggleCollapseAll
}: GearSectionProps) => (
  <div className={containerClassName}>
    <div className={headerClassName}>
      <h5 className={titleClassName}>{title}</h5>

      {onToggleCollapseAll && (
        <Button
          variant='outline-secondary'
          size='sm'
          className='gear-planner-collapse-all-btn d-inline-flex align-items-center gap-1 flex-shrink-0'
          onClick={onToggleCollapseAll}
        >
          <FaChevronDown className={allItemCardsCollapsed ? 'rotate-180' : ''} />
          {allItemCardsCollapsed ? 'Expand All' : 'Collapse All'}
        </Button>
      )}
    </div>

    {note}

    <Row>{slots.map((slot) => renderSlot(slot, setup))}</Row>

    <SetupSummaryBlocks
      equippedItems={equippedItems}
      summarySetup={summaryState}
      allItems={allItems}
      allAugments={allAugments}
      allCurses={allCurses}
      allFiligrees={allFiligrees}
      essenceEnchantments={essenceEnchantments}
      openSetBonusBrowser={openSetBonusBrowser}
      onBonusClick={onBonusClick}
    />
  </div>
)

const SetupTabs = ({
  setups,
  activeSetupId,
  activeSetup,
  characterEquipped,
  allItems,
  allAugments,
  allCurses,
  allFiligrees,
  essenceEnchantments,
  renderSlot,
  getEntityState,
  openSetBonusBrowser,
  allItemCardsCollapsed,
  onToggleCollapseAll,
  onSelectSetup,
  onDeleteSetup,
  onBonusClick
}: SetupTabsProps) => {
  const setupCount = setups.length
  const artificerPetState = getEntityState('artificer_pet')
  const druidPetState = getEntityState('druid_pet')
  const showArtificerPet = activeSetup.classes.includes('Artificer')
  const showDruidPet = activeSetup.classes.includes('Druid')

  return (
    <Tabs
      id='gear-setup-tabs'
      activeKey={activeSetupId}
      onSelect={(k) => {
        if (k) onSelectSetup(k)
      }}
      className='mb-4'
    >
      {setups.map((setup) => (
        <Tab
          key={setup.id}
          eventKey={setup.id}
          title={
            <Stack direction='horizontal' gap={2}>
              <span>{setup.name}</span>
              {setupCount > 1 && (
                <Button
                  as='span'
                  role='button'
                  tabIndex={0}
                  aria-label={`Delete ${setup.name}`}
                  variant='link'
                  className='p-0 text-danger btn btn-link btn-sm'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSetup(setup.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onDeleteSetup(setup.id)
                    }
                  }}
                >
                  <FaXmark />
                </Button>
              )}
            </Stack>
          }
        >
          {setup.id === activeSetupId && (
            <div className='mt-3'>
              <GearSection
                title='Equipped Items'
                slots={GEAR_SLOTS}
                setup={activeSetup}
                summaryState={activeSetup}
                equippedItems={characterEquipped}
                renderSlot={renderSlot}
                openSetBonusBrowser={openSetBonusBrowser}
                onBonusClick={onBonusClick}
                essenceEnchantments={essenceEnchantments}
                allItems={allItems}
                allAugments={allAugments}
                allCurses={allCurses}
                allFiligrees={allFiligrees}
                containerClassName='mt-3'
                headerClassName='d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 gap-2'
                titleClassName='mb-0'
                allItemCardsCollapsed={allItemCardsCollapsed}
                onToggleCollapseAll={onToggleCollapseAll}
              />

              {showArtificerPet && (
                <GearSection
                  title='Iron Defender (Artificer Pet)'
                  slots={ARTIFICER_PET_SLOTS}
                  setup={activeSetup}
                  summaryState={artificerPetState}
                  equippedItems={artificerPetState.equipped}
                  renderSlot={renderSlot}
                  openSetBonusBrowser={openSetBonusBrowser}
                  onBonusClick={onBonusClick}
                  essenceEnchantments={essenceEnchantments}
                  allItems={allItems}
                  allAugments={allAugments}
                  allCurses={allCurses}
                  allFiligrees={allFiligrees}
                  containerClassName='mt-4 p-3 border border-info rounded bg-dark-subtle'
                  headerClassName='mb-3 text-info border-bottom border-info pb-2'
                  titleClassName='mb-0'
                />
              )}

              {showDruidPet && (
                <GearSection
                  title='Wolf Companion (Druid Pet)'
                  slots={DRUID_PET_SLOTS}
                  setup={activeSetup}
                  summaryState={druidPetState}
                  equippedItems={druidPetState.equipped}
                  renderSlot={renderSlot}
                  openSetBonusBrowser={openSetBonusBrowser}
                  onBonusClick={onBonusClick}
                  essenceEnchantments={essenceEnchantments}
                  allItems={allItems}
                  allAugments={allAugments}
                  allCurses={allCurses}
                  allFiligrees={allFiligrees}
                  containerClassName='mt-4 p-3 border border-success rounded bg-dark-subtle'
                  headerClassName='mb-3 text-success border-bottom border-success pb-2'
                  titleClassName='mb-0'
                />
              )}

              {showArtificerPet && showDruidPet && (
                <div className='mt-3 p-2 bg-warning-subtle text-warning-emphasis border border-warning rounded small text-center fw-bold'>
                  Note: Only one pet may be active at a time.
                </div>
              )}
            </div>
          )}
        </Tab>
      ))}
    </Tabs>
  )
}

export default SetupTabs
