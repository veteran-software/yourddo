import { useMemo, useState } from 'react'
import { Anchor, Autocomplete, Badge, Checkbox, Group, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { IconListCheck, IconBackpack, IconCheck, IconHelpCircle } from '@tabler/icons-react'
import { useLocalStorage } from '@mantine/hooks'
import type { EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import type { GearPlannerReforgingData } from '../reforging'
import type { TroveInventory } from '../trove'
import CraftingChecklist from './CraftingChecklist'
import { farmingList, type FarmStatus } from '../farming'
import type { GearPlannerSetup } from '../setups'
import { troveCharacterNames } from '../trove'
import { useTroveInventory } from '../troveContext'
import css from './FarmingTool.module.css'

const sections = [
  { status: 'Farm', title: 'To farm', icon: IconListCheck },
  { status: 'Collect', title: 'To collect', icon: IconBackpack },
  { status: 'Check', title: 'Verify ownership', icon: IconHelpCircle },
  { status: 'Owned', title: 'In Trove', icon: IconCheck }
] as const
function withoutFarmLocation(key: string): string {
  try {
    const value: unknown = JSON.parse(key)
    // Older saved checkmarks included the item's drop location as the group.
    if (Array.isArray(value) && value.length === 6 && value[2] === 'Farm') {
      value[3] = ''
      return JSON.stringify(value)
    }
  } catch {
    return key
  }
  return key
}

export default function FarmingTool({
  setup,
  essence,
  reforging
}: Readonly<{ setup: GearPlannerSetup; essence: EssenceCraftingData; reforging: GearPlannerReforgingData }>) {
  const { inventory, importedAt } = useTroveInventory()
  const [character, setCharacter] = useLocalStorage({ key: 'yourddo:farming-character:' + setup.id, defaultValue: '' })
  const [mode, setMode] = useState<'gear' | 'crafting'>('gear')
  const names = useMemo(() => troveCharacterNames(inventory), [inventory])
  return (
    <Stack p='md' gap='md' className={css.tool}>
      <div className={css.heading}>
        <Text size='xs' c='dimmed'>
          Active setup
        </Text>
        <Title order={3} size='h4'>
          {setup.name}
        </Title>
      </div>
      <SegmentedControl
        size='xs'
        fullWidth
        aria-label='Farming list category'
        data={[
          { value: 'gear', label: 'Gear' },
          { value: 'crafting', label: 'Crafting' }
        ]}
        value={mode}
        onChange={setMode}
      />
      <Autocomplete
        label='Trove character'
        placeholder='Any character'
        data={names}
        value={character}
        onChange={setCharacter}
        clearable
        size='xs'
      />
      {!inventory.size && !importedAt && (
        <Text size='xs' c='dimmed'>
          Import Trove from the planner toolbar to check your inventory.
        </Text>
      )}
      {mode === 'crafting' ? (
        <CraftingChecklist
          setup={setup}
          essence={essence}
          reforging={reforging}
          inventory={inventory}
          character={character}
          importedAt={importedAt}
        />
      ) : (
        <GearFarmingList setup={setup} inventory={inventory} character={character} />
      )}
    </Stack>
  )
}

function GearFarmingList({
  setup,
  inventory,
  character
}: Readonly<{ setup: GearPlannerSetup; inventory: TroveInventory; character: string }>) {
  const [checked, setChecked] = useLocalStorage<string[]>({
    key: 'yourddo:farming-progress:' + setup.id,
    defaultValue: []
  })
  const [view, setView] = useState<'To do' | 'All items'>('To do')
  const tasks = useMemo(() => farmingList(setup, inventory, character), [setup, inventory, character])
  const completed = useMemo(() => new Set(checked.map(withoutFarmLocation)), [checked])
  const taskKey = (t: (typeof tasks)[number]) =>
    JSON.stringify([character.trim().toLowerCase(), t.name, t.status, t.group, t.quantity, t.uses])
  function markTask(key: string, complete: boolean) {
    setChecked((values) =>
      complete
        ? [...new Set([...values.map(withoutFarmLocation), key])]
        : values.filter((value) => withoutFarmLocation(value) !== key)
    )
  }
  const done = (t: (typeof tasks)[number]) => t.status === 'Owned' || completed.has(taskKey(t))
  const total = (status: FarmStatus) =>
    tasks.filter((t) => t.status === status && !done(t)).reduce((n, t) => n + t.quantity, 0)
  const pending = tasks.filter((t) => !done(t)).length
  if (!tasks.length) {
    return (
      <Text size='sm' c='dimmed'>
        Equip gear in this setup to start its farming list.
      </Text>
    )
  }
  return (
    <>
      <Group gap='xs'>
        <Badge variant='light' color='yellow'>
          {total('Farm')} to farm
        </Badge>
        <Badge variant='light' color='teal'>
          {total('Collect')} to collect
        </Badge>
      </Group>
      <SegmentedControl
        size='xs'
        fullWidth
        aria-label='Farming list view'
        data={['To do', 'All items']}
        value={view}
        onChange={(v) => {
          setView(v)
        }}
      />
      {view === 'To do' && !pending && <Text size='sm'>Everything in this setup is accounted for.</Text>}
      {sections.map(({ status, title, icon: Icon }) => {
        const visible = tasks.filter((t) => t.status === status && (view === 'All items' || !done(t)))
        if (!visible.length) return null
        const groups = Map.groupBy(visible, (t) => t.group)
        return (
          <section key={status} aria-label={title}>
            <h4 className={css.section}>
              <Icon size={16} />
              {status === 'Owned' && character.trim() ? 'On this character' : title}
            </h4>
            {[...groups]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, rows]) => (
                <div className={css.group} key={group}>
                  {group && <h5>{group}</h5>}
                  <ul>
                    {rows.map((t) => (
                      <li key={taskKey(t)}>
                        {status !== 'Owned' && (
                          <Checkbox
                            size='xs'
                            aria-label={'Mark ' + t.name + ' complete' + (group ? ' in ' + group : '')}
                            checked={done(t)}
                            onChange={(e) => {
                              markTask(taskKey(t), e.currentTarget.checked)
                            }}
                          />
                        )}
                        <div>
                          {status === 'Farm' ? (
                            <Anchor
                              href={'https://ddocompendium.com/w/' + encodeURIComponent(t.name)}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {t.name}
                            </Anchor>
                          ) : (
                            <strong>{t.name}</strong>
                          )}
                          {t.quantity > 1 && <b> ×{t.quantity}</b>}
                          <small>{[...new Set(t.uses)].join(' · ')}</small>
                          {t.notes.map((note) => (
                            <small key={note}>{note}</small>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </section>
        )
      })}
    </>
  )
}
