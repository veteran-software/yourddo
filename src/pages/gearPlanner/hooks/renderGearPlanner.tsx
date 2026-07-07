import { type JSX, type ReactNode } from 'react'
import { Button, Card, Col } from 'react-bootstrap'
import { FaChevronDown, FaChevronRight, FaMagnifyingGlass } from 'react-icons/fa6'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { SLOT_GROUPS } from '../../../utils/augmentUtils.ts'
import AlmostThereSelector from '../components/AlmostThereSelector'
import AugmentSlotItem from '../components/AugmentSlotItem'
import CurseSlotItem from '../components/CurseSlotItem'
import EnchantmentList from '../components/EnchantmentList'
import EssenceCraftingSelector from '../components/EssenceCraftingSelector'
import FinishingTouchSelector from '../components/FinishingTouchSelector'
import FountainOfNecroticMightSelector from '../components/FountainOfNecroticMightSelector'
import GemSetBonusSelector from '../components/GetSetBonusSelector'
import ItemSetBonusDisplay from '../components/ItemSetBonusDisplay'
import LostPurposeSelector from '../components/LostPurposeSelector'
import MythicBoostSelector from '../components/MythicBoostSelector'
import NearlyFinishedSelector from '../components/NearlyFinishedSelector'
import ReaperForgeSelector from '../components/ReaperForgeSelector'
import RitualTableSelector from '../components/RitualTableSelector'
import StormreaverUpgradeSelector from '../components/StormreaverUpgradeSelector'
import TraceOfMadnessSelector from '../components/TraceOfMadnessSelector'
import TroveBadge from '../components/TroveBadge'
import ZhentarimAttunedSelector from '../components/ZhentarimAttunedSelector'
import { getSlotOwner } from '../conflictResolver'
import { type EssenceEnchantment, nearlyFinishedNFUpgradedAugments } from '../dataLoader'
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

const detailSectionClassName = 'text-start mt-1 pt-1 border-top'
const detailSectionStyle = { fontSize: '0.65rem' }

