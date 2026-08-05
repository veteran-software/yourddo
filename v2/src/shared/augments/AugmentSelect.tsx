import { Badge, Group, Select, Text } from '@mantine/core'
import { useMemo } from 'react'
import { getCompatibleAugmentTypes } from './compatibility.ts'

export interface AugmentSelectOption {
  value?: string
  label?: string
  name?: string
  augmentType: string
  minimumLevel?: string | number
  minLevel?: string | number
}

interface AugmentSelectProps<T extends AugmentSelectOption> {
  label: string
  slotType: string
  options: readonly T[]
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder?: string
  nothingFoundMessage?: string
}

const minimumLevel = (augment: AugmentSelectOption): string => {
  const value = augment.minimumLevel ?? augment.minLevel
  return value === undefined || value === '' ? 'unknown' : String(value)
}

const optionValue = (augment: AugmentSelectOption): string => augment.value ?? augment.name ?? ''
const optionLabel = (augment: AugmentSelectOption): string => augment.label ?? augment.name ?? augment.value ?? ''

const AugmentSelect = <T extends AugmentSelectOption>({
  label,
  slotType,
  options,
  value,
  onChange,
  placeholder,
  nothingFoundMessage = 'No compatible augments found.'
}: AugmentSelectProps<T>) => {
  const compatibleTypes = useMemo(() => getCompatibleAugmentTypes(slotType), [slotType])
  const compatibleOptions = useMemo(
    () => options.filter((augment) => compatibleTypes.includes(augment.augmentType)),
    [compatibleTypes, options]
  )
  const optionsByValue = useMemo(
    () => new Map(compatibleOptions.map((augment) => [optionValue(augment), augment])),
    [compatibleOptions]
  )
  const selectData = useMemo(
    () =>
      compatibleTypes.flatMap((augmentType) => {
        const items = compatibleOptions
          .filter((augment) => augment.augmentType === augmentType)
          .map((augment) => ({ value: optionValue(augment), label: optionLabel(augment) }))
        return items.length > 0 ? [{ group: `${augmentType} Augments`, items }] : []
      }),
    [compatibleOptions, compatibleTypes]
  )

  return (
    <Select
      label={label}
      placeholder={placeholder ?? `Search ${label} options…`}
      data={selectData}
      value={value ?? null}
      onChange={onChange}
      searchable
      clearable
      maxDropdownHeight={300}
      nothingFoundMessage={nothingFoundMessage}
      renderOption={({ option }) => {
        const augment = optionsByValue.get(option.value)
        const level = augment ? minimumLevel(augment) : 'unknown'
        return (
          <Group justify='space-between' wrap='nowrap' w='100%'>
            <Text size='sm' style={{ overflowWrap: 'anywhere' }}>
              {option.label}
            </Text>
            <Badge component='span' variant='light' color='gray' size='sm' aria-label={`Minimum level ${level}`}>
              ML {level}
            </Badge>
          </Group>
        )
      }}
    />
  )
}

export default AugmentSelect
