import { Badge, Button, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useMemo, useState } from 'react'
import { getGearPlannerMaxFiligreeSlots, normalizeGearPlannerFiligreeName } from '../filigrees.ts'
import type { GearPlannerEffect, GearPlannerFiligree, GearPlannerItem } from '../gearPlanner.types.ts'
import { type GearPlannerSlottedFiligrees, gearPlannerUnlockedFiligreeSlotCount } from '../planner.ts'

interface FiligreeSlotSelectorProps {
  item: GearPlannerItem
  filigrees: readonly GearPlannerFiligree[]
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: import('../planner.ts').GearPlannerUnlockedFiligreeSlots
  onChange: (slotIndex: number, filigree: GearPlannerFiligree | null) => void
  onUnlockedSlotCountChange: (count: number) => void
}

const effectLabel = (effect: GearPlannerEffect): string =>
  `${effect.name}${effect.modifier == null ? '' : ` ${String(effect.modifier)}`}${effect.bonus ? ` (${String(effect.bonus)})` : ''}`

const FiligreeSlotSelector = ({
  item,
  filigrees,
  slottedFiligrees,
  unlockedFiligreeSlots,
  onChange,
  onUnlockedSlotCountChange
}: FiligreeSlotSelectorProps) => {
  const [opened, setOpened] = useState(false)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const maximum = getGearPlannerMaxFiligreeSlots(item)
  const unlocked = gearPlannerUnlockedFiligreeSlotCount(item, unlockedFiligreeSlots)
  const selected = slottedFiligrees[item.id] ?? {}
  const visible = useMemo(
    () =>
      filigrees
        .filter((filigree) => filigree.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
        .toSorted((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)),
    [filigrees, search]
  )
  const selectedInAnotherSlot = (filigree: GearPlannerFiligree): boolean =>
    Object.entries(selected).some(
      ([slotIndex, current]) =>
        Number(slotIndex) !== activeSlotIndex &&
        normalizeGearPlannerFiligreeName(current.name) === normalizeGearPlannerFiligreeName(filigree.name)
    )
  const close = () => {
    setOpened(false)
    setActiveSlotIndex(null)
    setSearch('')
  }

  return (
    <>
      <Button
        aria-label={`Manage filigrees for ${item.source.name}`}
        size='compact-xs'
        variant='light'
        onClick={() => {
          setOpened(true)
        }}
      >
        Filigrees {String(unlocked)}/{String(maximum)}
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        size='lg'
        title={`Filigrees — ${item.source.name}`}
        closeButtonProps={{ 'aria-label': 'Close filigree selector' }}
      >
        <Stack gap='md' data-testid={`filigree-selector-${item.id}`}>
          <Group justify='space-between' gap='xs'>
            <Text size='sm' data-testid={`filigree-slot-count-${item.id}`}>
              {String(unlocked)} / {String(maximum)} slots unlocked
            </Text>
            <Group gap='xs'>
              {unlocked < maximum ? (
                <Button
                  size='compact-xs'
                  onClick={() => {
                    onUnlockedSlotCountChange(unlocked + 1)
                  }}
                >
                  Unlock slot
                </Button>
              ) : null}
              {unlocked > 1 ? (
                <Button
                  color='red'
                  size='compact-xs'
                  variant='light'
                  onClick={() => {
                    onUnlockedSlotCountChange(unlocked - 1)
                    if (activeSlotIndex === unlocked - 1) setActiveSlotIndex(null)
                  }}
                >
                  Remove last slot
                </Button>
              ) : null}
            </Group>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='xs'>
            {Array.from({ length: unlocked }, (_, slotIndex) => {
              const filigree = selected[slotIndex]
              return (
                <Button
                  key={slotIndex}
                  aria-label={`Filigree slot ${String(slotIndex + 1)}`}
                  color={activeSlotIndex === slotIndex ? 'violet' : undefined}
                  h={58}
                  p='xs'
                  variant={filigree ? 'light' : 'default'}
                  onClick={() => {
                    setActiveSlotIndex(slotIndex)
                    setSearch('')
                  }}
                >
                  <Stack gap={0} align='center' w='100%'>
                    <Text lineClamp={2} size='xs' ta='center'>
                      {filigree?.name ?? `Empty slot ${String(slotIndex + 1)}`}
                    </Text>
                    {filigree ? <Badge size='xs'>Filled</Badge> : null}
                  </Stack>
                </Button>
              )
            })}
          </SimpleGrid>
          {activeSlotIndex !== null ? (
            <Stack gap='xs'>
              <Group justify='space-between'>
                <Text fw={600} size='sm'>
                  Select for slot {String(activeSlotIndex + 1)}
                </Text>
                {selected[activeSlotIndex] ? (
                  <Button
                    color='red'
                    size='compact-xs'
                    variant='subtle'
                    onClick={() => {
                      onChange(activeSlotIndex, null)
                    }}
                  >
                    Clear filigree
                  </Button>
                ) : null}
              </Group>
              <TextInput
                aria-label='Search filigrees'
                placeholder='Search filigrees'
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value)
                }}
              />
              <ScrollArea.Autosize mah={320} type='auto'>
                <Stack gap='xs'>
                  {visible.map((filigree) => {
                    const disabled = selectedInAnotherSlot(filigree)
                    return (
                      <Paper key={filigree.id} withBorder p='xs'>
                        <Group justify='space-between' align='flex-start' wrap='nowrap'>
                          <Stack gap={2} miw={0}>
                            <Text fw={600} size='sm'>
                              {filigree.name}
                            </Text>
                            {filigree.source.enchantments?.map((effect, index) => (
                              <Text key={`${effect.name}-${String(index)}`} c='dimmed' size='xs'>
                                {effectLabel(effect)}
                              </Text>
                            ))}
                            {filigree.grouping ? (
                              <Badge size='xs' variant='outline' w='fit-content'>
                                {filigree.grouping}
                              </Badge>
                            ) : null}
                          </Stack>
                          <Button
                            aria-label={`Select ${filigree.name}`}
                            disabled={disabled}
                            size='compact-xs'
                            variant='light'
                            onClick={() => {
                              onChange(activeSlotIndex, filigree)
                              setActiveSlotIndex(null)
                              setSearch('')
                            }}
                          >
                            {disabled ? 'Slotted' : 'Select'}
                          </Button>
                        </Group>
                      </Paper>
                    )
                  })}
                  {visible.length === 0 ? (
                    <Text c='dimmed' size='sm'>
                      No filigrees match.
                    </Text>
                  ) : null}
                </Stack>
              </ScrollArea.Autosize>
            </Stack>
          ) : null}
        </Stack>
      </Modal>
    </>
  )
}

export default FiligreeSlotSelector
