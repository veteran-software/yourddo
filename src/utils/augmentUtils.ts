import augmentMaster from '../data/augments/augmentMaster.ts'
import type { AugmentItem } from '../types/augmentItem.ts'

export const findAugmentsForSlot = (slot: string): Record<string, AugmentItem[]> => {
  let augmentList: Record<string, AugmentItem[]>

  switch (slot.toLowerCase()) {
    case 'red':
      augmentList = {
        Red: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
    case 'blue':
      augmentList = {
        Blue: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
    case 'yellow':
      augmentList = {
        Yellow: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
    case 'purple':
      augmentList = {
        Red: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Blue: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Purple: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'purple'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      console.log(slot, augmentList)
      break
    case 'orange':
      augmentList = {
        Red: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Yellow: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Orange: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'orange'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
    case 'green':
      augmentList = {
        Blue: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Yellow: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Green: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'green'),
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
    case 'sun':
      augmentList = {
        Sun: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'sun')
      }
      break
    case 'moon':
      augmentList = {
        Moon: [...augmentMaster].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'moon')
      }
      break
    case 'lamordia: dolorous (armor)':
      augmentList = {
        'Lamordia: Dolorous (Armor)': [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: dolorous (armor)'
        )
      }
      break
    case 'lamordia: melancholic (armor)':
      augmentList = {
        'Lamordia: Melancholic (Armor)': [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: melancholic (armor)'
        )
      }
      break
    case 'lamordia: miserable (accessory)':
      augmentList = {
        'Lamordia: Miserable (Accessory)': [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: miserable (accessory)'
        )
      }
      break
    case 'lamordia: woeful (accessory)':
      augmentList = {
        'Lamordia: Woeful (Accessory)': [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: woeful (accessory)'
        )
      }
      break
    default: // colorless
      augmentList = {
        Colorless: [...augmentMaster].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless'
        )
      }
      break
  }

  const sortedAugmentList: Record<string, AugmentItem[]> = {}
  Object.keys(augmentList)
    .sort((a: string, b: string) => a.localeCompare(b))
    .forEach((key: string) => {
      sortedAugmentList[slot] = augmentList[key]
        .slice()
        .sort((a: AugmentItem, b: AugmentItem) => a.name.localeCompare(b.name))
    })

  return sortedAugmentList
}
