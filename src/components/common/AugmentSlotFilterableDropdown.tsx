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

const cleanSlotName = (slot: string): string =>
  slot
    .replace(/^isleOfDread/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()

const isColorSlotName = (clean: string): boolean => CLEAN_COLOR_SLOTS.has(clean.toLowerCase())

const buildHeader = (slot: string, clean: string, isColorSlot: boolean): string => {
  const parts = clean.split(' ')
  const primary = titleCase(parts[0] || '')

  if (slot.includes('isleOfDread')) {
    const secondary: string = titleCase(parts.slice(1).join(' '))
    const secondarySlot = secondary ? ` (${secondary})` : ''
    return isColorSlot ? `${primary} Augment` : `Isle of Dread: ${primary} Slot${secondarySlot}`
  }

  return isColorSlot
    ? `${primary} Augment`
    : `${titleCase(parts[0] || '')}: ${titleCase(parts.slice(1)[0])} (${titleCase(parts.slice(1)[1])})`
}

const groupByAugmentType = (list: Ingredient[] | undefined, fallbackHeader: string): Record<string, Ingredient[]> => {
  if (!list || list.length === 0) return {}

  return list.reduce<Record<string, Ingredient[]>>((material, ing: Ingredient) => {
    const key: string = ing.augmentType ?? fallbackHeader
    if (!material[key]) {
      material[key] = []
    }

    material[key].push(ing)

    return material
  }, {})
}

const orderAugments = (keys: string[], groups: Record<string, Ingredient[]>) => {
  const withoutColorless = keys.filter((k) => k.toLowerCase() !== 'colorless')
  const result: Record<string, Ingredient[]> = {}

  withoutColorless.forEach((k) => {
    result[k] = groups[k]
  })

  const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
  if (colorlessKey) {
    result[colorlessKey] = groups[colorlessKey]
  }

  return result
}

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

  const keys = Object.keys(groups)

  // Non-color slots: keep the existing order but move Colorless (if any) to the end
  if (!isColorSlot) {
    return orderAugments(keys, groups)
  }

  const desired = desiredOrderBySlot[slotPrimaryLower]

  // Unknown color (e.g., Sun/Moon): preserve order, only ensure Colorless at the end
  if (desired.length === 0) {
    return orderAugments(keys, groups)
  }

  const result: Record<string, Ingredient[]> = {}
  desired.forEach((k) => {
    // Guard against keys that are in the desired order but not present in the actual groups
    if (groups[k]?.length) {
      result[k] = groups[k]
    }
  })

  // Include any unexpected keys (except Colorless) afterward
  keys
    .filter((k) => !desired.includes(k) && k.toLowerCase() !== 'colorless')
    .forEach((k) => {
      result[k] = groups[k]
    })

  // Colorless at the end if present
  const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
  if (colorlessKey) {
    result[colorlessKey] = groups[colorlessKey]
  }

  return result
}

const resolveAugmentLabel = (
  selectedAugments: Record<string, AugmentItem | null>,
  slot: string,
  header: string
): string => selectedAugments[slot]?.name ?? `Select ${header}...`

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
          {availableAugmentSlots.map((slot) => {
            const clean: string = cleanSlotName(slot)
            const parts: string[] = clean.split(' ')
            const primary: string = titleCase(parts[0] || '')
            const isColorSlot: boolean = isColorSlotName(clean)
            const header: string = buildHeader(slot, clean, isColorSlot)

            // Group color slots by augment color to organize alphabetically by color
            const isLamordiaSlot = clean.toLowerCase().startsWith('lamordia')

            // Helper to split Lamordia augments into Heroic vs Legendary headers
            const groupLamordiaByTier = (list: Ingredient[] | undefined): Record<string, Ingredient[]> => {
              if (!list || list.length === 0) return { Heroic: [], Legendary: [] }
              const heroic: Ingredient[] = []
              const legendary: Ingredient[] = []

              list.forEach((ing) => {
                const lvl: number = ing.minimumLevel ?? 0
                if (lvl >= 30) {
                  legendary.push(ing)
                } else {
                  heroic.push(ing)
                }
              })

              // Sort within each tier for a consistent display
              heroic.sort((a, b) => a.name.localeCompare(b.name))
              legendary.sort((a, b) => a.name.localeCompare(b.name))

              return { Heroic: heroic, Legendary: legendary }
            }

            // Avoid nested ternaries: common helper to build groups for a given source map
            const buildGroups = (
              source: Record<string, Ingredient[]>,
              slotKey: string,
              headerLabel: string
            ): Record<string, Ingredient[]> => {
              if (isColorSlot) {
                return groupByAugmentType(source[slotKey], headerLabel)
              }

              if (isLamordiaSlot) {
                return groupLamordiaByTier(source[slotKey])
              }

              return { [headerLabel]: source[slotKey] }
            }

            const itemsMap = buildGroups(augmentOptions, slot, header)
            const filteredOptions = buildGroups(filteredAugmentOptions, slot, header)

            // Order sections so that primary slot color is first, components next, and Colorless last
            const maybeOrder = (groups: Record<string, Ingredient[]>) =>
              isColorSlot ? orderGroups(groups, primary.toLowerCase(), isColorSlot) : groups

            const orderedItemsMap = maybeOrder(itemsMap)
            const orderedFilteredOptions = maybeOrder(filteredOptions)

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
