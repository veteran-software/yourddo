import { augments } from '../data/augments.ts'
import type { AugmentItem } from '../types/augmentItem.ts'

export const findAugmentsForSlot = (slot: string): Record<string, AugmentItem[]> => {
  let augmentList: Record<string, AugmentItem[]>

  switch (slot.toLowerCase()) {
    case 'red':
      augmentList = {
        Red: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      break
    case 'blue':
      augmentList = {
        Blue: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      break
    case 'yellow':
      augmentList = {
        Yellow: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      break
    case 'purple':
      augmentList = {
        Red: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Blue: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Purple: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'purple'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      console.log(slot, augmentList)
      break
    case 'orange':
      augmentList = {
        Red: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'red'),
        Yellow: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Orange: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'orange'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      break
    case 'green':
      augmentList = {
        Blue: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'blue'),
        Yellow: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'yellow'),
        Green: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'green'),
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
      }
      break
    case 'sun':
      augmentList = {
        Sun: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'sun')
      }
      break
    case 'moon':
      augmentList = {
        Moon: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'moon')
      }
      break
    case 'lamordia: dolorous (armor)':
      augmentList = {
        'Lamordia: Dolorous (Armor)': [...augments].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: dolorous (armor)'
        )
      }
      break
    case 'lamordia: melancholic (armor)':
      augmentList = {
        'Lamordia: Melancholic (Armor)': [...augments].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: melancholic (armor)'
        )
      }
      break
    case 'lamordia: miserable (accessory)':
      augmentList = {
        'Lamordia: Miserable (Accessory)': [...augments].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: miserable (accessory)'
        )
      }
      break
    case 'lamordia: woeful (accessory)':
      augmentList = {
        'Lamordia: Woeful (Accessory)': [...augments].filter(
          (augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'lamordia: woeful (accessory)'
        )
      }
      break
    default: // colorless
      augmentList = {
        Colorless: [...augments].filter((augment: AugmentItem) => augment.augmentType?.toLowerCase() === 'colorless')
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
