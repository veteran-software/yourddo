import { Badge, Button, Group, Select, Stack, Switch, Text } from '@mantine/core'
import { useMemo, useState } from 'react'
import { getCompatibleAugmentTypes, normaliseAugmentSlotType } from '../../../shared/augments/compatibility.ts'
import {
  gearPlannerAugmentIdentity,
  getCompatibleGearPlannerAugments,
  isCompatibleGearPlannerAugment
} from '../augments.ts'
import type { GearPlannerAugment, GearPlannerAugmentSlot, GearPlannerItem } from '../gearPlanner.types.ts'

const effectLabel = ({ name, modifier, bonus }: GearPlannerAugment['effectsAdded'][number]): string =>
  `${name}${modifier == null ? '' : ` ${String(modifier)}`}${bonus == null || bonus === '' ? '' : ` (${String(bonus)})`}`

interface AugmentSlotSelectorProps {
  item: GearPlannerItem
  slotIndex: number
  augmentSlot: GearPlannerAugmentSlot
  augments: readonly GearPlannerAugment[]
  selected: GearPlannerAugment | null
  onChange: (augment: GearPlannerAugment | null) => void
}

const AugmentSlotSelector = ({
  item,
  slotIndex,
  augmentSlot,
  augments,
  selected,
  onChange
}: AugmentSlotSelectorProps) => {
  const [showAll, setShowAll] = useState(false)
  const compatible = useMemo(() => getCompatibleGearPlannerAugments(augmentSlot, augments), [augmentSlot, augments])
  const selectedId = selected ? gearPlannerAugmentIdentity(selected) : null
  const visible = useMemo(
    () =>
      compatible.filter(
        (augment) =>
          showAll || augment.minLevel <= item.minimumLevel || gearPlannerAugmentIdentity(augment) === selectedId
      ),
    [compatible, item.minimumLevel, selectedId, showAll]
  )
  const optionsById = useMemo(
    () => new Map(visible.map((augment) => [gearPlannerAugmentIdentity(augment), augment])),
    [visible]
  )
  const selectData = useMemo(
    () =>
      getCompatibleAugmentTypes(augmentSlot.augmentType).flatMap((augmentType) => {
        const options = visible
          .filter((augment) => normaliseAugmentSlotType(augment.augmentType) === normaliseAugmentSlotType(augmentType))
          .map((augment) => ({ value: gearPlannerAugmentIdentity(augment), label: augment.name }))
        return options.length > 0 ? [{ group: `${augmentType} augments`, items: options }] : []
      }),
    [augmentSlot.augmentType, visible]
  )
  const selectedOverLevel = selected !== null && selected.minLevel > item.minimumLevel
  const label = augmentSlot.name ?? augmentSlot.augmentType

  return (
    <Stack gap={4} data-testid={`augment-slot-${item.id}-${String(slotIndex)}`}>
      <Select
        size={'xs'}
        p={0}
        label={label}
        description={`Augment slot ${String(slotIndex + 1)} · ${augmentSlot.augmentType}`}
        placeholder='Select augment'
        data={selectData}
        value={selectedId}
        searchable
        maxDropdownHeight={300}
        nothingFoundMessage='No compatible augments found.'
        onChange={(value) => {
          if (value === null) {
            onChange(null)
            return
          }
          const augment = optionsById.get(value)
          if (augment && isCompatibleGearPlannerAugment(augmentSlot, augment)) onChange(augment)
        }}
        renderOption={({ option }) => {
          const augment = optionsById.get(option.value)
          if (!augment) return option.label
          return (
            <Stack gap={2} w='100%'>
              <Group justify='space-between' wrap='nowrap'>
                <Text size='sm' style={{ overflowWrap: 'anywhere' }}>
                  {augment.name}
                </Text>
                <Badge component='span' color='gray' size='sm' variant='light'>
                  ML {String(augment.minLevel)}
                </Badge>
              </Group>
              <Text c='dimmed' size='xs'>
                {augment.augmentType}
                {augment.effectsAdded[0] ? ` · ${effectLabel(augment.effectsAdded[0])}` : ''}
              </Text>
              {augment.setBonus?.length ? (
                <Text c='dimmed' size='xs'>
                  Sets: {augment.setBonus.map(({ name }) => name).join(', ')}
                </Text>
              ) : null}
            </Stack>
          )
        }}
      />
      <Switch
        checked={showAll}
        label='Show all levels'
        size='xs'
        onChange={(event) => {
          setShowAll(event.currentTarget.checked)
        }}
      />
      {selected ? (
        <Stack gap={2} pl='xs'>
          <Group gap='xs'>
            <Text fw={600} size='xs'>
              {selected.name}
            </Text>
            <Badge size='xs' variant='light'>
              {selected.augmentType}
            </Badge>
            {selectedOverLevel ? (
              <Badge color='red' size='xs'>
                Over item ML
              </Badge>
            ) : null}
          </Group>
          {selected.effectsAdded.map((effect, effectIndex) => (
            <Text key={`${effect.name}-${String(effectIndex)}`} size='xs'>
              {effectLabel(effect)}
            </Text>
          ))}
          {selected.setBonus?.map(({ name }) => (
            <Badge key={name} size='xs' variant='outline' w='fit-content'>
              {name}
            </Badge>
          ))}
          <Button
            color='red'
            size='compact-xs'
            variant='subtle'
            w='fit-content'
            onClick={() => {
              onChange(null)
            }}
          >
            Clear augment
          </Button>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default AugmentSlotSelector
