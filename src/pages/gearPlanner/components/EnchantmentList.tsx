import { Badge } from 'react-bootstrap'
import { checkPotentialConflict, type EnchantmentConflict, getBonus, normalizeString } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot, type LootEnchantment } from '../types.ts'

const EnchantmentList = (props: Props) => {
  const { browsingSlot, conflicts, enchantments, equippedItems, itemId, slottedAugments, source } = props

  if (!enchantments) return null

  return (
    <>
      {enchantments.map((ench: LootEnchantment, idx) => {
        let isOverridden = false
        let isRedundant = false
        let isMax = false
        let effectiveItems: EnchantmentConflict['items'] = []
        let overriddenItems: EnchantmentConflict['items'] = []

        const potential: ReturnType<typeof checkPotentialConflict> =
          source === 'slot'
            ? { isConflict: false, currentMax: 0, isRedundant: false }
            : checkPotentialConflict(ench, equippedItems, browsingSlot ?? undefined, slottedAugments)

        const modifierText = ench.modifier ? `+${String(ench.modifier)}` : ''
        const bonusText = ench.bonus ? `(${ench.bonus})` : ''
        const enchModifierText = ench.modifier ? ` (+${String(ench.modifier)} ${ench.bonus ?? ''})` : ''
        const enchText =
          source === 'slot'
            ? `• ${ench.name} ${modifierText} ${bonusText}`.replaceAll(/\s+/g, ' ').trim()
            : `• ${ench.name}${enchModifierText}`

        if (source === 'slot') {
          const itemConflicts = conflicts[normalizeString(ench.name)]
          const bonusToMatch = getBonus(ench.bonus)
          const conflict = itemConflicts?.find((c) => getBonus(c.bonus) === bonusToMatch)
          const itemInConflict = conflict?.items.find((i) => i.itemId === itemId)

          isOverridden = itemInConflict?.isEffective === false
          isMax = itemInConflict?.isEffective === true
          effectiveItems = conflict?.items.filter((i) => i.isEffective && i.itemId !== itemId) ?? []
          overriddenItems = conflict?.items.filter((i) => !i.isEffective && i.itemId !== itemId) ?? []

          // A 'Redundant' label only if:
          // 1. We are effective (isMax)
          // 2. We are NOT overriding anything (overriddenItems.length === 0)
          // 3. There is another item with the EXACT same value (isRedundant)
          isRedundant =
            isMax && overriddenItems.length === 0 && effectiveItems.some((i) => i.value === itemInConflict?.value)
        }

        const overriddenSlotNames = Array.from(new Set(overriddenItems.map((i) => i.slot))).join(', ')
        const effectiveSlotNames = Array.from(new Set(effectiveItems.map((i) => i.slot))).join(', ')

        let className = 'text-dark'
        if (source !== 'slot') {
          className = 'text-dark fw-bold'
        } else if (isOverridden) {
          className = 'text-decoration-line-through text-secondary'
        }

        return (
          <div
            key={`${ench.name}-${String(idx)}`}
            className={`d-flex align-items-baseline ${className}`}
            style={source === 'slot' ? {} : { maxWidth: '300px' }}
          >
            <span className='me-1 text-nowrap d-inline-flex gap-1'>
              {source === 'slot' ? (
                <>
                  {isMax && overriddenItems.length > 0 && (
                    <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                      <small>Overrides {overriddenSlotNames}</small>
                    </Badge>
                  )}
                  {isRedundant && (
                    <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                      <small>Redundant ({effectiveSlotNames})</small>
                    </Badge>
                  )}
                  {isOverridden && (
                    <Badge bg='danger' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                      <small>Overridden by {effectiveSlotNames}</small>
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  {potential.isConflict && potential.isRedundant && (
                    <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                      <small>Conflicts: {potential.currentMax}</small>
                    </Badge>
                  )}
                  {potential.isConflict && !potential.isRedundant && (
                    <Badge bg='info' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                      <small>Upgrades: {potential.currentMax}</small>
                    </Badge>
                  )}
                </>
              )}
            </span>
            <span className='text-truncate flex-grow-1' title={enchText}>
              {enchText}
            </span>
          </div>
        )
      })}
    </>
  )
}

interface Props {
  enchantments: LootEnchantment[] | null | undefined
  itemId: string
  conflicts: Record<string, EnchantmentConflict[]>
  equippedItems: GearItem[]
  source: 'slot' | 'search' | 'browser'
  browsingSlot?: GearSlot | null
  slottedAugments?: Record<string, Record<number, GearAugment | null>>
}

export default EnchantmentList
