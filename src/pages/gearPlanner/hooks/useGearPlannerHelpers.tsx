import { type JSX, type ReactNode, useCallback } from 'react'
import { FaArrowUpRightFromSquare, FaGem } from 'react-icons/fa6'
import { isMinorArtifact } from '../helpers'
import {
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootDropLocation,
  SHIELD_TYPES
} from '../types'

/**
 * Checks if a material is considered metal.
 *
 * @param {string | null | undefined} material - The material to check.
 * @returns {boolean} True if the material is metal, false otherwise.
 */
export const isMetal = (material: string | null | undefined): boolean => {
  return [
    'steel',
    'iron',
    'gold',
    'silver',
    'mithral',
    'adamantine',
    'alchemical silver',
    'cold iron',
    'byeshk',
    'bronze',
    'copper',
    'dwarven iron',
    'magesteel',
    'planeforged steel',
    'spiritforged iron'
  ].includes(material?.trim().toLowerCase() ?? '')
}

/**
 * Formats drop locations into clickable links.
 *
 * @returns A function that takes drop locations and returns a formatted React node.
 */
export const useFormatDropLocations = () => {
  return useCallback((dropLocations: LootDropLocation[]): ReactNode => {
    if (!Array.isArray(dropLocations) || dropLocations.length === 0) {
      return null
    }

    const cleanLocationName = (name: string): string => {
      const lastParenOpen: number = name.lastIndexOf('(')
      const lastParenClose: number = name.lastIndexOf(')')

      if (lastParenOpen !== -1 && lastParenClose !== -1 && lastParenClose > lastParenOpen) {
        if (name.substring(lastParenClose + 1).trim() === '') {
          return name.substring(0, lastParenOpen).trim()
        }
      }

      return name.trim()
    }

    const locations: (null | JSX.Element)[] = dropLocations
      .map((loc: LootDropLocation) => {
        let text = ''

        if (loc.isCraftOnly) {
          text = 'Craft Only'
        } else if (loc.questWildernessChain) {
          text = loc.questWildernessChain
          if (loc.difficulty) text += ` (${loc.difficulty})`
        } else if (loc.adventurePack) {
          text = loc.adventurePack
        } else if (loc.sourceType) {
          text = loc.sourceType
        }

        if (!text) {
          return null
        }

        const cleanedName: string = cleanLocationName(text)
        const url = `https://ddocompendium.com/w/${encodeURIComponent(cleanedName)}`

        return (
          <a
            key={text}
            href={url}
            target='_blank'
            rel='noopener'
            referrerPolicy='no-referrer-when-downgrade'
            data-referrer='https://yourddo.com'
            className='text-primary'
          >
            {text} <FaArrowUpRightFromSquare />
          </a>
        )
      })
      .filter((node: null | JSX.Element): node is JSX.Element => node !== null)

    if (locations.length === 0) {
      return null
    }

    return (
      <>
        {locations.map((loc: JSX.Element | null, idx: number) => (
          <span key={`location-${String(idx)}`}>
            {idx > 0 ? ', ' : ''}
            {loc}
          </span>
        ))}
      </>
    )
  }, [])
}

/**
 * Checks if an item is visible based on the character's class and equipment filters.
 *
 * @param {GearItem} item - The item to check.
 * @param {GearSetup} setup - The current character setup.
 * @returns {boolean} True if the item should be visible, false otherwise.
 */
export const isItemVisible = (item: GearItem, setup: GearSetup): boolean => {
  const isArtificer: boolean = setup.classes.includes('Artificer')
  const isDruid: boolean = setup.classes.includes('Druid')

  if (item.slot === GearSlot.ArtificerPetArmor || item.slot === GearSlot.ArtificerPetWeapon) {
    return isArtificer
  }

  if (item.slot === GearSlot.DruidPetArmor || item.slot === GearSlot.DruidPetWeapon) {
    return isDruid
  }

  if (item.isEssenceCrafted) {
    return true
  }

  if (item.slot === GearSlot.Armor) {
    if (setup.armorFilters.length === 0) {
      return true
    }
    let effectiveType = item.type
    if (effectiveType === 'Robe' || effectiveType === 'Outfit') {
      effectiveType = 'Cloth Armor'
    }
    return setup.armorFilters.includes(effectiveType)
  }

  if (item.slot === GearSlot.MainHand) {
    if (setup.weaponFilters.length === 0) {
      return true
    }
    return setup.weaponFilters.includes(item.type)
  }

  if (item.slot === GearSlot.OffHand) {
    const isShield = SHIELD_TYPES.includes(item.type)
    if (isShield) {
      if (setup.shieldFilters.length === 0) {
        return true
      }
      return setup.shieldFilters.includes(item.type)
    }
    if (setup.weaponFilters.length === 0) {
      return true
    }
    return setup.weaponFilters.includes(item.type)
  }

  return true
}

/**
 * Checks if an item is visible for the current character classes (e.g., pet items).
 *
 * @returns A function that checks item visibility based on setup.
 */
export const useIsItemVisibleForClasses = () => {
  return useCallback((item: GearItem, setup: GearSetup) => isItemVisible(item, setup), [])
}

/**
 * A component that displays a label for filigree/sentience status on an item.
 */
export const FiligreeLabel = ({ item, setup, slot }: { item: GearItem; setup: GearSetup; slot: GearSlot }) => {
  const isSlotted: boolean = (setup.slottedFiligrees[item.id] ?? []).some(
    (filigree: GearItem | null): filigree is GearItem => filigree !== null
  )

  let label = 'Sentience Accepted'
  if (isSlotted) {
    const activeCount: number = (setup.slottedFiligrees[item.id] ?? []).filter(
      (filigree: GearItem | null): filigree is GearItem => filigree !== null
    ).length
    label = `Filigrees Slotted (${String(activeCount)})`
  } else if (isMinorArtifact(item)) {
    label = 'Minor Artifact'
  }

  return (
    <div className='w-100 d-flex justify-content-center my-1'>
      <button
        type='button'
        className='fw-bold border-0 bg-transparent p-0 d-flex align-items-center gap-1'
        style={{
          color: '#ff8c00',
          fontSize: '0.7rem'
        }}
        onClick={() => {
          ;(
            globalThis as unknown as {
              openFiligreeModal: (item: GearItem, slot: GearSlot) => void
            }
          ).openFiligreeModal(item, slot)
        }}
      >
        <FaGem size={10} />
        <span style={{ borderBottom: '1px dashed #ff8c00' }}>{label}</span>
      </button>
    </div>
  )
}
