import { Stack } from 'react-bootstrap'

const EnchantmentBonus = (props: Props) => {
  const { level, slot = '', showFullDisplay = false, noPlus = false } = props

  const getEnhancementBonus = (level: number): number => {
    const bonusEntry = ENHANCEMENT_BONUS_RANGES.find((range) => level >= range.minLevel && level <= range.maxLevel)
    return bonusEntry?.bonus ?? 0
  }

  const enhancementBonus = getEnhancementBonus(level)

  // If it's a weapon or armor, we want the full display
  if (showFullDisplay && (slot.toLowerCase().startsWith('weapon') || slot.toLowerCase() === 'armor')) {
    return (
      <Stack direction='horizontal' className='align-items-center justify-content-between'>
        <span>Enhancement Bonus:</span>
        <span>
          {enhancementBonus > 0 && !noPlus ? '+' : ''}
          {enhancementBonus}
        </span>
      </Stack>
    )
  }

  // Return the number as a string for other cases
  return (
    <span>
      {enhancementBonus > 0 ? '+' : ''}
      {enhancementBonus}
    </span>
  )
}

interface Props {
  level: number
  slot?: string
  showFullDisplay?: boolean
  noPlus?: boolean
}

// @formatter:off
const ENHANCEMENT_BONUS_RANGES = [
  { minLevel: 33, maxLevel: 34, bonus: 13 },
  { minLevel: 30, maxLevel: 32, bonus: 12 },
  { minLevel: 29, maxLevel: 29, bonus: 11 },
  { minLevel: 28, maxLevel: 28, bonus: 10 },
  { minLevel: 27, maxLevel: 27, bonus: 8 },
  { minLevel: 25, maxLevel: 26, bonus: 7 },
  { minLevel: 18, maxLevel: 24, bonus: 6 },
  { minLevel: 14, maxLevel: 17, bonus: 5 },
  { minLevel: 10, maxLevel: 13, bonus: 4 },
  { minLevel: 6, maxLevel: 9, bonus: 3 },
  { minLevel: 3, maxLevel: 5, bonus: 2 },
  { minLevel: 1, maxLevel: 2, bonus: 1 }
] as const
// @formatter:on

export default EnchantmentBonus
