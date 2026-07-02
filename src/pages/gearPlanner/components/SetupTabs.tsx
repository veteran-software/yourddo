import { Button, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { FaXmark } from 'react-icons/fa6'
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
  onSelectSetup: (setupId: string) => void
  onDeleteSetup: (setupId: string) => void
  onBonusClick: (name: string, bonusType: string) => void
}

const PetGearSection = ({
  title,
  slots,
  setup,
  entityState,
  renderSlot,
  openSetBonusBrowser,
  onBonusClick,
  essenceEnchantments,
  allItems,
  allAugments,
  allCurses,
  allFiligrees,
  borderColorClass,
  textColorClass
}: {
  title: string
  slots: GearSlot[]
  setup: GearSetup
  entityState: EntityGearState
  renderSlot: (slot: GearSlot, setup: GearSetup) => React.ReactNode
  openSetBonusBrowser: (setName: string | null, slot?: GearSlot | null) => void
  onBonusClick: (name: string, bonusType: string) => void
  essenceEnchantments: EssenceEnchantment[]
  allItems: GearItem[]
  allAugments: GearAugment[]
  allCurses: import('../types').Curse[]
  allFiligrees: GearItem[]
  borderColorClass: string
  textColorClass: string
}) => (
  <div className={`mt-4 p-3 border ${borderColorClass} rounded bg-dark-subtle`}>
    <h5 className={`mb-3 ${textColorClass} border-bottom ${borderColorClass} pb-2`}>{title}</h5>

    <Row>{slots.map((slot) => renderSlot(slot, setup))}</Row>

    <SetBonusesSummary
      equippedItems={entityState.equipped}
      slottedAugments={entityState.slottedAugments}
      slottedFiligrees={entityState.slottedFiligrees}
      slottedGemSetBonuses={entityState.slottedGemSetBonuses}
      slottedLostPurpose={entityState.slottedLostPurpose}
      onSetClick={openSetBonusBrowser}
    />

    <EnchantmentsSummary
      equippedItems={entityState.equipped}
      slottedAugments={entityState.slottedAugments}
      slottedCurses={entityState.slottedCurses}
      slottedFiligrees={entityState.slottedFiligrees}
      slottedGemSetBonuses={entityState.slottedGemSetBonuses}
      slottedEssenceEnchantments={entityState.slottedEssenceEnchantments}
      essenceEnchantments={essenceEnchantments}
      slottedNearlyFinished={entityState.slottedNearlyFinished}
      slottedAlmostThere={entityState.slottedAlmostThere}
      slottedFinishingTouch={entityState.slottedFinishingTouch}
      slottedRitualTable={entityState.slottedRitualTable}
      slottedLostPurpose={entityState.slottedLostPurpose}
      slottedTraceOfMadness={entityState.slottedTraceOfMadness}
      slottedFountainOfNecroticMight={entityState.slottedFountainOfNecroticMight}
      slottedStormreaverUpgrade={entityState.slottedStormreaverUpgrade}
      slottedZhentarimAttuned={entityState.slottedZhentarimAttuned}
      allItems={allItems}
      allAugments={allAugments}
      allCurses={allCurses}
      allFiligrees={allFiligrees}
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
  onSelectSetup,
  onDeleteSetup,
  onBonusClick
}: SetupTabsProps) => {
  const setupCount = setups.length

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
              <h5 className='mb-3 border-bottom pb-2'>Equipped Items</h5>

              <Row>{GEAR_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>

              <SetBonusesSummary
                equippedItems={characterEquipped}
                slottedAugments={activeSetup.slottedAugments}
                slottedFiligrees={activeSetup.slottedFiligrees}
                slottedGemSetBonuses={activeSetup.slottedGemSetBonuses}
                slottedLostPurpose={activeSetup.slottedLostPurpose}
                onSetClick={openSetBonusBrowser}
              />

              <EnchantmentsSummary
                equippedItems={characterEquipped}
                slottedAugments={activeSetup.slottedAugments}
                slottedCurses={activeSetup.slottedCurses}
                slottedFiligrees={activeSetup.slottedFiligrees}
                slottedGemSetBonuses={activeSetup.slottedGemSetBonuses}
                slottedEssenceEnchantments={activeSetup.slottedEssenceEnchantments}
                essenceEnchantments={essenceEnchantments}
                slottedNearlyFinished={activeSetup.slottedNearlyFinished}
                slottedAlmostThere={activeSetup.slottedAlmostThere}
                slottedFinishingTouch={activeSetup.slottedFinishingTouch}
                slottedRitualTable={activeSetup.slottedRitualTable}
                slottedLostPurpose={activeSetup.slottedLostPurpose}
                slottedTraceOfMadness={activeSetup.slottedTraceOfMadness}
                slottedFountainOfNecroticMight={activeSetup.slottedFountainOfNecroticMight}
                slottedStormreaverUpgrade={activeSetup.slottedStormreaverUpgrade}
                slottedZhentarimAttuned={activeSetup.slottedZhentarimAttuned}
                allItems={allItems}
                allAugments={allAugments}
                allCurses={allCurses}
                allFiligrees={allFiligrees}
                onBonusClick={onBonusClick}
              />

              {setup.classes.includes('Artificer') && setup.classes.includes('Druid') && (
                <div className='mt-3 p-2 bg-warning-subtle text-warning-emphasis border border-warning rounded small text-center fw-bold'>
                  Note: Only one pet may be active at a time.
                </div>
              )}

              {setup.classes.includes('Artificer') && (
                <PetGearSection
                  title='Iron Defender (Artificer Pet)'
                  slots={ARTIFICER_PET_SLOTS}
                  setup={setup}
                  entityState={getEntityState('artificer_pet')}
                  renderSlot={renderSlot}
                  openSetBonusBrowser={openSetBonusBrowser}
                  onBonusClick={onBonusClick}
                  essenceEnchantments={essenceEnchantments}
                  allItems={allItems}
                  allAugments={allAugments}
                  allCurses={allCurses}
                  allFiligrees={allFiligrees}
                  borderColorClass='border-info'
                  textColorClass='text-info'
                />
              )}

              {setup.classes.includes('Druid') && (
                <PetGearSection
                  title='Wolf Companion (Druid Pet)'
                  slots={DRUID_PET_SLOTS}
                  setup={setup}
                  entityState={getEntityState('druid_pet')}
                  renderSlot={renderSlot}
                  openSetBonusBrowser={openSetBonusBrowser}
                  onBonusClick={onBonusClick}
                  essenceEnchantments={essenceEnchantments}
                  allItems={allItems}
                  allAugments={allAugments}
                  allCurses={allCurses}
                  allFiligrees={allFiligrees}
                  borderColorClass='border-success'
                  textColorClass='text-success'
                />
              )}
            </div>
          )}
        </Tab>
      ))}
    </Tabs>
  )
}

export default SetupTabs
