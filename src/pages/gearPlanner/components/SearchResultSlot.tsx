import { Accordion, Badge, Card, Stack } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types'
import {
  cannithRepurposingStation as lostPurposeRecipes
} from '../../../data/cannithRepurposingStation.ts'
import nearlyFinishedRecipesRaw from '../../../data/nearlyFinished/recipes.json'
import { ritualTable } from '../../../data/ritualTable.ts'
import type { CraftingIngredient, SetBonus } from '../../../types/crafting.ts'
import { getTroveKey, getTroveOwners } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import {
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootEnchantment
} from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import GenericBadge from './badges/GenericBadge.tsx'
import SetBonusBadge from './badges/SetBonusBadge.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

interface NearlyFinishedRecipe {
  item: string
  stage: string
  choices?: { name: string }[]
}

const nearlyFinishedRecipes = nearlyFinishedRecipesRaw as unknown as {
  reforgingStation: NearlyFinishedRecipe[]
}

const getFiligreeHost = (
  item: GearItem,
  currentEquipped: GearItem[],
  currentSlottedFiligrees: Record<string, (GearItem | null)[]>
) => {
  for (const [itemId, filigrees] of Object.entries(currentSlottedFiligrees)) {
    if (filigrees.some((filigree: GearItem | null) => filigree?.id === item.id)) {
      const hostItem = currentEquipped.find((equipped: GearItem) => equipped.id === itemId)

      if (hostItem) {
        return hostItem
      }
    }
  }

  return null
}

const getUpgradeSource = (item: GearItem, browsingSet: string) => {
  const isLostPurposeItem: boolean | undefined =
    Array.isArray(item.enchantments) &&
    item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose')
  if (isLostPurposeItem) {
    const isLPSet: boolean = lostPurposeRecipes.some(
      (recipe: CraftingIngredient) => recipe.setBonus?.[0]?.name === browsingSet
    )

    if (isLPSet) {
      return 'Lost Purpose'
    }
  }

  const nfRecipe: NearlyFinishedRecipe | undefined = nearlyFinishedRecipes.reforgingStation.find(
    (recipe: NearlyFinishedRecipe) => recipe.item === item.name && recipe.stage === 'Nearly Finished'
  )
  if (nfRecipe) {
    const hasNFSet = nfRecipe.choices?.some((choice) => choice.name.includes(browsingSet))
    if (hasNFSet) {
      return 'Nearly Finished'
    }
  }

  const isWeapon = Array.isArray(item.enchantments) && item.enchantments.some((e) => e.name === 'Sealed in Fire')
  const isAccessory = Array.isArray(item.enchantments) && item.enchantments.some((e) => e.name === 'Sealed in Undeath')
  if (isWeapon || isAccessory) {
    const reqName: string = isWeapon ? 'Sealed in Fire Weapon' : 'Sealed in Undeath Accessory'
    const hasRitualSet: boolean = ritualTable.some(
      (recipe: CraftingIngredient) =>
        recipe.requirements?.some((req: CraftingIngredient) => req.name === reqName) &&
        recipe.setBonus?.some((sb: SetBonus) => sb.name === browsingSet)
    )

    if (hasRitualSet) {
      return 'Ritual Table'
    }
  }

  return ''
}

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

  const equippedInSlot: GearItem | undefined = currentEquipped.find((equipped: GearItem) => equipped.slot === slot)
  const isPartOfSet: boolean | undefined =
    !browsingSet || equippedInSlot?.setBonus?.some((sb: SetBonus) => sb.name === browsingSet)

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
            const hostItemForModal = getFiligreeHost(item, currentEquipped, currentSlottedFiligrees)
            const slottedHostName = hostItemForModal?.name ?? ''
            const isEquipped = isEquippedInSlot || !!slottedHostName

            const troveEntry = troveData?.[getTroveKey(item.name)]
            const owners = troveEntry ? getTroveOwners(troveEntry) : ''
            const showHeader = isEquipped || !!owners

            const upgradeSource: string = browsingSet ? getUpgradeSource(item, browsingSet) : ''

            return (
              <Card
                key={item.id}
                as={item.slot === 'Filigree' ? 'div' : 'button'}
                className={`shadow-sm border-secondary bg-white text-dark position-relative text-start p-0 w-100 ${
                  item.slot === 'Filigree' ? '' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (item.slot === 'Filigree') return
                  selectItem(item.slot, item)
                  setShowEnchantmentSearch(false)
                }}
                {...(item.slot !== 'Filigree' ? { type: 'button' } : {})}
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
  openSetBonusBrowser: (setName: string, slot?: GearSlot | null) => void
  troveData: ItemRollup | null
  browsingSet?: string | null
}

export default SearchResultSlot
