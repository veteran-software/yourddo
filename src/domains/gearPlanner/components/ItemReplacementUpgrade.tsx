import { useState } from 'react'
import { Button, Group, Modal, ScrollArea, Select, Stack, Table, Text } from '@mantine/core'
import { IconArrowUpRight } from '@tabler/icons-react'
import KnownDiscrepancies from './KnownDiscrepancies'
import { aggregateEffectSummary, collectEquippedEffects } from '../effects'
import type { GearPlannerData, GearPlannerItem } from '../gearPlanner.types'
import { comparisonRows, statValue } from '../loadoutComparison'
import {
  createEmptyGearPlannerEquipment,
  equipGearPlannerItemInSelection,
  type GearPlannerSelectionState
} from '../planner'

function itemStats(item: GearPlannerItem, setup: GearPlannerSelectionState, data: GearPlannerData) {
  const equipment = createEmptyGearPlannerEquipment()
  equipment[item.slot] = item
  const effects = collectEquippedEffects(
    equipment,
    setup.slottedAugments,
    setup.slottedFiligrees,
    setup.slottedCurses,
    {
      reforging: setup.reforging,
      reforgingData: data.reforging
    }
  ).filter(({ effect }) => effect.name !== 'Dampened' && effect.name !== 'Suppressed Power')
  const stats = new Map(aggregateEffectSummary(effects).map((effect) => [effect.name, statValue(effect)]))
  const base = item.source.baseStats
  const weapon = base && typeof base === 'object' && 'weapon' in base ? base.weapon : null
  const rating = weapon && typeof weapon === 'object' && 'baseDamageRating' in weapon ? weapon.baseDamageRating : null
  if (typeof rating === 'number') stats.set('Base Damage Rating', { text: String(rating), amount: rating, unit: '' })
  return stats
}

export default function ItemReplacementUpgrade({
  item,
  setup,
  data,
  onReplace
}: Readonly<{
  item: GearPlannerItem
  setup: GearPlannerSelectionState
  data: GearPlannerData
  onReplace: (item: GearPlannerItem) => void
}>) {
  const [opened, setOpened] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const suppressed = data.suppressedPowerUpgrades?.get(item.id)
  const dampened = data.dampenedUpgrades?.get(item.id)
  const options = suppressed ?? (dampened ? [dampened] : [])
  const upgrade = options.length > 1 ? options.find(({ id }) => id === selectedId) : options[0]
  const system = suppressed ? 'Suppressed Power' : 'Dampened'
  if (!options.length) return null
  const close = () => {
    setOpened(false)
  }
  const next = opened && upgrade ? equipGearPlannerItemInSelection(setup, item.slot, upgrade) : setup
  const changes =
    upgrade && next !== setup
      ? comparisonRows(itemStats(item, setup, data), itemStats(upgrade, next, data)).filter(({ changed }) => changed)
      : []
  const levelChanged = upgrade && item.minimumLevel !== upgrade.minimumLevel
  return (
    <>
      <Button
        size='xs'
        variant='light'
        leftSection={<IconArrowUpRight size={15} />}
        onClick={() => {
          setOpened(true)
        }}
      >
        View {system} upgrade
      </Button>
      <Modal opened={opened} onClose={close} title={`Confirm ${system} upgrade`} centered size='42rem'>
        <Stack gap='md'>
          {options.length > 1 && (
            <Select
              label='Current item variant'
              placeholder='Choose a variant'
              data={options.map(({ id, source }) => ({ value: id, label: source.name }))}
              value={selectedId}
              onChange={setSelectedId}
            />
          )}
          {upgrade && (
            <>
              <Text size='sm'>
                Replace <strong>{item.source.name}</strong> with <strong>{upgrade.source.name}</strong> in {item.slot}?
              </Text>
              <KnownDiscrepancies notes={upgrade.source.discrepancyNotes} />
            </>
          )}
          {changes.length || levelChanged ? (
            <ScrollArea.Autosize mah='min(50dvh, 23rem)' type='auto' offsetScrollbars>
              <Table
                verticalSpacing='xs'
                horizontalSpacing='xs'
                aria-label={`${system} upgrade comparison`}
                stickyHeader
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope='col'>Stat or effect</Table.Th>
                    <Table.Th scope='col'>Current</Table.Th>
                    <Table.Th scope='col'>Upgraded</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {levelChanged && (
                    <Table.Tr>
                      <Table.Th scope='row'>Minimum level</Table.Th>
                      <Table.Td>{item.minimumLevel}</Table.Td>
                      <Table.Td>{upgrade?.minimumLevel}</Table.Td>
                    </Table.Tr>
                  )}
                  {changes.map(({ label, before, after, delta, direction }) => (
                    <Table.Tr key={label}>
                      <Table.Th scope='row'>{label}</Table.Th>
                      <Table.Td>{before}</Table.Td>
                      <Table.Td>
                        {after}
                        <Text
                          size='xs'
                          fw={600}
                          c={direction === 'gain' ? 'teal' : direction === 'loss' ? 'red' : 'dimmed'}
                        >
                          {delta}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>
          ) : upgrade ? (
            <Text size='sm' c='dimmed'>
              {next === setup ? 'This upgrade cannot be equipped in the current setup.' : 'No stat changes are listed.'}
            </Text>
          ) : null}
          <Group justify='flex-end' gap='xs'>
            <Button data-autofocus variant='default' onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={next === setup}
              onClick={() => {
                if (!upgrade) return
                close()
                onReplace(upgrade)
              }}
            >
              Replace item
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
