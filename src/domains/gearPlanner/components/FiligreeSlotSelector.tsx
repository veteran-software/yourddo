import { useTroveInventory } from '../troveContext'
import { TroveOwnership, OwnedFilter } from './TroveInventory'
import { ownsTroveItem } from '../trove'
import { Button, Modal, NativeSelect, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useId, useMemo, useState } from 'react'
import { keyedEntries } from '../../../shared/ui/keyedEntries.ts'
import { getGearPlannerMaxFiligreeSlots, sameFiligreeType } from '../filigrees.ts'
import type { GearPlannerEffect, GearPlannerFiligree, GearPlannerItem } from '../gearPlanner.types.ts'
import {
  type GearPlannerSlottedFiligrees,
  type GearPlannerUnlockedFiligreeSlots,
  gearPlannerUnlockedFiligreeSlotCount
} from '../planner.ts'
import classes from './FiligreeSlotSelector.module.css'

interface FiligreeSlotSelectorProps {
  initialSlotIndex?: number
  onClose?: () => void
  item: GearPlannerItem
  filigrees: readonly GearPlannerFiligree[]
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: GearPlannerUnlockedFiligreeSlots
  onChange: (slotIndex: number, filigree: GearPlannerFiligree | null) => void
  onUnlockedSlotCountChange: (count: number) => void
}

const effectLabel = (effect: GearPlannerEffect): string =>
  `${effect.name}${effect.modifier == null ? '' : ' ' + String(effect.modifier)}${effect.bonus ? ' (' + String(effect.bonus) + ')' : ''}`

