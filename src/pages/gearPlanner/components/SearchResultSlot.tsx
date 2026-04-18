import { Accordion, Badge, Card, Stack } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types'
import { cannithRepurposingStation as lostPurposeRecipes } from '../../../data/cannithRepurposingStation.ts'
import nearlyFinishedRecipes from '../../../data/nearlyFinished/recipes.json'
import { ritualTable } from '../../../data/ritualTable.ts'
import { getTroveKey, getTroveOwners } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot, type LootEnchantment } from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import GenericBadge from './badges/GenericBadge.tsx'
import SetBonusBadge from './badges/SetBonusBadge.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

const SearchResultSlot = (props: Props) => {
  const {
    browsingSet,
    currentConflicts,
    currentEquipped,
    currentSlottedAugments,
    currentSlottedFiligrees,
    items,
    openSetBonusBrowser,
    selectItem,
    setShowEnchantmentSearch,
    slot,
    troveData
  } = props

  const equippedInSlot = currentEquipped.find((e) => e.slot === slot)
  const isPartOfSet = !browsingSet || equippedInSlot?.setBonus?.some((sb) => sb.name === browsingSet)

  return (
    <Accordion.Item eventKey={slot} key={slot}>
      <Accordion.Header className='small fw-bold'>
        <div className='d-flex justify-content-between w-100 me-3'>
          <span>
            {slot} ({items.length})
          </span>
          {equippedInSlot && (
            <span className={`${isPartOfSet ? 'text-info' : 'text-warning'} ms-2`} style={{ fontSize: '0.75rem' }}>
              {equippedInSlot.name}
            </span>
          )}
        </div>
      </Accordion.Header>

      <Accordion.Body className='p-2 bg-dark'>
        <Stack gap={2}>
          {items.map((item) => {
            const isEquippedInSlot = currentEquipped.some((e) => e.id === item.id)
            let slottedHostName = ''
            let hostItemForModal: GearItem | undefined = undefined

            for (const [itemId, filigrees] of Object.entries(currentSlottedFiligrees)) {
              if (filigrees.some((filigree: GearItem | null) => filigree?.id === item.id)) {
                const hostItem: GearItem | undefined = currentEquipped.find((item: GearItem) => item.id === itemId)

                if (hostItem) {
                  slottedHostName = hostItem.name
                  hostItemForModal = hostItem

                  break
                }
              }
            }

            const isEquipped = isEquippedInSlot || !!slottedHostName

            const troveEntry = troveData?.[getTroveKey(item.name)]
            const owners = troveEntry ? getTroveOwners(troveEntry) : ''
            const showHeader = isEquipped || owners

            // Check for upgrade systems
            let upgradeSource = ''
            if (browsingSet) {
              const isLostPurposeItem = item.enchantments?.some((e: LootEnchantment) => e.name === 'Lost Purpose')
              if (isLostPurposeItem) {
                const isLPSet = lostPurposeRecipes.some((r) => r.setBonus?.[0]?.name === browsingSet)
                if (isLPSet) upgradeSource = 'Lost Purpose'
              }

              if (!upgradeSource) {
                const nfRecipe = (nearlyFinishedRecipes as any).reforgingStation?.find(
                  (r: any) => r.item === item.name && r.stage === 'Nearly Finished'
                )
                if (nfRecipe) {
                  // Check if any of the nearly finished choices for this item grant the browsing set
                  const hasNFSet = nfRecipe.choices?.some((choice: any) =>
                    // We assume choice name might match set name or we'd need more data
                    // In some cases NF adds a set bonus like 'Nearly Finished: ...'
                    choice.name.includes(browsingSet)
                  )
                  if (hasNFSet) upgradeSource = 'Nearly Finished'
                }
              }

              if (!upgradeSource) {
                const isWeapon = item.enchantments?.some((e: LootEnchantment) => e.name === 'Sealed in Fire')
                const isAccessory = item.enchantments?.some((e: LootEnchantment) => e.name === 'Sealed in Undeath')
                if (isWeapon || isAccessory) {
                  const reqName = isWeapon ? 'Sealed in Fire Weapon' : 'Sealed in Undeath Accessory'
                  const hasRitualSet = ritualTable.some(
                    (r) =>
                      r.requirements?.some((req) => req.name === reqName) &&
                      r.setBonus?.some((sb) => sb.name === browsingSet)
                  )
                  if (hasRitualSet) upgradeSource = 'Ritual Table'
                }
              }
            }

            return (
              <Card
                key={item.id}
                className={`shadow-sm border-secondary bg-white text-dark position-relative ${
                  item.slot === 'Filigree' ? '' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (item.slot === 'Filigree') return
                  selectItem(item.slot, item)
                  setShowEnchantmentSearch(false)
                }}
              >
                {showHeader && (
                  <Card.Header className='py-0 px-2 bg-secondary-subtle d-flex align-items-center gap-1 overflow-hidden'>
                    {isEquipped && (
                      <GenericBadge
                        badgeText={slottedHostName ? `Slotted (${slottedHostName})` : 'Equipped'}
                        onClick={
                          slottedHostName && hostItemForModal
                            ? () => {
                                ;(
                                  globalThis as unknown as {
                                    openFiligreeModal: (item: GearItem, slot: GearSlot) => void
                                  }
                                ).openFiligreeModal(hostItemForModal, hostItemForModal.slot)
                              }
                            : undefined
                        }
                      />
                    )}

                    {troveData && <TroveBadge itemName={item.name} troveData={troveData} />}
                  </Card.Header>
                )}

                <Card.Body className='p-2'>
                  <div className='fw-bold small text-truncate text-dark'>{item.name}</div>
                  <div
                    className='text-dark fw-medium d-flex justify-content-between align-items-center'
                    style={{ fontSize: '0.7rem' }}
                  >
                    <span>
                      ML: {item.minLevel || '1'} | {item.type || 'Item'}
                    </span>
                    {upgradeSource && (
                      <Badge bg='info' text='dark' style={{ fontSize: '0.6rem' }}>
                        via {upgradeSource}
                      </Badge>
                    )}
                  </div>

                  {item.setBonus && item.setBonus.length > 0 && (
                    <div className='mt-1 mb-1'>
                      {item.setBonus.map((sb) => (
                        <SetBonusBadge
                          key={`${item.id}-${sb.name}`}
                          setName={sb.name}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      ))}
                    </div>
                  )}

                  {item.augments && item.augments.length > 0 && <AugmentSlotsList augments={item.augments} />}

                  {Array.isArray(item.enchantments) && item.enchantments.length > 0 && (
                    <div
                      className='mt-1 pt-1 border-top border-secondary-subtle overflow-hidden'
                      style={{ fontSize: '0.7rem' }}
                    >
                      <EnchantmentList
                        enchantments={item.enchantments}
                        itemId={item.id}
                        conflicts={currentConflicts}
                        equippedItems={currentEquipped}
                        source='search'
                        browsingSlot={item.slot}
                        slottedAugments={currentSlottedAugments}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            )
          })}
        </Stack>
      </Accordion.Body>
    </Accordion.Item>
  )
}

interface Props {
  slot: string
  items: GearItem[]
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  currentSlottedFiligrees: Record<string, (GearItem | null)[]>
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  setShowEnchantmentSearch: (show: boolean) => void
  openSetBonusBrowser: (setName: string) => void
  troveData: ItemRollup | null
  browsingSet?: string | null
}

export default SearchResultSlot
