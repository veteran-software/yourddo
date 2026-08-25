import { Badge, Button, Group, Modal, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core'
import { useMemo, useState } from 'react'
import { gearPlannerCurseIdentity } from '../curses.ts'
import { type GearPlannerEffectSource, previewPotentialEffectConflict } from '../effects.ts'
import type { GearPlannerCurse, GearPlannerEffect, GearPlannerItem } from '../gearPlanner.types.ts'

const effectLabel = (effect: GearPlannerEffect): string =>
  `${effect.name}${effect.modifier == null ? '' : ` ${String(effect.modifier)}`}${effect.bonus ? ` (${String(effect.bonus)})` : ''}`

interface CurseSelectorProps {
  item: GearPlannerItem
  curses: readonly GearPlannerCurse[]
  selected: GearPlannerCurse | null
  conflictSources: readonly GearPlannerEffectSource[]
  onChange: (curseId: string | null) => void
}

const CurseSelector = ({ item, curses, selected, conflictSources, onChange }: CurseSelectorProps) => {
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState('')
  const visible = useMemo(
    () =>
      curses
        .filter((curse) => curse.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
        .toSorted((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)),
    [curses, search]
  )
  const close = () => {
    setOpened(false)
    setSearch('')
  }

  return (
    <>
      <Button
        aria-label={`Manage curses for ${item.source.name}`}
        size='compact-xs'
        variant='light'
        onClick={() => {
          setOpened(true)
        }}
      >
        {selected ? 'Deck of Many Curses' : 'Add curse'}
      </Button>
      {selected ? (
        <Stack gap={2} pl='xs' data-testid={`selected-curse-${item.id}`}>
          <Group gap='xs'>
            <Text fw={600} size='xs'>
              {selected.name}
            </Text>
            <Badge size='xs' variant='light'>
              {selected.type}
            </Badge>
          </Group>
          {selected.enchantments.map((effect, index) => (
            <Text key={`${effect.name}-${String(index)}`} size='xs'>
              {effectLabel(effect)}
            </Text>
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
            Clear curse
          </Button>
        </Stack>
      ) : null}
      <Modal
        opened={opened}
        onClose={close}
        size='lg'
        title={`Deck of Many Curses — ${item.source.name}`}
        closeButtonProps={{ 'aria-label': 'Close curse selector' }}
      >
        <Stack gap='sm' data-testid={`curse-selector-${item.id}`}>
          {selected ? (
            <Group justify='space-between' gap='xs'>
              <Text size='sm'>
                Current: {selected.name} ({selected.type})
              </Text>
              <Button
                color='red'
                size='compact-xs'
                variant='subtle'
                onClick={() => {
                  onChange(null)
                  close()
                }}
              >
                Clear curse
              </Button>
            </Group>
          ) : (
            <Text c='dimmed' size='sm'>
              No curse selected.
            </Text>
          )}
          <TextInput
            aria-label='Search curses'
            placeholder='Search curses'
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value)
            }}
          />
          <ScrollArea.Autosize mah={360} type='auto'>
            <Stack gap='xs'>
              {visible.map((curse) => {
                const previews = curse.enchantments.map((effect) =>
                  previewPotentialEffectConflict(effect, conflictSources, item.id)
                )
                const conflicting = previews.some(({ isConflict, isRedundant }) => isConflict && isRedundant)
                const upgrade = previews.some(({ isConflict, isUpgrade }) => isConflict && isUpgrade)
                const overpowered = previews.some(({ isConflict, isOverpowered }) => isConflict && isOverpowered)
                const isSelected =
                  selected !== null && gearPlannerCurseIdentity(selected) === gearPlannerCurseIdentity(curse)
                return (
                  <Paper key={curse.id} withBorder p='xs'>
                    <Group justify='space-between' align='flex-start' wrap='nowrap'>
                      <Stack gap={2} miw={0}>
                        <Group gap='xs'>
                          <Text fw={600} size='sm'>
                            {curse.name}
                          </Text>
                          <Badge size='xs' variant='light'>
                            {curse.type}
                          </Badge>
                          {conflicting ? (
                            <Badge color='yellow' size='xs'>
                              Conflicting
                            </Badge>
                          ) : null}
                          {upgrade ? (
                            <Badge color='blue' size='xs'>
                              Upgrade
                            </Badge>
                          ) : null}
                          {overpowered ? (
                            <Badge color='red' size='xs'>
                              Overpowered
                            </Badge>
                          ) : null}
                        </Group>
                        {curse.enchantments.map((effect, index) => (
                          <Text key={`${effect.name}-${String(index)}`} c='dimmed' size='xs'>
                            {effectLabel(effect)}
                          </Text>
                        ))}
                      </Stack>
                      <Button
                        aria-label={`Select ${curse.name}`}
                        size='compact-xs'
                        variant='light'
                        onClick={() => {
                          onChange(gearPlannerCurseIdentity(curse))
                          close()
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </Group>
                  </Paper>
                )
              })}
              {visible.length === 0 ? (
                <Text c='dimmed' size='sm'>
                  No curses match.
                </Text>
              ) : null}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Modal>
    </>
  )
}

export default CurseSelector
