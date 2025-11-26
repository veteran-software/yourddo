import { Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setAugmentFilterMode, setAugmentFilters } from '../../redux/slices/viktraniumSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import FilterableDropdown from './FilterableDropdown.tsx'

const AugmentSlotFilterableDropdown = (props: Props) => {
  const {
    augmentFilterMode,
    augmentFilters,
    augmentOptions,
    availableAugmentSlots,
    filteredAugmentOptions,
    handleResetAugment,
    handleSelectAugment,
    selectedAugments
  } = props

  const dispatch: AppDispatch = useAppDispatch()

  const resolveAugmentLabel = (slot: string, header: string): string =>
    selectedAugments[slot]?.name ?? `Select ${header}...`

  return (
    <>
      {availableAugmentSlots.length > 0 ? (
        <Stack gap={3}>
          {availableAugmentSlots.map((slot) => {
            const clean: string = slot
              .replace(/^isleOfDread/, '')
              .replace(/([A-Z])/g, ' $1')
              .trim()
            const parts: string[] = clean.split(' ')
            const primary: string = titleCase(parts[0] || '')
            const colorSlots = new Set<string>([
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

            const isColorSlot: boolean = colorSlots.has(clean.toLowerCase())
            let header: string

            if (slot.includes('isleOfDread')) {
              const secondary: string = titleCase(parts.slice(1).join(' '))
              const secondarySlot = secondary ? ` (${secondary})` : ''
              header = isColorSlot ? `${primary} Augment` : `Isle of Dread: ${primary} Slot${secondarySlot}`
            } else {
              header = isColorSlot
                ? `${primary} Augment`
                : `${titleCase(parts[0] || '')}: ${titleCase(parts.slice(1)[0])} (${titleCase(parts.slice(1)[1])})`
            }
            // Group color slots by augment color to organize alphabetically by color
            const groupByAugmentType = (list: Ingredient[] | undefined): Record<string, Ingredient[]> => {
              if (!list || list.length === 0) {
                return {}
              }

              return list.reduce<Record<string, Ingredient[]>>((m, ing: Ingredient) => {
                const key: string = ing.augmentType ?? header
                if (!m[key].length) {
                  m[key] = []
                }

                m[key].push(ing)

                return m
              }, {})
            }

            const itemsMap = isColorSlot ? groupByAugmentType(augmentOptions[slot]) : { [header]: augmentOptions[slot] }
            const filteredOptions = isColorSlot
              ? groupByAugmentType(filteredAugmentOptions[slot])
              : { [header]: filteredAugmentOptions[slot] }

            // Order sections so that:
            // - The primary slot color is first
            // - The component colors follow (e.g., Green -> Blue then Yellow)
            // - Colorless is always last
            const orderGroups = (
              groups: Record<string, Ingredient[]>,
              slotPrimaryLower: string
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
              if (!isColorSlot) {
                // Non-color slots: just move Colorless to end if present, preserve the other order
                const withoutColorless = keys.filter((k) => k.toLowerCase() !== 'colorless')
                const result: Record<string, Ingredient[]> = {}

                withoutColorless.forEach((k) => {
                  result[k] = groups[k]
                })

                if (keys.some((k) => k.toLowerCase() === 'colorless')) {
                  const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless') ?? ''
                  result[colorlessKey] = groups[colorlessKey]
                }

                return result
              }

              const desired = desiredOrderBySlot[slotPrimaryLower]
              if (desired.length > 0) {
                // Unknown color (e.g., Sun/Moon): keep as-is but ensure Colorless at the end
                const withoutColorless = keys.filter((k) => k.toLowerCase() !== 'colorless')
                const result: Record<string, Ingredient[]> = {}

                withoutColorless.forEach((k) => {
                  result[k] = groups[k]
                })

                if (keys.some((k) => k.toLowerCase() === 'colorless')) {
                  const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless') ?? ''
                  result[colorlessKey] = groups[colorlessKey]
                }
                return result
              }

              const result: Record<string, Ingredient[]> = {}
              desired.forEach((k) => {
                if (groups[k].length) result[k] = groups[k]
              })
              // Include any unexpected keys (just in case) before Colorless if they aren't Colorless
              keys
                .filter((k) => !desired.includes(k) && k.toLowerCase() !== 'colorless')
                .forEach((k) => {
                  result[k] = groups[k]
                })

              // Ensure Colorless at the end if present and not already placed
              const colorlessKey = keys.find((k) => k.toLowerCase() === 'colorless')
              if (colorlessKey && result[colorlessKey].length) {
                result[colorlessKey] = groups[colorlessKey]
              }
              return result
            }

            const orderedItemsMap = isColorSlot ? orderGroups(itemsMap, primary.toLowerCase()) : itemsMap
            const orderedFilteredOptions = isColorSlot
              ? orderGroups(filteredOptions, primary.toLowerCase())
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
                label={resolveAugmentLabel(slot, header)}
                canFilter
                displayEffectsAdded
                onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setAugmentFilterMode(mode))}
                onFiltersChange={(filters: string[]) => dispatch(setAugmentFilters(filters))}
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
