import { Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setAugmentFilterMode, setAugmentFilters } from '../../redux/slices/viktraniumSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
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
            const itemsMap = { [header]: augmentOptions[slot] }
            const filteredOptions = { [header]: filteredAugmentOptions[slot] }

            return (
              <FilterableDropdown
                key={slot}
                dropdownTriggerPrefix='Aug:'
                title={header}
                items={itemsMap}
                filteredItems={filteredOptions}
                onSelect={(aug: CraftingIngredient) => {
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
  handleSelectAugment: (slot: string, aug: CraftingIngredient) => void
  handleResetAugment: (slot: string) => void
  handleFilterModeChange: (mode: 'OR' | 'AND') => void
  handleFiltersChange: (filters: string[]) => void
}

export default AugmentSlotFilterableDropdown
