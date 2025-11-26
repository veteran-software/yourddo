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

const groupByAugmentType = (
  list: Ingredient[] | undefined,
  fallbackHeader: string
): Record<string, Ingredient[]> => {
  if (!list || list.length === 0) return {}

  return list.reduce<Record<string, Ingredient[]>>((m, ing: Ingredient) => {
    const key: string = ing.augmentType ?? fallbackHeader
    if (!m[key]) m[key] = []
    m[key].push(ing)
    return m
  }, {})
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

  // Non-color slots: keep existing order but move Colorless (if any) to the end
  if (!isColorSlot) {
    const withoutColorless = keys.filter((k) => k.toLowerCase() !== 'colorless')
    const result: Record<string, Ingredient[]> = {}
    withoutColorless.forEach((k) => {
      result[k] = groups[k]
    })
    const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
    if (colorlessKey) result[colorlessKey] = groups[colorlessKey]
    return result
  }

  const desired = desiredOrderBySlot[slotPrimaryLower]

  // Unknown color (e.g., Sun/Moon): preserve order, only ensure Colorless at the end
  if (!desired || desired.length === 0) {
    const withoutColorless = keys.filter((k) => k.toLowerCase() !== 'colorless')
    const result: Record<string, Ingredient[]> = {}
    withoutColorless.forEach((k) => {
      result[k] = groups[k]
    })
    const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
    if (colorlessKey) result[colorlessKey] = groups[colorlessKey]
    return result
  }

  const result: Record<string, Ingredient[]> = {}
  desired.forEach((k) => {
    if (groups[k] && groups[k].length) result[k] = groups[k]
  })
  // Include any unexpected keys (except Colorless) afterward
  keys
    .filter((k) => !desired.includes(k) && k.toLowerCase() !== 'colorless')
    .forEach((k) => {
      result[k] = groups[k]
    })
  // Colorless at the end if present
  const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
  if (colorlessKey) result[colorlessKey] = groups[colorlessKey]
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
            const itemsMap = isColorSlot
              ? groupByAugmentType(augmentOptions[slot], header)
              : { [header]: augmentOptions[slot] }
            const filteredOptions = isColorSlot
              ? groupByAugmentType(filteredAugmentOptions[slot], header)
              : { [header]: filteredAugmentOptions[slot] }

            // Order sections so that primary slot color is first, components next, and Colorless last
            const orderedItemsMap = isColorSlot
              ? orderGroups(itemsMap, primary.toLowerCase(), isColorSlot)
              : itemsMap
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
