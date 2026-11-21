import { useMemo, useState } from 'react'
import { Anchor, Autocomplete, Badge, Checkbox, Group, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { IconMapPin, IconBackpack, IconCheck, IconHelpCircle } from '@tabler/icons-react'
import { useLocalStorage } from '@mantine/hooks'
import { farmingList, type FarmStatus } from '../farming'
import type { GearPlannerSetup } from '../setups'
import { troveCharacterNames } from '../trove'
import { useTroveInventory } from '../troveContext'
import css from './FarmingTool.module.css'

const sections = [
  { status: 'Farm', title: 'To farm', icon: IconMapPin },
  { status: 'Collect', title: 'To collect', icon: IconBackpack },
  { status: 'Check', title: 'Verify ownership', icon: IconHelpCircle },
  { status: 'Owned', title: 'In Trove', icon: IconCheck }
] as const
export default function FarmingTool({ setup }: { setup: GearPlannerSetup }) {
  const { inventory } = useTroveInventory()
  const [character, setCharacter] = useLocalStorage({ key: 'yourddo:farming-character:' + setup.id, defaultValue: '' })
  const [checked, setChecked] = useLocalStorage<string[]>({
    key: 'yourddo:farming-progress:' + setup.id,
    defaultValue: []
  })
  const [view, setView] = useState<'To do' | 'All items'>('To do')
  const names = useMemo(() => troveCharacterNames(inventory), [inventory])
  const tasks = useMemo(() => farmingList(setup, inventory, character), [setup, inventory, character])
  const taskKey = (t: (typeof tasks)[number]) =>
    JSON.stringify([character.trim().toLowerCase(), t.name, t.status, t.group, t.quantity, t.uses])
  const done = (t: (typeof tasks)[number]) => t.status === 'Owned' || checked.includes(taskKey(t))
  const total = (status: FarmStatus) =>
    tasks.filter((t) => t.status === status && !done(t)).reduce((n, t) => n + t.quantity, 0)
  const pending = tasks.filter((t) => !done(t)).length
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
      {!tasks.length ? (
        <Text size='sm' c='dimmed'>
          Equip gear in this setup to start its farming list.
        </Text>
      ) : (
        <>
          <Autocomplete
            label='Trove character'
            placeholder='Any character'
            data={names}
            value={character}
            onChange={setCharacter}
            clearable
            size='xs'
          />
          {!inventory.size && (
            <Text size='xs' c='dimmed'>
              Import Trove from the planner toolbar to check these items against your inventory.
            </Text>
          )}
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
                      <h5>
                        {status === 'Farm' && rows[0].sources[0]?.href ? (
                          <Anchor size='sm' href={rows[0].sources[0].href} target='_blank' rel='noreferrer'>
                            {group}
                          </Anchor>
                        ) : (
                          group
                        )}
                      </h5>
                      <ul>
                        {rows.map((t) => (
                          <li key={taskKey(t)}>
                            {status !== 'Owned' && (
                              <Checkbox
                                size='xs'
                                aria-label={'Mark ' + t.name + ' complete in ' + group}
                                checked={done(t)}
                                onChange={(e) => {
                                  const complete = e.currentTarget.checked
                                  const key = taskKey(t)
                                  setChecked((values) =>
                                    complete ? [...new Set([...values, key])] : values.filter((v) => v !== key)
                                  )
                                }}
                              />
                            )}
                            <div>
                              <strong>{t.name}</strong>
                              {t.quantity > 1 && <b> ×{t.quantity}</b>}
                              <small>{[...new Set(t.uses)].join(' · ')}</small>
                              {status === 'Farm' && t.sources[0]?.detail && <small>{t.sources[0].detail}</small>}
                              {t.notes.map((note) => (
                                <small key={note}>{note}</small>
                              ))}
                              {status === 'Farm' && t.sources.length > 1 && (
                                <details>
                                  <summary>Other sources ({t.sources.length - 1})</summary>
                                  {t.sources.slice(1).map((s) => (
                                    <small key={JSON.stringify(s)}>
                                      {[s.title, s.detail].filter(Boolean).join(' · ')}
                                    </small>
                                  ))}
                                </details>
                              )}
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
      )}
    </Stack>
  )
}
