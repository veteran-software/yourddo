import { type JSX, type ReactNode } from 'react'
import { Card, Col } from 'react-bootstrap'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { SLOT_GROUPS } from '../../../utils/augmentUtils.ts'
import AugmentSlotItem from '../components/AugmentSlotItem'
import CurseSlotItem from '../components/CurseSlotItem'
import EnchantmentList from '../components/EnchantmentList'
import EssenceCraftingSelector from '../components/EssenceCraftingSelector'
import FountainOfNecroticMightSelector from '../components/FountainOfNecroticMightSelector'
import GemSetBonusSelector from '../components/GetSetBonusSelector'
import ItemSetBonusDisplay from '../components/ItemSetBonusDisplay'
import LostPurposeSelector from '../components/LostPurposeSelector'
import NearlyFinishedSelector from '../components/NearlyFinishedSelector'
import RitualTableSelector from '../components/RitualTableSelector'
import StormreaverUpgradeSelector from '../components/StormreaverUpgradeSelector'
import TroveBadge from '../components/TroveBadge'
import { getSlotOwner } from '../conflictResolver'
import { type EssenceEnchantment } from '../dataLoader'
import { getDisplayEnchantments, getMaxFiligreeSlots, isMinorArtifact } from '../helpers'
import {
  type Curse,
  type EntityGearState,
  type GearAugment,
  type GearAugmentSlot,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootDropLocation,
  type LootEnchantment
} from '../types'
import { FiligreeLabel } from './useGearPlannerHelpers'

const getApplicableAugments = (augmentSlot: GearAugmentSlot, allAugments: GearAugment[]) => {
  const groups: Record<string, GearAugment[]> = {}
  const slotTypeLower: string = augmentSlot.augmentType.replace(' Slot', '').toLowerCase()
  const groupConfig = SLOT_GROUPS[slotTypeLower]

  if (groupConfig) {
    for (const config of groupConfig) {
      const matchingAugments = allAugments.filter(
        (aug: GearAugment) => aug.augmentType.replace(' Slot', '').toLowerCase() === config.key.toLowerCase()
      )

      if (matchingAugments.length > 0) {
        groups[config.label] = matchingAugments.toSorted((a, b) => a.name.localeCompare(b.name))
      }
    }
  } else {
    // Fallback to exact match logic
    const normalizedSlotType: string = augmentSlot.augmentType.replace(' Slot', '')

    for (const aug of allAugments) {
      const normalizedAugType: string = aug.augmentType.replace(' Slot', '')

      if (normalizedAugType === normalizedSlotType) {
        const groupKey: string = aug.augmentType || 'Other'
        groups[groupKey] ??= []
        groups[groupKey].push(aug)
      }
    }

    // Sort fallback groups too
    for (const key of Object.keys(groups)) {
      groups[key] = groups[key].toSorted((a, b) => a.name.localeCompare(b.name))
    }
  }

  const sortedGroupNames: string[] = Object.keys(groups).sort((a, b) => a.localeCompare(b))

  return { groups, sortedGroupNames }
}

