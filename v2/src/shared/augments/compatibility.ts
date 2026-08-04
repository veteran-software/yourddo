export const colorAugmentTypes = ['Red', 'Blue', 'Yellow', 'Purple', 'Orange', 'Green', 'Colorless'] as const

export type ColorAugmentType = (typeof colorAugmentTypes)[number]

const canonicalColorByLowerCase = new Map<string, ColorAugmentType>(
  colorAugmentTypes.map((color) => [color.toLowerCase(), color])
)

const compatibleColorsBySlot: Readonly<Record<ColorAugmentType, readonly ColorAugmentType[]>> = {
  Red: ['Red', 'Colorless'],
  Blue: ['Blue', 'Colorless'],
  Yellow: ['Yellow', 'Colorless'],
  Purple: ['Purple', 'Red', 'Blue', 'Colorless'],
  Orange: ['Orange', 'Red', 'Yellow', 'Colorless'],
  Green: ['Green', 'Blue', 'Yellow', 'Colorless'],
  Colorless: ['Colorless']
}

export const normaliseAugmentSlotType = (slotType: string): string => slotType.replace(/\s+Slot(?=\s|\(|$)/i, '').trim()

export const getColorAugmentType = (slotType: string): ColorAugmentType | undefined =>
  canonicalColorByLowerCase.get(normaliseAugmentSlotType(slotType).toLowerCase())

export const isColorAugmentSlot = (slotType: string): boolean => getColorAugmentType(slotType) !== undefined

export const getCompatibleAugmentTypes = (slotType: string): readonly string[] => {
  const color = getColorAugmentType(slotType)
  return color ? compatibleColorsBySlot[color] : [normaliseAugmentSlotType(slotType)]
}
