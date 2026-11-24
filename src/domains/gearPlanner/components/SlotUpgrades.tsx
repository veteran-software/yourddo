import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Group, Loader, Modal, Paper, Select, Stack, Text, Title } from '@mantine/core'
import type { EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import { slotOwner } from '../character'
import type { GearPlannerData, GearPlannerItem, GearPlannerSlot } from '../gearPlanner.types'
import { equipGearPlannerItemInSelection } from '../planner'
import type { GearPlannerSetup } from '../setups'
import { findSlotReplacements, shortlistReplacements, type SlotReplacement } from '../slotUpgrades'
import ChangeSummary from './ChangeSummary'
import LoadoutComparison from './LoadoutComparison'
import { TroveOwnership } from './TroveInventory'

const describe = (row: SlotReplacement['gains'][number]) =>
  row.delta === 'Changed' ? row.label + ' ' + row.before + ' → ' + row.after : row.label + ' ' + row.delta

export default function SlotUpgrades({
  setup,
  slot,
  data,
  essence,
  onClose,
  onEquip
}: Readonly<{
  setup: GearPlannerSetup
  slot: GearPlannerSlot
  data: GearPlannerData
  essence: EssenceCraftingData
  onClose: () => void
  onEquip: (item: GearPlannerItem) => void
}>) {
  const [results, setResults] = useState<SlotReplacement[] | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  const [preview, setPreview] = useState<GearPlannerSetup | null>(null)
  useEffect(() => {
    const search = findSlotReplacements(setup, slot, data, essence)
    const matches: SlotReplacement[] = []
    function run() {
      const end = performance.now() + 10
      do {
        const step = search.next()
        if (step.done) {
          setResults(matches)
          return
        }
        if (step.value) matches.push(step.value)
      } while (performance.now() < end)
      timer = window.setTimeout(run, 0)
    }
    let timer = window.setTimeout(run, 0)
    return () => {
      window.clearTimeout(timer)
    }
  }, [setup, slot, data, essence])
  const options = useMemo(
    () => [...new Set(results?.flatMap((row) => [...row.improvements.keys()]))].sort((a, b) => a.localeCompare(b)),
    [results]
  )
  const shortlist = useMemo(() => shortlistReplacements(results ?? [], priority), [results, priority])
  if (preview)
    return (
      <LoadoutComparison
        setups={[setup, preview]}
        active={preview}
        initialOwner={slotOwner(slot)}
        data={data}
        essence={essence}
        onClose={() => {
          setPreview(null)
        }}
      />
    )
  return (
    <Modal opened onClose={onClose} size='46rem' title={'Find upgrades · ' + slot} centered>
      <Stack>
        <div>
          <Text size='xs' c='dimmed'>
            Currently equipped
          </Text>
          <Title order={3}>{setup.equipment[slot]?.source.name}</Title>
        </div>
        <Text size='sm' c='dimmed'>
          Each swap compares effective bonuses and active sets across this loadout. Candidates use their current
          configuration.
        </Text>
        {results === null ? (
          <Group role='status'>
            <Loader size='sm' />
            <Text size='sm'>Comparing replacements…</Text>
          </Group>
        ) : (
          <>
            <Select
              searchable
              clearable
              label='Prioritize a stat'
              placeholder='Any improvement'
              data={options}
              value={priority}
              onChange={setPriority}
              disabled={!options.length}
            />
            {shortlist.length === 0 && (
              <Text size='sm'>
                No eligible replacement improves a tracked bonus or preserves a contribution from this slot within the
                setup’s level range.
              </Text>
            )}
            {shortlist.map((row) => {
              const primary = row.gains.find((g) => g.label === priority)
              const gain = [
                ...(primary ? [describe(primary)] : []),
                ...row.gainedSets.map((s) => 'Activates ' + s),
                ...row.gains.filter((g) => g !== primary).map(describe)
              ]
              const cost = [
                ...row.displaced.map((n) => 'Unequips ' + n),
                ...row.lostSets.map((s) => 'Drops ' + s),
                ...row.losses.map(describe)
              ]
              return (
                <Paper key={row.item.id} withBorder p='md' radius='md'>
                  <Stack gap='xs'>
                    <Group justify='space-between'>
                      <Badge
                        color={
                          row.group === 'Straight upgrade'
                            ? 'teal'
                            : row.group === 'Closest replacement'
                              ? 'blue'
                              : 'orange'
                        }
                        variant='light'
                      >
                        {row.group}
                      </Badge>
                      <Text size='xs' c='dimmed'>
                        ML {row.item.minimumLevel}
                      </Text>
                    </Group>
                    <Text fw={700}>{row.item.source.name}</Text>
                    <TroveOwnership name={row.item.source.name} />
                    {gain.length > 0 && (
                      <Text component='div' size='sm'>
                        <ChangeSummary entries={gain} label='Gains' />
                      </Text>
                    )}
                    {row.comparable && row.group === 'Closest replacement' && (
                      <Text size='xs' c='dimmed'>
                        Retains {Math.round(row.retention * 100)}% of this slot’s tracked stat contribution on average.
                      </Text>
                    )}
                    {cost.length > 0 && (
                      <Text component='div' size='sm' c='orange'>
                        <ChangeSummary entries={cost} label='Trade-offs' />
                      </Text>
                    )}
                    <Group justify='flex-end' gap='xs'>
                      <Button
                        size='compact-sm'
                        variant='subtle'
                        onClick={() => {
                          setPreview({
                            ...setup,
                            ...equipGearPlannerItemInSelection(setup, slot, row.item),
                            id: setup.id + '-preview',
                            name: row.item.source.name
                          })
                        }}
                      >
                        Compare
                      </Button>
                      <Button
                        size='compact-sm'
                        variant='light'
                        onClick={() => {
                          onEquip(row.item)
                        }}
                      >
                        Equip
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )
            })}
          </>
        )}
      </Stack>
    </Modal>
  )
}