export const renderGearPlanner = (props: Props) => {
  const {
    activeSetup,
    getEntityState,
    troveData,
    allAugments,
    allCurses,
    openSlotBrowser,
    openSetBonusBrowser,
    formatDropLocations,
    isMetal,
    setItemMinLevel,
    setItemMaterial,
    essenceEnchantments,
    setSlottedGemSetBonus,
    setSlottedAugment,
    setSlottedCurse,
    setEssenceEnchantment,
    setNearlyFinishedEnchantment,
    setRitualTableEnchantment,
    setLostPurposeEnchantment,
    setFountainOfNecroticMight,
    setStormreaverUpgrade
  } = props

  const renderItemNameAndDrop = (item: GearItem) => (
    <>
      <div className='fw-bold small text-dark mb-1'>{item.name}</div>
      {Array.isArray(item.dropLocations) && item.dropLocations.length > 0 && (
        <div className='text-primary' style={{ fontSize: '0.65rem', paddingBottom: '0.25rem' }}>
          <hr className='mb-1 mt-0' />
          <div style={{ lineHeight: '1.2' }}>{formatDropLocations(item.dropLocations)}</div>
          <hr className='mt-1 mb-0' />
        </div>
      )}
    </>
  )

  const renderItemMetadata = (item: GearItem) => (
    <>
      <div className='text-secondary mb-0' style={{ fontSize: '0.7rem' }}>
        ML: {item.minLevel || '1'} | {item.type || 'Item'}
        {item.material && (
          <>
            &nbsp;|&nbsp;
            <span
              className={`mb-1 fw-bold ${isMetal(item.material) ? 'text-danger' : 'text-success'}`}
              style={{ fontSize: '0.6rem' }}
            >
              {item.material} {isMetal(item.material) && '(Metal)'}
            </span>
          </>
        )}
      </div>

      {activeSetup.slottedCurses[item.id]?.name === 'Curse of Minor Masterworks' && (
        <div key='curse-boost-minor' className='text-success fw-bold' style={{ fontSize: '0.6rem' }}>
          Crafting Effect Level +1
        </div>
      )}

      {activeSetup.slottedCurses[item.id]?.name === 'Curse of Major Masterworks' && (
        <div key='curse-boost-major' className='text-success fw-bold' style={{ fontSize: '0.6rem' }}>
          Crafting Effect Level +2
        </div>
      )}
    </>
  )

  const renderSlot = (slot: GearSlot, setup: GearSetup): JSX.Element => {
    const owner: string = getSlotOwner(slot)
    const entityState = getEntityState(owner)

    const selectedItem: GearItem | null = entityState.slots[slot] ?? null
    const currentSlottedAugments = entityState.slottedAugments
    const currentSlottedNearlyFinished = entityState.slottedNearlyFinished
    const currentSlottedRitualTable = entityState.slottedRitualTable
    const currentSlottedLostPurpose = entityState.slottedLostPurpose
    const currentSlottedFountainOfNecroticMight = entityState.slottedFountainOfNecroticMight
    const currentSlottedStormreaverUpgrade = entityState.slottedStormreaverUpgrade

    const isFountainUpgraded = selectedItem ? currentSlottedFountainOfNecroticMight[selectedItem.id] : false
    const isStormreaverUpgraded = selectedItem ? currentSlottedStormreaverUpgrade[selectedItem.id] : false

    const displayEnchantments: LootEnchantment[] = selectedItem
      ? getDisplayEnchantments(selectedItem, isFountainUpgraded, isStormreaverUpgraded)
      : []

    return (
      <Col key={slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
        <Card className={`h-100 shadow-sm ${selectedItem ? 'border-primary' : ''} position-relative`}>
          <Card.Header
            className='py-1 px-2 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex justify-content-between align-items-center cursor-pointer'
            onClick={() => {
              openSlotBrowser(slot)
            }}
          >
            <div className='d-flex align-items-center gap-2'>
              <span>{slot}</span>
              {selectedItem && <TroveBadge itemName={selectedItem.name} troveData={troveData} />}
            </div>

            <FaMagnifyingGlass className='text-muted' size={12} />
          </Card.Header>

          <Card.Body
            className={`p-2 d-flex flex-column align-items-center ${selectedItem ? 'bg-white' : 'bg-dark-subtle justify-content-center'}`}
            style={{ minHeight: '100px' }}
          >
            {selectedItem ? (
              <div className='text-center w-100 d-flex flex-column'>
                {renderItemNameAndDrop(selectedItem)}

                {selectedItem.name.includes('Gem of Many Facets') && (
                  <GemSetBonusSelector
                    selectedItem={selectedItem}
                    activeSetup={activeSetup}
                    slot={slot}
                    setSlottedGemSetBonus={setSlottedGemSetBonus}
                  />
                )}

                <ItemSetBonusDisplay
                  selectedItem={selectedItem}
                  activeSetup={activeSetup}
                  openSetBonusBrowser={(setName: string) => {
                    openSetBonusBrowser(setName, slot)
                  }}
                />

                {(getMaxFiligreeSlots(selectedItem) > 0 || isMinorArtifact(selectedItem)) && (
                  <FiligreeLabel item={selectedItem} setup={activeSetup} slot={slot} />
                )}

                {renderItemMetadata(selectedItem)}

                {Array.isArray(displayEnchantments) && displayEnchantments.length > 0 && (
                  <div
                    className='text-start mt-1 pt-1 border-top gear-planner-slot-enchantments'
                    style={{ fontSize: '0.65rem' }}
                  >
                    <EnchantmentList
                      enchantments={displayEnchantments}
                      entityState={entityState}
                      itemId={selectedItem.id}
                      source='slot'
                    />
                  </div>
                )}

                {selectedItem.augments && selectedItem.augments.length > 0 && (
                  <div className='text-start mt-1 pt-1 border-top' style={{ fontSize: '0.65rem' }}>
                    {selectedItem.augments.map((augmentSlot: GearAugmentSlot, idx: number) => {
                      const applicable = getApplicableAugments(augmentSlot, allAugments)

                      return (
                        <AugmentSlotItem
                          key={`${String(augmentSlot.name)} ${String(idx)}`}
                          selectedItem={selectedItem}
                          idx={idx}
                          augSlot={augmentSlot}
                          slotted={
                            selectedItem.id in currentSlottedAugments
                              ? currentSlottedAugments[selectedItem.id][idx]
                              : null
                          }
                          applicable={applicable}
                          slot={slot}
                          entityState={entityState}
                          setSlottedAugment={setSlottedAugment}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      )
                    })}
                  </div>
                )}

                {selectedItem.essenceSlots && selectedItem.essenceSlots.length > 0 && (
                  <div className='text-start mt-1 pt-1 border-top' style={{ fontSize: '0.65rem' }}>
                    <EssenceCraftingSelector
                      selectedItem={selectedItem}
                      activeSetup={activeSetup}
                      slot={slot}
                      setEssenceEnchantment={setEssenceEnchantment}
                      setItemMinLevel={setItemMinLevel}
                      setItemMaterial={setItemMaterial}
                      essenceEnchantments={essenceEnchantments}
                      entityState={entityState}
                    />
                  </div>
                )}

                <NearlyFinishedSelector
                  item={selectedItem}
                  slot={slot}
                  selectedEnchantment={currentSlottedNearlyFinished[selectedItem.id] ?? null}
                  onSelect={(enchantment: LootEnchantment | null) => {
                    setNearlyFinishedEnchantment(selectedItem.id, enchantment, slot)
                  }}
                  entityState={entityState}
                  wrapperClassName='text-start mt-1 pt-1 border-top'
                  wrapperStyle={{ fontSize: '0.65rem' }}
                />

                <FountainOfNecroticMightSelector
                  item={selectedItem}
                  slot={slot}
                  active={currentSlottedFountainOfNecroticMight[selectedItem.id] || false}
                  onToggle={(active: boolean) => {
                    setFountainOfNecroticMight(selectedItem.id, active, slot)
                  }}
                  wrapperClassName='text-start mt-1 pt-1 border-top'
                  wrapperStyle={{ fontSize: '0.65rem' }}
                />

                <StormreaverUpgradeSelector
                  item={selectedItem}
                  slot={slot}
                  active={currentSlottedStormreaverUpgrade[selectedItem.id] || false}
                  onToggle={(active: boolean) => {
                    setStormreaverUpgrade(selectedItem.id, active, slot)
                  }}
                  wrapperClassName='text-start mt-1 pt-1 border-top'
                  wrapperStyle={{ fontSize: '0.65rem' }}
                />

                <RitualTableSelector
                  item={selectedItem}
                  slot={slot}
                  selectedEnchantment={currentSlottedRitualTable[selectedItem.id] ?? null}
                  onSelect={(enchantment: LootEnchantment | null) => {
                    setRitualTableEnchantment(selectedItem.id, enchantment, slot)
                  }}
                  troveData={troveData}
                  entityState={entityState}
                  wrapperClassName='text-start mt-1 pt-1 border-top'
                  wrapperStyle={{ fontSize: '0.65rem' }}
                />

                {Array.isArray(selectedItem.enchantments) &&
                  selectedItem.enchantments.some(
                    (enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose'
                  ) && (
                    <LostPurposeSelector
                      item={selectedItem}
                      slot={slot}
                      selectedEnchantment={currentSlottedLostPurpose[selectedItem.id] ?? null}
                      onSelect={(enchantment: LootEnchantment | null) => {
                        setLostPurposeEnchantment(selectedItem.id, enchantment, slot)
                      }}
                      entityState={entityState}
                      wrapperClassName='text-start mt-1 pt-1 border-top'
                      wrapperStyle={{ fontSize: '0.65rem' }}
                    />
                  )}

                <div className='text-start mt-1 pt-1 border-top' style={{ fontSize: '0.65rem' }}>
                  <CurseSlotItem
                    selectedItem={selectedItem}
                    allCurses={allCurses}
                    slotted={setup.slottedCurses[selectedItem.id]}
                    slot={slot}
                    entityState={entityState}
                    setCurse={setSlottedCurse}
                  />
                </div>
              </div>
            ) : (
              <div className='text-center italic small text-secondary'>No Item Selected</div>
            )}
          </Card.Body>
        </Card>
      </Col>
    )
  }

  return { renderSlot }
}

interface Props {
  activeSetup: GearSetup
  getEntityState: (owner: string) => EntityGearState
  setItemMinLevel: (itemId: string, minLevel: number, slot?: GearSlot) => void
  setItemMaterial: (itemId: string, material: string, slot?: GearSlot) => void
  essenceEnchantments: EssenceEnchantment[]
  troveData: ItemRollup | null
  allAugments: GearAugment[]
  allCurses: Curse[]
  openSlotBrowser: (slot: GearSlot | null) => void
  openSetBonusBrowser: (setName: string, slot?: GearSlot | null) => void
  formatDropLocations: (dropLocations: LootDropLocation[]) => ReactNode
  isMetal: (material: string | null | undefined) => boolean
  setSlottedGemSetBonus: (itemId: string, slotIndex: number, setName: string | null, slot?: GearSlot) => void
  setSlottedAugment: (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => void
  setSlottedCurse: (itemId: string, curse: Curse | null, slot?: GearSlot) => void
  setEssenceEnchantment: (itemId: string, slotName: string, enchantmentId: string | null, slot?: GearSlot) => void
  setNearlyFinishedEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setRitualTableEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setLostPurposeEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setFountainOfNecroticMight: (itemId: string, active: boolean, slot?: GearSlot) => void
  setStormreaverUpgrade: (itemId: string, active: boolean, slot?: GearSlot) => void
}
