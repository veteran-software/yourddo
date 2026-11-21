import { useTroveInventory } from '../troveContext'
import { TroveOwnership, OwnedFilter } from './TroveInventory'
import { ownsTroveItem } from '../trove'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useId, useMemo, useState } from 'react'
import { getGearPlannerMaxFiligreeSlots, sameFiligreeType } from '../filigrees.ts'
import type { GearPlannerEffect, GearPlannerFiligree, GearPlannerItem } from '../gearPlanner.types.ts'
import { type GearPlannerSlottedFiligrees, gearPlannerUnlockedFiligreeSlotCount } from '../planner.ts'

interface FiligreeSlotSelectorProps {
  initialSlotIndex?: number
  onClose?: () => void
  item: GearPlannerItem
  filigrees: readonly GearPlannerFiligree[]
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: import('../planner.ts').GearPlannerUnlockedFiligreeSlots
  onChange: (slotIndex: number, filigree: GearPlannerFiligree | null) => void
  onUnlockedSlotCountChange: (count: number) => void
}

const effectLabel = (effect: GearPlannerEffect): string =>
  `${effect.name}${effect.modifier == null ? '' : ' ' + String(effect.modifier)}${effect.bonus ? ' (' + String(effect.bonus) + ')' : ''}`

const FiligreeSlotSelector = ({
  initialSlotIndex,
  onClose,
  item,
  filigrees,
  slottedFiligrees,
  unlockedFiligreeSlots,
  onChange,
  onUnlockedSlotCountChange
}: FiligreeSlotSelectorProps) => {
  const { inventory, ownedOnly } = useTroveInventory()
  const [opened, setOpened] = useState(initialSlotIndex !== undefined)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(initialSlotIndex ?? null)
  const [search, setSearch] = useState('')
  const maximum = getGearPlannerMaxFiligreeSlots(item)
  const unlocked = gearPlannerUnlockedFiligreeSlotCount(item, unlockedFiligreeSlots)
  const selected = slottedFiligrees[item.id] ?? {}
  const filled = Object.keys(selected).length
  const countLabel = `${String(filled)} filled · ${String(unlocked)}/${String(maximum)} unlocked`
  const selectorId = useId()
  const visible = useMemo(
    () =>
      filigrees
        .filter(
          (filigree) =>
            filigree.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) &&
            (!ownedOnly || ownsTroveItem(inventory, filigree.name, true))
        )
        .toSorted((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)),
    [filigrees, search, inventory, ownedOnly]
  )
  const selectedInAnotherSlot = (filigree: GearPlannerFiligree): boolean =>
    Object.entries(selected).some(
      ([slotIndex, current]) => Number(slotIndex) !== activeSlotIndex && sameFiligreeType(current, filigree)
    )
  const close = () => {
    onClose?.()
    setOpened(false)
    setActiveSlotIndex(null)
    setSearch('')
  }

  return (
    <>
      <Button
        aria-label={`Manage filigrees for ${item.source.name}`}
        aria-describedby={selectorId}
        size='compact-xs'
        variant='light'
        onClick={() => {
          setOpened(true)
        }}
      >
        Filigrees · <span id={selectorId}>{countLabel}</span>
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
                  disabled={Boolean(selected[unlocked - 1])}
                  title={selected[unlocked - 1] ? 'Remove the filigree before removing this slot' : undefined}
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
              const slotId = selectorId + '-slot-' + String(slotIndex)
              const removeLabel = filigree ? `Remove ${filigree.name} from slot ${String(slotIndex + 1)}` : ''
              return (
                <Box key={slotIndex} pos='relative'>
                  <Button
                    id={slotId}
                    fullWidth
                    pr={filigree ? '1.8rem' : undefined}
                    aria-pressed={activeSlotIndex === slotIndex}
                    data-autofocus={initialSlotIndex === slotIndex || undefined}
                    aria-label={`Filigree slot ${String(slotIndex + 1)}`}
                    color={activeSlotIndex === slotIndex ? 'violet' : undefined}
                    h={58}
                    py='xs'
                    pl='xs'
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
                  {filigree && (
                    <ActionIcon
                      size='sm'
                      variant='subtle'
                      color='red'
                      pos='absolute'
                      top={2}
                      right={2}
                      aria-label={removeLabel}
                      title={removeLabel}
                      onClick={() => {
                        document.getElementById(slotId)?.focus()
                        onChange(slotIndex, null)
                      }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )}
                </Box>
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
              <OwnedFilter />
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
                    const slotAction = selected[activeSlotIndex] ? 'Clear slot first' : 'Select'
                    return (
                      <Paper key={filigree.id} withBorder p='xs'>
                        <Group justify='space-between' align='flex-start' wrap='nowrap'>
                          <Stack gap={2} miw={0}>
                            <Text fw={600} size='sm'>
                              {filigree.name}
                            </Text>
                            <TroveOwnership name={filigree.name} filigree />
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
                            disabled={disabled || Boolean(selected[activeSlotIndex])}
                            size='compact-xs'
                            variant='light'
                            onClick={() => {
                              onChange(activeSlotIndex, filigree)
                              setActiveSlotIndex(null)
                              setSearch('')
                            }}
                          >
                            {disabled ? 'Type already slotted' : slotAction}
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
