import CatalogSearch from './CatalogSearch'
import { Button, Checkbox, Group, Select, Stack, Text } from '@mantine/core'
import { useMemo, useState } from 'react'
import { IconArrowUpRight } from '@tabler/icons-react'
import classes from '../../../shared/layout/PlannerWorkspace.module.css'
import { filigreeSetNames, type GearPlannerSelectedFiligree } from '../filigrees'
import type { GearPlannerData } from '../gearPlanner.types'
import { formatGearPlannerSetEffect } from '../sets'
import { ownsTroveItem } from '../trove'
import { useTroveInventory } from '../troveContext'
import { TroveOwnership, OwnedFilter } from './TroveInventory'

interface FiligreeSetBrowserProps {
  data: GearPlannerData
  equipped: readonly GearPlannerSelectedFiligree[]
  openSlot: (host: GearPlannerSelectedFiligree) => void
  initialSet?: string
  initialQuery: string
}

export default function FiligreeSetBrowser({
  data,
  equipped,
  openSlot,
  initialSet,
  initialQuery
}: FiligreeSetBrowserProps) {
  const [setName, setSetName] = useState<string | null>(initialSet ?? null)
  const [query, setQuery] = useState(initialQuery)
  const [equippedOnly, setEquippedOnly] = useState(false)
  const [limit, setLimit] = useState(50)
  const { inventory, ownedOnly } = useTroveInventory()
  const hostsById = useMemo(() => Map.groupBy(equipped, ({ filigree }) => filigree.id), [equipped])
  const members = useMemo(
    () =>
      data.filigrees
        .map((filigree) => {
          const sets = filigreeSetNames(filigree)
          const effects = filigree.source.enchantments?.map(formatGearPlannerSetEffect) ?? []
          return { filigree, sets, effects, searchText: [filigree.name, ...sets, ...effects].join(' ').toLowerCase() }
        })
        .sort(
          (a, b) =>
            Number(hostsById.has(b.filigree.id)) - Number(hostsById.has(a.filigree.id)) ||
            a.filigree.name.localeCompare(b.filigree.name)
        ),
    [data, hostsById]
  )
  const setOptions = useMemo(
    () => [...new Set([...data.filigreeSetDefinitionByName.keys(), ...members.flatMap((m) => m.sets)])].sort(),
    [members, data]
  )
  const search = query.trim().toLowerCase()
  const visible = members.filter(
    ({ filigree, sets, searchText }) =>
      (!setName || sets.includes(setName)) &&
      searchText.includes(search) &&
      (!equippedOnly || hostsById.has(filigree.id)) &&
      (!ownedOnly || ownsTroveItem(inventory, filigree.name, true))
  )
  return (
    <Stack gap='sm'>
      <CatalogSearch
        label='Search filigrees'
        placeholder='Name, effect or set'
        value={query}
        onChange={(value) => {
          setQuery(value)
          setLimit(50)
        }}
      />
      <Select
        searchable
        clearable
        label='Filigree set'
        placeholder='All sets'
        data={setOptions}
        value={setName}
        onChange={(value) => {
          setSetName(value)
          setLimit(50)
        }}
      />
      <Group gap='md'>
        <Checkbox
          size='xs'
          label='Equipped only'
          checked={equippedOnly}
          onChange={(e) => {
            setEquippedOnly(e.currentTarget.checked)
            setLimit(50)
          }}
        />
        <OwnedFilter />
      </Group>
      {setName &&
        data.filigreeSetDefinitionByName.get(setName)?.thresholds.map((t) => (
          <Text key={t.threshold} size='sm'>
            <b>{t.threshold}-piece</b> · {t.effects.map(formatGearPlannerSetEffect).join(', ')}
          </Text>
        ))}
      <Text c='dimmed' size='sm' aria-live='polite'>
        {visible.length === 0
          ? 'No matching filigrees'
          : visible.length === 1
            ? '1 matching filigree'
            : `${String(visible.length)} matching filigrees`}
      </Text>
      <ul className={classes.results}>
        {visible.slice(0, limit).map(({ filigree, effects, sets }) => (
          <li key={filigree.id} className={classes.result}>
            <Stack gap={4} p='sm'>
              <Text fw={600} size='sm'>
                {filigree.name}
              </Text>
              {sets.length > 0 && (
                <Text size='xs' c='dimmed'>
                  {sets.join(' · ')}
                </Text>
              )}
              {effects.length > 0 && <Text size='sm'>{effects.join(' · ')}</Text>}
              <TroveOwnership name={filigree.name} filigree />
              {hostsById.has(filigree.id) && (
                <Text size='xs' fw={600}>
                  Equipped on
                </Text>
              )}
              {hostsById.get(filigree.id)?.map((host) => (
                <Button
                  key={host.item.id + ':' + String(host.slotIndex)}
                  variant='light'
                  size='compact-sm'
                  w='fit-content'
                  maw='100%'
                  h='auto'
                  py={4}
                  styles={{ label: { whiteSpace: 'normal', textAlign: 'start' } }}
                  rightSection={<IconArrowUpRight size={14} aria-hidden />}
                  onClick={() => {
                    openSlot(host)
                  }}
                >
                  {host.item.source.name} · {host.item.slot} · Slot {host.slotIndex + 1}
                </Button>
              ))}
            </Stack>
          </li>
        ))}
      </ul>
      {limit < visible.length && (
        <Button
          variant='subtle'
          onClick={() => {
            setLimit((count) => count + 50)
          }}
        >
          Show more filigrees
        </Button>
      )}
    </Stack>
  )
}
