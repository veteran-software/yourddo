import ChangeSummary from '../components/ChangeSummary'
import { keyedEntries } from '../../../shared/ui/keyedEntries'
import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  Select,
  SegmentedControl,
  Stack,
  Text,
  Autocomplete
} from '@mantine/core'
import StatObjectivePicker from './StatObjectivePicker'
import { bonusLabel, skillObjective, spellObjective } from '../statObjectives'
import type { GearPlannerEffectSource } from '../effects'
import { IconRoute } from '@tabler/icons-react'
import type { EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import { ownerSlots, type GearOwner } from '../character'
import LoadoutComparison from '../components/LoadoutComparison'
import type { GearPlannerData } from '../gearPlanner.types'
import type { GearPlannerSetState } from '../sets'
import type { GearPlannerSetup } from '../setups'
import { useStatCatalog } from './useStatCatalog'
import { focusSummary } from '../focusStats'
import { troveCharacterNames } from '../trove'
import { useTroveInventory } from '../troveContext'
import { searchUpgradePaths, type PathRequest, type UpgradePath } from '../upgradePaths'
import css from './UpgradePaths.module.css'

interface Props {
  setup: GearPlannerSetup
  owner: GearOwner
  data: GearPlannerData
  essence: EssenceCraftingData
}
export function UpgradePathsTool({
  setup,
  owner,
  data,
  sets,
  effects,
  onFind,
  initial
}: Omit<Props, 'essence'> & {
  effects: readonly GearPlannerEffectSource[]
  sets: GearPlannerSetState
  onFind: (r: PathRequest) => void
  initial?: PathRequest
}) {
  const [kind, setKind] = useState<PathRequest['kind']>(
    initial?.kind ?? (setup.character.focusStats?.length ? 'Focus stats' : 'Stat')
  )
  const [objective, setObjective] = useState<string | null>(
    initial?.kind === 'Stat' && !data.enchantmentNames?.includes(initial.objective)
      ? (spellObjective(initial.objective)?.name ?? skillObjective(initial.objective))
      : (initial?.objective ?? null)
  )
  const [bonusType, setBonusType] = useState(initial?.bonusType)
  const [locked, setLocked] = useState<string[]>(initial?.locked ?? [])
  const [protectedTiers, setProtectedTiers] = useState<string[]>(initial?.protectedTiers ?? [])
  const [character, setCharacter] = useState(initial?.character ?? '')
  const { inventory } = useTroveInventory()
  const characters = useMemo(() => troveCharacterNames(inventory), [inventory])
  const { stats, equipped } = useStatCatalog(data, owner, effects)
  const active = sets.sets.flatMap((s) =>
    s.thresholds.filter((t) => t.isActive).map((t) => s.name + ' · ' + String(t.threshold) + '-piece')
  )
  const next = sets.sets.flatMap((s) => {
    const tier = s.thresholds.find((t) => !t.isActive)
    return tier ? [s.name + ' · ' + String(tier.threshold) + '-piece'] : []
  })
  const focus = setup.character.focusStats ?? []
  const valid =
    kind === 'Focus stats'
      ? focus.length > 0
      : objective && (kind === 'Stat' ? stats.has(objective) : next.includes(objective))
  return (
    <Stack p='md' gap='md'>
      <div>
        <Text fw={700}>{setup.name}</Text>
        <Text size='xs' c='dimmed'>
          {owner} · Equipment levels {setup.minimumLevel}–{setup.maximumLevel}
        </Text>
      </div>
      <SegmentedControl
        aria-label='Objective type'
        data={focus.length ? ['Focus stats', 'Stat', 'Set tier'] : ['Stat', 'Set tier']}
        value={kind}
        onChange={(v) => {
          setKind(v)
          setObjective(null)
          setBonusType(undefined)
        }}
      />
      {kind === 'Focus stats' ? (
        <Text size='sm'>{focus.join(' › ')}</Text>
      ) : kind === 'Stat' ? (
        <StatObjectivePicker
          verbatim={Boolean(data.enchantmentNames)}
          stats={stats}
          equipped={equipped}
          value={objective}
          bonus={bonusType}
          onSelect={(name, type) => {
            setObjective(name)
            setBonusType(type)
          }}
        />
      ) : (
        <Select
          comboboxProps={{ withinPortal: false }}
          searchable
          label='Complete next set tier'
          placeholder='Choose a tier'
          data={next}
          value={objective}
          onChange={setObjective}
          nothingFoundMessage='No incomplete equipped set tiers'
        />
      )}
      <MultiSelect
        comboboxProps={{ withinPortal: false }}
        searchable
        label='Lock slots'
        placeholder='Any slot may change'
        data={[...ownerSlots[owner]]}
        value={locked}
        onChange={setLocked}
      />
      {active.length > 0 && (
        <MultiSelect
          comboboxProps={{ withinPortal: false }}
          label='Protect active tiers'
          placeholder='Choose tiers to retain'
          data={active}
          value={protectedTiers.filter((t) => active.includes(t))}
          onChange={setProtectedTiers}
        />
      )}
      <Autocomplete
        comboboxProps={{ withinPortal: false }}
        label='Trove character'
        placeholder='Any character'
        value={character}
        data={characters}
        onChange={setCharacter}
      />
      <Button
        leftSection={<IconRoute size={16} />}
        disabled={!valid}
        onClick={() => {
          if (valid)
            onFind({
              kind,
              objective: kind === 'Focus stats' ? 'Focus stats' : (objective ?? ''),
              bonusType,
              locked,
              protectedTiers: protectedTiers.filter((t) => active.includes(t)),
              character
            })
        }}
      >
        Find paths
      </Button>
    </Stack>
  )
}

export function UpgradeResults({
  setup,
  owner,
  data,
  essence,
  request,
  onSave
}: Props & { request: PathRequest; onSave: (setup: GearPlannerSetup) => void }) {
  const { inventory } = useTroveInventory()
  const [checked, setChecked] = useState(0)
  const [paths, setPaths] = useState<UpgradePath[] | null>(null)
  const [owned, setOwned] = useState(false)
  const [limit, setLimit] = useState(12)
  const [preview, setPreview] = useState<GearPlannerSetup | null>(null)
  useEffect(() => {
    const iterator = searchUpgradePaths(setup, owner, data, essence, request, inventory)
    let timer = window.setTimeout(run, 0)
    let count = 0,
      lastUpdate = 0
    function run() {
      const end = performance.now() + 10
      do {
        const step = iterator.next()
        count++
        if (step.done) {
          setPaths(step.value)
          return
        }
      } while (performance.now() < end)
      if (performance.now() - lastUpdate > 200) {
        setChecked(count)
        lastUpdate = performance.now()
      }
      timer = window.setTimeout(run, 0)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [setup, owner, data, essence, request, inventory])
  const visible = paths?.filter((p) => !owned || p.availability === 'Owned' || p.availability === 'Collect')
  const countLabel = visible?.length === 1 ? ' path' : ' paths'
  return (
    <Stack p='md' gap='sm'>
      <div>
        <Text size='xs' c='dimmed'>
          {owner} · {setup.name}
        </Text>
        <Text fw={700} size='lg'>
          {request.objective}
          {request.bonusType && ' · ' + bonusLabel(request.bonusType)}
        </Text>
        <Text size='sm' c='dimmed'>
          Single equipment changes and compatible open sockets
          {request.locked.length ? ' · Locked: ' + request.locked.join(', ') : ''}
          {request.protectedTiers.length ? ' · Protected: ' + request.protectedTiers.join(', ') : ''}
        </Text>
      </div>
      <Group justify='space-between'>
        <Text role='status' size='sm'>
          {visible ? String(visible.length) + countLabel : 'Checking loadout changes… ' + checked.toLocaleString()}
        </Text>
        {inventory.size > 0 && (
          <Checkbox
            label='Owned or collectible'
            checked={owned}
            onChange={(e) => {
              setOwned(e.currentTarget.checked)
            }}
          />
        )}
      </Group>
      {visible?.length === 0 && (
        <Text size='sm'>
          {owned
            ? 'No matching path is accounted for in Trove.'
            : 'No single equipment change or open socket meets this objective with the selected protections.'}
        </Text>
      )}
      {keyedEntries(visible?.slice(0, limit) ?? [], (path) => JSON.stringify([path.slot, path.name, path.change])).map(
        ({ value: path, key }) => {
          const copy = { ...path.setup, id: 'preview:' + setup.id, name: setup.name + ' · ' + path.name }
          return (
            <article className={css.path} key={key}>
              <div className={css.gain}>
                {path.delta}
                {path.totals && (
                  <Text size='xs' c='dimmed'>
                    {path.totals}
                  </Text>
                )}
              </div>
              <div className={css.details}>
                <Text fw={700}>{path.name}</Text>
                <Text size='sm'>
                  {path.slot} · {path.change}
                </Text>
                {path.focus.some((entry) => entry.delta) && <Text size='sm'>{focusSummary(path.focus)}</Text>}
                {path.bonusChanges.length > 0 && <Text size='xs'>{path.bonusChanges.join(' · ')}</Text>}
                <Group gap='xs'>
                  <Badge
                    variant='light'
                    color={path.availability === 'Owned' || path.availability === 'Collect' ? 'teal' : 'gray'}
                  >
                    {path.availability}
                  </Badge>
                  <Text size='xs' c='dimmed'>
                    {path.location}
                  </Text>
                </Group>
                {path.losses.length > 0 && (
                  <Text component='div' size='xs' c='orange'>
                    Trade-offs · <ChangeSummary entries={path.losses} label='Trade-offs' />
                  </Text>
                )}
              </div>
              <Group gap='xs'>
                <Button
                  size='compact-sm'
                  variant='subtle'
                  onClick={() => {
                    setPreview(copy)
                  }}
                >
                  Preview
                </Button>
                <Button
                  size='compact-sm'
                  variant='light'
                  onClick={() => {
                    onSave(copy)
                  }}
                >
                  Save as setup
                </Button>
              </Group>
            </article>
          )
        }
      )}
      {visible && visible.length > limit && (
        <Button
          variant='subtle'
          onClick={() => {
            setLimit(limit + 12)
          }}
        >
          Show more paths
        </Button>
      )}
      {preview && (
        <LoadoutComparison
          setups={[setup, preview]}
          active={preview}
          initialOwner={owner}
          data={data}
          essence={essence}
          onClose={() => {
            setPreview(null)
          }}
        />
      )}
    </Stack>
  )
}
