import { Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import FilterableDropdown from './FilterableDropdown.tsx'

// ----- Helpers (extracted to reduce duplication and improve readability) -----
const CLEAN_COLOR_SLOTS = new Set<string>([
  'red',
  'blue',
  'yellow',
  'purple',
  'orange',
  'green',
  'colorless',
  'sun',
  'moon'
])

/**
 * Cleans a raw slot name by removing prefixes and formatting it for display.
 * @param slot - The raw slot name string.
 * @returns The cleaned, human-readable slot name.
 */
const cleanSlotName = (slot: string): string =>
  slot
    .replace(/^isleOfDread/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()

/**
 * Determines if a cleaned slot name represents a color augment slot.
 * @param clean - The cleaned slot name.
 * @returns True if the slot is a color slot, false otherwise.
 */
const isColorSlotName = (clean: string): boolean => CLEAN_COLOR_SLOTS.has(clean.toLowerCase())

/**
 * Builds a display header for an augment slot.
 * @param slot - The raw slot name.
 * @param clean - The cleaned slot name.
 * @param isColorSlot - Whether the slot is a color slot.
 * @returns A formatted header string for the dropdown.
 */
const buildHeader = (slot: string, clean: string, isColorSlot: boolean): string => {
  const parts: string[] = clean.split(' ')
  const primary: string = titleCase(parts[0] || '')

  if (slot.includes('isleOfDread')) {
    const secondary: string = titleCase(parts.slice(1).join(' '))
    const secondarySlot = secondary ? ` (${secondary})` : ''
    return isColorSlot ? `${primary} Augment` : `Isle of Dread: ${primary} Slot${secondarySlot}`
  }

  const part1: string = parts[1] ? titleCase(parts[1]) : ''
  const part2: string = parts[2] ? titleCase(parts[2]) : ''

  return isColorSlot ? `${primary} Augment` : `${primary}: ${part1} (${part2})`
}

/**
 * Groups a list of ingredients by their augment type.
 * @param list - The list of ingredients to group.
 * @param fallbackHeader - The header to use if an ingredient has no augment type.
 * @returns A record where keys are augment types and values are arrays of ingredients.
 */
const groupByAugmentType = (list: Ingredient[] | undefined, fallbackHeader: string): Record<string, Ingredient[]> => {
  if (!list || list.length === 0) return {}

  return list.reduce<Record<string, Ingredient[]>>((material: Record<string, Ingredient[]>, ing: Ingredient) => {
    const key: string = ing.augmentType ?? fallbackHeader
    if (!material[key]) {
      material[key] = []
    }

    material[key].push(ing)

    return material
  }, {})
}

/**
 * Orders augment groups to ensure "Colorless" always appears last.
 * @param keys - The keys (augment types) present in the groups.
 * @param groups - The grouped ingredients.
 * @returns A new record with keys ordered, placing "Colorless" at the end.
 */
const orderAugments = (keys: string[], groups: Record<string, Ingredient[]>) => {
  const withoutColorless = keys.filter((k: string) => k.toLowerCase() !== 'colorless')
  const result: Record<string, Ingredient[]> = {}

  withoutColorless.forEach((k: string) => {
    result[k] = groups[k]
  })

  const colorlessKey = keys.find((k: string) => k.toLowerCase() === 'colorless')
  if (colorlessKey) {
    result[colorlessKey] = groups[colorlessKey]
  }

  return result
}

/**
 * Orders augment groups based on the specific color slot's preferred order.
 * @param groups - The grouped ingredients.
 * @param slotPrimaryLower - The lowercase primary name of the slot.
 * @param isColorSlot - Whether the slot is a color slot.
 * @returns A record with groups ordered according to slot-specific rules.
 */
const orderGroups = (
  groups: Record<string, Ingredient[]>,
  slotPrimaryLower: string,
  isColorSlot: boolean
): Record<string, Ingredient[]> => {
  const desiredOrderBySlot: Record<string, string[]> = {
    red: ['Red', 'Colorless'],
    blue: ['Blue', 'Colorless'],
    yellow: ['Yellow', 'Colorless'],
    purple: ['Purple', 'Red', 'Blue', 'Colorless'],
    orange: ['Orange', 'Red', 'Yellow', 'Colorless'],
    green: ['Green', 'Blue', 'Yellow', 'Colorless'],
    colorless: ['Colorless']
  }

  const keys: string[] = Object.keys(groups)

  // Non-color slots: keep the existing order but move Colorless (if any) to the end
  if (!isColorSlot) {
    return orderAugments(keys, groups)
  }

  const desired: string[] = desiredOrderBySlot[slotPrimaryLower] ?? []

  // Unknown color (e.g., Sun/Moon): preserve order, only ensure Colorless at the end
  if (desired.length === 0) {
    return orderAugments(keys, groups)
  }

  const result: Record<string, Ingredient[]> = {}
  desired.forEach((k: string) => {
    // Guard against keys that are in the desired order but not present in the actual groups
    if (groups[k]?.length) {
      result[k] = groups[k]
    }
  })

  // Include any unexpected keys (except Colorless) afterward
  keys
    .filter((k: string) => !desired.includes(k) && k.toLowerCase() !== 'colorless')
    .forEach((k: string) => {
      result[k] = groups[k]
    })

  // Colorless at the end if present
  const colorlessKey = keys.find((k: string) => k.toLowerCase() === 'colorless')
  if (colorlessKey) {
    result[colorlessKey] = groups[colorlessKey]
  }

  return result
}

/**
 * Resolves the label for the augment dropdown based on the current selection.
 * @param selectedAugments - The current selection state for all slots.
 * @param slot - The current slot key.
 * @param header - The header text to use in the placeholder.
 * @returns The name of the selected augment or a placeholder string.
 */
const resolveAugmentLabel = (
  selectedAugments: Record<string, AugmentItem | null>,
  slot: string,
  header: string
): string => selectedAugments[slot]?.name ?? `Select ${header}...`

/**
 * Splits Lamordia augments into Heroic and Legendary tiers based on minimum level.
 * @param list - The list of Lamordia ingredients.
 * @returns A record containing Heroic and Legendary groups.
 */
const groupLamordiaByTier = (list: Ingredient[] | undefined): Record<string, Ingredient[]> => {
  if (!list || list.length === 0) return { Heroic: [], Legendary: [] }
  const heroic: Ingredient[] = []
  const legendary: Ingredient[] = []

  list.forEach((ing: Ingredient) => {
    const lvl: number = ing.minimumLevel ?? 0
    if (lvl >= 30) {
      legendary.push(ing)
    } else {
      heroic.push(ing)
    }
  })

  // Sort within each tier for a consistent display
  heroic.sort((a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name))
  legendary.sort((a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name))

  return { Heroic: heroic, Legendary: legendary }
}

/**
 * Builds ingredient groups for a given slot based on its type (Color, Lamordia, or Generic).
 * @param source - The source map of ingredients.
 * @param slotKey - The key for the current slot.
 * @param headerLabel - The label to use for generic groups.
 * @param isColorSlot - Whether the current slot is a color slot.
 * @param isLamordiaSlot - Whether the current slot is a Lamordia slot.
 * @returns Grouped ingredients.
 */
const buildGroups = (
  source: Record<string, Ingredient[]>,
  slotKey: string,
  headerLabel: string,
  isColorSlot: boolean,
  isLamordiaSlot: boolean
): Record<string, Ingredient[]> => {
  if (isColorSlot) {
    return groupByAugmentType(source[slotKey], headerLabel)
  }

  if (isLamordiaSlot) {
    return groupLamordiaByTier(source[slotKey])
  }

  return { [headerLabel]: source[slotKey] }
}

/**
 * Component that renders a list of filterable dropdowns for each available augment slot.
 * @param props - Component props.
 */
const AugmentSlotFilterableDropdown = (props: Props) => {
  const {
    augmentFilterMode,
    augmentFilters,
    augmentOptions,
    availableAugmentSlots,
    filteredAugmentOptions,
    handleResetAugment,
    handleSelectAugment,
    selectedAugments,
    handleFilterModeChange,
    handleFiltersChange
  } = props

  return (
    <>
      {availableAugmentSlots.length > 0 ? (
        <Stack gap={3}>
          {availableAugmentSlots.map((slot: string) => {
            const clean: string = cleanSlotName(slot)
            const parts: string[] = clean.split(' ')
            const primary: string = titleCase(parts[0] || '')
            const isColorSlot: boolean = isColorSlotName(clean)
            const header: string = buildHeader(slot, clean, isColorSlot)

            const isLamordiaSlot = clean.toLowerCase().startsWith('lamordia')

            const itemsMap = buildGroups(augmentOptions, slot, header, isColorSlot, isLamordiaSlot)
            const filteredOptions = buildGroups(filteredAugmentOptions, slot, header, isColorSlot, isLamordiaSlot)

            const orderedItemsMap = isColorSlot ? orderGroups(itemsMap, primary.toLowerCase(), isColorSlot) : itemsMap
            const orderedFilteredOptions = isColorSlot
              ? orderGroups(filteredOptions, primary.toLowerCase(), isColorSlot)
              : filteredOptions

            return (
              <FilterableDropdown
                key={slot}
                dropdownTriggerPrefix='Aug:'
                title={header}
                items={orderedItemsMap}
                filteredItems={orderedFilteredOptions}
                onSelect={(aug: Ingredient) => {
                  handleSelectAugment(slot, aug)
                }}
                onReset={() => {
                  handleResetAugment(slot)
                }}
                selectedItem={selectedAugments[slot] ?? undefined}
                label={resolveAugmentLabel(selectedAugments, slot, header)}
                canFilter
                displayEffectsAdded
                onFilterModeChange={handleFilterModeChange}
                onFiltersChange={handleFiltersChange}
                filters={augmentFilters}
                filterMode={augmentFilterMode}
              />
            )
          })}
        </Stack>
      ) : (
        <p>No augment slots available.</p>
      )}
    </>
  )
}

interface Props {
  availableAugmentSlots: string[]
  augmentOptions: Record<string, Ingredient[]>
  filteredAugmentOptions: Record<string, Ingredient[]>
  selectedAugments: Record<string, AugmentItem | null>
  augmentFilters: string[]
  augmentFilterMode: 'OR' | 'AND'
  handleSelectAugment: (slot: string, aug: Ingredient) => void
  handleResetAugment: (slot: string) => void
  handleFilterModeChange: (mode: 'OR' | 'AND') => void
  handleFiltersChange: (filters: string[]) => void
}

export default AugmentSlotFilterableDropdown
