import type { ReactElement } from 'react'
import { Accordion } from 'react-bootstrap'
import BrowserItem from '../components/BrowserItem.tsx'
import LazyAccordionBody from '../components/LazyAccordionBody.tsx'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import {
  type GearAugment,
  type GearItem,
  GearSlot,
  SHIELD_TYPES,
  WEAPON_TYPES
} from '../types.ts'

const useItemBrowser = (props: Props) => {
  const {
    browsingSlot,
    filteredItems,
    getContextInfo,
    isMetal,
    itemsToShow,
    openSetBonusBrowser,
    selectItem,
    setBonusFilter
  } = props

  const getMatchedType = (item: GearItem, types: string[]) => {
    const matchedType = types.find((t) => {
      const tLower = t.toLowerCase()
      if (item.type.toLowerCase() === tLower) return true

      if (
        tLower === 'handwraps' &&
        (item.type === 'Gloves' || item.type.toLowerCase() === 'handwraps')
      ) {
        return true
      }

      return item.type === 'Weapon' && item.name.toLowerCase().includes(tLower)
    })

    return matchedType ?? item.type
  }

  const isItemMatchForTypes = (item: GearItem, types: string[]) => {
    const typeLower = item.type.toLowerCase()
    const nameLower = item.name.toLowerCase()

    return types.some((t) => {
      const tLower = t.toLowerCase()

      // Strict match for type first
      if (typeLower === tLower) return true

      // Special case for handwraps
      if (
        tLower === 'handwraps' &&
        (item.type === 'Gloves' || typeLower === 'handwraps')
      )
        return true

      // Fallback to name match for generic "Weapon" types or if type is slightly different
      return item.type === 'Weapon' && nameLower.includes(tLower)
    })
  }

  const renderCategorizedItems = (): ReactElement | null => {
    if (browsingSlot === GearSlot.MainHand) {
      const weaponCategories = Object.entries(WEAPON_TYPES)

      return (
        <Accordion defaultActiveKey='0' data-bs-theme='dark'>
          {weaponCategories.map(([category, types], idx) => {
            const categoryItems = filteredItems.filter((i) =>
              isItemMatchForTypes(i, types)
            )

            if (categoryItems.length === 0) return <></>

            // Try to find if any item of this category is equipped in the current slot
            const { currentEquipped } = getContextInfo(browsingSlot)
            const equippedInSlot = currentEquipped.find(
              (e) => e.slot === browsingSlot
            )
            const isThisCategoryEquipped =
              equippedInSlot && isItemMatchForTypes(equippedInSlot, types)
            const isPartofSet =
              !setBonusFilter ||
              equippedInSlot?.setBonus?.some((sb) => sb.name === setBonusFilter)

            // Sub-categorize by individual type within the main category
            const typeGroups: Record<string, GearItem[]> = {}

            categoryItems.forEach((item) => {
              const matchedType = getMatchedType(item, types)
              if (!typeGroups[matchedType]) typeGroups[matchedType] = []
              typeGroups[matchedType].push(item)
            })

            return (
              <Accordion.Item eventKey={String(idx)} key={category}>
                <Accordion.Header>
                  <div className='d-flex justify-content-between w-100 me-3'>
                    <span>
                      {category} Weapons ({categoryItems.length})
                    </span>

                    {isThisCategoryEquipped && (
                      <span
                        className={`${isPartofSet ? 'text-info' : 'text-danger'} ms-2`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {equippedInSlot.name}
                      </span>
                    )}
                  </div>
                </Accordion.Header>

                <Accordion.Body className='ps-2 pe-0 py-0 bg-dark-subtle'>
                  <LazyAccordionBody
                    items={categoryItems}
                    renderItems={() => renderTypeGroups(typeGroups)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )
    }

    if (browsingSlot === GearSlot.OffHand) {
      const shieldItems = filteredItems.filter((i) =>
        SHIELD_TYPES.includes(i.type)
      )
      const weaponItems = filteredItems.filter(
        (i) => !SHIELD_TYPES.includes(i.type)
      )

      const { currentEquipped } = getContextInfo(browsingSlot)
      const equippedInSlot = currentEquipped.find(
        (e) => e.slot === browsingSlot
      )
      const isPartofSet =
        !setBonusFilter ||
        equippedInSlot?.setBonus?.some((sb) => sb.name === setBonusFilter)

      const renderSubCategories = (items: GearItem[]): ReactElement => {
        const typeGroups: Record<string, GearItem[]> = {}
        items.forEach((item) => {
          const type = item.type
          if (!typeGroups[type]) typeGroups[type] = []
          typeGroups[type].push(item)
        })

        return (
          <LazyAccordionBody
            items={items}
            renderItems={() => renderTypeGroups(typeGroups)}
          />
        )
      }

      return (
        <Accordion defaultActiveKey='0' data-bs-theme='dark'>
          {shieldItems.length > 0 && (
            <Accordion.Item eventKey='shields'>
              <Accordion.Header>
                <div className='d-flex justify-content-between w-100 me-3'>
                  <span>Shields & Rune Arms ({shieldItems.length})</span>

                  {equippedInSlot &&
                    SHIELD_TYPES.includes(equippedInSlot.type) && (
                      <span
                        className={`${isPartofSet ? 'text-info' : 'text-danger'} ms-2`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {equippedInSlot.name}
                      </span>
                    )}
                </div>
              </Accordion.Header>
              <Accordion.Body className='p-2 bg-dark-subtle'>
                {renderSubCategories(shieldItems)}
              </Accordion.Body>
            </Accordion.Item>
          )}

          {weaponItems.length > 0 && (
            <Accordion.Item eventKey='weapons'>
              <Accordion.Header>
                <div className='d-flex justify-content-between w-100 me-3'>
                  <span>Off-hand Weapons ({weaponItems.length})</span>
                  {equippedInSlot &&
                    !SHIELD_TYPES.includes(equippedInSlot.type) && (
                      <span
                        className={`${isPartofSet ? 'text-info' : 'text-danger'} ms-2`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {equippedInSlot.name}
                      </span>
                    )}
                </div>
              </Accordion.Header>
              <Accordion.Body className='p-2 bg-dark-subtle'>
                {renderSubCategories(weaponItems)}
              </Accordion.Body>
            </Accordion.Item>
          )}
        </Accordion>
      )
    }

    return renderItems(filteredItems)
  }

  const renderItems = (
    items: GearItem[],
    showCount = true,
    useLimit = true
  ): ReactElement | null => {
    if (!browsingSlot) return null
    const { currentConflicts, currentEquipped, currentSlottedAugments } =
      getContextInfo(browsingSlot)

    const itemsToDisplay = useLimit ? items.slice(0, itemsToShow) : items

    return (
      <>
        {showCount && (
          <p className='text-light small mb-2'>
            Showing {Math.min(itemsToDisplay.length, items.length)} of{' '}
            {items.length} results
          </p>
        )}

        <div className='list-group shadow-sm'>
          {itemsToDisplay.map((item) => (
            <BrowserItem
              key={item.id}
              item={item}
              browsingSlot={browsingSlot}
              currentConflicts={currentConflicts}
              currentEquipped={currentEquipped}
              currentSlottedAugments={currentSlottedAugments}
              selectItem={selectItem}
              isMetal={isMetal}
              openSetBonusBrowser={openSetBonusBrowser}
            />
          ))}
        </div>
      </>
    )
  }

  const renderTypeGroups = (
    typeGroups: Record<string, GearItem[]>
  ): ReactElement => {
    if (!browsingSlot) return <></>
    const { currentEquipped } = getContextInfo(browsingSlot)

    return (
      <Accordion data-bs-theme='dark'>
        {Object.entries(typeGroups).map(([typeName, items], subIdx) => {
          // Try to find if any item of this type is equipped in the current slot
          const equippedInSlot = currentEquipped.find(
            (e) => e.slot === browsingSlot
          )
          const isThisTypeEquipped =
            equippedInSlot &&
            (getMatchedType(equippedInSlot, [typeName]) === typeName ||
              equippedInSlot.type === typeName)
          const isPartofSet =
            !setBonusFilter ||
            equippedInSlot?.setBonus?.some((sb) => sb.name === setBonusFilter)

          return (
            <Accordion.Item eventKey={String(subIdx)} key={typeName}>
              <Accordion.Header
                className={
                  browsingSlot === GearSlot.MainHand ? 'rounded-0' : ''
                }
              >
                <div className='d-flex justify-content-between w-100 me-3 small fw-bold'>
                  <span>
                    {typeName} ({items.length})
                  </span>

                  {isThisTypeEquipped && (
                    <span
                      className={`${isPartofSet ? 'text-info' : 'text-danger'} ms-2`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {equippedInSlot.name}
                    </span>
                  )}
                </div>
              </Accordion.Header>

              <Accordion.Body className='p-2 bg-dark'>
                <LazyAccordionBody
                  items={items}
                  renderItems={(items) => renderItems(items, false, false)}
                />
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
    )
  }

  return {
    renderCategorizedItems
  }
}

interface Props {
  browsingSlot: GearSlot | null
  itemsToShow: number
  filteredItems: GearItem[]
  getContextInfo: (slot: GearSlot) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  isMetal: (material: string | null | undefined) => boolean
  openSetBonusBrowser: (setName: string) => void
  setBonusFilter?: string | null
}

export default useItemBrowser
