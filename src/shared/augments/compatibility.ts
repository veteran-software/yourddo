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

export function normaliseAugmentSlotType(slotType: string): string {
  const slot = /\sSlot(?=\s|\(|$)/i.exec(slotType)
  if (!slot) return slotType.trim()
  return (slotType.slice(0, slot.index).trimEnd() + slotType.slice(slot.index + slot[0].length)).trim()
}

export const getColorAugmentType = (slotType: string): ColorAugmentType | undefined =>
  canonicalColorByLowerCase.get(normaliseAugmentSlotType(slotType).toLowerCase())

export const isColorAugmentSlot = (slotType: string): boolean => getColorAugmentType(slotType) !== undefined

export const getCompatibleAugmentTypes = (slotType: string): readonly string[] => {
  const color = getColorAugmentType(slotType)
  return color ? compatibleColorsBySlot[color] : [normaliseAugmentSlotType(slotType)]
}

export const augmentColors: Readonly<Record<string, string>> = {
  Red: 'red',
  Blue: 'blue',
  Yellow: 'yellow',
  Purple: 'violet',
  Orange: 'orange',
  Green: 'green',
  Colorless: 'gray',
  Sun: 'yellow',
  Moon: 'indigo'
}
export const hasColorPicker = (type: string) =>
  Boolean(getColorAugmentType(type)) || ['Sun', 'Moon'].includes(normaliseAugmentSlotType(type))