function FiligreeDetails({ filigree }: Readonly<{ filigree: GearPlannerFiligree }>) {
  const set = filigree.grouping
  return (
    <Stack gap={3} className={classes.description}>
      <Text size='sm' fw={600}>
        {filigree.name}
      </Text>
      {keyedEntries(filigree.source.enchantments ?? []).map(({ key, value }) => (
        <Text key={key} size='xs' c='dimmed'>
          {effectLabel(value)}
        </Text>
      ))}
      {set && !filigree.name.startsWith(set + ':') && (
        <Text size='xs' c='dimmed'>
          {set}
        </Text>
      )}
      <TroveOwnership name={filigree.name} filigree />
    </Stack>
  )
}

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
  const [targetSlot, setTargetSlot] = useState(initialSlotIndex)
  const [search, setSearch] = useState('')
  const maximum = getGearPlannerMaxFiligreeSlots(item)
  const unlocked = gearPlannerUnlockedFiligreeSlotCount(item, unlockedFiligreeSlots)
  const selected = slottedFiligrees[item.id]
  const occupied = Object.entries(selected ?? {})
  const minimum = Math.max(1, ...occupied.map(([index]) => Number(index) + 1))
  const slots = Array.from({ length: unlocked }, (_, index) => index)
  const firstEmpty = slots.find((index) => !selected?.[index])
  const activeSlot = targetSlot !== undefined && targetSlot < unlocked ? targetSlot : (firstEmpty ?? 0)
  const activeFiligree = selected?.[activeSlot]
  const countLabel = `${String(occupied.length)} filled · ${String(unlocked)}/${String(maximum)} unlocked`
  const selectorId = useId()
  const slotId = (index: number) => `${selectorId}-slot-${String(index)}`

  const catalog = useMemo(
    () => filigrees.toSorted((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)),
    [filigrees]
  )
  const query = search.trim().toLocaleLowerCase()
  const visible =
    opened && !activeFiligree
      ? catalog.filter(
          ({ name }) => name.toLocaleLowerCase().includes(query) && (!ownedOnly || ownsTroveItem(inventory, name, true))
        )
      : []

  function activate(index: number) {
    setTargetSlot(index)
    setSearch('')
  }

  function apply(filigree: GearPlannerFiligree | null) {
    const next = filigree
      ? (slots.find((index) => index !== activeSlot && !selected?.[index]) ?? activeSlot)
      : activeSlot
    document.getElementById(slotId(next))?.focus()
    onChange(activeSlot, filigree)
    activate(next)
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
        onClose={() => {
          onClose?.()
          setOpened(false)
          setTargetSlot(undefined)
          setSearch('')
        }}
        size='56rem'
        title={`Filigrees — ${item.source.name}`}
        closeButtonProps={{ 'aria-label': 'Close filigree selector' }}
      >
        <div className={classes.layout} data-testid={`filigree-selector-${item.id}`}>
          <section aria-label='Filigree slots' className={classes.slots}>
            <div className={classes.slotHeader}>
              <div>
                <Text component='h2' size='sm' fw={600} m={0}>
                  Slots
                </Text>
                <Text size='xs' c='dimmed'>
                  {String(occupied.length)} of {String(unlocked)} filled
                </Text>
              </div>
              {maximum > 1 && (
                <NativeSelect
                  label='Unlocked slots'
                  size='xs'
                  value={String(unlocked)}
                  data={Array.from({ length: maximum }, (_, index) => ({
                    value: String(index + 1),
                    label: `${String(index + 1)} of ${String(maximum)}`,
                    disabled: index + 1 < minimum
                  }))}
                  onChange={(event) => {
                    const count = Number(event.currentTarget.value)
                    onUnlockedSlotCountChange(count)
                    activate(count > unlocked ? unlocked : Math.min(activeSlot, count - 1))
                  }}
                />
              )}
            </div>
            <ol className={classes.slotList}>
              {slots.map((index) => {
                const filigree = selected?.[index]
                const firstEffect = filigree?.source.enchantments?.[0]
                return (
                  <li key={index}>
                    <UnstyledButton
                      className={classes.slot}
                      id={slotId(index)}
                      aria-label={`Filigree slot ${String(index + 1)}`}
                      aria-describedby={slotId(index) + '-name'}
                      aria-pressed={activeSlot === index}
                      data-autofocus={activeSlot === index || undefined}
                      onClick={() => {
                        if (activeSlot !== index) activate(index)
                      }}
                    >
                      <span className={classes.slotNumber} aria-hidden>
                        {String(index + 1)}
                      </span>
                      <span className={classes.slotCopy}>
                        <Text
                          component='span'
                          id={slotId(index) + '-name'}
                          size='sm'
                          fw={filigree ? 600 : 400}
                          c={filigree ? undefined : 'dimmed'}
                        >
                          {filigree?.name ?? 'Empty slot'}
                        </Text>
                        {firstEffect && (
                          <Text component='span' size='xs' c='dimmed'>
                            {effectLabel(firstEffect)}
                          </Text>
                        )}
                      </span>
                    </UnstyledButton>
                  </li>
                )
              })}
            </ol>
          </section>

          <section aria-labelledby={selectorId + '-selection'} className={classes.catalog}>
            <Stack gap='sm'>
              <Text component='h2' id={selectorId + '-selection'} size='sm' fw={600} m={0}>
                {activeFiligree ? 'Slot ' : 'Select for slot '}
                {String(activeSlot + 1)}
              </Text>
              {activeFiligree ? (
                <Stack gap='md' align='flex-start'>
                  <FiligreeDetails filigree={activeFiligree} />
                  <Button
                    size='xs'
                    variant='subtle'
                    color='red'
                    onClick={() => {
                      apply(null)
                    }}
                  >
                    Clear filigree
                  </Button>
                </Stack>
              ) : (
                <>
                  <TextInput
                    aria-label='Search filigrees'
                    placeholder='Search by filigree name'
                    leftSection={<IconSearch size={16} aria-hidden />}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value)
                    }}
                  />
                  <OwnedFilter />
                  <ScrollArea.Autosize mah='min(50dvh, 29rem)' type='auto' offsetScrollbars>
                    <ul className={classes.results}>
                      {visible.map((filigree) => {
                        const used = occupied.find(([, current]) => sameFiligreeType(current, filigree))
                        const occupiedSlot = used ? String(Number(used[0]) + 1) : undefined
                        return (
                          <li key={filigree.id} className={classes.result}>
                            <FiligreeDetails filigree={filigree} />
                            <Button
                              aria-label={
                                occupiedSlot ? `${filigree.name} is in slot ${occupiedSlot}` : `Select ${filigree.name}`
                              }
                              disabled={!!used}
                              size='compact-sm'
                              variant='light'
                              onClick={() => {
                                apply(filigree)
                              }}
                            >
                              {occupiedSlot ? `In slot ${occupiedSlot}` : 'Select'}
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                    {visible.length === 0 && (
                      <Text c='dimmed' size='sm' py='sm'>
                        No filigrees match.
                      </Text>
                    )}
                  </ScrollArea.Autosize>
                </>
              )}
            </Stack>
          </section>
        </div>
      </Modal>
    </>
  )
}

export default FiligreeSlotSelector