const DetailSection = ({
  children,
  className = detailSectionClassName
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={className} style={detailSectionStyle}>
    {children}
  </div>
)

interface SlotCardState {
  selectedItem: GearItem
  slot: GearSlot
  setup: GearSetup
  entityState: EntityGearState
  itemCardCollapsed: boolean
  displayEnchantments: LootEnchantment[]
  effectiveAugments: GearAugmentSlot[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  currentSlottedNearlyFinished: Record<string, LootEnchantment | null>
  currentSlottedAlmostThere: Record<string, LootEnchantment | null>
  currentSlottedFinishingTouch: Record<string, LootEnchantment | null>
  currentSlottedFountainOfNecroticMight: Record<string, boolean>
  currentSlottedStormreaverUpgrade: Record<string, boolean>
  currentSlottedZhentarimAttuned: Record<string, boolean>
  currentSlottedMythicBoost: Record<string, LootEnchantment | null>
  currentSlottedReaperForge: Record<string, string | null>
  currentSlottedRitualTable: Record<string, LootEnchantment | null>
  currentSlottedLostPurpose: Record<string, LootEnchantment | null>
  currentSlottedTraceOfMadness: Record<string, LootEnchantment | null>
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
    setAlmostThereEnchantment,
    setFinishingTouchEnchantment,
    setRitualTableEnchantment,
    setLostPurposeEnchantment,
    setTraceOfMadnessEnchantment,
    setFountainOfNecroticMight,
    setStormreaverUpgrade,
    setZhentarimAttuned,
    setMythicBoost,
    setReaperForge,
    isItemCardCollapsed,
    toggleItemCardCollapsed
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
            {'\xa0|\xa0'}
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

  const renderSelectedItemBody = (state: SlotCardState) => {
    const currentSlottedAugmentsForItem: Record<number, GearAugment | null> =
      state.currentSlottedAugments[state.selectedItem.id] ?? {}

    return (
      <div className='w-100 d-flex flex-column'>
        <div className='flex-grow-1 text-center w-100 d-flex flex-column'>
          {renderItemNameAndDrop(state.selectedItem)}
          {renderItemMetadata(state.selectedItem)}

          {!state.itemCardCollapsed && (
            <>
              {state.selectedItem.name.includes('Gem of Many Facets') && (
                <GemSetBonusSelector
                  selectedItem={state.selectedItem}
                  activeSetup={state.setup}
                  slot={state.slot}
                  setSlottedGemSetBonus={setSlottedGemSetBonus}
                />
              )}

              <ItemSetBonusDisplay
                selectedItem={state.selectedItem}
                activeSetup={state.setup}
                openSetBonusBrowser={(setName: string) => {
                  openSetBonusBrowser(setName, state.slot)
                }}
              />

              {(getMaxFiligreeSlots(state.selectedItem) > 0 || isMinorArtifact(state.selectedItem)) && (
                <FiligreeLabel item={state.selectedItem} setup={state.setup} slot={state.slot} />
              )}

              {Array.isArray(state.displayEnchantments) && state.displayEnchantments.length > 0 && (
                <DetailSection className='text-start mt-1 pt-1 border-top gear-planner-slot-enchantments'>
                  <EnchantmentList
                    enchantments={state.displayEnchantments}
                    entityState={state.entityState}
                    itemId={state.selectedItem.id}
                    source='slot'
                  />
                </DetailSection>
              )}

              {state.effectiveAugments.length > 0 && (
                <DetailSection>
                  {state.effectiveAugments.map((augmentSlot: GearAugmentSlot, idx: number) => {
                    const applicable = getApplicableAugments(augmentSlot, allAugments)

                    return (
                      <AugmentSlotItem
                        key={`${String(augmentSlot.name)} ${String(idx)}`}
                        selectedItem={state.selectedItem}
                        idx={idx}
                        augSlot={augmentSlot}
                        slotted={currentSlottedAugmentsForItem[idx] ?? null}
                        applicable={applicable}
                        slot={state.slot}
                        entityState={state.entityState}
                        setSlottedAugment={setSlottedAugment}
                        openSetBonusBrowser={openSetBonusBrowser}
                      />
                    )
                  })}
                </DetailSection>
              )}

              {(state.selectedItem.essenceSlots?.length ?? 0) > 0 && (
                <DetailSection>
                  <EssenceCraftingSelector
                    selectedItem={state.selectedItem}
                    activeSetup={state.setup}
                    slot={state.slot}
                    setEssenceEnchantment={setEssenceEnchantment}
                    setItemMinLevel={setItemMinLevel}
                    setItemMaterial={setItemMaterial}
                    essenceEnchantments={essenceEnchantments}
                    entityState={state.entityState}
                  />
                </DetailSection>
              )}

              <NearlyFinishedSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEnchantment={state.currentSlottedNearlyFinished[state.selectedItem.id] ?? null}
                onSelect={(enchantment: LootEnchantment | null) => {
                  setNearlyFinishedEnchantment(state.selectedItem.id, enchantment, state.slot)
                }}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <AlmostThereSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEnchantment={state.currentSlottedAlmostThere[state.selectedItem.id] ?? null}
                onSelect={(enchantment: LootEnchantment | null) => {
                  setAlmostThereEnchantment(state.selectedItem.id, enchantment, state.slot)
                }}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <FinishingTouchSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEnchantment={state.currentSlottedFinishingTouch[state.selectedItem.id] ?? null}
                onSelect={(enchantment: LootEnchantment | null) => {
                  setFinishingTouchEnchantment(state.selectedItem.id, enchantment, state.slot)
                }}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <FountainOfNecroticMightSelector
                item={state.selectedItem}
                slot={state.slot}
                active={state.currentSlottedFountainOfNecroticMight[state.selectedItem.id] || false}
                onToggle={(active: boolean) => {
                  setFountainOfNecroticMight(state.selectedItem.id, active, state.slot)
                }}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <StormreaverUpgradeSelector
                item={state.selectedItem}
                slot={state.slot}
                active={state.currentSlottedStormreaverUpgrade[state.selectedItem.id] || false}
                onToggle={(active: boolean) => {
                  setStormreaverUpgrade(state.selectedItem.id, active, state.slot)
                }}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <ZhentarimAttunedSelector
                item={state.selectedItem}
                slot={state.slot}
                active={state.currentSlottedZhentarimAttuned[state.selectedItem.id] || false}
                onToggle={(active: boolean) => {
                  setZhentarimAttuned(state.selectedItem.id, active, state.slot)
                }}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <MythicBoostSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEnchantment={state.currentSlottedMythicBoost[state.selectedItem.id] ?? null}
                onSelect={(enchantment: LootEnchantment | null) => {
                  setMythicBoost(state.selectedItem.id, enchantment, state.slot)
                }}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <ReaperForgeSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEffectId={state.currentSlottedReaperForge[state.selectedItem.id] ?? null}
                onSelectEffect={(effectId: string | null) => {
                  setReaperForge(state.selectedItem.id, effectId, state.slot)
                }}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              <RitualTableSelector
                item={state.selectedItem}
                slot={state.slot}
                selectedEnchantment={state.currentSlottedRitualTable[state.selectedItem.id] ?? null}
                onSelect={(enchantment: LootEnchantment | null) => {
                  setRitualTableEnchantment(state.selectedItem.id, enchantment, state.slot)
                }}
                troveData={troveData}
                entityState={state.entityState}
                wrapperClassName={detailSectionClassName}
                wrapperStyle={detailSectionStyle}
              />

              {state.selectedItem.enchantments?.some(
                (enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose'
              ) && (
                <LostPurposeSelector
                  item={state.selectedItem}
                  slot={state.slot}
                  selectedEnchantment={state.currentSlottedLostPurpose[state.selectedItem.id] ?? null}
                  onSelect={(enchantment: LootEnchantment | null) => {
                    setLostPurposeEnchantment(state.selectedItem.id, enchantment, state.slot)
                  }}
                  entityState={state.entityState}
                  wrapperClassName={detailSectionClassName}
                  wrapperStyle={detailSectionStyle}
                />
              )}

              {state.selectedItem.enchantments?.some(
                (enchantment: LootEnchantment) => enchantment.name === 'Trace of Madness'
              ) && (
                <TraceOfMadnessSelector
                  item={state.selectedItem}
                  slot={state.slot}
                  selectedEnchantment={state.currentSlottedTraceOfMadness[state.selectedItem.id] ?? null}
                  onSelect={(enchantment: LootEnchantment | null) => {
                    setTraceOfMadnessEnchantment(state.selectedItem.id, enchantment, state.slot)
                  }}
                  entityState={state.entityState}
                  wrapperClassName={detailSectionClassName}
                  wrapperStyle={detailSectionStyle}
                />
              )}

              <DetailSection>
                <CurseSlotItem
                  selectedItem={state.selectedItem}
                  allCurses={allCurses}
                  slotted={state.setup.slottedCurses[state.selectedItem.id]}
                  slot={state.slot}
                  entityState={state.entityState}
                  setCurse={setSlottedCurse}
                />
              </DetailSection>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderSlotCard = (state: SlotCardState) => {
    return (
      <Col key={state.slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
        <Card className='h-100 shadow-sm border-primary position-relative'>
          <Card.Header className='p-0 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex align-items-stretch'>
            <Button
              variant='link'
              type='button'
              className='gear-planner-slot-header-main d-flex align-items-center justify-content-between gap-2 text-secondary-emphasis text-decoration-none text-start rounded-0 border-0 shadow-none'
              onClick={() => {
                openSlotBrowser(state.slot)
              }}
            >
              <span className='d-flex align-items-center gap-2 min-w-0'>
                <span className='gear-planner-slot-header-label text-truncate'>{state.slot}</span>
                <TroveBadge itemName={state.selectedItem.name} troveData={troveData} />
              </span>

              <FaMagnifyingGlass className='text-muted flex-shrink-0' size={12} />
            </Button>

            <Button
              variant='link'
              type='button'
              className='gear-planner-slot-header-collapse flex-shrink-0 text-secondary-emphasis text-decoration-none rounded-0 border-start border-0 shadow-none'
              aria-label={
                state.itemCardCollapsed ? `Expand ${state.selectedItem.name}` : `Collapse ${state.selectedItem.name}`
              }
              title={state.itemCardCollapsed ? 'Expand card' : 'Collapse card'}
              onClick={(e) => {
                e.stopPropagation()
                toggleItemCardCollapsed(state.selectedItem.id)
              }}
            >
              {state.itemCardCollapsed ? <FaChevronRight size={10} /> : <FaChevronDown size={10} />}
            </Button>
          </Card.Header>

          <Card.Body className='p-2 d-flex flex-column align-items-center bg-white' style={{ minHeight: '100px' }}>
            {renderSelectedItemBody(state)}
          </Card.Body>
        </Card>
      </Col>
    )
  }

  const renderSlot = (slot: GearSlot, setup: GearSetup): JSX.Element => {
    const owner: string = getSlotOwner(slot)
    const entityState = getEntityState(owner)

    const selectedItem: GearItem | null = entityState.slots[slot] ?? null
    const currentSlottedAugments = entityState.slottedAugments
    const currentSlottedNearlyFinished = entityState.slottedNearlyFinished
    const currentSlottedAlmostThere = entityState.slottedAlmostThere
    const currentSlottedFinishingTouch = entityState.slottedFinishingTouch
    const currentSlottedRitualTable = entityState.slottedRitualTable
    const currentSlottedLostPurpose = entityState.slottedLostPurpose
    const currentSlottedTraceOfMadness = entityState.slottedTraceOfMadness
    const currentSlottedFountainOfNecroticMight = entityState.slottedFountainOfNecroticMight
    const currentSlottedStormreaverUpgrade = entityState.slottedStormreaverUpgrade
    const currentSlottedZhentarimAttuned = entityState.slottedZhentarimAttuned
    const currentSlottedMythicBoost = entityState.slottedMythicBoost
    const currentSlottedReaperForge = entityState.slottedReaperForge
    const itemCardCollapsed = selectedItem ? isItemCardCollapsed(selectedItem.id) : false

    const isFountainUpgraded = selectedItem ? currentSlottedFountainOfNecroticMight[selectedItem.id] : false
    const isStormreaverUpgraded = selectedItem ? currentSlottedStormreaverUpgrade[selectedItem.id] : false
    const isZhentarimUpgraded = selectedItem ? currentSlottedZhentarimAttuned[selectedItem.id] : false
    const mythicBoost = selectedItem ? (currentSlottedMythicBoost[selectedItem.id] ?? null) : null

    const displayEnchantments: LootEnchantment[] = selectedItem
      ? getDisplayEnchantments(
          selectedItem,
          isFountainUpgraded,
          isStormreaverUpgraded,
          isZhentarimUpgraded,
          mythicBoost
        )
      : []

    const nfAddedAugments = selectedItem ? nearlyFinishedNFUpgradedAugments[selectedItem.name] : undefined
    const hasAnyNFUpgradeActive = selectedItem
      ? !!currentSlottedNearlyFinished[selectedItem.id] ||
        !!currentSlottedAlmostThere[selectedItem.id] ||
        !!currentSlottedFinishingTouch[selectedItem.id]
      : false
    const effectiveAugments =
      nfAddedAugments && hasAnyNFUpgradeActive ? nfAddedAugments : (selectedItem?.augments ?? [])

    if (!selectedItem) {
      return (
        <Col key={slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
          <Card className='h-100 shadow-sm position-relative'>
            <Card.Header className='p-0 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex align-items-stretch'>
              <Button
                variant='link'
                type='button'
                className='gear-planner-slot-header-main gear-planner-slot-header-main-alone d-flex align-items-center justify-content-between gap-2 text-secondary-emphasis text-decoration-none text-start rounded-0 border-0 shadow-none'
                onClick={() => {
                  openSlotBrowser(slot)
                }}
              >
                <span className='d-flex align-items-center gap-2 min-w-0'>
                  <span className='gear-planner-slot-header-label text-truncate'>{slot}</span>
                </span>

                <FaMagnifyingGlass className='text-muted flex-shrink-0' size={12} />
              </Button>
            </Card.Header>

            <Card.Body
              className='p-2 d-flex flex-column align-items-center bg-dark-subtle justify-content-center'
              style={{ minHeight: '100px' }}
            >
              <div className='text-center italic small text-secondary'>No Item Selected</div>
            </Card.Body>
          </Card>
        </Col>
      )
    }

    return renderSlotCard({
      slot,
      selectedItem,
      itemCardCollapsed,
      entityState,
      setup,
      displayEnchantments,
      effectiveAugments,
      currentSlottedAugments,
      currentSlottedNearlyFinished,
      currentSlottedAlmostThere,
      currentSlottedFinishingTouch,
      currentSlottedFountainOfNecroticMight,
      currentSlottedStormreaverUpgrade,
      currentSlottedZhentarimAttuned,
      currentSlottedMythicBoost,
      currentSlottedReaperForge,
      currentSlottedRitualTable,
      currentSlottedLostPurpose,
      currentSlottedTraceOfMadness
    })
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
  setAlmostThereEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setFinishingTouchEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setRitualTableEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setLostPurposeEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setTraceOfMadnessEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setFountainOfNecroticMight: (itemId: string, active: boolean, slot?: GearSlot) => void
  setStormreaverUpgrade: (itemId: string, active: boolean, slot?: GearSlot) => void
  setZhentarimAttuned: (itemId: string, active: boolean, slot?: GearSlot) => void
  setMythicBoost: (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => void
  setReaperForge: (itemId: string, effectId: string | null, slot?: GearSlot) => void
  isItemCardCollapsed: (itemId: string) => boolean
  toggleItemCardCollapsed: (itemId: string) => void
  allItemCardsCollapsed: boolean
}
